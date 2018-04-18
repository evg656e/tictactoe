import * as TicTacToe from '../base/TicTacToe';
import { Grid } from '../base/Grid';
import { Player } from '../base/Player';

const { _, X, O } = TicTacToe;

/*!
    \class AiPlayer
    \extends Player
*/
export class AiPlayer extends Player {
    constructor(name, delay) {
        super(name);
        this.delay = delay || AiPlayer.defaultMoveDelay;
        this.doMove = this.doMove.bind(this);
    }

    findBestMove() {
        const grid = this.match.grid;
        const other = this.match.findPlayer(TicTacToe.otherPlayer(this));

        let bestMove;
        for (let i = 0; i < AiPlayer.moves.length; i++) {
            const move = AiPlayer.moves[i];
            if (grid.testWinState(move.row, move.column, this.mark))
                return move;
            if (grid.testWinState(move.row, move.column, other.mark))
                return move;
            if (grid.cellAt(move.row, move.column) === _ && !bestMove)
                bestMove = move;
        }
        return bestMove;
    }

    move() {
        if (this.match.state === TicTacToe.GameOverState)
            super.move();
    }

    doMove() {
        const bestMove = this.findBestMove();
        if (bestMove)
            super.move(bestMove.row, bestMove.column);
    }

    passMove() {
        if (this.delay < 0) // direct call for testing purposes
            this.doMove();
        else
            setTimeout(this.doMove, this.delay);
    }
}

AiPlayer.defaultMoveDelay = 300;

AiPlayer.moves = [4, 0, 2, 6, 8, 1, 3, 5, 7].map((index) => {
    return { row: Grid.toRow(index), column: Grid.toColumn(index) };
});
