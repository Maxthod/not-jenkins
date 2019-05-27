const express = require("express");
const app = express();
const axios = require('axios')
const exec = require('child_process').exec
const crypto = require('crypto')

require("maxthod-logger").init();


app.use(express.json());

const PORT = process.env.PORT || 2000;
const TIME = process.env.TIME || 'time is not set';
Logger.info("TIME IS : %s", TIME);


async function execute(command) {
    const util = require('util');
    const execPromisify = util.promisify(exec);

    Logger.debug("Execute command ... %s", command)
    try {
        const {
            stdout,
            stderr
        } = await execPromisify(command);


        Logger.debug(`stdout : 
        %s`, stdout);
        Logger.debug(`stderr : 
        %s`, stderr);

        return stdout;

    } catch (err) {
        Logger.error("Execute failed. Error : %o", err)
        throw err;
    }

}


function getImageNameDockerhub(payload) {
    const repo_name = payload.repository.repo_name;

    const tag = payload.push_data.tag;

    return `${repo_name}:${tag}`;
}


function decodeGitHub(payload) {
    return {
        imageName: getImageNameGithub(payload),
        ssh_url: payload.repository.ssh_url
    }
}


function getImageNameGithub(payload) {
    return "huguesmcd/not-jenkins:latest"
}


app.get('/info', async function (req, res) {

    res.send("Bouhou ");

});

function isReqFromGithub(req) {
    return req.headers['user-agent'].includes('GitHub-Hookshot');
}

// Verification function to check if it is actually GitHub who is POSTing here
function verifyGitHub(req, webhook_secret) {
    if (!isReqFromGithub(req)) {
        return false;
    }
    // Compare their hmac signature to our hmac signature
    // (hmac = hash-based message authentication code)
    const theirSignature = req.headers['x-hub-signature'];
    const payload = JSON.stringify(req.body);
    const secret = webhook_secret;
    const ourSignature = `sha1=${crypto.createHmac('sha1', secret).update(payload).digest('hex')}`;
    return crypto.timingSafeEqual(Buffer.from(theirSignature), Buffer.from(ourSignature));
};

function isCommitFromBranch(req, branchname) {
    const ref = req && req.body ? req.body.ref : undefined;

    return ref && ref.indexOf(branchname) > -1;
}

// CLONE
async function clone(repo_url, workdir) {
    try {
        const cloneExec = `REPO_URL="${repo_url}" WORKDDIR="${workdir}" not-jenkins-clone`;
        Logger.debug("Cloning repo... Command is : %s", cloneExec);
        await execute(cloneExec);
        Logger.debug("Cloned.")

    } catch (err) {
        Logger.error("Clone failed! Error : %o", err);
        throw err;
    }
}

// BUILD
async function build(imageName, WORKDDIR) {
    try {
        Logger.debug("Building ... ")
        const commandBuild = `IMAGE_NAME=${imageName} WORKDDIR=${WORKDDIR}  not-jenkins-build`
        Logger.debug(`
#####################################################
############ Building image...  ###################
################# %s ##############################
#####################################################
`, commandBuild);
        await execute(commandBuild);
        Logger.debug("Builded.")

    } catch (err) {
        Logger.error("Build failed. Error : %o ", err);
        throw err;
    }
}
async function printDockerUser() {
    try {
        Logger.debug("Docker user is : %s", await execute("echo $DOCKER_USER"));
    } catch (err) {
        Logger.error("Login failed.")
        throw err;
    }

}

// PUSH
async function push(imageName) {
    try {

        const commandPush = `IMAGE_NAME=${imageName} not-jenkins-push`
        Logger.debug(`
    #####################################################
    ############ Pushing to repo...  ###################
    ################# %s ##############################
    #####################################################
    `, commandPush);
        await execute(commandPush);
        Logger.debug("Pushed.")

    } catch (err) {
        Logger.error("Push failed. Error : %o", err);
        throw err;
    }
}
// DEPLOY
async function deploy(imageName, SERVICE_NAME) {
    try {
        const commandDeploy = `IMAGE_NAME=${imageName} SERVICE_NAME=${SERVICE_NAME} not-jenkins-deploy`
        Logger.debug(`
#####################################################
############ Deploy image...  ###################
################# %s ##############################
#####################################################
`, commandDeploy);
        await execute(commandDeploy);
        Logger.debug("Deployed.")
    } catch (err) {
        Logger.error("Deploy failed. Error : %o", err)
    }
}

// CLEAN UP
async function clean(workdir) {
    try {
        const commandCleanup = `
rm -rf ${workdir}
docker rm $(docker container ls -a -q) || echo "We know about the running container..."
docker image rm $(docker image ls -q) || echo "We know about the running container. But we freed space!"
`;
        Logger.debug(`
#####################################################
############ Cleaning up...  ###################
################# %s ##############################
#####################################################
`, commandCleanup);
        await execute(commandCleanup);
        Logger.debug("Cleaned.")
    } catch (err) {
        Logger.error("Clean failed. Error : %o", err)
    }
}








app.post('/tiny', async function (req, res, next) {
    if (isReqFromGithub(req)) {
        Logger.debug("Request is from github");

        Logger.silly(`
    ##################################################################################################################################
    ##################################################################################################################################
    ############################################# DEPLOYMENT THE HEMPATHY BACKEND EXPRESS ############################################
    ##################################################################################################################################
    ##################################################################################################################################
    `);

        try {
            const ENV_SECRET = process.env.THEHEMPATHY_TINY_GITHUB_SECRET || "changeme";

            if (!verifyGitHub(req, ENV_SECRET)) {
                Logger.debug("Request failed GitHub validation!");

                next({
                    status: 401,
                    code: "Invalid token"
                });
            } else {
                const {
                    body
                } = req;

                const WORKDDIR = "thehempathy_tiny";
                const SERVICE_NAME = "thehempathy_tiny";
                const IMAGE_NAME = process.env.THE_HEMPATHY_TINY_IMAGE_NAME || "thehempathy-tiny:latest";


                if (!isCommitFromBranch(req, "develop")) {

                    Logger.debug("Request is not for push event on branch develop. Returning status 200");

                    return res.sendStatus(200);
                } else {
                    Logger.silly(`
                ##################################################################################################################################
                ##################################################################################################################################
                ############################################# DEPLOYING INTO DEVELOPMENT ENVIRONMENT #############################################
                ##################################################################################################################################
                ##################################################################################################################################
                `);

                    const {
                        ssh_url
                    } = decodeGitHub(body);

                    await clone(ssh_url, WORKDDIR);

                    await build(IMAGE_NAME, WORKDDIR);

                    await deploy(IMAGE_NAME, SERVICE_NAME);

                    return res.sendStatus(200);

                    await clean(WORKDDIR);

                }


            }
        } catch (err) {
            Logger.error("Execute command failed! : %o", err);
            next({
                status: 500,
                message: "Internal error"
            })
        }
    } else {
        next({
            status: 400,
            code: "method_not_implemented"
        });
    }
});











app.post('/backend-express', async function (req, res, next) {
    Logger.debug(`
    ##################################################################################################################################
    ##################################################################################################################################
    ############################################# DEPLOYMENT THE HEMPATHY BACKEND EXPRESS ############################################
    ##################################################################################################################################
    ##################################################################################################################################
    `);

    try {
        const ENV_SECRET = process.env.THEHEMPATHY_BACKEND_EXPRESS_GITHUB_SECRET || "changeme";

        if (!verifyGitHub(req, ENV_SECRET)) {
            Logger.debug("Request failed GitHub validation!");

            next({
                status: 401,
                code: "Invalid token"
            });
        } else {
            const {
                body
            } = req;

            const WORKDDIR = "thehempathy_backend_express";
            const SERVICE_NAME = "thehempathy_backend_express";
            const IMAGE_NAME = "thehempathy-backend-express:latest";

            if (isReqFromGithub(req)) {
                Logger.debug("Request is from github");

                if (!isCommitFromBranch(req, "develop")) {

                    Logger.debug("Request is not for push event on branch develop. Returning status 200");

                    return res.sendStatus(200);
                } else {
                    Logger.debug(`
                ##################################################################################################################################
                ##################################################################################################################################
                ############################################# DEPLOYING INTO DEVELOPMENT ENVIRONMENT #############################################
                ##################################################################################################################################
                ##################################################################################################################################
                `);

                    const {
                        ssh_url
                    } = decodeGitHub(body);

                    await clone(ssh_url, WORKDDIR);

                    await build(IMAGE_NAME, WORKDDIR);

                    await deploy(IMAGE_NAME, SERVICE_NAME);

                    return res.sendStatus(200);

                    await clean(WORKDDIR);


                }


            } else {
                next({
                    status: 400,
                    code: "method_not_implemented"
                })
            }


        }


    } catch (err) {
        Logger.error("Execute command failed! : %o", err);
        next({
            status: 500,
            message: "Internal error"
        })
    }

    return;





    try {
        const {
            query,
            body
        } = req;

        const secretToken = process.env_TOKEN_THEHEMPATHY_BACKEND_EXPRESS;

        const WORKDDIR = "thehempathy_backend_express";
        const SERVICE_NAME = "thehempathy_backend_express"

        const {
            token
        } = query;

        const {
            ref,
        } = body;

        if (token !== secretToken) {
            Logger.debug("Invalid token : Expected %s . Was %s", secretToken, token);

            next({
                status: 401,
                code: "Invalid token"
            });
        } else if (ref.indexOf('develop') > -1) {
            Logger.debug(`
            ##################################################################################################################################
            ##################################################################################################################################
            ############################################# DEPLOYING INTO DEVELOPMENT ENVIRONMENT #############################################
            ##################################################################################################################################
            ##################################################################################################################################
            `);

            const {
                repo_url,
                imageName
            } = decodeGitHub(body);


            // CLONE
            const cloneExec = `REPO_URL=${repo_url} WORKDDIR=${WORKDDIR} not-jenkins-clone`;
            Logger.debug("Cloning repo... Command is : %s", cloneExec);
            await execute(cloneExec);
            Logger.debug("Cloned.")

            // BUILD
            const commandBuild = `IMAGE_NAME=${imageName} WORKDDIR=${WORKDDIR}  not-jenkins-build`
            Logger.debug(`
            #####################################################
            ############ Building image...  ###################
            ################# %s ##############################
            #####################################################
`, commandBuild);
            await execute(commandBuild);
            Logger.debug("Builded.")

            Logger.debug("Docker Username is : %s", await execute("echo $DOCKER_USER"))

            // PUSH
            const commandPush = `IMAGE_NAME=${imageName} not-jenkins-push`
            Logger.debug(`
            #####################################################
            ############ Pushing to repo...  ###################
            ################# %s ##############################
            #####################################################
            `, commandPush);
            await execute(commandPush);
            Logger.debug("Pushed.")


            // DEPLOY
            const commandDeploy = `IMAGE_NAME=${imageName} SERVICE_NAME=${SERVICE_NAME} not-jenkins-deploy`
            Logger.debug(`
            #####################################################
            ############ Deploy image...  ###################
            ################# %s ##############################
            #####################################################
            `, commandDeploy);
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
            Logger.debug(`
            #####################################################
            ############ Cleaning up...  ###################
            ################# %s ##############################
            #####################################################
            `, commandCleanup);
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


app.post('/not-jenkins-development', async function (req, res) {
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
            ##################################################################################################################################
            ##################################################################################################################################
            ############################################# DEPLOYING INTO DEVELOPMENT ENVIRONMENT #############################################
            ##################################################################################################################################
            ##################################################################################################################################
            `);

            const imageName = getImageNameGithub(body);

            // CLONE
            const cloneExec = `not-jenkins-clone`;
            Logger.debug("Cloning repo... Command is : %s", cloneExec);
            await execute(cloneExec);
            Logger.debug("Cloned.")

            // BUILD
            const commandBuild = `IMAGE_NAME=${imageName} not-jenkins-build`

            Logger.debug(`
            #####################################################
            ############ Buidling image...  ###################
            ################# %s ##############################
            #####################################################
`, commandBuild);
            await execute(commandBuild);
            Logger.debug("Builded.")

            Logger.debug("Docker Username is : %s", await execute("echo $DOCKER_USER"))

            // PUSH
            const commandPush = `IMAGE_NAME=${imageName} not-jenkins-push`
            Logger.debug(`
            #####################################################
            ############ Pushing to repo...  ###################
            ################# %s ##############################
            #####################################################
            `, commandPush);
            await execute(commandPush);
            Logger.debug("Pushed.")


            // DEPLOY
            const commandDeploy = `IMAGE_NAME=${imageName} not-jenkins-deploy`
            Logger.debug(`
            #####################################################
            ############ Deploy image...  ###################
            ################# %s ##############################
            #####################################################
            `, commandDeploy);
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
            Logger.debug(`
            #####################################################
            ############ Cleaning up...  ###################
            ################# %s ##############################
            #####################################################
            `, commandCleanup);
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












/*
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


        
        Logger.debug("request POST on /not-jenkins, jte jure from %s", req.protocol + '://' + req.get('host') + req.originalUrl);
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
*/