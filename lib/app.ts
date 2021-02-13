import * as express from "express";
import * as bodyParser from "body-parser";
import { Routes } from "./routes/authRoutes";
import * as mongoose from "mongoose";
import * as dotenv from 'dotenv';

// initialize configuration
dotenv.config({ path: __dirname + '/.env' })
class App {
    public app: express.Application;
    public route: Routes = new Routes();
    public mongoUrl: string = process.env.MONGO_URL;

    constructor() {
        this.app = express();
        this.config();
        this.route.routes(this.app);
        this.mongoSetup();

    }
    private config(): void {
        // support application/json type post data
        this.app.use(bodyParser.json());
        //support application/x-www-form-urlencoded post data
        this.app.use(bodyParser.urlencoded({ extended: false }));

    }

    private mongoSetup(): void {
        mongoose.connect(this.mongoUrl);
    }
}
export default new App().app;