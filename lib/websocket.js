import Observer from './observer.js';

console.log('defining WebSocket');

// WebSocket adapter

export default (function() {
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
        }(Observer.EventEmitter));
    }

    if (typeof exports === 'object' && typeof module === 'object')
        return require('ws'); // requires https://www.npmjs.com/package/ws

    return WebSocket; // fallback
}());
