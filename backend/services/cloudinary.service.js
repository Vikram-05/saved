
import { unlink } from 'fs/promises';

import cloudinary from '../config/cloudinary.config.js';

export async function uploadImage(image){
   try {
   //  console.log('Cloudinary API Key:', process.env.CLOUDINARY_API_KEY);

       if(!image) return null;
        const response = await cloudinary.uploader.upload(
            image,
            {resource_type : 'auto'}
        )
      //   console.log("file is uploaded on cloudinary successfully",response);
        return response;

   } catch (error) {
        await unlink(image)
        console.log("error in upload",error)
        return null;
   }
}