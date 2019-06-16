const GitHubUtil = require("../utils/github");
const DeployService = require("../services/DeployService");
const GithubService = require("../services/GithubService");

const SCM = require("../utils/SCM")

class BaseControllerError extends Error {}

async function processRequestFromGithub(req, options) {
    options.scm = SCM.GITHUB;
    const result = await GithubService.start(req, options)

    switch (result.code) {
        case "invalid_token":
            throw new BaseControllerError({
                status: 401,
                code: "invalid_token"
            });
        default:
            return Object.assign({
                endRequest: endRequest
            }, result)
    }
}

function endRequest(result, res) {
    switch (result.code) {
        case "source_branch_unhandle":
            res.sendStatus(200);
            break;
        default:
            res.json({
                status: 200,
                message: "Deploy with success!"
            })
    }
}

module.exports = {

    processRequest: async function (req, options) {

        if (GitHubUtil.isReqFromGithub(req)) {
            return await processRequestFromGithub(req, options);
        } else if ("isReqFromDockerHub" === false) {

        } else if (PostRequestUtil.validatePostSecret(req, options.secret)) {
            const {
                imageName
            } = req.body;

            const result = await DeployService.deploy(imageName, options.service_name);
            return Object.assign({
                endRequest: endRequest
            }, result)
        } else {
            throw BaseControllerError({
                status: 401,
                error: "unhandle_request"
            })
        }


    }


}