// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  readActivities: () => ipcRenderer.invoke('read-activities'),
  createActivity: (activity) => ipcRenderer.invoke('create-activity', activity),
  updateActivity: (activity) => ipcRenderer.invoke('update-activity', activity),
  deleteActivity: (id) => ipcRenderer.invoke('delete-activity', id),
});
