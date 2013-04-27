var Omni = require("omni");

module.exports = Omni.Model.extend({
    defaults: {
        x: 0,
        y: 0,
        player: null,
        color: "#fff"
    },
    // TODO This method is super messy, could be nicer
    projectTowards: function(x, y, speed, collections, callback) {
        var deltaX = x - this.get('x');
        var deltaY = y - this.get('y');

        var magnitude = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));

        deltaX = (deltaX / magnitude) * speed;
        deltaY = (deltaY / magnitude) * speed;

        var _this = this;
        var lastProjectTime = Date.now();
        (function(x, y, callback, collections) {
            var moveLoop = function() {
                // Check if colliding with any players
                var playersInRoom = collections.players.where({room: _this.get('player').get('room')});
                for (var p in playersInRoom) {
                    var player = playersInRoom[p];
                    if (_this.get('player') != player && _this.approximatelyAt(player.get('x'), player.get('y'))) {
                        player.set('health', player.get('health') - 1);
                        if (player.get('health') <= 0) {
                            player.set('alive', false);
                            // collections.players.remove(player);
                        }
                        if (callback != undefined) {
                            callback(_this);
                        }
                        clearInterval(_this.projectionInterval);
                        return;
                    }
                }

                if (_this.isOffscreen()) {
                    if (callback != undefined) {
                        callback(_this);
                    }
                    clearInterval(_this.projectionInterval);
                    return;
                }
                var deltaTime = Date.now() - lastProjectTime;
                _this.move(deltaX * deltaTime, deltaY * deltaTime);
                lastProjectTime = Date.now();
                setTimeout(moveLoop, 20);
            }
            moveLoop();
        })(x, y, callback, collections);
    },
    move: function(deltaX, deltaY) {
        this.set("x", Math.round(this.get("x") + deltaX));
        this.set("y", Math.round(this.get("y") + deltaY));
    },
    approximatelyAt: function(x, y) {
        return this.get('x') > x - 30 && this.get('x') < x + 30
            && this.get('y') > y - 30 && this.get('y') < y + 30;
    },
    isOffscreen: function() {
        return this.get('x') <= 0 || this.get('x') >= 800
            || this.get('y') <= 0 || this.get('y') >= 600;
    },
    readPermission: function(connection, property) {
        if (property == "player") {
            return false;
        }
        if (connection.room == this.get('player').get('room')) {
            return true;
        }
        return false;
    }
});