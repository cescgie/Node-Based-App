import { NextFunction, Request, Response } from "express";

const dotenv = require('dotenv');
dotenv.config();

import { Library } from "./library";

let checkToken = (req: Request, res: Response, next: NextFunction) => {
    if (req.session.token) {
        let token: any = 'Bearer ' + req.session.token
        new Library().verifyJWT(token).then(response => {
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

module.exports = {
    checkToken: checkToken
}