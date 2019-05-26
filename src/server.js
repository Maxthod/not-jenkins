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


function getImageNameDockerhub(payload) {
    const repo_name = payload.repository.repo_name;

    const tag = payload.push_data.tag;

    return `${repo_name}:${tag}`;
}


function getImageNameGithub(payload) {
    return "huguesmcd/not-jenkins:latest"
}


app.get('/info', async function (req, res) {

    res.send("yo ");

});

app.post('/not-jenkins', async function (req, res) {
    try {
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


        
        Logger.debug("request POST on /not-jenkins, jte jure from %s", req.get('host'));
        Logger.debug("Secret Token is %o", secretToken);

        Logger.debug("Query token is %o", token);

        res.sendStatus(200);

        return;

        const {
            ref
        } = req.body;



        const {
            repo_name
        } = repository;

        const {
            tag
        } = push_data;

        const imageName = getImageNameDockerhub();


        Logger.debug("Image name is repo_name is : %s", image_name);


        if (token !== secretToken) {
            Logger.debug("Invalid token : Expected %s . Was %s", secretToken, token);

            res.status(401).json({
                status: 401,
                code: "Invalid token"
            });
        } else {
            Logger.debug("Valid token!");

            await responseSucess(callback_url);

            const commandDeploy = `IMAGE_NAME=${imageName} deploy`

            Logger.debug("Deploy image : %s", commandDeploy);
            await execute(commandDeploy).catch(err => {
                Logger.error("Deploy is crying ... : %o", err);
            });
            Logger.debug("Deployed.")

            res.json({
                status: 200,
            });

        }


    } catch (err) {
        Logger.info("Execute command failed! : %o", err);
        res.status(500).send();
        responseFailed(callback_url);
    }
});



app.post('/serais-possible', async function (req, res) {
    try {
        const {
            query,
            body
        } = req;

        const secretToken = "shoubalou";

        const {
            token
        } = query;
        Logger.debug("request on POST /not-jenkins-dev, url : %s", req.url);
        Logger.debug("Secret Token is %o", secretToken);
        Logger.debug("Query token is %o", token);

        Logger.debug("Hello from dev!");


        const {
            ref
        } = body;


        if (ref.indexOf('develop') > -1) {
            Logger.debug(`
            ########################################################################
            ################ DEPLOYING INTO DEVELOPMENT ENVIRONMENT ################
            ########################################################################
            `);

            const imageName = getImageNameGithub(body);

            // CLONE
            const cloneExec = `not-jenkins-clone`;
            Logger.debug("Cloning repo... Command is : %s", cloneExec);
            await execute(cloneExec).catch(err => {
                Logger.debug("Clone failed... : %o ", err)
            });
            Logger.debug("Cloned.")

            // BUILD
            const commandBuild = `IMAGE_NAME=${imageName} not-jenkins-build`
            Logger.debug("Buidling image... Command is : %s", commandBuild);
            await execute(commandBuild);
            Logger.debug("Builded.")

            Logger.debug("Docker Username is : %s", await execute("echo $DOCKER_USER"))

            // PUSH
            const commandPush = `IMAGE_NAME=${imageName} not-jenkins-push`
            Logger.debug("Pushing to repo... Command is : %s", commandPush);
            await execute(commandPush);
            Logger.debug("Pushed.")


            // DEPLOY
            const commandDeploy = `IMAGE_NAME=${imageName} not-jenkins-deploy`
            Logger.debug("Deploy image... Command is : %s", commandDeploy);
            await execute(commandDeploy).catch(err => {
                Logger.error("Deploy is crying ... : %o", err);
            });
            Logger.debug("Deployed.")

            // CLEAN UP
            const commandCleanup = `
                rm -rf ~/not-jenkins
                docker rm $(docker container ls -a -q) || echo "We know about the running container..."
                docker image rm $(docker image ls -q) || echo "We know about the running container. But we freed space!"
            `;
            Logger.debug("Cleaning up... Command is : %s", commandCleanup);
            await execute(commandCleanup);
            Logger.debug("Cleaned.")

        }

        res.status(200).send();
        return
        if (token !== secretToken) {
            Logger.debug("Invalid token : Expected %s . Was %s", secretToken, token);

            res.status(401).json({
                status: 401,
                code: "Invalid token"
            });
        } else {
            Logger.debug("Valid token!");

            await responseSucess(callback_url);

            const command = `docker service update --image ${image_name} not_jenkins`
            Logger.debug("Executing command : %s", command);


            const result = await execute(command);

            Logger.debug("Result is : %o", result);

            res.json({
                status: 200,
            });


        }


    } catch (err) {
        Logger.error("Execute command failed! : %o", err);
        res.status(500).send();
        //responseFailed(callback_url);
    }
});

app.post('/thehempathy-backend', async function (req, res) {
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

    const {
        repo_name
    } = repository;

    const {
        tag
    } = push_data;

    Logger.debug("request on POST /thehempathy-backend, URL /thehempathy-backend");
    Logger.debug("Secret Token is %o", secretToken);

    Logger.debug("Query token is %o", token);


    const image_name = `${repo_name}:${tag}`;
    Logger.debug("Image name is repo_name is : %s", image_name);

    if (token !== secretToken) {
        res.status(401).json({
            status: 401,
            code: "Invalid token"
        });
    } else {
        try {


            await responseSucess(callback_url).catch(err => {
                Logger.error("Callback call failed! %o", err);
            });

            const command = `docker service update --image ${image_name} not_jenkins`

            const result = await execute(command);

            Logger.debug("Result is : %o", result);

            res.json({
                status: 200,
            });

        } catch (err) {
            Logger.info("Execute command failed! : %o", err);
            res.status(500).send();
            responseFailed(callback_url);
        }

    }


});

function responseSucess(callback_url) {
    Logger.debug("Sending positive response to callback!");

    return axios.post(callback_url, {
            "state": "success",
            "description": "No tests were done *THUMBS_UP*",
            "context": "Continuous integration by Not Jenkins!",
        })
        .then(function () {
            Logger.debug("Sent successfully!");
        }).catch(err => {
            Logger.error("Callback call failed! %o", err);
        });
}

function responseFailed(callback_url) {
    Logger.debug("Sending negative response to callback!");

    return axios.post(callback_url, {
            "state": "failed",
            "description": "No tests were done *THUMBS_UP*",
            "context": "Continuous integration by Not Jenkins!",
        })
        .then((res) => {
            Logger.debug("Sent successfully!");
        })
        .catch((error) => {
            Logger.error("Callback call failed! %o", err);

        });
}


app.post('/toto', async function (req, res) {

    return res.status(401).send();


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