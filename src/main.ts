import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import * as ejse from "ejs-electron";

ejse.data("app", { test: "test" });

class Launcher {

  private mainWindow: BrowserWindow;

  constructor() {
    this.mainWindow = null;
  }

  public start() {
    this.createWindow();
  }

  private createWindow() {
    this.mainWindow = new BrowserWindow({
      height: 600,
      width: 800,
      frame: false,
      show: false,
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, "preload.js")
      },
    });

    this.mainWindow.loadFile(path.join(__dirname, "res/view/index.ejs"));
    this.mainWindow.once("ready-to-show", () => {
      this.mainWindow.show();
    });
  }
}

app.on("ready", () => {
  const launcher = new Launcher()
  launcher.start();
});