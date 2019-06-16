const express = require('express'),
    router = express.Router();

const BaseController = require("./BaseController")

const GitHubUtil = require("../utils/github");

router.route('/')
    .post(async function (req, res, next) {
        Logger.silly(`
    ##################################################################################################################################
    ##################################################################################################################################
    ############################################# DEPLOYMENT THE HEMPATHY NOT JENKINS ############################################
    ##################################################################################################################################
    ##################################################################################################################################
    `);
        try {
            const options = {
                image_name: process.env.THE_HEMPATHY_NOT_JENKINS_IMAGE_NAME || "thehempathy-not-jenkins",
                image_version: "latest",
                service_name: process.env.THE_HEMPATHY_NOT_JENKINS_SERVICE_NAME || "not_jenkins",
                secret: process.env.THE_HEMPATHY_NOT_JENKINS_GITHUB_SECRET || "changeme"
            }
            const result = await BaseController.processRequest(req, options)
            result.endRequest(result, res)

            return
            GitHubUtil.startDeploy(req, options);

            res.json({
                status: 200,
                message: "Deploy with success!"
            })

        } catch (err) {
            Logger.error("Failed to deploy /not-jenkins. Error : %o", err);
            next({
                status: 400,
            })
        }


        return;
    });

module.exports = router;