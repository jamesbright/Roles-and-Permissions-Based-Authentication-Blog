import * as mongoose from 'mongoose';
interface TrashI extends mongoose.Document {

    collectionName: string,
    collectionObject: Object,
  

}
export { TrashI }