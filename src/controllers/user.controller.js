import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import {User} from "../Models/user.model.js";
import { uploadOnCloudnary } from "../utils/cloudnary.js";
import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

const generateAccessAndRefreshTokens = async(userId) =>{
   try {
      const user= await User.findById(userId);
      const accessToken=await user.generateAccessToken();
      const refreshToken= await user.generateRefreshToken();

      user.refreshToken=refreshToken
      await user.save({ validateBeforeSave: false});

      return {accessToken,refreshToken};

      
   } catch (error) {
      throw new apiError(500,"something went wrong while generate refresh and refresh token")
      
   }
}

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

   const { fullname,email,username,passward}=req.body
   // console.log("email:",email, "username:",username,"fullname:",fullname,passward)

   //  
   if (
      [fullname,email,username,passward].some((field)=>field?.trim()==="")
   ) {
      throw new apiError(400,"all fields are required")
   }

   const existedUser= await User.findOne({
      $or:[{username},{email}]
   })

   if (existedUser) { throw new apiError(409,"user with this email already exists")
      
   }

   const avataLocalPath = req.files?.avatar[0]?.path
   const coverImageLocalPath= req.files?.coverImage[0]?.path
   console.log(avataLocalPath,coverImageLocalPath);

   if (!avataLocalPath) {
   throw new apiError(400,"Avatar is required")
   }
   const avatar = await uploadOnCloudnary(avataLocalPath)
   const coverImage = await uploadOnCloudnary(coverImageLocalPath)
   console.log(avatar.url);

   if (!avatar) {throw new apiError(400,"avatar is required")
   
   }
   
const user= await User.create(
   {
      fullname,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email,
      passward,
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

const loginUSer= asyncHandler(async(req,res)=>{
   //req.body se data le lo
   //cheak format
   //find the user
   //password cheak
   // generate access and refresh token 
   // send cookie

   const {email,username,passward}=req.body

   if (!(username || email)) 
   { throw new apiError(400,"please enter email or username!  is required")
      
   } 
   const user=await User.findOne({
      $or:[{email},{username}]
   })
   if (!user) {
      throw new apiError(404,"user does not exist")
      
   }

   if (!user) {
      throw new apiError(400,"this user is not resistred on ntube")
      
   }
   const isPasswardValid= await user.isPasswardCorrect(passward)

   if (isPasswardValid) {
      throw new apiError(401,"invalid user creadentials")
      
   }
   const {accessToken,refreshToken}= await generateAccessAndRefreshTokens(user._id)
   console.log("accessToken:",accessToken);

   const loggedInUser= await User.findById(user._id).
   select("-passward -refresToken")

   const options={
   httpOnly: true,
   secure: true
   }

   return res
   .status(200)
   .cookie("accessToken",accessToken,options)
   .cookie("refreshToken",refreshToken,options)
   .json(

   new apiResponse(200,
      {
         user:loggedInUser,refreshToken,accessToken
      },
      "user loggedIn successfully")
   )

})

const logoutUser =asyncHandler(async(req,res)=>{
   await User.findByIdAndUpdate(
      req.user._id,
      {
         $set:{
            refreshToken:undefined
         }
      }
      ,{
         new:true
      }
   )
   const options={
      httpOnly: true,
      secure: true
      }
   return res
   .status(200)
   .clearCookie("accessToken",options)
   .clearCookie("refreshToken",options)
   .json(new apiResponse(200,{},"successfully user logedout"))



})
const refreshAccessToken= asyncHandler(async()=>{
   const incomingRefreshToken= req.cookies.refreshToken || req.body.refreshToken

   if (!incomingRefreshToken) {
      throw new apiError(401,"unauthorized request")
      
   }

   try {
      const decodedToken= await jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
   
      const user=await user.findById(decodedToken?._id)
   
      if (!user) {
         throw new apiError(401,"invalid refresh token")
         
      }
      if (incomingRefreshToken !== user?.refreshToken) {
         throw new apiError(401,"refresh token expired or used")
         
      }
      const options={
         httpOnly: true,
         secure: secure
   
      }
      const {accessToken,newRefreshToken}= await generateAccessAndRefreshTokens(user._id)
   
      return res
      .status(200)
      .cookie("accesstoken",accessToken,options)
      .cookie("refreshtoken",newRefreshToken,options)
      .json(
         new apiResponse(200,
            {accessToken,newRefreshToken}),
            "Access token refresh"
      )
   
   
      
   } catch (error) {
      throw new apiError(400,"invalid refresh token")
      
   }


})
const changeCurrentPassward = asyncHandler(async(req,res)=>{
   //frontend se current passward and username or email lenge
   //will match data from database
   //ask for new passward 2 times and then update

   const{newPassward,oldPassward}=req.body

   const user = await User.findById(req.user?._id)
   const isPasswordCorrect = await user.isPasswardCorrect(oldPassward)

   if (!isPasswordCorrect) {
      throw new apiError(400, "Invalid old password")
   }

   user.passward=newPassward

   await user.save({validateBeforeSave:false})

   return res
   .status(200)
   .json(
      new apiResponse(200,{},"passward updated successfully")
   )
    // now?
})
const getCurrentUser = asyncHandler(async(req, res) => {
   return res
   .status(200)
   .json(new apiResponse(
      200,
      req.user,
      "User fetched successfully"
   ))
})

const updateAcountDetails = asyncHandler(async(req,res)=>{

   const {fullname,email}=req.body

   if (!(fullname || email)) {
      throw new apiError (400,"all fields are required")   
   }

   const user = User.findByIdAndUpdate(req.user?._id,
      {
         $set: {
            fullname:fullname,
            email:email
         }
            
         
      },{new:true})
      return res
      .status(200)
      .json(new apiResponse(200,user,"Account details updated successfully"))

})

const updateUserAvatar = asyncHandler(async(req,res)=>{

   const avataLocalPath = req.files?.path

   if (!avataLocalPath) {
      throw new apiError (400," avatar file is missing")
      
   }

   const avatar= await uploadOnCloudnary(avataLocalPath)

   if (!avatar.url) {
      throw new apiError(400,"error while uploding avatar")
      
   }
   // TODO delete old  avatar
   
   const user= await User.findByIdAndUpdate(
      {
         $set:{
            avatar:avatar.url
         }
      },
      {new:true}
   ).select("-passward")
   return res
   .status(200)
   .json(new apiResponse(200,user,"avatar image updated successfully"))




   
})

const updateCoverImage =asyncHandler(async(req,res)=>{

   const coverImageLocalPath =req.files?.path
   if (!coverImageLocalPath) {
      throw new apiError (400,"coverImage file is required")
      
   }
   const coverImage = await uploadOnCloudnary(coverImageLocalPath)
   if (!coverImage.url) {
      throw new apiError (400,"error while uploding cover image!!")
      
   }

   const user= await User.findByIdAndUpdate(req.user?._id,
      {
         $:{
            coverImage:coverImage.url
         }
      },{
         new:true
      }).select("-passward")
      
      return res
      .status(200)
      .json(200,user,"coverImage updated successfully")
})

const getUserChannelProfile= asyncHandler(async(req,res)=>{

   const username = req.prams

   if (!username?.trim()) {
      throw new apiError(400,"username is missing")
      
   }

   const channel = await User.aggregate([
      {
         $match:{
            username:username?.toLowerCase()
         }
      },
      {
         $lookup:{
            from: "subscriptions",
            localField:"_id",
            foreignField:"channel",
            as:"subscribers"
         }
      },
      {
         $lookup:{
            from: "subscriptions",
            localField:"_id",
            foreignField:"suscriber",
            as:"subscribedTo"
         }
      },
      {
         $addFields:{
            suscriberCount:{
               $size:"$subscribers"
            },
            channelSubscribedTOCount:{
               $size:"$subscribedTo"
            },
            isSubscribed:{
               $cond:{
                  if:{$in:[req.user?._id,"subscribers.subscriber"]},
                  then:true,
                  else:false
               }
            }
         }

      },
      {
         $project:{
            fullname:1,
            username:1,
            email:1,
            suscriberCount:1,
            channelSubscribedTOCount:1,
            isSubscribed:1,
            avatar:1,
            coverImage:1

         }
      }
   ])

   if (!channel.length) {
      throw new apiError(404,"channel doesnot exist")
      
   }

   return res
   .status(200)
   .json(new apiResponse(200,channel[0],"User channel fetched successfully"))




})
// ---------------watchHistory------------
const getWatchHistory = asyncHandler(async (req, res)=>{
   // req.user._id   this will give string not mongodb id this is is converted by mongoose internally into mongodb id as objectId("")

   const user = await User.aggregate([
      {
         $match:{
         _id:new mongoose.Types.ObjectId(req.user._id),// bcz mongooose will not converted this into id
         }
      },
      {
         $lookup:{
         from:"videos", //our Video model will be saved as videos on mogodb
         localField:"watchHistory",
         foreignField:"_id",
         as:"watchHistory",
         pipeline:[
            {
               $lookup:{
               from:"users",
               localField:"owner",
               foreignField:"_id",
               as:"owner",
               pipeline:[ // everthing will be added to owner filed only
                  {
                     $project:{
                        username:1,
                        fullName:1,
                        avatar:1
                     }
                  }
               ]
               }
            },
            {
               $addFields:{
               owner:{
                  $first:"$owner"
               }
               }
            }
      ]
   }
   }
   ])
   
   return res
      .status(200)
      .json(
         new apiResponse(
         200,
         user[0].watchHistory,
         "Watch History fetched"
         )
      )
   })



export {resisterUser,
   loginUSer,
   logoutUser,
   refreshAccessToken,
   changeCurrentPassward,
   getCurrentUser,
   updateAcountDetails,
   updateUserAvatar,
   updateCoverImage,
   getUserChannelProfile ,
   getWatchHistory}