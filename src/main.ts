import { app, BrowserWindow, ipcMain, ipcRenderer } from "electron";
import * as path from "path";
import * as msmc from "msmc";
import axios from "axios";
import { Game } from "./controllers/game";

class Launcher {

  private mainWindow: BrowserWindow;

  constructor() {
    this.mainWindow = null;
  }

  public start() {
    this.createWindow();
  }

  public getMainWindow() {
    return this.mainWindow;
  }

  private createWindow() {
    this.mainWindow = new BrowserWindow({
      height: 700,
      width: 950,
      minHeight: 700,
      minWidth: 950,
      transparent:true,
      titleBarStyle: "hidden",
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, "preload.js")
      },
    });

    this.mainWindow.loadFile(path.join(__dirname, "res/view/index.html"));
    this.mainWindow.once("ready-to-show", () => {
      this.mainWindow.show();
    });
  }
}

var launcher: Launcher;
var game: Game;

app.on("ready", () => {
  launcher = new Launcher()
  launcher.start();
  game = new Game();
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
});

ipcMain.on("close", (event, arg) => {
  app.quit();
});

ipcMain.on("maximize", (event, arg) => {
  if(launcher.getMainWindow().isMaximized()) {
    launcher.getMainWindow().unmaximize();
  } else {
    launcher.getMainWindow().maximize();
  }
});

ipcMain.on("minimize", (event, arg) => {
  launcher.getMainWindow().minimize();
});

ipcMain.on("getActu", async(event, data) =>{
  axios.get("https://epopee.joeyjeantet.fr/actualites").then(response => {
    event.reply("fromActu", response.data);
  }).catch(error => {
    console.log(error);
  });
});

ipcMain.on("microsoft", (event, arg) => {
  msmc.fastLaunch("electron",
    (update) => {
        event.reply("loginUpdate", update.percent);
    }).then(result => {
        //Let's check if we logged in?
        if (msmc.errorCheck(result)){
            console.log(result.reason)
            return;
        }
        if(result.type === "Success"){
          event.reply("fromLogin", {
            logged: true,
            uuid: result.profile.id,
            name: result.profile.name,
          });
          game.setAuth(msmc.getMCLC().getAuth(result));
        } else {
          event.reply("fromLogin", {
            logged: false
          });
        }
        event.reply("fromLogin", true);
    }).catch(reason => {
        //If the login fails
        console.log("We failed to log someone in because : " + reason);
    })
});

ipcMain.on("play_microsoft", (event, arg) => {
  game.start();
});