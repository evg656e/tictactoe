import assert from 'assert';
import { toPairsOrdered } from '../../lib/tictactoe/actions/SyncAction';

describe('tictactoe.actions.SyncAction', function () {
    it('toPairsOrdered', function () {
        const obj1 = { "current": 0, "index": { "cells": [0, 0, 0, 0, 0, 0, 0, 0, 0] }, "players": [{ "index": 0, "mark": 1, "score": -1 }, { "index": 1, "mark": 2, "score": -1 }], "state": 2 };
        const obj2 = { "index": { "cells": [0, 0, 0, 0, 0, 0, 0, 0, 0] }, "players": [{ "index": 0, "score": -1, "mark": 1 }, { "index": 1, "mark": 2, "score": -1 }], "current": 0, "state": 2 };

        assert.strictEqual(JSON.stringify(toPairsOrdered(obj1)), JSON.stringify(toPairsOrdered(obj2)));
    });
});
