Omni.ready(function() {
    var OmniArena = {
        player: null,
        events: {},
        on: function(event, callback) {
            if (this.events[event] == null) {
                this.events[event] = [];
            }
            this.events[event].push(callback);
        },
        trigger: function(event) {
            if (this.events[event] != null) {
                for (var x in this.events[event]) {
                    this.events[event][x]();
                }
            }
        }
    };

    var LoginView = Backbone.View.extend({
        events: {
            "submit #login": "login",
            "submit #respawn": "respawn"
        },
        initialize: function() {
            var _this = this;
            OmniArena.on("update:player", function() {
                OmniArena.player.on("change:alive", _this.checkIfDead.bind(_this));
            });
        },
        login: function(event) {
            var _this = this;
            var $input = _this.$el.find("input");
            if ($input.val()) {
                Omni.trigger("login", {
                    name: $input.val()
                }, function(data) {
                    if (data.error != undefined) {
                        alert(data.error);
                    }
                    if (data.success != undefined && data.id != undefined) {
                        OmniArena.player = Omni.Collections.players.findWhere({id: data.id});
                        OmniArena.trigger("update:player");
                        OmniArena.trigger("login");
                        _this.$el.hide();
                        $("#arena").removeClass("fade-out");
                    }
                });
                $input.val('');
            }

            event.stopPropagation();
            event.preventDefault();
            return false;
        },
        checkIfDead: function(model, options) {
            if (model.get('alive') === false) {
                this.$el.show();
                this.$el.html($("<form>").attr({id: "respawn", onsubmit: "return false;"}).html("You have died.").append($("<button>").html("Respawn")));
                $("#arena").addClass("fade-out");
            }
        },
        respawn: function(event) {
            var _this = this;
            Omni.trigger("respawn", {}, function(data) {
                OmniArena.player = Omni.Collections.players.findWhere({id: data.id});
                OmniArena.trigger("update:player");
                _this.$el.html('');
                $("#arena").removeClass("fade-out");
            });

            event.stopPropagation();
            event.preventDefault();
            return false;
        }
    });

    var ArenaView = Backbone.View.extend({
        initialize: function() {
            this.setRequestAnimFrame();

            this.context = this.$el.find("canvas")[0].getContext("2d");

            // Bind to window so the events don't have to occur while the canvas is focused
            $(window).on("keydown", this.onKeyDown.bind(this));
            $(window).on("keyup", this.onKeyUp.bind(this));
            $(window).on("click", this.spellCast.bind(this));

            this.keysDown = {};
            this.lastRenderTime = 0;
            this.frameCount = 0;
            this.startTime = Date.now();

            this.gameLoop();

            var _this = this;
            OmniArena.on("login", function() {
                console.log(Omni.Collections.playerCount.at(0));
                Omni.Collections.playerCount.at(0).on("change:count", _this.updateOnline.bind(_this));
                _this.updateOnline(Omni.Collections.playerCount.at(0));
            });
            this.updateOnline(Omni.Collections.playerCount.at(0));

            OmniArena.on("update:player", function() {
                OmniArena.player.on("change:kills", _this.updateKills.bind(_this));
                OmniArena.player.on("change:deaths", _this.updateKills.bind(_this));
            });
        },
        updateKills: function(model) {
            console.log("hur");
            this.$el.find(".kills-deaths").html("Kills: " + model.get("kills") + " - Deaths: " + model.get("deaths"));
        },
        updateOnline: function(model) {
            console.log("helu");
            this.$el.find(".online-players").html("Players Online: " + model.get("count"));
        },
        elapsedTime: function() {
            return Date.now() - this.startTime;
        },
        gameLoop: function() {
            var deltaTime = Date.now() - this.lastRenderTime;

            if (OmniArena.player != null) {
                var newLoc = {
                    x: OmniArena.player.get('x'),
                    y: OmniArena.player.get('y')
                }
                if (this.keysDown[87]) { // W
                    newLoc.y -= Math.round(deltaTime * 1.0);
                }

                if (this.keysDown[83]) { // S
                    newLoc.y += Math.round(deltaTime * 1.0);
                }

                if (this.keysDown[65]) { // A
                    newLoc.x -= Math.round(deltaTime * 1.0);
                }

                if (this.keysDown[68]) { // D
                    newLoc.x += Math.round(deltaTime * 1.0);
                }

                if (newLoc.x < 50) { newLoc.x = 50; }
                if (newLoc.x > 750) { newLoc.x = 750; }
                if (newLoc.y < 50) { newLoc.y = 50; }
                if (newLoc.y > 550) { newLoc.y = 550; }

                // Quelch every other message to throttle the amount of data being sent to the server
                if (this.frameCount % 2 == 0) {
                    OmniArena.player.set(newLoc, {silent: true});
                } else {
                    OmniArena.player.set(newLoc);
                }
            }

            this.render();
            this.lastRenderTime = Date.now();
            requestAnimationFrame(this.gameLoop.bind(this));

            this.frameCount++;
        },
        render: function() {
            this.context.clearRect(0, 0, 800, 600);
            Omni.Collections.players.each(this.renderPlayer, this);
            Omni.Collections.spells.each(this.renderSpell, this);
        },
        renderPlayer: function(player) {
            if (!player.get('alive')) { return; }
            var x = player.get('x');
            var y = player.get('y');

            // Circle
            this.context.beginPath();
            this.context.arc(x, y, 25, 0, Math.PI * 2);
            this.context.lineWidth = 3;

            this.context.strokeStyle = player.get('color');
            this.context.stroke();

            // Name
            this.context.fillStyle = player.get('color');
            this.context.font = "16px Helvetica";
            this.context.textAlign = 'center';
            this.context.fillText(player.get('name'), x, y - 50);

            // Health
            this.context.fillStyle = "#555";
            this.context.fillRect(x-25, y-40, 50, 5);

            this.context.fillStyle = player.get('color');
            this.context.fillRect(x-25, y-40, player.get('health') / 10 * 50, 5);
        },
        renderSpell: function(spell) {
            var x = spell.get('x');
            var y = spell.get('y');

            this.context.beginPath();
            this.context.arc(x, y, 2, 0, Math.PI * 2);
            this.context.lineWidth = 4;

            this.context.strokeStyle = spell.get('color');
            this.context.stroke();
        },
        onKeyDown: function(event) {
            this.keysDown[event.keyCode] = true;
        },
        onKeyUp: function(event) {
            this.keysDown[event.keyCode] = false;
        },
        spellCast: function(event) {
            Omni.trigger("spell", {
                x: event.clientX - this.$el.find("canvas").offset().left,
                y: event.clientY - this.$el.find("canvas").offset().top
            })
        },
        setRequestAnimFrame: function() {
            requestAnimationFrame = window.requestAnimationFrame        ||
                                    window.mozRequestAnimationFrame     ||
                                    window.webkitRequestAnimationFrame  ||
                                    window.msRequestAnimationFrame
            if (requestAnimationFrame) {
                window.requestAnimationFrame = requestAnimationFrame
            } else {
                window.requestAnimationFrame = function (callback) {
                    setTimeout(callback, 17);
                }
            }
        }
    });

    new LoginView({el: $(".login-container")});
    new ArenaView({el: $(".arena-container")});
});