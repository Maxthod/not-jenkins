const SCM = require("./SCM");

const crypto = require("crypto");

const CloneService = require("../services/CloneService")
const BuildService = require("../services/BuildService")
const PushService = require("../services/PushService")
const DeployService = require("../services/DeployService")
const CleanupService = require("../services/CleanupService")

const Utils = {
    isReqFromGithub: function (req) {
        return req.headers['user-agent'].includes('GitHub-Hookshot');
    },

    // Verification function to check if it is actually GitHub who is POSTing here
    validGithubSecret: function (req, webhook_secret) {
        if (!Utils.isReqFromGithub(req)) {
            return false;
        }

        // Compare their hmac signature to our hmac signature
        // (hmac = hash-based message authentication code)
        const theirSignature = req.headers['x-hub-signature'];
        const payload = JSON.stringify(req.body);
        const secret = webhook_secret;
        const ourSignature = `sha1=${crypto.createHmac('sha1', secret).update(payload).digest('hex')}`;

        return crypto.timingSafeEqual(Buffer.from(theirSignature), Buffer.from(ourSignature));
    },
    decodeGitHub: function (payload) {
        return {
            branch_name: payload.ref.split("/").slice(2),
            ssh_url: payload.repository.ssh_url
        }
    },
    isCommitFromBranch: function (req, branchname) {
        if (!req || !req.body) {
            return false;
        }
        return req.body.ref.indexOf(branchname) > -1;
    },

    startDeploy: async function (req, options) {

        Logger.debug("Options for deploy are :")
        Object.keys(options).forEach(key => {
            Logger.debug(`${key} : ${options[key]}`)
        });


        const {
            scm,
        } = options || {};

        if (scm === SCM.GITHUB) {

            return await deployFromGithub(req, options);
        } else {
            throw {
                status: 400,
                code: "unsupported scm"
            };
        }
    }
}

async function deployFromGithub(req, options) {

    try {
        const {
            source_branch,
            workdir = "tmp_build",
            image_name,
            service_name,
            secret
        } = options || {};


        if (!Utils.isReqFromGithub(req)) {
            Logger.err("Invalid github request!");
            throw {
                status: 400,
                code: "invalid_github_request"
            };
        } else {

            if (!Utils.validGithubSecret(req, secret)) {
                Logger.debug("Secret is invalid. Check configuration with GitHub.");

                throw {
                    status: 401,
                    code: "Invalid token"
                };
            } else {
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
        }



    } catch (err) {
        Logger.error("Error with github deploy script. Error : %o", err);
        throw err;
    }

}


async function pipeline(options) {

    Logger.info("Starting pipeline.")

    const {
        workdir = "tmp_build",
            image_name,
            service_name,
            ssh_url
    } = options || {};

    try {
        await CloneService.clone(ssh_url, workdir);

        await BuildService.build(image_name, workdir);

        await DeployService.deploy(image_name, service_name);

        await CleanupService.clean(workdir);

    } catch (err) {
        Logger.error("Pipeline failed. Error : %o", err)
    }
}

module.exports = Utils;