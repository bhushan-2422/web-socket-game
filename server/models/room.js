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
        this.avgTime += time/this.players.length;
    }
}

export {Room}