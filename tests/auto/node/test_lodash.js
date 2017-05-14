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
/*bootstrap.*/}(this, function(_) {

'use strict';

console.log('defining Test_Lodash');

var debounce = _.debounce;

var suite = {};

suite.test_debounce = function(test) {
    var clickCount = 0;
    function click() {
        clickCount++;
        test.strictEqual(clickCount, 1);
        test.done();
    }

    var debouncedClick = debounce(click);

    debouncedClick();
    debouncedClick();
    debouncedClick();
    test.strictEqual(clickCount, 0);
};

suite.test_debounceCancel = function(test) {
    var clickCount = 0;
    function click() {
        clickCount++;
        test.strictEqual(clickCount, 1);
        test.done();
    }

    var debouncedClick = debounce(click, 100);

    debouncedClick();
    debouncedClick();
    debouncedClick();
    //debouncedClick.cancel();
    test.strictEqual(clickCount, 0);
};

return suite;

}, 'Test_Lodash', ['../../../lib/3rdparty/lodash']));
