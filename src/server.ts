import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as logger from "morgan";
import * as path from "path";
import errorHandler = require("errorhandler");
import methodOverride = require("method-override");
import mongoose = require("mongoose");

import { IndexRoute } from "./routes/index";
import { ApiUserRoute } from "./routes/api/index";

const dotenv = require('dotenv');
const expressSession = require("express-session");
import * as cors from "cors";

/**
 * The server.
 *
 * @class Server
 */
export class Server {

    public app: express.Application;

    /**
     * Bootstrap the application.
     *
     * @class Server
     * @method bootstrap
     * @static
     * @return {ng.auto.IInjectorService} Returns the newly created injector for this app.
     */
    public static bootstrap(): Server {
        return new Server();
    }

    /**
     * Constructor.
     *
     * @class Server
     * @constructor
     */
    constructor() {
        //create expressjs application
        this.app = express();

        //configure application
        this.config();

        //connect with db
        this.mongoSetup();

        //add routes
        this.routes();

        //add api
        this.api();
    }

    /**
     * Create and return Router.
     *
     * @class Server
     * @method config
     * @return void
     */
    private routes() {
        let router: express.Router;
        router = express.Router();

        //IndexRoute
        IndexRoute.create(router);

        //use router middleware
        this.app.use(router);
    }

    /**
     * Create REST API routes
     *
     * @class Server
     * @method api
     */
    public api() {
        //empty for now
        let router: express.Router;
        router = express.Router();

        ApiUserRoute.create(router);

        //use router middleware
        this.app.use(router);
    }

    /**
     * Configure application
     *
     * @class Server
     * @method config
     */
    public config() {
        //load environment variables from .env into ENV (process.env).
        dotenv.config();

        // trust proxy setup
        this.app.set('trust proxy', true);

        // npm cors
        this.app.use(cors());

        //add static paths for assets
        this.app.use("/assets", express.static(path.join(__dirname, "public")));

        //configure pug
        this.app.set("views", path.join(__dirname, "views"));
        this.app.set("view engine", "pug");

        //mount logger
        this.app.use(logger("dev"));

        //mount json form parser
        this.app.use(bodyParser.json());

        //mount query string parser
        this.app.use(bodyParser.urlencoded({
            extended: true
        }));

        //mount cookie parker
        this.app.use(cookieParser("SECRET_GOES_HERE"));

        const session = {
            secret: "LoxodontaElephasMammuthusPalaeoloxodonPrimelephas",
            cookie: {},
            resave: false,
            saveUninitialized: true
        };

        if (this.app.get("env") === "production") {
            // Serve secure cookies, requires HTTPS
            session.cookie['secure'] = true;
        }

        // initialize the session
        this.app.use(expressSession(session));

        //mount override?
        this.app.use(methodOverride());

        // catch 404 and forward to error handler
        this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
            err.status = 404;
            next(err);
        });

        this.app.use((req, res, next) => {
            res.locals.isAuthenticated = req.session.isAuthenticated;
            res.locals.user = req.session.user
            next()
        })

        //error handling
        this.app.use(errorHandler());
    }

    private mongoSetup(): void {
        let mongoUrl = "mongodb://" + process.env.MONGO_USER + ":" + process.env.MONGO_PASSWORD + "@" + process.env.MONGO_HOST + ":" + process.env.MONGO_PORT + "/" + process.env.MONGO_DB;
        (<any>mongoose).Promise = global.Promise;

        let DBNAME = process.env.MONGO_DB;
        console.log(`TRYING to connect with database [\'${DBNAME}\']...`);

        mongoose.connect(mongoUrl, {
            useNewUrlParser: true, // Fix deprecated connection string parser 
            useUnifiedTopology: true, // Fix deprecated Server Discovery and Monitoring engine
            keepAlive: true // For long running applications
        });
        mongoose.connection.on("close", () => console.log(`CLOSE event on database [\'${DBNAME}\']!`));
        mongoose.connection.on("error", (error) => console.log(`ERROR event on database [\'${DBNAME}\']!`, error.message));
        mongoose.connection.on("connected", () => console.log(`CONNECTED with database [\'${DBNAME}\']!`));
        mongoose.connection.on("disconnected", () => console.log(`DISCONNECTED with database [\'${DBNAME}\']!`));

        // If the Node process ends, ex. catches ctrl+c event, close the Mongoose connection. 
        process.on('SIGINT', () => {
            mongoose.connection.close(() => {
                console.log(`DISCONNECTED database [\'${DBNAME}\'] through app termination after catching ctrl+c event`);
                process.exit(0);
            });
        });

        // catches "kill pid" (for example: nodemon restart)
        process.on('SIGUSR1', () => {
            mongoose.connection.close(() => {
                console.log(`DISCONNECTED database [\'${DBNAME}\'] through app termination after catching "kill pid" event (for example: nodemon restart)`);
                process.exit(0);
            });
        });

    }
}
