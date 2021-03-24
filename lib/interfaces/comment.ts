import * as mongoose from 'mongoose';

interface CommentI extends mongoose.Document {
    content: string,
    user: mongoose.Schema.Types.ObjectId,
   

}

export { CommentI }
