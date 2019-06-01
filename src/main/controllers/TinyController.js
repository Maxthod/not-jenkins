const express = require('express'),
    router = express.Router();

const BuildService = require('../services/BuildService');
const GitHubUtil = require("../utils/github");

const SCM = require("../utils/SCM");

router.route('/')
    .get(async function (req, res, next) {
        res.send("oh hi oh!");
    })
    .post(async function (req, res, next) {
        Logger.silly(`
    ##################################################################################################################################
    ##################################################################################################################################
    ############################################# DEPLOYMENT THE HEMPATHY TINY ############################################
    ##################################################################################################################################
    ##################################################################################################################################
    `);
        if (false) {
            try {
                const ENV_SECRET = process.env.THEHEMPATHY_BACKEND_EXPRESS_GITHUB_SECRET || "changeme";

                if (!validGithubSecret(req, ENV_SECRET)) {
                    Logger.debug("Request failed GitHub validation!");

                    next({
                        status: 401,
                        code: "Invalid token"
                    });
                } else {
                    const {
                        body
                    } = req;

                    const WORKDDIR = "thehempathy_backend_express";
                    const SERVICE_NAME = "thehempathy_backend_express";
                    const IMAGE_NAME = "thehempathy-backend-express:latest";

                    if (isReqFromGithub(req)) {
                        Logger.debug("Request is from github");

                        if (!isCommitFromBranch(req, "develop")) {

                            Logger.debug("Request is not for push event on branch develop. Returning status 200");

                            return res.sendStatus(200);
                        } else {
                            Logger.debug(`
                ##################################################################################################################################
                ##################################################################################################################################
                ############################################# DEPLOYING INTO DEVELOPMENT ENVIRONMENT #############################################
                ##################################################################################################################################
                ##################################################################################################################################
                `);

                            const {
                                ssh_url
                            } = decodeGitHub(body);

                            await clone(ssh_url, WORKDDIR);

                            await build(IMAGE_NAME, WORKDDIR);

                            await deploy(IMAGE_NAME, SERVICE_NAME);

                            return res.sendStatus(200);

                            await clean(WORKDDIR);


                        }


                    } else {
                        next({
                            status: 400,
                            code: "method_not_implemented"
                        })
                    }


                }


            } catch (err) {
                Logger.error("Execute command failed! : %o", err);
                next({
                    status: 500,
                    message: "Internal error"
                })
            }
        }


        try {
            const options = {
                scm: SCM.GITHUB,
                source_branch: "develop",
                workdir: "thehempathy_tiny",
                image_name: process.env.THE_HEMPATHY_TINY_IMAGE_NAME || "thehempathy-tiny:latest",
                service_name: "thehempathy_tiny",
                secret: process.env.THEHEMPATHY_TINY_GITHUB_SECRET || "changeme"
            }


            GitHubUtil.startDeploy(req, options);
            /*
                        await BuildService.build(req, options)
                            .catch(function (err) {
                                Logger.error("Build failed!. Error : %o", err);
                                next(err);
                            });

                        await DeployService.deploy(req, options)
                            .catch(function (err) {
                                Logger.error("Build failed!. Error : %o", err);
                                next(err);
                            });
            */
            res.json({
                status: 200,
                message: "Deploy with success!"
            })

        } catch (err) {
            Logger.error("Failed to deploy /tiny. Error : %o", err);
            next({
                status: 400,
            })
        }


        return;

    });


module.exports = router;