import { NextFunction, Request, Response, Router } from "express";
import { BaseRoute } from "../route";

import * as mongoose from 'mongoose';

// Interface
import { IUser } from "@interfaces";
// Schema
import { userSchema } from "../../schemas/index";
// Model
import { IUserModel } from "@models/user";
const User: mongoose.Model<IUserModel> = mongoose.model<IUserModel>("User", userSchema);

import {
} from "@helpers/type";

// Library
import { Library } from "../../helpers/library";
/**
 * / route
 *
 * @class User
 */
export class ApiUserRoute extends BaseRoute {
    private library: Library = new Library();
    /**
     * Create the routes.
     *
     * @class ApiUserRoute
     * @method create
     * @static
     */
    public static create(router: Router) {
        //log
        console.log("[ApiUserRoute::create] Creating api user route.");

        router.post("/api/user/migration", (req: Request, res: Response, next: NextFunction) => {
            new ApiUserRoute().migration(req, res, next);
        });
    }

    /**
     * 
     * Constructor
     *
     * @class ApiUserRoute
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * The home page route.
     *
     * @class ApiUserRoute
     * @method index
     * @param req {Request} The express Request object.
     * @param res {Response} The express Response object.
     * @next {NextFunction} Execute the next method.
     */
    public migration(req: Request, res: Response, next: NextFunction) {
        let token = req.query.token;
        if (token && token === process.env.API_AUTH_TOKEN) {
            User.findOne().then(user => {
                if (user && user !== null) {
                    let option = {
                        status: 200,
                        message: 'User already exists'
                    }
                    res.send(option)
                } else {
                    if ((req.body.username || req.body.email) && req.body.password) {
                        let user_data: IUser = {
                            username: req.body.username,
                            email: req.body.email,
                            token: null,
                            active: true,
                            password: this.library.hashPassword(req.body.password),
                            updatedAt: new Date()
                        }
                        // save to DB
                        let user_model = new User(user_data)
                        user_model.save((err, createdUser) => {
                            if (err) {
                                let option = {
                                    status: 402,
                                    message: "Database error"
                                };
                                res.json(option);
                            } else {
                                let option = {
                                    status: 200,
                                    message: 'Migration success',
                                    content: createdUser
                                }
                                res.send(option)
                            }
                        })
                    } else {
                        let options: any = {
                            "code": 308,
                            "message": "Uncompleted request data"
                        };
                        res.send(options);
                    }
                }
            }).catch(err => {
                res.send(err)
            })
        } else {
            let options: any = {
                "code": 401,
                "message": "Unmatched token!"
            };
            res.send(options);
        }

    }
}