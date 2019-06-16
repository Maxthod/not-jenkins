const DeployService = require("./DeployService")

async function pipeline(options) {
    const {
        image_name,
        service_name,
        image_version
    } = options || {};

    try {
        await DeployService.deploy(`${image_name}:${image_version}`, service_name);

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