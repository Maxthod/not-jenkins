const express = require('express'),
    router = express.Router();

const BaseController = new require("./BaseController")

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
                image_name: process.env.THE_HEMPATHY_BACKEND_EXPRESS_IMAGE_NAME || "thehempathy-backend-express",
                image_version: "latest",
                service_name: process.env.THE_HEMPATHY_BACKEND_EXPRESS_SERVICE_NAME || "thehempathy_backend_express",
                secret: process.env.THE_HEMPATHY_BACKEND_EXPRESS_GITHUB_SECRET || "changeme"
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


router.route('/frontend-react')
    .post(async function (req, res, next) {
        Logger.silly(`
    ##################################################################################################################################
    ##################################################################################################################################
    ############################################# DEPLOYMENT THE HEMPATHY FRONTEND REACT ############################################
    ##################################################################################################################################
    ##################################################################################################################################
    `);
        try {
            const options = {
                image_name: process.env.THE_HEMPATHY_FRONTEND_REACT_IMAGE_NAME || "thehempathy-frontend-react",
                image_version: "latest",
                service_name: process.env.THE_HEMPATHY_FRONTEND_REACT_SERVICE_NAME || "thehempathy_frontend_react",
                secret: process.env.THE_HEMPATHY_FRONTEND_REACT_GITHUB_SECRET || "changeme"
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