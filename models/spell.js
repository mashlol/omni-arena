var Omni = require("omni");

module.exports = Omni.Model.extend({
    defaults: {
        x: 0,
        y: 0
    },
    // TODO This method is super messy, could be nicer
    projectTowards: function(x, y, duration, callback) {
        var deltaX = (x - this.get('x')) / duration;
        var deltaY = (y - this.get('y')) / duration;

        var _this = this;
        var lastProjectTime = Date.now();
        (function(x, y, callback) {
            var moveLoop = function() {
                if (_this.approximatelyAt(x, y)) {
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
        })(x, y, callback);
    },
    move: function(deltaX, deltaY) {
        this.set("x", Math.round(this.get("x") + deltaX));
        this.set("y", Math.round(this.get("y") + deltaY));
    },
    approximatelyAt: function(x, y) {
        return this.get('x') > x - 10 && this.get('x') < x + 10
            && this.get('y') > y - 10 && this.get('y') < y + 10;
    }
});