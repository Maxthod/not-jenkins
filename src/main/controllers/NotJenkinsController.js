const express = require('express'),
    router = express.Router();


const GitHubUtil = require("../utils/github");
const SCM = require("../utils/SCM");

router.route('/')
    .post(async function (req, res) {
        Logger.silly(`
    ##################################################################################################################################
    ##################################################################################################################################
    ############################################# DEPLOYMENT THE HEMPATHY NOT JENKINS ############################################
    ##################################################################################################################################
    ##################################################################################################################################
    `);
        try {
            const options = {
                scm: SCM.GITHUB,
                source_branch: "develop",
                workdir: "thehempathy_not_jenkins",
                image_name: process.env.THE_HEMPATHY_NOT_JENKINS_IMAGE_NAME || "thehempathy-not-jenkins:latest",
                service_name: "thehempathy_not_jenkins",
                secret: process.env.THEHEMPATHY_NOT_JENKINS_GITHUB_SECRET || "changeme"
            }

            await GitHubUtil.startDeploy(req, options);

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