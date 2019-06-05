const Utils = require("../utils/github");
const BuildPipeline = require("./BuildPipeline")


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
            const sourceBranch = Utils.getBranchFromReq(req);

            switch (sourceBranch) {
                case "develop":
                    pipelineOptions.version = "latest";
                    break;
                case "release":
                    pipelineOptions.version = Utils.getReleaseVersion(req);
                    break;
                case "master":
                    pipelineOptions.version = Utils.getTagVersion(req);
                    break;
                default:
                    return {
                        code: "source_branch_unhandle"
                    }
            }

            await validateGithubSecret(req, options.secret).catch(err => {
                return {
                    code: invalid_token,
                    message: "Invalid Secret"
                }
            });


            let pipelineOptions = await constructOptions(req, options);

            await BuildPipeline.start(pipelineOptions);
            await DeployPipeline.start(pipelineOptions);

        } catch (err) {
            Logger.error("Github pipeline failed!")
            throw err;
        }
    }
}