import assert from 'assert';
import * as TicTacToe from '../../lib/tictactoe/base/TicTacToe';
import { Grid } from '../../lib/tictactoe/base/Grid';

const { _, X, O } = TicTacToe;

describe('tictactoe.base.Grid', function () {
    it('indices', function () {
        function rc(row, column) {
            return { row: row, column: column };
        }

        const indices = [0, 1, 2,
                         3, 4, 5,
                         6, 7, 8];
        const positions = [rc(0,0), rc(0,1), rc(0,2),
                           rc(1,0), rc(1,1), rc(1,2),
                           rc(2,0), rc(2,1), rc(2,2)];

        indices.forEach(function (index, i) {
            const row = Grid.toRow(index);
            const column = Grid.toColumn(index);
            const pos = positions[i];
            assert.strictEqual(row, pos.row);
            assert.strictEqual(column, pos.column);
        });

        positions.forEach(function(pos, i) {
            const index = Grid.toIndex(pos.row, pos.column);
            assert.strictEqual(index, i);
        });
    });

    it('Grid', function () {
        let result;

        const grid = new Grid();
        assert.deepEqual(grid.cells, [_, _, _,
                                      _, _, _,
                                      _, _, _]);
        assert.strictEqual(grid.blankCells, 9);

        result = grid.setCell(1, 1, X);
        assert.deepEqual(grid.cells, [_, _, _,
                                      _, X, _,
                                      _, _, _]);
        assert.strictEqual(result, TicTacToe.ProceedState);
        assert.strictEqual(grid.cellAt(1, 1), X);
        assert.strictEqual(grid.blankCells, 8);

        result = grid.setCell(0, 0, O);
        assert.deepEqual(grid.cells, [O, _, _,
                                      _, X, _,
                                     _, _, _]);
        assert.strictEqual(result, TicTacToe.ProceedState);
        assert.strictEqual(grid.cellAt(0, 0), O);
        assert.strictEqual(grid.blankCells, 7);

        result = grid.setCell(1, 1, O);
        assert.deepEqual(grid.cells, [O, _, _,
                                      _, X, _,
                                      _, _, _]);
        assert.strictEqual(result, TicTacToe.DiscardState);
        assert.strictEqual(grid.cellAt(1, 1), X);
        assert.strictEqual(grid.blankCells, 7);

        result = grid.setCell(0, 2, X);
        assert.deepEqual(grid.cells, [O, _, X,
                                      _, X, _,
                                      _, _, _]);
        assert.strictEqual(result, TicTacToe.ProceedState);
        assert.strictEqual(grid.cellAt(0, 2), X);
        assert.strictEqual(grid.blankCells, 6);

        const backup1 = grid.dump();

        result = grid.setCell(1, 0, O);
        assert.deepEqual(grid.cells, [O, _, X,
                                      O, X, _,
                                      _, _, _]);
        assert.strictEqual(result, TicTacToe.ProceedState);
        assert.strictEqual(grid.cellAt(1, 0), O);
        assert.strictEqual(grid.blankCells, 5);

        const backup2 = grid.dump();

        result = grid.setCell(2, 0, X);
        assert.deepEqual(grid.cells, [O, _, X,
                                      O, X, _,
                                      X, _, _]);
        assert.strictEqual(result, TicTacToe.WinState);
        assert.strictEqual(grid.cellAt(2, 0), X);
        assert.strictEqual(grid.blankCells, 4);

        grid.restore(backup2);
        assert.deepEqual(grid.cells, [O, _, X,
                                      O, X, _,
                                      _, _, _]);
        assert.strictEqual(grid.blankCells, 5);

        result = grid.setCell(2, 0, O);
        assert.deepEqual(grid.cells, [O, _, X,
                                      O, X, _,
                                      O, _, _]);
        assert.strictEqual(result, TicTacToe.WinState);
        assert.strictEqual(grid.cellAt(2, 0), O);
        assert.strictEqual(grid.blankCells, 4);

        grid.restore(backup1);
        assert.deepEqual(grid.cells, [O, _, X,
                                     _, X, _,
                                     _, _, _]);
        assert.strictEqual(grid.blankCells, 6);

        result = grid.setCell(2, 0, O);
        assert.strictEqual(result, TicTacToe.ProceedState);
        assert.deepEqual(grid.cells, [O, _, X,
                                      _, X, _,
                                      O, _, _]);
        assert.strictEqual(grid.blankCells, 5);

        result = grid.setCell(1, 0, X);
        assert.strictEqual(result, TicTacToe.ProceedState);
        assert.deepEqual(grid.cells, [O, _, X,
                                      X, X, _,
                                      O, _, _]);
        assert.strictEqual(grid.blankCells, 4);

        result = grid.setCell(0, 1, O);
        assert.strictEqual(result, TicTacToe.ProceedState);
        assert.deepEqual(grid.cells, [O, O, X,
                                      X, X, _,
                                      O, _, _]);
        assert.strictEqual(grid.blankCells, 3);

        assert.strictEqual(grid.testWinState(1, 2, X), true);
        assert.strictEqual(grid.testWinState(2, 2, O), false);
        assert.deepEqual(grid.cells, [O, O, X,
                                      X, X, _,
                                     O, _, _]);

        result = grid.setCell(2, 2, X);
        assert.strictEqual(result, TicTacToe.ProceedState);
        assert.deepEqual(grid.cells, [O, O, X,
                                      X, X, _,
                                      O, _, X]);
        assert.strictEqual(grid.blankCells, 2);

        result = grid.setCell(1, 2, O);
        assert.strictEqual(result, TicTacToe.ProceedState);
        assert.deepEqual(grid.cells, [O, O, X,
                                      X, X, O,
                                      O, _, X]);
        assert.strictEqual(grid.blankCells, 1);

        result = grid.setCell(2, 1, X);
        assert.strictEqual(result, TicTacToe.DrawState);
        assert.deepEqual(grid.cells, [O, O, X,
                                      X, X, O,
                                      O, X, X]);

        result = grid.setCell(1, 1, X);
        assert.strictEqual(result, TicTacToe.DiscardState);
        assert.deepEqual(grid.cells, [O, O, X,
                                      X, X, O,
                                      O, X, X]);

        grid.clear();
        assert.deepEqual(grid.cells, [_, _, _,
                                      _, _, _,
                                      _, _, _]);
        assert.strictEqual(grid.cellAt(0, 0), _);
        assert.strictEqual(grid.blankCells, 9);
    });
});
