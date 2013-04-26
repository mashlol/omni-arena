var Omni = require("omni");

module.exports = Omni.Model.extend({
    defaults: {
        online: false,
        x: 0,
        y: 0,
        name: "Player"
    },
    readPermission: function(connection, property) {
        if (this.get("online") === true ) {
            return true;
        }
        return false;
    },
    writePermission: function(connection, property) {
        if (connection.player != null && connection.player == this) {
            return true;
        }
        return false;
    }

});