class Room{
    constructor(roomId, minPlayers){
        this.roomId = roomId;
        this.minPlayers = minPlayers;
        this.players = [];
        this.state = "WAITING"
    }

    isPlayerExist(socket){
        return this.players.find((p) => p.id === socket.id)
    }

    isFilled(){
        return this.players.length >= this.minPlayers
    }

}

export {Room}