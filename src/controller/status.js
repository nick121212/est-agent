import utils from "../utils";

export default (config) => {

    return async(ctx, next) => {
        ctx.body = await utils(config);
        if (ctx.proxy.proxy && ctx.proxy.proxy.applyAuth) {
            ctx.proxy.proxy.applyAuth(ctx.body);
        }

        await next();
    };
};