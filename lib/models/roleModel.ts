import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;
export const RoleSchema = new Schema({
 name: String,
   permissions: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Permission"
        }
    ]

},
    { timestamps: true }
);