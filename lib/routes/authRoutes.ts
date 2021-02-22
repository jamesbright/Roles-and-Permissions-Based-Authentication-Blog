import * as express from 'express';
import { Request, Response } from 'express';
import { AuthController } from '../controllers/AuthController';
import { UserController } from '../controllers/UserController';
import { verifyToken, isAdmin, isSuperAdmin } from '../middlewares/verifyAccess'
import validateSignup from '../middlewares/validateSignup'
import validateLogin from '../middlewares/validateLogin'


export class Routes {
    public authController: AuthController = new AuthController();
    public userController: UserController = new UserController();

    public routes(app: express.Application): void {

        app.route('/')
            .get((req: Request, res: Response) => {
                res.status(200).send({
                    message: 'Hello,wellcome'
                })
            });
        // user registration route
        app.route('/api/register')
            .post(validateSignup, this.authController.register)

        // user login route
        app.route('/api/login')
            .post(validateLogin,this.authController.login)

        // get all users 
        app.route('/api/users')
            .get(this.userController.getAllUsers)

        // search for users 
        app.route('/api/users/search/:searchTerm')
            .get(this.userController.search)


        // get a user with the user's id
        app.route('/api/user/:userId')
            .get(this.userController.getUserWithID)
            //only superAdmin is allowed to update user
            .put([verifyToken, isSuperAdmin], this.userController.updateUser)

    }
}