import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;
export const LogSchema = new Schema({
    name: String,
    user:String,
    description: String,

},
    { timestamps: true }
);