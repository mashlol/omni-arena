var Omni = require("omni");
var Players = require("./collections/players");
var Spells = require("./collections/spells");

var players = new Players();
var spells = new Spells();

var collections = {
    players: players,
    spells: spells,
    playerCount: new Omni.Collection([{id: 1, count: 0}])
}

var events = {
    login: require("./events/login"),
    spell: require("./events/spell"),
    disconnect: require("./events/disconnect"),
    connect: require("./events/connect"),
    respawn: require("./events/respawn")
}

var server = Omni.listen(1337, collections, events);