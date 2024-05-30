import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../Models/tweet.model.js"
import { User } from "../Models/user.model.js"
import {apiError} from "../utils/ApiError.js"
import {apiResponse} from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"

/*---------------------CreateTweet-------------------*/

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {tweetToBeCreated} = req.body;

    // console.log(tweetToBeCreated, "tweet")
    if (!tweetToBeCreated) {
        throw new apiError(404, "No tweet created by user")
    }

    try {
        const createdTweet = await Tweet.create(
            {
                content:tweetToBeCreated,
                owner:req.user._id
             })
      console.log(createdTweet,"created tweet")       
      if (!createdTweet) {
          throw new apiError(500, "Tweet could not be created")
      }
      res
      .status(200)
      .json(new apiResponse(200, createdTweet,"Tweet created successfully"))

    } catch (error) {
        throw new apiError(500, error, "Error creating tweet")
    }
})//DONE!

/*-------------------GetUserTweet--------------------*/

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {user_Id} = req.params
    
    if (!(user_Id || isValidObjectId(user_Id))) {
        throw new apiError(404, "Enter user id to get user tweets")
    }
   
   try {
     const userTweets = await Tweet.find({owner : user_Id}).exec()
 
     if (!(userTweets || userTweets.length === 0)) {
         throw new apiError(500, `Can not fetch user ${user_Id} tweets at thid moment : try again later`)
     }
 
     res
     .status(200)
     .json(new apiResponse(200, userTweets, "User Tweets fetched"))
 
   } catch (error) {
     throw new apiError(500, error, "Could not fetch user tweets at thid moment")
   }
})//DONE!

/*------------UPDATE TWEET----------------*/

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweet_Id} = req.params
    const {tweet} = req.body

    //console.log(tweet,tweet_Id ,"tweet and its id")

    if (!(tweet || tweet_Id)) {
        throw new apiError(403, "tweet or tweet_Id is not provided")
    }
    try {
        const existingTweets = await Tweet.findOne({ _id: tweet_Id, owner: req.user._id });
        console.log(existingTweets,"Tweets fetched")
        if (!existingTweets) {
            console.log(existingTweets, "not auhtenticated user")
             throw new apiError(401, `Tweet not found u can not update this: ${req.user.username} :tweet`)
        }
        const updatedTweet = await Tweet.findByIdAndUpdate(tweet_Id,
                  {
                    content : tweet
                  }
                  ,{new :true,validateBeforeSave:false}
             )

        if (!updatedTweet) {
            throw new apiError(403, "Something went wrong")
        }

        res
        .status(200)
        .json(new apiResponse(200, updatedTweet, "Tweet has been updated"))

    } catch (error) {
        throw new apiError(500, error, "Error updating tweet : Try again later")
    }
})//DONE!

/*--------------------DELETEtWEET----------------*/

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweet_Id} = req.params

    if (!tweet_Id) {
        throw new apiError(404,"Enter tweet_Id tp delete tweet")
    }

    try {
        if (!isValidObjectId(tweet_Id)) {
            throw new apiError(404,"Invalid tweet_Id :Enter valid tweet_Id")
        }

        const tweet = await Tweet.findById(tweet_Id)

        if (!( tweet || ( tweet.owner.toString() !== req.user._id.toString()) )){
                throw new apiError(403, "You can not delete this tweet")
        }
        
       const deleteTweet = await Tweet.deleteOne({_id:tweet_Id})

       if (!deleteTweet) {
        throw new apiError(500, "Delete tweet failed")
       }

       res
       .status(200)
       .json(new apiResponse(200, deleteTweet, "Your tweet has been deleted"))

    } catch (error) {
        throw new apiError(500, error, "Something went wrong while deleting your tweet :Try again")
    }
})//DONE!

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}