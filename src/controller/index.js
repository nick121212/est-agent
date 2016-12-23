import status from "./status";
import start from "./start";
import createFile from "./createFile";

export default async(spaClient, config) => {
    spaClient.attachRouteToSocket("status", await status(config));
    spaClient.attachRouteToSocket("start", await start(config));
    spaClient.attachRouteToSocket("createFile", await createFile(config));
};