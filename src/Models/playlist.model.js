import mongoose ,{Schema}from "mongoose"
const playlistSchema=new Schema({
    playlist:{
        type:String,
        required:[true,"name of playlist must be required"],
        lowercase:true,
        trim:true
    },
    
    discription:{
        type:String,
        lowercase:true,
        
    },
    videos:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
        }
        ],
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
    


},{timestamps:true})

export const Playlist =mongoose.model("Playlist",playlistSchema)