var Omni = require("omni");
var Players = require("./collections/players");
var Spells = require("./collections/spells");

var events = {
    login: require("./events/login"),
    spell: require("./events/spell"),
    disconnect: require("./events/disconnect"),
    connect: require("./events/connect"),
    respawn: require("./events/respawn")
}

var players = new Players();
var spells = new Spells();

var server = Omni.listen(1337, {players: players, spells: spells}, events);