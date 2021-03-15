import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;
export const PermissionSchema = new Schema({
 name: String,

},
    { timestamps: true }
);