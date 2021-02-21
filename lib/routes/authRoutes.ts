import * as express from "express";
import { Request, Response } from "express";
import { AuthController } from "../controllers/AuthController";
import   { verifyToken,isAdmin,isSuperAdmin } from '../middlewares/verifyAccess'

export class Routes {
    public authController: AuthController = new AuthController();

    public routes(app: express.Application): void {

        app.route('/')
            .get((req: Request, res: Response) => {
                res.status(200).send({
                    message: 'Hello,wellcome'
                })
            });
        // User register route
        app.route('/register')
            .post(this.authController.register)

        // User login route
        app.route('/login')
            .post(this.authController.login)

        // get all users route
        app.route('/users')
            .get(this.authController.getAllUsers)
        
            // get a user route
        app.route('/user/:userId')
            .get(this.authController.getUserWithID)
            .put(isSuperAdmin,this.authController.updateUser)

        
        app.route('/some-resource')
            //grant user access if fully authenticated 
            .get([ verifyToken,isAdmin,isSuperAdmin], this.authController.someResource)



    }
}