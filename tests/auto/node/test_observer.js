(function loader(root, fac, id, deps) {
    if (typeof bootstrap === 'function') { // browser dynamic loader
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
    if (typeof module === 'object' && module.exports) // node.js loader
        module.exports = fac.apply(root, deps.map(function(dep) { return require(dep.filePath); }));
    else if (typeof Qt === 'object' && Qt.include) // qml loader
        root[id] = fac.apply(root, deps.map(function(dep) {
            if (!root[dep.id])
                Qt.include(dep.filePath);
            return root[dep.id];
        }));
    else // browser static loader
        root[id] = fac.apply(root, deps.map(function(dep) { return root[dep.id]; }));
/*loader.*/}(this, function(Observer) {

'use strict';

console.log('defining Test_Observer');

var message      = Observer.message,
    EventEmitter = Observer.EventEmitter;

var suite = {};
/*
suite.test_directConnection = function(test) {
    var phrases = ['Hello', 'Hola'];
    var person = {
        name: 'John'
    };

    function greet(phrase, index) {
        console.log('test_directConnection():', phrase + ' ' + this.name);
        test.equal(this.name, person.name);
        test.equal(phrase, phrases[index]);
    }

    var directConnection = connection('direct', greet, person);
    directConnection.emit(phrases[0], 0);
    directConnection.emit(phrases[1], 1);

    test.done();
};

suite.test_queuedConnection = function(test) {
    var phrases = ['Hello', 'Hola'];
    var person = {
        name: 'John'
    };
    var delay = 100;

    var numCalls = 2;

    function greet(phrase, index) {
        console.log('test_queuedConnection():', phrase + ' ' + this.name);
        test.equal(this.name, person.name);
        test.equal(phrase, phrases[index]);
        numCalls--;
        if (numCalls === 0) {
            console.log('test_queuedConnection():', 'done.');
            test.done();
        }
    }

    var queuedConnection = connection('queued', greet, person, delay);
    console.log('test_queuedConnection():', 'begin');
    queuedConnection.emit(phrases[0], 0);
    queuedConnection.emit(phrases[1], 1);
};
*/

suite.test_message = function(test) {
    var clickCount = 0;
    function clicked() {
        clickCount++;
//        console.log('clicked()', clickCount);
    }

    var initialized = false;
    function init() {
        initialized = !initialized;
//        console.log('init()', initialized);
    }

    var widget = {
        clickCount: 0,
        clicked: function() {
            this.clickCount++;
//            console.log('widget.clicked()', this.clickCount);
        }
    };

    var widgetClicked = widget.clicked.bind(widget);

    var click = message();

    test.strictEqual(click.listenerCount(), 0);

    click.once(init);
    click.subscribe(clicked);
    click.subscribe(widgetClicked);

    test.strictEqual(click.listenerCount(), 3);

    click();

    test.strictEqual(click.listenerCount(), 2);

    test.ok(initialized);
    test.strictEqual(clickCount, 1);
    test.strictEqual(widget.clickCount, 1);
    click();

    test.ok(initialized);
    test.strictEqual(clickCount, 2);
    test.strictEqual(widget.clickCount, 2);

    click.unsubscribe(clicked);

    test.strictEqual(click.listenerCount(), 1);

    click();

    test.strictEqual(clickCount, 2);
    test.strictEqual(widget.clickCount, 3);

    click.unsubscribe(widgetClicked);

    test.strictEqual(click.listenerCount(), 0);

    click();

    test.strictEqual(clickCount, 2);
    test.strictEqual(widget.clickCount, 3);

    click.subscribe(clicked);

    test.strictEqual(click.listenerCount(), 1);

    click();

    test.strictEqual(clickCount, 3);

    click.unsubscribeAll();

    test.strictEqual(click.listenerCount(), 0);

    click();

    test.strictEqual(clickCount, 3);

    test.done();
};

suite.test_eventEmitter = function(test) {
    var events = new EventEmitter();

    var clickCount = 0;
    function clicked() {
        clickCount++;
    }

    var widget = {
        clickCount: 0,
        clicked: function() {
            this.clickCount++;
        }
    };

    var widgetClicked = widget.clicked.bind(widget);

    var initialized = false;
    function init() {
        initialized = !initialized;
    }

    var newListenerCount    = 0,
        removeListenerCount = 0;

    function newListener() {
        newListenerCount++;
    }

    function removeListener() {
        removeListenerCount++;
    }

    events.on('newListener', newListener);
    events.on('removeListener', removeListener);
    events.once('click', init);
    events.on('click', clicked);
    events.on('click', widgetClicked);

    test.strictEqual(newListenerCount, 4);
    test.strictEqual(events.listenerCount('click'), 3);

    events.emit('click');

    test.strictEqual(removeListenerCount, 1);
    test.ok(initialized);
    test.strictEqual(clickCount, 1);
    test.strictEqual(widget.clickCount, 1);
    test.strictEqual(events.listenerCount('click'), 2);

    events.emit('click');
    test.ok(initialized);
    test.strictEqual(clickCount, 2);
    test.strictEqual(widget.clickCount, 2);
    test.strictEqual(events.listenerCount('click'), 2);

    events.removeListener('click', clicked);
    events.removeListener('click', widgetClicked); // should work

    test.ok(!('click' in events.events));

    test.strictEqual(events.listenerCount('click'), 0);
    test.strictEqual(removeListenerCount, 3);

    events.emit('click');

    test.strictEqual(clickCount, 2);
    test.strictEqual(widget.clickCount, 2);

    events.removeListener('newListener', newListener);
    events.removeListener('removeListener', removeListener);

    test.strictEqual(removeListenerCount, 4);

    test.strictEqual(Object.keys(events.events).length, 0);

    events.on('foo', function bar() {
    });
    events.on('click', clicked);
    events.on('click', widgetClicked);

    test.strictEqual(events.listenerCount('foo'), 1);
    test.strictEqual(events.listenerCount('click'), 2);

    events.removeAllListeners('click');

    test.strictEqual(events.listenerCount('click'), 0);
    test.ok(!('click' in events.events));

    events.removeAllListeners();

    test.strictEqual(events.listenerCount('foo'), 0);
    test.ok(!events.events);

    test.done();
};

if (typeof module !== 'undefined' && module.exports) {
    (function(suite, EventEmitter) {
        suite.test_events = function(test) {
            var events = new EventEmitter();

            var clickCount = 0;
            function clicked() {
                clickCount++;
            }

            var widget = {
                clickCount: 0,
                clicked: function() {
                    this.clickCount++;
                }
            };

            var widgetClicked = widget.clicked.bind(widget);

            var initialized = false;
            function init() {
                initialized = !initialized;
            }

            var newListenerCount    = 0,
                removeListenerCount = 0;

            function newListener() {
                newListenerCount++;
            }

            function removeListener() {
                removeListenerCount++;
            }

            events.on('newListener', newListener);
            events.on('removeListener', removeListener);
            events.once('click', init);
            events.on('click', clicked);
            events.on('click', widgetClicked);

            test.strictEqual(newListenerCount, 4);
            test.strictEqual(events.listenerCount('click'), 3);

            events.emit('click');

            test.strictEqual(removeListenerCount, 1);
            test.ok(initialized);
            test.strictEqual(clickCount, 1);
            test.strictEqual(widget.clickCount, 1);
            test.strictEqual(events.listenerCount('click'), 2);

            events.emit('click');
            test.ok(initialized);
            test.strictEqual(clickCount, 2);
            test.strictEqual(widget.clickCount, 2);
            test.strictEqual(events.listenerCount('click'), 2);

            events.removeListener('click', clicked);
            events.removeListener('click', widgetClicked); // should work

//            test.ok(!('click' in events.events));

            test.strictEqual(events.listenerCount('click'), 0);
            test.strictEqual(removeListenerCount, 3);

            events.emit('click');

            test.strictEqual(clickCount, 2);
            test.strictEqual(widget.clickCount, 2);

            events.removeListener('newListener', newListener);
            events.removeListener('removeListener', removeListener);

            test.strictEqual(removeListenerCount, 4);

//            test.strictEqual(Object.keys(events.events).length, 0);

            events.on('foo', function bar() {
            });
            events.on('click', clicked);
            events.on('click', widgetClicked);

            test.strictEqual(events.listenerCount('foo'), 1);
            test.strictEqual(events.listenerCount('click'), 2);

            events.removeAllListeners('click');

            test.strictEqual(events.listenerCount('click'), 0);
//            test.ok(!('click' in events.events));

            events.removeAllListeners();

            test.strictEqual(events.listenerCount('foo'), 0);
//            test.ok(!events.events);

            test.done();
        }
    }(suite, require('events')));
}

return suite;

}, 'Test_Observer', ['../../../lib/Observer']));
