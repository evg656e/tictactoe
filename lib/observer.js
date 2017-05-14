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
            throw TypeError('listener must be a function');
        if (!listeners)
            listeners = listener;
        else if (typeof listeners === 'function')
            listeners = [listeners, listener];
        else
            listeners.push(listener);
    };

    message.unsubscribe = function(listener) {
        if (typeof listener !== 'function')
            throw TypeError('listener must be a function');
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
            throw TypeError('listener must be a function');
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
};

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
        throw TypeError('listener must be a function');

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
        throw TypeError('listener must be a function');

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
        throw TypeError('listener must be a function');

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

return Observer;

}, 'Observer'));
