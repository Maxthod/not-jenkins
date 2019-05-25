const express = require("express");
const app = express();
const axios = require('axios')
require("maxthod-logger").init();


    app.use(express.json());

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

    const {
        query,
        body
    } = req;


    const secretToken = process.env.TOKEN || "changeit";

    const {
        token
    } = query;

    const {
        callback_url,
        push_data,
        repository
    } = body;

    Logger.debug("request on /not-jenkins");
    Logger.debug("Secret Token is %o", secretToken);

    Logger.debug("Query token is %o", token);

    Logger.debug("Message is : %o", req.body);


    if (token !== secretToken) {
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



            axios.post(callback_url, {
                    "state": "success",
                    "description": "No were done *THUMBS_UP*",
                    "context": "Continuous integration by Not Jenkins!",
                })
                .then((res) => {
                    console.log(`statusCode: ${res.statusCode}`)
                    console.log(res)
                })
                .catch((error) => {
                    console.error(error)
                })




        } catch (err) {
            Logger.info("Execute command failed! : %o", err);
            res.status(500).send();
        }

    }


});


app.post('/toto', async function (req, res) {

    const {
        query,
        body
    } = req;


    const secretToken = process.env.TOKEN || "changeit";

    const {
        token
    } = query;

    const {
        callback_url,
        push_data,
        repository,
        command_in
    } = body;

    Logger.debug("request on /info");
    Logger.debug("Secret Token is %o", secretToken);

    Logger.debug("Query token is %o", token);

    Logger.debug("Message is : %o", req.body);


    if (token !== secretToken) {
        res.status(401).json({
            status: 401,
            code: "Invalid token"
        });
    } else {
        try {
            const command = `${command_in}`

            const result = await execute(command);

            Logger.debug("Result is : %o", result);
            res.json({
                status: 200,
                data: result
            });



            axios.post(callback_url, {
                    "state": "success",
                    "description": "No were done *THUMBS_UP*",
                    "context": "Continuous integration by Not Jenkins!",
                })
                .then((res) => {
                    console.log(`statusCode: ${res.statusCode}`)
                    console.log(res)
                })
                .catch((error) => {
                    console.error(error)
                })




        } catch (err) {
            Logger.info("Execute command failed! : %o", err);
            res.status(500).send();
        }

    }


});



app.listen(PORT, function () {
    Logger.info("App started on port %s", PORT);
});