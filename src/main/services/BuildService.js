const execute = require("../utils/execute");

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
        await execute.exec(commandBuild);
        Logger.debug("Builded.")

    } catch (err) {
        Logger.error("Build failed. Error : %o ", err);
        throw err;
    }
}

module.exports = {
    build: build
}