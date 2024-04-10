import { asyncHandler } from "../utils/asyncHandler";
import { apiError } from "../utils/apiError";
import { apiResponse } from "../utils/apiResponse";
import { Playlist } from "../Models/playlist.model";
import { isValidObjectId, pluralize } from "mongoose";
import { Video } from "../Models/video.model";
import { json } from "express";


// --------------create playlist--------- 
const createPlaylist = asyncHandler(async(req,res)=>{
//take details from users
const {playlistName,discription}=req.body

if(!playlistName){
    throw new apiError(400,"name of playlist is required")
}

try {
    const newPlaylist = await Playlist.create(
        {
            playlist:playlistName,
            discription:discription || "playlist discription",
            videos:[],
            owner:req.user._id
    
    
        }
        )
        if (!newPlaylist) {
            throw new apiError(404,"cant create playlist with this info")
            
        }
    
        
        res
        .status(201)
        .json(new apiResponse(201, newPlaylist, "Playlist created successfully"))
    
    
    }

catch (error) {
    throw new apiError(400,error,"something went wrong while creating playlist:try again later")
    
}
})  //playlist created


// ----------get User's Playlist-------------

const getuserPlaylist =asyncHandler( async(req,res)=>{
    const {userId}=req.params
    // todo :get user playlist

    if (!isValidObjectId(userId)) {
        throw new apiError(400,"invalid user is provided for the playlist")
        
    }

    try {
        const userPlaylist= await Playlist.find({owner:userId})
    
        if (!userPlaylist || (await userPlaylist).length === 0) {
            throw new apiError(404,`No playlists exist for user ${userId}`)
            
        }
        res
        .status(200)
        .json(new apiResponse(200,userPlaylist,"User playlists fetched successfully"))
    } catch (error) {
        throw new apiError (500,error, "An error occured while getting userplaylist:try again later")
        
    }

}) //done

//--------------------getPlaylistByID--------------------

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if (!isValidObjectId(playlistId)) {
        throw new apiError(404, "Inavalid playlist id is provided : enter valid id to get playlist")
    }

    try {
        const playlist = await Playlist.findById(playlistId)
       // console.log(playlist, "playlist by id")

        if (!playlist) {
            throw new apiError(404, "No playlist found")
        }

        res
        .status(200)
        .json(new apiResponse(200, playlist, "Playlist has been fetched successfully"))

    } catch (error) {
        throw new apiError(500, error, "An error while getting playlist by id : try again later")
    }
})//Done!



// --------------adding videos in playlist--------

const addingVideoInPLaylist=asyncHandler(async(req,res)=>{

    const {playlistId,videosID}= req.params

    if (!(isValidObjectId(playlistId) || isValidObjectId(videosID))) {
        throw new apiError(404,"enter valid playlistId or videoID to add video in  playlist")
        
    }

    const playlist=  await Playlist.findById(playlistId)
    //check if playlist  exist or not
    if (!playlist) {
        throw new apiError(400, "playlist doesnot exist")
        
    }

    // check  Is video already exist in playlist

    if (playlist.videos.includes(videosID)) {
        throw new apiError (400,"video already exist in this playlist")
    }

    //add the video to the playlist
try {
        const videoAddedToPlaylist= await Playlist.findByIdAndUpdate(
            playlistId,
            {
                $push:{
                    videos:videosID
    
                }
            } //using $push to video adding to the vedeos array
            ,
            {
                new:true,
                validateBeforeSave:false
            }
        )
        res
        .status(202)
        .json(new apiResponse(202,videoAddedToPlaylist,"vedeo added successfully to playlist"))
} catch (error) {
    throw new apiError (500,"something went wrong while adding vedeo to the playlist")
    
}

    

})//done

// ----------delete video from the playlist--------------------

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if (!(playlistId || videoId)) {
        throw new apiError(404, "Invalid video or playlist id : Enter valid ids")
    }

    try {
        const playlistWithoutVideo = await Playlist.findOne({_id: playlistId, videos:videoId})
        
        if (!playlistWithoutVideo) {
            throw new apiError(404, "Video does not exist in playlist or playlist was not created")
        }

       // console.log(playlistWithoutVideo, "playlistWithoutVideo1")
         // Remove video from the playlist
        const indexOfVideoToBeRemoved = playlistWithoutVideo.videos.indexOf(videoId);
        /*
        The indexOf() function is a built-in JavaScript method used to
        find the index of the first occurrence of a specified value
        within an array.
        */

        if (indexOfVideoToBeRemoved > -1) {
            playlistWithoutVideo.videos.splice(indexOfVideoToBeRemoved, 1);
        }

        //console.log(playlistWithoutVideo, "playlistWithoutVideo2")
         // Save the modified playlist
        await playlistWithoutVideo.save();

        console.log(playlistWithoutVideo, "3")
        res
        .status(200)
        .json(new apiResponse(200, playlistWithoutVideo, "Video is removed from playlist"))
    } catch (error) {
        throw new apiError(500, error, "An error occured while removing video from playlist")
    }

})//DONE!

// ----------------------delete playlist------------------
const deletePlaylist =asyncHandler(async(req,res)=>{
    const {playlistId}=req.params

    if (!isValidObjectId(playlistId)) {
        throw  new apiError(400,"plalist id isnot valid:please provide a valid playlistId")
        
    }
    
try {
        const playlist= await Playlist.findById(playlistId)
    
        if (!playlist) {
            throw  new apiError (404 ,"playlist doesnot exist")
            
        }
    
        const removePlaylist = await Playlist.findByIdAndDelete(playlistId, {
            new:true,
            validateBeforeSave:false
        })
    
        res
        .status(204)
        .json(new apiResponse(204,removePlaylist,"playlist deleted successfully !!"))
} catch (error) {
    throw new apiError(400,"something went wrong while deleting playlist !!")
    
}
})

// ---------------------UpdatePlaylist------------------------

const UpdatePlaylist = asyncHandler(async(req,res)=>{
    const {playlistId}=req.params
    const {playlistName,discription}=req.body
try {
    
        if (!isValidObjectId(playlistId)) {
            throw  new apiError(400,"plalist id isnot valid:please provide a valid playlistId")
            
        }
        if (!playlistName) {
            throw new apiError(404, "Name is required to update the playlist");
        }
        const umpdatedPlaylist= await findByIdAndUpdate(playlistId,
            {
                playlist:playlistName,
                discription:discription
            },
            {new: true, validateBeforeSave: false})
    
            res 
            .status(202)
            json(new apiResponse(202,UpdatedPlaylist,"playlist info updated successfully"))
    
} catch (error) {
    throw new apiError(400,"something went wrong while updating playlist")
    
}

})



export{
    createPlaylist,
    getuserPlaylist,
    getPlaylistById,
    addingVideoInPLaylist,
    removeVideoFromPlaylist ,
    deletePlaylist,
    UpdatePlaylist

}