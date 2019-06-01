const sinon = require("sinon")






const chai = require('chai');
const chaiHttp = require('chai-http');

// Configure chai
chai.use(chaiHttp);
chai.should();
const assert = chai.assert;


const app = require('./undertesst');
const api = require("./api");

beforeEach(function () {
    sinon.restore();
});


describe("Students", () => {
    describe("GET /time", () => {
        it("should stub", async () => {

            sinon.stub(api, "get").returns("oh oh");

            const res = await app.fct1();

            console.log(res);


            assert.isOk(api.get.calledOnce, "fct1 was never called");
            assert.equal("oh oh", res);


        });


        it("should spy!", async () => {


            sinon.spy(app, "fct1");

            const res = await app.fct1();

            console.log(res);


            assert.isOk(app.fct1.calledOnce, "fct1 was never called");

            assert.equal("uh oh", res);


        });

    });
});