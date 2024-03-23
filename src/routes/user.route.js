import { Router } from "express";
import { resisterUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router= Router()
router.route("/register").post(
    upload.fields([
        { 
            name:"avtar",
            maxCount:1

        }
        ,
        {
            name:"coverImage",
            maxCount:1
         }
    ])
    ,resisterUser)

export default router;