

function getImageNameDockerhub(payload) {
    const repo_name = payload.repository.repo_name;

    const tag = payload.push_data.tag;

    return `${repo_name}:${tag}`;
}



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
