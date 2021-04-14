import * as mongoose from 'mongoose';
interface LogI extends mongoose.Document {

    name: string,
    user: string,
    description:string,

}
export { LogI }