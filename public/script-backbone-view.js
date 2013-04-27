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
                    if (data.error != undefined) {
                        alert(data.error);
                    }
                    if (data.success != undefined && data.id != undefined) {
                        OmniArena.player = Omni.Collections.players.findWhere({id: data.id});
                        _this.$el.remove();
                        $("#arena").removeClass("fade-out");
                        new HealthBarView({el: $(".health-container")});
                    }
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
            this.frameCount = 0;
            this.startTime = Date.now();

            this.gameLoop();
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

    var HealthBarView = Backbone.View.extend({
        initialize: function() {
            this.listenTo(OmniArena.player, "change:health", this.render);
            this.render();
        },
        render: function() {
            this.$el.find(".health-percent").html(Math.round(OmniArena.player.get('health') / 10 * 100));
            this.$el.find(".health-bar").css("width", OmniArena.player.get('health') / 10 * 300);
        }
    });

    new LoginView({el: $(".login-container")});
    new ArenaView({el: $(".arena-container")});
});