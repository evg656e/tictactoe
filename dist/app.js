(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("ws"));
	else if(typeof define === 'function' && define.amd)
		define(["ws"], factory);
	else if(typeof exports === 'object')
		exports["TicTacToe"] = factory(require("ws"));
	else
		root["TicTacToe"] = factory(root["ws"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_6__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 7);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Observer;
console.log('defining Observer');

/*!
    \class Observer
    \brief Various implementations of Observer pattern.
    \see https://github.com/millermedeiros/js-signals/wiki/Comparison-between-different-Observer-Pattern-implementations
    \see http://robdodson.me/javascript-design-patterns-observer/
    \see https://github.com/Gozala/events
    \todo maxListeners
*/

function Observer() {
}

/*!
    \fn message
*/
function message() {
    var listeners;

    function message() {
        if (!listeners)
            return false;
        if (typeof listeners === 'function')
            listeners.apply(null, arguments);
        else {
            var list = listeners.slice(); // avoid 'once' side-effects
            for (var i = 0; i < list.length; i++)
                list[i].apply(null, arguments);
        }
        return true;
    }

    message.subscribe = function(listener) {
        if (typeof listener !== 'function')
            throw new TypeError('listener must be a function');
        if (!listeners)
            listeners = listener;
        else if (typeof listeners === 'function')
            listeners = [listeners, listener];
        else
            listeners.push(listener);
    };

    message.unsubscribe = function(listener) {
        if (typeof listener !== 'function')
            throw new TypeError('listener must be a function');
        if (!listeners)
            return;
        if (typeof listeners === 'function') {
            if (listener === listeners)
                listeners = null;
        }
        else {
            for (var i = listeners.length; i-- > 0;)
                if (listener === listeners[i])
                    listeners.splice(i, 1);
            if (listeners.length === 1)
                listeners = listeners[0];
            else if (listeners.length === 0)
                listeners = null;
        }
    };

    message.once = function(listener) {
        if (typeof listener !== 'function')
            throw new TypeError('listener must be a function');
        var fired = false;
        function g() {
            if (!fired) {
                fired = true;
                message.unsubscribe(g);
                listener.apply(null, arguments);
            }
        }
        g.listener = listener;
        message.subscribe(g);
    };

    message.unsubscribeAll = function() {
        listeners = null;
    };

    message.listenerCount = function() {
        if (!listeners)
            return 0;
        if (typeof listeners === 'function')
            return 1;
        return listeners.length;
    };

    return message;
}

Observer.message = message;

/*!
    \class EventEmitter
*/
function EventEmitter() {
}

EventEmitter.create = function() {
    return new EventEmitter();
};

EventEmitter.prototype.addListener = function(type, listener) {
    if (typeof listener !== 'function')
        throw new TypeError('listener must be a function');

    if (!this.events)
        this.events = {};

    if (this.events.newListener)
        this.emit('newListener', type, typeof listener.listener === 'function' ? listener.listener : listener); // condition for 'once' wrapped listener

    var listeners = this.events[type];
    if (!listeners)
        this.events[type] = listener;
    else if (typeof listeners === 'function')
        this.events[type] = [listeners, listener];
    else
        this.events[type].push(listener);

    return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
    if (typeof listener !== 'function')
        throw new TypeError('listener must be a function');

    var fired = false;
    function g(e) {
        this.removeListener(type, g);
        if (!fired) {
            fired = true;
            listener.apply(this, arguments);
        }
    }
    g.listener = listener;

    this.addListener(type, g);
};

EventEmitter.prototype.removeListener = function(type, listener) {
    if (typeof listener !== 'function')
        throw new TypeError('listener must be a function');

    if (!this.events)
        return this;

    var listeners = this.events[type];
    if (!listeners)
        return this;

    if (typeof listeners === 'function') {
        if (listeners === listener) {
            delete this.events[type];
            if (this.events.removeListener)
                this.emit('removeListener', type, listener);
        }
        return this;
    }

    for (var i = listeners.length; i-- > 0;) {
        if (listeners[i] === listener) {
            listeners.splice(i, 1);

            if (listeners.length === 1)
                this.events[type] = listeners[0];
            else if (listeners.length === 0)
                delete this.events[type];

            if (this.events.removeListener)
                this.emit('removeListener', type, listener);

            return this;
        }
    }

    return this;
};

EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

EventEmitter.prototype.removeAllListeners = function(type) {
    if (!this.events)
        return this;

    if (type == null) {
        for (type in this.events) {
            if (type === 'removeListener')
                continue;
            this.removeAllListeners(type);
        }
        this.removeAllListeners('removeListener');
        delete this.events;
        return this;
    }

    var listeners = this.events[type];
    if (!listeners)
        return this;

    if (typeof listeners === 'function')
        this.removeListener(type, listeners);
    else {
        while (listeners.length > 1)
            this.removeListener(type, listeners[listeners.length - 1]);
        this.removeListener(type, this.events[type]);
    }

    delete this.events[type];
};

EventEmitter.prototype.emit = function(type) {
    if (!this.events)
        return false;

    var listeners = this.events[type];
    if (!listeners)
        return false;

    if (typeof listeners === 'function')
        listeners.apply(this, Array.prototype.slice.call(arguments, 1));
    else {
        var list = listeners.slice(),
            args = Array.prototype.slice.call(arguments, 1);
        for (var i = 0; i < list.length; i++)
            list[i].apply(this, args);
    }
    return true;
};

EventEmitter.prototype.listeners = function(type) {
    if (!this.events)
        return [];

    var listeners = this.events[type];
    if (!listeners)
        return [];

    if (typeof listeners === 'function')
        return [listeners];

    return listeners.slice();
};

EventEmitter.prototype.listenerCount = function(type) {
    return this.listeners(type).length;
};

Observer.EventEmitter = EventEmitter;


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
console.log('defining Timers');

/* harmony default export */ __webpack_exports__["a"] = (function() {
    if (typeof Qt === 'object') {
        return (function() {
            var timers = {},
                currentId = 0;
            function createTimer(parent) {
                return Qt.createQmlObject('import QtQuick 2.6; Timer {}', parent || Qt.application);
            }
            function insertTimer(timer) {
                timers[++currentId] = timer;
                return currentId;
            }
            function removeTimer(timerId) {
                var timer = timers[timerId];
                if (timer) {
                    delete timers[timerId];
                    timer.stop();
                    timer.destroy();
                }
            }
            return {
                setTimeout: function(callback, delay) {
                    var timer   = createTimer(),
                        timerId = insertTimer(timer),
                        args    = Array.prototype.slice.call(arguments, 2);
                    timer.interval = delay || 1; // timer.interval should not be 0 (qt bug?)
                    timer.triggered.connect(function() {
                        removeTimer(timerId);
                        callback.apply(this, args);
                    }.bind(this));
                    timer.start();
                    return timerId;
                },
                clearTimeout: function(timerId) {
                    removeTimer(timerId)
                },
                setInterval: function(callback, delay) {
                    var timer   = createTimer(),
                        timerId = insertTimer(timer),
                        args    = Array.prototype.slice.call(arguments, 2);
                    timer.interval = delay || 1; // timer.interval should not be 0 (qt bug?)
                    timer.repeat = true;
                    timer.triggered.connect(function() {
                        callback.apply(this, args);
                    }.bind(this));
                    timer.start();
                    return timerId;
                },
                clearInterval: function(timerId) {
                    removeTimer(timerId);
                }
            };
        }());
    }

    return (function(wrap) {
        return {
            setTimeout   : wrap(setTimeout),
            clearTimeout : wrap(clearTimeout),
            setInterval  : wrap(setInterval),
            clearInterval: wrap(clearInterval),
        };
    }(function(fn) {
        return function() {
            return fn.apply(null, Array.prototype.slice.call(arguments));
        };
    }));
}());


/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });

// CONCATENATED MODULE: ./lib/util.js
console.log('defining Util');

/*!
    \class Util
*/
function Util() {
}

(function() {
    function md5cycle(x, k) {
        var a = x[0], b = x[1], c = x[2], d = x[3];

        a = ff(a, b, c, d, k[0], 7, -680876936);
        d = ff(d, a, b, c, k[1], 12, -389564586);
        c = ff(c, d, a, b, k[2], 17,  606105819);
        b = ff(b, c, d, a, k[3], 22, -1044525330);
        a = ff(a, b, c, d, k[4], 7, -176418897);
        d = ff(d, a, b, c, k[5], 12,  1200080426);
        c = ff(c, d, a, b, k[6], 17, -1473231341);
        b = ff(b, c, d, a, k[7], 22, -45705983);
        a = ff(a, b, c, d, k[8], 7,  1770035416);
        d = ff(d, a, b, c, k[9], 12, -1958414417);
        c = ff(c, d, a, b, k[10], 17, -42063);
        b = ff(b, c, d, a, k[11], 22, -1990404162);
        a = ff(a, b, c, d, k[12], 7,  1804603682);
        d = ff(d, a, b, c, k[13], 12, -40341101);
        c = ff(c, d, a, b, k[14], 17, -1502002290);
        b = ff(b, c, d, a, k[15], 22,  1236535329);

        a = gg(a, b, c, d, k[1], 5, -165796510);
        d = gg(d, a, b, c, k[6], 9, -1069501632);
        c = gg(c, d, a, b, k[11], 14,  643717713);
        b = gg(b, c, d, a, k[0], 20, -373897302);
        a = gg(a, b, c, d, k[5], 5, -701558691);
        d = gg(d, a, b, c, k[10], 9,  38016083);
        c = gg(c, d, a, b, k[15], 14, -660478335);
        b = gg(b, c, d, a, k[4], 20, -405537848);
        a = gg(a, b, c, d, k[9], 5,  568446438);
        d = gg(d, a, b, c, k[14], 9, -1019803690);
        c = gg(c, d, a, b, k[3], 14, -187363961);
        b = gg(b, c, d, a, k[8], 20,  1163531501);
        a = gg(a, b, c, d, k[13], 5, -1444681467);
        d = gg(d, a, b, c, k[2], 9, -51403784);
        c = gg(c, d, a, b, k[7], 14,  1735328473);
        b = gg(b, c, d, a, k[12], 20, -1926607734);

        a = hh(a, b, c, d, k[5], 4, -378558);
        d = hh(d, a, b, c, k[8], 11, -2022574463);
        c = hh(c, d, a, b, k[11], 16,  1839030562);
        b = hh(b, c, d, a, k[14], 23, -35309556);
        a = hh(a, b, c, d, k[1], 4, -1530992060);
        d = hh(d, a, b, c, k[4], 11,  1272893353);
        c = hh(c, d, a, b, k[7], 16, -155497632);
        b = hh(b, c, d, a, k[10], 23, -1094730640);
        a = hh(a, b, c, d, k[13], 4,  681279174);
        d = hh(d, a, b, c, k[0], 11, -358537222);
        c = hh(c, d, a, b, k[3], 16, -722521979);
        b = hh(b, c, d, a, k[6], 23,  76029189);
        a = hh(a, b, c, d, k[9], 4, -640364487);
        d = hh(d, a, b, c, k[12], 11, -421815835);
        c = hh(c, d, a, b, k[15], 16,  530742520);
        b = hh(b, c, d, a, k[2], 23, -995338651);

        a = ii(a, b, c, d, k[0], 6, -198630844);
        d = ii(d, a, b, c, k[7], 10,  1126891415);
        c = ii(c, d, a, b, k[14], 15, -1416354905);
        b = ii(b, c, d, a, k[5], 21, -57434055);
        a = ii(a, b, c, d, k[12], 6,  1700485571);
        d = ii(d, a, b, c, k[3], 10, -1894986606);
        c = ii(c, d, a, b, k[10], 15, -1051523);
        b = ii(b, c, d, a, k[1], 21, -2054922799);
        a = ii(a, b, c, d, k[8], 6,  1873313359);
        d = ii(d, a, b, c, k[15], 10, -30611744);
        c = ii(c, d, a, b, k[6], 15, -1560198380);
        b = ii(b, c, d, a, k[13], 21,  1309151649);
        a = ii(a, b, c, d, k[4], 6, -145523070);
        d = ii(d, a, b, c, k[11], 10, -1120210379);
        c = ii(c, d, a, b, k[2], 15,  718787259);
        b = ii(b, c, d, a, k[9], 21, -343485551);

        x[0] = add32(a, x[0]);
        x[1] = add32(b, x[1]);
        x[2] = add32(c, x[2]);
        x[3] = add32(d, x[3]);

    }

    function cmn(q, a, b, x, s, t) {
        a = add32(add32(a, q), add32(x, t));
        return add32((a << s) | (a >>> (32 - s)), b);
    }

    function ff(a, b, c, d, x, s, t) {
        return cmn((b & c) | ((~b) & d), a, b, x, s, t);
    }

    function gg(a, b, c, d, x, s, t) {
        return cmn((b & d) | (c & (~d)), a, b, x, s, t);
    }

    function hh(a, b, c, d, x, s, t) {
        return cmn(b ^ c ^ d, a, b, x, s, t);
    }

    function ii(a, b, c, d, x, s, t) {
        return cmn(c ^ (b | (~d)), a, b, x, s, t);
    }

    function md51(s) {
        var txt = '',
            n = s.length,
            state = [1732584193, -271733879, -1732584194, 271733878], i;
        for (i=64; i<=s.length; i+=64) {
            md5cycle(state, md5blk(s.substring(i-64, i)));
        }
        s = s.substring(i-64);
        var tail = [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0];
        for (i=0; i<s.length; i++)
            tail[i>>2] |= s.charCodeAt(i) << ((i%4) << 3);
        tail[i>>2] |= 0x80 << ((i%4) << 3);
        if (i > 55) {
            md5cycle(state, tail);
            for (i=0; i<16; i++) tail[i] = 0;
        }
        tail[14] = n*8;
        md5cycle(state, tail);
        return state;
    }

    function md5blk(s) {
        var md5blks = [], i;
        for (i=0; i<64; i+=4) {
            md5blks[i>>2] = s.charCodeAt(i)
                    + (s.charCodeAt(i+1) << 8)
                    + (s.charCodeAt(i+2) << 16)
                    + (s.charCodeAt(i+3) << 24);
        }
        return md5blks;
    }

    var hex_chr = '0123456789abcdef'.split('');

    function rhex(n)
    {
        var s='', j=0;
        for(; j<4; j++)
            s += hex_chr[(n >> (j * 8 + 4)) & 0x0F]
                    + hex_chr[(n >> (j * 8)) & 0x0F];
        return s;
    }

    function hex(x) {
        for (var i=0; i<x.length; i++)
            x[i] = rhex(x[i]);
        return x.join('');
    }

    /*!
        \fn md5
        \see http://www.myersdaily.org/joseph/javascript/md5-text.html
    */
    function md5(s) {
        return hex(md51(s));
    }

    function add32(a, b) {
        return (a + b) & 0xFFFFFFFF;
    }

    Util.md5 = md5;
}());

// some usefull polyfills

//! \see https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex
if (!Array.prototype.findIndex) {
    Array.prototype.findIndex = function(predicate) {
        if (this == null) {
            throw new TypeError('Array.prototype.findIndex called on null or undefined');
        }
        if (typeof predicate !== 'function') {
            throw new TypeError('predicate must be a function');
        }
        var list = Object(this);
        var length = list.length >>> 0;
        var thisArg = arguments[1];
        var value;

        for (var i = 0; i < length; i++) {
            value = list[i];
            if (predicate.call(thisArg, value, i, list)) {
                return i;
            }
        }
        return -1;
    };
}

//! \see https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Array/find
if (!Array.prototype.find) {
    Array.prototype.find = function(predicate) {
        if (this == null) {
            throw new TypeError('Array.prototype.find called on null or undefined');
        }
        if (typeof predicate !== 'function') {
            throw new TypeError('predicate must be a function');
        }
        var list = Object(this);
        var length = list.length >>> 0;
        var thisArg = arguments[1];
        var value;

        for (var i = 0; i < length; i++) {
            value = list[i];
            if (predicate.call(thisArg, value, i, list)) {
                return value;
            }
        }
        return undefined;
    };
}

//! \see http://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format
if (!String.prototype.format) {
    String.prototype.format = function() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] !== 'undefined' ? args[number] : match;
        });
    };
}

//! \see https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith
if (!String.prototype.startsWith) {
    Object.defineProperty(String.prototype, 'startsWith', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function(searchString, position) {
            position = position || 0;
            return this.lastIndexOf(searchString, position) === position;
        }
    });
}

//! \see https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith
if (!String.prototype.endsWith) {
    Object.defineProperty(String.prototype, 'endsWith', {
        value: function(searchString, position) {
            var subjectString = this.toString();
            if (position === undefined || position > subjectString.length) {
                position = subjectString.length;
            }
            position -= searchString.length;
            var lastIndex = subjectString.indexOf(searchString, position);
            return lastIndex !== -1 && lastIndex === position;
        }
    });
}

(function() {
    function testFlag(value, flag) {
        return (value & flag) === flag && (flag !== 0 || value === flag);
    }

    function setFlag(value, flag, on) {
        return on ? (value | flag) : (value & ~flag);
    }

    Util.testFlag = testFlag;
    Util.setFlag = setFlag;

//    function toPairsOrdered(arg) {
//        switch (Object.prototype.toString.call(arg)) {
//        case '[object Object]': return Object.keys(arg).map(function(key) { var pair = {}; pair[key] = toPairsOrdered(arg[key]); return pair; }).sort(function(lhs, rhs) { return Object.keys(lhs)[0].localeCompare(Object.keys(rhs)[0]); });
//        case '[object Array]' : return arg.map(function(val) { return toPairsOrdered(val); });
//        default:                return arg;
//        }
//    }

    function toPairsOrdered(arg) {
        switch (Object.prototype.toString.call(arg)) {
        case '[object Object]': return Object.keys(arg).map(function(key) { return [key, toPairsOrdered(arg[key])]; }).sort(function(lhs, rhs) { return lhs[0].localeCompare(rhs[0]); });
        case '[object Array]' : return arg.map(function(val) { return toPairsOrdered(val); });
        default:                return arg;
        }
    }

    Util.toPairsOrdered = toPairsOrdered;
}());

// CONCATENATED MODULE: ./lib/websocket.js
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__observer_js__ = __webpack_require__(0);


console.log('defining WebSocket');

// WebSocket adapter

/* harmony default export */ var websocket_defaultExport = (function() {
    if (typeof Qt === 'object') {
        return (function(EventEmitter) {
            function Event(type, target) {
                this.type = type;
                this.target = target;
            }

            function OpenEvent(target) {
                Event.call(this, 'open', target);
            }

            OpenEvent.prototype = Object.create(Event.prototype);
            OpenEvent.prototype.constructor = OpenEvent;

            function CloseEvent(code, reason, target) {
                Event.call(this, 'close', target);
                this.code = code;
                this.reason = reason;
                this.wasClean = code === undefined || code === 1000;
            }

            CloseEvent.prototype = Object.create(Event.prototype);
            CloseEvent.prototype.constructor = CloseEvent;

            function ErrorEvent(message, target) {
                Event.call(this, 'error', target);
                this.message = message;
            }

            ErrorEvent.prototype = Object.create(Event.prototype);
            ErrorEvent.prototype.constructor = ErrorEvent;

            function MessageEvent(data, binary, target) {
                Event.call(this, 'message', target);
                this.data = data;
                this.binary = binary;
            }

            MessageEvent.prototype = Object.create(Event.prototype);
            MessageEvent.prototype.constructor = MessageEvent;

            function WebSocket(url, protocols, parent) {
                this.events = new EventEmitter();
                this.qtWebSocket = Qt.createQmlObject('import QtWebSockets 1.1; WebSocket { url: "' + url + '"}', parent || Qt.application); // url should be set inside qml object or socket won't work (qml bug?)
                this.qtWebSocket.statusChanged.connect(this.statusChanged.bind(this));
                this.qtWebSocket.binaryMessageReceived.connect(this.binaryMessageReceived.bind(this));
                this.qtWebSocket.textMessageReceived.connect(this.textMessageReceived.bind(this));
                Object.defineProperty(this, 'readyState', {
                    get: function() { return this.qtWebSocket.status; },
                    enumerable: true
                });
                Object.defineProperty(this, 'url', {
                    get: function() { return this.qtWebSocket.url; },
                    enumerable: true
                });
    //            this.qtWebSocket.url = url; // socket won't work
                this.qtWebSocket.active = true;
            }

            WebSocket.CONNECTING = 0;
            WebSocket.OPEN       = 1;
            WebSocket.CLOSING    = 2;
            WebSocket.CLOSED     = 3;
            WebSocket.ERROR      = 4; // qt only

            WebSocket.prototype.dispatchEvent = function(event) {
                this.events.emit(event.type, event);
            };

            WebSocket.prototype.addEventListener = function(type, listener) {
                this.events.on(type, listener);
            };

            WebSocket.prototype.removeEventListener = function(type, listener) {
                this.events.off(type, listener);
            };

            WebSocket.prototype.statusChanged = function(status) {
                console.log('WebSocket.statusChanged()', status);
                switch (status) {
                case WebSocket.CONNECTING: break;
                case WebSocket.OPEN:       this.dispatchEvent(new OpenEvent(this)); break;
                case WebSocket.CLOSING:    break;
                case WebSocket.CLOSED:     this.dispatchEvent(new CloseEvent(this.code, this.reason, this)); break;
                case WebSocket.ERROR:      this.dispatchEvent(new ErrorEvent(this.qtWebSocket.errorString, this)); break;
                default:                   break;
                }
            };

            WebSocket.prototype.binaryMessageReceived = function(message) {
                this.dispatchEvent(new MessageEvent(message, true, this));
            };

            WebSocket.prototype.textMessageReceived = function(message) {
                this.dispatchEvent(new MessageEvent(message, false, this));
            };

            WebSocket.prototype.send = function(data) {
                if (Object.prototype.toString.call(data) === '[object ArrayBuffer]')
                    this.qtWebSocket.sendBinaryMessage(data);
                else
                    this.qtWebSocket.sendTextMessage(data);
            };

            WebSocket.prototype.close = function(code, reason) {
                this.code = code;
                this.reason = reason;
                this.qtWebSocket.active = false;
            };

            function shorthand(func) {
                function f(event) {
                    func.call(this, event);
                }
                f.shorthand = true;
                return f;
            }

            ['open', 'error', 'close', 'message'].forEach(function(event) {
                Object.defineProperty(WebSocket.prototype, 'on' + event, {
                    get: function() {
                        var listeners = this.events.listeners(event);
                        for (var i = 0; i < listeners.length; i++)
                            if (listeners[i].shorthand)
                                return listeners[i];
                    },
                    set: function(listener) {
                        var listeners = this.events.listeners(event);
                        for (var i = 0; i < listeners.length; i++)
                            if (listeners[i].shorthand)
                                this.removeEventListener(event, listeners[i]);
                        if (typeof listener === 'function')
                            this.addEventListener(event, shorthand(listener));
                    }
                });
            });

            WebSocket.prototype.destroy = function() {
                console.log('WebSocket.destroy()');
                this.qtWebSocket.active = false;
                Qt.callLater(function() {
                    this.qtWebSocket.destroy();
                    delete this.qtWebSocket;
                }.bind(this));
            };

            return WebSocket;
        }(__WEBPACK_IMPORTED_MODULE_0__observer_js__["a" /* default */].EventEmitter));
    }

    if (typeof exports === 'object' && typeof module === 'object')
        return __webpack_require__(6); // requires https://www.npmjs.com/package/ws

    return WebSocket; // fallback
}());

// CONCATENATED MODULE: ./lib/tictactoe.js
/* harmony export (immutable) */ __webpack_exports__["default"] = TicTacToe;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__3rdparty_lodash_js__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__timers_js__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__observer_js__ = __webpack_require__(0);






console.log('defining TicTacToe');

var message        = __WEBPACK_IMPORTED_MODULE_3__observer_js__["a" /* default */].message,
    EventEmitter   = __WEBPACK_IMPORTED_MODULE_3__observer_js__["a" /* default */].EventEmitter,
    setTimeout     = __WEBPACK_IMPORTED_MODULE_2__timers_js__["a" /* default */].setTimeout,
    clearTimeout   = __WEBPACK_IMPORTED_MODULE_2__timers_js__["a" /* default */].clearTimeout,
    debounce       = __WEBPACK_IMPORTED_MODULE_0__3rdparty_lodash_js__["a" /* default */].debounce,
    md5            = Util.md5,
    toPairsOrdered = Util.toPairsOrdered,
    testFlag       = Util.testFlag,
    setFlag        = Util.setFlag;

/*!
    \class TicTacToe
*/
function TicTacToe() {
}

var _ = 0,
    X = 1,
    O = 2;

TicTacToe.markText = function(mark) {
    return TicTacToe.markText[mark];
};

TicTacToe.markText[_] = ' ';
TicTacToe.markText[X] = 'X';
TicTacToe.markText[O] = 'O';

TicTacToe._ = _;
TicTacToe.X = X;
TicTacToe.O = O;

var Player1 = 0,
    Player2 = 1,
    MaxPlayers = 2;

TicTacToe.playerName = function(index) {
    if (index >= 0 && index < MaxPlayers)
        return 'Player ' + (index + 1);
    return '';
};

TicTacToe.playerClass = function(index) {
    if (index >= 0 && index < MaxPlayers)
        return 'player' + (index + 1);
    return '';
};

// common predicates for findPlayer function
TicTacToe.player1 = function(player) {
    return player.index === Player1;
};

TicTacToe.player2 = function(player) {
    return player.index === Player2;
};

TicTacToe.playerByIndex = function(index) {
    return function(player) {
        return player.index === index;
    };
};

TicTacToe.thisPlayer = function(thisPlayer) {
    return function(otherPlayer) {
        return thisPlayer.equals(otherPlayer);
    };
};

TicTacToe.otherPlayer = function(thisPlayer) {
    return function(otherPlayer) {
        return !thisPlayer.equals(otherPlayer);
    };
};

TicTacToe.Player1 = Player1;
TicTacToe.Player2 = Player2;
TicTacToe.MaxPlayers = MaxPlayers;

TicTacToe.DiscardState = 0;
TicTacToe.ProceedState = 1;
TicTacToe.WinState     = 2;
TicTacToe.DrawState    = 3;

TicTacToe.WaitingForPlayersState = 0;
TicTacToe.PlayersReadyState      = 1;
TicTacToe.MatchRunningState      = 2;
TicTacToe.MatchFinishedState     = 3;

TicTacToe.NotConnectedState = 0x0;
TicTacToe.ConnectedState    = 0x1;
TicTacToe.FindingMatchState = 0x2;
TicTacToe.GameRunningState  = 0x4;

TicTacToe.SoloMode        = 0;
TicTacToe.AiMode          = 1;
TicTacToe.MultiplayerMode = 2;

TicTacToe.availableGameModes = function() {
    return [
        { text: 'Play Solo',         value: TicTacToe.SoloMode },
        { text: 'Play with Ai',      value: TicTacToe.AiMode },
        { text: 'Find other Player', value: TicTacToe.MultiplayerMode }
    ];
};

/*!
    \class Grid
*/
function Grid() {
    this.cellChanged = message();
    this.cleared = message();
    this.clear();
}

Grid.Size = 3;

Grid.toIndex = function(row, column) {
    return row*Grid.Size + column;
};

Grid.toRow = function(index) {
    return Math.floor(index/Grid.Size);
};

Grid.toColumn = function(index) {
    return index%Grid.Size
};

Grid.restore = function(state) {
    var ret = new Grid();
    ret.restore(state);
    return ret;
};

Grid.prototype.clear = function() {
    this.cells = [_, _, _,
                  _, _, _,
                  _, _, _];
    this.blankCells = this.cells.length;
    this.cleared();
};

// [0, 1, 2,     [(0,0), (0,1), (0,2),
//  3, 4, 5, <=>  (1,0), (1,1), (1,2),
//  6, 7, 8]      (2,0), (2,1), (2,2)]

Grid.prototype.cellAt = function(row, column) {
    return this.cells[row*Grid.Size + column];
};

Grid.prototype.setCell = function(row, column, mark, playerIndex) {
    var index = row*Grid.Size + column;
    if (this.cells[index] === _) {
        if (mark === X || mark === O) {
            this.cells[index] = mark;
            this.blankCells--;
            this.cellChanged(row, column, mark, playerIndex);
            if (this.isWinState(row, column, mark))
                return TicTacToe.WinState;
            return this.blankCells === 0 ? TicTacToe.DrawState : TicTacToe.ProceedState;
        }
    }
    return TicTacToe.DiscardState;
};

Grid.prototype.isWinState = function(row, column, mark) {
    var rowEqual = true,
        columnEqual = true,
        majorDiagonalEqual = row === column,
        minorDiagonalEqual = (row + column === Grid.Size - 1);
    for (var k = 0; k < Grid.Size; k++) {
        rowEqual = rowEqual && this.cellAt(row, k) === mark;
        columnEqual = columnEqual && this.cellAt(k, column) === mark;
        majorDiagonalEqual = majorDiagonalEqual && this.cellAt(k, k) === mark;
        minorDiagonalEqual = minorDiagonalEqual && this.cellAt(k, Grid.Size - k - 1) === mark;
    }
    return rowEqual || columnEqual || majorDiagonalEqual || minorDiagonalEqual;
};

Grid.prototype.testWinState = function(row, column, mark) {
    var result = false;
    if (this.cellAt(row, column) === _) {
        var index = row*Grid.Size + column;
        this.cells[index] = mark;
        result = this.isWinState(row, column, mark);
        this.cells[index] = _;
    }
    return result;
};

Grid.prototype.dump = function() {
    return {
        cells: this.cells.map(function(cell) { return cell; })
    };
};

Grid.prototype.restore = function(state) {
    this.blankCells = 0;
    this.cells = state.cells.map(function(cell) {
        if (cell === _)
            this.blankCells++;
        return cell;
    }.bind(this));
};

Grid.prototype.debug = function() {
    var text = '',
        markText = {};
    markText[_] = '_';
    markText[X] = 'X';
    markText[O] = 'O';
    for (var i = 0; i < Grid.Size; i++) {
        for (var j = 0; j < Grid.Size; j++) {
            text += markText[this.cellAt(i, j)];
        }
        text += '\n';
    }
    return text;
}

TicTacToe.Grid = Grid;

/*!
    \class Player
*/
function Player(name) {
    this.match = null;
    this.index = -1;
    this.mark = _;
    if (Player.isReservedName(name))
        name = '';
    this.name = name || '';
    this.score = -1;
    this.moved = message();
    this.nameChanged = message();
    this.scoreChanged = message();
}

(function() {
    var reservedNames = {};
    reservedNames[TicTacToe.playerName(TicTacToe.Player1)] = true;
    reservedNames[TicTacToe.playerName(TicTacToe.Player2)] = true;

    Player.isReservedName = function(name) {
        return reservedNames[name];
    };
}());

Player.restore = function(state) {
    var ret = new Player();
    ret.restore(state);
    return ret;
};

Player.prototype.setMatch = function(match) {
    this.match = match;
};

Player.prototype.playerClass = function() {
    return TicTacToe.playerClass(this.index);
};

Player.prototype.setIndex = function(index) {
    this.index = index;
};

Player.prototype.setMark = function(mark) {
    this.mark = mark;
};

Player.prototype.markText = function() {
    return TicTacToe.markText(this.mark);
};

Player.prototype.setName = function(name) {
    if (Player.isReservedName(name))
        name = '';
    if (!name)
        name = TicTacToe.playerName(this.index);
    if (this.name !== name) {
        this.name = name;
        this.nameChanged(this);
    }
};

Player.prototype.setScore = function(score, force) {
    if (this.score !== score) {
        this.score = score;
        this.scoreChanged(this);
    }
};

Player.prototype.move = function(row, column) {
    console.log('Player.move()', this.index, row, column);
    this.moved(this, row, column);
};

Player.prototype.passMove = function() {
};

Player.prototype.isSelf = function() {
    return false;
};

Player.prototype.equals = function(other) {
    return this.index === other.index;
};

Player.prototype.dump = function() {
    return {
        index: this.index,
        mark: this.mark,
        name: this.name,
        score: this.score
    };
};

Player.prototype.restore = function(state) {
    this.index = state.index;
    this.mark = state.mark;
    this.name = state.name;
    this.score = state.score;
};

TicTacToe.Player = Player;

/*!
    \class AiPlayer
    \extends Player
*/
function AiPlayer(name, delay) {
    Player.call(this, name);
    this.delay = delay || AiPlayer.defaultMoveDelay;
}

AiPlayer.defaultMoveDelay = 300;

AiPlayer.moves = [4, 0, 2, 6, 8, 1, 3, 5, 7].map(function(index) {
    return { row: Grid.toRow(index), column: Grid.toColumn(index) };
});

AiPlayer.prototype = Object.create(Player.prototype);
AiPlayer.prototype.constructor = AiPlayer;

AiPlayer.prototype.findBestMove = function() {
    var bestMove,
        grid = this.match.grid,
        other = this.match.findPlayer(TicTacToe.otherPlayer(this));
    for (var i = 0; i < AiPlayer.moves.length; i++) {
        var move = AiPlayer.moves[i];
        if (grid.testWinState(move.row, move.column, this.mark))
            return move;
        if (grid.testWinState(move.row, move.column, other.mark))
            return move;
        if (grid.cellAt(move.row, move.column) === _ && !bestMove)
            bestMove = move;
    }
    return bestMove;
};

AiPlayer.prototype.move = function() {
    if (this.match.state === TicTacToe.GameOverState)
        Player.prototype.move.call(this);
};

AiPlayer.prototype.doMove = function() {
    var bestMove = this.findBestMove();
    if (bestMove)
        Player.prototype.move.call(this, bestMove.row, bestMove.column);
};

AiPlayer.prototype.passMove = function() {
    if (this.delay < 0) // direct call for testing purposes
        this.doMove();
    else
        setTimeout(this.doMove.bind(this), this.delay);
};

TicTacToe.AiPlayer = AiPlayer;

/*!
    \class Match
*/
function Match() {
    this.grid = new Grid();
    this.players = [];
    this.current = -1;
    this.state = TicTacToe.WaitingForPlayersState;
    this.stateChanged = message();
    this.movePassed = message();
    this.playerRemoved = message();
    this.move = this.move.bind(this);
}

Match.prototype.clear = function() {
    while (this.players.length !== 0)
        this.removePlayer(this.players[0]);
    this.grid.clear();
};

Match.prototype.setState = function(state, winner) {
    if (state !== this.state) {
        this.state = state;
        this.stateChanged(state, winner);
    }
};

Match.prototype.currentPlayer = function() {
    if (this.current >= 0 && this.current < this.players.length)
        return this.players[this.current];
};

Match.prototype.findPlayer = function(predicate) {
    return this.players.find(predicate);
};

Match.prototype.nextMove = function() {
    if (this.state !== TicTacToe.MatchRunningState)
        return;
    this.current++;
    if (this.current === this.players.length)
        this.current = 0;
    var player = this.currentPlayer();
    this.movePassed(player);
    player.passMove();
};

Match.prototype.start = function() {
    if (this.state === TicTacToe.MatchRunningState
        || this.players.length !== TicTacToe.MaxPlayers)
        return;
    this.grid.clear();
    this.setState(TicTacToe.MatchRunningState);
    this.current = -1;
    this.nextMove();
};

Match.prototype.addPlayer = function(player) {
    if (this.players.length === TicTacToe.MaxPlayers)
        return;
    player.setMatch(this);
    player.moved.subscribe(this.move);
    this.players.push(player);
    if (this.players.length === TicTacToe.MaxPlayers) {
        var player1 = this.players[0],
            player2 = this.players[1];
        player1.setMark(X);
        player1.setIndex(TicTacToe.Player1);
        player2.setMark(O);
        player2.setIndex(TicTacToe.Player2);
        this.setState(TicTacToe.PlayersReadyState);
        player1.setName(player1.name);
        player1.setScore(0);
        player2.setName(player2.name);
        player2.setScore(0);
        this.start();
    }
};

Match.prototype.removePlayer = function(player, cleared) {
    var index = this.players.indexOf(player);
    if (index !== -1) {
        var player = this.players.splice(index, 1)[0];
        player.moved.unsubscribe(this.move);
        player.setMatch(null);
        this.playerRemoved(player);
        if (this.players.length === 1) {
            this.current = 0;
            var winner = this.players[0];
            winner.setScore(winner.score + 1);
            this.setState(TicTacToe.MatchFinishedState, winner);
        }
        this.current = -1;
        this.setState(TicTacToe.WaitingForPlayersState);
    }
};

Match.prototype.move = function(player, row, column) {
    console.log('Match.move()', this.state, player.index, row, column, this.currentPlayer() === player);
    if (this.state === TicTacToe.MatchRunningState) {
        if (this.currentPlayer() === player) {
            var result = this.grid.setCell(row, column, player.mark, player.index);
            switch (result) {
            case TicTacToe.WinState:     player.setScore(player.score + 1); this.setState(TicTacToe.MatchFinishedState, player); this.current = -1; break;
            case TicTacToe.DrawState:    this.setState(TicTacToe.MatchFinishedState); this.current = -1; break;
            case TicTacToe.ProceedState: this.nextMove(); break;
            case TicTacToe.DiscardState: default: break;
            }
        }
    }
    else if (this.state === TicTacToe.MatchFinishedState) { // restarting with players order swapped
        this.players.push(this.players.shift());
        this.players[0].setMark(X);
        this.players[1].setMark(O);
        this.start();
    }
};

Match.prototype.dump = function() {
    return {
        index: this.grid.dump(),
        players: this.players.map(function(player) { return player.dump(); }),
        current: this.current,
        state: this.state
    };
};

Match.prototype.restore = function(state) {
    this.grid = Grid.restore(state.grid);
    this.players = state.players.map(function(player) { return Player.restore(player); });
    this.current = state.current;
    this.state = state.state;
};

TicTacToe.Match = Match;

/*!
    \class PlayerInfo
*/
function PlayerInfo(name, self) {
    this.name = name || '';
    this.self = self || false;
}

PlayerInfo.restore = function(state) {
    var ret = new PlayerInfo();
    ret.restore(state);
    return ret;
};

PlayerInfo.prototype.dump = function() {
    return {
        name: this.name,
        self: this.self
    };
};

PlayerInfo.prototype.restore = function(state) {
    this.name = state.name;
    this.self = state.self;
};

TicTacToe.PlayerInfo = PlayerInfo;

/*!
    \class Action
*/
function Action() {
}

(function() {
    var constructors = {};

    Action.register = function(constructor) {
        if (!constructors.hasOwnProperty(constructor.type))
            constructors[constructor.type] = constructor;
    };

    Action.create = function(name) {
        if (constructors.hasOwnProperty(name))
            return new (Function.prototype.bind.apply(constructors[name], arguments))();
    };

    Action.deserialize = function(state) {
        if (constructors.hasOwnProperty(state.type)) {
            var obj = new constructors[state.type]();
            obj.restore(state);
            return obj;
        }
    };

    Action.parse = function(text, reviver) {
        return Action.deserialize(JSON.parse(text, reviver));
    };
}());

Action.prototype.type = function() {
    return this.constructor.type;
};

Action.prototype.dump = function() {
    return {};
};

Action.prototype.serialize = function() {
    var state = this.dump();
    state.type = this.type();
    return state;
};

Action.prototype.restore = function(state) {
};

Action.prototype.stringify = function(replacer, space) {
    return JSON.stringify(this.serialize(), replacer, space);
};

TicTacToe.Action = Action;

/*!
    \class FindMatchAction
    \extends Action
*/
function FindMatchAction(playerName) {
    Action.call(this);
    this.playerName = playerName;
}

FindMatchAction.type = 'findMatch';

FindMatchAction.prototype = Object.create(Action.prototype);
FindMatchAction.prototype.constructor = FindMatchAction;

Action.register(FindMatchAction);

FindMatchAction.prototype.dump = function() {
    var state = Action.prototype.dump.call(this);
    state.playerName = this.playerName;
    return state;
};

FindMatchAction.prototype.restore = function(state) {
    this.playerName = state.playerName;
};

/*!
    \class MatchFoundAction
    \extends Action
*/
function MatchFoundAction(playersInfo) {
    Action.call(this);
    this.playersInfo = playersInfo;
}

MatchFoundAction.type = 'matchFound';

MatchFoundAction.prototype = Object.create(Action.prototype);
MatchFoundAction.prototype.constructor = MatchFoundAction;

Action.register(MatchFoundAction);

MatchFoundAction.prototype.dump = function() {
    var state = Action.prototype.dump.call(this);
    state.playersInfo = this.playersInfo.map(function(playerInfo) { return playerInfo.dump(); });
    return state;
};

MatchFoundAction.prototype.restore = function(state) {
    this.playersInfo = state.playersInfo.map(function(playerInfo) { return PlayerInfo.restore(playerInfo); });
};

/*!
    \class UpdatePlayerAction
    \extends Action
*/
function UpdatePlayerAction(playerIndex, propertyName, propertyValue) {
    Action.call(this);
    this.playerIndex = playerIndex;
    this.propertyName = propertyName;
    this.propertyValue = propertyValue;
}

UpdatePlayerAction.type = 'updatePlayer';

UpdatePlayerAction.prototype = Object.create(Action.prototype);
UpdatePlayerAction.prototype.constructor = UpdatePlayerAction;

Action.register(UpdatePlayerAction);

UpdatePlayerAction.prototype.dump = function() {
    var state = Action.prototype.dump.call(this);
    state.playerIndex = this.playerIndex;
    state.propertyName = this.propertyName;
    state.propertyValue = this.propertyValue;
    return state;
};

UpdatePlayerAction.prototype.restore = function(state) {
    this.playerIndex = state.playerIndex;
    this.propertyName = state.propertyName;
    this.propertyValue = state.propertyValue;
};

/*!
    \class MovePlayerAction
    \extends Action
*/
function MovePlayerAction(playerIndex, row, column) {
    Action.call(this);
    this.playerIndex = playerIndex;
    this.row = row;
    this.column = column;
}

MovePlayerAction.type = 'movePlayer';

MovePlayerAction.prototype = Object.create(Action.prototype);
MovePlayerAction.prototype.constructor = MovePlayerAction;

Action.register(MovePlayerAction);

MovePlayerAction.prototype.dump = function() {
    var state = Action.prototype.dump.call(this);
    state.playerIndex = this.playerIndex;
    state.row = this.row;
    state.column = this.column;
    return state;
};

MovePlayerAction.prototype.restore = function(state) {
    this.playerIndex = state.playerIndex;
    this.row = state.row;
    this.column = state.column;
};

/*!
    \class QuitAction
    \extends Action
*/
function QuitAction(playerIndex, code) {
    Action.call(this);
    this.playerIndex = playerIndex;
    this.code = code || QuitAction.Normal;
}

QuitAction.type = 'quit';

QuitAction.prototype = Object.create(Action.prototype);
QuitAction.prototype.constructor = QuitAction;

Action.register(QuitAction);

QuitAction.Normal         = 0;
QuitAction.Disconnected   = 1;
QuitAction.Desynchronized = 2;

QuitAction.prototype.dump = function() {
    var state = Action.prototype.dump.call(this);
    state.playerIndex = this.playerIndex;
    state.code = this.code;
    return state;
};

QuitAction.prototype.restore = function(state) {
    this.playerIndex = state.playerIndex;
    this.code = state.code;
};

/*!
    \class SyncAction
    \extends Action
*/
function SyncAction(match, player) {
    Action.call(this);
    if (match) {
        this.playerIndex = player.index;
        this.stateHash = SyncAction.getStateHash(match);
        var current = match.currentPlayer();
        this.current = current ? current.index : -1;
    }
}

SyncAction.getStateHash = function(match) {
    var state = match.dump();
    state.players.forEach(function(player) {
        delete player.name; // don't care about names
    });
    return md5(JSON.stringify(toPairsOrdered(state)));
};

SyncAction.type = 'sync';

SyncAction.prototype = Object.create(Action.prototype);
SyncAction.prototype.constructor = SyncAction;

Action.register(SyncAction);

SyncAction.prototype.dump = function() {
    var state = Action.prototype.dump.call(this);
    state.playerIndex = this.playerIndex;
    state.stateHash = this.stateHash;
    state.current = this.current;
    return state;
};

SyncAction.prototype.restore = function(state) {
    this.playerIndex = state.playerIndex;
    this.stateHash = state.stateHash;
    this.current = state.current;
};

/*!
    \class ProxyPlayer
    \extends Player
*/
function ProxyPlayer(gameClient, player, nameReadOnly) {
    Player.call(this, player.name);

    this.nameReadOnly = nameReadOnly || false;

    var setName = __WEBPACK_IMPORTED_MODULE_0__3rdparty_lodash_js__["a" /* default */].debounce(function(name) {
        this.nameLocked = false;
        ProxyPlayer.prototype.setName.call(this, name);
    }.bind(this), ProxyPlayer.DebounceInterval);
    this.nameLocked = false;
    this.setName = function(name) {
        this.nameLocked = true;
        setName(name);
    }.bind(this);
    this.updateName = function(name) {
        if (!this.nameLocked)
            Player.prototype.setName.call(this, name);
    }.bind(this);
    this.updateScore = Player.prototype.setScore.bind(this);

    this.handleNameChanged  = this.handleNameChanged.bind(this);
    this.handleScoreChanged = this.handleScoreChanged.bind(this);
    this.handleMoved        = this.handleMoved.bind(this);

    this.setPlayer(player);
    this.setGameClient(gameClient);
}

ProxyPlayer.DebounceInterval = 400;

ProxyPlayer.prototype = Object.create(Player.prototype);
ProxyPlayer.prototype.constructor = ProxyPlayer;

ProxyPlayer.prototype.setGameClient = function(gameClient) {
    this.gameClient = gameClient;
};

ProxyPlayer.prototype.setPlayer = function(player) {
    if (this.player != null) {
        this.player.nameChanged.unsubscribe(this.handleNameChanged);
        this.player.scoreChanged.unsubscribe(this.handleScoreChanged);
        this.player.moved.unsubscribe(this.handleMoved);
    }
    this.player = player;
    if (this.player != null) {
        this.player.nameChanged.subscribe(this.handleNameChanged);
        this.player.scoreChanged.subscribe(this.handleScoreChanged);
        this.player.moved.subscribe(this.handleMoved);
    }
};

ProxyPlayer.prototype.setMatch = function(match) {
    Player.prototype.setMatch.call(this, match);
    this.player.setMatch(match);
};

ProxyPlayer.prototype.setIndex = function(index) {
    Player.prototype.setIndex.call(this, index);
    this.player.setIndex(index);
};

ProxyPlayer.prototype.setMark = function(mark) {
    Player.prototype.setMark.call(this, mark);
    this.player.setMark(mark);
};

ProxyPlayer.prototype.setName = function(name) {
    console.log('ProxyPlayer.setName()', this.name, name, this.nameReadOnly);
    if (this.nameReadOnly && this.name) {
        if (name !== this.player.name) // discard
            this.nameChanged(this.player.name);
        return;
    }
    this.player.setName(name);
};

ProxyPlayer.prototype.handleNameChanged = function(player) {
    this.gameClient.updatePlayer(this, 'name', player.name);
};

ProxyPlayer.prototype.setScore = function(score) {
    console.log('ProxyPlayer.setScore()', score, this.player.score);
    this.player.setScore(score);
};

ProxyPlayer.prototype.handleScoreChanged = function(player) {
    this.gameClient.updatePlayer(this, 'score', player.score);
};

ProxyPlayer.prototype.updatePlayer = function(action) {
    console.log('ProxyPlayer.updatePlayer()', this.index, action.propertyName, action.propertyValue);
    switch (action.propertyName) {
    case 'name' : this.updateName(action.propertyValue) ; break;
    case 'score': this.updateScore(action.propertyValue); break;
    default: break;
    }
};

ProxyPlayer.prototype.passMove = function() {
    this.player.passMove();
};

ProxyPlayer.prototype.move = function(row, column) {
    this.player.move(row, column);
};

ProxyPlayer.prototype.handleMoved = function(player, row, column) {
    this.gameClient.movePlayer(this, row, column);
};

ProxyPlayer.prototype.movePlayer = function(action) {
    console.log('ProxyPlayer.movePlayer()', action);
    this.moved(this, action.row, action.column);
};

ProxyPlayer.prototype.isSelf = function() {
    return this.gameClient.player === this.player;
};

TicTacToe.ProxyPlayer = ProxyPlayer;

/*
    \class StatusQueue
*/
function StatusQueue(parent) {
    this.parent = parent;
    parent.showStatus = message();
    parent.hideStatus = message();
    this.queue = [];
    this.locked = false;
    this.minDisplayTime = StatusQueue.MinDisplayTime;
    this.maxDisplayTime = StatusQueue.MaxDisplayTime;
    this.unlock = this.unlock.bind(this);
}

StatusQueue.MinDisplayTime = 500;
StatusQueue.MaxDisplayTime = 3000;

StatusQueue.prototype.lock = function() {
    this.locked = true;
    setTimeout(this.unlock, this.minDisplayTime);
};

StatusQueue.prototype.unlock = function() {
    this.locked = false;
    this.pop();
};

StatusQueue.prototype.startHideTimer = function() {
    if (this.timerId == null) {
        this.timerId = setTimeout(function() {
            this.parent.hideStatus();
            this.timerId = null;
        }.bind(this), this.maxDisplayTime);
    }
};

StatusQueue.prototype.stopHideTimer = function() {
    if (this.timerId != null) {
        clearTimeout(this.timerId);
        this.timerId = null;
    }
};

StatusQueue.prototype.push = function(status) {
    this.queue.push(status);
    this.pop();
};

StatusQueue.prototype.pop = function() {
    if (this.locked)
        return;
    var status = this.queue.shift();
    if (!status)
        return;
    this.parent.showStatus(status);
    this.lock();
    this.stopHideTimer();
    if (!status.permanent)
        this.startHideTimer();
};

/*!
    \class GameClient
    \extends EventEmitter
*/
function GameClient(url) {
    EventEmitter.call(this);

    this.url = url;
    this.state = TicTacToe.NotConnectedState;

    this.matchReady = message();
    this.stateChanged = message();

    this.statusQueue = new StatusQueue(this);

    this.removePlayer = this.removePlayer.bind(this);

    this.setMatch(new Match());
    this.setPlayer(new Player());

    this.handleOpen    = this.handleOpen.bind(this);
    this.handleClose   = this.handleClose.bind(this);
    this.handleError   = this.handleError.bind(this)
    this.handleMessage = this.handleMessage.bind(this);

    this.handleMatchFound   = this.handleMatchFound.bind(this);
    this.handleUpdatePlayer = this.handleUpdatePlayer.bind(this);
    this.handleMovePlayer   = this.handleMovePlayer.bind(this);
    this.handleQuitPlayer   = this.handleQuitPlayer.bind(this);

    this.on('matchFound',   this.handleMatchFound);
    this.on('updatePlayer', this.handleUpdatePlayer);
    this.on('movePlayer',   this.handleMovePlayer);
    this.on('quit',         this.handleQuitPlayer);
}

GameClient.ReconnectInterval = 5000;

GameClient.prototype = Object.create(EventEmitter.prototype);
GameClient.prototype.constructor = GameClient;

GameClient.prototype.connect = function() {
    if (this.socket == null) {
        this.statusQueue.push({ text: 'Connecting to server...', permanent: true });
        this.socket = new websocket_defaultExport(this.url);
        this.socket.addEventListener('open',    this.handleOpen);
        this.socket.addEventListener('close',   this.handleClose);
        this.socket.addEventListener('error',   this.handleError);
        this.socket.addEventListener('message', this.handleMessage);
        this.closed = false;
    }
};

GameClient.prototype.disconnect = function() {
    if (this.socket != null) {
        this.closed = true;
        this.socket.close();
    }
};

GameClient.prototype.reconnect = function() {
    setTimeout(this.connect.bind(this), GameClient.ReconnectInterval);
};

GameClient.prototype.setState = function(stateFlag, on) {
    var state = setFlag(this.state, stateFlag, on);
    if (this.state !== state) {
        this.state = state;
        this.stateChanged(this.state);
    }
};

GameClient.prototype.testState = function(stateFlag) {
    return testFlag(this.state, stateFlag);
};

GameClient.prototype.setMode = function(mode) {
    if (this.mode !== mode) {
        switch (mode) {
        case TicTacToe.SoloMode:        this.startMatch([this.player, new Player()]); break;
        case TicTacToe.AiMode:          this.startMatch([this.player, new AiPlayer()]); break;
        case TicTacToe.MultiplayerMode: this.startMatch([new ProxyPlayer(this, this.player)]); this.findMatch(); break;
        default: break;
        }
        this.mode = mode;
    }
};

GameClient.prototype.handleOpen = function(e) {
    console.log('GameClient.handleOpen()');
    if (!this.testState(TicTacToe.ConnectedState)) {
        this.statusQueue.push({ text: 'Connection established.' });
        this.setState(TicTacToe.ConnectedState, true);
        if (this.testState(TicTacToe.GameRunningState)) {
            this.setState(TicTacToe.GameRunningState, false);
            this.setState(TicTacToe.FindingMatchState, true);
        }
        if (this.testState(TicTacToe.FindingMatchState)) {
            this.setState(TicTacToe.FindingMatchState, false);
            this.findMatch();
        }
    }
};

GameClient.prototype.handleClose = function(e) {
    if (this.testState(TicTacToe.ConnectedState)) {
        console.log('GameClient.handleClose()', e);
        this.setState(TicTacToe.ConnectedState, false);
        this.statusQueue.push({ text: 'Connection closed.' });
    }
    if (this.socket != null) {
        this.socket.removeEventListener('open',    this.handleOpen);
        this.socket.removeEventListener('close',   this.handleClose);
        this.socket.removeEventListener('error',   this.handleError);
        this.socket.removeEventListener('message', this.handleMessage);
        if (this.socket.destroy) // qt only
            this.socket.destroy();
        delete this.socket;
    }
    if (!this.closed)
        this.reconnect();
};

GameClient.prototype.handleError = function(e) {
    console.error('GameClient.handleError()', e);
};

GameClient.prototype.handleMessage = function(e) {
    try {
        var action = Action.parse(e.data);
        console.log('GameClient.handleMessage()', e.data, action);
        this.emit(action.type(), action);
    }
    catch (err) {
        console.error('GameClient.handleMessage()', err);
    }
};

GameClient.prototype.send = function(action) {
    if (this.testState(TicTacToe.ConnectedState)) {
        var data = action.stringify();
        console.log('GameClient.send()', data, action);
        this.socket.send(data);
    }
};

GameClient.prototype.setMatch = function(match) {
    if (this.match != null) {
        this.match.playerRemoved.unsubscribe(this.removePlayer);
    }
    this.match = match;
    if (this.match != null) {
        this.match.playerRemoved.subscribe(this.removePlayer);
    }
};

GameClient.prototype.startMatch = function(players) {
    this.match.clear();
    this.matchReady(this.match);
    players.forEach(function(player) {
        this.match.addPlayer(player);
    }.bind(this));
};

GameClient.prototype.setPlayer = function(player) {
    this.player = player;
};

GameClient.prototype.removePlayer = function(player) {
    console.log('GameClient.removePlayer()', player, this.player, player instanceof ProxyPlayer, player.equals(this.player));
    if (player instanceof ProxyPlayer) {
        if (player.player === this.player
            && !(this.testState(TicTacToe.GameRunningState | TicTacToe.FindingMatchState, true))) // matchFoundState
            this.quit();
        player.setPlayer();
    }
};

GameClient.prototype.findMatch = function() {
    console.log('GameClient.findMatch()', this.state);
    if (this.testState(TicTacToe.FindingMatchState)
        || this.testState(TicTacToe.GameRunningState))
        return;
    this.setState(TicTacToe.FindingMatchState, true);
    if (!this.testState(TicTacToe.ConnectedState)) {
        this.connect();
        return;
    }
    this.statusQueue.push({ text: 'Finding match...', permanent: true });
    this.send(Action.create('findMatch', this.player.name));
};

GameClient.prototype.updatePlayer = function(player, propertyName, propertyValue) {
    console.log('GameClient.updatePlayer()', player, propertyName, propertyValue);
    this.send(Action.create('updatePlayer', player.index, propertyName, propertyValue));
};

GameClient.prototype.movePlayer = function(player, row, column) {
    console.log('GameClient.movePlayer()', player, row, column);
    if (this.testState(TicTacToe.GameRunningState))
        this.send(Action.create('movePlayer', player.index, row, column));
    else
        this.findMatch();
};

GameClient.prototype.quit = function() {
    console.log('GameClient.quit()', this.state);
    this.statusQueue.push({ text: 'Quit match.' });
    this.send(Action.create('quit', this.player.index));
    this.setState(TicTacToe.GameRunningState, false);
    this.setState(TicTacToe.FindingMatchState, false);
    this.disconnect();
};

GameClient.prototype.sync = function() {
    console.log('GameClient.sync()');
    this.send(Action.create('sync', this.match, this.player));
};

GameClient.prototype.move  = function(row, column) {
    console.log('GameClient.move()', row, column);
    var player = this.match.currentPlayer() || this.player;
    player.move(row, column);
};

GameClient.prototype.handleMatchFound = function(action) {
    this.statusQueue.push({ text: 'Match found.' });
    this.setState(TicTacToe.GameRunningState, true);
    var players = action.playersInfo.map(function(playerInfo) {
        return new ProxyPlayer(this, playerInfo.self ? this.player : new Player(playerInfo.name), !playerInfo.self);
    }.bind(this));
    this.startMatch(players);
    this.setState(TicTacToe.FindingMatchState, false);
    this.sync();
};

GameClient.prototype.handleUpdatePlayer = function(action) {
    var player = this.match.findPlayer(TicTacToe.playerByIndex(action.playerIndex));
    if (player)
        player.updatePlayer(action);
};

GameClient.prototype.handleMovePlayer = function(action) {
    var player = this.match.findPlayer(TicTacToe.playerByIndex(action.playerIndex));
    if (player)
        player.movePlayer(action);
    this.sync();
};

GameClient.prototype.handleQuitPlayer = function(action) {
    var player = this.match.findPlayer(TicTacToe.playerByIndex(action.playerIndex));
    console.log('GameClient.handleQuitPlayer()', action, player);
    if (player) {
        this.statusQueue.push({ text: 'Player ' + player.name + ' left.' });
        this.match.removePlayer(player);
        this.setState(TicTacToe.GameRunningState, false);
        this.findMatch();
    }
};

TicTacToe.GameClient = GameClient;

/*!
    \class ServerClient
    \extends EventEmitter
*/
function ServerClient(server, socket) {
    console.log('ServerClient()');

    EventEmitter.call(this);

    this.server      = server;
    this.socket      = socket;
    this.match       = null;
    this.playerName  = '';
    this.playerIndex = -1;

    this.handleClose   = this.handleClose.bind(this);
    this.handleMessage = this.handleMessage.bind(this)

    socket.on('close',   this.handleClose);
    socket.on('message', this.handleMessage);

    this.on('findMatch',    this.handleFindMatch.bind(this));
    this.on('updatePlayer', this.handleUpdatePlayer.bind(this));
    this.on('movePlayer',   this.handleMove.bind(this));
    this.on('quit',         this.handleQuit.bind(this));
    this.on('sync',         this.handleSync.bind(this));
}

ServerClient.prototype = Object.create(EventEmitter.prototype);
ServerClient.prototype.constructor = ServerClient;

ServerClient.prototype.handleClose = function() {
    console.log('ServerClient.handleClose()');
    if (this.match)
        this.match.quitPlayer(this, QuitAction.Disconnected);
    this.server.removeClient(this);
    this.socket.removeListener('close',   this.handleClose);
    this.socket.removeListener('message', this.handleMessage);
    this.socket = null;
};

ServerClient.prototype.handleMessage = function(data) {
    try {
        var action = Action.parse(data);
        console.log('ServerClient.handleMessage()', data, action);
        this.emit(action.type(), action);
    }
    catch (err) {
        console.error('ServerClient.handleMessage()', err);
    }
};

ServerClient.prototype.send = function(action) {
    if (this.socket.readyState !== websocket_defaultExport.OPEN)
        return;
    var data = action.stringify();
    console.log('ServerClient.send()', data, action);
    this.socket.send(data);
};

ServerClient.prototype.handleFindMatch = function(action) {
    this.server.findMatch(this, action);
};

ServerClient.prototype.handleUpdatePlayer = function(action) {
    if (this.match)
        this.match.updatePlayer(this, action);
    else {
        if (action.propertyName === 'name')
            this.playerName = action.propertyValue;
        this.send(action);
    }
};

ServerClient.prototype.handleMove = function(action) {
    if (this.match)
        this.match.movePlayer(this, action);
};

ServerClient.prototype.handleQuit = function(action) {
    if (this.match)
        this.match.quitPlayer(this, action);
};

ServerClient.prototype.handleSync = function(action) {
    if (this.match)
        this.match.syncPlayer(this, action);
};

ServerClient.prototype.matchFound = function(playersInfo) {
    console.log('ServerClient.matchFound()', playersInfo);
    this.send(Action.create('matchFound', playersInfo));
};

ServerClient.prototype.quit = function(code) {
    console.log('ServerClient.quit()', this.playerIndex, code);
    this.send(Action.create('quit', this.playerIndex, code));
    this.playerIndex = -1;
};

/*!
    \class ServerMatch
*/
function ServerMatch(server, clients) {
    console.log('ServerMatch()');
    this.server = server;
    this.clients = clients;
    this.current = -1;
    this.syncActions = {};
    this.state = ServerMatch.InitState;
    if (this.clients.length === TicTacToe.MaxPlayers) {
        this.clients.forEach(function(client) {
            client.match = this;
            var playersInfo = this.clients.map(function(otherClient) {
                return new PlayerInfo(otherClient.playerName, client === otherClient);
            });
            client.matchFound(playersInfo);
        }.bind(this));
        this.state = ServerMatch.SyncState;
    }
}

ServerMatch.InitState = 0;
ServerMatch.SyncState = 1;
ServerMatch.MoveState = 1;

ServerMatch.prototype.updatePlayer = function(client, action) {
    this.clients.forEach(function(otherClient) {
        otherClient.send(action);
    });
};

ServerMatch.prototype.movePlayer = function(client, action) {
    console.log('ServerMatch.movePlayer()', client.playerIndex, action.playerIndex);
    if (this.state === ServerMatch.MoveState
        && (this.current === client.playerIndex || this.current === -1)) { // this.current === -1 for game over state
        this.clients.forEach(function(otherClient) {
            otherClient.send(action);
        });
        this.state = ServerMatch.SyncState;
    }
};

ServerMatch.prototype.syncPlayer = function(client, action) {
    if (this.state === ServerMatch.SyncState) {
        var index = this.clients.indexOf(client);
        if (index !== -1) {
            client.playerIndex = action.playerIndex;
            this.syncActions[index] = action;
            if (Object.keys(this.syncActions).length === this.clients.length) {
                for (var i = 1; i < this.clients.length; i++) {
                    var prevAction = this.syncActions[i - 1],
                        currAction = this.syncActions[i];
                    if (prevAction.stateHash !== currAction.stateHash) {
                        console.error('ServerMatch.syncPlayer(): state desynchronized.', prevAction, currAction);
                        this.clients.forEach(function(client) {
                            client.quit(QuitAction.Desynchronized);
                        });
                        this.close();
                        return;
                    }
                }
                console.log('ServerMatch.syncPlayer(): state synchronized.');
                this.current = action.current;
                this.syncActions = {};
                this.state = ServerMatch.MoveState;
            }
        }
    }
};

ServerMatch.prototype.quitPlayer = function(client, code) {
    var index = this.clients.indexOf(client);
    console.log('ServerMatch.quitPlayer()', index, client.playerIndex);
    if (index !== -1) {
        this.clients.splice(index, 1);
        this.clients.forEach(function(otherClient) {
            otherClient.send(Action.create('quit', client.playerIndex, code));
        });
        this.close();
        client.quit(code);
    }
};

ServerMatch.prototype.close = function() {
    console.log('ServerMatch.close()');
    this.clients.forEach(function(client) {
        client.match = null;
    });
    this.clients = [];
    this.server = null;
    this.current = -1;
    this.syncActions = {};
    this.state = ServerMatch.InitState;
};

/*!
    \class GameServer
*/
function GameServer(httpServer) {
    console.log('GameServer()');
    this.socketServer = new websocket_defaultExport.Server({ server: httpServer });
    this.socketServer.on('connection', this.handleConnection.bind(this));
    this.findingQueue = [];
}

GameServer.prototype.handleConnection = function(socket) {
    console.log('GameServer.handleConnection()');
    new ServerClient(this, socket);
};

GameServer.prototype.findMatch = function(client, action) {
    console.log('GameServer.findMatch()', action);
    client.playerName = action.playerName;
    this.findingQueue.push(client);
    if (this.findingQueue.length < TicTacToe.MaxPlayers)
        return;
    var clients = [],
        count = TicTacToe.MaxPlayers;
    while (count-- > 0)
        clients.push(this.findingQueue.shift());
    new ServerMatch(this, clients);
};

GameServer.prototype.removeClient = function(client) {
    var index = this.findingQueue.indexOf(client);
    console.log('GameServer.removeClient()', index);
    if (index !== -1)
        this.findingQueue.splice(index, 1);
};

TicTacToe.GameServer = GameServer;


/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global, module) {/* harmony export (immutable) */ __webpack_exports__["a"] = lodash;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__timers_js__ = __webpack_require__(1);
  

  console.log('defining lodash');

  var setTimeout   = __WEBPACK_IMPORTED_MODULE_0__timers_js__["a" /* default */].setTimeout,
      clearTimeout = __WEBPACK_IMPORTED_MODULE_0__timers_js__["a" /* default */].clearTimeout;

  /** Used as a safe reference for `undefined` in pre-ES5 environments. */
  var undefined;

  /** Used as the semantic version number. */
  var VERSION = '4.17.4';

  /** Error message constants. */
  var FUNC_ERROR_TEXT = 'Expected a function';

  /** Used to detect hot functions by number of calls within a span of milliseconds. */
  var HOT_COUNT = 800,
      HOT_SPAN = 16;

  /** Used as references for various `Number` constants. */
  var INFINITY = 1 / 0,
      MAX_INTEGER = 1.7976931348623157e+308,
      NAN = 0 / 0;

  /** `Object#toString` result references. */
  var asyncTag = '[object AsyncFunction]',
      funcTag = '[object Function]',
      genTag = '[object GeneratorFunction]',
      nullTag = '[object Null]',
      proxyTag = '[object Proxy]',
      symbolTag = '[object Symbol]',
      undefinedTag = '[object Undefined]';

  /**
   * Used to match `RegExp`
   * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
   */
  var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

  /** Used to match leading and trailing whitespace. */
  var reTrim = /^\s+|\s+$/g;

  /** Used to detect bad signed hexadecimal string values. */
  var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

  /** Used to detect binary string values. */
  var reIsBinary = /^0b[01]+$/i;

  /** Used to detect host constructors (Safari). */
  var reIsHostCtor = /^\[object .+?Constructor\]$/;

  /** Used to detect octal string values. */
  var reIsOctal = /^0o[0-7]+$/i;

  /** Built-in method references without a dependency on `root`. */
  var freeParseInt = parseInt;

  /** Detect free variable `global` from Node.js. */
  var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

  /** Detect free variable `self`. */
  var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

  /** Used as a reference to the global object. */
  var root = freeGlobal || freeSelf || Function('return this')();

  /** Detect free variable `exports`. */
  var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

  /** Detect free variable `module`. */
  var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

  /*--------------------------------------------------------------------------*/

  /**
   * A faster alternative to `Function#apply`, this function invokes `func`
   * with the `this` binding of `thisArg` and the arguments of `args`.
   *
   * @private
   * @param {Function} func The function to invoke.
   * @param {*} thisArg The `this` binding of `func`.
   * @param {Array} args The arguments to invoke `func` with.
   * @returns {*} Returns the result of `func`.
   */
  function apply(func, thisArg, args) {
    switch (args.length) {
      case 0: return func.call(thisArg);
      case 1: return func.call(thisArg, args[0]);
      case 2: return func.call(thisArg, args[0], args[1]);
      case 3: return func.call(thisArg, args[0], args[1], args[2]);
    }
    return func.apply(thisArg, args);
  }

  /**
   * Gets the value at `key` of `object`.
   *
   * @private
   * @param {Object} [object] The object to query.
   * @param {string} key The key of the property to get.
   * @returns {*} Returns the property value.
   */
  function getValue(object, key) {
    return object == null ? undefined : object[key];
  }

  /*--------------------------------------------------------------------------*/

  /** Used for built-in method references. */
  var funcProto = Function.prototype,
      objectProto = Object.prototype;

  /** Used to detect overreaching core-js shims. */
  var coreJsData = root['__core-js_shared__'];

  /** Used to resolve the decompiled source of functions. */
  var funcToString = funcProto.toString;

  /** Used to check objects for own properties. */
  var hasOwnProperty = objectProto.hasOwnProperty;

  /** Used to detect methods masquerading as native. */
  var maskSrcKey = (function() {
    var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
    return uid ? ('Symbol(src)_1.' + uid) : '';
  }());

  /**
   * Used to resolve the
   * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
   * of values.
   */
  var nativeObjectToString = objectProto.toString;

  /** Used to detect if a method is native. */
  var reIsNative = RegExp('^' +
    funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
    .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
  );

  /** Built-in value references. */
  var Symbol = root.Symbol,
      symToStringTag = Symbol ? Symbol.toStringTag : undefined;

  var defineProperty = (function() {
    try {
      var func = getNative(Object, 'defineProperty');
      func({}, '', {});
      return func;
    } catch (e) {}
  }());

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeMax = Math.max,
      nativeMin = Math.min,
      nativeNow = Date.now;

  /** Used to lookup unminified function names. */
  var realNames = {};

  /*------------------------------------------------------------------------*/

  /**
   * Creates a `lodash` object which wraps `value` to enable implicit method
   * chain sequences. Methods that operate on and return arrays, collections,
   * and functions can be chained together. Methods that retrieve a single value
   * or may return a primitive value will automatically end the chain sequence
   * and return the unwrapped value. Otherwise, the value must be unwrapped
   * with `_#value`.
   *
   * Explicit chain sequences, which must be unwrapped with `_#value`, may be
   * enabled using `_.chain`.
   *
   * The execution of chained methods is lazy, that is, it's deferred until
   * `_#value` is implicitly or explicitly called.
   *
   * Lazy evaluation allows several methods to support shortcut fusion.
   * Shortcut fusion is an optimization to merge iteratee calls; this avoids
   * the creation of intermediate arrays and can greatly reduce the number of
   * iteratee executions. Sections of a chain sequence qualify for shortcut
   * fusion if the section is applied to an array and iteratees accept only
   * one argument. The heuristic for whether a section qualifies for shortcut
   * fusion is subject to change.
   *
   * Chaining is supported in custom builds as long as the `_#value` method is
   * directly or indirectly included in the build.
   *
   * In addition to lodash methods, wrappers have `Array` and `String` methods.
   *
   * The wrapper `Array` methods are:
   * `concat`, `join`, `pop`, `push`, `shift`, `sort`, `splice`, and `unshift`
   *
   * The wrapper `String` methods are:
   * `replace` and `split`
   *
   * The wrapper methods that support shortcut fusion are:
   * `at`, `compact`, `drop`, `dropRight`, `dropWhile`, `filter`, `find`,
   * `findLast`, `head`, `initial`, `last`, `map`, `reject`, `reverse`, `slice`,
   * `tail`, `take`, `takeRight`, `takeRightWhile`, `takeWhile`, and `toArray`
   *
   * The chainable wrapper methods are:
   * `after`, `ary`, `assign`, `assignIn`, `assignInWith`, `assignWith`, `at`,
   * `before`, `bind`, `bindAll`, `bindKey`, `castArray`, `chain`, `chunk`,
   * `commit`, `compact`, `concat`, `conforms`, `constant`, `countBy`, `create`,
   * `curry`, `debounce`, `defaults`, `defaultsDeep`, `defer`, `delay`,
   * `difference`, `differenceBy`, `differenceWith`, `drop`, `dropRight`,
   * `dropRightWhile`, `dropWhile`, `extend`, `extendWith`, `fill`, `filter`,
   * `flatMap`, `flatMapDeep`, `flatMapDepth`, `flatten`, `flattenDeep`,
   * `flattenDepth`, `flip`, `flow`, `flowRight`, `fromPairs`, `functions`,
   * `functionsIn`, `groupBy`, `initial`, `intersection`, `intersectionBy`,
   * `intersectionWith`, `invert`, `invertBy`, `invokeMap`, `iteratee`, `keyBy`,
   * `keys`, `keysIn`, `map`, `mapKeys`, `mapValues`, `matches`, `matchesProperty`,
   * `memoize`, `merge`, `mergeWith`, `method`, `methodOf`, `mixin`, `negate`,
   * `nthArg`, `omit`, `omitBy`, `once`, `orderBy`, `over`, `overArgs`,
   * `overEvery`, `overSome`, `partial`, `partialRight`, `partition`, `pick`,
   * `pickBy`, `plant`, `property`, `propertyOf`, `pull`, `pullAll`, `pullAllBy`,
   * `pullAllWith`, `pullAt`, `push`, `range`, `rangeRight`, `rearg`, `reject`,
   * `remove`, `rest`, `reverse`, `sampleSize`, `set`, `setWith`, `shuffle`,
   * `slice`, `sort`, `sortBy`, `splice`, `spread`, `tail`, `take`, `takeRight`,
   * `takeRightWhile`, `takeWhile`, `tap`, `throttle`, `thru`, `toArray`,
   * `toPairs`, `toPairsIn`, `toPath`, `toPlainObject`, `transform`, `unary`,
   * `union`, `unionBy`, `unionWith`, `uniq`, `uniqBy`, `uniqWith`, `unset`,
   * `unshift`, `unzip`, `unzipWith`, `update`, `updateWith`, `values`,
   * `valuesIn`, `without`, `wrap`, `xor`, `xorBy`, `xorWith`, `zip`,
   * `zipObject`, `zipObjectDeep`, and `zipWith`
   *
   * The wrapper methods that are **not** chainable by default are:
   * `add`, `attempt`, `camelCase`, `capitalize`, `ceil`, `clamp`, `clone`,
   * `cloneDeep`, `cloneDeepWith`, `cloneWith`, `conformsTo`, `deburr`,
   * `defaultTo`, `divide`, `each`, `eachRight`, `endsWith`, `eq`, `escape`,
   * `escapeRegExp`, `every`, `find`, `findIndex`, `findKey`, `findLast`,
   * `findLastIndex`, `findLastKey`, `first`, `floor`, `forEach`, `forEachRight`,
   * `forIn`, `forInRight`, `forOwn`, `forOwnRight`, `get`, `gt`, `gte`, `has`,
   * `hasIn`, `head`, `identity`, `includes`, `indexOf`, `inRange`, `invoke`,
   * `isArguments`, `isArray`, `isArrayBuffer`, `isArrayLike`, `isArrayLikeObject`,
   * `isBoolean`, `isBuffer`, `isDate`, `isElement`, `isEmpty`, `isEqual`,
   * `isEqualWith`, `isError`, `isFinite`, `isFunction`, `isInteger`, `isLength`,
   * `isMap`, `isMatch`, `isMatchWith`, `isNaN`, `isNative`, `isNil`, `isNull`,
   * `isNumber`, `isObject`, `isObjectLike`, `isPlainObject`, `isRegExp`,
   * `isSafeInteger`, `isSet`, `isString`, `isUndefined`, `isTypedArray`,
   * `isWeakMap`, `isWeakSet`, `join`, `kebabCase`, `last`, `lastIndexOf`,
   * `lowerCase`, `lowerFirst`, `lt`, `lte`, `max`, `maxBy`, `mean`, `meanBy`,
   * `min`, `minBy`, `multiply`, `noConflict`, `noop`, `now`, `nth`, `pad`,
   * `padEnd`, `padStart`, `parseInt`, `pop`, `random`, `reduce`, `reduceRight`,
   * `repeat`, `result`, `round`, `runInContext`, `sample`, `shift`, `size`,
   * `snakeCase`, `some`, `sortedIndex`, `sortedIndexBy`, `sortedLastIndex`,
   * `sortedLastIndexBy`, `startCase`, `startsWith`, `stubArray`, `stubFalse`,
   * `stubObject`, `stubString`, `stubTrue`, `subtract`, `sum`, `sumBy`,
   * `template`, `times`, `toFinite`, `toInteger`, `toJSON`, `toLength`,
   * `toLower`, `toNumber`, `toSafeInteger`, `toString`, `toUpper`, `trim`,
   * `trimEnd`, `trimStart`, `truncate`, `unescape`, `uniqueId`, `upperCase`,
   * `upperFirst`, `value`, and `words`
   *
   * @name _
   * @constructor
   * @category Seq
   * @param {*} value The value to wrap in a `lodash` instance.
   * @returns {Object} Returns the new `lodash` wrapper instance.
   * @example
   *
   * function square(n) {
   *   return n * n;
   * }
   *
   * var wrapped = _([1, 2, 3]);
   *
   * // Returns an unwrapped value.
   * wrapped.reduce(_.add);
   * // => 6
   *
   * // Returns a wrapped value.
   * var squares = wrapped.map(square);
   *
   * _.isArray(squares);
   * // => false
   *
   * _.isArray(squares.value());
   * // => true
   */
  function lodash() {
    // No operation performed.
  }

  /*------------------------------------------------------------------------*/

  /**
   * The base implementation of `_.delay` and `_.defer` which accepts `args`
   * to provide to `func`.
   *
   * @private
   * @param {Function} func The function to delay.
   * @param {number} wait The number of milliseconds to delay invocation.
   * @param {Array} args The arguments to provide to `func`.
   * @returns {number|Object} Returns the timer id or timeout object.
   */
  function baseDelay(func, wait, args) {
    if (typeof func != 'function') {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    return setTimeout(function() { func.apply(undefined, args); }, wait);
  }

  /**
   * The base implementation of `getTag` without fallbacks for buggy environments.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the `toStringTag`.
   */
  function baseGetTag(value) {
    if (value == null) {
      return value === undefined ? undefinedTag : nullTag;
    }
    return (symToStringTag && symToStringTag in Object(value))
      ? getRawTag(value)
      : objectToString(value);
  }

  /**
   * The base implementation of `_.isNative` without bad shim checks.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a native function,
   *  else `false`.
   */
  function baseIsNative(value) {
    if (!isObject(value) || isMasked(value)) {
      return false;
    }
    var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
    return pattern.test(toSource(value));
  }

  /**
   * The base implementation of `_.rest` which doesn't validate or coerce arguments.
   *
   * @private
   * @param {Function} func The function to apply a rest parameter to.
   * @param {number} [start=func.length-1] The start position of the rest parameter.
   * @returns {Function} Returns the new function.
   */
  function baseRest(func, start) {
    return setToString(overRest(func, start, identity), func + '');
  }

  /**
   * The base implementation of `setToString` without support for hot loop shorting.
   *
   * @private
   * @param {Function} func The function to modify.
   * @param {Function} string The `toString` result.
   * @returns {Function} Returns `func`.
   */
  var baseSetToString = !defineProperty ? identity : function(func, string) {
    return defineProperty(func, 'toString', {
      'configurable': true,
      'enumerable': false,
      'value': constant(string),
      'writable': true
    });
  };

  /**
   * Gets the native function at `key` of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {string} key The key of the method to get.
   * @returns {*} Returns the function if it's native, else `undefined`.
   */
  function getNative(object, key) {
    var value = getValue(object, key);
    return baseIsNative(value) ? value : undefined;
  }

  /**
   * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the raw `toStringTag`.
   */
  function getRawTag(value) {
    var isOwn = hasOwnProperty.call(value, symToStringTag),
        tag = value[symToStringTag];

    try {
      value[symToStringTag] = undefined;
      var unmasked = true;
    } catch (e) {}

    var result = nativeObjectToString.call(value);
    if (unmasked) {
      if (isOwn) {
        value[symToStringTag] = tag;
      } else {
        delete value[symToStringTag];
      }
    }
    return result;
  }

  /**
   * Checks if `func` has its source masked.
   *
   * @private
   * @param {Function} func The function to check.
   * @returns {boolean} Returns `true` if `func` is masked, else `false`.
   */
  function isMasked(func) {
    return !!maskSrcKey && (maskSrcKey in func);
  }

  /**
   * Converts `value` to a string using `Object.prototype.toString`.
   *
   * @private
   * @param {*} value The value to convert.
   * @returns {string} Returns the converted string.
   */
  function objectToString(value) {
    return nativeObjectToString.call(value);
  }

  /**
   * A specialized version of `baseRest` which transforms the rest array.
   *
   * @private
   * @param {Function} func The function to apply a rest parameter to.
   * @param {number} [start=func.length-1] The start position of the rest parameter.
   * @param {Function} transform The rest array transform.
   * @returns {Function} Returns the new function.
   */
  function overRest(func, start, transform) {
    start = nativeMax(start === undefined ? (func.length - 1) : start, 0);
    return function() {
      var args = arguments,
          index = -1,
          length = nativeMax(args.length - start, 0),
          array = Array(length);

      while (++index < length) {
        array[index] = args[start + index];
      }
      index = -1;
      var otherArgs = Array(start + 1);
      while (++index < start) {
        otherArgs[index] = args[index];
      }
      otherArgs[start] = transform(array);
      return apply(func, this, otherArgs);
    };
  }

  /**
   * Sets the `toString` method of `func` to return `string`.
   *
   * @private
   * @param {Function} func The function to modify.
   * @param {Function} string The `toString` result.
   * @returns {Function} Returns `func`.
   */
  var setToString = shortOut(baseSetToString);

  /**
   * Creates a function that'll short out and invoke `identity` instead
   * of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
   * milliseconds.
   *
   * @private
   * @param {Function} func The function to restrict.
   * @returns {Function} Returns the new shortable function.
   */
  function shortOut(func) {
    var count = 0,
        lastCalled = 0;

    return function() {
      var stamp = nativeNow(),
          remaining = HOT_SPAN - (stamp - lastCalled);

      lastCalled = stamp;
      if (remaining > 0) {
        if (++count >= HOT_COUNT) {
          return arguments[0];
        }
      } else {
        count = 0;
      }
      return func.apply(undefined, arguments);
    };
  }

  /**
   * Converts `func` to its source code.
   *
   * @private
   * @param {Function} func The function to convert.
   * @returns {string} Returns the source code.
   */
  function toSource(func) {
    if (func != null) {
      try {
        return funcToString.call(func);
      } catch (e) {}
      try {
        return (func + '');
      } catch (e) {}
    }
    return '';
  }

  /*------------------------------------------------------------------------*/

  /**
   * Gets the timestamp of the number of milliseconds that have elapsed since
   * the Unix epoch (1 January 1970 00:00:00 UTC).
   *
   * @static
   * @memberOf _
   * @since 2.4.0
   * @category Date
   * @returns {number} Returns the timestamp.
   * @example
   *
   * _.defer(function(stamp) {
   *   console.log(_.now() - stamp);
   * }, _.now());
   * // => Logs the number of milliseconds it took for the deferred invocation.
   */
  var now = function() {
    return root.Date.now();
  };

  /*------------------------------------------------------------------------*/

  /**
   * The opposite of `_.before`; this method creates a function that invokes
   * `func` once it's called `n` or more times.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Function
   * @param {number} n The number of calls before `func` is invoked.
   * @param {Function} func The function to restrict.
   * @returns {Function} Returns the new restricted function.
   * @example
   *
   * var saves = ['profile', 'settings'];
   *
   * var done = _.after(saves.length, function() {
   *   console.log('done saving!');
   * });
   *
   * _.forEach(saves, function(type) {
   *   asyncSave({ 'type': type, 'complete': done });
   * });
   * // => Logs 'done saving!' after the two async saves have completed.
   */
  function after(n, func) {
    if (typeof func != 'function') {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    n = toInteger(n);
    return function() {
      if (--n < 1) {
        return func.apply(this, arguments);
      }
    };
  }

  /**
   * Creates a function that invokes `func`, with the `this` binding and arguments
   * of the created function, while it's called less than `n` times. Subsequent
   * calls to the created function return the result of the last `func` invocation.
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category Function
   * @param {number} n The number of calls at which `func` is no longer invoked.
   * @param {Function} func The function to restrict.
   * @returns {Function} Returns the new restricted function.
   * @example
   *
   * jQuery(element).on('click', _.before(5, addContactToList));
   * // => Allows adding up to 4 contacts to the list.
   */
  function before(n, func) {
    var result;
    if (typeof func != 'function') {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    n = toInteger(n);
    return function() {
      if (--n > 0) {
        result = func.apply(this, arguments);
      }
      if (n <= 1) {
        func = undefined;
      }
      return result;
    };
  }

  /**
   * Creates a debounced function that delays invoking `func` until after `wait`
   * milliseconds have elapsed since the last time the debounced function was
   * invoked. The debounced function comes with a `cancel` method to cancel
   * delayed `func` invocations and a `flush` method to immediately invoke them.
   * Provide `options` to indicate whether `func` should be invoked on the
   * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
   * with the last arguments provided to the debounced function. Subsequent
   * calls to the debounced function return the result of the last `func`
   * invocation.
   *
   * **Note:** If `leading` and `trailing` options are `true`, `func` is
   * invoked on the trailing edge of the timeout only if the debounced function
   * is invoked more than once during the `wait` timeout.
   *
   * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
   * until to the next tick, similar to `setTimeout` with a timeout of `0`.
   *
   * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
   * for details over the differences between `_.debounce` and `_.throttle`.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Function
   * @param {Function} func The function to debounce.
   * @param {number} [wait=0] The number of milliseconds to delay.
   * @param {Object} [options={}] The options object.
   * @param {boolean} [options.leading=false]
   *  Specify invoking on the leading edge of the timeout.
   * @param {number} [options.maxWait]
   *  The maximum time `func` is allowed to be delayed before it's invoked.
   * @param {boolean} [options.trailing=true]
   *  Specify invoking on the trailing edge of the timeout.
   * @returns {Function} Returns the new debounced function.
   * @example
   *
   * // Avoid costly calculations while the window size is in flux.
   * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
   *
   * // Invoke `sendMail` when clicked, debouncing subsequent calls.
   * jQuery(element).on('click', _.debounce(sendMail, 300, {
   *   'leading': true,
   *   'trailing': false
   * }));
   *
   * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
   * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
   * var source = new EventSource('/stream');
   * jQuery(source).on('message', debounced);
   *
   * // Cancel the trailing debounced invocation.
   * jQuery(window).on('popstate', debounced.cancel);
   */
  function debounce(func, wait, options) {
    var lastArgs,
        lastThis,
        maxWait,
        result,
        timerId,
        lastCallTime,
        lastInvokeTime = 0,
        leading = false,
        maxing = false,
        trailing = true;

    if (typeof func != 'function') {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    wait = toNumber(wait) || 0;
    if (isObject(options)) {
      leading = !!options.leading;
      maxing = 'maxWait' in options;
      maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
      trailing = 'trailing' in options ? !!options.trailing : trailing;
    }

    function invokeFunc(time) {
      var args = lastArgs,
          thisArg = lastThis;

      lastArgs = lastThis = undefined;
      lastInvokeTime = time;
      result = func.apply(thisArg, args);
      return result;
    }

    function leadingEdge(time) {
      // Reset any `maxWait` timer.
      lastInvokeTime = time;
      // Start the timer for the trailing edge.
      timerId = setTimeout(timerExpired, wait);
      // Invoke the leading edge.
      return leading ? invokeFunc(time) : result;
    }

    function remainingWait(time) {
      var timeSinceLastCall = time - lastCallTime,
          timeSinceLastInvoke = time - lastInvokeTime,
          result = wait - timeSinceLastCall;

      return maxing ? nativeMin(result, maxWait - timeSinceLastInvoke) : result;
    }

    function shouldInvoke(time) {
      var timeSinceLastCall = time - lastCallTime,
          timeSinceLastInvoke = time - lastInvokeTime;

      // Either this is the first call, activity has stopped and we're at the
      // trailing edge, the system time has gone backwards and we're treating
      // it as the trailing edge, or we've hit the `maxWait` limit.
      return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
        (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
    }

    function timerExpired() {
      var time = now();
      if (shouldInvoke(time)) {
        return trailingEdge(time);
      }
      // Restart the timer.
      timerId = setTimeout(timerExpired, remainingWait(time));
    }

    function trailingEdge(time) {
      timerId = undefined;

      // Only invoke if we have `lastArgs` which means `func` has been
      // debounced at least once.
      if (trailing && lastArgs) {
        return invokeFunc(time);
      }
      lastArgs = lastThis = undefined;
      return result;
    }

    function cancel() {
      if (timerId !== undefined) {
        clearTimeout(timerId);
      }
      lastInvokeTime = 0;
      lastArgs = lastCallTime = lastThis = timerId = undefined;
    }

    function flush() {
      return timerId === undefined ? result : trailingEdge(now());
    }

    function debounced() {
      var time = now(),
          isInvoking = shouldInvoke(time);

      lastArgs = arguments;
      lastThis = this;
      lastCallTime = time;

      if (isInvoking) {
        if (timerId === undefined) {
          return leadingEdge(lastCallTime);
        }
        if (maxing) {
          // Handle invocations in a tight loop.
          timerId = setTimeout(timerExpired, wait);
          return invokeFunc(lastCallTime);
        }
      }
      if (timerId === undefined) {
        timerId = setTimeout(timerExpired, wait);
      }
      return result;
    }
    debounced.cancel = cancel;
    debounced.flush = flush;
    return debounced;
  }

  /**
   * Defers invoking the `func` until the current call stack has cleared. Any
   * additional arguments are provided to `func` when it's invoked.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Function
   * @param {Function} func The function to defer.
   * @param {...*} [args] The arguments to invoke `func` with.
   * @returns {number} Returns the timer id.
   * @example
   *
   * _.defer(function(text) {
   *   console.log(text);
   * }, 'deferred');
   * // => Logs 'deferred' after one millisecond.
   */
  var defer = baseRest(function(func, args) {
    return baseDelay(func, 1, args);
  });

  /**
   * Invokes `func` after `wait` milliseconds. Any additional arguments are
   * provided to `func` when it's invoked.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Function
   * @param {Function} func The function to delay.
   * @param {number} wait The number of milliseconds to delay invocation.
   * @param {...*} [args] The arguments to invoke `func` with.
   * @returns {number} Returns the timer id.
   * @example
   *
   * _.delay(function(text) {
   *   console.log(text);
   * }, 1000, 'later');
   * // => Logs 'later' after one second.
   */
  var delay = baseRest(function(func, wait, args) {
    return baseDelay(func, toNumber(wait) || 0, args);
  });

  /**
   * Creates a function that is restricted to invoking `func` once. Repeat calls
   * to the function return the value of the first invocation. The `func` is
   * invoked with the `this` binding and arguments of the created function.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Function
   * @param {Function} func The function to restrict.
   * @returns {Function} Returns the new restricted function.
   * @example
   *
   * var initialize = _.once(createApplication);
   * initialize();
   * initialize();
   * // => `createApplication` is invoked once
   */
  function once(func) {
    return before(2, func);
  }

  /**
   * Creates a throttled function that only invokes `func` at most once per
   * every `wait` milliseconds. The throttled function comes with a `cancel`
   * method to cancel delayed `func` invocations and a `flush` method to
   * immediately invoke them. Provide `options` to indicate whether `func`
   * should be invoked on the leading and/or trailing edge of the `wait`
   * timeout. The `func` is invoked with the last arguments provided to the
   * throttled function. Subsequent calls to the throttled function return the
   * result of the last `func` invocation.
   *
   * **Note:** If `leading` and `trailing` options are `true`, `func` is
   * invoked on the trailing edge of the timeout only if the throttled function
   * is invoked more than once during the `wait` timeout.
   *
   * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
   * until to the next tick, similar to `setTimeout` with a timeout of `0`.
   *
   * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
   * for details over the differences between `_.throttle` and `_.debounce`.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Function
   * @param {Function} func The function to throttle.
   * @param {number} [wait=0] The number of milliseconds to throttle invocations to.
   * @param {Object} [options={}] The options object.
   * @param {boolean} [options.leading=true]
   *  Specify invoking on the leading edge of the timeout.
   * @param {boolean} [options.trailing=true]
   *  Specify invoking on the trailing edge of the timeout.
   * @returns {Function} Returns the new throttled function.
   * @example
   *
   * // Avoid excessively updating the position while scrolling.
   * jQuery(window).on('scroll', _.throttle(updatePosition, 100));
   *
   * // Invoke `renewToken` when the click event is fired, but not more than once every 5 minutes.
   * var throttled = _.throttle(renewToken, 300000, { 'trailing': false });
   * jQuery(element).on('click', throttled);
   *
   * // Cancel the trailing throttled invocation.
   * jQuery(window).on('popstate', throttled.cancel);
   */
  function throttle(func, wait, options) {
    var leading = true,
        trailing = true;

    if (typeof func != 'function') {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    if (isObject(options)) {
      leading = 'leading' in options ? !!options.leading : leading;
      trailing = 'trailing' in options ? !!options.trailing : trailing;
    }
    return debounce(func, wait, {
      'leading': leading,
      'maxWait': wait,
      'trailing': trailing
    });
  }

  /*------------------------------------------------------------------------*/

  /**
   * Checks if `value` is classified as a `Function` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a function, else `false`.
   * @example
   *
   * _.isFunction(_);
   * // => true
   *
   * _.isFunction(/abc/);
   * // => false
   */
  function isFunction(value) {
    if (!isObject(value)) {
      return false;
    }
    // The use of `Object#toString` avoids issues with the `typeof` operator
    // in Safari 9 which returns 'object' for typed arrays and other constructors.
    var tag = baseGetTag(value);
    return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
  }

  /**
   * Checks if `value` is the
   * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
   * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an object, else `false`.
   * @example
   *
   * _.isObject({});
   * // => true
   *
   * _.isObject([1, 2, 3]);
   * // => true
   *
   * _.isObject(_.noop);
   * // => true
   *
   * _.isObject(null);
   * // => false
   */
  function isObject(value) {
    var type = typeof value;
    return value != null && (type == 'object' || type == 'function');
  }

  /**
   * Checks if `value` is object-like. A value is object-like if it's not `null`
   * and has a `typeof` result of "object".
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
   * @example
   *
   * _.isObjectLike({});
   * // => true
   *
   * _.isObjectLike([1, 2, 3]);
   * // => true
   *
   * _.isObjectLike(_.noop);
   * // => false
   *
   * _.isObjectLike(null);
   * // => false
   */
  function isObjectLike(value) {
    return value != null && typeof value == 'object';
  }

  /**
   * Checks if `value` is classified as a `Symbol` primitive or object.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
   * @example
   *
   * _.isSymbol(Symbol.iterator);
   * // => true
   *
   * _.isSymbol('abc');
   * // => false
   */
  function isSymbol(value) {
    return typeof value == 'symbol' ||
      (isObjectLike(value) && baseGetTag(value) == symbolTag);
  }

  /**
   * Converts `value` to a finite number.
   *
   * @static
   * @memberOf _
   * @since 4.12.0
   * @category Lang
   * @param {*} value The value to convert.
   * @returns {number} Returns the converted number.
   * @example
   *
   * _.toFinite(3.2);
   * // => 3.2
   *
   * _.toFinite(Number.MIN_VALUE);
   * // => 5e-324
   *
   * _.toFinite(Infinity);
   * // => 1.7976931348623157e+308
   *
   * _.toFinite('3.2');
   * // => 3.2
   */
  function toFinite(value) {
    if (!value) {
      return value === 0 ? value : 0;
    }
    value = toNumber(value);
    if (value === INFINITY || value === -INFINITY) {
      var sign = (value < 0 ? -1 : 1);
      return sign * MAX_INTEGER;
    }
    return value === value ? value : 0;
  }

  /**
   * Converts `value` to an integer.
   *
   * **Note:** This method is loosely based on
   * [`ToInteger`](http://www.ecma-international.org/ecma-262/7.0/#sec-tointeger).
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to convert.
   * @returns {number} Returns the converted integer.
   * @example
   *
   * _.toInteger(3.2);
   * // => 3
   *
   * _.toInteger(Number.MIN_VALUE);
   * // => 0
   *
   * _.toInteger(Infinity);
   * // => 1.7976931348623157e+308
   *
   * _.toInteger('3.2');
   * // => 3
   */
  function toInteger(value) {
    var result = toFinite(value),
        remainder = result % 1;

    return result === result ? (remainder ? result - remainder : result) : 0;
  }

  /**
   * Converts `value` to a number.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to process.
   * @returns {number} Returns the number.
   * @example
   *
   * _.toNumber(3.2);
   * // => 3.2
   *
   * _.toNumber(Number.MIN_VALUE);
   * // => 5e-324
   *
   * _.toNumber(Infinity);
   * // => Infinity
   *
   * _.toNumber('3.2');
   * // => 3.2
   */
  function toNumber(value) {
    if (typeof value == 'number') {
      return value;
    }
    if (isSymbol(value)) {
      return NAN;
    }
    if (isObject(value)) {
      var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
      value = isObject(other) ? (other + '') : other;
    }
    if (typeof value != 'string') {
      return value === 0 ? value : +value;
    }
    value = value.replace(reTrim, '');
    var isBinary = reIsBinary.test(value);
    return (isBinary || reIsOctal.test(value))
      ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
      : (reIsBadHex.test(value) ? NAN : +value);
  }

  /*------------------------------------------------------------------------*/

  /**
   * Creates a function that returns `value`.
   *
   * @static
   * @memberOf _
   * @since 2.4.0
   * @category Util
   * @param {*} value The value to return from the new function.
   * @returns {Function} Returns the new constant function.
   * @example
   *
   * var objects = _.times(2, _.constant({ 'a': 1 }));
   *
   * console.log(objects);
   * // => [{ 'a': 1 }, { 'a': 1 }]
   *
   * console.log(objects[0] === objects[1]);
   * // => true
   */
  function constant(value) {
    return function() {
      return value;
    };
  }

  /**
   * This method returns the first argument it receives.
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category Util
   * @param {*} value Any value.
   * @returns {*} Returns `value`.
   * @example
   *
   * var object = { 'a': 1 };
   *
   * console.log(_.identity(object) === object);
   * // => true
   */
  function identity(value) {
    return value;
  }

  /*------------------------------------------------------------------------*/

  // Add methods that return wrapped values in chain sequences.
  lodash.after = after;
  lodash.before = before;
  lodash.constant = constant;
  lodash.debounce = debounce;
  lodash.defer = defer;
  lodash.delay = delay;
  lodash.once = once;
  lodash.throttle = throttle;

  /*------------------------------------------------------------------------*/

  // Add methods that return unwrapped values in chain sequences.
  lodash.identity = identity;
  lodash.isFunction = isFunction;
  lodash.isObject = isObject;
  lodash.isObjectLike = isObjectLike;
  lodash.isSymbol = isSymbol;
  lodash.now = now;
  lodash.toFinite = toFinite;
  lodash.toInteger = toInteger;
  lodash.toNumber = toNumber;

  /*------------------------------------------------------------------------*/

  /**
   * The semantic version number.
   *
   * @static
   * @memberOf _
   * @type {string}
   */
  lodash.VERSION = VERSION;

  /*--------------------------------------------------------------------------*/

/* WEBPACK VAR INJECTION */}.call(__webpack_exports__, __webpack_require__(4), __webpack_require__(5)(module)))

/***/ }),
/* 4 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = function(originalModule) {
	if(!originalModule.webpackPolyfill) {
		var module = Object.create(originalModule);
		// module.parent = undefined by default
		if(!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function() {
				return module.i;
			}
		});
		Object.defineProperty(module, "exports", {
			enumerable: true,
		});
		module.webpackPolyfill = 1;
	}
	return module;
};


/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_6__;

/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__lib_observer_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__lib_tictactoe_js__ = __webpack_require__(2);



var message = __WEBPACK_IMPORTED_MODULE_0__lib_observer_js__["a" /* default */].message;

/*!
    \fn parseUrl
    \see http://stackoverflow.com/a/15979390/2895579

    var result = parseUrl("http://example.com:3000");
    result.protocol; // => "http:"
    result.host;     // => "example.com:3000"
    result.hostname; // => "example.com"
    result.port;     // => "3000"
    result.pathname; // => "/pathname/"
    result.hash;     // => "#hash"
    result.search;   // => "?search=test"
    result.origin;   // => "http://example.com:3000"
*/
function parseUrl(url) {
    var a = document.createElement('a');
    a.href = url;
    return a;
}

function getWebSocketUrl(url) {
    var url = parseUrl(url);
    return (url.protocol === 'https:' ? 'wss://' : 'ws://') + url.host;
}

var svgNS = 'http://www.w3.org/2000/svg';

function createSvgElement(name, attributes) {
    var element = document.createElementNS(svgNS, name);
    for (var attrName in attributes) {
        var attrValue = attributes[attrName];
        element.setAttribute(attrName, attrValue);
    }
    return element;
}

function createMarkSvgElement(mark, width, height, strokeWidth) {
    strokeWidth = strokeWidth || 1;
    var ret = createSvgElement('svg', { 'width': width, 'height': height, 'class': 'mark' }),
        style = 'stroke-width: ' + strokeWidth,
        offset = Math.floor(strokeWidth/2),
        left  = offset,
        right = width - offset,
        top   = offset,
        bottom = height - offset;
    if (mark === __WEBPACK_IMPORTED_MODULE_1__lib_tictactoe_js__["default"].X) {
        ret.appendChild(createSvgElement('line', { 'x1': left,  'y1': top, 'x2': right, 'y2': bottom, 'style': style }));
        ret.appendChild(createSvgElement('line', { 'x1': right, 'y1': top, 'x2': left,  'y2': bottom, 'style': style }));
    }
    else if (mark === __WEBPACK_IMPORTED_MODULE_1__lib_tictactoe_js__["default"].O) {
        ret.appendChild(createSvgElement('circle', { 'cx': width/2, 'cy': height/2, 'r': width/2 - offset - 1, 'style': style }));
    }
    return ret;
}

function getElementComputedSize(element) {
    var style = getComputedStyle(element),

        paddingWidth  = parseFloat(style.paddingLeft)     + parseFloat(style.paddingRight),
        paddingHeight = parseFloat(style.paddingTop)      + parseFloat(style.paddingBottom),
        borderWidth   = parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth),
        borderHeight  = parseFloat(style.borderTopWidth)  + parseFloat(style.borderBottomWidth);

    return {
        width:  element.offsetWidth  - paddingWidth  - borderWidth,
        height: element.offsetHeight - paddingHeight - borderHeight
    };
}

function addClass(element, className) {
    var classList = element.getAttribute('class').split(' ');
    classList.push(className);
    element.setAttribute('class', classList.join(' '));
}

function setVisibility(element, visible) {
    element.style.visibility = visible ? 'visible' : 'hidden';
}

function setDisplay(element, display) {
    element.style.display = display ? display : 'none';
}

var dotsAnimation = (function(delay) {
    var elements = [],
        timerId;

    function animateDots() {
        elements.forEach(function(element) {
            var text = element.textContent;
            if (text.endsWith('...'))
                text = text.substr(0, text.length - '...'.length);
            else if (text.endsWith('..'))
                text = text.substr(0, text.length - '..'.length) + '...';
            else if (text.endsWith('.'))
                text = text.substr(0, text.length - '.'.length) + '..';
            else
                text += '.';
            element.textContent = text;
        });
    }

    function insertElement(element) {
        if (!element)
            return;
        if (elements.length === 0)
            timerId = setInterval(animateDots, delay);
        elements.push(element);
    }

    function removeElement(element) {
        if (!element)
            return;
        var index = elements.indexOf(element);
        if (index !== -1) {
            elements.splice(index, 1);
            if (elements.length === 0)
                clearInterval(timerId);
        }
    }

    return {
        acquireAll: function(parent) {
            Array.prototype.forEach.call(parent.querySelectorAll('.dots'), function(element) {
                insertElement(element);
            });
        },
        acquire: function(parent) {
            insertElement(parent.querySelector('.dots'));
        },
        releaseAll: function(parent) {
            Array.prototype.forEach.call(parent.querySelectorAll('.dots'), function(element) {
                removeElement(element);
            });
        },
        release: function(parent) {
            removeElement(parent.querySelector('.dots'));
        }
    };
}(500));

/*!
    \class GridView
*/
function GridView(props) {
    props = props || {};
    this.cellClicked = message();
    this.strokeWidth = props.strokeWidth || 4;
    this.updateCell = this.updateCell.bind(this);
    this.updateGrid = this.updateGrid.bind(this);
};

GridView.prototype.updateCell = function(row, column, mark, index) {
    var cell = this.element.rows[row].cells[column];
    if (cell) {
        var cellSize = getElementComputedSize(cell),
            markSvgElement = createMarkSvgElement(mark, cellSize.width, cellSize.height, this.strokeWidth),
            playerClass = __WEBPACK_IMPORTED_MODULE_1__lib_tictactoe_js__["default"].playerClass(index);
        if (markSvgElement.classList)
            markSvgElement.classList.add(playerClass);
        else
            addClass(markSvgElement, playerClass);
        cell.appendChild(markSvgElement);
    }
};

GridView.prototype.updateGrid = function() {
    while (this.element.rows.length > 0)
        this.element.deleteRow(-1);
    for (var i = 0; i < __WEBPACK_IMPORTED_MODULE_1__lib_tictactoe_js__["default"].Grid.Size; i++) {
        var row = this.element.insertRow();
        for (var j = 0; j < __WEBPACK_IMPORTED_MODULE_1__lib_tictactoe_js__["default"].Grid.Size; j++) {
            var cell = row.insertCell();
            cell.className = 'cell';
            if (i !== 0)
                cell.classList.add('nt');
            if (j !== 0)
                cell.classList.add('nl');
            cell.onclick = this.click.bind(this);
        }
    }
};

GridView.prototype.click = function(e) {
    switch (Object.prototype.toString.call(e.target)) {
    case '[object HTMLTableDataCellElement]': // ie/edge
    case '[object HTMLTableCellElement]':
        this.cellClicked(e.target.parentElement.rowIndex, e.target.cellIndex); break;
    default: this.cellClicked(-1, -1); break;
    }
};

GridView.prototype.setGrid = function(grid) {
    if (this.grid != null) {
        this.grid.cellChanged.unsubscribe(this.updateCell);
        this.grid.cleared.unsubscribe(this.updateGrid);
    }
    this.grid = grid;
    if (this.grid != null) {
        this.grid.cellChanged.subscribe(this.updateCell);
        this.grid.cleared.subscribe(this.updateGrid);
    }
    this.updateGrid();
};

GridView.prototype.bindElement = function(element) {
    this.element = element;
};

/*!
    \class PushButton
*/
function PushButton(props) {
    props = props || {};
    this.clicked = message();
    this.text = props.text || '';
    if (props.dataset)
        this.dataset = props.dataset;
}

PushButton.prototype.click = function() {
    this.clicked(this);
};

PushButton.prototype.bindElement = function(element) {
    this.element = element;
    element.onclick = this.click.bind(this);
    this.text = element.textContent;
};

PushButton.prototype.createElement = function() {
    var button = document.createElement('button');
    button.type = 'button';
    button.textContent = this.text;
    if (this.dataset)
        for (var key in this.dataset)
            button.dataset[key] = this.dataset[key];
//        console.log('PushButton.createElemet()', button.outerHTML);
    return button;
};

/*!
    \class ToggleButton
    \extends PushButton
*/
function ToggleButton(props) {
    props = props || {};
    PushButton.call(this, props);
    this.toggled = message();
    this.checked = props.checked || false;
}

ToggleButton.prototype = Object.create(PushButton.prototype);
ToggleButton.prototype.constructor = ToggleButton;

ToggleButton.prototype.setChecked = function(checked) {
    this.checked = checked;
    if (this.element != null) {
        if (this.checked)
            this.element.classList.add('checked');
        else
            this.element.classList.remove('checked');
    }
    this.toggled(this);
};

ToggleButton.prototype.click = function() {
    PushButton.prototype.click.call(this);
    this.toggle();
};

ToggleButton.prototype.toggle = function() {
    this.setChecked(!this.checked);
};

ToggleButton.prototype.bindElement = function(element) {
    PushButton.prototype.bindElement.call(this, element);
    this.setChecked(element.classList.contains('checked'));
};

ToggleButton.prototype.createElement = function() {
    var button = PushButton.prototype.createElement.call(this);
    button.classList.add('toggle-button');
    if (this.checked)
        button.classList.add('checked');
    return button;
};

function ButtonGroup(props) {
    props = props || {};
    this.current = null;
    this.buttons = [];
    this.currentChanged = message();
    this.toggleButton = this.toggleButton.bind(this);
}

ButtonGroup.prototype.toggleButton = function(button) {
    if (button.checked) {
        if (this.current === button)
            return;
        var previous = this.current;
        this.current = button;
        if (previous != null)
            previous.setChecked(false);
        this.currentChanged(button);
        return;
    }
    if (this.current === button)
        button.setChecked(true);
};

ButtonGroup.prototype.add = function(button) {
    this.buttons.push(button);
    button.toggled.subscribe(this.toggleButton);
    if (this.element != null) {
        var element = button.createElement();
        button.bindElement(element);
        this.element.appendChild(element);
    }
    this.toggleButton(button);
};

ButtonGroup.prototype.clear = function() {
    while (this.buttons.length !== 0) {
        var button = this.buttons.pop();
        button.toggled.unsubscribe(this.toggleButton);
    }
};

ButtonGroup.prototype.bindElement = function(element) {
    this.clear();
    this.element = element;
    [].forEach.call(element, function(element) {
        var button = new ToggleButton();
        button.bindElement(element);
        this.add(button);
    }.bind(this));
};

ButtonGroup.prototype.createElement = function() {
    var buttonGroup = document.createElement('div');
    buttonGroup.classList.add('button-group');
    this.buttons.forEach(function(button) {
        buttonGroup.appendChild(button.createElement());
    });
    return buttonGroup;
};

function MatchScoreWidget() {
    this.widgets = {};
    this.players = [];
    this.updateName = this.updateName.bind(this);
    this.updateScore = this.updateScore.bind(this);
}

MatchScoreWidget.prototype.changeName = function(e) {
    var player = this.players.find(__WEBPACK_IMPORTED_MODULE_1__lib_tictactoe_js__["default"].playerByIndex(parseInt(e.target.dataset.playerIndex))),
        name = e.target.value;
    if (player) {
        console.log('MatchScoreWidget.changeName()', name);
        player.setName(name);
    }
};

MatchScoreWidget.prototype.updateName = function(player) {
    var widget = this.widgets[player.index];
    if (widget.name.value !== player.name) {
        console.log('MatchScoreWidget.updateName()', player.name);
        widget.name.value = player.name;
    }
};

MatchScoreWidget.prototype.updateScore = function(player) {
    var widget = this.widgets[player.index];
    widget.score.textContent = player.score;
};

MatchScoreWidget.prototype.removePlayer = function(player) {
    var index = this.players.indexOf(player);
    if (index !== -1) {
        this.players.splice(index, 1);
        player.nameChanged.unsubscribe(this.updateName);
        player.scoreChanged.unsubscribe(this.updateScore);
        var widget = this.widgets[player.index];
        widget.name.value        = __WEBPACK_IMPORTED_MODULE_1__lib_tictactoe_js__["default"].playerName(player.index);
        widget.name.readOnly     = false;
        widget.score.textContent = '0';
        setVisibility(widget.self, false);
    }
};

MatchScoreWidget.prototype.setPlayers = function(players) {
    this.players = players.slice();
    this.players.forEach(function(player) {
        var widget = this.widgets[player.index];
//        if (player.name)
//            widget.name.value    = player.name;
        widget.name.readOnly     = player.nameReadOnly;
//        widget.score.textContent = player.score;
        setVisibility(widget.self, player.isSelf());
        player.nameChanged.subscribe(this.updateName);
        player.scoreChanged.subscribe(this.updateScore);
    }.bind(this));
};

MatchScoreWidget.prototype.showSelfMarkTip = function(e) {
    var isVisible = window.getComputedStyle(e.target).visibility === 'visible';
    if (isVisible) {
        this.selfMarkTip.classList.remove('hidden');
        this.selfMarkTip.classList.add('visible');
    }
    else {
        this.selfMarkTip.classList.remove('visible');
        this.selfMarkTip.classList.add('hidden');
    }
};

MatchScoreWidget.prototype.hideSelfMarkTip = function(e) {
    this.selfMarkTip.classList.remove('visible');
    this.selfMarkTip.classList.add('hidden');
};

MatchScoreWidget.prototype.bindElement = function(element) {
    this.element = element;
    for (var playerIndex = __WEBPACK_IMPORTED_MODULE_1__lib_tictactoe_js__["default"].Player1; playerIndex < __WEBPACK_IMPORTED_MODULE_1__lib_tictactoe_js__["default"].MaxPlayers; playerIndex++) {
        var name  = element.querySelector('.{0}.player-name-field'.format(__WEBPACK_IMPORTED_MODULE_1__lib_tictactoe_js__["default"].playerClass(playerIndex))),
            self  = element.querySelector('.{0}.self-mark'        .format(__WEBPACK_IMPORTED_MODULE_1__lib_tictactoe_js__["default"].playerClass(playerIndex))),
            score = element.querySelector('.{0}.score-output'     .format(__WEBPACK_IMPORTED_MODULE_1__lib_tictactoe_js__["default"].playerClass(playerIndex)));
        name.dataset.playerIndex = playerIndex;
        name.onchange = name.onpaste = name.onkeyup = this.changeName.bind(this);
        self.onmouseover = this.showSelfMarkTip.bind(this);
        self.onmouseout  = this.hideSelfMarkTip.bind(this);
        setVisibility(self, false);
        this.widgets[playerIndex] = {
            name : name,
            self : self,
            score: score
        };
    }
    this.selfMarkTip = element.querySelector('.self-mark-tip');
};

function MatchStatusWidget() {
    this.statusBlocks = {};
    this.updatePlayerName = this.updatePlayerName.bind(this);
};

MatchStatusWidget.prototype.toggleBlock = function(current, callback) {
    if (this.current != null) {
        setDisplay(this.statusBlocks[this.current]);
        dotsAnimation.release(this.statusBlocks[this.current]);
    }
    this.current = current;
    if (this.current != null) {
        var block = this.statusBlocks[this.current];
        if (typeof callback === 'function')
            callback(block);
        setDisplay(block, 'block');
        dotsAnimation.acquire(block);
    }
};

MatchStatusWidget.prototype.changeBlocksPlayer = function(block) {
    var otherPlayer = this.player.match.findPlayer(__WEBPACK_IMPORTED_MODULE_1__lib_tictactoe_js__["default"].otherPlayer(this.player));
    if (otherPlayer != null
        && block.classList.contains(otherPlayer.playerClass()))
        block.classList.remove(otherPlayer.playerClass());
    if (!block.classList.contains(this.player.playerClass()))
        block.classList.add(this.player.playerClass());
};

MatchStatusWidget.prototype.updatePlayerName = function(player) {
    if (this.winnerNameOutput.dataset.playerIndex == player.index)
        this.winnerNameOutput.textContent = player.name;
    if (this.currentPlayerNameOutput.dataset.playerIndex == player.index)
        this.currentPlayerNameOutput.textContent = player.name;
};

MatchStatusWidget.prototype.setPlayer = function(player) {
    if (this.player != null)
        this.player.nameChanged.unsubscribe(this.updatePlayerName);
    this.player = player;
    if (this.player != null)
        this.player.nameChanged.subscribe(this.updatePlayerName);
};

MatchStatusWidget.prototype.setWinner = function(winner) {
    this.winnerNameOutput.dataset.playerIndex = winner.index;
    this.winnerNameOutput.textContent = winner.name;
    this.setPlayer(winner);
    this.toggleBlock('win', this.changeBlocksPlayer.bind(this));
};

MatchStatusWidget.prototype.setCurrentPlayer = function(currentPlayer) {
    this.currentPlayerNameOutput.dataset.playerIndex = currentPlayer.index;
    this.currentPlayerNameOutput.textContent = currentPlayer.name;
    this.currentPlayerMarkOutput.textContent = currentPlayer.markText();
    this.setPlayer(currentPlayer);
    this.toggleBlock('move', this.changeBlocksPlayer.bind(this));
};

MatchStatusWidget.prototype.setDraw = function() {
    this.toggleBlock('draw');
};

MatchStatusWidget.prototype.setWait = function() {
//    this.toggleBlock();
    this.toggleBlock('wait');
};

MatchStatusWidget.prototype.bindElement = function(element) {
    this.element = element;
    Array.prototype.forEach.call(element.querySelectorAll('.status'), function(statusBlock) {
        var status = statusBlock.dataset.status;
        this.statusBlocks[status] = statusBlock;
        setDisplay(statusBlock);
    }.bind(this));
    this.setWait();
    this.currentPlayerNameOutput = element.querySelector('.current-player.player-name-output');
    this.currentPlayerMarkOutput = element.querySelector('.current-player.player-mark-output');
    this.winnerNameOutput = element.querySelector('.winner.player-name-output');
};

function GameClientWidget(gameClient) {
    this.gameClient = gameClient;
    gameClient.showStatus.subscribe(this.showStatus.bind(this));
    gameClient.hideStatus.subscribe(this.hideStatus.bind(this));
}

GameClientWidget.prototype.showStatus = function(status) {
    if (status.text.endsWith('...'))
        status.text = status.text.substr(0, status.text.length - '...'.length) + '<span class="dots"></span>';
    dotsAnimation.release(this.statusBlock);
    this.statusBlock.innerHTML = status.text;
    dotsAnimation.acquire(this.statusBlock);
    this.statusBlock.classList.remove('fadeout');
    setVisibility(this.statusBlock, true);
};

GameClientWidget.prototype.hideStatus = function() {
    this.statusBlock.classList.add('fadeout');
};

GameClientWidget.prototype.changeMode = function(current) {
    var mode = parseInt(current.element.dataset.mode);
    console.log('Controller.changePlayMode()', mode);
    this.gameClient.setMode(mode);
};

GameClientWidget.prototype.bindElement = function(element) {
    this.element = element;
    var buttonGroup = new ButtonGroup();
    buttonGroup.currentChanged.subscribe(this.changeMode.bind(this));
    buttonGroup.bindElement(element.querySelector('.button-group'));
    __WEBPACK_IMPORTED_MODULE_1__lib_tictactoe_js__["default"].availableGameModes().forEach(function(mode, index) {
        var button = new ToggleButton({
            text: mode.text,
            checked: index === 0,
            dataset: {
                mode: mode.value
            }
        });
        buttonGroup.add(button);
    });
    this.statusBlock = element.querySelector('.status');
    setVisibility(this.statusBlock, false);
};

function Controller() {
    this.gameClient = new __WEBPACK_IMPORTED_MODULE_1__lib_tictactoe_js__["default"].GameClient(getWebSocketUrl(document.URL));
    this.gameClient.matchReady.subscribe(this.setMatch.bind(this));
    this.updateCurrentPlayer = this.updateCurrentPlayer.bind(this);
    this.removePlayer = this.removePlayer.bind(this);
    this.updateMatchState = this.updateMatchState.bind(this);
}

Controller.prototype.move = function(row, column) {
    this.gameClient.move(row, column);
};

Controller.prototype.updateMatchState = function(state, winner) {
    console.log('Controller.updateMatchState', state, winner);
    if (state === __WEBPACK_IMPORTED_MODULE_1__lib_tictactoe_js__["default"].PlayersReadyState) {
        this.scoreWidget.setPlayers(this.match.players);
    }
    else if (state === __WEBPACK_IMPORTED_MODULE_1__lib_tictactoe_js__["default"].MatchFinishedState) {
        if (winner != null)
            this.statusWidget.setWinner(winner);
        else
            this.statusWidget.setDraw();
    }
    else if (state === __WEBPACK_IMPORTED_MODULE_1__lib_tictactoe_js__["default"].WaitingForPlayersState) {
        this.statusWidget.setWait();
    }
};

Controller.prototype.updateCurrentPlayer = function(player) {
    this.statusWidget.setCurrentPlayer(player);
};

Controller.prototype.removePlayer = function(player) {
    this.scoreWidget.removePlayer(player);
};

Controller.prototype.setMatch = function(match) {
    if (this.match != null) {
        this.match.movePassed.unsubscribe(this.updateCurrentPlayer);
        this.match.stateChanged.unsubscribe(this.updateMatchState);
        this.match.playerRemoved.unsubscribe(this.removePlayer);
    }
    this.match = match;
    if (this.match != null) {
        this.match.movePassed.subscribe(this.updateCurrentPlayer);
        this.match.stateChanged.subscribe(this.updateMatchState);
        this.match.playerRemoved.subscribe(this.removePlayer);
        if (this.gridView != null)
            this.gridView.setGrid(this.match.grid);
    }
};

Controller.prototype.bindElement = function(element) {
    this.element = element;

    this.gridView = new GridView();
    this.gridView.bindElement(element.querySelector('.grid-view'));
    this.gridView.cellClicked.subscribe(this.move.bind(this));

    this.scoreWidget = new MatchScoreWidget();
    this.scoreWidget.bindElement(element.querySelector('.match-score-widget'));

    this.statusWidget = new MatchStatusWidget();
    this.statusWidget.bindElement(element.querySelector('.match-status-widget'));

    this.gameClientWidget = new GameClientWidget(this.gameClient);
    this.gameClientWidget.bindElement(element.querySelector('.game-client-widget'));
};

var controller = new Controller();
controller.bindElement(document);


/***/ })
/******/ ])["default"];
});