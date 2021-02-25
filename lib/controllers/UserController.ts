import * as mongoose from 'mongoose';
import { UserSchema } from '../models/userModel';
import { TokenSchema } from '../models/tokenModel';
import { Request, Response } from 'express';
import { UserI } from '../interfaces/user';
import { TokenI } from '../interfaces/token';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { NodeMailgun } from 'ts-mailgun';
import * as dotenv from 'dotenv';
// initialize configuration
dotenv.config()

//Create an instance of the user model
const User = mongoose.model<UserI>('User', UserSchema);
//Create an instance of the token model
const Token = mongoose.model<TokenI>('Token', TokenSchema);


class UserController {


  public getAllUsers(req: Request, res: Response): void {

    let status: string,
      message: string,
      code: number;

    // get limit and page number from request
    const currentPage: number = req.body.page;
    const limit: number = req.body.limit;
    let hasNext: boolean,
      hasPrev: boolean;

    try {
      //sort by firstname in ascending order
      const sort = { firstName: 1 };
      // execute query with page and limit values
      User.find(async function (err: any, users: any) {
        // get total documents in the User collection 
        const count: number = await User.countDocuments();
        let totalPages: number;
        if (err) {
          code = 500;
          status = "Server error";
          message = "There was a problem with the server.";
          totalPages = 0;
        } else {
          if (users.length == 0) {
            code = 404;
            status = "Not found";
            message = "Users not found";
            totalPages = 0;
          } else {
            code = 200;
            status = "Success";
            message = "Endpoint returned successfully”";
            totalPages = Math.ceil(count / limit);

          }
        }

        if (currentPage > 1)
          hasPrev = true;
        else
          hasPrev = false;

        if (totalPages > currentPage)
          hasNext = true;
        else
          hasNext = false;

        //calculate values for previous and next page
        const prevPage: number = Number(currentPage) - 1;
        const nextPage: number = Number(currentPage) + 1;

        //pagination object with all pagination values
        const pagination: Record<string, unknown> = {
          'totalPages': totalPages,
          'currentPage': currentPage,
          'users': count,
          'hasNext': hasNext,
          'hasPrev': hasPrev,
          'perPage': limit,
          'prevPage': prevPage,
          'nextPage': nextPage
        }
        //get current and next url
        const links: Record<string, unknown> = {
          'nextLink': `${req.protocol}://${req.get('host')}${req.originalUrl}?page=${nextPage}&limit=${limit}`,
          'prevLink': `${req.protocol}://${req.get('host')}${req.originalUrl}?page=${prevPage}&limit=${limit}`
        };
        // return response with posts, calculated total pages, and current page
        return res.status(code).send({ users, pagination: pagination, status: status, code: code, message: message, links: links });



      }).populate("roles", "-__v")
        .limit(limit * 1)//prevPage = (currentPage - 1) * limit
        .skip((currentPage - 1) * limit)
        .sort(sort) //sort by firstname
        .select('-password') //do not select password
        .exec();

    } catch (err) {
      console.error(err.message);
    }
  }

  public getUserWithID(req: Request, res: Response):void {

    let status: string,
      message: any,
      code: number;
    //find user using their id
    User.findById(req.params.userId, function (err, user) {
      if (err) {
        code = 500;
        status = "Server error";
        message = "There was a problem with the server.";
      } else {
        if (!user) {
          code = 404;
          status = "Not found";
          message = "User not found";
        } else {
          code = 200;
          status = "Success";
          message = "Endpoint returned successfully”";
        }
      }
      return res.status(code).send({ user: user, status: status, code: code, message: message });

    }).select('-password'); //do not include password
  }

  public updateUser(req: Request, res: Response):void {

    let status: string,
      message: any,
      code: number;
    //find user by their id and update the new values subsequently
    User.findOneAndUpdate({ _id: req.params.userId },  req.body, { new: true }, function (err, user) {
      if (err) {
        code = 500;
        status = "Server error";
        message = "There was a problem with the server.";
      }
      if (!user) {
        code = 404;
        status = "Not found";
        message = "User not found";
      } else {
        code = 200;
        status = "Success";
        message = "User updated successfully”";
      }
      return res.status(code).send({ user: user, status: status, code: code, message: message });

    }).select('-password');


  }


  public search(req: Request, res: Response) :void{

    let status: string,
      message: any,
      code: number;


    // get limit and page number from request
    const currentPage: number = req.body.page;
    const limit: number = req.body.limit;
    let hasNext: boolean,
      hasPrev: boolean;

    //sort by firstname in ascending order
    const sort = { firstName: 1 };

    //query to search for text
    const query = { $text: { $search: req.params.searchTerm } };

    try {
      //search for users using the searchTerm
      User.find(query, async function (err: any, users: any) {

        // get total documents in the User collection 
        const count: number = await User.countDocuments();
        let totalPages: number;
        if (err) {
          code = 500;
          status = "Server error";
          message = "There was a problem with the server.";
          totalPages = 0;
        } else {
          if (users.length == 0) {
            code = 404;
            status = "Not found";
            message = "Users not found";
            totalPages = 0;
          } else {
            code = 200;
            status = "Success";
            message = "Endpoint returned successfully”";
            totalPages = Math.ceil(count / limit);

          }
        }

        if (currentPage > 1)
          hasPrev = true;
        else
          hasPrev = false;

        if (totalPages > currentPage)
          hasNext = true;
        else
          hasNext = false;

        //calculate values for previous and next page
        const prevPage: number = Number(currentPage) - 1;
        const nextPage: number = Number(currentPage) + 1;

        //pagination object with all pagination values
        const pagination: Record<string, unknown> = {
          'totalPages': totalPages,//total number of pages
          'currentPage': currentPage,
          'users': count, // number of users
          'hasNext': hasNext, //is there a next page
          'hasPrev': hasPrev,//is there a previous page
          'perPage': limit, //how many users per page
          'prevPage': prevPage,
          'nextPage': nextPage
        }
        //get current and next url
        const links: Record<string, unknown> = {
          'nextLink': `${req.protocol}://${req.get('host')}${req.originalUrl}?page=${nextPage}&limit=${limit}`,
          'prevLink': `${req.protocol}://${req.get('host')}${req.originalUrl}?page=${prevPage}&limit=${limit}`
        };
        // return response with posts, calculated total pages, and current page
        return res.status(code).send({ users, pagination: pagination, status: status, code: code, message: message, links: links });



      }).populate("roles", "-__v")
        .limit(limit * 1)//prevPage = (currentPage - 1) * limit
        .skip((currentPage - 1) * limit)
        .sort(sort) //sort by firstname
        .select('-password') //do not select password
        .exec();

    } catch (err) {
      console.log(err);
    }

  }

  public deleteUser(req: Request, res: Response):void {

    let status: string,
      message: any,
      code: number;
    //find user by their id and update the new values subsequently
    User.findByIdAndRemove({ _id: req.params.userId }, {}, function (err, user) {
      if (err) {
        code = 500;
        status = "Server error";
        message = "There was a problem with the server.";
      }
      if (!user) {
        code = 404;
        status = "Not found";
        message = "User not found";
      } else {

        code = 200;
        status = "Success";
        message = "User removed successfully”";
      }


      return res.status(code).send({ user: user, status: status, code: code, message: message });

    }).select('-password');


  }

  public activateUser(req: Request, res: Response):void {

    let status: string,
      message: any,
      code: number;
    //find user by their id and set active to true subsequently
    User.findByIdAndUpdate({ _id: req.params.userId }, { active: true, updatedAt: Date.now()  },
      { new: true }, function (err, user) {
        if (err) {
          code = 500;
          status = "Server error";
          message = "There was a problem with the server.";
        }
        if (!user) {
          code = 404;
          status = "Not found";
          message = "User not found";
        } else {

          code = 200;
          status = "Success";
          message = "User activated successfully”";
        }


        return res.status(code).send({ user: user, status: status, code: code, message: message });

      }).select('-password');
  }



  public deActivateUser(req: Request, res: Response):void {

    let status: string,
      message: any,
      code: number;
    //find user by their id and set active to false subsequently
    User.findByIdAndUpdate({ _id: req.params.userId }, { active: false, updatedAt:Date.now() },
      { new: true }, function (err, user) {
        if (err) {
          code = 500;
          status = "Server error";
          message = "There was a problem with the server.";
        }
        if (!user) {
          code = 404;
          status = "Not found";
          message = "User not found";
        } else {

          code = 200;
          status = "Success";
          message = "User deactivated successfully”";
        }


        return res.status(code).send({ user: user, status: status, code: code, message: message });

      }).select('-password');


  }


  public async requestPasswordReset(req: Request, res: Response): Promise<any>{
    let status: string,
      message: any,
      code: number;

    //find user requesting for password reset using their email
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      code = 404;
      status = "Not found";
      message = "User not found";
      return res.status(code).send({ status: status, code: code, message: message });


    } else {
      //check if previous token generated for user exists
      const token: TokenI = await Token.findOne({ userId: user._id });
      //if previous token exists then delete it first
      if (token) await token.deleteOne();
      //generate and hash a new password reset token
      const resetToken: string = crypto.randomBytes(32).toString("hex");
      const hashedToken: string = await bcrypt.hash(resetToken, Number(process.env.BCRYPT_SALT));
      //save the generated token
      await new Token({
        userId: user._id,
        token: hashedToken,
        createdAt: Date.now(),
      }).save();

      //send email to user
      const mailer: NodeMailgun = new NodeMailgun();
      mailer.apiKey = process.env.MAILER_API_KEY; //mailgun API key
      mailer.domain = process.env.MAILER_API_DOMAIN; // domain you registered with mailgun
      mailer.fromEmail = process.env.MAILER_FROM_EMAIL; // from email
      mailer.fromTitle = process.env.MAILER_FROM_TITLE; // name you would like to send from

      mailer.init();

      const clientURL: string = process.env.CLIENT_URL;//frontend domain name
      const userEmail: string = user.email; //user's email address to send email to
      const link  = `${clientURL}/passwordReset?token=${resetToken}&id=${user._id}`;// passwordReset endpoint

      //message to be displayed to user
      const body  = `<h1> <p>Hi ${user.firstName},</p>
        <p>You requested to reset your password.</p>
        <p> Please, click the link below to reset your password</p>
        <a href=${link}">Reset Password</a>`;

      console.log('sending mail');
      //send mail
      try {
        await mailer
          .send(userEmail, 'password reset request', body)
          .then((result) => {
            code = 200;
            status = "Success";
            message = `email with instructions on how to reset your password successfully sent to ${userEmail}`;

            console.log('Done', result)
          })
          .catch((error) => {
            code = 201;
            status = "Failed";
            message = `Email not sent, please try again later`;
            console.error('Error: ', error)
          })
        return res.status(code).send({ status: status, code: code, message: message });

      } catch (err) {
        console.log(err);
      }
    }
  }


  public async passwordReset(req: Request, res: Response):Promise<any> {
    let status: string,
      message: any,
      code: number;

    const userId: string = req.body.userId;
    //get user's password reset token 
    const passwordResetToken: TokenI = await Token.findOne({ userId: userId });
    if (!passwordResetToken) {
      code = 404;
      status = "Not found";
      message = "Password token not found";
      return res.status(code).send({ status: status, code: code, message: message });


    } else {

      //check if reset token is valid
      const isValidToken: boolean = await bcrypt.compare(req.body.token, passwordResetToken.token);
      if (!isValidToken) {
        code = 400;
        status = "bad request";
        message = "Password token is not valid";
      } else {
        //hash new user password
        const hashedPassword: string = bcrypt.hashSync(req.body.password, Number(process.env.BCRYPT_SALT));

        //save new password
        await User.updateOne(
          { _id: userId },
          { $set: { password: hashedPassword } },
          { new: true }
        );
        const user: UserI = await User.findById({ _id: userId });

        //send email to user notifying them of password reset

        const mailer: NodeMailgun = new NodeMailgun();
        mailer.apiKey = process.env.MAILER_API_KEY; // API key
        mailer.domain = process.env.MAILER_API_DOMAIN; // domain you registered
        mailer.fromEmail = process.env.MAILER_FROM_EMAIL; // from email
        mailer.fromTitle = process.env.MAILER_FROM_TITLE; // name you would like to send from

        mailer.init();

        const email: string = user.email; // user's email address
        // message as seen by user
        const body = `<h1> <p>Hi ${user.firstName},</p>
        <p>Your password reset was successful.</p>`;

        await mailer
          .send(email, 'password reset successful', body)
          .then((result) => console.log('Done', result))
          .catch((error) => console.error('Error: ', error))

        //when done delete user's password reset token fron db
        await passwordResetToken.deleteOne();

        code = 200;
        status = "Success";
        message = 'password reset successful';

      }

      return res.status(code).send({ status: status, code: code, message: message });

    }
  }


}

export { UserController }