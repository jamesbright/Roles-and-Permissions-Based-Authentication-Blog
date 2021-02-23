import * as mongoose from 'mongoose';
interface TokenI extends mongoose.Document {
    
  userId:string,
    token: string,
    createdAt:  Date
    
}
export { TokenI }