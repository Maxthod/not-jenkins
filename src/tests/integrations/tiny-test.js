const app = require('../../main/server');


const chai = require('chai');
const chaiHttp = require('chai-http');
// Configure chai
chai.use(chaiHttp);
chai.should();
const assert = chai.assert;

const sinon = require("sinon");
const execute = require("../../main/utils/execute")

const {
    payload,
    header
} = require("../datas/github-tiny-push-event");

const githubUtil = require("../../main/utils/github");
//const jest = require("jest");
//const executeMock = jest.genMockFromModule('../main/utils/execute.js');


describe("GitHub hooks", () => {

    let methodStubbed = null;
    beforeEach(function () {
        sinon.stub(execute, "exec");
        methodStubbed = execute.exec;
    })

    afterEach(function () {
        sinon.restore()
    })



    describe("POST /tiny", () => {

        it.skip("should return time variable!", (done) => {
            chai.request(app)
                .get('/api/time')
                .end((err, res) => {

                    const TIME = process.env.TIME || 'time is not set';
                    console.log("time is ")
                    console.log(res.text);
                    res.should.have.status(200);
                    res.text.should.be.a('string');
                    res.text.should.be.equals(TIME);

                    done();
                });
        });

        it("should call execute with right variable", (done) => {

            sinon.spy(githubUtil, "isReqFromGithub");
            sinon.spy(githubUtil, "validGithubSecret");
            sinon.spy(githubUtil, "isCommitFromBranch");

            const request = chai.request(app)
                .post('/tiny');

            Object.keys(header).forEach(key => {
                request.set(key, header[key]);
            });


            //   .set('Content-Type', 'application/json')
            //   .set('user-agent', githubEvent.header['user-agent'])
            //   .set('x-hub-signature', githubEvent.header['x-hub-signature'])
            request.send(JSON.stringify(payload))
                .end((err, res) => {


                    //                    assert.equal(payload, githubUtil.isReqFromGithub.getCall(0).args[0], "GitHub event is not equals");


                    assert.equal(methodStubbed.callCount, 4, "expect execute to be called 4 times, clone, build, deploy, cleanup");

                    let expected = `REPO_URL="git@github.com:thehempathy/tiny.git" WORKDDIR="thehempathy_tiny" not-jenkins-clone`
                    assert.equal(methodStubbed.getCall(0).args[0], expected, "Param in execute wrong");

                    expected = `IMAGE_NAME=thehempathy-tiny:latest WORKDDIR=thehempathy_tiny  not-jenkins-build`;
                    assert.equal(methodStubbed.getCall(1).args[0], expected, "Param in execute wrong");


                    expected = `IMAGE_NAME=thehempathy-tiny:latest SERVICE_NAME=thehempathy_tiny not-jenkins-deploy`
                    assert.equal(methodStubbed.getCall(2).args[0], expected, "Param in execute wrong");

                    expected = `WORKDDIR="thehempathy_tiny" not-jenkins-cleanup`
                    assert.equal(methodStubbed.getCall(3).args[0], expected, "Param in execute wrong");


                    res.should.have.status(200);

                    done();
                });
        });

        return;

        // Test to get all students record
        it("should get all students record", (done) => {
            chai.request(app)
                .get('/')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    done();
                });
        });
        // Test to get single student record
        it("should get a single student record", (done) => {
            const id = 1;
            chai.request(app)
                .get(`/${id}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    done();
                });
        });

        // Test to get single student record
        it("should not get a single student record", (done) => {
            const id = 5;
            chai.request(app)
                .get(`/${id}`)
                .end((err, res) => {
                    res.should.have.status(404);
                    done();
                });
        });
    });
});