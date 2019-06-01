const express = require('express'),
    router = express.Router();

const fs = require('fs');

router.route('/')

    .post(async function (req, res, next) {


        console.log("PERFORMING TEST ON TEST CONTROLLER");
        const body = req.body;
        const headers = req.headers;

        filePathBody = __dirname + '/test_data_body.txt';
        filePathHeader = __dirname + '/test_data_header.txt';

        console.log(`Body writed on ${filePathBody} `)
        console.log(body)
        console.log(`Headers written on ${filePathHeader}`)
        console.log(headers)

        fs.appendFile(filePathBody, JSON.stringify(body), function () {
            fs.appendFile(filePathHeader, JSON.stringify(headers), function () {
                res.end();
            });
        });
    });


module.exports = router;