import { Router } from "express";
import { createPlaylist,
    getuserPlaylist,
    getPlaylistById,
    addingVideoInPLaylist,
    removeVideoFromPlaylist ,
    deletePlaylist,
    UpdatePlaylist
} from "../controllers/playList.controller.js";

const router =Router()

router.route("/create").post(createPlaylist)

export default router;