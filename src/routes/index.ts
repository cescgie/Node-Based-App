import { NextFunction, Request, Response, Router } from "express";
import { BaseRoute } from "./route";

import * as mongoose from 'mongoose';

import {
    IUserDataToken
} from "@helpers/type";

// Library
import { Library } from "../helpers/library";

// Interface
import { IUser } from "@interfaces";
// Schema
import { userSchema } from "../schemas/index";
// Model
import { IUserModel } from "@models/user";
const User: mongoose.Model<IUserModel> = mongoose.model<IUserModel>("User", userSchema);

// Middleware
import { Middleware } from "../helpers/middleware";
const middleware = new Middleware();

/**
 * / route
 *
 * @class User
 */
export class IndexRoute extends BaseRoute {

    private library: Library = new Library();
    /**
     * Create the routes.
     *
     * @class IndexRoute
     * @method create
     * @static
     */
    public static create(router: Router) {
        //log
        console.log("[IndexRoute::create] Creating index route.");

        //add home page route
        router.get("/", middleware.checkToken, (req: Request, res: Response, next: NextFunction) => {
            new IndexRoute().index(req, res, next);
        });

        router.get("/login", middleware.checkToken, (req: Request, res: Response, next: NextFunction) => {
            new IndexRoute().login(req, res, next);
        });

        router.post("/callback", middleware.checkToken, (req: Request, res: Response, next: NextFunction) => {
            new IndexRoute().callback(req, res, next);
        });

        router.get("/logout", middleware.checkToken, (req: Request, res: Response, next: NextFunction) => {
            new IndexRoute().logout(req, res, next);
        });
    }

    /**
     * Constructor
     *
     * @class IndexRoute
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * The home page route.
     *
     * @class IndexRoute
     * @method index
     * @param req {Request} The express Request object.
     * @param res {Response} The express Response object.
     * @next {NextFunction} Execute the next method.
     */
    public index(req: Request, res: Response, next: NextFunction) {
        //set custom title
        this.title = "Home";

        //set message
        let options: Object = {
            "message": "Hello, world!"
        };

        //render template
        this.render(req, res, "index", options);
    }

    public login(req: Request, res: Response, next: NextFunction) {
        if (req.session.isAuthenticated) {
            res.redirect("/");
        } else {
            //set custom title
            this.title = "Login";

            //set message
            let options: Object = {
                "message": "Login"
            };

            //render template
            this.render(req, res, "login", options);
        }
    }

    public callback(req: Request, res: Response, next: NextFunction) {
        //set custom title
        this.title = "Login";

        const password = req.body.password;
        const email = req.body.email;

        User.findOne({ email: email }).then((user) => {
            if (!user || user === null) {
                let options = {
                    status: 200,
                    message: 'No user available'
                }
                this.render(req, res, "login", options);
            } else {
                if (!this.library.verifyPassword(password, user.password)) {
                    let options = {
                        success: false,
                        message: 'Auth failed'
                    };
                    this.render(req, res, "login", options);
                } else {
                    let user_data: IUserDataToken = {
                        _id: user._id,
                        role: user.role,
                        remember: true,
                        email: user.email
                    };
                    let token: string = this.library.generateToken(user_data);
                    // Set session data
                    req.session.token = token
                    req.session.isAuthenticated = true;
                    req.session.user = {
                        email: user.email
                    }

                    const returnTo = req.session.returnTo;
                    delete req.session.returnTo;
                    res.redirect(returnTo || "/");
                }
            }
        })
    }

    public logout(req: Request, res: Response, next: NextFunction) {
        req.session.destroy((err) => {
            if (err) {
                return console.log(err);
            }
            res.redirect('/');
        });
    }
}