module.exports = {
    run: function(connection, collections) {
        if (connection.player) {
            collections.players.remove(connection.player);

            // Decrement player count
            var playerCount = collections.playerCount.at(0);
            playerCount.set('count', playerCount.get('count') - 1);
        }
    }
}