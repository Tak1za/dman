const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  getTempDir: () => ipcRenderer.invoke("get-temp-dir"),
  writeToFile: (path: string, tabId: string, content: string) =>
    ipcRenderer.invoke("write-to-file", path, tabId, content),
  readFile: (path: string) => ipcRenderer.invoke("read-file", path),
  unlinkSync: (path: string) => ipcRenderer.invoke("unlink-sync", path),
  getServersPath: () => ipcRenderer.invoke("get-servers-path"),
});
