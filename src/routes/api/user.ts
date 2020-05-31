import { NextFunction, Request, Response, Router } from "express";
import { BaseRoute } from "../route";

import * as mongoose from 'mongoose';

// Interface
import { IUser } from "@interfaces";
import {
    IUserDataToken, IResponseAuth
} from "@helpers/type";
// Schema
import { userSchema } from "../../schemas/index";
// Model
import { IUserModel } from "@models/user";
const User: mongoose.Model<IUserModel> = mongoose.model<IUserModel>("User", userSchema);

import {
} from "@helpers/type";

// Library
import { Library } from "../../helpers/library";

import Joi = require("joi");
import { ObjectId } from "bson";

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

        // Create user
        router.post("/api/users", (req: Request, res: Response) => {
            new ApiUserRoute().create(req, res);
        });

        // Get user
        router.get("/api/users", (req: Request, res: Response) => {
            new ApiUserRoute().get(req, res);
        });

        // Update user
        router.put("/api/users", (req: Request, res: Response) => {
            new ApiUserRoute().update(req, res);
        });

        // Delete user
        router.delete("/api/users", (req: Request, res: Response) => {
            new ApiUserRoute().delete(req, res);
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
                            role: 1, // Master role
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

    /**
     * Method to create user
     * @param req body: email, password, firstname, lastname
     * @param res JWT token
     */
    public create(req: Request, res: Response) {
        const schema = Joi.object().keys({
            firstname: Joi.string().optional(),
            lastname: Joi.string().optional(),
            email: Joi.string().required(),
            password: Joi.string().required()
        });

        if (!this.library.joiValidate(res, schema, req.body)) {
            return;
        }

        let firstname = req.body.firstname || "";
        let lastname = req.body.lastname || "";
        let email = req.body.email;
        let password = req.body.password;

        let userData: IUser = {
            firstname: firstname,
            lastname: lastname,
            email: email,
            password: password,
            active: true, // Set for default to false. This will be properly used after implementing verify user via email
            role: 3 // Normal user role
        }

        // check if already registered
        User.findOne({ email: { $regex: email, $options: "i" } }).then((user) => {
            if (!user || user === null) {
                this.createUser(res, userData)
            } else {
                // Convert null-prototype object to a standard javascript Object
                user = JSON.parse(JSON.stringify(user));
                // Remove secret values by key before showing them in response auth
                delete user.password;
                delete user.token;
                delete user.role;

                let response: any = {
                    "status": 301,
                    "message": 'User already exists',
                    "content": user
                };
                res.send(response);
            }
        }).catch((err) => {
            let response: any = {
                "status": 404,
                "message": "Database error",
                "content": err
            };
            res.send(response);
        });
    }

    /**
    * Create user
    */
    createUser(res, userData: IUser) {
        /**
         * Hash email used as verify user token
         * This will be properly used to verify user with email + token
         */
        let verify_token: any = this.library.hashPassword(userData.email);
        userData['password'] = (userData.password) ? this.library.hashPassword(userData.password) : "";
        userData['token'] = verify_token;

        // save to DB
        let user_model = new User(userData)
        user_model.save((err, createdUser) => {
            if (err) {
                let response = {
                    "status": 402,
                    "message": "Database error",
                    "content": err
                };
                res.json(response);
            } else {
                let dataForToken: IUserDataToken = {
                    _id: createdUser._id,
                    role: createdUser.role,
                    email: createdUser.email
                }
                /**
                 * Generate auth token
                 * Auth token is used to authenticate user while signin or signup
                 * This token is not the same as verify user that is stored in DB user.token 
                 */
                let auth_token: any = this.library.generateToken(dataForToken);

                // Convert null-prototype object to a standard javascript Object
                createdUser = JSON.parse(JSON.stringify(createdUser));
                // Remove secret values by key before showing them in response auth
                delete createdUser.password;
                delete createdUser.token;
                delete createdUser.role;

                // Response contains token in order to enable user to directly signin after registering
                let response: IResponseAuth = {
                    status: 200,
                    message: 'User successfully created',
                    content: {
                        auth_token: auth_token,
                        user: createdUser
                    }
                }
                res.json(response);
            }
        })
    }

    /**
     * Method to get users (if sent param included _id or email or user, then get selected user(s))
     * @param req query: (email&/username&/_id) . If req.email/req.username/req._id empty, return all users
     * @param res {_id,createdAt,updatedAt,firstname,lastname,email,etc}
     */
    public get(req: Request, res: Response) {
        const schema = Joi.object().keys({
            email: Joi.string().optional(),
            emails: Joi.string().regex(/[,]*/).optional(),
            _id: Joi.string().optional(),
            _ids: Joi.string().regex(/[,]*/).optional(),
            skip: Joi.string().regex(/[\d]+/).optional(),
            limit: Joi.string().regex(/[\d]+/).optional()
        });

        if (!this.library.joiValidate(res, schema, req.query)) {
            return;
        }

        let QUERY: any = null;
        let MATCH: any = {};

        if (req.query._id && req.query._id !== 'null' && req.query._id !== undefined) {
            MATCH['_id'] = mongoose.Types.ObjectId(String(req.query._id))
        } else if (req.query._ids && req.query._ids !== 'null' && req.query._ids !== undefined) {
            let _ids: any = req.query._ids;
            _ids = _ids.split(',').map(i => mongoose.Types.ObjectId(i));
            MATCH['_id'] = { $in: _ids }
        }
        if (req.query.email && req.query.email !== 'null' && req.query.email !== undefined) {
            MATCH['email'] = { $regex: req.query.email, $options: "i" }
        } else if (req.query.emails && req.query.emails !== 'null' && req.query.emails !== undefined) {
            let emails: any = req.query.emails;
            emails = emails.split(',');
            MATCH['email'] = { $in: emails }
        }

        let SKIP: number = 0;
        let LIMIT: number = 1000;

        // Aggregation $skip & $limit
        if (req.query.skip && req.query.skip !== 'null' && req.query.skip !== undefined) {
            SKIP = Number(req.query.skip)
        }

        if (req.query.limit && req.query.limit !== 'null' && req.query.limit !== undefined && Number(req.query.limit) !== 0) {
            LIMIT = Number(req.query.limit)
        }

        QUERY = [
            {
                "$match": MATCH
            },
            {
                "$sort": { createdAt: -1 }
            },
            {
                "$limit": SKIP + LIMIT
            },
            {
                "$skip": SKIP
            }
        ]

        this.getUserByAggregation(QUERY).then((response) => {
            res.send(response);
        }).catch(err => {
            res.send(err);
        })

    }

    getUserByAggregation(QUERY: any): Promise<any> {
        return new Promise((resolve, reject) => {
            User.aggregate(
                QUERY, (err, result) => {
                    if (err) {
                        let options: any = {
                            "status": 404,
                            "message": "Database error",
                            "content": err
                        };
                        reject(options);
                    } else {
                        let users = [];
                        result.forEach((user) => {
                            // Convert null-prototype object to a standard javascript Object
                            user = JSON.parse(JSON.stringify(user));
                            // Remove secret values by key before showing them in response auth
                            delete user.password
                            delete user.token
                            delete user.role

                            users.push(user);
                        });

                        let options: any = {
                            status: 200,
                            count: users.length,
                            content: users
                        };
                        resolve(options);
                    }
                });
        })
    }

    /**
     * Method to update user data
     * @param req query: _id || email; body: props
     * @param res status
     */
    public update(req: Request, res: Response) {
        const schema = Joi.object().keys({
            email: Joi.string(),
            _id: Joi.string(),
        });

        if (!this.library.joiValidate(res, schema, req.query)) {
            return;
        }

        let email = req.query.email || null;
        let _id = req.query._id || null;

        let QUERY: any;
        if (email || _id) {
            if (email && email !== null && email !== undefined) {
                QUERY = {
                    email: email
                }
            } else if (_id && _id !== null && _id !== undefined) {
                QUERY = {
                    _id: new ObjectId(String(_id))
                }
            }
        } else {
            let response = {
                "status": 307,
                "message": "Query not complete"
            };
            res.json(response);
            return;
        }

        User.findOne(QUERY, {}, (err, user) => {
            if (err) {
                let response = {
                    "status": 309,
                    "message": "Database error",
                    "content": err
                };
                res.json(response);
            } else if (!user || user === null) {
                let response = {
                    "status": 308,
                    "message": "User not found"
                };
                res.json(response);
            } else {
                let arrayKey: any = [];

                for (let key in req.body) {
                    arrayKey.push(key);
                }

                // remove token, email from arrayKey to prevent update
                if (arrayKey.indexOf('email') !== -1) {
                    arrayKey.splice(arrayKey.indexOf('email'), 1);
                }
                if (arrayKey.indexOf('token') !== -1) {
                    arrayKey.splice(arrayKey.indexOf('token'), 1);
                }

                let data_toUpdate: any = {};
                // update only given data
                for (let i = 0; i < arrayKey.length; i++) {
                    // if password given, hash it
                    if (arrayKey[i] == 'password') {
                        data_toUpdate[arrayKey[i]] = this.library.hashPassword(req.body[arrayKey[i]]);
                    } else {
                        data_toUpdate[arrayKey[i]] = req.body[arrayKey[i]];
                    }
                }
                // update time
                data_toUpdate['updatedAt'] = new Date();

                user.set(data_toUpdate);
                user.save((err, updatedUser) => {
                    if (err) {
                        let response = {
                            "status": 402,
                            "message": "Database error",
                            "content": err
                        };
                        res.send(response);
                    } else {
                        // Convert null-prototype object to a standard javascript Object
                        updatedUser = JSON.parse(JSON.stringify(updatedUser));
                        // Remove secret values by key before showing them in response auth
                        delete updatedUser.password;
                        delete updatedUser.token;
                        delete updatedUser.role;

                        let response = {
                            "status": 200,
                            "message": 'User successfully updated',
                            "content": updatedUser
                        };
                        res.send(response);
                    }
                });
            }
        });
    }

    /**
     * Delete user
     * @param req query: _id || email
     * @param res status
     */
    public delete(req: Request, res: Response) {
        const schema = Joi.object().keys({
            _id: Joi.string(),
            email: Joi.string()
        });

        if (!this.library.joiValidate(res, schema, req.query)) {
            return;
        }

        let _id = req.query._id;
        let email = req.query.email;

        let QUERY: any;
        if (email || _id) {
            if (email && email !== null) {
                QUERY = {
                    email: email
                }
            } else if (_id && _id !== null) {
                QUERY = {
                    _id: _id
                }
            }
        } else {
            let response = {
                "status": 307,
                "message": "Query not complete"
            };
            res.json(response);
            return;
        }

        User.findOne(QUERY).then(result => {
            if (!result || result === null) {
                let response = {
                    "status": 302,
                    "message": "No user exists"
                };
                res.json(response);
            } else {
                User.findOne(QUERY).remove().exec((err, data) => {
                    if (err) {
                        let response = {
                            "status": 402,
                            "message": "Database error",
                            "content": err
                        };
                        res.json(response);
                    } else {
                        let response = {
                            "status": 200,
                            "message": "User successfully deleted"
                        };
                        res.json(response);
                    }
                });
            }
        });
    }
}