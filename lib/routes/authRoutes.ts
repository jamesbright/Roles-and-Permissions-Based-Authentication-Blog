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
                    message: 'Hello,wellcome to Myyinvest'
                })
            });
        // user registration route
        app.route('/api/register')
            .post(validateSignup, this.authController.register);

        // user login route
        app.route('/api/login')
            .post(validateLogin, this.authController.login);

        // get all users 
        app.route('/api/users')
            .get(this.userController.getAllUsers);

        // search for users 
        app.route('/api/users/search/:searchTerm')
            .get(this.userController.search);


        // get a user with the user's id
        app.route('/api/user/:userId')
            .get(this.userController.getUserWithID)
            //only superAdmin user is allowed to update user details
            .put([verifyToken, isSuperAdmin], this.userController.updateUser)
            //only superAdmin user is allowed to remove user
            .delete([verifyToken, isSuperAdmin], this.userController.deleteUser);

        // activate a user with the user's id
        app.route('/api/user/activate/:userId')
            //only superAdmin user is allowed to activate users
            .put([verifyToken, isSuperAdmin], this.userController.activateUser);

            
        // deactivate a user with the user's id
        app.route('/api/user/deactivate/:userId')
            //only superAdmin user is allowed to deactivate users
            .put([verifyToken, isSuperAdmin], this.userController.deActivateUser);
        
        //password reset routes
        app.route('/api/user/request-password-reset')
            .get(this.userController.requestPasswordReset);

        
        app.route('/api/user/reset-password')
            .post(this.userController.resetPassword);

    }
}