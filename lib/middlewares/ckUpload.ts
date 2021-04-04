const cloudinary = require('cloudinary').v2;
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import * as multer from 'multer';
import * as dotenv from 'dotenv';

dotenv.config();


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const cloudStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        allowed_formats: ['jpg', 'png'],
        unique_filename: true,
        folder: 'ckImages',
    },
});
const imageParser = multer({ storage: cloudStorage });

export { imageParser }
