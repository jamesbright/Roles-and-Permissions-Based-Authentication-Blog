import * as mongoose from 'mongoose';
import { UserSchema } from '../models/userModel';
import { RoleSchema } from '../models/roleModel';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import { check, validationResult } from 'express-validator';
import { UserI } from '../interfaces/user'
import { RoleI } from '../interfaces/role'
// initialize configuration
dotenv.config()

//Create an instance of the user model
const User = mongoose.model<UserI>('User', UserSchema);

//Create an instance of the role model
const Role = mongoose.model<RoleI>('Role', RoleSchema);

  

class AuthController {


  public register(req: Request, res: Response): any {
/**
 try {
    //check if already registered
    User.findOne({ email: req.body.email }, function (err: any, user) {
      if (err) {
        status = "Server error";
        code = 200;
        message = err;

      } else
        if (user) {

          status = "Not found";
          code = 404;
          message = "Email already exists";
      
        }
        else {


          // username must be an email
          check('email').isEmail();
          // password must be at least 8 chars long
          check('password').isLength({ min: 8 });
          // if theres an error, return
          const errors = validationResult(req);
          if (!errors.isEmpty()) {

            status = "Validation error";
            code = 400;
            message = errors.array();
          
          } else {
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
                async function (err: any, user) {
                  if (err) {

                    status = "Server error";
                    code = 500;
                    message = err;
                  
                  } else {


                    if (req.body.roles) {
                      Role.find(
                        {
                          name: { $in: req.body.roles }
                        },
                        (err, roles: object) => {
                          if (err) {

                            status = "Server error";
                            code = 500;
                            message = err;
                          

                          } else {

                            Object.keys(roles).forEach((key: string) => {
                              if (key == '_id') {
                                user.roles = roles[key];
                              }
                            });

                            user.save(err => {
                              if (err) {

                                status = "Server error";
                                code = 500;
                                message = "Their was an error with the server";
                              

                              } else {

                                status = "Success";
                                code = 200;
                                message = "User was registered successfully!";
                              
                                     }
                            });
                          }
                        });

                    } else {
                      Role.findOne({ name: "user" }, (err, role) => {
                        if (err) {

                          status = "Server error";
                          code = 500;
                          message = err;
                        

                        } else {

                          user.roles = [role._id];
                          user.save(err => {
                            if (err) {

                              status = "Server error";
                              code = 500;
                              message = err;
                              

                            } else {

                              // create a token
                               token = jwt.sign({ id: user._id }, process.env.SECRET, {
                                expiresIn: 86400 // expires in 24 hours
                              });

                              status = "Success";
                              code = 200;
                              message = 'Endpoint returned successfully';
                          

                            }
  
                          
                          });
                        }
                        return res.status(code).send({token:token,status: status, code: code, message: message });
   

                      });
                    }

                      }
                });

       
           
          }
       
        }
        

      return res.status(code).send({status: status, code: code, message: message });
     
    });
     } catch (err) {
              console.log(err)

            }

**/

  //check if already registered
        User.findOne({ email: req.body.email }, function(err, user){
            if (err) return res.status(500).send({ status: "Server error", code:500, message:err });
            if (user) return res.status(404).send({ status:'Not found', code:404, message:"Email already registered" });
        });
        // username must be an email
       check('email').isEmail();
        // password must be at least 8 chars long
       check('password').isLength({ min: 8 });
        // if theres an error, return
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).send({ status: 'Bad request', code:400, message: errors.array() });
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
                                    return res.status(500).send({status:"Server error", code:500, message: err });

                } else {
                    if (req.body.roles) {
                        Role.find(
                            {
                                name: { $in: req.body.roles }
                            },
                            (err, roles:object) => {
                                if (err) {
                                    return res.status(500).send({status:"Server error", code:500, message: err });
                                    
                              }
                         
                              Object.keys(roles).forEach((key: string) => {
                                if (key == '_id') {
                                  user.roles = roles[key];
                                }
                              });
                           
                               //user.roles = roles.map(role => role._id);
                                user.save(err => {
                                    if (err) {
                                        res.status(500).send({ status:"Server error", code:500, message: err });
                                        return;
                                    }

                                  return res.status(200).send({ status: "Success", code: 200, message: 'Successfully registered' });
      });
                            }
                        );
                    } else {
                        Role.findOne({ name: "user" }, (err, role) => {
                            if (err) {
                                res.status(500).send({status:"Server error", code:500, message: err });
                                return;
                            }

                            user.roles = [role._id];
                            user.save(err => {
                                if (err) {
                                    res.status(500).send({ status:"Server error", code:500, message: err });
                                    return;
                                }
return res.status(200).send({ status:"Success", code:200, message: 'Successfully registered' });
         
                            });
                        });
                    }

                   
                           }
            });

  }





  public login(req: Request, res: Response): void {
    
    //get the user using their email
    User.findOne({ email: req.body.email }, function (err, user) {
      if (err) return res.status(500).send({ status:"Server error", code:500, message:err });
      //if user do not exist return not found
      if (!user) return res.status(404).send({ status:'Not found', code:404, message: 'User does not exist.' });

      //validate user password
      const validatePassword = bcrypt.compareSync(req.body.password, user.password);
      if (!validatePassword) return res.status(401).send({ auth: false, token: null, status:'Unauthorized', code:401, message: 'Wrong password' });

      //create and sign a token with the user id and email as payload
      const token = jwt.sign({ id: user._id,email: user.email }, process.env.SECRET, {
        expiresIn: 86400 // expires in 24 hours
      });

      return res.status(200).send({ auth: true, token: token, _id: user._id, status:'Success', code:200, message: 'Successfully logged in' });
    })
  }


  public getAllUsers(req: Request, res: Response): void {
    //const users = await User.fuzzySearch('jo');

    let status: string,
      message: string,
      code: number;

    // get limit and page number from request
   const currentPage:number = req.body.page;
   const limit:number = req.body.limit;
   let hasNext:boolean,
   hasPrev:boolean;

   try {
      // execute query with page and limit values
      User.find(async function (err, users) {
        // get total documents in the Posts collection 
        const count: number = await User.countDocuments();
        let totalPages: number;
        if (err) {
          code = 500;
          status = "Server error";
          message = "There was a problem with the server.";
          totalPages = 0;
        }else{
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

       if(currentPage > 1)
       hasPrev = true;
       else
        hasPrev = false;

 if(totalPages > currentPage)
   hasNext = true;
  else
  hasNext = false;

  //calculate values for previous and next page
   let prevPage :number  = Number(currentPage)-1;
let nextPage:number = Number(currentPage)+1;

//pagination object with all pagination values
let pagination: object = {
'totalPages':totalPages,
 'currentPage': currentPage,
  'users': count, 
  'hasNext':hasNext, 
  'hasPrev':hasPrev, 
  'perPage': limit,
  'prevPage': prevPage,
  'nextPage':nextPage
}
        //get current and next url
let links: object = {
  'nextLink' :`${req.protocol}://${req.get('host')}${req.originalUrl}?page=${nextPage}&limit=${limit}`,
  'prevLink':`${req.protocol}://${req.get('host')}${req.originalUrl}?page=${prevPage}&limit=${limit}`
};
        // return response with posts, calculated total pages, and current page
        return res.status(code).send({ users, pagination:pagination, status: status, code: code, message: message, links:links });



      }).populate("roles", "-__v")
        .limit(limit * 1)
        .skip((currentPage - 1) * limit) //prevPage = (currentPage - 1) * limit
        .select('-password')
        .exec();

    } catch (err) {
      console.error(err.message);
    }
  }

  public getUserWithID(req: Request, res: Response) {

    let status: string,
      message: any,
      code: number;
    User.findById(req.params.userId, function (err: any, user: any) {
      if (err) {
        code = 500;
        status = "Server error";
        message = "There was a problem with the server.";
      }else{
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

    }).select('-password');
  }

  public updateUser(req: Request, res: Response) {

    let status: string,
      message: any,
      code: number;
    User.findOneAndUpdate({ _id: req.params.userId }, req.body, { new: true }, function (err, user) {
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
  public someResource(req: Request, res: Response): void {
    User.findById(req['userId'], function (err, user) {
      if (err) return res.status(500).send("There was a problem finding the user.");
      if (!user) return res.status(404).send("No user found.");

      return res.status(200).send({ name: user.firstName, email: user.email, auth: true, message: 'Acces granted' });
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