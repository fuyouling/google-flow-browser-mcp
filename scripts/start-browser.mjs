import { spawn } from 'child_process';
import fs from 'fs';
import { get, getChromePath, getChromeUserDataDir } from '../src/utils/config.js';

const cdpPort = get('cdpPort', 9222);
const chromePath = getChromePath();
const userDataDir = getChromeUserDataDir();

function log(msg) {
  console.log(`[${new Date().toISOString()}] INFO  ${msg}`);
}

function warn(msg) {
  console.warn(`[${new Date().toISOString()}] WARN  ${msg}`);
}

function error(msg) {
  console.error(`[${new Date().toISOString()}] ERROR ${msg}`);
}

async function checkCdpReady(port) {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/json/version`);
    return res.ok;
  } catch {
    return false;
  }
}

async function main() {
  log(`Checking Chrome on CDP port ${cdpPort}...`);

  if (await checkCdpReady(cdpPort)) {
    log(`Chrome is already running on CDP port ${cdpPort}`);
    process.exit(0);
  }

  if (!fs.existsSync(chromePath)) {
    error(`Chrome executable not found at: ${chromePath}`);
    error(`Please check 'chromePath' in config/flow.config.json`);
    process.exit(1);
  }

  log(`Launching Chrome on CDP port ${cdpPort}`);
  log(`Chrome path: ${chromePath}`);
  log(`User data dir: ${userDataDir}`);

  const args = [
    `--user-data-dir=${userDataDir}`,
    `--remote-debugging-port=${cdpPort}`,
    '--remote-allow-origins=*',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--disable-sync',
    '--disable-features=ChromeWhatsNewUI,DevToolsRemoteDebuggingAllowNotice',
    '--disable-background-networking',
    '--disable-component-update',
    '--disable-sync-preferences',
  ];

  const flowUrl = get('flowUrl', 'https://labs.google/fx/zh/tools/flow');
  if (flowUrl) args.push(flowUrl);

  const proc = spawn(chromePath, args, {
    detached: true,
    stdio: 'ignore',
  });
  proc.unref();

  log(`Chrome process spawned (PID: ${proc.pid}). Waiting for CDP port to be ready...`);

  for (let i = 1; i <= 15; i++) {
    await new Promise(r => setTimeout(r, 1000));
    if (await checkCdpReady(cdpPort)) {
      log(`Chrome CDP ready on port ${cdpPort}`);
      process.exit(0);
    }
  }

  error(`Chrome did not respond on CDP port ${cdpPort} within 15 seconds.`);
  process.exit(1);
}

main().catch(err => {
  error(`Startup failed: ${err.message}`);
  process.exit(1);
});
