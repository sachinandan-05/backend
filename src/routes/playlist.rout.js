import { Router } from "express";
import { createPlaylist,
    getuserPlaylist,
    getPlaylistById,
    addingVideoInPLaylist,
    removeVideoFromPlaylist ,
    deletePlaylist,
    UpdatePlaylist
} from "../controllers/playList.controller";

const playListrouter =Router()

playListrouter.route("/create").post(createPlaylist)

export default playListrouter;