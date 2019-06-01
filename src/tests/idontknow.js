const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../main/server');

// Configure chai
chai.use(chaiHttp);
chai.should();
const assert = chai.assert;

const sinon = require("sinon");
const execute = require("../main/utils/execute")

//const jest = require("jest");
//const executeMock = jest.genMockFromModule('../main/utils/execute.js');

afterEach(function(){
    console.log("indess after each is called")
    sinon.restore()
})

describe("Students", () => {
    describe("GET /time", () => {

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


        it("should stub execute", (done) => {


            sinon.stub(execute, "exec");
            const methodStubbed = execute.exec;

            chai.request(app)
                .get('/api/time')
                .end((err, res) => {

                    const TIME = process.env.TIME || 'time is not set';
                    console.log("time is ")
                    console.log(res.text);



                    assert.equal("12345", methodStubbed.getCall(0).args[0], "Param in execute wrong");
                     


                    assert.isOk(methodStubbed.calledOnce, "execute wasnt called once");



                    res.should.have.status(200);
                    res.text.should.be.a('string');
                    res.text.should.be.equals(TIME);

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