import nspa from "nspa";
import controller from "./controller";
import utils from "./utils";
// import statsd from "../node_modules/statsd/statsd";

const config = nspa.configFile();

class Application extends nspa.Spa {
    constructor(_maxJobs) {
        super(_maxJobs);
    }
    async onComplete(ctx) {
        super.onComplete(ctx);
        // if (this.spaClient.proxy && this.spaClient.proxy.setStatus) {
        //     this.spaClient.proxy.setStatus(await utils(config));
        // }
    }
}

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
};

init();