const execute = require("../utils/execute");

// CLONE
async function clone(repo_url, workdir) {
    try {
        const cloneExec = `REPO_URL="${repo_url}" WORKDDIR="${workdir}" not-jenkins-clone`;
        Logger.debug("Cloning repo... Command is : %s", cloneExec);
        await execute.exec(cloneExec);
        Logger.debug("Cloned.")

    } catch (err) {
        Logger.error("Clone failed! Error : %o", err);
        throw err;
    }
}
module.exports = {
    clone: clone
}