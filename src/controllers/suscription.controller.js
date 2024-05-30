import { asyncHandler } from "../utils/asyncHandler";
import { apiError } from "../utils/ApiError";
import { apiResponse } from "../utils/ApiResponse";
import { Subscription } from "../Models/suscription.model";



// ------------------------create channelsuscription document---------------------------------


const createChannel = asyncHandler(async (req, res) => {
    const { user_Id } = req.params;

    if (!isValidObjectId(user_Id)) {
    throw new apiError(404, "Invalid channel id :Try with valid id")        
    }

    try {
        const createdUserChannel = await Subscription.create(
            {
                channel: user_Id,
                subscriber:null
            }
        )

        if (!createdUserChannel) {
            throw new ApiError(404, "Couldn't create channel subscription")
        }

        res
        .status(201)
        .json(new apiResponse(201, createdUserChannel, "Your Videotube channel has been created successfully : "))
    } catch (error) {
        throw new apiError(500, error, "Something went wrong while creating your subscription")
    }
})//DONE!

/*----------------------TOGGLESUBSCRIPTION----------------*/

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channel_Id } = req.params;

    // TODO: toggle subscription
    if (!isValidObjectId(channel_Id)) {
        throw new apiError(404, "Enter valid channel_Id to toggle subscription")
    }
  
    try {
        const subscription = await Subscription.findOne({_id:channel_Id})
    
        console.log(subscription,"subscription")

        if (!subscription) {
            throw new apiError(404, "Could not find channel for toggling subscription")
        }
        
        if (subscription.channel.toString() === req.user._id.toString()) {
            throw new apiError(404, "You can not toggle subscription of  your own channel")
        }

        if (req.user && subscription.subscriber) { 
            subscription.subscriber = null;
            await subscription.save();
            res
            .status(200)
            .json(new apiResponse(200, subscription, "Subscription toggled successfully"))
        }

        else if (req.user) {
            subscription.subscriber = req.user._id;
            await subscription.save();
            res
            .status(200)
            .json(new apiResponse(200, subscription, "Subscription toggled successfully"))
        }
        else {
            throw new apiError(403, "User not authenticated")
        }
    } catch (error) {
        throw new apiError(500, error, "Something went wrong while toggling your subscription: Try again later")
    }
    
})//DONE!


/*---------------------------GETUSERcHANNELSUBSCRIBERS-----------*/

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channel_Id } = req.params
    
    if (!isValidObjectId(channel_Id)) {
        throw new apiError(404, "Tyr againn with valid channel id")
    }

    try {
        const channelSubscriptions = await Subscription.find({channel:channel_Id}) 
        /* 
        channelSubscription is an array of subscription documents, 
        not a single document.
        So, we need to iterate over channelUsers to access each subscriber's ID.
         */

        if (!channelSubscriptions || channelSubscriptions.length === 0) {
            throw new apiError(404, "No such channel exists")
        }
        
        const subscriberIds = channelSubscriptions.map(subscription => subscription.subscriber) //this will return array

        // The subscriberIds array contains the IDs of all subscribers to the specified channel.
        console.log(subscriberIds,"subcriberIds")

        res
        .status(200)
        .json(new apiResponse(200,subscriberIds,"Channel Subscriber fetched successfully"));

    } catch (error) {
        throw new apiError(500, error, "Something went wrong while getting subscribers :Please try again later")
    }
})//DONE!


/*------------------------GETSUBSCRIBERcHANNELS----------------*/

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    
    if (!isValidObjectId(subscriberId)) {
        throw new apiError(404, "Try again with a valid subscriber id")
    }

    try {
        const userSubscriptions = await Subscription.find({subscriber:subscriberId}) 
        /* 
        userSubscription is an array of subscription documents, 
        not a single document.
        So, we need to iterate over Usersubscription to access each channel`s ID.
         */

        if (!userSubscriptions || userSubscriptions.length === 0) {
            throw new apiError(404, "You have not subscribed to any channels")
        }
        
        const channelIds = userSubscriptions.map(subscription => subscription.channel) //this will return array

        // The channelIds array contains the IDs of all channels which are being subscribed by user.
        console.log(channelIds,"channelIds")
        
        res
        .status(200)
        .json(new apiResponse(200,channelIds,"Subscribed channels fetched successfully"));

    } catch (error) {
        throw new apiError(500, error, "Something went wrong while getting subscribers :Please try again later")
    }
})//DONE!


export {
    createChannel,
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}





export{createChannel}


