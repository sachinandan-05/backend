import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema=new mongoose.Schema(
    {
        videoFile:{
            type:String,
            required:true,

        },
        thumbNail:{
            type:String,
            required:true
        },
        title:{
            type:String,
            required:true
        },
        discription:{
            type:String,
            required:true
        },
        duration:{
            type:Number,
            // required:true
        },
        veiws:{
            type:Boolean,
            default:true
        },
        isPublished:{
            type:Boolean,
            default:true
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User"
        }

    },
    {
        timestamps:true
    })
    videoSchema.plugin(mongooseAggregatePaginate)
export const Video =mongoose.model("Video",videoSchema)