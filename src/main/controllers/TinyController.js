const express = require('express'),
    router = express.Router();

const BuildService = require('../services/BuildService');
const GitHubUtil = require("../utils/github");
const BuildPipeline = require("../services/BuildPipeline")

const SCM = require("../utils/SCM");

router.route('/')
    .get(async function (req, res, next) {
        res.send("ah bitches and hoes!!!");
    })
    .post(async function (req, res, next) {
        Logger.silly(`
    ##################################################################################################################################
    ##################################################################################################################################
    ############################################# DEPLOYMENT THE HEMPATHY TINY ############################################
    ##################################################################################################################################
    ##################################################################################################################################
    `);


        try {
            let result = null;
            const options = {
                image_name: process.env.THE_HEMPATHY_TINY_IMAGE_NAME || "thehempathy-tiny",
                image_version: "latest",
                service_name: "thehempathy_tiny",
                secret: process.env.THEHEMPATHY_TINY_GITHUB_SECRET || "changeme"
            }


            if (GitHubUtil.isReqFromGithub(req)) {
                options.scm = SCM.GITHUB;
                result = await GitHubService.start(req, options)
            } else if ("isReqFromDockerHub" === false) {} else {
                return next({
                    status: 401,
                    error: "unhandle_request"
                })
            }
            switch (result.code) {
                case "source_branch_unhandle":
                    res.sendStatus(200);
                    break;
                case "invalid_token":
                    next({
                        status: 401,
                        code: "invalid_token"
                    });
                    break;
                default:
                    res.json({
                        status: 200,
                        message: "Deploy with success!"
                    })
            }



        } catch (err) {
            Logger.error("Failed to deploy /tiny. Error : %o", err);
            next({
                status: 400,
            })
        }


        return;

    });


module.exports = router;