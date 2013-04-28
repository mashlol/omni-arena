var Player = require("../models/player");

function getRandomColor() {
    var letters = '0123456789ABC'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.round(Math.random() * (letters.length-1))];
    }
    return color;
}

module.exports = {
    run: function(connection, collections, data) {
        if (connection.player) {
            return {error: "Already logged in."};
        }
        if (data.name) {
            if (collections.players.where({name: data.name}).length > 0) {
                return {error: "Someone already has that name."};
            }
            var newID = collections.players.nextID();
            var room = collections.players.findRoom();
            var newPlayer = new Player({
                id: newID,
                name: data.name,
                x: Math.round(Math.random() * 700 + 50),
                y: Math.round(Math.random() * 500 + 50),
                color: getRandomColor(),
                room: room
            });
            connection.room = newPlayer.get('room');
            collections.players.add(newPlayer);
            connection.player = newPlayer;
            connection.recheckAllPermissions();

            // Increment player count
            var playerCount = collections.playerCount.at(0);
            playerCount.set('count', playerCount.get('count') + 1);

            return {success: "Successfully logged in.", id: newID};
        }
    }
}