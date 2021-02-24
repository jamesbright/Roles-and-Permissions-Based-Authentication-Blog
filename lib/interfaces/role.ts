import * as mongoose from 'mongoose';
interface RoleI extends mongoose.Document {
    
    name: string,
    createdAt: Date,
       permissions:Array<string>,
    type: Date
       

}
export { RoleI }