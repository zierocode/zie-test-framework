#!/usr/bin/env node

import { Command } from 'commander';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

const program = new Command();

program
  .name('ztf-agent')
  .description('ZTF Agent - Local test execution client')
  .version('0.1.0');

program
  .option('-s, --server <url>', 'WebSocket server URL', 'ws://localhost:3000')
  .option('-a, --agent-id <id>', 'Agent ID', 'auto')
  .option('-d, --debug', 'Enable debug mode', false)
  .action((options) => {
    console.log('Starting ZTF Agent...');
    console.log('Server:', options.server);
    console.log('Agent ID:', options.agentId);
    console.log('Debug:', options.debug);
  });

program.parse();
