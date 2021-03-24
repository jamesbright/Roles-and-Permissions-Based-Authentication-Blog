import * as mongoose from 'mongoose';

interface LikeI extends mongoose.Document {

    user: mongoose.Schema.Types.ObjectId,


}

export { LikeI }
