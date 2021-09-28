import { app, BrowserWindow, dialog, ipcMain } from "electron";
import * as path from "path";
import * as msmc from "msmc";
import axios from "axios";
import { Game } from "./controllers/game";
import { Authenticator } from "minecraft-launcher-core";
import * as Store from "electron-store";
import { autoUpdater } from "electron-updater";

class Launcher {

  private mainWindow: BrowserWindow;
  private settingWindow: BrowserWindow;

  constructor() {
    this.mainWindow = null;
  }

  public start() {
    this.createWindow();
  }

  public getMainWindow() {
    return this.mainWindow;
  }

  public getSettingWindow() {
    return this.settingWindow;
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
      autoUpdater.checkForUpdatesAndNotify()
    });
  }

  public createSettingsWindow() {
    this.settingWindow = new BrowserWindow({
      parent: this.mainWindow,
      height: 700,
      width: 900,
      resizable: false,
      transparent:true,
      titleBarStyle: "hidden",
      show: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, "settings_preload.js")
      }
  });

  this.settingWindow.loadFile(path.join(__dirname, "res/view/settings.html"));
    this.settingWindow.once("ready-to-show", () => {
      this.settingWindow.show();
    });
  }
}

var launcher: Launcher;
var game: Game;
const store = new Store();
app.on("ready", () => {
  launcher = new Launcher()
  launcher.start();
  game = new Game();
  if(store.get("auth") != null) {
    let auth: any = store.get("auth");
    if(auth.type == "mojang"){
      Authenticator.refreshAuth(auth.access_token, auth.client_token).then((result: any) => {
        game.setAuth(result);
        store.set("auth", {
          type: "mojang",
          access_token: result.access_token,
          client_token: result.client_token
        });
        launcher.getMainWindow().on("ready-to-show", () => {
          launcher.getMainWindow().webContents.send("fromLogin", {
            logged: true,
            uuid: result.uuid,
            name: result.name,
          });
        });
      }).catch((error: any) => {
        console.log(error);
      });
    } else if(auth.type == "microsoft"){
      launcher.getMainWindow().hide();
      msmc.getMCLC().refresh(auth.profile).then((result: any) => {
        game.setAuth(result);
        store.set("auth", {
          type: "microsoft",
          profile: result
        });
        launcher.getMainWindow().show();
        launcher.getMainWindow().webContents.send("fromLogin", {
          logged: true,
          uuid: result.uuid,
          name: result.name,
        });
      }).catch((error: any) => {
        launcher.getMainWindow().show();
        console.log(error);
      });
    }
  }
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
});

ipcMain.on("close", (event: any, arg: any) => {
  app.quit();
});

ipcMain.on("maximize", (event: any, arg: any) => {
  if(launcher.getMainWindow().isMaximized()) {
    launcher.getMainWindow().unmaximize();
  } else {
    launcher.getMainWindow().maximize();
  }
});

ipcMain.on("minimize", (event: any, arg: any) => {
  launcher.getMainWindow().minimize();
});

ipcMain.on("getActu", async(event: any, data: any) =>{
  axios.get("https://epopee.joeyjeantet.fr/actualites").then((response: any) => {
    event.reply("fromActu", response.data);
  }).catch((error: any) => {
    console.log("serveur down cannot fetch news");
  });
});

ipcMain.on("microsoft", (event: any, arg: any) => {
  msmc.fastLaunch("electron",
    (update: any) => {
      update.message = "Connexion au compte microsoft";
        event.reply("loginUpdate", update);
    }).then((result: any) => {
        //Let's check if we logged in?
        if (msmc.errorCheck(result)){
          event.reply("fromLogin", {
            logged: false
          });
          return;
        }
        if(result.type === "Success"){

          let auth: any = msmc.getMCLC().getAuth(result)
            game.setAuth(auth);
            store.set("auth", {
              type: "microsoft",
              profile: auth
            });
            event.reply("fromLogin", {
              logged: true,
              uuid: auth.uuid,
              name: auth.name,
            });
        } else {
          event.reply("fromLogin", {
            logged: false
          });
        }
        event.reply("fromLogin", true);
    }).catch((reason: any) => {
        //If the login fails
        console.log("We failed to log someone in because : " + reason);
    })
});


ipcMain.on("mojang", (event: any, arg: any) => {
  Authenticator.getAuth(arg.email, arg.password).then((result: any) => {
    store.set("auth", {
      type: "mojang",
      access_token: result.access_token,
      client_token: result.client_token
    });
    event.reply("fromLogin", {
      logged: true,
      uuid: result.uuid,
      name: result.name,
    });
  }).catch((reason: any) => {
    console.log(reason);
  });
});

ipcMain.on("logout", () => {
  store.delete("auth");
})


ipcMain.on("play", (event: any, arg: any) => {
  game.start(launcher.getMainWindow());
});


ipcMain.on("openSettingWindow", () => {
 launcher.createSettingsWindow();
});

ipcMain.on("close_settings", () => {
  launcher.getSettingWindow().close();
});

ipcMain.on("getJava", (event, arg) => {
  dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'java', extensions: ['exe', ""] }]
  }).then((filePath: any) => {
    store.set("java", filePath.filePaths[0]);
    event.reply("javaPath", filePath);
  });
});

ipcMain.on("ram", (event, arg) => {
  store.set("ram", arg);
  game.setMaxMemory(arg);
});

ipcMain.on("resetVersion", (event, arg) => {
  store.delete("version");
});


autoUpdater.on('error', err => {
  launcher.getMainWindow().webContents.send('update-error-launcheur', err);
});
autoUpdater.on('download-progress', progressObj => {
  launcher.getMainWindow().webContents.send('download-progress-launcheur', {
    progress: progressObj.percent,
    downloaded: progressObj.transferred,
    total: progressObj.total
  });
});

autoUpdater.on('update-downloaded', info => {
  // Wait 5 seconds, then quit and install
  // In your application, you don't need to wait 500 ms.
  // You could call autoUpdater.quitAndInstall(); immediately
  autoUpdater.quitAndInstall();
});