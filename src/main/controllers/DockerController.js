const express = require('express'),
    router = express.Router();

const BaseController = new require("./BaseController")

const GitHubUtil = require("../utils/github");
const SCM = require("../utils/SCM");

router.route('/')
    .post(async function (req, res) {
      Logger.info("### Docker command.") 
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


        } catch (err) {
            Logger.error("Failed to deploy /not-jenkins. Error : %o", err);
            next({
                status: 400,
            })
        }


        return;
    });


module.exports = router;