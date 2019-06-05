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
            service_name,
            ssh_url
    } = options || {};

    try {
        await CloneService.clone(ssh_url, workdir);

        await BuildService.build(image_name, image_version, workdir);

        // await DeployService.deploy(image_name, service_name);

        await CleanupService.clean(workdir);

    } catch (err) {
        Logger.error("Pipeline failed. Error : %o", err)
    }
}

async function constructOptions(req, options) {
    const {
        branch_name,
        ssh_url
    } = Utils.decodeGitHub(req.body);


    switch (branch_name) {
        case "develop":
            options.version = "latest"
        default:
    }

    return options;



    if (!Utils.isCommitFromBranch(req, source_branch)) {

        Logger.debug("Request is not for push event on branch develop. Ignoring.");

    } else {
        Logger.silly(`
                ##################################################################################################################################
                ##################################################################################################################################
                ############################################# DEPLOYING INTO DEVELOPMENT ENVIRONMENT #############################################
                ##################################################################################################################################
                ##################################################################################################################################
                `);

        options.ssh_url = Utils.decodeGitHub(req.body).ssh_url;
        return pipeline(options);
    }
}

module.exports = {
    start: async function (req, options) {
        try {
            await validateRequestFromGithub(req);
            await validateGithubSecret(req, options.secret);

            const pipelineOptions = await constructOptions(req, options);

            await pipeline(pipelineOptions);



        } catch (err) {
            Logger.error("Build Pipeline failed. Error : %o", err)
            throw err;
        }


    }
}