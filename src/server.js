const express = require("express");
const app = express();
const axios = require('axios')
require("maxthod-logger").init();


app.use(express.json());

const PORT = process.env.PORT || 2000;
const TIME = process.env.TIME || 'time is not set';
Logger.info("TIME IS : %s", TIME);



async function execute(command) {
    const util = require('util');
    const exec = util.promisify(require('child_process').exec);

    const {
        stdout,
        stderr
    } = await exec(command);


    if (stderr) {
        throw stderr;
    }


    return stdout;
}



app.post('/not-jenkins', async function (req, res) {

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

    Logger.debug("request on /not-jenkins");
    Logger.debug("Secret Token is %o", secretToken);

    Logger.debug("Query token is %o", token);



    const {
        repo_name
    } = repository;

    const {
        tag
    } = push_data;

    const image_name = `${repo_name}:${tag}`;


    Logger.debug("Image name is repo_name is : %s", image_name);



    /*
    {
      "callback_url": "https://registry.hub.docker.com/u/svendowideit/testhook/hook/2141b5bi5i5b02bec211i4eeih0242eg11000a/",
      "push_data": {
        "images": [
            "27d47432a69bca5f2700e4dff7de0388ed65f9d3fb1ec645e2bc24c223dc1cc3",
            "51a9c7c1f8bb2fa19bcd09789a34e63f35abb80044bc10196e304f6634cc582c",
            "..."
        ],
        "pushed_at": 1.417566161e+09,
        "pusher": "trustedbuilder",
        "tag": "latest"
      },
      "repository": {
        "comment_count": 0,
        "date_created": 1.417494799e+09,
        "description": "",
        "dockerfile": "#\n# BUILD\u0009\u0009docker build -t svendowideit/apt-cacher .\n# RUN\u0009\u0009docker run -d -p 3142:3142 -name apt-cacher-run apt-cacher\n#\n# and then you can run containers with:\n# \u0009\u0009docker run -t -i -rm -e http_proxy http://192.168.1.2:3142/ debian bash\n#\nFROM\u0009\u0009ubuntu\n\n\nVOLUME\u0009\u0009[/var/cache/apt-cacher-ng]\nRUN\u0009\u0009apt-get update ; apt-get install -yq apt-cacher-ng\n\nEXPOSE \u0009\u00093142\nCMD\u0009\u0009chmod 777 /var/cache/apt-cacher-ng ; /etc/init.d/apt-cacher-ng start ; tail -f /var/log/apt-cacher-ng/*\n",
        "full_description": "Docker Hub based automated build from a GitHub repo",
        "is_official": false,
        "is_private": true,
        "is_trusted": true,
        "name": "testhook",
        "namespace": "svendowideit",
        "owner": "svendowideit",
        "repo_name": "svendowideit/testhook",
        "repo_url": "https://registry.hub.docker.com/u/svendowideit/testhook/",
        "star_count": 0,
        "status": "Active"
      }
    }
    */


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

function responseSucess(callback_url) {
    return axios.post(callback_url, {
        "state": "success",
        "description": "No tests were done *THUMBS_UP*",
        "context": "Continuous integration by Not Jenkins!",
    });
}

function responseFailed(callback_url) {
    axios.post(callback_url, {
            "state": "failed",
            "description": "No tests were done *THUMBS_UP*",
            "context": "Continuous integration by Not Jenkins!",
        })
        .then((res) => {
            console.log(`statusCode: ${res.statusCode}`)
            console.log(res)
        })
        .catch((error) => {
            console.error(error)
        });
}


app.post('/toto', async function (req, res) {

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
        repository,
        command_in
    } = body;

    Logger.debug("request on /info");
    Logger.debug("Secret Token is %o", secretToken);

    Logger.debug("Query token is %o", token);

    Logger.debug("Message is : %o", req.body);


    if (token !== secretToken) {
        res.status(401).json({
            status: 401,
            code: "Invalid token"
        });
    } else {
        try {
            const command = `${command_in}`

            const result = await execute(command);

            Logger.debug("Result is : %o", result);
            res.json({
                status: 200,
                data: result
            });



            axios.post(callback_url, {
                    "state": "success",
                    "description": "No were done *THUMBS_UP*",
                    "context": "Continuous integration by Not Jenkins!",
                })
                .then((res) => {
                    console.log(`statusCode: ${res.statusCode}`)
                    console.log(res)
                })
                .catch((error) => {
                    console.error(error)
                })




        } catch (err) {
            Logger.info("Execute command failed! : %o", err);
            res.status(500).send();
        }

    }


});



app.listen(PORT, function () {
    Logger.info("App started on port %s", PORT);
});