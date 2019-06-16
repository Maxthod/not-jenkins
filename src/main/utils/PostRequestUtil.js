const Helper = require("./Helper");

const Utils = {

    isReqFromPost: function (req) {
        return req.headers['user-agent'].includes('Post-Hookshot');
    },

    // Verification function to check if it is actually GitHub who is POSTing here
    validPostSecret: function (req, webhook_secret) {
        if (!Utils.isReqFromPost(req)) {
            return false;
        }
        return Helper.validPostSecret(req, webhook_secret);
    },
}

module.exports = Utils;