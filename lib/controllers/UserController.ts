import * as mongoose from 'mongoose';
import { UserSchema } from '../models/userModel';
import { Request, Response } from 'express';
import { UserI } from '../interfaces/user';

//Create an instance of the user model
const User = mongoose.model<UserI>('User', UserSchema);

class UserController {


  public getAllUsers(req: Request, res: Response): void {

    let status: string,
      message: string,
      code: number;

    // get limit and page number from request
   const currentPage:number = req.body.page;
   const limit:number = req.body.limit;
   let hasNext:boolean,
   hasPrev:boolean;

   try {
       //sort by firstname in ascending order
       const sort = { firstName: 1};
      // execute query with page and limit values
      User.find(async function (err:any, users:any) {
        // get total documents in the User collection 
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
        .limit(limit * 1)//prevPage = (currentPage - 1) * limit
        .skip((currentPage - 1) * limit)
        .sort(sort) //sort by firstname
        .select('-password') //do not select password
        .exec();

    } catch (err) {
      console.error(err.message);
    }
  }

  public getUserWithID(req: Request, res: Response) {

    let status: string,
      message: any,
      code: number;
    //find user using their id
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

    }).select('-password'); //do not include password
  }

  public updateUser(req: Request, res: Response) {

    let status: string,
      message: any,
      code: number;
      //find user by their id and update the new values subsequently
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


public search(req: Request, res: Response) {

    let status: string,
      message: any,
      code: number;
      
      
    // get limit and page number from request
   const currentPage:number = req.body.page;
   const limit:number = req.body.limit;
   let hasNext:boolean,
    hasPrev: boolean;
  
       //sort by firstname in ascending order
       const sort = { firstName: 1};

//query to search for text
  const query = { $text: { $search: req.params.searchTerm } };

try{
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
      let prevPage: number = Number(currentPage) - 1;
      let nextPage: number = Number(currentPage) + 1;

      //pagination object with all pagination values
      let pagination: object = {
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
      let links: object = {
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

  }catch(err){
  console.log(err);
  }

  }



}

export { UserController }