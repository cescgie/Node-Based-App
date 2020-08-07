import { NextFunction, Request, Response } from "express";

const dotenv = require('dotenv');
dotenv.config();

import { Library } from "./library";

export class Middleware {
    protected error_response: any;
    public library: Library = new Library();

    constructor() {
    }

    checkToken = (req: Request, res: Response, next: NextFunction) => {
        if (req.session.token) {
            let token: any = 'Bearer ' + req.session.token
            this.library.verifyJWT(token).then(response => {
                next();
            }).catch(err => {
                let options = {
                    success: false,
                    title: 'Login',
                    message: 'Token is not valid',
                    content: err
                };
                res.render("login", options);
            })
        } else {
            next();
        }
    }

    private checkGroup(req: Request, res: any): Promise<any> {
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

    unauth = (req: Request, res: any, next: NextFunction) => {
        next();
    }

    auth = (req: Request, res: any, next: NextFunction) => {
        this.checkGroup(req, res).then(() => {
            next();
        })
    }

    master = (req: Request, res: any, next: NextFunction) => {
        this.checkGroup(req, res).then(() => {
            // console.log("user data", (<any>req).userData);
            let userRole = (<any>req).userData.userRole;
            if (userRole == 1) {
                next();
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

    admin = (req: Request, res: any, next: NextFunction) => {
        this.checkGroup(req, res).then(() => {
            let userRole = (<any>req).userData.userRole;
            if (userRole == 1 || userRole == 2) {
                next();
            } else {
                this.error_response = {
                    "status": 403,
                    "message": "Not authorized",
                    "content": "Not admin"
                };
                res.json(this.error_response);
            }
        })
    }
}
