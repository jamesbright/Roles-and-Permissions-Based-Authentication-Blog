import * as express from "express";
import * as bodyParser from "body-parser";
import * as  cors from "cors";
import { Routes } from "./routes/authRoutes";
import * as mongoose from "mongoose";
import { RoleSchema } from "./models/roleModel";
import { PermissionSchema } from "./models/permissionModel";
import { RoleI } from './interfaces/role';
import { PermissionI } from './interfaces/permission';
import * as dotenv from 'dotenv';

// initialize configuration
dotenv.config()

//Create an instance of  role model
const Role = mongoose.model<RoleI>('Role', RoleSchema);

//Create an instance of permission model
const Permission= mongoose.model<PermissionI>('Permission', PermissionSchema);
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
            origin: process.env.CLIENT_URL
        };
        this.app.use(cors(corsOptions));

        // support application/json type post data
        this.app.use(bodyParser.json());
        //support application/x-www-form-urlencoded post data
        this.app.use(bodyParser.urlencoded({ extended: false }));

    }

    private async initializeRolesAndPermissions() {
   //count number of roles in Role collection
        const roleCount : number = await Role.countDocuments()
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

        //count number of data in permissions collection
        const permiCount : number = await Permission.countDocuments()
        // if permissions collection is not yet populated, create new permissions
        if (permiCount == 0) {
            // array of assignable permissions
            const permissions: string[] = ["create", "edit", "delete","activate","deactivate","suspend","upgrade","update"];
            permissions.forEach(permission => {
                new Permission({
                    name: permission
                }).save(err => {
                    if (err) {
                        console.log("error", err);
                    }
                    console.log(`added ${permission} to permissions collection`);
                });
            });
      
     

// create permissions for superAdmin
          Role.findOne({ name: "superAdmin" }, (err, role) => {

                            if (err) {
                               console.log(err)
                            }
                           // list of assignable permissions
                            const assignables:string[] =["delete","activate","deactivate","suspend","upgrade","update"];
                          Permission.find({
                                name: { $in: assignables }
                            },(err, permissions) => {
                    if (err) {
                            console.log(err)
                            }
// iterate through permissions object
 Object.keys(permissions).forEach((key: string) => {
     // push permissions into superadmin role
                                  role.permissions.push(permissions[key]['_id']);
                                
                              });
//save changes
                           role.save(err => {
                                if (err) {
                                    console.log('failed to add permissions to superAdmin')
                                  
                                }
                                console.log('added permissions to superAdmin')
         
                            });   });                  
                        });


// create permissions for admin
          Role.findOne({ name: "admin" }, (err, role) => {

                            if (err) {
                               console.log(err)
                            }
//array of assignable permissions
                            const assignables:string[] =["create", "edit", "delete"]
                          Permission.find({
                                name: { $in: assignables }
                            },(err, permissions) => {
                    if (err) {
                            console.log(err)
                            }
// iterate through permissions object
 Object.keys(permissions).forEach((key: string) => {

        //push permissions into admin role
        role.permissions.push(permissions[key]['_id']);
                                
                              });
                              //save changes
                           role.save(err => {
                                if (err) {
                                    console.log('failed to add permissions to admin')
                                       
                                }
                                console.log('added permissions to admin')
         
                            });   });                  
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

        //connect to mongodb database
        mongoose.connect(this.mongoUrl, options).then(() => {
            console.log("Successfully connected to MongoDB.");
            this.initializeRolesAndPermissions();
        })
            .catch(err => {
                console.error("Connection error", err);
                process.exit();
            });
    }
}
export default new App().app;