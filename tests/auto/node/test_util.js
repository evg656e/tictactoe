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
/*bootstrap.*/}(this, function(Util) {

'use strict';

console.log('defining Test_Util');

var md5            = Util.md5,
    toPairsOrdered = Util.toPairsOrdered,
    testFlag       = Util.testFlag,
    setFlag        = Util.setFlag;

var suite = {};

suite.test_md5 = function(test) {
    var testData = [
        { input: '', result: 'd41d8cd98f00b204e9800998ecf8427e' },
        { input: 'hello', result: '5d41402abc4b2a76b9719d911017c592' },
        { input: 'проверка', result: 'c12f955c059aa2bc61bb0b66eb01cfd1' }, // should it be 'c12f955c059aa2bc61bb0b66eb01cfd1' or '2f2dc227432698c5d9c40f972daf67d9'?
        { input: 'The quick brown fox jumps over the lazy dog.', result: 'e4d909c290d0fb1ca068ffaddf22cbd0' }
    ];

    test.expect(testData.length);

    testData.forEach(function(data) {
        test.strictEqual(md5(data.input), data.result);
    });

    test.done();
};

suite.test_toPairsOrdered = function(test) {
    var obj1 = {"current":0,"index":{"cells":[0,0,0,0,0,0,0,0,0]},"players":[{"index":0,"mark":1,"score":-1},{"index":1,"mark":2,"score":-1}],"state":2},
        obj2 = {"index":{"cells":[0,0,0,0,0,0,0,0,0]},"players":[{"index":0,"score":-1,"mark":1},{"index":1,"mark":2,"score":-1}],"current":0,"state":2};

    test.strictEqual(JSON.stringify(toPairsOrdered(obj1)), JSON.stringify(toPairsOrdered(obj2)));

    test.done();
};

var NoModifier      = 0x00,
    ShiftModifier   = 0x02,
    ControlModifier = 0x04,
    AltModifier     = 0x08,
    MetaModifier    = 0x10,
    KeypadModifier  = 0x20;

suite.test_testFlag = function(test) {
    var flags1 = NoModifier,
        flags2 = ControlModifier | ShiftModifier;

    test.ok(testFlag(flags1, NoModifier));
    test.ok(!testFlag(flags1, ShiftModifier));
    test.ok(testFlag(flags2, ShiftModifier));
    test.ok(testFlag(flags2, ControlModifier));
    test.ok(!testFlag(flags2, NoModifier));
    test.ok(!testFlag(flags2, AltModifier));

    test.done();
};

suite.test_setFlag = function(test) {
    var flags = NoModifier;

    test.ok(flags === NoModifier);

    flags = setFlag(flags, ShiftModifier, true);
    test.ok(testFlag(flags, ShiftModifier));

    flags = setFlag(flags, ShiftModifier, false);
    test.ok(!testFlag(flags, ShiftModifier));

    flags = setFlag(flags, ShiftModifier | ControlModifier, true);
    test.ok(testFlag(flags, ShiftModifier));
    test.ok(testFlag(flags, ControlModifier));
    test.ok(testFlag(flags, ShiftModifier | ControlModifier));

    flags = setFlag(flags, ShiftModifier | ControlModifier, false);
    test.ok(!testFlag(flags, ShiftModifier));
    test.ok(!testFlag(flags, ControlModifier));
    test.ok(!testFlag(flags, ShiftModifier | ControlModifier));

    test.done();
};

/*
suite.test_flags = function(test) {
    var flags1 = new Flags(),
        flags2 = new Flags(ShiftModifier | ControlModifier),
        flagsState1 = flags1.dump(),
        flagsState2 = flags2.dump();

    test.ok(flags1.value === NoModifier);
    test.ok(flags1.equals(NoModifier));
    test.ok(flags1.equals(new Flags()));
    test.ok(flags1.equals(flags1));

    flags1.set(ShiftModifier, true);
    test.ok(!flags1.test(ShiftModifier));
    flags1 = flags1.set(ShiftModifier, true);
    test.ok(flags1.test(ShiftModifier));
    flags1 = flags1.set(ShiftModifier, false);
    test.ok(!flags1.test(ShiftModifier));

    flags1 = flags1.set(flags2, true);
    test.ok(flags1.test(ShiftModifier | ControlModifier));
    test.ok(flags1.test(flags2));

    flags1 = flags1.set(AltModifier, true);
    test.ok(flags1.test(ShiftModifier | ControlModifier | AltModifier));
    flags1 = flags1.and(flags2.not());
    test.ok(flags1.test(AltModifier));
    test.ok(!flags1.test(ShiftModifier | ControlModifier));

    test.ok(flags2.value === ShiftModifier | ControlModifier);
    test.ok(flags2.equals(ShiftModifier | ControlModifier));
    test.ok(flags2.equals(new Flags(ShiftModifier | ControlModifier)));
    test.ok(flags2.equals(flags2));

    flags1 = Flags.restore(flagsState1);
    flags2 = Flags.restore(flagsState2);

    test.ok(!flags1.equals(flags2));
    test.ok(!flags2.equals(flags1));

    test.done();
};
*/

return suite;

}, 'Test_Util', ['../../../lib/Util']));
