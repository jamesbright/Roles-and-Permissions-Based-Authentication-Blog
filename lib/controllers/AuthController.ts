import * as mongoose from 'mongoose';
import { UserSchema } from '../models/userModel';
import { RoleSchema } from '../models/roleModel';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import { body, validationResult } from 'express-validator';
//import { Status } from '../interfaces/status'
import { UserI } from '../interfaces/user'

// initialize configuration
dotenv.config()

//Create an instance of the user model
const User = mongoose.model<UserI>('User', UserSchema);

//Create an instance of the role model
const Role = mongoose.model('Role', RoleSchema);


class AuthController {
      
    private status: string;
    private code:   number;
    private message: string;
  

  private async initializeRoles(){
      const roleCount =await Role.countDocuments() 
             if(roleCount === 0) {
                 // array of assignable roles
                 const roles: string[] = ["user", "admin", "moderator"];
                 roles.forEach((role) => {
                     new Role({
                         name: role
                     }).save(err => {
                         if (err) {
                             console.log("error", err);
                         }
                         console.log(`added ${role} to roles collection`);
                     });
                 })
             }     
}
    public register(req: Request, res: Response, next:any): any {
        //check if already registered
        User.findOne({ email: req.body.email }, function(err, user){
            if (err) return res.status(500).send({ 'error': 'Serve error' });
            if (user) return res.status(404).send({ 'error': 'Email exists' });
        });
        this.initializeRoles();
        // username must be an email
        body('email').isEmail();
        // password must be at least 8 chars long
        body('password').isLength({ min: 8 });
        // if theres an error, return
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).send({ status: 400, errors: errors.array() });
        }
        // encrypt password
        const hashedPassword = bcrypt.hashSync(req.body.password, 8);

        //create new user
        User.create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            phoneNumber: req.body.phoneNumber,
            email: req.body.email,
            password: hashedPassword
        },
            (err, user) => {
                if (err) {
                    return res.status(500).send({ 'error': 'Server error' })
                } else {
                    if (req.body.roles) {
                        Role.find(
                            {
                                name: { $in: req.body.roles }
                            },
                            (err, roles:object) => {
                                if (err) {
                                    res.status(500).send({ message: err });
                                    return;
                              }
                         
                              Object.keys(roles).forEach((key: string) => {
                                if (key == '_id') {
                                  user.roles = roles[key];
                                }
                              });
                           
                               //user.roles = roles.map(role => role._id);
                                user.save(err => {
                                    if (err) {
                                        res.status(500).send({ message: err });
                                        return;
                                    }

                                    res.send({ message: "User was registered successfully!" });
                                });
                            }
                        );
                    } else {
                        Role.findOne({ name: "user" }, (err, role) => {
                            if (err) {
                                res.status(500).send({ message: err });
                                return;
                            }

                            user.roles = [role._id];
                            user.save(err => {
                                if (err) {
                                    res.status(500).send({ message: err });
                                    return;
                                }

                                //res.send({ message: "User was registered successfully!" });
                            });
                        });
                    }

                    // create a token
                    const token = jwt.sign({ id: user._id }, process.env.SECRET, {
                        expiresIn: 86400 // expires in 24 hours
                    });
                    next();
                    return res.status(200).send({ auth: true, token: token, message: 'Successfull' });
                }
            });

    }

    public login(req: Request, res: Response): void {
        //get the user using their email
        User.findOne({ email: req.body.email }, function(err, user){
            if (err) return res.status(500).send({ 'error': 'Server error' });
            //if user do not exist return not found
            if (!user) return res.status(404).send({ 'error': 'User does not exist.' });

            //validate user password
            const validatePassword = bcrypt.compareSync(req.body.password, user.password);
            if (!validatePassword) return res.status(401).send({ auth: false, token: null, 'error': 'Wrong password' });

            //create and sign a token with the user id as payload
            const token = jwt.sign({ id: user._id }, process.env.SECRET, {
                expiresIn: 86400 // expires in 24 hours
            });
            var permissions = [];

            for (let i = 0; i < user.roles.length; i++) {
                permissions.push("ROLE_" + user.roles[i].name.toUpperCase());
            }
            return res.status(200).send({ auth: true, token: token, _id: user._id,roles:permissions, message: 'Successfull' });
        }).populate("roles", "-__v");
    }

    public getAllUsers(req: Request, res: Response): void {
        //const users = await User.fuzzySearch('jo');

        //object destructing to get limit and page number from request
        const { page, limit } = req.body;

        try {
            // execute query with page and limit values
            User.find(async function(err, users){
                // get total documents in the Posts collection 
                const count: number = await User.countDocuments();
                let totalPages: number = Math.ceil(count / limit);

                if (err) {
                    this.code = 500;
                   this. status = "Server error";
                    this.message = "There was a problem with the server.";
                    totalPages = 0;
                }
                if (users.length == 0) {
                    this.code = 404;
                    this.status = "Not found";
                    this.message = "Users not found";
                    totalPages = 0;
                } else {
                    this.code = 200;
                    this.status = "Success";
                   this. message = "Endpoint returned successfully”";

                }


                // return response with posts, calculated total pages, and current page
                return res.status(this.code).send({ users, totalPages: totalPages, currentPage: page, status: this.status, code: this.code, message: this.message });



            })
                .limit(limit * 1)
                .skip((page - 1) * limit) //prevPage = (currentPage - 1) * limit
                .exec();

        } catch (err) {
            console.error(err.message);
        }
    }

    public getUserWithID(req: Request, res: Response) {

        User.findById(req.params.userId, function(err: any, user: any){
            if (err) {
               this.code = 500;
                this.status = "Server error";
                this.message = "There was a problem with the server.";
            }
            if (!user) {
                this.code = 404;
                this.status = "Not found";
                this.message = "User not found";
            } else {
                this.code = 200;
                this.status = "Success";
                this.message = "Endpoint returned successfully”";
            }

            return res.status(this.code).send({ user: user, status: this.status, code: this.code, message: this.message });

        });
    }

    public updateUser(req: Request, res: Response) {
        User.findOneAndUpdate({ _id: req.params.userId }, req.body, { new: true }, function(err, user){
            if (err) {
                this.code = 500;
                this.status = "Server error";
                this.message = "There was a problem with the server.";
            }
            if (!user) {
                this.code = 404;
                this.status = "Not found";
                this.message = "User not found";
            } else {
               this.code = 200;
                this.status = "Success";
                this.message = "Endpoint returned successfully”";
            }
            return res.status(this.code).send({ user: user, status: this.status, code: this.code, message: this.message });

        })


    }
    public someResource(req: Request, res: Response): void {
        User.findById(req.body._id, function (err, user) {
            if (err) return res.status(500).send("There was a problem finding the user.");
            if (!user) return res.status(404).send("No user found.");

            return res.status(200).send({ name: user.name, email: user.email, auth: true, message: 'Acces granted' });
        });

    }
/**
    public recoverPassword(req: Request, res: Response): void{
    
  async.waterfall([
    function(done) {
      User.findOne({
        email: req.body.email
      }).exec((err, user)  =>{
        if (user) {
          done(err, user);
        } else {
          done('User not found.');
        }
      });
    },
   (user, done) => {
      // create the random token
      crypto.randomBytes(20, (err, buffer) => {
        var token = buffer.toString('hex');
        done(err, user, token);
      });
    },
    (user, token, done) => {
      User.findByIdAndUpdate({ _id: user._id }, { reset_password_token: token, reset_password_expires: Date.now() + 86400000 }, { upsert: true, new: true }).exec((err, new_user) => {
        done(err, token, new_user);
      });
    },
    (token, user, done)  => {
      var data = {
        to: user.email,
        from: email,
        template: 'forgot-password-email',
        subject: 'Password help has arrived!',
        context: {
          url: 'http://localhost:3000/auth/reset_password?token=' + token,
          name: user.fullName.split(' ')[0]
        }
      };

      smtpTransport.sendMail(data, function(err) {
        if (!err) {
          return res.json({ message: 'Kindly check your email for further instructions' });
        } else {
          return done(err);
        }
      });
    }
  ], function(err) {
    return res.status(422).json({ message: err });
  });

    }


    public resetPassword(req:Request, res:Response, next):any{
      
  User.findOne({
    reset_password_token: req.body.token,
    reset_password_expires: {
      $gt: Date.now()
    }
  }).exec(function(err, user) {
    if (!err && user) {
      if (req.body.newPassword === req.body.verifyPassword) {
        user.password = bcrypt.hashSync(req.body.newPassword, 10);
        user.reset_password_token = undefined;
        user.reset_password_expires = undefined;
        user.save(function(err) {
          if (err) {
            return res.status(422).send({
              message: err
            });
          } else {
            var data = {
              to: user.email,
              from:'email',
              template: 'reset-password-email',
              subject: 'Password Reset Confirmation',
              context: {
                name: user.fullName.split(' ')[0]
              }
            };

            smtpTransport.sendMail(data, function(err) {
              if (!err) {
                return res.json({ message: 'Password reset' });
              } else {
                return done(err);
              }
            });
          }
        });
      } else {
        return res.status(422).send({
          message: 'Passwords do not match'
        });
      }
    } else {
      return res.status(400).send({
        message: 'Password reset token is invalid or has expired.'
      });
    }
  });

    }
    **/

}

export { AuthController }