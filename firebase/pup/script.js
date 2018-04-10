const champion = {
    name: '',
    score: 0,
};

let fire,
    profile;

function loadGame() {
    /**
 * EvEmitter v1.0.2
 * Lil' event emitter
 * MIT License
 */

    /* jshint unused: true, undef: true, strict: true */

    (function (global, factory) {
        // universal module definition
        /* jshint strict: false */ /* globals define, module */
        if (typeof define == 'function' && define.amd) {
            // AMD - RequireJS
            define(factory);
        } else if (typeof module == 'object' && module.exports) {
            // CommonJS - Browserify, Webpack
            module.exports = factory();
        } else {
            // Browser globals
            global.EvEmitter = factory();
        }

    }(this, function () {

        'use strict';

        function EvEmitter() { }

        var proto = EvEmitter.prototype;

        proto.on = function (eventName, listener) {
            if (!eventName || !listener) {
                return;
            }
            // set events hash
            var events = this._events = this._events || {};
            // set listeners array
            var listeners = events[eventName] = events[eventName] || [];
            // only add once
            if (listeners.indexOf(listener) == -1) {
                listeners.push(listener);
            }

            return this;
        };

        proto.once = function (eventName, listener) {
            if (!eventName || !listener) {
                return;
            }
            // add event
            this.on(eventName, listener);
            // set once flag
            // set onceEvents hash
            var onceEvents = this._onceEvents = this._onceEvents || {};
            // set onceListeners object
            var onceListeners = onceEvents[eventName] = onceEvents[eventName] || {};
            // set flag
            onceListeners[listener] = true;

            return this;
        };

        proto.off = function (eventName, listener) {
            var listeners = this._events && this._events[eventName];
            if (!listeners || !listeners.length) {
                return;
            }
            var index = listeners.indexOf(listener);
            if (index != -1) {
                listeners.splice(index, 1);
            }

            return this;
        };

        proto.emitEvent = function (eventName, args) {
            var listeners = this._events && this._events[eventName];
            if (!listeners || !listeners.length) {
                return;
            }
            var i = 0;
            var listener = listeners[i];
            args = args || [];
            // once stuff
            var onceListeners = this._onceEvents && this._onceEvents[eventName];

            while (listener) {
                var isOnce = onceListeners && onceListeners[listener];
                if (isOnce) {
                    // remove listener
                    // remove before trigger to prevent recursion
                    this.off(eventName, listener);
                    // unset once flag
                    delete onceListeners[listener];
                }
                // trigger listener
                listener.apply(this, args);
                // get next listener
                i += isOnce ? 0 : 1;
                listener = listeners[i];
            }

            return this;
        };

        return EvEmitter;

    }));

    /*!
     * Unipointer v2.1.0
     * base class for doing one thing with pointer event
     * MIT license
     */

    /*jshint browser: true, undef: true, unused: true, strict: true */

    (function (window, factory) {
        // universal module definition
        /* jshint strict: false */ /*global define, module, require */
        if (typeof define == 'function' && define.amd) {
            // AMD
            define([
                'ev-emitter/ev-emitter'
            ], function (EvEmitter) {
                return factory(window, EvEmitter);
            });
        } else if (typeof module == 'object' && module.exports) {
            // CommonJS
            module.exports = factory(
                window,
                require('ev-emitter')
            );
        } else {
            // browser global
            window.Unipointer = factory(
                window,
                window.EvEmitter
            );
        }

    }(window, function factory(window, EvEmitter) {

        'use strict';

        function noop() { }

        function Unipointer() { }

        // inherit EvEmitter
        var proto = Unipointer.prototype = Object.create(EvEmitter.prototype);

        proto.bindStartEvent = function (elem) {
            this._bindStartEvent(elem, true);
        };

        proto.unbindStartEvent = function (elem) {
            this._bindStartEvent(elem, false);
        };

        /**
         * works as unbinder, as you can ._bindStart( false ) to unbind
         * @param {Boolean} isBind - will unbind if falsey
         */
        proto._bindStartEvent = function (elem, isBind) {
            // munge isBind, default to true
            isBind = isBind === undefined ? true : !!isBind;
            var bindMethod = isBind ? 'addEventListener' : 'removeEventListener';

            if (window.navigator.pointerEnabled) {
                // W3C Pointer Events, IE11. See https://coderwall.com/p/mfreca
                elem[bindMethod]('pointerdown', this);
            } else if (window.navigator.msPointerEnabled) {
                // IE10 Pointer Events
                elem[bindMethod]('MSPointerDown', this);
            } else {
                // listen for both, for devices like Chrome Pixel
                elem[bindMethod]('mousedown', this);
                elem[bindMethod]('touchstart', this);
            }
        };

        // trigger handler methods for events
        proto.handleEvent = function (event) {
            var method = 'on' + event.type;
            if (this[method]) {
                this[method](event);
            }
        };

        // returns the touch that we're keeping track of
        proto.getTouch = function (touches) {
            for (var i = 0; i < touches.length; i++) {
                var touch = touches[i];
                if (touch.identifier == this.pointerIdentifier) {
                    return touch;
                }
            }
        };

        // ----- start event ----- //

        proto.onmousedown = function (event) {
            // dismiss clicks from right or middle buttons
            var button = event.button;
            if (button && (button !== 0 && button !== 1)) {
                return;
            }
            this._pointerDown(event, event);
        };

        proto.ontouchstart = function (event) {
            this._pointerDown(event, event.changedTouches[0]);
        };

        proto.onMSPointerDown =
            proto.onpointerdown = function (event) {
                this._pointerDown(event, event);
            };

        /**
         * pointer start
         * @param {Event} event
         * @param {Event or Touch} pointer
         */
        proto._pointerDown = function (event, pointer) {
            // dismiss other pointers
            if (this.isPointerDown) {
                return;
            }

            this.isPointerDown = true;
            // save pointer identifier to match up touch events
            this.pointerIdentifier = pointer.pointerId !== undefined ?
                // pointerId for pointer events, touch.indentifier for touch events
                pointer.pointerId : pointer.identifier;

            this.pointerDown(event, pointer);
        };

        proto.pointerDown = function (event, pointer) {
            this._bindPostStartEvents(event);
            this.emitEvent('pointerDown', [event, pointer]);
        };

        // hash of events to be bound after start event
        var postStartEvents = {
            mousedown: ['mousemove', 'mouseup'],
            touchstart: ['touchmove', 'touchend', 'touchcancel'],
            pointerdown: ['pointermove', 'pointerup', 'pointercancel'],
            MSPointerDown: ['MSPointerMove', 'MSPointerUp', 'MSPointerCancel']
        };

        proto._bindPostStartEvents = function (event) {
            if (!event) {
                return;
            }
            // get proper events to match start event
            var events = postStartEvents[event.type];
            // bind events to node
            events.forEach(function (eventName) {
                window.addEventListener(eventName, this);
            }, this);
            // save these arguments
            this._boundPointerEvents = events;
        };

        proto._unbindPostStartEvents = function () {
            // check for _boundEvents, in case dragEnd triggered twice (old IE8 bug)
            if (!this._boundPointerEvents) {
                return;
            }
            this._boundPointerEvents.forEach(function (eventName) {
                window.removeEventListener(eventName, this);
            }, this);

            delete this._boundPointerEvents;
        };

        // ----- move event ----- //

        proto.onmousemove = function (event) {
            this._pointerMove(event, event);
        };

        proto.onMSPointerMove =
            proto.onpointermove = function (event) {
                if (event.pointerId == this.pointerIdentifier) {
                    this._pointerMove(event, event);
                }
            };

        proto.ontouchmove = function (event) {
            var touch = this.getTouch(event.changedTouches);
            if (touch) {
                this._pointerMove(event, touch);
            }
        };

        /**
         * pointer move
         * @param {Event} event
         * @param {Event or Touch} pointer
         * @private
         */
        proto._pointerMove = function (event, pointer) {
            this.pointerMove(event, pointer);
        };

        // public
        proto.pointerMove = function (event, pointer) {
            this.emitEvent('pointerMove', [event, pointer]);
        };

        // ----- end event ----- //


        proto.onmouseup = function (event) {
            this._pointerUp(event, event);
        };

        proto.onMSPointerUp =
            proto.onpointerup = function (event) {
                if (event.pointerId == this.pointerIdentifier) {
                    this._pointerUp(event, event);
                }
            };

        proto.ontouchend = function (event) {
            var touch = this.getTouch(event.changedTouches);
            if (touch) {
                this._pointerUp(event, touch);
            }
        };

        /**
         * pointer up
         * @param {Event} event
         * @param {Event or Touch} pointer
         * @private
         */
        proto._pointerUp = function (event, pointer) {
            this._pointerDone();
            this.pointerUp(event, pointer);
        };

        // public
        proto.pointerUp = function (event, pointer) {
            this.emitEvent('pointerUp', [event, pointer]);
        };

        // ----- pointer done ----- //

        // triggered on pointer up & pointer cancel
        proto._pointerDone = function () {
            // reset properties
            this.isPointerDown = false;
            delete this.pointerIdentifier;
            // remove events
            this._unbindPostStartEvents();
            this.pointerDone();
        };

        proto.pointerDone = noop;

        // ----- pointer cancel ----- //

        proto.onMSPointerCancel =
            proto.onpointercancel = function (event) {
                if (event.pointerId == this.pointerIdentifier) {
                    this._pointerCancel(event, event);
                }
            };

        proto.ontouchcancel = function (event) {
            var touch = this.getTouch(event.changedTouches);
            if (touch) {
                this._pointerCancel(event, touch);
            }
        };

        /**
         * pointer cancel
         * @param {Event} event
         * @param {Event or Touch} pointer
         * @private
         */
        proto._pointerCancel = function (event, pointer) {
            this._pointerDone();
            this.pointerCancel(event, pointer);
        };

        // public
        proto.pointerCancel = function (event, pointer) {
            this.emitEvent('pointerCancel', [event, pointer]);
        };

        // -----  ----- //

        // utility function for getting x/y coords from event
        Unipointer.getPointerPoint = function (pointer) {
            return {
                x: pointer.pageX,
                y: pointer.pageY
            };
        };

        // -----  ----- //

        return Unipointer;

    }));

    function FreeSegment(a, b) {
        this.type = 'FreeSegment';
        this.a = a;
        this.b = b;
        // orientations
        this.noon = {
            a: a,
            b: b
        };
        this.three = {
            a: { x: -a.y, y: a.x },
            b: { x: -b.y, y: b.x }
        };
        this.six = {
            a: { x: -a.x, y: -a.y },
            b: { x: -b.x, y: -b.y }
        };
        this.nine = {
            a: { x: a.y, y: -a.x },
            b: { x: b.y, y: -b.x }
        };
    }


    var proto = FreeSegment.prototype;

    proto.render = function (ctx, center, gridSize) {
        var ax = this.a.x * gridSize;
        var ay = this.a.y * gridSize;
        var bx = this.b.x * gridSize;
        var by = this.b.y * gridSize;
        ctx.strokeStyle = 'hsla(200, 80%, 50%, 0.7)';
        ctx.lineWidth = gridSize * 0.6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
        ctx.closePath();
    };


    function FixedSegment(a, b) {
        this.type = 'FixedSegment';
        this.a = a;
        this.b = b;
        // orientations
        this.noon = { a: a, b: b };
        this.three = { a: a, b: b };
        this.six = { a: a, b: b };
        this.nine = { a: a, b: b };
    }

    var proto = FixedSegment.prototype;

    proto.render = function (ctx, center, gridSize) {
        var ax = this.a.x * gridSize;
        var ay = this.a.y * gridSize;
        var bx = this.b.x * gridSize;
        var by = this.b.y * gridSize;
        ctx.strokeStyle = 'hsla(30, 100%, 40%, 0.6)';
        ctx.lineWidth = gridSize * 0.8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
        ctx.closePath();
    };

    function PivotSegment(a, b) {
        this.type = 'FreeSegment';
        this.a = a;
        this.b = b;
        var dx = b.x - a.x;
        var dy = b.y - a.y;
        this.delta = { x: dx, y: dy };
        // orientations
        this.noon = {
            a: a,
            b: b
        };
        this.three = {
            a: { x: -a.y, y: a.x },
            b: { x: -a.y + dx, y: a.x + dy }
        };
        this.six = {
            a: { x: -a.x, y: -a.y },
            b: { x: -a.x + dx, y: -a.y + dy }
        };
        this.nine = {
            a: { x: a.y, y: -a.x },
            b: { x: a.y + dx, y: -a.x + dy }
        };
    }


    var proto = PivotSegment.prototype;

    proto.render = function (ctx, center, gridSize, mazeAngle) {
        var ax = this.a.x * gridSize;
        var ay = this.a.y * gridSize;
        var bx = this.delta.x * gridSize;
        var by = this.delta.y * gridSize;
        ctx.save();

        ctx.translate(ax, ay);
        ctx.rotate(-mazeAngle);
        var color = 'hsla(150, 100%, 35%, 0.7)';
        // line
        ctx.strokeStyle = color;
        ctx.lineWidth = gridSize * 0.4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(bx, by);
        ctx.stroke();
        ctx.closePath();
        // circle
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, 0, gridSize * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();

        ctx.restore();
    };

    var TAU = Math.PI * 2;

    function RotateSegment(a, b) {
        this.type = 'RotateSegment';
        this.a = a;
        this.b = b;
        // orientations
        var dx = b.x - a.x;
        var dy = b.y - a.y;
        this.delta = { x: dx, y: dy };
        this.theta = Math.atan2(dy, dx);
        this.noon = { a: a, b: b };
        this.three = { a: a, b: this.getB(TAU / 4) };
        this.six = { a: a, b: this.getB(TAU / 2) };
        this.nine = { a: a, b: this.getB(TAU * 3 / 4) };
    }

    var proto = RotateSegment.prototype;

    proto.getB = function (angle) {
        return {
            x: Math.round(this.a.x + Math.cos(this.theta + angle) * 2),
            y: Math.round(this.a.y + Math.sin(this.theta + angle) * 2),
        };
    };

    proto.render = function (ctx, center, gridSize, mazeAngle) {
        var ax = this.a.x * gridSize;
        var ay = this.a.y * gridSize;
        ctx.save();
        ctx.translate(ax, ay);
        ctx.rotate(mazeAngle);
        var color = 'hsla(0, 100%, 50%, 0.6)';
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        // axle
        ctx.lineWidth = gridSize * 0.8;
        ctx.lineJoin = 'round';
        ctx.rotate(TAU / 8);
        ctx.strokeRect(-gridSize * 0.2, -gridSize * 0.2, gridSize * 0.4, gridSize * 0.4);
        ctx.rotate(-TAU / 8);
        // line
        ctx.lineWidth = gridSize * 0.8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, 0);

        var bx = this.delta.x * gridSize;
        var by = this.delta.y * gridSize;
        ctx.lineTo(bx, by);
        ctx.stroke();
        ctx.closePath();
        ctx.restore();
    };

    // rotational physics model

    var TAU = Math.PI * 2;

    function FlyWheel(props) {
        this.angle = 0;
        this.friction = 0.95;
        this.velocity = 0;

        for (var prop in props) {
            this[prop] = props[prop];
        }
    }

    var proto = FlyWheel.prototype;

    proto.integrate = function () {
        this.velocity *= this.friction;
        this.angle += this.velocity;
        this.normalizeAngle();
    };

    proto.applyForce = function (force) {
        this.velocity += force;
    };

    proto.normalizeAngle = function () {
        this.angle = ((this.angle % TAU) + TAU) % TAU;
    };

    proto.setAngle = function (theta) {
        var velo = theta - this.angle;
        if (velo > TAU / 2) {
            velo -= TAU;
        } else if (velo < -TAU / 2) {
            velo += TAU;
        }
        var force = velo - this.velocity;
        this.applyForce(force);
    };


    var cub = {
        offset: { x: 0, y: 0 },
    };

    var pegOrienter = {
        noon: function (peg) {
            return peg;
        },
        three: function (peg) {
            return { x: peg.y, y: -peg.x };
        },
        six: function (peg) {
            return { x: -peg.x, y: -peg.y };
        },
        nine: function (peg) {
            return { x: -peg.y, y: peg.x };
        },
    };

    cub.setPeg = function (peg, orientation) {
        peg = pegOrienter[orientation](peg);
        this.peg = peg;

        this.noon = { x: peg.x, y: peg.y };
        this.three = { x: -peg.y, y: peg.x };
        this.six = { x: -peg.x, y: -peg.y };
        this.nine = { x: peg.y, y: -peg.x };
    };

    var offsetOrienter = {
        noon: function (offset) {
            return offset;
        },
        three: function (offset) {
            // flip y because its rendering
            return { x: offset.y, y: -offset.x };
        },
        six: function (offset) {
            return { x: -offset.x, y: -offset.y };
        },
        nine: function (offset) {
            // flip y because its rendering
            return { x: -offset.y, y: offset.x };
        },
    };

    cub.setOffset = function (offset, orientation) {
        this.offset = offsetOrienter[orientation](offset);
    };

    // ----- render ----- //

    cub.render = function (ctx, mazeCenter, gridSize, angle, isHovered) {
        function circle(x, y, radius) {
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();
        }

        var x = this.peg.x * gridSize + this.offset.x;
        var y = this.peg.y * gridSize + this.offset.y;
        ctx.save();
        ctx.translate(mazeCenter.x, mazeCenter.y);
        ctx.rotate(angle);
        ctx.translate(x, y);
        ctx.rotate(-angle);
        ctx.fillStyle = 'hsla(330, 100%, 40%, 1)';
        var scale = isHovered ? 1.15 : 1;
        ctx.scale(scale, scale);
        circle(0, 0, gridSize * 0.6);
        circle(gridSize * -0.45, gridSize * -0.35, gridSize * 0.3);
        circle(gridSize * 0.45, gridSize * -0.35, gridSize * 0.3);

        ctx.restore();
    };


    /* globals FlyWheel, FreeSegment, FixedSegment, PivotSegment, RotateSegment, cub */

    function Maze() {
        this.freeSegments = [];
        this.fixedSegments = [];
        this.pivotSegments = [];
        this.rotateSegments = [];
        this.flyWheel = new FlyWheel({
            friction: 0.8
        });
        this.connections = {};
    }

    var proto = Maze.prototype;

    proto.loadText = function (text) {
        // separate --- sections, YAML front matter first, maze source second;
        var sections = text.split('---\n');
        // YAML front matter
        var frontMatter = {};
        if (sections.length > 1) {
            frontMatter = getFrontMatter(sections[0]);
        }
        // set instruction
        var instructElem = document.querySelector('.instruction');
        instructElem.innerHTML = frontMatter.instruction || '';

        var mazeSrc = sections[sections.length - 1];
        var lines = mazeSrc.split('\n');
        var gridCount = this.gridCount = lines[0].length;
        var gridMax = this.gridMax = (gridCount - 1) / 2;

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var chars = line.split('');
            for (var j = 0; j < chars.length; j++) {
                var character = chars[j];
                var pegX = j - gridMax;
                var pegY = i - gridMax;
                var parseMethod = 'parse' + character;
                if (this[parseMethod]) {
                    this[parseMethod](pegX, pegY);
                }
            }
        }
    };

    function getFrontMatter(text) {
        if (!text) {
            return;
        }
        var frontMatter = {};
        text.split('\n').forEach(function (line) {
            if (!line) {
                return;
            }
            var parts = line.split(':');
            var key = parts[0].trim();
            var value = parts[1].trim();
            if (value === 'true') {
                value = true; // boolean true
            } else if (value === 'false') {
                value = false; // boolean false
            } else if (value.match(/$\d+(\.\d+)?^/)) {
                value = parseFloat(value, 10); // number
            } else if (value.match(/$\d+\.\d+^/)) {
                value = parseFloat(value); // float
            }
            frontMatter[key] = value;
        });
        return frontMatter;
    }


    // -------------------------- parsers -------------------------- //

    // horizontal free segment
    proto['parse-'] = proto.addFreeHorizSegment = function (pegX, pegY) {
        var segment = getHorizSegment(pegX, pegY, FreeSegment);
        this.connectSegment(segment);
        this.freeSegments.push(segment);
    };

    // vertical free segment
    proto['parse|'] = proto.addFreeVertSegment = function (pegX, pegY) {
        var segment = getVertSegment(pegX, pegY, FreeSegment);
        this.connectSegment(segment);
        this.freeSegments.push(segment);
    };

    // horizontal fixed segment
    proto['parse='] = proto.addFixedHorizSegment = function (pegX, pegY) {
        var segment = getHorizSegment(pegX, pegY, FixedSegment);
        this.connectSegment(segment);
        this.fixedSegments.push(segment);
    };

    // vertical fixed segment
    proto['parse!'] = proto.addFixedVertSegment = function (pegX, pegY) {
        var segment = getVertSegment(pegX, pegY, FixedSegment);
        this.connectSegment(segment);
        this.fixedSegments.push(segment);
    };

    function getHorizSegment(pegX, pegY, Segment) {
        var a = { x: pegX + 1, y: pegY };
        var b = { x: pegX - 1, y: pegY };
        return new Segment(a, b);
    }

    function getVertSegment(pegX, pegY, Segment) {
        var a = { x: pegX, y: pegY + 1 };
        var b = { x: pegX, y: pegY - 1 };
        return new Segment(a, b);
    }

    // ----- pivot ----- //

    // pivot up segment
    proto['parse^'] = proto.addPivotUpSegment = function (pegX, pegY) {
        var a = { x: pegX, y: pegY + 1 };
        var b = { x: pegX, y: pegY - 1 };
        var segment = new PivotSegment(a, b);
        this.connectSegment(segment);
        this.pivotSegments.push(segment);
    };

    // pivot down segment
    proto.parsev = proto.addPivotDownSegment = function (pegX, pegY) {
        var a = { x: pegX, y: pegY - 1 };
        var b = { x: pegX, y: pegY + 1 };
        var segment = new PivotSegment(a, b);
        this.connectSegment(segment);
        this.pivotSegments.push(segment);
    };

    // pivot left segment
    proto['parse<'] = proto.addPivotLeftSegment = function (pegX, pegY) {
        var a = { x: pegX + 1, y: pegY };
        var b = { x: pegX - 1, y: pegY };
        var segment = new PivotSegment(a, b);
        this.connectSegment(segment);
        this.pivotSegments.push(segment);
    };

    // pivot right segment
    proto['parse>'] = proto.addPivotRightSegment = function (pegX, pegY) {
        var a = { x: pegX - 1, y: pegY };
        var b = { x: pegX + 1, y: pegY };
        var segment = new PivotSegment(a, b);
        this.connectSegment(segment);
        this.pivotSegments.push(segment);
    };

    // ----- rotate ----- //

    proto.parse8 = proto.addRotateUpSegment = function (pegX, pegY) {
        var a = { x: pegX, y: pegY + 1 };
        var b = { x: pegX, y: pegY - 1 };
        var segment = new RotateSegment(a, b);
        this.connectSegment(segment);
        this.rotateSegments.push(segment);
    };

    proto.parse4 = proto.addRotateLeftSegment = function (pegX, pegY) {
        var a = { x: pegX + 1, y: pegY };
        var b = { x: pegX - 1, y: pegY };
        var segment = new RotateSegment(a, b);
        this.connectSegment(segment);
        this.rotateSegments.push(segment);
    };

    proto.parse5 = proto.addRotateUpSegment = function (pegX, pegY) {
        var a = { x: pegX, y: pegY - 1 };
        var b = { x: pegX, y: pegY + 1 };
        var segment = new RotateSegment(a, b);
        this.connectSegment(segment);
        this.rotateSegments.push(segment);
    };

    proto.parse6 = proto.addRotateRightSegment = function (pegX, pegY) {
        var a = { x: pegX - 1, y: pegY };
        var b = { x: pegX + 1, y: pegY };
        var segment = new RotateSegment(a, b);
        this.connectSegment(segment);
        this.rotateSegments.push(segment);
    };

    // ----- combos ----- //

    // free & fixed horizontal
    proto['parse#'] = function (pegX, pegY) {
        this.addFreeHorizSegment(pegX, pegY);
        this.addFixedHorizSegment(pegX, pegY);
    };

    // free & fixed vertical
    proto.parse$ = function (pegX, pegY) {
        this.addFreeVertSegment(pegX, pegY);
        this.addFixedVertSegment(pegX, pegY);
    };

    // pivot up + fixed vertical
    proto.parseI = function (pegX, pegY) {
        this.addPivotUpSegment(pegX, pegY);
        this.addFixedVertSegment(pegX, pegY);
    };

    // pivot left + fixed horizontal
    proto.parseJ = function (pegX, pegY) {
        this.addPivotLeftSegment(pegX, pegY);
        this.addFixedHorizSegment(pegX, pegY);
    };

    // pivot down + fixed vertical
    proto.parseK = function (pegX, pegY) {
        this.addPivotDownSegment(pegX, pegY);
        this.addFixedVertSegment(pegX, pegY);
    };

    // pivot right + fixed horizontal
    proto.parseL = function (pegX, pegY) {
        this.addPivotRightSegment(pegX, pegY);
        this.addFixedHorizSegment(pegX, pegY);
    };

    // pivot up + free vertical
    proto.parseW = function (pegX, pegY) {
        this.addPivotUpSegment(pegX, pegY);
        this.addFreeVertSegment(pegX, pegY);
    };

    // pivot left + free horizontal
    proto.parseA = function (pegX, pegY) {
        this.addPivotLeftSegment(pegX, pegY);
        this.addFreeHorizSegment(pegX, pegY);
    };

    // pivot down + free vertical
    proto.parseS = function (pegX, pegY) {
        this.addPivotDownSegment(pegX, pegY);
        this.addFreeVertSegment(pegX, pegY);
    };

    // pivot right + free horizontal
    proto.parseD = function (pegX, pegY) {
        this.addPivotRightSegment(pegX, pegY);
        this.addFreeHorizSegment(pegX, pegY);
    };

    // start position
    proto['parse@'] = function (pegX, pegY) {
        this.startPosition = { x: pegX, y: pegY };
        cub.setPeg(this.startPosition, 'noon');
    };

    // goal position
    proto['parse*'] = function (pegX, pegY) {
        this.goalPosition = { x: pegX, y: pegY };
    };

    // --------------------------  -------------------------- //

    proto.updateItemGroups = function () {
        var itemGroups = {};
        this.items.forEach(function (item) {
            if (itemGroups[item.type] === undefined) {
                itemGroups[item.type] = [];
            }
            itemGroups[item.type].push(item);
        });
        this.itemGroups = itemGroups;
    };

    var orientations = ['noon', 'three', 'six', 'nine'];

    proto.connectSegment = function (segment) {
        orientations.forEach(function (orientation) {
            var line = segment[orientation];
            // check that pegs are not out of maze
            if (this.getIsPegOut(line.a) || this.getIsPegOut(line.b)) {
                return;
            }
            this.connectPeg(segment, orientation, line.a);
            this.connectPeg(segment, orientation, line.b);
        }, this);
    };

    proto.getIsPegOut = function (peg) {
        return Math.abs(peg.x) > this.gridMax ||
            Math.abs(peg.y) > this.gridMax;
    };

    proto.connectPeg = function (segment, orientation, peg) {
        // flatten the key
        var key = orientation + ':' + peg.x + ',' + peg.y;
        var connection = this.connections[key];
        // create connections array if not already there
        if (!connection) {
            connection = this.connections[key] = [];
        }
        if (connection.indexOf(segment) == -1) {
            connection.push(segment);
        }
    };

    // --------------------------  -------------------------- //

    proto.update = function () {
        this.flyWheel.integrate();
        var angle = this.flyWheel.angle;
        if (angle < TAU / 8) {
            this.orientation = 'noon';
        } else if (angle < TAU * 3 / 8) {
            this.orientation = 'three';
        } else if (angle < TAU * 5 / 8) {
            this.orientation = 'six';
        } else if (angle < TAU * 7 / 8) {
            this.orientation = 'nine';
        } else {
            this.orientation = 'noon';
        }
    };

    proto.attractAlignFlyWheel = function () {
        // attract towards
        var angle = this.flyWheel.angle;
        var target;
        if (angle < TAU / 8) {
            target = 0;
        } else if (angle < TAU * 3 / 8) {
            target = TAU / 4;
        } else if (angle < TAU * 5 / 8) {
            target = TAU / 2;
        } else if (angle < TAU * 7 / 8) {
            target = TAU * 3 / 4;
        } else {
            target = TAU;
        }
        var attraction = (target - angle) * 0.03;
        this.flyWheel.applyForce(attraction);
    };

    var TAU = Math.PI * 2;

    var orientationAngles = {
        noon: 0,
        three: TAU / 4,
        six: TAU / 2,
        nine: TAU * 3 / 4
    };

    proto.render = function (ctx, center, gridSize, angle) {
        var orientationAngle = orientationAngles[angle];
        var gridMax = this.gridMax;
        angle = orientationAngle !== undefined ? orientationAngle : angle || 0;


        ctx.save();
        ctx.translate(center.x, center.y);
        // fixed segments
        this.fixedSegments.forEach(function (segment) {
            segment.render(ctx, center, gridSize);
        });
        // rotate segments
        this.rotateSegments.forEach(function (segment) {
            segment.render(ctx, center, gridSize, angle);
        });
        // rotation
        ctx.rotate(angle);

        ctx.lineWidth = gridSize * 0.2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        // axle
        ctx.lineWidth = gridSize * 0.2;
        ctx.strokeStyle = 'hsla(0, 0%, 50%, 0.2)';
        // strokeCircle( ctx, 0, 0, gridSize/2 );
        ctx.save();
        ctx.rotate(Math.PI / 4);
        ctx.strokeRect(-gridSize / 5, -gridSize / 5, gridSize * 2 / 5, gridSize * 2 / 5);
        ctx.restore();
        // start position
        ctx.strokeStyle = 'hsla(330, 100%, 50%, 0.3)';
        ctx.lineWidth = gridSize * 0.15;
        var startX = this.startPosition.x * gridSize;
        var startY = this.startPosition.y * gridSize;
        strokeCircle(ctx, startX, startY, gridSize * 0.5);

        // pegs
        for (var pegY = -gridMax; pegY <= gridMax; pegY += 2) {
            for (var pegX = -gridMax; pegX <= gridMax; pegX += 2) {
                var pegXX = pegX * gridSize;
                var pegYY = pegY * gridSize;
                ctx.fillStyle = 'hsla(0, 0%, 50%, 0.6)';
                fillCircle(ctx, pegXX, pegYY, gridSize * 0.15);
            }
        }
        // free segments
        this.freeSegments.forEach(function (segment) {
            segment.render(ctx, center, gridSize);
        });
        // pivot segments
        this.pivotSegments.forEach(function (segment) {
            segment.render(ctx, center, gridSize, angle);
        });
        // goal position
        var goalX = this.goalPosition.x * gridSize;
        var goalY = this.goalPosition.y * gridSize;
        ctx.lineWidth = gridSize * 0.3;
        ctx.fillStyle = 'hsla(50, 100%, 50%, 1)';
        ctx.strokeStyle = 'hsla(50, 100%, 50%, 1)';
        renderGoal(ctx, goalX, goalY, angle, gridSize * 0.6, gridSize * 0.3);

        ctx.restore();
    };

    function fillCircle(ctx, x, y, radius) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }

    function strokeCircle(ctx, x, y, radius) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.closePath();
    }

    function renderGoal(ctx, x, y, mazeAngle, radiusA, radiusB) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(-mazeAngle);
        ctx.beginPath();
        for (var i = 0; i < 11; i++) {
            var theta = Math.PI * 2 * i / 10 + Math.PI / 2;
            var radius = i % 2 ? radiusA : radiusB;
            var dx = Math.cos(theta) * radius;
            var dy = Math.sin(theta) * radius;
            ctx[i ? 'lineTo' : 'moveTo'](dx, dy);
        }
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
        ctx.restore();
    }


    function WinAnimation(x, y) {
        this.x = x;
        this.y = y;
        this.startTime = new Date();
        this.isPlaying = true;
    }

    // length of animation in milliseconds
    var duration = 1000;

    var proto = WinAnimation.prototype;

    proto.update = function () {
        if (!this.isPlaying) {
            return;
        }
        this.t = ((new Date()) - this.startTime) / duration;
        this.isPlaying = this.t <= 1;
    };

    proto.render = function (ctx) {
        if (!this.isPlaying) {
            return;
        }

        ctx.save();
        ctx.translate(this.x, this.y);

        // big burst
        this.renderBurst(ctx);
        // small burst
        ctx.save();
        ctx.scale(0.5, -0.5);
        this.renderBurst(ctx);
        ctx.restore();

        ctx.restore();
    };

    proto.renderBurst = function (ctx) {

        var t = this.t;
        var dt = 1 - t;
        var easeT = 1 - dt * dt * dt * dt * dt * dt * dt * dt;
        var dy = easeT * -100;
        // scale math
        var st = 2 - this.t * 2;
        var scale = (1 - t * t * t) * 1.5;
        var spin = Math.PI * 1 * t * t * t;

        for (var i = 0; i < 5; i++) {
            ctx.save();
            ctx.rotate(Math.PI * 2 / 5 * i);
            ctx.translate(0, dy);
            ctx.scale(scale, scale);
            ctx.rotate(spin);
            renderStar(ctx);
            ctx.restore();
        }
    };

    function renderStar(ctx) {
        ctx.lineWidth = 8;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.fillStyle = 'hsla(50, 100%, 50%, 1)';
        ctx.strokeStyle = 'hsla(50, 100%, 50%, 1)';
        ctx.beginPath();
        for (var i = 0; i < 11; i++) {
            var theta = Math.PI * 2 * i / 10 + Math.PI / 2;
            var radius = i % 2 ? 20 : 10;
            var dx = Math.cos(theta) * radius;
            var dy = Math.sin(theta) * radius;
            ctx[i ? 'lineTo' : 'moveTo'](dx, dy);
        }
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
    }

    /* globals cub, WinAnimation, Unipointer, Maze */
    var docElem = document.documentElement;
    var canvas = document.querySelector('canvas');
    var ctx = canvas.getContext('2d');
    // size canvas;
    var canvasSize = Math.min(window.innerWidth, window.innerHeight);
    var canvasWidth = canvas.width = window.innerWidth * 2;
    var canvasHeight = canvas.height = window.innerHeight * 2;
    var maze;
    var PI = Math.PI;
    var TAU = PI * 2;
    var dragAngle = null;
    var cubDragMove = null;
    var isCubHovered = false;
    var isCubDragging = false;
    var winAnim;
    var unipointer = new Unipointer();

    // ----- config ----- //

    var gridSize = Math.min(40, canvasSize / 12);
    var mazeCenter = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        // y: Math.min(gridSize * 8, canvasHeight / 4)
    };

    // ----- instruction ----- //

    var instructElem = document.querySelector('.instruction');
    instructElem.style.top = (mazeCenter.y + gridSize * 4) + 'px';

    // ----- build level select, levels array ----- //

    var levelList = document.querySelector('.level-list');
    var levelsElem = document.querySelector('.levels');
    var levels = [];

    (function () {
        var levelPres = levelsElem.querySelectorAll('pre');
        var fragment = document.createDocumentFragment();
        for (var i = 0; i < levelPres.length; i++) {
            var pre = levelPres[i];
            var listItem = document.createElement('li');
            listItem.className = 'level-list__item';
            var id = pre.id;
            listItem.innerHTML = '<span class="level-list__item__number">' + (i + 1) +
                '</span> <span class="level-list__item__blurb">' +
                pre.getAttribute('data-blurb') + '</span>' +
                '<span class="level-list__item__check">✔</span>';
            listItem.setAttribute('data-id', id);
            fragment.appendChild(listItem);
            levels.push(id);
        }

        levelList.appendChild(fragment);

    })();

    // ----- levels button ----- //

    var levelSelectButton = document.querySelector('.level-select-button');
    var nextLevelButton = document.querySelector('.next-level-button');

    levelSelectButton.addEventListener('click', function () {
        levelList.classList.add('is-open');
    });

    nextLevelButton.style.top = `${instructElem.offsetTop + instructElem.offsetHeight + 20}px`;

    // ----- level list ----- //

    levelList.addEventListener('click', function (event) {
        var item = getParent(event.target, '.level-list__item');
        if (!item) {
            return;
        }
        // load level from id
        var id = item.getAttribute('data-id');
        loadLevel(id);
    });

    function getParent(elem, selector) {
        var parent = elem;
        while (parent != document.body) {
            if (parent.matches(selector)) {
                return parent;
            }
            parent = parent.parentNode;
        }
    }

    // ----- load level ----- //

    function loadLevel(id) {
        var pre = levelsElem.querySelector('#' + id);

        maze = new Maze();
        maze.id = id;

        if (!pre) {
            console.error('pre not found for ' + id);
            return;
        }

        // load maze level from pre text
        maze.loadText(pre.textContent);
        // close ui
        levelList.classList.remove('is-open');
        nextLevelButton.classList.remove('is-open');
        window.scrollTo(0, 0);
        // highlight list
        var previousItem = levelList.querySelector('.is-playing');
        if (previousItem) {
            previousItem.classList.remove('is-playing');
        }
        levelList.querySelector('[data-id="' + id + '"]').classList.add('is-playing');
        localStorage.setItem('currentLevel', id);
    }

    // ----- init ----- //

    var initialLevel = localStorage.getItem('currentLevel') || levels[0];
    loadLevel(initialLevel);

    unipointer.bindStartEvent(canvas);
    window.addEventListener('mousemove', onHoverMousemove);
    animate();

    // -------------------------- drag rotation -------------------------- //

    var canvasLeft = canvas.offsetLeft;
    var canvasTop = canvas.offsetTop;

    var pointerBehavior;

    // ----- pointerBehavior ----- //

    var cubDrag = {};
    var mazeRotate = {};

    // -----  ----- //

    unipointer.pointerDown = function (event, pointer) {
        event.preventDefault();
        var isInsideCub = getIsInsideCub(pointer);
        pointerBehavior = isInsideCub ? cubDrag : mazeRotate;

        pointerBehavior.pointerDown(event, pointer);

        this._bindPostStartEvents(event);
    };

    function getIsInsideCub(pointer) {
        var position = getCanvasMazePosition(pointer);
        var cubDeltaX = Math.abs(position.x - cub[maze.orientation].x * gridSize);
        var cubDeltaY = Math.abs(position.y - cub[maze.orientation].y * gridSize);
        var bound = gridSize * 1.5;
        return cubDeltaX <= bound && cubDeltaY <= bound;
    }

    function getCanvasMazePosition(pointer) {
        var canvasX = pointer.pageX - canvasLeft;
        var canvasY = pointer.pageY - canvasTop;
        return {
            x: canvasX - mazeCenter.x,
            y: canvasY - mazeCenter.y,
        };
    }

    // ----- unipointer ----- //

    unipointer.pointerMove = function (event, pointer) {
        pointerBehavior.pointerMove(event, pointer);
    };

    unipointer.pointerUp = function (event, pointer) {
        pointerBehavior.pointerUp(event, pointer);
        this._unbindPostStartEvents();
    };

    // ----- cubDrag ----- //

    var dragStartPosition, dragStartPegPosition, rotatePointer;

    cubDrag.pointerDown = function (event, pointer) {
        var segments = getCubConnections();
        if (!segments || !segments.length) {
            return;
        }
        isCubDragging = true;
        dragStartPosition = { x: pointer.pageX, y: pointer.pageY };
        dragStartPegPosition = {
            x: cub[maze.orientation].x * gridSize + mazeCenter.x,
            y: cub[maze.orientation].y * gridSize + mazeCenter.y,
        };
        docElem.classList.add('is-cub-dragging');
    };

    cubDrag.pointerMove = function (event, pointer) {
        if (!isCubDragging) {
            return;
        }
        cubDragMove = {
            x: pointer.pageX - dragStartPosition.x,
            y: pointer.pageY - dragStartPosition.y,
        };
    };

    cubDrag.pointerUp = function () {
        cubDragMove = null;
        docElem.classList.remove('is-cub-dragging');
        isCubDragging = false;
        // set at peg
        cub.setOffset({ x: 0, y: 0 }, maze.orientation);
        // check level complete
        if (cub.peg.x == maze.goalPosition.x && cub.peg.y == maze.goalPosition.y) {
            completeLevel();
        }
    };

    // ----- rotate ----- //

    var dragStartAngle, dragStartMazeAngle, moveAngle;
    var mazeRotate = {};


    mazeRotate.pointerDown = function (event, pointer) {
        dragStartAngle = moveAngle = getDragAngle(pointer);
        dragStartMazeAngle = maze.flyWheel.angle;
        dragAngle = dragStartMazeAngle;
        rotatePointer = pointer;
    };

    function getDragAngle(pointer) {
        var position = getCanvasMazePosition(pointer);
        return normalizeAngle(Math.atan2(position.y, position.x));
    }

    mazeRotate.pointerMove = function (event, pointer) {
        rotatePointer = pointer;
        moveAngle = getDragAngle(pointer);
        var deltaAngle = moveAngle - dragStartAngle;
        dragAngle = normalizeAngle(dragStartMazeAngle + deltaAngle);
    };

    mazeRotate.pointerUp = function () {
        dragAngle = null;
        rotatePointer = null;
    };


    // ----- animate ----- //

    function animate() {
        update();
        render();
        requestAnimationFrame(animate);
    }

    // ----- update ----- //

    function update() {
        // drag cub
        dragCub();
        // rotate grid
        if (dragAngle) {
            maze.flyWheel.setAngle(dragAngle);
        } else {
            maze.attractAlignFlyWheel();
        }
        maze.update();
        if (winAnim) {
            winAnim.update();
        }
    }

    function dragCub() {
        if (!cubDragMove) {
            return;
        }

        var segments = getCubConnections();

        var dragPosition = {
            x: dragStartPegPosition.x + cubDragMove.x,
            y: dragStartPegPosition.y + cubDragMove.y,
        };

        // set peg position
        var dragPeg = getDragPeg(segments, dragPosition);
        cub.setPeg(dragPeg, maze.orientation);

        // set drag offset
        var cubDragPosition = getDragPosition(segments, dragPosition);

        var cubPosition = getCubPosition();
        var offset = {
            x: cubDragPosition.x - cubPosition.x,
            y: cubDragPosition.y - cubPosition.y,
        };
        cub.setOffset(offset, maze.orientation);

    }

    function getCubPosition() {
        return {
            x: cub[maze.orientation].x * gridSize + mazeCenter.x,
            y: cub[maze.orientation].y * gridSize + mazeCenter.y,
        };
    }

    function getCubConnections() {
        var pegX = cub[maze.orientation].x;
        var pegY = cub[maze.orientation].y;
        var key = maze.orientation + ':' + pegX + ',' + pegY;
        return maze.connections[key];
    }

    function getDragPosition(segments, dragPosition) {
        if (segments.length == 1) {
            return getSegmentDragPosition(segments[0], dragPosition);
        }

        // get closest segments positions
        var dragCandidates = segments.map(function (segment) {
            var position = getSegmentDragPosition(segment, dragPosition);
            return {
                position: position,
                distance: getDistance(dragPosition, position),
            };
        });

        dragCandidates.sort(distanceSorter);

        return dragCandidates[0].position;
    }

    function getSegmentDragPosition(segment, dragPosition) {
        var line = segment[maze.orientation];
        var isHorizontal = line.a.y == line.b.y;
        var x, y;
        if (isHorizontal) {
            x = getSegmentDragCoord(line, 'x', dragPosition);
            y = line.a.y * gridSize + mazeCenter.y;
        } else {
            x = line.a.x * gridSize + mazeCenter.x;
            y = getSegmentDragCoord(line, 'y', dragPosition);
        }
        return { x: x, y: y };
    }

    function getSegmentDragCoord(line, axis, dragPosition) {
        var a = line.a[axis];
        var b = line.b[axis];
        var min = a < b ? a : b;
        var max = a > b ? a : b;
        min = min * gridSize + mazeCenter[axis];
        max = max * gridSize + mazeCenter[axis];
        return Math.max(min, Math.min(max, dragPosition[axis]));
    }

    function distanceSorter(a, b) {
        return a.distance - b.distance;
    }

    function getDragPeg(segments, dragPosition) {
        var pegs = [];
        segments.forEach(function (segment) {
            var line = segment[maze.orientation];
            addPegPoint(line.a, pegs);
            addPegPoint(line.b, pegs);
        });

        var pegCandidates = pegs.map(function (pegKey) {
            // revert string back to object with integers
            var parts = pegKey.split(',');
            var peg = {
                x: parseInt(parts[0], 10),
                y: parseInt(parts[1], 10),
            };
            var pegPosition = {
                x: peg.x * gridSize + mazeCenter.x,
                y: peg.y * gridSize + mazeCenter.y,
            };
            return {
                peg: peg,
                distance: getDistance(dragPosition, pegPosition),
            };
        });

        pegCandidates.sort(distanceSorter);

        return pegCandidates[0].peg;
    }

    function getDistance(a, b) {
        var dx = b.x - a.x;
        var dy = b.y - a.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    function addPegPoint(point, pegs) {
        // use strings to prevent dupes
        var key = point.x + ',' + point.y;
        if (pegs.indexOf(key) == -1) {
            pegs.push(key);
        }
    }

    // ----- hover ----- //

    function onHoverMousemove(event) {
        var isInsideCub = getIsInsideCub(event);
        if (isInsideCub == isCubHovered) {
            return;
        }
        // change
        isCubHovered = isInsideCub;
        var changeClass = isInsideCub ? 'add' : 'remove';
        docElem.classList[changeClass]('is-cub-hovered');
    }

    // ----- render ----- //

    function render() {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.save();
        ctx.scale(2, 2);
        renderRotateHandle();
        // maze
        maze.render(ctx, mazeCenter, gridSize, maze.flyWheel.angle);
        // win animation
        if (winAnim) {
            winAnim.render(ctx);
        }
        // cub
        var isHovered = isCubHovered || isCubDragging;
        cub.render(ctx, mazeCenter, gridSize, maze.flyWheel.angle, isHovered);
        ctx.restore();
    }

    function renderRotateHandle() {
        // rotate handle
        if (!rotatePointer) {
            return;
        }

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = gridSize * 0.5;
        var color = '#EEE';
        ctx.strokeStyle = color;
        ctx.fillStyle = color;

        // pie slice
        ctx.beginPath();
        var pieRadius = maze.gridMax * gridSize;
        ctx.moveTo(mazeCenter.x, mazeCenter.y);
        var pieDirection = normalizeAngle(normalizeAngle(moveAngle) -
            normalizeAngle(dragStartAngle)) > TAU / 2;
        ctx.arc(mazeCenter.x, mazeCenter.y, pieRadius, dragStartAngle, moveAngle, pieDirection);
        ctx.lineTo(mazeCenter.x, mazeCenter.y);
        ctx.stroke();
        ctx.fill();
        ctx.closePath();
    }

    // -------------------------- completeLevel -------------------------- //

    var completedLevels = localStorage.getItem('completedLevels');
    completedLevels = completedLevels ? completedLevels.split(',') : [];

    completedLevels.forEach(function (id) {
        var item = levelList.querySelector('[data-id="' + id + '"]');
        if (item) {
            item.classList.add('did-complete');
        }
    });

    function completeLevel() {
        var cubPosition = getCubPosition();
        winAnim = new WinAnimation(cubPosition.x, cubPosition.y);
        levelList.querySelector('[data-id="' + maze.id + '"]').classList.add('did-complete');

        if (completedLevels.indexOf(maze.id) == -1) {
            completedLevels.push(maze.id);
            localStorage.setItem('completedLevels', completedLevels.join(','));

            // offer info form before syncing to firebase
            const info = Object.values(profile.userInfo || {});
            if (info.length < 6 || info.some(val => !val || !val.trim())) showForm();
            else syncToFirebase(localStorage.getItem('completedLevels'));
        }
        else if (Number.isInteger(profile.time)) {
            const
                total = (Date.now() - profile.time) / 1000,
                h = Math.floor(total / 360),
                m = Math.floor((total - h * 360) / 60),
                s = total - (h * 360) - (m * 60);

            profile.time = `${h}:${m}:${s}`;
        }

        if (getNextLevel()) {
            setTimeout(() => {nextLevelButton.classList.add('is-open');}, 500);
        }
    }

    function getNextLevel() {
        var index = levels.indexOf(maze.id);
        return levels[index + 1];
    }

    // -------------------------- next level -------------------------- //

    nextLevelButton.addEventListener('click', function () {
        var nextLevel = getNextLevel();
        if (nextLevel) loadLevel(nextLevel);
    });

    // -------------------------- utils -------------------------- //

    function normalizeAngle(angle) {
        return ((angle % TAU) + TAU) % TAU;
    }
}

function syncToFirebase(localData) {
    fire.doc(`players/${profile.lb_user_id}`).set({
        name: profile.name,
        email: profile.email,
        score: localData.split(',').length,
        progress: localData,
        userInfo: profile.userInfo,
    }, { merge: true })
        .then(() => console.log('Document written', profile.name, profile.score))
        .catch(error => console.error('Error adding document: ', error));
}

function showPopup(messageContent, buttonText, action, close = false, closeAction) {
    const
        wrapper = document.createElement('div'),
        logo = document.createElement('img'),
        message = document.createElement('h2'),
        button = document.createElement('button'),
        btnClose = document.createElement('button');

    popup = {
        element: document.createElement('div'),
        message: message,
        button: button,
    };

    logo.src = 'https://app.bsdlaunchbox.com/resources/bsdlogo.png';
    message.innerHTML = messageContent;

    wrapper.appendChild(message);

    if (buttonText) {
        button.textContent = buttonText;
        button.onclick = action;
        wrapper.appendChild(button);
        if (close) {
            style([btnClose], { margin_left: '10px' });
            btnClose.textContent = 'Cancel';
            btnClose.onclick = closeAction;
            wrapper.appendChild(btnClose);
        }
    }

    document.body.appendChild(popup.element);
    popup.element.appendChild(wrapper);

    style([popup.element], {
        position: 'absolute',
        top: '0',
        width: `${window.innerWidth}px`,
        height: `${window.innerHeight}px`,
        background_color: 'rgba(255, 255, 255, 0.8)',
        z_index: '2',
    });

    style([wrapper], {
        position: 'absolute',
        width: `${window.innerWidth - 50}px`,
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        border_radius: '10px',
        padding: '0 20px 20px 20px',
        background_color: 'rgba(0, 0, 0, 0.8)',
        box_sizing: 'border-box',
    });

    style([message], {
        margin_top: '0',
        font_family: 'Monospace',
        color: 'ghostwhite',
        font_size: '1em',
        line_height: '1.5em',
    });

    if (buttonText || close) style([button, btnClose], {
        border: 'none',
        border_radius: `${button.offsetHeight / 2}px`,
        padding: '5px 10px',
        cursor: 'pointer',
        outline: 'none',
        font_family: 'Monospace',
        font_size: '1em',
        color: 'black',
        background_color: 'ghostwhite',
    });

    logo.onload = () => {
        style([logo], { opacity: '0' });
        popup.element.appendChild(logo);

        const sizeRatio = window.innerWidth * 0.15 / logo.offsetWidth;
        style([wrapper], { padding_top: `${10 + (logo.offsetHeight / 2) * sizeRatio}px` });
        style([logo], {
            position: 'absolute',
            left: '50%',
            transform: `translateX(-50%) scale(${sizeRatio}) `,
            top: `${wrapper.offsetTop - (wrapper.offsetHeight / 2) - (logo.offsetHeight / 2)}px`,
            opacity: '1',
        });
    };
}

function showForm(onSubmit = () => { }) {
    showPopup(
        'Do you want to fill out a form to enter ranked play and win our awesome prizes?',
        'Sure',
        () => {
            document.body.removeChild(popup.element);
            showPopup(
                `...<hr>
                <div style='text-align: left'>
                    <span class='small'>School Name:</span> <input id='school' type='text' style='width: 50%'><br>
                    <span class='small'>Birthday:</span> <select id='birthYear'>
                        <option value='2015'>2015</option>
                        <option value='2014'>2014</option>
                        <option value='2013'>2013</option>
                        <option value='2012'>2012</option>
                        <option value='2011'>2011</option>
                        <option value='2010'>2010</option>
                        <option value='2009'>2009</option>
                        <option value='2008'>2008</option>
                        <option value='2007'>2007</option>
                        <option value='2006'>2006</option>
                        <option value='2005'>2005</option>
                        <option value='2004'>2004</option>
                        <option value='2003'>2003</option>
                        <option value='2002'>2002</option>
                        <option value='2001'>2001</option>
                    </select>
                    <select id='birthMonth'>
                        <option value='Jan'>Jan</option>
                        <option value='Feb'>Feb</option>
                        <option value='Wed'>Wed</option>
                        <option value='Apr'>Apr</option>
                        <option value='May'>May</option>
                        <option value='Jun'>Jun</option>
                        <option value='Jul'>Jul</option>
                        <option value='Aug'>Aug</option>
                        <option value='Sep'>Sep</option>
                        <option value='Oct'>Oct</option>
                        <option value='Nov'>Nov</option>
                        <option value='Dec'>Dec</option>
                    </select>
                </div><hr>`,
                'Next',
                () => {
                    profile.userInfo = {
                        school_name: school.value.trim(),
                        birth_date: `${birthYear.options[birthYear.options.selectedIndex].value} ${birthMonth.options[birthMonth.options.selectedIndex].value}`,
                    };
                    document.body.removeChild(popup.element);
                    showPopup(
                        `...<hr>
                        <div style='text-align: left'>
                            <span class='small'>Parent Name:</span> <input id='parentFirstName' type='text' placeholder='First Name' style='width: 25%'> <input id='parentLastName' type='text' placeholder='Last Name' style='width: 25%'><br>
                            <span class='small'>Contact Number:</span> <input id='parentContactNumber' type='text' style='width: 50%'><br>
                            <span class='small'>Email:</span> <input id='parentEmail' type='text' style='width: 50%'>
                        </div><br>
                        <div style='text-align: left'>
                            <input id='receiveUpdates' type='checkbox'><label for='receiveUpdates'>I (Parent) do not wish to receive future updates from BSD</label><br>
                            <input id='tnc' type='checkbox' checked><label for='tnc'>I (Parent) agree to accept BSD's <a href='https://hk.bsdacademy.com/terms-conditions/' target='_blank'>Terms & Conditions</label>
                        </div><hr>`,
                        'Submit',
                        () => {
                            profile.userInfo.parent_name = `${parentFirstName.value.trim()} ${parentLastName.value.trim()}`;
                            profile.userInfo.parent_contact = parentContactNumber.value.trim();
                            profile.userInfo.parent_email = parentEmail.value.trim();
                            profile.userInfo.receive_updates = 'Yes';
                            document.body.removeChild(popup.element);
                            showPopup(
                                'To encourage fair play, your progress will be reset.',
                                'Start Ranked Play',
                                () => {
                                    popup.button.disabled = true;
                                    popup.button.textContent = 'Saving your info...';
                                    style([popup.button], {opacity: '0.5'});
                                    fire.doc(`players/${profile.lb_user_id}`).set({progress: '', score: 0, userInfo: profile.userInfo}, { merge: true })
                                        .then(() => {
                                            delete localStorage.completedLevels;
                                            window.location.reload(true);
                                            console.log('Reset progress & score, added', profile.userInfo);
                                        })
                                        .catch(error => console.error('Error adding document: ', error));
                                }
                            );
                        }
                    );

                    tnc.onchange = (evt) => {
                        popup.button.disabled = !evt.target.checked;
                        style([popup.button], { opacity: `${evt.target.checked ? '1' : '0.5'}` });
                    };

                    receiveUpdates.onchange = (evt) => profile.userInfo.receive_updates = evt.target.checked ? 'No' : 'Yes';
                }
            );
        },
        true,
        () => document.body.removeChild(popup.element)
    );
}

window.onload = function () {
    profile = getBSDProfile();

    if (profile) {
        showPopup('Loading leaderboard...');

        // Initialize Cloud Firestore through Firebase
        firebase.initializeApp({
            apiKey: 'AIzaSyCk7YyJ7d9VUjED8vQbeWLnvYZH9BHTwVI',
            authDomain: 'bsd-pup.firebaseapp.com',
            projectId: 'bsd-pup'
        });

        fire = firebase.firestore();

        fire.collection('players').get().then(players => {
            document.body.removeChild(popup.element);

            if (players.empty) {
                showPopup('You\'re the first one to challenge this puzzle. Good Luck!', 'Play', () => document.body.removeChild(popup.element));
            }
            else {
                const playerArray = [];

                players.forEach(p => {
                    if (p.data().score > champion.score) {
                        champion.name = p.data().name;
                        champion.score = p.data().score;
                    }
                    playerArray.push(p);
                });

                if (!playerArray.some(p => {
                    const playerExists = p.id === profile.lb_user_id;
                    if (playerExists) {
                        profile.score = p.data().progress.split(',').length;
                        profile.time = p.data().time || null;
                        profile.userInfo = p.data().userInfo || {};
                        localStorage.setItem('completedLevels', p.data().progress);
                    }
                    return playerExists;
                })) {
                    localStorage.setItem('completedLevels', '');
                }

                showPopup(
                    `Top player<br><span class='blue'>${champion.name}</span><br>solved a total of<br><span class='gold'>${champion.score}</span> levels`,
                    'Play',
                    () => {
                        document.body.removeChild(popup.element);
                        const info = Object.values(profile.userInfo || {});
                        if (info.length === 6 && info.every(val => val && val.trim()) && !profile.time) {
                            fire.doc(`players/${profile.lb_user_id}`).set({time: profile.time = Date.now()}, { merge: true })
                                .then(() => console.log('Added time', profile.time))
                                .catch(error => console.error('Error adding document: ', error));
                        }
                    }
                );
            }

            loadGame();
        });
    }
    else {
        showPopup('You must log in with a Launchbox account to play', 'Go to Launchbox', () => window.open('https://app.bsdlaunchbox.com'));
        document.onvisibilitychange = () => {
            if (document.visibilityState === 'visible') window.location.reload(true);
        };
    }
};

// ===== UTILITY ===== //

function style(elem, declarations) {
    Object.keys(declarations).forEach(d => {
        elem.forEach(e => {
            e.style[d.replace(/_/, '-')] = declarations[d];
        });
    });
}

// ===== BSD PROFILE ===== //

function getBSDProfile() {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

    function InvalidCharacterError(message) {
        this.message = message;
    }

    InvalidCharacterError.prototype = new Error();
    InvalidCharacterError.prototype.name = 'InvalidCharacterError';

    function polyfill(input) {
        var str = String(input).replace(/=+$/, '');
        if (str.length % 4 == 1) {
            throw new InvalidCharacterError("'atob' failed: The string to be decoded is not correctly encoded.");
        }
        for (
            // initialize result and counters
            var bc = 0, bs, buffer, idx = 0, output = '';
            // get next character
            buffer = str.charAt(idx++);
            // character found in table? initialize bit storage and add its ascii value;
            ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
                // and if not first of each 4 characters,
                // convert the first 8 bits to one ascii character
                bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
        ) {
            // try to find character in table (0-63, not found => -1)
            buffer = chars.indexOf(buffer);
        }
        return output;
    }

    function b64DecodeUnicode(str) {
        return decodeURIComponent(atob(str).replace(/(.)/g, function (m, p) {
            var code = p.charCodeAt(0).toString(16).toUpperCase();
            if (code.length < 2) {
                code = '0' + code;
            }
            return '%' + code;
        }));
    }

    function base64_url_decode(str) {
        var output = str.replace(/-/g, '+').replace(/_/g, '/');
        switch (output.length % 4) {
            case 0:
                break;
            case 2:
                output += '==';
                break;
            case 3:
                output += '=';
                break;
            default:
                throw 'Illegal base64url string!';
        }

        try {
            return b64DecodeUnicode(output);
        } catch (err) {
            return atob(output);
        }
    }

    function InvalidTokenError(message) {
        this.message = message;
    }

    InvalidTokenError.prototype = new Error();
    InvalidTokenError.prototype.name = 'InvalidTokenError';

    function decodeJwt(token, options) {
        if (typeof token !== 'string') {
            throw new InvalidTokenError('Invalid token specified');
        }

        options = options || {};
        var pos = options.header === true ? 0 : 1;
        try {
            return JSON.parse(base64_url_decode(token.split('.')[pos]));
        } catch (e) {
            throw new InvalidTokenError('Invalid token specified: ' + e.message);
        }
    }

    var token = parent.localStorage.getItem('id_token');
    if (token != null) {
        var decoded = decodeJwt(token);
        if (decoded != null) {
            return {
                name: decoded.name,
                email: decoded.email,
                picture: decoded.picture,
                lb_user_id: decoded.lb_user_id,
                auth0_user_id: decoded.user_id,
                organisations: decoded.organisations
            };
        }
    }
    return null;
}