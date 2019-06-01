const execute = require("../utils/execute");


module.exports = {
    clean: async function clean(workdir) {
        try {
            const commandCleanup = `WORKDDIR="${workdir}" not-jenkins-cleanup`;
            
            /*
            const commandCleanup = `
    rm -rf ${workdir}
    docker rm $(docker container ls -a -q) || echo "We know about the running container..."
    docker image rm $(docker image ls -q) || echo "We know about the running container. But we freed space!"
    `;
    */
            Logger.debug(`
    #####################################################
    ############ Cleaning up...  ###################
    ################# %s ##############################
    #####################################################
    `, commandCleanup);
            await execute.exec(commandCleanup);
            Logger.debug("Cleaned.")
        } catch (err) {
            Logger.error("Clean failed. Error : %o", err)
        }
    }

}