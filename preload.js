// Preload script for Electron
// This runs in the renderer process before web content loads
// Can expose limited Node.js APIs to the renderer

const { contextBridge } = require('electron');

// Expose protected methods that allow the renderer process to use
// specific Electron APIs without exposing the whole Electron object
contextBridge.exposeInMainWorld('electron', {
  platform: process.platform,
  version: process.versions.electron
});
