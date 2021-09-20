import { ILauncherOptions, Client, Authenticator } from "minecraft-launcher-core";

class Game {
    private opts: ILauncherOptions;
    private launcher: Client;

    constructor(){
        this.opts = {
            clientPackage: "./ressources.zip",
            authorization: null,
            root: "./minecraft",
            javaPath: "C:\\Program Files\\Java\\jre1.8.0_291\\bin\\java.exe",
            version: {
                number: "1.7.10",
                type: "release"
            },
            forge: "./forge.jar",
            memory: {
                max: "6G",
                min: "4G"
            }
        }
    }

    public setAuth(auth: any) {
        this.opts.authorization = auth;
    }

    public setMaxMemory(max: number) {
        this.opts.memory.max = max;
    }

    public setMinMemory(min: number) {
        this.opts.memory.min = min;
    }

    public start() {
        this.launcher = new Client()
        this.launcher.launch(this.opts);

        this.launcher.on('debug', (e) => console.log("debug", e));
        this.launcher.on('data', (e) => console.log("data", e));
        this.launcher.on('error', (e) => console.log("error", e));
        this.launcher.on('close', (e) => console.log("close", e));

        return this.launcher;
    }
}

export { Game };