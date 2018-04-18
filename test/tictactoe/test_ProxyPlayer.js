import assert from 'assert';
import * as TicTacToe from '../../lib/tictactoe/base/TicTacToe';
import { Player } from '../../lib/tictactoe/base/Player';
import { Grid } from '../../lib/tictactoe/base/Grid';
import { Match } from '../../lib/tictactoe/base/Match';
import { Action } from '../../lib/tictactoe/actions/Action';
import { PlayerInfo } from '../../lib/tictactoe/actions/PlayerInfo';
import '../../lib/tictactoe/actions/actions';
import { AiPlayer } from '../../lib/tictactoe/client/AiPlayer';
import { ProxyPlayer } from '../../lib/tictactoe/client/ProxyPlayer';

describe('tictactoe.client.ProxyPlayer', function () {
    it('ProxyPlayer', function () {
        const mockGameClient = {
            updatePlayer(player, propertyName, propertyValue) {
                this.handleUpdatePlayer(Action.create('updatePlayer', player.index, propertyName, propertyValue));
            },
            handleUpdatePlayer(action) {
                const player = this.match.players[action.playerIndex];
                if (player)
                    player.updatePlayer(action);
            },
            movePlayer(player, row, column) {
                this.handleMovePlayer(Action.create('movePlayer', player.index, row, column));
            },
            handleMovePlayer(action) {
                const player = this.match.players[action.playerIndex];
                if (player)
                    player.movePlayer(action);
            },
            setMatch(match) {
                if (this.match != null) {
                    this.match.playerRemoved.disconnect(this.removePlayer);
                }
                this.match = match;
                if (this.match != null) {
                    this.match.playerRemoved.connect(this.removePlayer);
                }
            },
            removePlayer(player) {
                if (player instanceof ProxyPlayer)
                    player.setPlayer();
            }
        };

        mockGameClient.removePlayer = mockGameClient.removePlayer.bind(mockGameClient);

        const player1 = new Player('White');
        const player2 = new AiPlayer('Player 1', -1);

        assert.strictEqual(player1.moved.slotCount(), 0);
        assert.strictEqual(player1.nameChanged.slotCount(), 0);
        assert.strictEqual(player1.scoreChanged.slotCount(), 0);
        assert.strictEqual(player2.moved.slotCount(), 0);
        assert.strictEqual(player2.nameChanged.slotCount(), 0);
        assert.strictEqual(player2.scoreChanged.slotCount(), 0);

        const proxyPlayer1 = new ProxyPlayer(mockGameClient, player1);
        const proxyPlayer2 = new ProxyPlayer(mockGameClient, player2, true);
        const match = new Match();

        mockGameClient.setMatch(match);

        assert.strictEqual(proxyPlayer1.name, 'White');
        assert.strictEqual(proxyPlayer1.name, player1.name);
        assert.strictEqual(proxyPlayer2.name, '');
        assert.strictEqual(proxyPlayer2.name, player2.name);

        assert.strictEqual(proxyPlayer1.moved.slotCount(), 0);
        assert.strictEqual(proxyPlayer2.moved.slotCount(), 0);

        match.addPlayer(proxyPlayer1);
        match.addPlayer(proxyPlayer2);

        // assert.strictEqual(proxyPlayer1.name, 'White');
        // assert.strictEqual(proxyPlayer1.name, player1.name);
        // assert.strictEqual(proxyPlayer2.name, 'Player 2');
        // assert.strictEqual(proxyPlayer2.name, player2.name);

        // proxyPlayer1.setName('Player A');
        // assert.strictEqual(proxyPlayer1.name, 'Player A');
        // assert.strictEqual(proxyPlayer1.name, player1.name);
        //
        // proxyPlayer2.setName('Player B');
        // assert.strictEqual(proxyPlayer2.name, 'Player 2');
        // assert.strictEqual(proxyPlayer2.name, player2.name);

        assert.strictEqual(player1.moved.slotCount(), 1);
        assert.strictEqual(player1.nameChanged.slotCount(), 1);
        assert.strictEqual(player1.scoreChanged.slotCount(), 1);
        assert.strictEqual(player2.moved.slotCount(), 1);
        assert.strictEqual(player2.nameChanged.slotCount(), 1);
        assert.strictEqual(player2.scoreChanged.slotCount(), 1);

        assert.strictEqual(proxyPlayer1.moved.slotCount(), 1);
        assert.strictEqual(proxyPlayer2.moved.slotCount(), 1);

        assert.strictEqual(match.findPlayer(TicTacToe.thisPlayer(player1)), proxyPlayer1);
        assert.strictEqual(match.findPlayer(TicTacToe.thisPlayer(proxyPlayer1)), proxyPlayer1);
        assert.strictEqual(match.findPlayer(TicTacToe.thisPlayer(player2)), proxyPlayer2);
        assert.strictEqual(match.findPlayer(TicTacToe.thisPlayer(proxyPlayer2)), proxyPlayer2);

        assert.strictEqual(proxyPlayer1.index, TicTacToe.Player1);
        assert.strictEqual(proxyPlayer2.index, TicTacToe.Player2);
        assert.strictEqual(proxyPlayer1.index, player1.index);
        assert.strictEqual(proxyPlayer2.index, player2.index);

        assert.strictEqual(proxyPlayer1.mark, TicTacToe.X);
        assert.strictEqual(proxyPlayer2.mark, TicTacToe.O);
        assert.strictEqual(proxyPlayer1.mark, player1.mark);
        assert.strictEqual(proxyPlayer2.mark, player2.mark);

        proxyPlayer1.setScore(1);
        assert.strictEqual(proxyPlayer1.score, 1);
        assert.strictEqual(proxyPlayer1.score, player1.score);

        proxyPlayer1.move(1, 1);
        assert.strictEqual(match.grid.cellAt(1, 1), player1.mark);
        assert.strictEqual(match.grid.cellAt(0, 0), player2.mark);
        proxyPlayer1.move(0, 2);
        proxyPlayer1.move(1, 0);
        proxyPlayer1.move(0, 1);
        proxyPlayer1.move(2, 2);

        assert.strictEqual(match.current, -1);
        assert.strictEqual(match.state, TicTacToe.MatchFinishedState);

        proxyPlayer1.move(0, 0);
        assert.strictEqual(match.state, TicTacToe.MatchRunningState);
        assert.strictEqual(match.grid.blankCells, Grid.Size * Grid.Size);

        match.removePlayer(proxyPlayer1);

        assert.strictEqual(player1.moved.slotCount(), 0);
        assert.strictEqual(player1.nameChanged.slotCount(), 0);
        assert.strictEqual(player1.scoreChanged.slotCount(), 0);
        assert.strictEqual(proxyPlayer1.moved.slotCount(), 0);

        match.clear();

        assert.strictEqual(player2.moved.slotCount(), 0);
        assert.strictEqual(player2.nameChanged.slotCount(), 0);
        assert.strictEqual(player2.scoreChanged.slotCount(), 0);
        assert.strictEqual(proxyPlayer2.moved.slotCount(), 0);
    });
});
