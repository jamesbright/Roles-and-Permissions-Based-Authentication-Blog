import * as mongoose from 'mongoose';
interface LogI extends mongoose.Document {

    name: string,
    user: mongoose.Schema.Types.ObjectId,
    description:string,

}
export { LogI }