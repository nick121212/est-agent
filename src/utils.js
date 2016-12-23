import os from "os";
import yaml from "js-yaml";
import fs from "fs";
import Promise from "bluebird";
import _ from "lodash";

const readFile = Promise.promisify(fs.readFile);

export default async(config) => {
    let ips = {};

    _.forEach(os.networkInterfaces(), (network) => {
        _.each(network, (ipInfo) => {
            !ips[ipInfo.family] && (ips[ipInfo.family] = []);
            ipInfo.address != "127.0.0.1" && ips[ipInfo.family].push(ipInfo.address);
        });
    });

    let text = await readFile(config.saltConfig.configFilePath, "utf-8");

    return {
        ips: ips,
        hostname: os.hostname(),
        doc: yaml.safeLoad(text)
    };
};