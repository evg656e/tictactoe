import assert from 'assert';
import TicTacToe from '../lib/tictactoe.js';

function compareArraysHelper(test) {
    return function(actual, expected) {
        if (typeof actual === 'undefined'
            || typeof expected === 'undefined') {
            assert.strictEqual(actual, expected, 'Arrays definition missmatch');
            return;
        }
        if (actual.length !== expected.length) {
            assert.strictEqual(actual.length, expected.length, 'Arrays length missmatch');
            return;
        }
        if (actual.every(function(a, i) {
            if (a !== expected[i]) {
                assert.strictEqual(a, expected[i], 'Arrays elements missmatch (at index ' + i + ')');
                return false;
            }
            return true;
        }))
            assert.ok(true);
    };
}

describe('TicTacToe', function() {

    it('toPairsOrdered', function() {
        var obj1 = {"current":0,"index":{"cells":[0,0,0,0,0,0,0,0,0]},"players":[{"index":0,"mark":1,"score":-1},{"index":1,"mark":2,"score":-1}],"state":2},
            obj2 = {"index":{"cells":[0,0,0,0,0,0,0,0,0]},"players":[{"index":0,"score":-1,"mark":1},{"index":1,"mark":2,"score":-1}],"current":0,"state":2};

        assert.strictEqual(JSON.stringify(TicTacToe.toPairsOrdered(obj1)), JSON.stringify(TicTacToe.toPairsOrdered(obj2)));
    });

    it('indices', function() {
        function rc(row, column) {
            return { row: row, column: column };
        }

        var indices = [0, 1, 2,
                       3, 4, 5,
                       6, 7, 8],
            positions = [rc(0,0), rc(0,1), rc(0,2),
                         rc(1,0), rc(1,1), rc(1,2),
                         rc(2,0), rc(2,1), rc(2,2)];

        indices.forEach(function(index, i) {
            var row = TicTacToe.Grid.toRow(index),
                column = TicTacToe.Grid.toColumn(index),
                pos = positions[i];
            assert.strictEqual(row, pos.row);
            assert.strictEqual(column, pos.column);
        });

        positions.forEach(function(pos, i) {
            var index = TicTacToe.Grid.toIndex(pos.row, pos.column);
            assert.strictEqual(index, i);
        });
    });

    it('Grid', function() {
        var compareArrays = compareArraysHelper(assert),
            _ = TicTacToe._,
            X = TicTacToe.X,
            O = TicTacToe.O;

        var result;

        var grid = new TicTacToe.Grid();
        compareArrays(grid.cells, [_, _, _,
                                   _, _, _,
                                   _, _, _]);
        assert.strictEqual(grid.blankCells, 9);

        result = grid.setCell(1, 1, X);
        compareArrays(grid.cells, [_, _, _,
                                   _, X, _,
                                   _, _, _]);
        assert.strictEqual(result, TicTacToe.ProceedState);
        assert.strictEqual(grid.cellAt(1, 1), X);
        assert.strictEqual(grid.blankCells, 8);

        result = grid.setCell(0, 0, O);
        compareArrays(grid.cells, [O, _, _,
                                   _, X, _,
                                   _, _, _]);
        assert.strictEqual(result, TicTacToe.ProceedState);
        assert.strictEqual(grid.cellAt(0, 0), O);
        assert.strictEqual(grid.blankCells, 7);

        result = grid.setCell(1, 1, O);
        compareArrays(grid.cells, [O, _, _,
                                   _, X, _,
                                   _, _, _]);
        assert.strictEqual(result, TicTacToe.DiscardState);
        assert.strictEqual(grid.cellAt(1, 1), X);
        assert.strictEqual(grid.blankCells, 7);

        result = grid.setCell(0, 2, X);
        compareArrays(grid.cells, [O, _, X,
                                   _, X, _,
                                   _, _, _]);
        assert.strictEqual(result, TicTacToe.ProceedState);
        assert.strictEqual(grid.cellAt(0, 2), X);
        assert.strictEqual(grid.blankCells, 6);

        var backup1 = grid.dump();

        result = grid.setCell(1, 0, O);
        compareArrays(grid.cells, [O, _, X,
                                   O, X, _,
                                   _, _, _]);
        assert.strictEqual(result, TicTacToe.ProceedState);
        assert.strictEqual(grid.cellAt(1, 0), O);
        assert.strictEqual(grid.blankCells, 5);

        var backup2 = grid.dump();

        result = grid.setCell(2, 0, X);
        compareArrays(grid.cells, [O, _, X,
                                   O, X, _,
                                   X, _, _]);
        assert.strictEqual(result, TicTacToe.WinState);
        assert.strictEqual(grid.cellAt(2, 0), X);
        assert.strictEqual(grid.blankCells, 4);

        grid.restore(backup2);
        compareArrays(grid.cells, [O, _, X,
                                   O, X, _,
                                   _, _, _]);
        assert.strictEqual(grid.blankCells, 5);

        result = grid.setCell(2, 0, O);
        compareArrays(grid.cells, [O, _, X,
                                   O, X, _,
                                   O, _, _]);
        assert.strictEqual(result, TicTacToe.WinState);
        assert.strictEqual(grid.cellAt(2, 0), O);
        assert.strictEqual(grid.blankCells, 4);

        grid.restore(backup1);
        compareArrays(grid.cells, [O, _, X,
                                   _, X, _,
                                   _, _, _]);
        assert.strictEqual(grid.blankCells, 6);

        result = grid.setCell(2, 0, O);
        assert.strictEqual(result, TicTacToe.ProceedState);
        compareArrays(grid.cells, [O, _, X,
                                   _, X, _,
                                   O, _, _]);
        assert.strictEqual(grid.blankCells, 5);

        result = grid.setCell(1, 0, X);
        assert.strictEqual(result, TicTacToe.ProceedState);
        compareArrays(grid.cells, [O, _, X,
                                   X, X, _,
                                   O, _, _]);
        assert.strictEqual(grid.blankCells, 4);

        result = grid.setCell(0, 1, O);
        assert.strictEqual(result, TicTacToe.ProceedState);
        compareArrays(grid.cells, [O, O, X,
                                   X, X, _,
                                   O, _, _]);
        assert.strictEqual(grid.blankCells, 3);

        assert.strictEqual(grid.testWinState(1, 2, X), true);
        assert.strictEqual(grid.testWinState(2, 2, O), false);
        compareArrays(grid.cells, [O, O, X,
                                   X, X, _,
                                   O, _, _]);

        result = grid.setCell(2, 2, X);
        assert.strictEqual(result, TicTacToe.ProceedState);
        compareArrays(grid.cells, [O, O, X,
                                   X, X, _,
                                   O, _, X]);
        assert.strictEqual(grid.blankCells, 2);

        result = grid.setCell(1, 2, O);
        assert.strictEqual(result, TicTacToe.ProceedState);
        compareArrays(grid.cells, [O, O, X,
                                   X, X, O,
                                   O, _, X]);
        assert.strictEqual(grid.blankCells, 1);

        result = grid.setCell(2, 1, X);
        assert.strictEqual(result, TicTacToe.DrawState);
        compareArrays(grid.cells, [O, O, X,
                                   X, X, O,
                                   O, X, X]);

        result = grid.setCell(1, 1, X);
        assert.strictEqual(result, TicTacToe.DiscardState);
        compareArrays(grid.cells, [O, O, X,
                                   X, X, O,
                                   O, X, X]);

        grid.clear();
        compareArrays(grid.cells, [_, _, _,
                                   _, _, _,
                                   _, _, _]);
        assert.strictEqual(grid.cellAt(0, 0), _);
        assert.strictEqual(grid.blankCells, 9);
    });

    it('Player', function() {
        var player1 = new TicTacToe.Player(),
            player2 = new TicTacToe.Player('White'),
            player3 = new TicTacToe.Player('Player 1');

        assert.strictEqual(player1.name, '');
        assert.strictEqual(player2.name, 'White');
        assert.strictEqual(player3.name, '');

        assert.strictEqual(player1.index, -1);
        assert.strictEqual(player2.index, -1);
        assert.strictEqual(player3.index, -1);

        assert.strictEqual(player1.score, -1);
        assert.strictEqual(player2.score, -1);
        assert.strictEqual(player3.score, -1);

        assert.strictEqual(player1.mark, TicTacToe._);
        assert.strictEqual(player2.mark, TicTacToe._);
        assert.strictEqual(player3.mark, TicTacToe._);

        player1.setMark(TicTacToe.X);
        assert.strictEqual(player1.mark, TicTacToe.X);

        var state = player1.dump();
        assert.strictEqual(state.name, '');
        assert.strictEqual(state.index, -1);
        assert.strictEqual(state.score, -1);
        assert.strictEqual(state.mark, TicTacToe.X);

        var nameChangedCount = 0;
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

        var scoreChangedCount = 0;
        player1.scoreChanged.connect(function() {
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
        assert.strictEqual(player1.mark, TicTacToe.X);
    });

    it('Match', function() {
        var compareArrays = compareArraysHelper(assert),

            _ = TicTacToe._,
            X = TicTacToe.X,
            O = TicTacToe.O,

            match = new TicTacToe.Match(),
            player1 = new TicTacToe.Player(),
            player2 = new TicTacToe.Player();

        compareArrays(match.grid.cells, [_, _, _,
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

        compareArrays(match.grid.cells, [X, O, O,
                                         _, X, _,
                                         _, _, X]);
        assert.strictEqual(player1.score, 1);
        assert.strictEqual(player2.score, 0);
        assert.strictEqual(match.current, -1);
        assert.strictEqual(match.state, TicTacToe.MatchFinishedState);

        player1.move(0, 0);

        compareArrays(match.grid.cells, [_, _, _,
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

        compareArrays(match.grid.cells, [O, X, O,
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

    it('Action', function() {
        var match = new TicTacToe.Match(),
            player1 = new TicTacToe.Player(),
            player2 = new TicTacToe.Player();

        match.addPlayer(player1);
        match.addPlayer(player2);
         var findMatchAction    = TicTacToe.Action.create('findMatch', 'Player 1'),
             matchFoundAction   = TicTacToe.Action.create('matchFound', [new TicTacToe.PlayerInfo('Player 1'), new TicTacToe.PlayerInfo('Player 2', true)]),
             updatePlayerAction = TicTacToe.Action.create('updatePlayer', TicTacToe.Player1, 'name', 'Player A'),
             movePlayerAction   = TicTacToe.Action.create('movePlayer', TicTacToe.Player1, 1, 1),
             quitAction         = TicTacToe.Action.create('quit', TicTacToe.Player1),
             syncAction         = TicTacToe.Action.create('sync', match, player2),
             action;

         action = TicTacToe.Action.parse(findMatchAction.stringify());
         assert.strictEqual(findMatchAction.playerName, action.playerName);

         action = TicTacToe.Action.parse(matchFoundAction.stringify());
         assert.strictEqual(matchFoundAction.playersInfo.length, action.playersInfo.length);
         matchFoundAction.playersInfo.forEach(function(playerInfo, index) {
             var otherPlayerInfo = action.playersInfo[index];
             assert.strictEqual(playerInfo.name, otherPlayerInfo.name);
             assert.strictEqual(playerInfo.local, otherPlayerInfo.local);
         });

         action = TicTacToe.Action.parse(updatePlayerAction.stringify());
         assert.strictEqual(updatePlayerAction.playerIndex, action.playerIndex);
         assert.strictEqual(updatePlayerAction.propertyName, action.propertyName);
         assert.strictEqual(updatePlayerAction.propertyValue, action.propertyValue);

         action = TicTacToe.Action.parse(movePlayerAction.stringify());
         assert.strictEqual(movePlayerAction.playerIndex, action.playerIndex);
         assert.strictEqual(movePlayerAction.row, action.row);
         assert.strictEqual(movePlayerAction.column, action.column);

         action = TicTacToe.Action.parse(quitAction.stringify());
         assert.strictEqual(quitAction.playerIndex, action.playerIndex);
         assert.strictEqual(quitAction.code, action.code);

         action = TicTacToe.Action.parse(syncAction.stringify());
         assert.strictEqual(syncAction.stateHash, action.stateHash);
         assert.strictEqual(syncAction.current, action.current);
    });

    it('ProxyPlayer', function() {
        var mockGameClient = {
            updatePlayer: function(player, propertyName, propertyValue) {
                this.handleUpdatePlayer(TicTacToe.Action.create('updatePlayer', player.index, propertyName, propertyValue));
            },
            handleUpdatePlayer: function(action) {
                var player = this.match.players[action.playerIndex];
                if (player)
                    player.updatePlayer(action);
            },
            movePlayer: function(player, row, column) {
                this.handleMovePlayer(TicTacToe.Action.create('movePlayer', player.index, row, column));
            },
            handleMovePlayer: function(action) {
                var player = this.match.players[action.playerIndex];
                if (player)
                    player.movePlayer(action);
            },
            setMatch: function(match) {
                if (this.match != null) {
                    this.match.playerRemoved.disconnect(this.removePlayer);
                }
                this.match = match;
                if (this.match != null) {
                    this.match.playerRemoved.connect(this.removePlayer);
                }
            },
            removePlayer: function(player) {
                if (player instanceof TicTacToe.ProxyPlayer)
                    player.setPlayer();
            }.bind(mockGameClient)
        };

        var player1 = new TicTacToe.Player('White'),
            player2 = new TicTacToe.AiPlayer('Player 1', -1);

        assert.strictEqual(player1.moved.slotCount(), 0);
        assert.strictEqual(player1.nameChanged.slotCount(), 0);
        assert.strictEqual(player1.scoreChanged.slotCount(), 0);
        assert.strictEqual(player2.moved.slotCount(), 0);
        assert.strictEqual(player2.nameChanged.slotCount(), 0);
        assert.strictEqual(player2.scoreChanged.slotCount(), 0);

        var proxyPlayer1 = new TicTacToe.ProxyPlayer(mockGameClient, player1),
            proxyPlayer2 = new TicTacToe.ProxyPlayer(mockGameClient, player2, true),
            match = new TicTacToe.Match();

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
        assert.strictEqual(match.grid.blankCells, TicTacToe.Grid.Size*TicTacToe.Grid.Size);

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
