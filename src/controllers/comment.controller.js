import mongoose from "mongoose"
import { Comment } from "../Models/comment.model.js"
import {apiError} from "../utils/ApiError.js"
import { apiResponse } from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"

/*------------GETVIDECOMMENTS----------------*/

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { video_Id } = req.params
    const { page = 1, limit = 10 } = req.query
    
    console.log(video_Id, "video_id from request")

    if (!video_Id){
        throw new apiError(404,"enter valid video_id to find comments")
    }
    
    try {
        const videoComments = await Comment.find({video:video_Id}).skip((page-1)*limit).limit(limit).exec();
        // console.log(videoComments, "comments")
        if (!videoComments || videoComments.length === 0) {
            throw new apiError(404,"Could not find comments for specified video")
        }
        
        res
        .status(200)
        .json(new apiResponse(200, videoComments, "All comments fetched successfully"))

    } catch (error) {
        throw new apiError(500, error, "Couldn't find video comments")
    }
})//DONE!


/*-------------ADDCOMMENT-----------------*/

const addComment = asyncHandler(async (req, res) => {
    // Extracting video ID from request parameters
    const { video_Id } = req.params;

    // Extracting comment content from request body
    const {commentContent} = req.body;

    // Logging video ID and comment content for debugging purposes
    console.log(video_Id, commentContent, "video id and comment");

    // Checking if video ID or comment content is missing
    if (!(video_Id || commentContent)) {
        // If either video ID or comment content is missing, throw an error
        throw new apiError(404, "Invalid video_Id or you have not written any comment");
    }

    try {
        // Creating a new comment document
        const newComment = await Comment.create({
            content: commentContent,
            video: video_Id,
            owner: req.user._id // Assuming user is authenticated and their ID is in req.user._id
        });

        // Checking if new comment was successfully created
        if (!newComment) {
            // If new comment is not created, throw an error
            throw new apiError(500, "Can not add a comment to video");
        }

        // Sending a success response with the newly created comment
        res
            .status(200)
            .json(new apiResponse(200, newComment, "Comment added successfully"));
    } catch (error) {
        // If an error occurs during the process, throw an error
        throw new apiError(500, error, "Some error occurred while adding comment");
    }
});//DONE!


/*----------------UPDATECOMMENT--------------*/

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {comment_Id} = req.params;

    const {newComment} = req.body;

    console.log(newComment, comment_Id, "Comment and video_Id ");

    if (!(comment_Id || newComment)) {
        throw new apiError(404, "Invalid comment_Id : can not update empty");
    }

    try {
        const updatedComment = await Comment.findByIdAndUpdate(comment_Id,
            {
                content: newComment
            },
            {
                new: true,
                validateBeforeSave: false
            })
        
            console.log(updatedComment,"Comment updated")

        res
        .status(200)
        .json(new apiResponse(200, updatedComment, "Comment updated successfully"))

    } catch (error) {
        throw new apiError(500, error, "Some error occurred while updating comment");
    }
}) //DONE!


/*--------------DELETECOMMENT--------------------*/

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {comment_Id} = req.params

    console.log(comment_Id,"Comment id")

    if (!comment_Id) {
        throw new apiError(404, "Enter Comment Id to delete comment")
    }

    try {
        const comment = await Comment.findById({_id:comment_Id})
        
        if (!comment) {
            throw new apiError(404, "comment not found : See if comment id is correct")
        }
       
        if (comment.owner.toString() !== req.user._id.toString()) {
            throw new apiError(403, "You are not allowed to delete this comment")
        }
        
        const deletedComment = await Comment.findByIdAndDelete(comment_Id)
        
        if (!deletedComment) {
            throw new apiError(500, "Comment could not deleted: try again")
        }

        res
        .status(200)
        .json(new apiResponse(200, deletedComment, "Comment deleted successfully"))
    } catch (error) {
        throw new apiError(500, "An error occured while deleting your comment: please try again later")
    }
})//DONE!


export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
    }