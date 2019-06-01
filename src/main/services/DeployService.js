const execute = require("../utils/execute");

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
        await execute.exec(commandDeploy);
        Logger.debug("Deployed.")
    } catch (err) {
        Logger.error("Deploy failed. Error : %o", err)
    }
}

module.exports = {
    deploy: deploy
}