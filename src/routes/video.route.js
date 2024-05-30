import { Router } from "express";
// import { verifyJWT } from "../middlewares/auth.middleware.js";
import {  publishVideo,
    getAllVideos,
    editInfoOfVideo,
    deleteVideo,
    togglePublishStatus } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
// import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
// router.use(verifyJWT) //applying verifyjwt to all router

/** 
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

*/

router
    .route("/")
    .get(getAllVideos)
    .post(
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1,
            },
            {
                name: "thumbnail",
                maxCount: 1,
            },
            
        ]),
        publishVideo
    );

router
    .route("/:video_Id") // you have to destruct req.params as video_Id in all the used methods here
    .get(getAllVideos)
    .delete(deleteVideo)
    .patch(upload.single("thumbnail"), editInfoOfVideo);

router.route("/toggle/publish/:video_Id").patch(togglePublishStatus);
router.route("/edit")

export default router

