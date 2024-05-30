import mongoose from "mongoose";
import apiError from "../utils/ApiError.js"
import {apiResponse} from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"


const healthCheck = asyncHandler(async (req, res) => {
    try {
        // Check database connectivity

        await mongoose.connection.db.admin().ping();

        // If the ping succeeds, respond with a 200 status

        res.json(new apiResponse(200, { status: "OK", message: "Service is running and operational" }));

    } catch (error) {
        // If an error occurs, indicate that the service is not operational
        throw new apiError(500, error, "Database connection failed on healthCheck");
    }
});//DONE!


export {
    healthCheck
    }
    