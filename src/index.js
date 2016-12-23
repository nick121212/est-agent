import nspa from "nspa";
import controller from "./controller";
// import statsd from "../node_modules/statsd/statsd";

const config = nspa.configFile();

class Application extends nspa.Spa {
    constructor(_maxJobs) {
        super(_maxJobs);
    }
    onComplete(ctx) {
        super.onComplete(ctx);
        if (this.spaClient.proxy && this.spaClient.proxy.setStatus) {
            this.spaClient.proxy.setStatus(10 - this.jobs);
        }
    }
}

const init = async() => {
    const app = new Application(10);

    app.initClient(config.server, {
        ready: (spaClient, proxy) => {
            proxy.setStatus(app.maxJobs - app.jobs);
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