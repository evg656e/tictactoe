import assert from 'assert';
import * as TicTacToe from '../../lib/tictactoe/base/TicTacToe';
import { Player } from '../../lib/tictactoe/base/Player';
import { Match } from '../../lib/tictactoe/base/Match';
import { Action } from '../../lib/tictactoe/actions/Action';
import { PlayerInfo } from '../../lib/tictactoe/actions/PlayerInfo';
import '../../lib/tictactoe/actions/actions';

describe('tictactoe.actions.Action', function () {
    it('Action', function () {
        const match = new Match();
        const player1 = new Player();
        const player2 = new Player();

        match.addPlayer(player1);
        match.addPlayer(player2);

        const findMatchAction = Action.create('findMatch', 'Player 1');
        const matchFoundAction = Action.create('matchFound', [new PlayerInfo('Player 1'), new PlayerInfo('Player 2', true)]);
        const updatePlayerAction = Action.create('updatePlayer', TicTacToe.Player1, 'name', 'Player A');
        const movePlayerAction = Action.create('movePlayer', TicTacToe.Player1, 1, 1);
        const quitAction = Action.create('quit', TicTacToe.Player1);
        const syncAction = Action.create('sync', match, player2);

        let action;

        action = Action.parse(findMatchAction.stringify());
        assert.strictEqual(findMatchAction.playerName, action.playerName);

        action = Action.parse(matchFoundAction.stringify());
        assert.strictEqual(matchFoundAction.playersInfo.length, action.playersInfo.length);
        matchFoundAction.playersInfo.forEach(function (playerInfo, index) {
            const otherPlayerInfo = action.playersInfo[index];
            assert.strictEqual(playerInfo.name, otherPlayerInfo.name);
            assert.strictEqual(playerInfo.local, otherPlayerInfo.local);
        });

        action = Action.parse(updatePlayerAction.stringify());
        assert.strictEqual(updatePlayerAction.playerIndex, action.playerIndex);
        assert.strictEqual(updatePlayerAction.propertyName, action.propertyName);
        assert.strictEqual(updatePlayerAction.propertyValue, action.propertyValue);

        action = Action.parse(movePlayerAction.stringify());
        assert.strictEqual(movePlayerAction.playerIndex, action.playerIndex);
        assert.strictEqual(movePlayerAction.row, action.row);
        assert.strictEqual(movePlayerAction.column, action.column);

        action = Action.parse(quitAction.stringify());
        assert.strictEqual(quitAction.playerIndex, action.playerIndex);
        assert.strictEqual(quitAction.code, action.code);

        action = Action.parse(syncAction.stringify());
        assert.strictEqual(syncAction.stateHash, action.stateHash);
        assert.strictEqual(syncAction.current, action.current);
    });
});
