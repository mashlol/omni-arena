var Player = require("../models/player");

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
            var newPlayer = new Player({
                id: newID,
                name: data.name,
                x: Math.round(Math.random() * 700 + 50),
                y: Math.round(Math.random() * 500 + 50),
                online: true
            });
            collections.players.add(newPlayer);
            connection.player = newPlayer;
            return {success: "Successfully logged in.", id: newID};
        }
    }
}