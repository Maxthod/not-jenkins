const express = require('express'),
    router = express.Router();

const BaseController = new require("./BaseController")

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
            const options = {
                image_name: process.env.THE_HEMPATHY_TINY_IMAGE_NAME || "thehempathy-tiny",
                image_version: "latest",
                service_name: "thehempathy_tiny",
                secret: process.env.THEHEMPATHY_TINY_GITHUB_SECRET || "changeme"
            }

            const result = await BaseController.processRequest(req, options)
            result.endRequest(result, res)

        } catch (err) {
            Logger.error("Failed to process request.");
            next({
                status: 400,
                err: err
            })
        }

        return;

    });


module.exports = router;