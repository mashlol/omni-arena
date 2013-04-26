var Spell = require("../models/spell");

module.exports = {
    run: function(connection, collections, data) {
        if (connection.player == null) {
            return {error: "Invalid spell event"};
        }
        if (data.x == null || data.y == null) {
            return {error: "Invalid spell event"};
        }
        var newID = collections.spells.nextID();
        var newSpell = new Spell({
            id: newID,
            x: connection.player.get('x'),
            y: connection.player.get('y')
        });
        collections.spells.add(newSpell);
        newSpell.projectTowards(data.x, data.y, 1000, function(spell) {
            collections.spells.remove(spell);
        });
    }
}