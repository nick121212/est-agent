import utils from "../utils";

export default (config) => {

    return async(ctx, next) => {
        ctx.body = await utils(config);

        await next();
    };
};