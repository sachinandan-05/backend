import { Router } from "express";
// import { verifyJWT } from "../middlewares/auth.middleware.js";
import { publishVideo } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/upload").post(
    upload.fields([
        {
            name:"videoFile",
            maxCount:1
        },
        {
            name:"thumbNail",
            maxCount:1
        }
    ]),publishVideo)
export default router;