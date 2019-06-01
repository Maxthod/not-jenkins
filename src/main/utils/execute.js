const execPromisify = require('util').promisify(require('child_process').exec);

module.exports = {
    exec: async function execute(command) {

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
}



