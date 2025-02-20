import { app, BrowserWindow } from "electron";
import * as path from "path";
function createWindow() {
    var win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
    if (process.env.NODE_ENV === "development") {
        win.loadURL("http://localhost:5173");
        win.webContents.openDevTools();
    }
    else {
        win.loadFile(path.join(__dirname, "../dist/index.html"));
    }
}
app.whenReady().then(function () {
    createWindow();
    app.on("activate", function () {
        if (BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
app.on("window-all-closed", function () {
    if (process.platform !== "darwin")
        app.quit();
});
//# sourceMappingURL=main.js.map