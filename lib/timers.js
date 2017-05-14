(function(root, fac, id, deps) {
    if (typeof bootstrap === 'function') { // browser dynamic bootstrapping
        bootstrap(root, fac, id, deps);
        return;
    }
    deps = (deps || []).map(function(dep) {
        return {
            id: dep.substring(dep.lastIndexOf('/') + 1),
            path: dep.substring(0, dep.lastIndexOf('/') + 1),
            filePath: dep.substring(0, dep.lastIndexOf('/') + 1) + dep.substring(dep.lastIndexOf('/') + 1).toLowerCase() + '.js'
        };
    });
    if (typeof module === 'object' && module.exports) // node.js bootstrapping
        module.exports = fac.apply(root, deps.map(function(dep) { return require(dep.filePath); }));
    else if (typeof Qt === 'object' && Qt.include) // qml bootstrapping
        root[id] = fac.apply(root, deps.map(function(dep) {
            if (!root[dep.id])
                Qt.include(dep.filePath);
            return root[dep.id];
        }));
    else // browser static bootstrapping
        root[id] = fac.apply(root, deps.map(function(dep) { return root[dep.id]; }));
/*bootstrap.*/}(this, function() {

'use strict';

console.log('defining Timers');

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

}, 'Timers'));
