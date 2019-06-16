const express = require('express'),
    router = express.Router();

const execute = require("../utils/execute");


const TIME = process.env.TIME || 'time is not set';
Logger.info("TIME IS : %s", TIME);

router.route('/')
    .get(async function (req, res, next) {
        res.send(TIME + "toto") ;
    });


module.exports = router;