var Omni = require("omni");
var Spell = require("../models/spell");

module.exports = Omni.Collection.extend({
    model: Spell,
    nextID: function() {
        var highest = 0;
        this.each(function(model) {
            if (model.id && model.id > highest) {
                highest = model.id;
            }
        });
        return highest + 1;
    },
    createPermission: function(connection) {
        return true;
    }
});