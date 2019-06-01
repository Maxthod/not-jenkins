

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

        if (!validGithubSecret(req, ENV_SECRET)) {
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