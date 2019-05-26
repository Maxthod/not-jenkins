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

app.get('/info', async function (req, res) {

    res.send("bitches and hoes hoessssss ");

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

        Logger.debug("request on /not-jenkins");
        Logger.debug("Secret Token is %o", secretToken);

        Logger.debug("Query token is %o", token);


        const {
            ref
        } = req.body;



        const {
            repo_name
        } = repository;

        const {
            tag
        } = push_data;

        const image_name = `${repo_name}:${tag}`;


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

            const command = `docker service update --image ${image_name} not_jenkins`
            Logger.debug("Executing command : %s", command);


            const result = await execute(command);

            Logger.debug("Result is : %o", result);

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



app.post('/not-jenkins-dev', async function (req, res) {
    try {
        const {
            query,
            body
        } = req;

        const secretToken = "shoubalou";

        const {
            token
        } = query;
        Logger.debug("request on %s", req.url);
        Logger.debug("Secret Token is %o", secretToken);
        Logger.debug("Query token is %o", token);

        Logger.debug("Hello from dev!");


        const {
            ref
        } = body;


        if (ref.indexOf('develop') > -1) {
            console.log("Going into development");

            const refarr = ref.replace("ref/", "").split("/");
            // const imageName = refarr.slice(2).join("/");
            const imageName = "huguesmcd/not-jenkins:latest";


            console.log(await execute("whoami"));
            console.log(await execute("cd"));
            console.log(await execute("pwd"));
            console.log(await execute("ls -l /root/.ssh/"));



            const cloneExec = `deploy`;

            Logger.debug("Cloning repo with command : %s", cloneExec);
            try {
                await execute(cloneExec);
            } catch (err) {
                Logger.debug("Clone failed... : %o ", err)
            }

            Logger.debug("Cloned repo.")



            const commandBuild = `
                set -e
                cd ~/not-jenkins
                docker build -t ${imageName} .
            `

            Logger.debug("Buidling image : %s", commandBuild);
            await execute(commandBuild);
            Logger.debug("Builded.")

            const {
                DOCKER_USER,
                DOCKER_PASSWORD
            } = process.env;


            const commandPush = `
                set -e
                if [ ! -f ~/.docker/config.json ] || ! grep -q "index.docker.io" ~/.docker/config.json; then 
                   docker login --username ${DOCKER_USER} <<< "$DOCKER_PASSWORD"
                fi
                docker push ${imageName}
            `


            Logger.debug("Pushing to repo : %s", commandPush);

            await execute(commandPush);
            Logger.debug("Pushed.")


            const commandDeploy = `
                docker service update --image ${imageName} not_jenkins || echo "Deploy is crying ..."
            `

            Logger.debug("Deploy image : %s", commandDeploy);
            await execute(commandDeploy).catch(err => {
                Logger.error("Deploy is crying ... : %o", err);
            });
            Logger.debug("Deployed.")


            const commandCleanup = `
                rm -rf ~/not-jenkins
                docker rm $(docker container ls -a -q) || echo "We know htere is fails..."
                docker image rm $(docker image ls -q) || echo "There we go more free space!"
            `


            Logger.debug("Cleaning up : %s", commandCleanup);
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

    Logger.debug("request on /not-jenkins");
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