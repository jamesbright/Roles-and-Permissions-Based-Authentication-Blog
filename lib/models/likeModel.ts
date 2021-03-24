import * as mongoose from 'mongoose';
import { LikeI } from '../interfaces/like';

const Schema = mongoose.Schema;
const LikeSchema = new Schema({
    user: 
        {
            type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required:true
        }
    


},
    { timestamps: true }
);


//Create an instance of  Like model
const Like = mongoose.model<LikeI>('Like', LikeSchema);
//index Like documents to enable searching
Like.createIndexes()
export { Like }