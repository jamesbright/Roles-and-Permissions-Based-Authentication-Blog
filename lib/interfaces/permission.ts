import * as mongoose from 'mongoose';
interface PermissionI extends mongoose.Document {
    
    name: string
    
}
export { PermissionI }