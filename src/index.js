import nspa from "nspa";
import controller from "./controller";
import utils from "./utils";
import nodeShedule from "node-schedule";
import shelljs from "shelljs";
import path from "path";
// import statsd from "../node_modules/statsd/statsd";

const config = nspa.configFile();

class Application extends nspa.Spa {
    constructor(_maxJobs) {
        super(_maxJobs);
    }
    async onComplete(ctx) {
        super.onComplete(ctx);
    }
}

const schedule = async(app) => {
    const stop = () => {
        console.log("stop");
        shelljs.exec(`rm -f ${path.join(config.saltConfig.authFilePath,"*")}`);
        shelljs.exec("service salt-minion stop");
    };

    nodeShedule.scheduleJob("*/1 * * * *", async() => {
        if (app.spaClient.proxy && app.spaClient.proxy.applyAuth) {
            app.spaClient.proxy.applyAuth(await utils(config)).onReady(async(res) => {
                console.log(res);
                if (res === false) {
                    stop();
                } else if (res === true) {
                    console.log("start");
                    shelljs.exec("service salt-minion start");
                }
            });
        }
        stop();
    });
};

const init = async() => {
    const app = new Application(10);

    app.initClient(config.server, {
        ready: async(spaClient, proxy) => {
            proxy.setStatus && proxy.setStatus(await utils(config));
        }
    });

    await controller(app.spaClient, config);
    app.use(app.spaClient.attach(app));
    app.use(async(ctx, next) => {
        setTimeout(async() => {
            await next();
        }, 1000);
    });

    await schedule(app);
};

init();