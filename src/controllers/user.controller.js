import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import {User} from "../Models/user.model.js";
import { uploadOnCloudnary } from "../utils/cloudnary.js";
import { apiResponse } from "../utils/apiResponse.js";

const resisterUser= asyncHandler(async(req,res)=>{
   //get user detailes from frontend
   //validation --not empty
   //check if user already exist :username,email
   //check for images or check for avtars
   //upload them on cloudinary,avtar
   //create  user object -create entry in db
   //remove passward and refresh token field from response
   //check user for creation
   //return res

   const { fullname,email,username,password}=req.body
   console.log("email:",email)

   // if (fullname==="") {
   //    throw new apiError(400,"fullname is required") 
   // }

   if (
      [fullname,email,username,password].some((field)=>field?.trim==="")
   ) {
      throw new apiError(400,"all fields are required")
   }

  const existedUser= User.findOne({
      $or:[{username},{email}]
   })

   if (existedUser) { throw new apiError(409,"user with this email already exists")
      
   }

   const avataLocalPath = req.files?.avatar[0]?.path
  const coverImageLocalPath= req.files?.coverImage[0]?.path

  if (!avataLocalPath) {
   throw new apiError(400,"Avatar is required")
   
  }
  const avatar = await uploadOnCloudnary(avataLocalPath)
 const coverImage = await uploadOnCloudnary(coverImageLocalPath)

 if (!avatar) {throw new apiError(400,"avatar is required")
   
 }
 
const user= await User.create(
   {
      fullname,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email,
      password,
      username: username.toLowerCase()
   })

   const createdUser= await User.findById(user._id).select(
      "-passward  -refresToken"
   )
  if (!createdUser) {throw new apiError(500,"something went wrong whille registering the user")
   
  }

  return res.status(201).json(
   new apiResponse(200,createdUser,"user registered successfully")
  )

})

export {resisterUser}