import * as express from "express";
import * as bodyParser from "body-parser";
import { Routes } from "./routes/authRoutes";
import * as mongoose from "mongoose";
import { RoleSchema } from "./models/roleModel";
import * as dotenv from 'dotenv';

// initialize configuration
dotenv.config()

//Create an instance of the role model
const Role = mongoose.model('Role', RoleSchema);
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
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true,
        };
        mongoose.connect(this.mongoUrl, options).then(() => {
            console.log("Successfully connected to MongoDB.");
           
        })
            .catch(err => {
                console.error("Connection error", err);
                process.exit();
            });
    }
}
export default new App().app;