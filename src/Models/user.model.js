import mongoose, { Schema } from "mongoose";
import  jwt  from "jsonwebtoken";
import bcrypt from "bcrypt"
const userSchema=new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },
    
    
    fullname:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },
    avatar:{
        type:String, //cloudinary uri
        required:true
    },
    coverImage:{
        type:String, //cloudinary uri
        // required:true


    },
    email :{
        type:String,
        required:[true,"email must be required"],
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },
    watchHistory:[
        {
            type: Schema.Types.ObjectId,
            ref:"video"

        }
    ],
    passward :{
        type:String,
        required:[true, "passward is required"],
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },
    refreshToken:{
        type:String
    }


},{timestamps:true})
userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next();
    this.passward= await bcrypt.hash(this.passward,10)
    next()
})
userSchema.methods.isPasswardCorrect=async function(passward){
    return await bcrypt.compare(passward,this.passward);

}
userSchema.methods.generateAccessToken=function(){
    return  jwt.sign({

        _id:this._id,
        email:this.email,
        username:this.username,
        fullname:this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
        )
    }


    userSchema.methods.generateRefreshToken=function(){
    return  jwt.sign({
        _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
        )
    }


export const  User =mongoose.model("User",userSchema)