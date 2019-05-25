const express = require("express");
const app = express();

require("maxthod-logger").init();

const PORT = process.env.PORT || 2000;



const TIME = process.env.TIME || 'time is not set';
Logger.info("TIME IS : %s", TIME);



async function execute(command) {
    const util = require('util');
    const exec = util.promisify(require('child_process').exec);

    const {
        stdout,
        stderr
    } = await exec(command);


    if (stderr) {
        throw stderr;
    }


    return stdout;
}



app.post('/not-jenkins', async function (req, res) {

    const token = process.env.TOKEN || "changeit";
    const query = req.query.token;

    Logger.debug("request on /info");
    Logger.debug("Token is %o", token);

    Logger.debug("Query token is %o", query);

    Logger.debug("Message is : :o", req.body);

    if (query !== token) {
        res.status(401).json({
            status: 401,
            code: "Invalid token"
        });
    } else {
        try {
            const command = `docker service update --env-add TIME=${Date.now()} not_jenkins`
            
            const result = await execute(command);

            Logger.debug("Result is : %o", result);
            res.json({
                status: 200,
                data: result
            });
        } catch (err) {
            Logger.info("Execute command failed! : %o", err);
            res.status(500).send();
        }

    }

});



app.listen(PORT, function () {
    Logger.info("App started on port %s", PORT);
});