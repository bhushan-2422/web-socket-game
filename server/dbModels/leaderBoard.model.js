import { Double } from "mongodb";
import mongoose, { Schema } from "mongoose";

const leaderBoardSchema = new Schema(
    {
        roomName: {
            type: String,
            required: true
        },
        minPlayers:{
            type: Number,
            required: true
        },
        players:[
            {
                name:{
                    type: String
                }
            }
        ],
        timeToEscape:{
            type: Number,
            required: true
        },
        avgTimeToEscape:{
            type: Number,
            required: true
        }
    },{
        timestamps: true
    }
)

export const LeaderBoard = mongoose.model("LeaderBoard", leaderBoardSchema);