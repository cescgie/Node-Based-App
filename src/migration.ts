import "mocha";

//require chai and use should() assertions
let chai = require("chai");
let chaiHttp = require('chai-http');
let should = chai.should();
chai.use(chaiHttp);

//load environment variables from .env into ENV (process.env).
const dotenv = require('dotenv');
dotenv.config();

let token = process.env.API_AUTH_TOKEN;
let host = process.env.APP_HOST;
let email = process.env.ADMIN_EMAIL;
let password = process.env.ADMIN_PASSWORD;

var createAdminUser = () => {
    describe("Create Admin User", () => {
        it("Create Admin User", (done) => {
            let data: any = {
                email: email,
                password: password
            }
            chai.request(host)
                .post('/api/users/migration?token=' + token)
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .set('Accept', 'application/json')
                .send(data)
                .end((err, res) => {
                    res.body.should.have.status(200);
                    done();
                })
        });
    });
}

createAdminUser();