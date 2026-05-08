import { exits } from "../utils/exits.js";

class Room{
    constructor(roomId, minPlayers){
        this.roomId = roomId;
        this.minPlayers = parseInt(minPlayers);
        this.players = [];
        this.activePlayers = 0;
        this.state = "WAITING"
        this.exits = this.createExits()
        this.avgTime = 0;
        this.gameStartTime;
        this.timeToEscape = 0;
        this.escapedPlayers = 0;
        this.totalEscapeTime = 0;
    }

    isPlayerExist(socket){
        return this.players.find((p) => p.id === socket.id)
    }

    isFilled(){
        return this.players.length >= this.minPlayers
    }

    createExits(){
        const shuffled = [...exits].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 2);
    }

    addExitTime(time){
        this.totalEscapeTime += time;
        this.escapedPlayers++;

        this.avgTime =
            this.totalEscapeTime / this.escapedPlayers;
    }
}

export {Room}