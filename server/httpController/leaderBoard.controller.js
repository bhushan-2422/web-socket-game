import { LeaderBoard } from "../dbModels/leaderBoard.model.js";

const saveData = async (room) => {

    try{

        const playerNames = room.players.map(player => player.name);
        const leaderBoard = await LeaderBoard.create(
            {
                roomName: room.roomId,
                minPlayers: room.minPlayers,
                players: playerNames,
                timeToEscape: room.timeToEscape,
                avgTimeToEscape: room.avgTime
            }
        )

    }catch(e){
        console.log("err while storing to data: ",e);
    }
}

const fetchLeaderBoardData = async () => {
    try {

        const leaderBoardData = await LeaderBoard
            .find()
            .sort({ avgTimeToEscape: 1 });

        return leaderBoardData;

    } catch (e) {
        console.log("err while fetching leaderboard data: ", e);
    }
}

export {saveData, fetchLeaderBoardData}