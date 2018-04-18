import assert from 'assert';
import * as TicTacToe from '../../lib/tictactoe/base/TicTacToe';
import { Player } from '../../lib/tictactoe/base/Player';
import { Match } from '../../lib/tictactoe/base/Match';

const { _, X, O } = TicTacToe;

describe('tictactoe.base.Match', function () {
    it('Match', function () {
        const match = new Match();
        const player1 = new Player();
        const player2 = new Player();

        assert.deepEqual(match.grid.cells, [_, _, _,
                                            _, _, _,
                                            _, _, _]);
        assert.strictEqual(match.grid.blankCells, 9);
        assert.strictEqual(match.players.length, 0);
        assert.strictEqual(match.current, -1);
        assert.strictEqual(match.state, TicTacToe.WaitingForPlayersState);
        assert.ok(player1.match == null);
        assert.ok(player2.match == null);

        match.addPlayer(player1);
        match.addPlayer(player2);

        assert.strictEqual(match.findPlayer(TicTacToe.thisPlayer(player1)), player1);
        assert.strictEqual(match.findPlayer(TicTacToe.thisPlayer(player2)), player2);
        assert.strictEqual(match.findPlayer(TicTacToe.otherPlayer(player1)), player2);
        assert.strictEqual(match.findPlayer(TicTacToe.otherPlayer(player2)), player1);

        assert.ok(player1.match == match);
        assert.ok(player2.match == match);
        assert.strictEqual(player1.index, TicTacToe.Player1);
        assert.strictEqual(player1.mark, X);
        assert.strictEqual(player2.index, TicTacToe.Player2);
        assert.strictEqual(player2.mark, O);
        assert.strictEqual(match.current, 0);
        assert.strictEqual(match.state, TicTacToe.MatchRunningState);
        assert.ok(match.currentPlayer() === player1);

        player1.move(1, 1);

        assert.strictEqual(match.grid.cellAt(1, 1), player1.mark);
        assert.strictEqual(match.current, 1);
        assert.strictEqual(match.state, TicTacToe.MatchRunningState);
        assert.ok(match.currentPlayer() === player2);

        player2.move(0, 1);
        assert.strictEqual(match.grid.cellAt(0, 1), player2.mark);
        assert.strictEqual(match.current, 0);
        assert.strictEqual(match.state, TicTacToe.MatchRunningState);
        assert.ok(match.currentPlayer() === player1);

        player2.move(0, 0);
        assert.strictEqual(match.grid.cellAt(0, 0), _);
        assert.strictEqual(match.current, 0);
        assert.strictEqual(match.state, TicTacToe.MatchRunningState);
        assert.ok(match.currentPlayer() === player1);

        player1.move(0, 0);
        player2.move(0, 2);
        player1.move(2, 2);

        assert.deepEqual(match.grid.cells, [X, O, O,
                                            _, X, _,
                                            _, _, X]);
        assert.strictEqual(player1.score, 1);
        assert.strictEqual(player2.score, 0);
        assert.strictEqual(match.current, -1);
        assert.strictEqual(match.state, TicTacToe.MatchFinishedState);

        player1.move(0, 0);

        assert.deepEqual(match.grid.cells, [_, _, _,
                                            _, _, _,
                                            _, _, _]);
        assert.strictEqual(match.grid.blankCells, 9);
        assert.strictEqual(player1.index, TicTacToe.Player1);
        assert.strictEqual(player1.mark, O);
        assert.strictEqual(player2.index, TicTacToe.Player2);
        assert.strictEqual(player2.mark, X);
        assert.strictEqual(match.current, 0);
        assert.strictEqual(match.state, TicTacToe.MatchRunningState);
        assert.ok(match.currentPlayer() === player2);

        player1.move(0, 0);
        assert.strictEqual(match.grid.cellAt(0, 0), _);

        player2.move(1, 1);
        assert.strictEqual(match.grid.cellAt(1, 1), player2.mark);
        player1.move(0, 0);
        player2.move(2, 0);
        player1.move(0, 2);
        player2.move(0, 1);
        player1.move(2, 1);
        player2.move(1, 2);
        player1.move(1, 0);
        player2.move(2, 2);

        assert.deepEqual(match.grid.cells, [O, X, O,
                                         O, X, X,
                                         X, O, X]);
        assert.strictEqual(player1.score, 1);
        assert.strictEqual(player2.score, 0);
        assert.strictEqual(match.current, -1);
        assert.strictEqual(match.state, TicTacToe.MatchFinishedState);

        assert.strictEqual(player1.moved.slotCount(), 1);
        assert.strictEqual(player2.moved.slotCount(), 1);
        match.removePlayer(player1);
        assert.strictEqual(match.state, TicTacToe.WaitingForPlayersState);
        assert.ok(player1.match == null);
        assert.strictEqual(match.findPlayer(TicTacToe.thisPlayer(player1)), undefined);
        assert.strictEqual(match.findPlayer(TicTacToe.otherPlayer(player1)), player2);
        match.removePlayer(player2);
        assert.ok(player2.match == null);
        assert.strictEqual(match.findPlayer(TicTacToe.thisPlayer(player1)), undefined);
        assert.strictEqual(match.findPlayer(TicTacToe.thisPlayer(player2)), undefined);
        assert.strictEqual(match.findPlayer(TicTacToe.otherPlayer(player1)), undefined);
        assert.strictEqual(match.findPlayer(TicTacToe.otherPlayer(player2)), undefined);
        assert.strictEqual(match.players.length, 0);
        assert.strictEqual(player1.moved.slotCount(), 0);
        assert.strictEqual(player2.moved.slotCount(), 0);
    });
});
