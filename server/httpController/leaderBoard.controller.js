import { LeaderBoard } from "../dbModels/leaderBoard.model.js";

const saveData = async (room) => {
    try{
        const leaderBoard = await LeaderBoard.create(
            {
                
            }
        )
    }catch(e){
        console.log("err while storing to data: ",e);
    }
}