// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  detail: async () => await ipcRenderer.invoke('detail'),
  save: async (data) => await ipcRenderer.invoke('save', data),
  toggleDisplay: async (taskId) => await ipcRenderer.invoke('toggleDisplay', taskId), 
  addHTML: (additional) => ipcRenderer.on('addHTML',additional),
  /*TODO
  edit function*/
  updated: async (number) => await ipcRenderer.invoke("update", number),
  updatedbtn: async (stextarea) => await ipcRenderer.invoke("updatedbtn", stextarea),
  /*TODO
  delete function*/
  deleted: async (task_id) => await ipcRenderer.invoke("deleted", task_id),
  displayTasks: async () => await ipcRenderer.invoke('displayTasks'),
  restoreOriginalWallpaper: async () => await ipcRenderer.invoke('restoreOriginalWallpaper')

})
