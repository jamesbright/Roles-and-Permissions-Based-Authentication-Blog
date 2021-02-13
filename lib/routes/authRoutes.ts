import * as express from "express";
import { Request, Response } from "express";
import { AuthController } from "../controllers/AuthController";
import verifyToken from '../middlewares/verify'

export class Routes {
    public authController: AuthController = new AuthController();

    public routes(app:express.Application): void {
       
        app.route('/')
            .get((req: Request, res: Response) => {
                res.status(200).send({
                    message: 'Hello,wellcome'
                })
            });
        // User register
        app.route('/register')
            .post(this.authController.register)

        // User login
        app.route('/login')
            .post(this.authController.login)

        app.route('/some-resource')
            //grant user access if authenticated 
            .get(verifyToken, this.authController.someResource)



    }
}