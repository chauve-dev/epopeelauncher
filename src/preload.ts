import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld(
    "api", {
        send: (channel: string, data: any) => {
            // whitelist channels
            let validChannels = ["close", "minimize", "maximize", "getActu", "microsoft", "mojang", "play", "logout", "openSettingWindow"];
            if (validChannels.includes(channel)) {
                ipcRenderer.send(channel, data);
            }
        },
        receive: (channel: string, func: Function) => {
            let validChannels = ["fromMain", "fromActu", "fromLogin", "loginUpdate", "update_forge", "update_modpack", "update_done", "enable_button", "update-error-launcheur", "download-progress-launcheur"];
            if (validChannels.includes(channel)) {
                // Deliberately strip event as it includes `sender` 
                ipcRenderer.on(channel, (event, ...args) => func(...args));
            }
        }
    },
);