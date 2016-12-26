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
import shelljs from "shelljs";
import utils from "../utils";

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

    compose.use(async(ctx, next) => {
        ctx.doc = await utils(config);
        ctx.doc = ctx.doc.doc;

        if (ctx.doc && ctx.doc.id) {
            let res = await request.get(`${config.saltConfig.keyServer}/del/${ctx.doc.id}`);

            if (res.statusCode !== 200) {
                throw boom.create(res.statusCode, "返回码不正确");
            }

            // ctx.body = JSON.parse(res.text);
            await next();
        } else {
            throw boom.create(407, "读取配置文件错误！");
        }
    });

    return async(ctx, next) => {
        compose.once("complete", async(res) => {
            if (res.err) {
                throw res.err;
            }
            ctx.body = { result: true };

            await next();
        });
        await compose.callback()({
            doc: ctx.doc
        });
    };
};