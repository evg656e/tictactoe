import { Signal } from '../../core/Signal';
import * as TicTacToe from './TicTacToe';

const { _, X, O } = TicTacToe;

/*!
    \class Grid
*/
export class Grid {
    constructor() {
        this.cellChanged = new Signal();
        this.cleared = new Signal();
        this.clear();
    }

    clear() {
        this.cells = [
            _, _, _,
            _, _, _,
            _, _, _
        ];
        this.blankCells = this.cells.length;
        this.cleared();
    }

    // [0, 1, 2,     [(0,0), (0,1), (0,2),
    //  3, 4, 5, <=>  (1,0), (1,1), (1,2),
    //  6, 7, 8]      (2,0), (2,1), (2,2)]
    cellAt(row, column) {
        return this.cells[row * Grid.Size + column];
    }

    setCell(row, column, mark, playerIndex) {
        const index = row * Grid.Size + column;
        if (this.cells[index] === _) {
            if (mark === X || mark === O) {
                this.cells[index] = mark;
                this.blankCells--;
                this.cellChanged(row, column, mark, playerIndex);
                if (this.isWinState(row, column, mark))
                    return TicTacToe.WinState;
                return this.blankCells === 0 ? TicTacToe.DrawState : TicTacToe.ProceedState;
            }
        }
        return TicTacToe.DiscardState;
    }

    isWinState(row, column, mark) {
        let rowEqual = true,
            columnEqual = true,
            majorDiagonalEqual = row === column,
            minorDiagonalEqual = (row + column === Grid.Size - 1);
        for (let k = 0; k < Grid.Size; k++) {
            rowEqual = rowEqual && this.cellAt(row, k) === mark;
            columnEqual = columnEqual && this.cellAt(k, column) === mark;
            majorDiagonalEqual = majorDiagonalEqual && this.cellAt(k, k) === mark;
            minorDiagonalEqual = minorDiagonalEqual && this.cellAt(k, Grid.Size - k - 1) === mark;
        }
        return rowEqual || columnEqual || majorDiagonalEqual || minorDiagonalEqual;
    }

    testWinState(row, column, mark) {
        let result = false;
        if (this.cellAt(row, column) === _) {
            const index = row * Grid.Size + column;
            this.cells[index] = mark;
            result = this.isWinState(row, column, mark);
            this.cells[index] = _;
        }
        return result;
    }

    dump() {
        return {
            cells: this.cells.slice()
        };
    }

    restore(state) {
        this.blankCells = 0;
        this.cells = state.cells.map((cell) => {
            if (cell === _)
                this.blankCells++;
            return cell;
        });
    }

    debug() {
        let text = '';
        for (let i = 0; i < Grid.Size; i++) {
            for (let j = 0; j < Grid.Size; j++) {
                text += TicTacToe.markText[this.cellAt(i, j)];
            }
            text += '\n';
        }
        return text;
    }

    static toIndex(row, column) {
        return row * Grid.Size + column;
    }

    static toRow(index) {
        return Math.floor(index / Grid.Size);
    }

    static toColumn(index) {
        return index % Grid.Size;
    }

    static restore(state) {
        const ret = new Grid();
        ret.restore(state);
        return ret;
    }
}

Grid.Size = 3;
