console.log('defining Timers');

export default (function() {
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
