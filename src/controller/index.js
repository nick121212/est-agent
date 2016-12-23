import status from "./status";
import start from "./start";
import createFile from "./createFile";
import delFile from "./deleteFile";

export default async(spaClient, config) => {
    spaClient.attachRouteToSocket("status", await status(config));
    spaClient.attachRouteToSocket("start", await start(config));
    spaClient.attachRouteToSocket("createFile", await createFile(config));
    spaClient.attachRouteToSocket("deleteFile", await delFile(config));
};