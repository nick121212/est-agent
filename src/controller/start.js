export default (config) => {

    return async(ctx, next) => {
        ctx.body = { s: "start" };

        await next();
    };
};