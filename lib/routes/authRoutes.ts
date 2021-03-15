import * as express from 'express';
import { Request, Response } from 'express';
import { AuthController } from '../controllers/AuthController';
import { UserController } from '../controllers/UserController';
import { verifyToken, isAdmin, isSuperAdmin } from '../middlewares/verifyAccess'
import validateSignup from '../middlewares/validateSignup'
import validateLogin from '../middlewares/validateLogin'


export class Routes {
    //create an instance of AuthController
    public authController: AuthController = new AuthController();
    //create an instance of UserController
    public userController: UserController = new UserController();

    public routes(app: express.Application): void {

        //base url
        app.route('/')
            .get((req: Request, res: Response) => {
                res.status(200).send({
                    message: "I think companies need to put up tools that put privacy and security in the hands of their users and make it easy to understand those tools. In Google's case, two-step verification is a perfect example of this. ...Jared Cohen"
                })
            });

        // user registration route
        app.route('/api/auth/register')
            .post(validateSignup, this.authController.register);

        // user login route
        app.route('/api/auth/login')
            .post(validateLogin, this.authController.login);

        //password reset request route
        app.route('/api/auth/request-password-reset')
            .post(this.userController.requestPasswordReset);

        // paasword reset route
        app.route('/api/auth/reset-password')
            .post(this.userController.passwordReset);

        // get all users 
        app.route('/api/users/get')
            .get(this.userController.getAllUsers);



        // get a user with the user's id
        app.route('/api/user/get/:userId')
            .get(this.userController.getUserWithID);

        // get a user with the user's id
        app.route('/api/user/update')
            //only superAdmin user is allowed to update user details
            .put([verifyToken, isSuperAdmin], this.userController.updateUser)

        // get a user with the user's id
        app.route('/api/user/delete/:userId')
            //only superAdmin user is allowed to remove user
            .delete([verifyToken, isSuperAdmin], this.userController.deleteUser);

        // soft delete a user with the user's id
        app.route('/api/user/softdelete/:userId')
            //only superAdmin user is allowed to soft delete users
            .delete([verifyToken, isSuperAdmin], this.userController.softDeleteUser);

        // activate a user with the user's id
        app.route('/api/user/activate/:userId')
            //only superAdmin user is allowed to activate or deactivate users
            .put([verifyToken, isSuperAdmin], this.userController.activateUser);

        //assign roles to user
        app.route('/api/user/assign-role/:userId')
            //only superAdmin user is allowed to assign roles to users
            .put([verifyToken, isSuperAdmin], this.userController.assignRole);

    }
}
