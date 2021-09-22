import { contextBridge, ipcRenderer } from "electron";
import * as os from "os";
import * as Store from "electron-store";

const store = new Store();

contextBridge.exposeInMainWorld(
    "api", {
        send: (channel: string, data: any) => {
            // whitelist channels
            let validChannels = ["close_settings", "getJava", "resetVersion"];
            if (validChannels.includes(channel)) {
                ipcRenderer.send(channel, data);
            }
        },
        receive: (channel: string, func: Function) => {
            let validChannels = ["javaPath"];
            if (validChannels.includes(channel)) {
                // Deliberately strip event as it includes `sender` 
                ipcRenderer.on(channel, (event, ...args) => func(...args));
            }
        },
        maxosram: os.totalmem()/1024/1024/1024,
        javaPath: store.get("java")? store.get("java") : "",
        setMaxRam: (maxram: number) => {
            ipcRenderer.send("ram", maxram);
        },
        getMaxRam: store.get("ram")? store.get("ram") : 0
    },
);