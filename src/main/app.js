// *** dependencies *** //
const express = require('express');

require("maxthod-logger").init();

const appConfig = require('./config/app-config.js');
const routeConfig = require('./config/route-config.js');
const errorConfig = require('./config/error-config.js');

// *** express instance *** //
const app = express();

try { 
	appConfig.init(app);
	routeConfig.init(app);
	errorConfig.init(app);
} catch (err) {
	Logger.error("Initialization failed.")
	Logger.error(err);
}

module.exports = app;

