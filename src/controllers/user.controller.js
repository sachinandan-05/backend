import { asyncHandler } from "../utils/asyncHandler.js";

const resisterUser= asyncHandler(async(req,res)=>{
    res.status(200).json({
        massage:"ntube by sachii is going to be ready"
    })
})

export {resisterUser}