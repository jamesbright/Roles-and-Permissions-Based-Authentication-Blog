import * as express from "express";
import * as bodyParser from "body-parser";
import * as  cors from "cors";
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
        // set up cors
        const corsOptions = {
            origin: "http://localhost:3000"
        };
        this.app.use(cors(corsOptions));

        // support application/json type post data
        this.app.use(bodyParser.json());
        //support application/x-www-form-urlencoded post data
        this.app.use(bodyParser.urlencoded({ extended: false }));

    }

    private async initializeRoles() {
        //count number of roles in Role collection
        const roleCount = await Role.countDocuments()
        // if roles not yet populated, create new roles
        if (roleCount == 0) {
            // array of assignable roles
            const roles: string[] = ["user", "admin", "superAdmin"];
            roles.forEach(role => {
                new Role({
                    name: role
                }).save(err => {
                    if (err) {
                        console.log("error", err);
                    }
                    console.log(`added ${role} to roles collection`);
                });
            });
        }

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
            this.initializeRoles();
        })
            .catch(err => {
                console.error("Connection error", err);
                process.exit();
            });
    }
}
export default new App().app;