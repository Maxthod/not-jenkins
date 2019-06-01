const express = require('express'),
    router = express.Router();


const GitHubUtil = require("../utils/github");
const SCM = require("../utils/SCM");

router.route('/backend-express')
    .post(async function (req, res) {
        Logger.silly(`
    ##################################################################################################################################
    ##################################################################################################################################
    ############################################# DEPLOYMENT THE HEMPATHY BACKEND EXPRESS ############################################
    ##################################################################################################################################
    ##################################################################################################################################
    `);
        try {
            const options = {
                scm: SCM.GITHUB,
                source_branch: "develop",
                workdir: process.env.THE_HEMPATHY_BACKEND_EXPRESS_WORKDIR || "thehempathy_backend_express",
                image_name: process.env.THE_HEMPATHY_BACKEND_EXPRESS_IMAGE_NAME || "thehempathy-backend-express:latest",
                service_name: process.env.THE_HEMPATHY_BACKEND_EXPRESS_SERVICE_NAME || "thehempathy_backend_express",
                secret: process.env.THE_HEMPATHY_BACKEND_EXPRESS_GITHUB_SECRET || "changeme"
            }

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


    router.route('/frontend-react')
    .post(async function (req, res) {
        Logger.silly(`
    ##################################################################################################################################
    ##################################################################################################################################
    ############################################# DEPLOYMENT THE HEMPATHY FRONTEND REACT ############################################
    ##################################################################################################################################
    ##################################################################################################################################
    `);
        try {
            const options = {
                scm: SCM.GITHUB,
                source_branch: "develop",
                workdir: process.env.THE_HEMPATHY_FRONTEND_REACT_WORKDIR || "thehempathy_frontend_react",
                image_name: process.env.THE_HEMPATHY_FRONTEND_REACT_IMAGE_NAME || "thehempathy-frontend-react:latest",
                service_name: process.env.THE_HEMPATHY_FRONTEND_REACT_SERVICE_NAME || "thehempathy_frontend_react",
                secret: process.env.THE_HEMPATHY_FRONTEND_REACT_GITHUB_SECRET || "changeme"
            }

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



