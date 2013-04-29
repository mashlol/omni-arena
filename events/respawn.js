module.exports = {
    run: function(connection, collections, data) {
        if (!connection.player) {
            return {error: "Not logged in."};
        }

        if (connection.player.get('alive')) {
            return {error: "Still alive."};
        }

        var room = collections.players.findRoom();

        connection.room = room;
        connection.player.set({
            room: room,
            health: 10,
            alive: true,
            x: Math.round(Math.random() * 700 + 50),
            y: Math.round(Math.random() * 500 + 50),
        });

        connection.recheckAllPermissions();
        for (var x in connection.connections) {
            var con = connection.connections[x];
            if (con.player && con.player.get("room") == room) {
                con.recheckAllPermissions();
            }
        }

        return {success: "Respawned", id: connection.player.id};
    }
}