import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs'

cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET 
});


const uploadOnCloudnary= async (localFilePath)=>{
    try{
        if(!localFilePath) return null;
        // upload the file on cloudnary
        const response= await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        // file has been uploaded successfully
        console.log("file has been uploded successfully",response.url)
        fs.unlinkSync(localFilePath)
        return response;

    }
    catch(error){
        fs.unlinkSync(localFilePath)//remove the locally save file as the upload opration failed
        return null;
    }
}

export {uploadOnCloudnary}