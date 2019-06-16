const Utils = require("../utils/github");
const BuildPipeline = require("./BuildPipeline")
const DeployPipeline = require("./DeployPipeline")

async function constructOptions(req, options) {
    const {
        ssh_url
    } = Utils.decodeGitHub(req.body);

    options.ssh_url = ssh_url;

    return options;
}

async function validateGithubSecret(req, secret) {
    if (!Utils.validGithubSecret(req, secret)) {
        Logger.debug("Github secret is invalid. Check configuration with GitHub.");
        throw {
            code: "invalid_token"
        };
    }
}


module.exports = {
    start: async function (req, options) {
        try {
            const payload = req.body;
            const sourceBranch = Utils.getBranchFromPayload(payload);

            switch (sourceBranch) {
                case "develop":
                    options.version = "latest";
                    break;
                case "release":
                    options.version = Utils.getReleaseVersion(payload);
                    break;
                case "master":
                    options.version = Utils.getTagVersion(payload);
                    break;
                default:
                    return {
                        code: "source_branch_unhandle"
                    }
            }

            await validateGithubSecret(req, options.secret).catch(err => {
                return {
                    code: "invalid_token",
                    message: "Invalid Secret"
                }
            });


            let pipelineOptions = await constructOptions(req, options);

            await BuildPipeline.start(pipelineOptions);
            await DeployPipeline.start(pipelineOptions);

            return {
                code: "success"
            }

        } catch (err) {
            Logger.error("Github pipeline failed!")
            throw err;
        }
    }
}