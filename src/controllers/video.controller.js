import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Video } from "../Models/video.model.js";
import {json, query  }from "express";
import { uploadOnCloudnary } from "../utils/cloudnary.js";

//get all video
//pulishvideo
//edit info
//delete video

//----------------------get all videos-------------------------

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, user_Id } = req.query
    //TODO: get all videos based on query, sort, pagination
    if (!(query || isValidObjectId(user_Id))) {
        throw new apiError(400, "Required field: query or userId")
    }
    console.log(query, sortType, sortBy, user_Id,"query, sortType, sortBy, sortBy")
    try{
      // Parse page and limit parameters
        const pageNumber = parseInt(page);
        const pageLimit = parseInt(limit);

      // Calculate the skip value for pagination
      const skip = (pageNumber - 1) * pageLimit;
    
        console.log(pageLimit, skip, pageLimit, "from video pagelimit")
      // creating pipelines
    let pipeline = [
        {
            $match: {
            $or: [
                { title: { $regex: query, $options: "i" } },
                { description: { $regex: query, $options: "i" } },
                { owner:new mongoose.Types.ObjectId(user_Id) }
            ]
            }/* This stage matches documents based on the specified criteria: matching the title or description fields using case-insensitive regular expressions ($regex), or matching the owner field with the provided user_Id*/
        },

            {
        $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "ownerDetails",
            pipeline:[
            {
                $project: {
                    username:1,
                    fullName:1,
                    avatar:1,
                    coverImage:1,
                    email:1
                
                }
            },
            {
                $addFields:{
                    ownerDetails:{
                    $first:"$ownerDetails"
                }
            }
            }
        ],
        
        }/*This stage performs a left outer join with the "users" collection.It adds a new field to each document called "owner", which contains the details of the user who owns the video.The localField specifies the field from the current collection (Video) to match.The foreignField specifies the field from the "users" collection to match.The as option specifies the name of the field to add to each document.Overall, this pipeline is used to retrieve videos based on the provided query and include information about the owner of each video by performing a lookup operation with the "users" collection.*/
    },

        {
            $lookup: {
            from: "comments",
            localField: "_id",
            foreignField: "video",
            as: "commentsOnVideo",
            pipeline:[
            {
                $project: {
                    content: 1,
                },
            },  
            { 
                $addFields:{
                    commentsOnVideo : "$commentsOnVideo"
                }
            }
        ]
            }/*This stage performs a left outer join with the "comments" collection.It adds a new field to each document called "comments", which contains the comments made on the video.The localField specifies the field from the current collection (Video) to match.The foreignField specifies the field from the "comments" collection to match.The as option specifies the name of the field to add to each document.Overall, this pipeline is used to retrieve videos based on the provided query and include information about the owner of each video by performing a lookup operation with the "users" collection.*/
        },

            {  
            $lookup:{
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likesOnVideo",
                pipeline:[
                {
                    $project: {
                        tweet:1,
                        likedBy:1,
                        comment:1 
                    },
                },
                {
                    $addFields:{
                        likesOnVideo:"$likesOnVideo" // all the likes on each video
                    }
                }
            ]
           } /* This stage performs a left outer join with likes */
        },

            {
                $lookup:{
                from: "playlists",
                alField: "_id",
                foreignField: "video",
            as: "PlaylistsOnVideo",
            pipeline:[
                {
                    $project:{
                    title:1,
                    description:1,
                    owner:1
                }
            },{
                $addFields:{
                    PlaylistsOnVideo:"$PlaylistsOnVideo" // all the playlists on each video
                }
            }
        ]
         }/*this stage performs same things as above on playlist */
        }, 

            {
            $sort:{
                
                    [sortBy]: sortType === "desc" ? -1 : 1 ,
                     createdAt: -1  // Sort by createdAt in descending order as an option newest first
                    
          } //sort by ascending (1) or descending (-1)order
        },

       // Skip documents for pagination
        { $skip: skip },

       // Limit documents for pagination
        { $limit: pageLimit }
    ]
    console.log(pipeline, "pipeline of videos");  
    if (!pipeline || pipeline.length === null ) {
        throw new apiError(500, "Loading Failed : Please try again later")
    }

    const video = await Video.aggregate(pipeline);

    console.log(video, "from pipeline getallvideos")

    if (!(video || video.length === (0 || null))) {
        throw new apiError(500, "Failed to getallvideos. Please try again later")
    }
    res
    .status(200)
    .json(new apiResponse(200, video, "Video Retrived Successfully"))
    
    } catch (error) {
        throw new apiError(500,error, "Some error occurred while getting your video") 
    }
})//Done loading videos from database






// ----------------------publishVideo----------------------------
const  publishVideo= asyncHandler(async(req,res)=> {

    const { title,discription }=req.body
    console.log(title,discription);

    if (
        [title,discription].some((field)=>field?.trim()==="")
    ) {
        throw new apiError("all fields are required")
        
    }

    const videoFileLocalPath=req.files?.videoFile[0].path //storing in local memo
    const thumbNailLocalPath=req.files?.thumbNail[0].path
    console.log(thumbNailLocalPath);

    if (!videoFileLocalPath) {
        throw new apiError(400,"video is required")
        }
    if (!thumbNailLocalPath) {
        throw new apiError(400,"thumbNail  is required")
    }

    const videoFile= await uploadOnCloudnary(videoFileLocalPath) //uploading on cloudinary
    const thumbNail= await uploadOnCloudnary(thumbNailLocalPath)
    if (!videoFile) {
        throw new apiError(404,"video file is not uploded on cloudinary")
        
        
    }
    console.log(videoFile);
    if (!thumbNail) {
        throw new apiError(404," thumbnail is not uploded on cloudinary")
        
    }

    
        const video= await Video.create({
            
            title:title,
            discription:discription,
            videoFile:videoFile.url,
            thumbNail:thumbNail.url,
    
        })
        console.log(video);
        if (!video) {
            throw new apiError(404,"video doesnot exist")
            
        }
    
        res
        .status(201)
        .json( new apiResponse(201,video.title,"video published successfully"))



})

export{
    publishVideo,
    getAllVideos,
}