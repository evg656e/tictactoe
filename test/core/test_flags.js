import assert from 'assert';
import { setFlag, testFlag } from '../../lib/core/flags.js';

const NoModifier    = 0x00,
    ShiftModifier   = 0x02,
    ControlModifier = 0x04,
    AltModifier     = 0x08,
    MetaModifier    = 0x10,
    KeypadModifier  = 0x20;

describe('core.flags', function () {
    it('testFlag', function () {
        let flags1 = NoModifier,
            flags2 = ControlModifier | ShiftModifier;

        assert.ok(testFlag(flags1, NoModifier));
        assert.ok(!testFlag(flags1, ShiftModifier));
        assert.ok(testFlag(flags2, ShiftModifier));
        assert.ok(testFlag(flags2, ControlModifier));
        assert.ok(!testFlag(flags2, NoModifier));
        assert.ok(!testFlag(flags2, AltModifier));
    });

    it('setFlag', function () {
        let flags = NoModifier;

        assert.ok(flags === NoModifier);

        flags = setFlag(flags, ShiftModifier, true);
        assert.ok(testFlag(flags, ShiftModifier));

        flags = setFlag(flags, ShiftModifier, false);
        assert.ok(!testFlag(flags, ShiftModifier));

        flags = setFlag(flags, ShiftModifier | ControlModifier, true);
        assert.ok(testFlag(flags, ShiftModifier));
        assert.ok(testFlag(flags, ControlModifier));
        assert.ok(testFlag(flags, ShiftModifier | ControlModifier));

        flags = setFlag(flags, ShiftModifier | ControlModifier, false);
        assert.ok(!testFlag(flags, ShiftModifier));
        assert.ok(!testFlag(flags, ControlModifier));
        assert.ok(!testFlag(flags, ShiftModifier | ControlModifier));
    });
});
