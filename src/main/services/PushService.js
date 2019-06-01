const execute = require("../utils/execute");


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
        await execute.exec(commandPush);
        Logger.debug("Pushed.")

    } catch (err) {
        Logger.error("Push failed. Error : %o", err);
        throw err;
    }
}
module.exports = {
    push: push
}