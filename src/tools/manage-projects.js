import { logger } from '../utils/logger.js';
import { getPage } from '../browser/connect.js';
import { FlowError, ErrorCodes } from '../utils/errors.js';
import { takeScreenshot } from '../utils/screenshots.js';
import { get } from '../utils/config.js';
import fs from 'fs';
import path from 'path';

const PROJECTS_FILE = path.resolve(get('flowHome', '.'), 'config', 'flow.projects.json');

function loadStoredProjects() {
  try {
    if (fs.existsSync(PROJECTS_FILE)) {
      const data = JSON.parse(fs.readFileSync(PROJECTS_FILE, 'utf-8'));
      return data.projects || [];
    }
  } catch (e) {
    logger.warn('Could not read projects file', { error: e.message });
  }
  return [];
}

function saveStoredProjects(projects) {
  try {
    const dir = path.dirname(PROJECTS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify({ projects }, null, 2));
  } catch (e) {
    logger.warn('Could not save projects file', { error: e.message });
  }
}

async function scanPageProjects(page) {
  return await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a[href*="/project/"]'));
    const seen = new Set();
    const result = [];

    for (const a of links) {
      const href = a.href;
      if (seen.has(href)) continue;
      seen.add(href);

      const match = href.match(/\/project\/([a-zA-Z0-9_-]+)/);
      const uuid = match ? match[1] : '';

      let card = a;
      for (let i = 0; i < 6; i++) {
        if (!card.parentElement || card.parentElement === document.body) break;
        card = card.parentElement;
      }
      
      const lines = (card ? card.innerText || '' : '').split('\n').map(s => s.trim()).filter(Boolean);
      const ignoreWords = ['新建项目', '创建', '打开项目', 'more_vert', 'edit', 'delete', 'close', 'sample', 'Google Flow', 'Flow Music', 'Flow TV', 'tv', 'PRO'];
      const candidateNames = lines.filter(l => !ignoreWords.includes(l) && l.length > 1 && !l.includes('Gemini') && !l.includes('Cinematic'));

      const name = candidateNames[0] || (uuid ? `Project-${uuid.substring(0, 8)}` : 'Unnamed Project');

      result.push({
        id: uuid ? `proj_${uuid.replace(/-/g, '_')}` : `proj_${Date.now()}`,
        uuid,
        name,
        url: href,
        cardText: lines.slice(0, 5).join(' | ')
      });
    }
    return result;
  });
}

export async function handleListProjects(args = {}) {
  const page = getPage();
  const refresh = args?.refresh !== false;
  const stored = loadStoredProjects();

  const currentUrl = page.url();
  const flowUrl = get('flowUrl', 'https://labs.google/fx/zh/tools/flow');

  if (refresh) {
    if (currentUrl.includes('/project/')) {
      logger.info('Navigating to homepage to scan project cards');
      await page.goto(flowUrl, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000);
    }

    const scanned = await scanPageProjects(page);
    logger.info('Scanned projects on page', { count: scanned.length });

    for (const s of scanned) {
      const idx = stored.findIndex(p => p.url === s.url || (s.uuid && p.url?.includes(s.uuid)));
      if (idx >= 0) {
        if (!stored[idx].name || stored[idx].name.startsWith('Project-')) {
          stored[idx].name = s.name;
        }
      } else {
        stored.push({
          id: s.id,
          url: s.url,
          name: s.name,
          campaign: s.name.toLowerCase().replace(/[^a-z0-9_-]/g, '-'),
          created_at: new Date().toISOString(),
          last_used: new Date().toISOString(),
          tasks: []
        });
      }
    }
    saveStoredProjects(stored);
  }

  await takeScreenshot(page, 'projects-list');

  return {
    count: stored.length,
    projects: stored.map(p => ({
      name: p.name,
      id: p.id,
      url: p.url,
      campaign: p.campaign,
      last_used: p.last_used
    }))
  };
}

export async function handleOpenProject(args = {}) {
  const page = getPage();
  const projectName = args?.project_name?.trim() || '';
  const projectId = args?.project_id?.trim() || '';
  const targetUrl = args?.url?.trim() || '';

  if (!projectName && !projectId && !targetUrl) {
    throw new FlowError(ErrorCodes.INVALID_ARGUMENT, 'Please provide project_name, project_id, or url to open.');
  }

  const stored = loadStoredProjects();
  let match = null;

  if (targetUrl) {
    match = { url: targetUrl, name: projectName || 'Target URL Project' };
  } else if (projectId) {
    match = stored.find(p => p.id === projectId || p.url?.includes(projectId));
  } else if (projectName) {
    const lower = projectName.toLowerCase();
    match = stored.find(p => p.name?.toLowerCase() === lower || p.campaign?.toLowerCase() === lower);
    if (!match) {
      match = stored.find(p => p.name?.toLowerCase().includes(lower) || lower.includes(p.name?.toLowerCase()));
    }
  }

  if (!match) {
    logger.info('Project not in local registry, scanning live homepage...', { projectName });
    const flowUrl = get('flowUrl', 'https://labs.google/fx/zh/tools/flow');
    await page.goto(flowUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    const scanned = await scanPageProjects(page);
    const lower = projectName.toLowerCase();
    const liveMatch = scanned.find(s => s.name.toLowerCase().includes(lower) || s.cardText.toLowerCase().includes(lower) || s.url.toLowerCase().includes(lower));

    if (liveMatch) {
      match = {
        id: liveMatch.id,
        name: liveMatch.name,
        url: liveMatch.url,
        campaign: lower
      };
      stored.push({
        ...match,
        created_at: new Date().toISOString(),
        last_used: new Date().toISOString(),
        tasks: []
      });
      saveStoredProjects(stored);
    }
  }

  if (!match) {
    await takeScreenshot(page, 'project-not-found');
    throw new FlowError(
      ErrorCodes.PROJECT_NOT_FOUND,
      `Project "${projectName || projectId}" not found. You can run flow_list_projects to see available projects.`
    );
  }

  if (page.url() === match.url) {
    logger.info('Already on project page', { url: match.url });
    return {
      status: 'success',
      already_open: true,
      project: {
        name: match.name,
        url: match.url,
        id: match.id || ''
      }
    };
  }

  logger.info('Navigating to project', { name: match.name, url: match.url });
  await page.goto(match.url, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  const foundInStore = stored.find(p => p.url === match.url);
  if (foundInStore) {
    foundInStore.last_used = new Date().toISOString();
    saveStoredProjects(stored);
  }

  await takeScreenshot(page, 'project-opened');

  return {
    status: 'success',
    project: {
      name: match.name,
      url: page.url(),
      id: match.id || ''
    }
  };
}
