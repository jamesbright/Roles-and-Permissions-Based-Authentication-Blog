import * as mongoose from 'mongoose';

interface UserI extends mongoose.Document {
     firstName: string,
     lastName: string,
     phoneNumber: string,
       
     email: string,
        
     password: string,
        
     reset_password_token: string,
     reset_password_expires: string
    
      active:boolean,
     
      
     roles: Array<string>,

    createdAt: Date
}
export { UserI }