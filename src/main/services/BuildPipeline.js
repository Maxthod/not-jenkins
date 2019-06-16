const CloneService = require('./CloneService')
const BuildService = require('./BuildService')
const PushService = require('./PushService')
const CleanupService = require('./CleanupService')
const Utils = require("../utils/github")

async function pipeline(options) {
    const {
        workdir = "tmp_build",
            image_name,
            image_version,
            ssh_url
    } = options || {};

    try {
        await CloneService.clone(ssh_url, workdir);

        await BuildService.build(image_name, image_version, workdir);

        await PushService.push(image_name, image_version);

        await CleanupService.clean(workdir);

    } catch (err) {
        Logger.error("Pipeline failed. Error : %o", err)
        throw err
    }
}


module.exports = {
    start: async function (options) {
        try {
            await pipeline(options);
        } catch (err) {
            Logger.error("Build Pipeline failed. Error : %o", err)
            throw err;
        }


    }
}