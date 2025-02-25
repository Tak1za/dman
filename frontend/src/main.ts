import { app, BrowserWindow, ipcMain } from "electron";
import { fileURLToPath } from "url";
import path, { dirname, join } from "path";
import * as fs from "fs";

interface ElectronAPI {
  getTempDir: () => Promise<{ tempDir: string; tabsIndexFile: string }>;
  writeToFile: (path: string, tabId: string, content: string) => string;
  readFile: (path: string) => string;
  unlinkSync: (path: string) => Promise<void>;
  getServersPath: () => string;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function createWindow() {
  console.log("NODE_ENV:", process.env.NODE_ENV);
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (process.env.NODE_ENV === "development") {
    win.loadURL("http://localhost:5173");
    win.webContents.openDevTools();
  } else {
    const filePath = join(__dirname, "../dist/index.html");
    console.log("Loading production file:", filePath); // Debug log
    win.loadFile(filePath);
  }
}

// Define temp directory in app directory
const DATA_DIR = path.join(app.getAppPath(), "data");
const TABS_INDEX_FILE = path.join(DATA_DIR, "dman-tabs.json");

// Ensure temp directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

if (!fs.existsSync(TABS_INDEX_FILE)) {
  fs.writeFileSync(TABS_INDEX_FILE, "", "utf-8");
}

// IPC handler to send temp directory path
ipcMain.handle("get-temp-dir", () => {
  return { tempDir: DATA_DIR, tabsIndexFile: TABS_INDEX_FILE };
});

ipcMain.handle("write-to-file", async (_, ...args) => {
  const filePath = args[0] || path.join(DATA_DIR, `dman-tab-${args[1]}.sql`);
  fs.writeFileSync(filePath, args[2], "utf-8");
  return filePath;
});

ipcMain.handle("read-file", async (_, ...args) => {
  return fs.readFileSync(args[0], "utf-8");
});

ipcMain.handle("unlink-sync", async (_, ...args) => {
  return fs.unlinkSync(args[0]);
});

ipcMain.handle("get-servers-path", async () => {
  return path.join(DATA_DIR, "servers.json");
});

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
