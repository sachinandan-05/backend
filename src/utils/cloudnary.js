import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs'
import { apiError } from './apiError.js';

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

const deleteFromCloudnary=async(oldfileId)=>{
    try {
        if (!oldfileId) return null ;
    
        // delete the file from cloudinary
        const response = await cloudinary.uploader.destroy(oldfileId,{invalidate:true,resource_type:"video"});
        return response
            
    } catch (error) {
        throw new apiError(404,"something went wrong while deleting video")
        
    }
    

}

export {uploadOnCloudnary,deleteFromCloudnary}