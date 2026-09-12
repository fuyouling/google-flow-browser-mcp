import fs from 'fs';
import path from 'path';

const dir = 'C:/Users/zgh/.gemini/antigravity-ide/mcp/google-flow-browser';

const listSchema = {
  name: 'flow_list_projects',
  description: 'List all Google Flow projects from both local registry and live homepage, with auto-synchronization.',
  parameters: {
    type: 'object',
    properties: {
      refresh: {
        type: 'boolean',
        description: 'Whether to scan live homepage for updated projects.',
        default: true
      }
    }
  }
};

const openSchema = {
  name: 'flow_open_project',
  description: 'Open a specific Google Flow project by name, ID, or URL.',
  parameters: {
    type: 'object',
    properties: {
      project_name: {
        type: 'string',
        description: 'Name of the project to open (e.g. "the-secret-garden").'
      },
      project_id: {
        type: 'string',
        description: 'Optional project ID or UUID.'
      },
      url: {
        type: 'string',
        description: 'Optional direct project URL.'
      }
    }
  }
};

if (fs.existsSync(dir)) {
  fs.writeFileSync(path.join(dir, 'flow_list_projects.json'), JSON.stringify(listSchema));
  fs.writeFileSync(path.join(dir, 'flow_open_project.json'), JSON.stringify(openSchema));
  console.log('Schemas written successfully to', dir);
} else {
  console.log('Directory does not exist:', dir);
}
