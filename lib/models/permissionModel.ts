import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;
export const PermissionSchema = new Schema({
 name: String,
  createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});