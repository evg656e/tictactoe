(function loader(root, fac, id, deps) {
    if (typeof bootstrap === 'function') { // browser dynamic loader
        bootstrap(root, fac, id, deps);
        return;
    }
    deps = (deps || []).map(function(dep) {
        return {
            id: dep.substring(dep.lastIndexOf('/') + 1),
            path: dep.substring(0, dep.lastIndexOf('/') + 1),
            filePath: dep.substring(0, dep.lastIndexOf('/') + 1) + dep.substring(dep.lastIndexOf('/') + 1).toLowerCase() + '.js'
        };
    });
    if (typeof module === 'object' && module.exports) // node.js loader
        module.exports = fac.apply(root, deps.map(function(dep) { return require(dep.filePath); }));
    else if (typeof Qt === 'object' && Qt.include) // qml loader
        root[id] = fac.apply(root, deps.map(function(dep) {
            if (!root[dep.id])
                Qt.include(dep.filePath);
            return root[dep.id];
        }));
    else // browser static loader
        root[id] = fac.apply(root, deps.map(function(dep) { return root[dep.id]; }));
/*loader.*/}(this, function(TicTacToe) {

'use strict';

console.log('defining Test_TicTacToe');

function compareArraysHelper(test) {
    return function(actual, expected) {
        if (typeof actual === 'undefined'
            || typeof expected === 'undefined') {
            test.strictEqual(actual, expected, 'arrays definition missmatch');
            return;
        }
        if (actual.length !== expected.length) {
            test.strictEqual(actual.length, expected.length, 'arrays length missmatch');
            return;
        }
        if (actual.every(function(a, i) {
            if (a !== expected[i]) {
                test.strictEqual(a, expected[i], 'arrays elements missmatch (at index ' + i + ')');
                return false;
            }
            return true;
        }))
            test.ok(true);
    };
}

var suite = {};

suite.test_indices = function(test) {
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
        test.strictEqual(row, pos.row);
        test.strictEqual(column, pos.column);
    });

    positions.forEach(function(pos, i) {
        var index = TicTacToe.Grid.toIndex(pos.row, pos.column);
        test.strictEqual(index, i);
    });

    test.done();
}

suite.test_grid = function(test) {
    var compareArrays = compareArraysHelper(test),
        _ = TicTacToe._,
        X = TicTacToe.X,
        O = TicTacToe.O;

    var result;

    var grid = new TicTacToe.Grid();
    compareArrays(grid.cells, [_, _, _,
                               _, _, _,
                               _, _, _]);
    test.strictEqual(grid.blankCells, 9);

    result = grid.setCell(1, 1, X);
    compareArrays(grid.cells, [_, _, _,
                               _, X, _,
                               _, _, _]);
    test.strictEqual(result, TicTacToe.ProceedState);
    test.strictEqual(grid.cellAt(1, 1), X);
    test.strictEqual(grid.blankCells, 8);

    result = grid.setCell(0, 0, O);
    compareArrays(grid.cells, [O, _, _,
                               _, X, _,
                               _, _, _]);
    test.strictEqual(result, TicTacToe.ProceedState);
    test.strictEqual(grid.cellAt(0, 0), O);
    test.strictEqual(grid.blankCells, 7);

    result = grid.setCell(1, 1, O);
    compareArrays(grid.cells, [O, _, _,
                               _, X, _,
                               _, _, _]);
    test.strictEqual(result, TicTacToe.DiscardState);
    test.strictEqual(grid.cellAt(1, 1), X);
    test.strictEqual(grid.blankCells, 7);

    result = grid.setCell(0, 2, X);
    compareArrays(grid.cells, [O, _, X,
                               _, X, _,
                               _, _, _]);
    test.strictEqual(result, TicTacToe.ProceedState);
    test.strictEqual(grid.cellAt(0, 2), X);
    test.strictEqual(grid.blankCells, 6);

    var backup1 = grid.dump();

    result = grid.setCell(1, 0, O);
    compareArrays(grid.cells, [O, _, X,
                               O, X, _,
                               _, _, _]);
    test.strictEqual(result, TicTacToe.ProceedState);
    test.strictEqual(grid.cellAt(1, 0), O);
    test.strictEqual(grid.blankCells, 5);

    var backup2 = grid.dump();

    result = grid.setCell(2, 0, X);
    compareArrays(grid.cells, [O, _, X,
                               O, X, _,
                               X, _, _]);
    test.strictEqual(result, TicTacToe.WinState);
    test.strictEqual(grid.cellAt(2, 0), X);
    test.strictEqual(grid.blankCells, 4);

    grid.restore(backup2);
    compareArrays(grid.cells, [O, _, X,
                               O, X, _,
                               _, _, _]);
    test.strictEqual(grid.blankCells, 5);

    result = grid.setCell(2, 0, O);
    compareArrays(grid.cells, [O, _, X,
                               O, X, _,
                               O, _, _]);
    test.strictEqual(result, TicTacToe.WinState);
    test.strictEqual(grid.cellAt(2, 0), O);
    test.strictEqual(grid.blankCells, 4);

    grid.restore(backup1);
    compareArrays(grid.cells, [O, _, X,
                               _, X, _,
                               _, _, _]);
    test.strictEqual(grid.blankCells, 6);

    result = grid.setCell(2, 0, O);
    test.strictEqual(result, TicTacToe.ProceedState);
    compareArrays(grid.cells, [O, _, X,
                               _, X, _,
                               O, _, _]);
    test.strictEqual(grid.blankCells, 5);

    result = grid.setCell(1, 0, X);
    test.strictEqual(result, TicTacToe.ProceedState);
    compareArrays(grid.cells, [O, _, X,
                               X, X, _,
                               O, _, _]);
    test.strictEqual(grid.blankCells, 4);

    result = grid.setCell(0, 1, O);
    test.strictEqual(result, TicTacToe.ProceedState);
    compareArrays(grid.cells, [O, O, X,
                               X, X, _,
                               O, _, _]);
    test.strictEqual(grid.blankCells, 3);

    test.strictEqual(grid.testWinState(1, 2, X), true);
    test.strictEqual(grid.testWinState(2, 2, O), false);
    compareArrays(grid.cells, [O, O, X,
                               X, X, _,
                               O, _, _]);

    result = grid.setCell(2, 2, X);
    test.strictEqual(result, TicTacToe.ProceedState);
    compareArrays(grid.cells, [O, O, X,
                               X, X, _,
                               O, _, X]);
    test.strictEqual(grid.blankCells, 2);

    result = grid.setCell(1, 2, O);
    test.strictEqual(result, TicTacToe.ProceedState);
    compareArrays(grid.cells, [O, O, X,
                               X, X, O,
                               O, _, X]);
    test.strictEqual(grid.blankCells, 1);

    result = grid.setCell(2, 1, X);
    test.strictEqual(result, TicTacToe.DrawState);
    compareArrays(grid.cells, [O, O, X,
                               X, X, O,
                               O, X, X]);

    result = grid.setCell(1, 1, X);
    test.strictEqual(result, TicTacToe.DiscardState);
    compareArrays(grid.cells, [O, O, X,
                               X, X, O,
                               O, X, X]);

    grid.clear();
    compareArrays(grid.cells, [_, _, _,
                               _, _, _,
                               _, _, _]);
    test.strictEqual(grid.cellAt(0, 0), _);
    test.strictEqual(grid.blankCells, 9);

    test.done();
};

suite.test_player = function(test) {
    var player1 = new TicTacToe.Player(),
        player2 = new TicTacToe.Player('White'),
        player3 = new TicTacToe.Player('Player 1');

    test.strictEqual(player1.name, '');
    test.strictEqual(player2.name, 'White');
    test.strictEqual(player3.name, '');

    test.strictEqual(player1.index, -1);
    test.strictEqual(player2.index, -1);
    test.strictEqual(player3.index, -1);

    test.strictEqual(player1.score, -1);
    test.strictEqual(player2.score, -1);
    test.strictEqual(player3.score, -1);

    test.strictEqual(player1.mark, TicTacToe._);
    test.strictEqual(player2.mark, TicTacToe._);
    test.strictEqual(player3.mark, TicTacToe._);

    player1.setMark(TicTacToe.X);
    test.strictEqual(player1.mark, TicTacToe.X);

    var state = player1.dump();
    test.strictEqual(state.name, '');
    test.strictEqual(state.index, -1);
    test.strictEqual(state.score, -1);
    test.strictEqual(state.mark, TicTacToe.X);

    var nameChangedCount = 0;
    function nameChanged() {
        nameChangedCount++;
    }

    player1.nameChanged.subscribe(nameChanged);
    player3.nameChanged.subscribe(nameChanged);

    player1.setName();
    test.strictEqual(player1.name, '');
    player1.setIndex(TicTacToe.Player1);
    test.strictEqual(player1.index, TicTacToe.Player1);
    player1.setName();
    test.strictEqual(player1.name, 'Player 1');
    player1.setName('Player 1');
    test.strictEqual(player1.name, 'Player 1');
    player1.setName('Player 2');
    test.strictEqual(player1.name, 'Player 1');
    player1.setName('Player A');
    test.strictEqual(player1.name, 'Player A');
    test.strictEqual(nameChangedCount, 2);

    player3.setName('asd');
    test.strictEqual(player3.name, 'asd');
    player3.setName();
    test.strictEqual(player3.name, '');

    var scoreChangedCount = 0;
    player1.scoreChanged.subscribe(function() {
        scoreChangedCount++;
    });

    test.strictEqual(player1.score, -1);
    player1.setScore(1);
    test.strictEqual(player1.score, 1);
    player1.setScore(2);
    test.strictEqual(player1.score, 2);
    player1.setScore(2);
    test.strictEqual(player1.score, 2);
    test.strictEqual(scoreChangedCount, 2);

    player1.restore(state);

    test.strictEqual(player1.name, '');
    test.strictEqual(player1.index, -1);
    test.strictEqual(player1.score, -1);
    test.strictEqual(player1.mark, TicTacToe.X);

    test.done();
};

suite.test_match = function(test) {
    var compareArrays = compareArraysHelper(test),

        _ = TicTacToe._,
        X = TicTacToe.X,
        O = TicTacToe.O,

        match = new TicTacToe.Match(),
        player1 = new TicTacToe.Player(),
        player2 = new TicTacToe.Player();

    compareArrays(match.grid.cells, [_, _, _,
                                     _, _, _,
                                     _, _, _]);
    test.strictEqual(match.grid.blankCells, 9);
    test.strictEqual(match.players.length, 0);
    test.strictEqual(match.current, -1);
    test.strictEqual(match.state, TicTacToe.WaitingForPlayersState);
    test.ok(player1.match == null);
    test.ok(player2.match == null);

    match.addPlayer(player1);
    match.addPlayer(player2);

    test.strictEqual(match.findPlayer(TicTacToe.thisPlayer(player1)), player1);
    test.strictEqual(match.findPlayer(TicTacToe.thisPlayer(player2)), player2);
    test.strictEqual(match.findPlayer(TicTacToe.otherPlayer(player1)), player2);
    test.strictEqual(match.findPlayer(TicTacToe.otherPlayer(player2)), player1);

    test.ok(player1.match == match);
    test.ok(player2.match == match);
    test.strictEqual(player1.index, TicTacToe.Player1);
    test.strictEqual(player1.mark, X);
    test.strictEqual(player2.index, TicTacToe.Player2);
    test.strictEqual(player2.mark, O);
    test.strictEqual(match.current, 0);
    test.strictEqual(match.state, TicTacToe.MatchRunningState);
    test.ok(match.currentPlayer() === player1);

    player1.move(1, 1);

    test.strictEqual(match.grid.cellAt(1, 1), player1.mark);
    test.strictEqual(match.current, 1);
    test.strictEqual(match.state, TicTacToe.MatchRunningState);
    test.ok(match.currentPlayer() === player2);

    player2.move(0, 1);
    test.strictEqual(match.grid.cellAt(0, 1), player2.mark);
    test.strictEqual(match.current, 0);
    test.strictEqual(match.state, TicTacToe.MatchRunningState);
    test.ok(match.currentPlayer() === player1);

    player2.move(0, 0);
    test.strictEqual(match.grid.cellAt(0, 0), _);
    test.strictEqual(match.current, 0);
    test.strictEqual(match.state, TicTacToe.MatchRunningState);
    test.ok(match.currentPlayer() === player1);

    player1.move(0, 0);
    player2.move(0, 2);
    player1.move(2, 2);

    compareArrays(match.grid.cells, [X, O, O,
                                     _, X, _,
                                     _, _, X]);
    test.strictEqual(player1.score, 1);
    test.strictEqual(player2.score, 0);
    test.strictEqual(match.current, -1);
    test.strictEqual(match.state, TicTacToe.MatchFinishedState);

    player1.move(0, 0);

    compareArrays(match.grid.cells, [_, _, _,
                                     _, _, _,
                                     _, _, _]);
    test.strictEqual(match.grid.blankCells, 9);
    test.strictEqual(player1.index, TicTacToe.Player1);
    test.strictEqual(player1.mark, O);
    test.strictEqual(player2.index, TicTacToe.Player2);
    test.strictEqual(player2.mark, X);
    test.strictEqual(match.current, 0);
    test.strictEqual(match.state, TicTacToe.MatchRunningState);
    test.ok(match.currentPlayer() === player2);

    player1.move(0, 0);
    test.strictEqual(match.grid.cellAt(0, 0), _);

    player2.move(1, 1);
    test.strictEqual(match.grid.cellAt(1, 1), player2.mark);
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
    test.strictEqual(player1.score, 1);
    test.strictEqual(player2.score, 0);
    test.strictEqual(match.current, -1);
    test.strictEqual(match.state, TicTacToe.MatchFinishedState);

    test.strictEqual(player1.moved.listenerCount(), 1);
    test.strictEqual(player2.moved.listenerCount(), 1);
    match.removePlayer(player1);
    test.strictEqual(match.state, TicTacToe.WaitingForPlayersState);
    test.ok(player1.match == null);
    test.strictEqual(match.findPlayer(TicTacToe.thisPlayer(player1)), undefined);
    test.strictEqual(match.findPlayer(TicTacToe.otherPlayer(player1)), player2);
    match.removePlayer(player2);
    test.ok(player2.match == null);
    test.strictEqual(match.findPlayer(TicTacToe.thisPlayer(player1)), undefined);
    test.strictEqual(match.findPlayer(TicTacToe.thisPlayer(player2)), undefined);
    test.strictEqual(match.findPlayer(TicTacToe.otherPlayer(player1)), undefined);
    test.strictEqual(match.findPlayer(TicTacToe.otherPlayer(player2)), undefined);
    test.strictEqual(match.players.length, 0);
    test.strictEqual(player1.moved.listenerCount(), 0);
    test.strictEqual(player2.moved.listenerCount(), 0);

    test.done();
};

suite.test_actions = function(test) {
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
    test.strictEqual(findMatchAction.playerName, action.playerName);

    action = TicTacToe.Action.parse(matchFoundAction.stringify());
    test.strictEqual(matchFoundAction.playersInfo.length, action.playersInfo.length);
    matchFoundAction.playersInfo.forEach(function(playerInfo, index) {
        var otherPlayerInfo = action.playersInfo[index];
        test.strictEqual(playerInfo.name, otherPlayerInfo.name);
        test.strictEqual(playerInfo.local, otherPlayerInfo.local);
    });

    action = TicTacToe.Action.parse(updatePlayerAction.stringify());
    test.strictEqual(updatePlayerAction.playerIndex, action.playerIndex);
    test.strictEqual(updatePlayerAction.propertyName, action.propertyName);
    test.strictEqual(updatePlayerAction.propertyValue, action.propertyValue);

    action = TicTacToe.Action.parse(movePlayerAction.stringify());
    test.strictEqual(movePlayerAction.playerIndex, action.playerIndex);
    test.strictEqual(movePlayerAction.row, action.row);
    test.strictEqual(movePlayerAction.column, action.column);

    action = TicTacToe.Action.parse(quitAction.stringify());
    test.strictEqual(quitAction.playerIndex, action.playerIndex);
    test.strictEqual(quitAction.code, action.code);

    action = TicTacToe.Action.parse(syncAction.stringify());
    test.strictEqual(syncAction.stateHash, action.stateHash);
    test.strictEqual(syncAction.current, action.current);

    test.done();
};

suite.test_proxyPlayer = function(test) {
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
                this.match.playerRemoved.unsubscribe(this.removePlayer);
            }
            this.match = match;
            if (this.match != null) {
                this.match.playerRemoved.subscribe(this.removePlayer);
            }
        },
        removePlayer: function(player) {
            if (player instanceof TicTacToe.ProxyPlayer)
                player.setPlayer();
        }.bind(mockGameClient)
    };

    var player1 = new TicTacToe.Player('White'),
        player2 = new TicTacToe.AiPlayer('Player 1', -1);

    test.strictEqual(player1.moved.listenerCount(), 0);
    test.strictEqual(player1.nameChanged.listenerCount(), 0);
    test.strictEqual(player1.scoreChanged.listenerCount(), 0);
    test.strictEqual(player2.moved.listenerCount(), 0);
    test.strictEqual(player2.nameChanged.listenerCount(), 0);
    test.strictEqual(player2.scoreChanged.listenerCount(), 0);

    var proxyPlayer1 = new TicTacToe.ProxyPlayer(mockGameClient, player1),
        proxyPlayer2 = new TicTacToe.ProxyPlayer(mockGameClient, player2, true),
        match = new TicTacToe.Match();

    mockGameClient.setMatch(match);

    test.strictEqual(proxyPlayer1.name, 'White');
    test.strictEqual(proxyPlayer1.name, player1.name);
    test.strictEqual(proxyPlayer2.name, '');
    test.strictEqual(proxyPlayer2.name, player2.name);

    test.strictEqual(proxyPlayer1.moved.listenerCount(), 0);
    test.strictEqual(proxyPlayer2.moved.listenerCount(), 0);

    match.addPlayer(proxyPlayer1);
    match.addPlayer(proxyPlayer2);

    // test.strictEqual(proxyPlayer1.name, 'White');
    // test.strictEqual(proxyPlayer1.name, player1.name);
    // test.strictEqual(proxyPlayer2.name, 'Player 2');
    // test.strictEqual(proxyPlayer2.name, player2.name);

    // proxyPlayer1.setName('Player A');
    // test.strictEqual(proxyPlayer1.name, 'Player A');
    // test.strictEqual(proxyPlayer1.name, player1.name);
    //
    // proxyPlayer2.setName('Player B');
    // test.strictEqual(proxyPlayer2.name, 'Player 2');
    // test.strictEqual(proxyPlayer2.name, player2.name);

    test.strictEqual(player1.moved.listenerCount(), 1);
    test.strictEqual(player1.nameChanged.listenerCount(), 1);
    test.strictEqual(player1.scoreChanged.listenerCount(), 1);
    test.strictEqual(player2.moved.listenerCount(), 1);
    test.strictEqual(player2.nameChanged.listenerCount(), 1);
    test.strictEqual(player2.scoreChanged.listenerCount(), 1);

    test.strictEqual(proxyPlayer1.moved.listenerCount(), 1);
    test.strictEqual(proxyPlayer2.moved.listenerCount(), 1);

    test.strictEqual(match.findPlayer(TicTacToe.thisPlayer(player1)), proxyPlayer1);
    test.strictEqual(match.findPlayer(TicTacToe.thisPlayer(proxyPlayer1)), proxyPlayer1);
    test.strictEqual(match.findPlayer(TicTacToe.thisPlayer(player2)), proxyPlayer2);
    test.strictEqual(match.findPlayer(TicTacToe.thisPlayer(proxyPlayer2)), proxyPlayer2);

    test.strictEqual(proxyPlayer1.index, TicTacToe.Player1);
    test.strictEqual(proxyPlayer2.index, TicTacToe.Player2);
    test.strictEqual(proxyPlayer1.index, player1.index);
    test.strictEqual(proxyPlayer2.index, player2.index);

    test.strictEqual(proxyPlayer1.mark, TicTacToe.X);
    test.strictEqual(proxyPlayer2.mark, TicTacToe.O);
    test.strictEqual(proxyPlayer1.mark, player1.mark);
    test.strictEqual(proxyPlayer2.mark, player2.mark);

    proxyPlayer1.setScore(1);
    test.strictEqual(proxyPlayer1.score, 1);
    test.strictEqual(proxyPlayer1.score, player1.score);

    proxyPlayer1.move(1, 1);
    test.strictEqual(match.grid.cellAt(1, 1), player1.mark);
    test.strictEqual(match.grid.cellAt(0, 0), player2.mark);
    proxyPlayer1.move(0, 2);
    proxyPlayer1.move(1, 0);
    proxyPlayer1.move(0, 1);
    proxyPlayer1.move(2, 2);

    test.strictEqual(match.current, -1);
    test.strictEqual(match.state, TicTacToe.MatchFinishedState);

    proxyPlayer1.move(0, 0);
    test.strictEqual(match.state, TicTacToe.MatchRunningState);
    test.strictEqual(match.grid.blankCells, TicTacToe.Grid.Size*TicTacToe.Grid.Size);

    match.removePlayer(proxyPlayer1);

    test.strictEqual(player1.moved.listenerCount(), 0);
    test.strictEqual(player1.nameChanged.listenerCount(), 0);
    test.strictEqual(player1.scoreChanged.listenerCount(), 0);
    test.strictEqual(proxyPlayer1.moved.listenerCount(), 0);

    match.clear();

    test.strictEqual(player2.moved.listenerCount(), 0);
    test.strictEqual(player2.nameChanged.listenerCount(), 0);
    test.strictEqual(player2.scoreChanged.listenerCount(), 0);
    test.strictEqual(proxyPlayer2.moved.listenerCount(), 0);

    test.done();
};

return suite;

}, 'Test_TicTacToe', ['../../../lib/TicTacToe']));
