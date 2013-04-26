module.exports = {
    run: function(connection, collections) {
        if (connection.player) {
            collections.players.remove(connection.player);
        }
    }
}