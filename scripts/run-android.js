#!/usr/bin/env node

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

// Get command from arguments
const command = process.argv[2];
const args = process.argv.slice(3);

if (!command) {
  console.error('Usage: node scripts/run-android.js <command> [args...]');
  process.exit(1);
}

// Expand ~ in ANDROID_HOME if present
let androidHome = process.env.ANDROID_HOME;
if (androidHome && androidHome.startsWith('~')) {
  androidHome = path.join(os.homedir(), androidHome.slice(1));
}

// Set up environment
const env = {
  ...process.env,
  ANDROID_HOME: androidHome,
  ANDROID_SDK_ROOT: androidHome,
};

// Add platform-tools and local node_modules/.bin to PATH
if (androidHome) {
  const platformTools = path.join(androidHome, 'platform-tools');
  const localBin = path.join(__dirname, '..', 'node_modules', '.bin');
  env.PATH = `${localBin}${path.delimiter}${platformTools}${path.delimiter}${env.PATH}`;
  
  // Create local.properties for gradle
  const fs = require('fs');
  const localPropertiesPath = path.join(__dirname, '..', 'native', 'android', 'local.properties');
  const localPropertiesContent = `sdk.dir=${androidHome}\n`;
  fs.writeFileSync(localPropertiesPath, localPropertiesContent);
} else {
  const localBin = path.join(__dirname, '..', 'node_modules', '.bin');
  env.PATH = `${localBin}${path.delimiter}${env.PATH}`;
}

// Spawn the command
const spawnOptions = {
  env,
  stdio: 'inherit',
  shell: true,
  cwd: (command === 'react-native start' || command.startsWith('react-native run-')) ? path.resolve(__dirname, '../native') : process.cwd(),
};

const child = spawn(command, args, spawnOptions);

child.on('exit', (code) => {
  process.exit(code || 0);
});
