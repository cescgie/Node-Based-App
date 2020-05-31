import * as express from "express";

//API
import { ApiUserRoute } from "./routes/api/user";

// Library
import { Library } from "./helpers/library";

const authRegistry = require('./auth-registry.json');

export class Auth {

    protected registry: Array<any>;
    protected error_response: any;
    public ApiUserRoute: ApiUserRoute = new ApiUserRoute();

    public library: Library = new Library();

    constructor() {
        this.registry = authRegistry.api;
    }

    authenticate(req: express.Request, res: any, next: express.NextFunction) {
        let authRule = this.registry.find((value: any, index: number, obj: any[]) => {
            let pattern = new RegExp(value.path, "g");
            return pattern.test(req.path) && value.method.toUpperCase() == req.method;
        });

        let allowUniversal = this.registry.find((value: any, index: number, obj: any[]) => {
            return value.path == "" && value.method == "";
        });

        if (allowUniversal && !authRule) {

            authRule = allowUniversal;

        } else if (!allowUniversal && !authRule) {

            this.error_response = {
                "status": 403,
                "message": "Not authorized"
            };
            res.json(this.error_response);

            return;
        }

        switch (authRule.level) {
            case "master":
                this.auth(req, res)
                    .then((jwt) => {
                        return this.master(req, res);
                    })
                    .then(() => next());
                break;

            case "admin":
                this.auth(req, res)
                    .then((jwt) => {
                        return this.admin(req, res);
                    })
                    .then(() => next());
                break;

            case "auth":
                this.auth(req, res).then(() => {
                    // console.log("user data", (<any>req).userData);
                    next()
                });
                break;

            case "unauth":
                next();
                break;
        }

    }

    private auth(req: express.Request, res: any): Promise<any> {

        return new Promise((resolve, reject) => {

            if (req.headers['authorization'] && req.headers['authorization'] !== null) {
                let headerAuth: any = req.headers['authorization'];

                this.library.verifyJWT(headerAuth).then((jwt) => {
                    if (!jwt) {
                        this.error_response = {
                            "status": 403,
                            "message": "Not authorized"
                        };
                        res.json(this.error_response);
                    } else {

                        let userID = jwt.body.sub;
                        let userRole = jwt.body.permissions;
                        let userEmail = jwt.body.adr || null;

                        (<any>req).userData = {
                            userID: userID,
                            userRole: userRole,
                            userEmail: userEmail
                        }

                        resolve(jwt);

                    }
                }).catch((err) => {
                    this.error_response = {
                        "status": 406,
                        "message": 'Signature verification failed'
                    };
                    res.json(this.error_response);
                })
            } else {
                this.error_response = {
                    "status": 403,
                    "message": "Not authorized"
                };
                res.json(this.error_response);
            }

        });

    }


    private master(req: express.Request, res: any): Promise<any> {
        return new Promise((resolve, reject) => {

            let userRole = (<any>req).userData.userRole;

            if (userRole == 1) {

                resolve();

            } else {
                this.error_response = {
                    "status": 403,
                    "message": "Not authorized",
                    "content": "Not master"
                };
                res.json(this.error_response);
            }

        });
    }

    private admin(req: express.Request, res: any): Promise<any> {
        return new Promise((resolve, reject) => {

            let userRole = (<any>req).userData.userRole;

            if (userRole == 1 || userRole == 2) {

                resolve();

            } else {
                this.error_response = {
                    "status": 403,
                    "message": "Not authorized",
                    "content": "Not admin"
                };
                res.json(this.error_response);
            }

        });
    }
}

