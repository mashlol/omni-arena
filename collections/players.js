var Omni = require("omni");
var Player = require("../models/player");

module.exports = Omni.Collection.extend({
    model: Player,
    nextID: function() {
        var highest = 0;
        this.each(function(model) {
            if (model.id && model.id > highest) {
                highest = model.id;
            }
        });
        return highest + 1;
    },
    findRoom: function() {
        var room = 1;
        while (true) {
            if (this.where({room: room, alive: true}).length < 2) {
                return room;
            }
            room++;
        }
    },
    createPermission: function(connection) {
        return true;
    }
});