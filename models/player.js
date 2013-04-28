var Omni = require("omni");

module.exports = Omni.Model.extend({
    defaults: {
        x: 0,
        y: 0,
        health: 10,
        name: "Player",
        color: "#fff",
        room: 0,
        alive: true,
        kills: 0,
        deaths: 0
    },
    readPermission: function(connection, property) {
        if (connection.room != null && connection.room == this.get('room')) {
            return true;
        }
        return false;
    },
    writePermission: function(connection, property) {
        if (connection.player != null && connection.player == this && property != "health") {
            return true;
        }
        return false;
    }

});