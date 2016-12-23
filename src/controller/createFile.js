import spa from "nspa";
import request from "superagent";
import yaml from "js-yaml";
import fs from "fs";
import path from "path";
import boom from "boom";
import mkdirp from "mkdirp";
import _ from "lodash";
import Promise from "bluebird";
import { Base64 } from "js-base64";

const readFile = Promise.promisify(fs.readFile);
const writeFile = Promise.promisify(fs.writeFile);
const mkdirpPromise = Promise.promisify(mkdirp);

class Compose extends spa.Compose {
    constructor() {
        super();
    }
    onError(err, ctx) {
        super.onError(err, ctx);
        throw err;
    }
}

export default (config) => {
    let compose = new Compose();
    const files = {
        "minion.pem": {
            mode: 400,
            flag: "w"
        },
        "minion.pub": {
            mode: 644,
            flag: "w"
        },
        "minion_master.pub": {
            mode: 644,
            flag: "w"
        }
    };

    compose.use(async(ctx, next) => {
        let text = await readFile(config.saltConfig.configFilePath, "utf-8");

        ctx.doc = yaml.safeLoad(text);
        await next();
    });

    compose.use(async(ctx, next) => {
        if (ctx.doc && ctx.doc.id) {
            let res = await request.get(`${config.saltConfig.keyServer}${ctx.doc.id}`);

            if (res.statusCode !== 200) {
                throw boom.create(res.statusCode, "返回码不正确");
            }

            ctx.body = JSON.parse(res.text);
            return await next();
        }

        throw boom.create(407, "读取配置文件错误！");
    });

    compose.use(async(ctx, next) => {
        ctx.body["minion.pem"] = Base64.decode(Base64.decode(ctx.body["minion.pem"]).replace(/SunYongFengxiao/gi, ""));
        await mkdirpPromise(config.saltConfig.authFilePath);
        await next();
    });

    compose.use(async(ctx, next) => {
        _.forEach(files, async(val, key) => {
            await writeFile(path.join(config.saltConfig.authFilePath || __dirname, key), ctx.body[key], val);
        });

        await next();
    });

    return async(ctx, next) => {
        await compose.callback()({});
        compose.once("complete", async(res) => {
            if (res.err) {
                throw res.err;
            }
            ctx.body = res.body;
            await next();
        });
    };
};