import { ILauncherOptions, Client, Authenticator } from "minecraft-launcher-core";
import { app } from "electron";
import * as path from "path";
import axios from "axios";
import * as Store from "electron-store";
import { DownloaderHelper } from "node-downloader-helper";


class Game {
    private opts: ILauncherOptions;
    private launcher: Client;
    private store: Store;

    constructor(){
        this.store = new Store();
        let ram = this.store.get("ram")? this.store.get("ram") : "1"
        this.opts = {
            authorization: null,
            root: path.join(app.getPath("appData"), ".epopeelibre"),
            version: {
                number: "1.7.10",
                type: "release"
            },
            forge: path.join(app.getPath("userData"), "forge.jar"),
            memory: {
                max: ram+"G",
                min: "1G"
            }
        }
        if(this.store.get("java") !== undefined) {
            this.opts.javaPath = this.store.get("java").toString();
        }
        
    }

    private getLastVersion() {
        return new Promise((resolve, reject) => {
            axios.get("https://epopee.joeyjeantet.fr/versions?_sort=published_at:DESC&_limit=1").then(response => {
                resolve({
                    version: response.data[0].numero,
                    archive: response.data[0].modpack.url,
                    forge: response.data[0].forge.url
                });
            }).catch((error: any) => {
                reject({
                    version: false,
                    error: error
                });
            });
        });
    }

    private async downloadModpack(url: string, window: any) {
        return new Promise((resolve, reject) => {
            let modpackDownloader = new DownloaderHelper("https://epopee.joeyjeantet.fr"+url, app.getPath("temp"), {fileName: "modpack.zip", override: true});
            modpackDownloader.on('progress.throttled', (stats: any) => {
                const progress = stats.progress.toFixed(1);
                const speed = stats.speed;
                const downloaded = stats.downloaded;
                const total = stats.total;
        
                window.webContents.send("update_modpack", {
                    speed: speed,
                    progress: progress,
                    downloaded: downloaded,
                    total: total
                });
            });
            modpackDownloader.on("end", () => resolve("done"));
            modpackDownloader.on("error", () => reject("error"));
            modpackDownloader.start();
        });
    }

    private async downloadForge(url: string, window: any) {
        return new Promise((resolve, reject) => {
            let forgeDownloader = new DownloaderHelper("https://epopee.joeyjeantet.fr"+url, app.getPath("userData"), {fileName: "forge.jar", override: true});
        forgeDownloader.on('progress.throttled', (stats: any) => {
            const progress = stats.progress.toFixed(1);
            const speed = stats.speed;
            const downloaded = stats.downloaded;
            const total = stats.total;
    
            window.webContents.send("update_forge", {
                speed: speed,
                progress: progress,
                downloaded: downloaded,
                total: total
            });
        });
        forgeDownloader.on("end", () => resolve("done"));
        forgeDownloader.on("error", () => reject("error"));
        forgeDownloader.start();
        });
    }


    private async update(update: any, window: any) {
        await Promise.all([
            this.downloadForge(update.forge, window),
            this.downloadModpack(update.archive, window)
        ]);
        window.webContents.send("update_done", {});
        this.setClientPackage(path.join(app.getPath("temp"), "modpack.zip"));
        this.store.set("version", update.version);
    }
                
    public setAuth(auth: any) {
        this.opts.authorization = auth;
    }

    public setClientPackage(clientPackage: string) {
        this.opts.clientPackage = clientPackage;
    }

    public setMaxMemory(max: number) {
        this.opts.memory.max = max+"G";
    }

    public setMinMemory(min: number) {
        this.opts.memory.min = min+"G";
    }

    public async start(window: any) {
        try{
            let update: any = await this.getLastVersion()
            if(this.store.get("version") !== update.version && update.version !== false) {
                await this.update(update, window);
            }
        } catch(error) {
            console.log(error);
        }
        

        this.launcher = new Client()
        this.launcher.launch(this.opts);
        window.webContents.send("enable_button", false);

        this.launcher.on('close', (e) => window.webContents.send("enable_button", true));
    }
}

export { Game };