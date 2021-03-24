import * as mongoose from 'mongoose';
import { CommentI } from '../interfaces/comment';

const Schema = mongoose.Schema;
const CommentSchema = new Schema({
    content: String,
    user: 
        {
            type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
           required:true
        }
    

},
    { timestamps: true }
);


//Create an instance of  comment model
const Comment = mongoose.model<CommentI>('Comment', CommentSchema);
//index comment documents to enable searching
Comment.createIndexes()
export { Comment }