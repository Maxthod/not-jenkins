const app = require('../../main/server');

const chai = require('chai');
const chaiHttp = require('chai-http');
// Configure chai
chai.use(chaiHttp);
chai.should();
const assert = chai.assert;

const sinon = require("sinon");
const execute = require("../../main/utils/execute")

const githubUtil = require("../../main/utils/github");


const api_under_test = [{
        name: "Tiny",
        endpoint: "/tiny",
        datas: require("../datas/github-tiny-push-event-develop-branch"),
        repo: "git@github.com:thehempathy/tiny.git",
        workdir: "tmp_build",
        image: "thehempathy-tiny",
        version: "latest",
        service: "thehempathy_tiny"
    },

    {
        name: "Frontend React",
        endpoint: "/the-hempathy/frontend-react",
        datas: require("../datas/github-the-hempathy-frontend-react-push-event"),
        repo: "git@github.com:thehempathy/frontend-react.git",
        workdir: "tmp_build",
        image: "thehempathy-frontend-react",
        version: "latest",
        service: "thehempathy_frontend_react"
    },
    {
        name: "Backend Express",
        endpoint: "/the-hempathy/backend-express",
        datas: require("../datas/github-the-hempathy-backend-express-push-event"),
        repo: "git@github.com:thehempathy/backend-express.git",
        workdir: "tmp_build",
        image: "thehempathy-backend-express",
        version: "latest",
        service: "thehempathy_backend_express"
    },
    {
        name: "Not Jenkins",
        endpoint: "/not-jenkins",
        datas: require("../datas/github-not-jenkins-push-event"),
        repo: "git@github.com:Maxthod/not-jenkins.git",
        workdir: "tmp_build",
        image: "thehempathy-not-jenkins",
        version: "latest",
        service: "not_jenkins"
    }

]


describe("APIs", function () {

    api_under_test.forEach(API_OPTIONS => {
        describe(`API ${API_OPTIONS.name}`, function () {

            let methodStubbed = null;

            async function request(options) {
                const {
                    payload,
                    header
                } = options.datas;

                const request = chai.request(app)
                    .post(options.endpoint);

                Object.keys(header).forEach(key => {
                    request.set(key, header[key]);
                });
                //   .set('Content-Type', 'application/json')
                //   .set('user-agent', githubEvent.header['user-agent'])
                //   .set('x-hub-signature', githubEvent.header['x-hub-signature'])
                return await request.send(JSON.stringify(payload))
            }

            function assertPipeline(res, options) {
                res.should.have.status(200);

                assert.equal(methodStubbed.callCount, 5, "expect execute to be called 4 times, clone, build, deploy, cleanup");

                let expected = `REPO_URL="${options.repo}" WORKDDIR="${options.workdir}" not-jenkins-clone`
                assert.equal(methodStubbed.getCall(0).args[0], expected, "Param in execute wrong");

                expected = `IMAGE_NAME=${options.image} IMAGE_VERSION=${options.version} WORKDDIR=${options.workdir} not-jenkins-build`;
                assert.equal(methodStubbed.getCall(1).args[0], expected, "Param in execute wrong");

                expected = `IMAGE_NAME=${options.image} not-jenkins-push`
                assert.equal(methodStubbed.getCall(2).args[0], expected, "Param in execute wrong");

                expected = `WORKDDIR="${options.workdir}" not-jenkins-cleanup`
                assert.equal(methodStubbed.getCall(3).args[0], expected, "Param in execute wrong");

                expected = `IMAGE_NAME=${options.image}:${options.version} SERVICE_NAME=${options.service} not-jenkins-deploy`
                assert.equal(methodStubbed.getCall(4).args[0], expected, "Param in execute wrong");

            }

            beforeEach(function () {
                sinon.stub(execute, "exec");
                methodStubbed = execute.exec;

                sinon.spy(githubUtil, "isReqFromGithub");
                sinon.spy(githubUtil, "validGithubSecret");
                sinon.spy(githubUtil, "isCommitFromBranch");

            })

            afterEach(function () {
                sinon.restore()
            })

            describe(`POST ${API_OPTIONS.endpoint}`, () => {
                it("should handle develop push event", async () => {
                    const options = Object.assign({
                        repo: "git@github.com:thehempathy/tiny.git",
                        workdir: "tmp_build",
                        image: "thehempathy-tiny",
                        version: "latest",
                        service: "thehempathy_tiny"
                    }, API_OPTIONS)

                    const res = await request(options)
                    assertPipeline(res, options)
                });


                it("should handle release branch push event", async () => {
                    const options = Object.assign({
                        repo: "git@github.com:thehempathy/tiny.git",
                        workdir: "tmp_build",
                        image: "thehempathy-tiny",
                        version: "latest",
                        service: "thehempathy_tiny"
                    }, API_OPTIONS)

                    const res = await request(options)
                    assertPipeline(res, options)

                });

            });

        })
    })
})
