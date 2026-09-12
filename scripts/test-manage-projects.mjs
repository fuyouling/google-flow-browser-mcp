import { handleListProjects, handleOpenProject } from '../src/tools/manage-projects.js';
import { connectToBrowser } from '../src/browser/connect.js';
import { logger } from '../src/utils/logger.js';

async function main() {
  try {
    console.log('--- Connecting to Chrome CDP ---');
    await connectToBrowser();

    console.log('--- Testing handleListProjects ---');
    const listResult = await handleListProjects({ refresh: false });
    console.log('List result (cached):', JSON.stringify(listResult, null, 2));

    console.log('--- Testing handleOpenProject with the-secret-garden ---');
    const openResult = await handleOpenProject({ project_name: 'the-secret-garden' });
    console.log('Open result:', JSON.stringify(openResult, null, 2));

    console.log('--- All tests passed! ---');
  } catch (err) {
    console.error('Test error:', err);
    process.exit(1);
  }
}

main();
