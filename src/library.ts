const dotenv = require('dotenv');
dotenv.load();

const passwordHash = require('password-hash');
const nJwt = require('njwt');

import {
    IUserDataToken, IJWTClaim
} from "@helpers/type";

export class Library {
    /**
     * To hash password
     * Source: https://github.com/davidwood/node-password-hash
     * @param password 
     */
    hashPassword(password: string) {
        /**
         * passwordHash.generate(password) : generate
         * passwordHash.verify('right_password', hashedPassword); // true
         * passwordHash.verify('wrong_password', hashedPassword); // false
         * passwordHash.isHashed('right_password'); // false
         * passwordHash.isHashed(hashedPassword); // true
         */
        let hashedPassword: string = passwordHash.generate(password);

        return hashedPassword;
    }

    /**
     * Verify password
     * @param password 
     * @param DBPassword 
     */
    verifyPassword(password: string, DBPassword: string) {
        let verify: boolean = passwordHash.verify(password, DBPassword);
        if (password === DBPassword) {
            verify = true;
        }
        return verify;
    }

    /**
    * generate token
    * @param user_data  
    */
    generateToken(user_data: IUserDataToken) {
        let claims: IJWTClaim = {
            sub: user_data._id,
            iss: process.env.APP_HOST,
            permissions: user_data.role,
            adr: user_data.email,
            tbr: user_data['origin']
        }
        let jwt = nJwt.create(claims, process.env.APP_SECRET);

        let d = new Date();
        /**
         * If remember me true then set token for one month
         * else set token for one day
        */
        if (user_data.remember == true || user_data.remember == 'true' || user_data.remember == 1) {
            d.setMonth(d.getMonth() + 1);
        } else {
            d.setDate(d.getDate() + 1);
        }
        jwt.setExpiration(d.getTime() * 1000);

        let token = jwt.compact();

        return token;
    }

    /**
     * Verify JWT
     * @param headerAuth 
     * return jwt header & body in json
     */
    public verifyJWT(headerAuth: string): Promise<any> {
        /**
         * get token from headerAuth
         * check if token valid with
         */
        let getToken: any = headerAuth.split(' ');

        // store & use sign key in DB

        // verify token
        return new Promise((resolve, reject) => {
            nJwt.verify(getToken[1], process.env.APP_SECRET, (err, token) => {
                if (err) {
                    reject(err);
                } else {
                    /**
                     * Check expired
                     * Check issue
                     */
                    let today = new Date();
                    let exp = new Date(token.body.exp)
                    // check if exp bigger then today
                    if (exp.getTime() < today.getTime()) {
                        // console.log('expired')
                        reject(err);
                    } else {
                        // console.log('valid')

                        // check if issuer is correct
                        let iss = token.body.iss
                        if (process.env.APP_HOST !== iss) {
                            // console.log('false issuer')
                            reject(err);
                        } else {
                            // console.log('correct issuer')
                            resolve(token);
                        }
                    }
                }
            });
        });
    }
}