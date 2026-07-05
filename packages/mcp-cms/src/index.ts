import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerContentTools } from './tools/content';
import { registerMediaTools } from './tools/media';
import { registerSeoTools } from './tools/seo';
import { registerFormsTools } from './tools/forms';
import { registerDesignTools } from './tools/design';
import { registerNavigationTools } from './tools/navigation';

const server = new McpServer({
  name: 'vylux-cms',
  version: '0.1.0',
});

// Register all tool groups
registerContentTools(server);
registerMediaTools(server);
registerSeoTools(server);
registerFormsTools(server);
registerDesignTools(server);
registerNavigationTools(server);

// Start the server
const transport = new StdioServerTransport();
await server.connect(transport);
