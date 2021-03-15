import * as mongoose from 'mongoose';
interface RoleI extends mongoose.Document {
    
    name: string,
   permissions:Array<string>
       
}
export { RoleI }