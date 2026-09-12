import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FLOW_HOME = path.resolve(__dirname, '..', '..');

const configPath = path.join(FLOW_HOME, 'config', 'flow.config.json');
let config;

try {
  const raw = fs.readFileSync(configPath, 'utf-8');
  config = JSON.parse(raw);
} catch (err) {
  console.error(`[CONFIG] Failed to load config from ${configPath}: ${err.message}`);
  config = {};
}

export default config;

export function get(key, fallback = undefined) {
  return config[key] !== undefined ? config[key] : fallback;
}

export function getFlowHome() {
  const customHome = config.flowHome;
  if (customHome) {
    return path.isAbsolute(customHome) ? customHome : path.resolve(FLOW_HOME, customHome);
  }
  return FLOW_HOME;
}

export function getChromePath() {
  const configured = get('chromePath');
  if (configured && fs.existsSync(configured)) {
    return configured;
  }

  if (process.platform === 'win32') {
    const candidates = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      path.join(process.env.LOCALAPPDATA || '', 'Google', 'Chrome', 'Application', 'chrome.exe'),
      path.join(process.env.PROGRAMFILES || '', 'Google', 'Chrome', 'Application', 'chrome.exe'),
      path.join(process.env['PROGRAMFILES(X86)'] || '', 'Google', 'Chrome', 'Application', 'chrome.exe'),
    ];
    for (const c of candidates) {
      if (c && fs.existsSync(c)) return c;
    }
  } else if (process.platform === 'darwin') {
    const macPath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    if (fs.existsSync(macPath)) return macPath;
  } else {
    const linuxCandidates = [
      '/opt/google/chrome/chrome',
      '/usr/bin/google-chrome',
      '/usr/bin/google-chrome-stable',
      '/usr/bin/chromium-browser',
      '/usr/bin/chromium',
    ];
    for (const c of linuxCandidates) {
      if (fs.existsSync(c)) return c;
    }
  }

  return process.platform === 'win32'
    ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    : '/opt/google/chrome/chrome';
}

export function getChromeUserDataDir() {
  const configured = get('chromeUserDataDir');
  if (configured) return path.resolve(configured);

  if (process.platform === 'win32') {
    return path.join(process.env.LOCALAPPDATA || '', 'Google', 'Chrome', 'User Data');
  } else if (process.platform === 'darwin') {
    return path.join(process.env.HOME || '', 'Library', 'Application Support', 'Google', 'Chrome');
  } else {
    return path.join(process.env.HOME || '', '.config', 'google-chrome');
  }
}
