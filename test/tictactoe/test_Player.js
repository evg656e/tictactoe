import assert from 'assert';
import * as TicTacToe from '../../lib/tictactoe/base/TicTacToe';
import { Player } from '../../lib/tictactoe/base/Player';

const { _, X, O } = TicTacToe;

describe('tictactoe.base.Player', function () {
    it('Player', function () {
        const player1 = new Player();
        const player2 = new Player('White');
        const player3 = new Player('Player 1');

        assert.strictEqual(player1.name, '');
        assert.strictEqual(player2.name, 'White');
        assert.strictEqual(player3.name, '');

        assert.strictEqual(player1.index, -1);
        assert.strictEqual(player2.index, -1);
        assert.strictEqual(player3.index, -1);

        assert.strictEqual(player1.score, -1);
        assert.strictEqual(player2.score, -1);
        assert.strictEqual(player3.score, -1);

        assert.strictEqual(player1.mark, _);
        assert.strictEqual(player2.mark, _);
        assert.strictEqual(player3.mark, _);

        player1.setMark(X);
        assert.strictEqual(player1.mark, X);

        const state = player1.dump();
        assert.strictEqual(state.name, '');
        assert.strictEqual(state.index, -1);
        assert.strictEqual(state.score, -1);
        assert.strictEqual(state.mark, X);

        let nameChangedCount = 0;
        function nameChanged() {
            nameChangedCount++;
        }

        player1.nameChanged.connect(nameChanged);
        player3.nameChanged.connect(nameChanged);

        player1.setName();
        assert.strictEqual(player1.name, '');
        player1.setIndex(TicTacToe.Player1);
        assert.strictEqual(player1.index, TicTacToe.Player1);
        player1.setName();
        assert.strictEqual(player1.name, 'Player 1');
        player1.setName('Player 1');
        assert.strictEqual(player1.name, 'Player 1');
        player1.setName('Player 2');
        assert.strictEqual(player1.name, 'Player 1');
        player1.setName('Player A');
        assert.strictEqual(player1.name, 'Player A');
        assert.strictEqual(nameChangedCount, 2);

        player3.setName('asd');
        assert.strictEqual(player3.name, 'asd');
        player3.setName();
        assert.strictEqual(player3.name, '');

        let scoreChangedCount = 0;
        player1.scoreChanged.connect(function () {
            scoreChangedCount++;
        });

        assert.strictEqual(player1.score, -1);
        player1.setScore(1);
        assert.strictEqual(player1.score, 1);
        player1.setScore(2);
        assert.strictEqual(player1.score, 2);
        player1.setScore(2);
        assert.strictEqual(player1.score, 2);
        assert.strictEqual(scoreChangedCount, 2);

        player1.restore(state);

        assert.strictEqual(player1.name, '');
        assert.strictEqual(player1.index, -1);
        assert.strictEqual(player1.score, -1);
        assert.strictEqual(player1.mark, X);
    });
});
