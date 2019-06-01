const express = require('express'),
    router = express.Router();

const BuildService = require('../services/BuildService');


router.post('/not-jenkins-development', async function (req, res) {
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
