import { Router } from "express";
import { createPlaylist,
    getuserPlaylist,
    getPlaylistById,
    addingVideoInPLaylist,
    removeVideoFromPlaylist ,
    deletePlaylist,
    UpdatePlaylist
} from "../controllers/playList.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js"
const router =Router()


router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file




router.route("/").post(createPlaylist)

router
    .route("/playlistId")
    .get(getPlaylistById)
    .patch(UpdatePlaylist)
    .delete(deletePlaylist)

router.route("/add/:videoId/:playlistId").patch(addingVideoInPLaylist)
router.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist)
router.route("/user/:userId/:").get(getuserPlaylist)



export default router;