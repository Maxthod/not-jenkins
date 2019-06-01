const path = require('path');
const express = require('express');


(function (routeConfig) {
    'use strict';

    routeConfig.init = function (app) {

        // *** register routes *** //
        app.use('/test', require('../controllers/TestController.js'));
        app.use('/time', require('../controllers/TimeController.js'));
        app.use('/tiny', require('../controllers/TinyController.js'));
       
        //The 404 Route (ALWAYS Keep this as the last route)
        app.use('/', function (req, res) {
            res.status(404).send({
                status: 404,
                error: "not_found",
                message: 'Nothing at this url'
            });
        });


    };

})(module.exports);