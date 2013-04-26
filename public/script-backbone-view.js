Omni.ready(function() {
    var OmniArena = {
        player: null
    };

    var LoginView = Backbone.View.extend({
        events: {
            "submit #login": "login"
        },
        login: function(event) {
            var _this = this;
            var $input = _this.$el.find("input");
            if ($input.val()) {
                Omni.trigger("login", {
                    name: $input.val()
                }, function(data) {
                    console.log("response");
                    if (data.error != undefined) {
                        alert(data.error);
                    }
                    if (data.success != undefined && data.id != undefined) {
                        OmniArena.player = Omni.Collections.players.findWhere({id: data.id});
                        console.log(data.id);
                        _this.$el.find("#login").html("Logged in as " + OmniArena.player.get("name"));
                    }
                    console.log(data);
                });
                $input.val('');
            }

            event.stopPropagation();
            event.preventDefault();
            return false;
        }
    });

    var ArenaView = Backbone.View.extend({
        events: {
            "click canvas": "spellCast"
        },
        initialize: function() {
            this.setRequestAnimFrame();

            this.context = this.$el.find("canvas")[0].getContext("2d");

            $(window).on("keydown", this.onKeyDown.bind(this));
            $(window).on("keyup", this.onKeyUp.bind(this));

            this.keysDown = {};
            this.lastRenderTime = 0;

            this.gameLoop();
        },
        gameLoop: function() {
            var deltaTime = Date.now() - this.lastRenderTime;

            if (OmniArena.player != null) {
                if (this.keysDown[87]) { // W
                    OmniArena.player.set("y", OmniArena.player.get("y") - Math.round(deltaTime * 1.0));
                }

                if (this.keysDown[83]) { // S
                    OmniArena.player.set("y", OmniArena.player.get("y") + Math.round(deltaTime * 1.0));
                }

                if (this.keysDown[65]) { // A
                    OmniArena.player.set("x", OmniArena.player.get("x") - Math.round(deltaTime * 1.0));
                }

                if (this.keysDown[68]) { // D
                    OmniArena.player.set("x", OmniArena.player.get("x") + Math.round(deltaTime * 1.0));
                }
            }

            this.render();
            this.lastRenderTime = Date.now();
            requestAnimationFrame(this.gameLoop.bind(this));
        },
        render: function() {
            this.context.clearRect(0, 0, 800, 600);
            Omni.Collections.players.each(this.renderPlayer, this);
            Omni.Collections.spells.each(this.renderSpell, this);
        },
        renderPlayer: function(player) {
            var x = player.get('x');
            var y = player.get('y');

            this.context.beginPath();
            this.context.arc(x, y, 25, 0, Math.PI * 2);
            this.context.lineWidth = 3;

            this.context.strokeStyle = "white";
            this.context.stroke();

            this.context.fillStyle = "white";
            this.context.font = "16px Helvetica";
            this.context.textAlign = 'center';
            this.context.fillText(player.get('name'), x, y - 40);
        },
        renderSpell: function(spell) {
            var x = spell.get('x');
            var y = spell.get('y');

            this.context.beginPath();
            this.context.arc(x, y, 2, 0, Math.PI * 2);
            this.context.lineWidth = 4;

            this.context.strokeStyle = "yellow";
            this.context.stroke();
        },
        onKeyDown: function(event) {
            console.log(event.keyCode + " down");
            this.keysDown[event.keyCode] = true;
        },
        onKeyUp: function(event) {
            console.log(event.keyCode + " up");
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