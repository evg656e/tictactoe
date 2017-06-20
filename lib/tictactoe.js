import lodash    from './3rdparty/lodash.js';
import Util      from './util.js';
import Timers    from './timers.js';
import Observer  from './observer.js';
import WebSocket from './websocket.js';

console.log('defining TicTacToe');

var message        = Observer.message,
    EventEmitter   = Observer.EventEmitter,
    setTimeout     = Timers.setTimeout,
    clearTimeout   = Timers.clearTimeout,
    debounce       = lodash.debounce,
    md5            = Util.md5,
    toPairsOrdered = Util.toPairsOrdered,
    testFlag       = Util.testFlag,
    setFlag        = Util.setFlag;

/*!
    \class TicTacToe
*/
export default function TicTacToe() {
}

var _ = 0,
    X = 1,
    O = 2;

TicTacToe.markText = function(mark) {
    return TicTacToe.markText[mark];
};

TicTacToe.markText[_] = ' ';
TicTacToe.markText[X] = 'X';
TicTacToe.markText[O] = 'O';

TicTacToe._ = _;
TicTacToe.X = X;
TicTacToe.O = O;

var Player1 = 0,
    Player2 = 1,
    MaxPlayers = 2;

TicTacToe.playerName = function(index) {
    if (index >= 0 && index < MaxPlayers)
        return 'Player ' + (index + 1);
    return '';
};

TicTacToe.playerClass = function(index) {
    if (index >= 0 && index < MaxPlayers)
        return 'player' + (index + 1);
    return '';
};

// common predicates for findPlayer function
TicTacToe.player1 = function(player) {
    return player.index === Player1;
};

TicTacToe.player2 = function(player) {
    return player.index === Player2;
};

TicTacToe.playerByIndex = function(index) {
    return function(player) {
        return player.index === index;
    };
};

TicTacToe.thisPlayer = function(thisPlayer) {
    return function(otherPlayer) {
        return thisPlayer.equals(otherPlayer);
    };
};

TicTacToe.otherPlayer = function(thisPlayer) {
    return function(otherPlayer) {
        return !thisPlayer.equals(otherPlayer);
    };
};

TicTacToe.Player1 = Player1;
TicTacToe.Player2 = Player2;
TicTacToe.MaxPlayers = MaxPlayers;

TicTacToe.DiscardState = 0;
TicTacToe.ProceedState = 1;
TicTacToe.WinState     = 2;
TicTacToe.DrawState    = 3;

TicTacToe.WaitingForPlayersState = 0;
TicTacToe.PlayersReadyState      = 1;
TicTacToe.MatchRunningState      = 2;
TicTacToe.MatchFinishedState     = 3;

TicTacToe.NotConnectedState = 0x0;
TicTacToe.ConnectedState    = 0x1;
TicTacToe.FindingMatchState = 0x2;
TicTacToe.GameRunningState  = 0x4;

TicTacToe.SoloMode        = 0;
TicTacToe.AiMode          = 1;
TicTacToe.MultiplayerMode = 2;

TicTacToe.availableGameModes = function() {
    return [
        { text: 'Play Solo',         value: TicTacToe.SoloMode },
        { text: 'Play with Ai',      value: TicTacToe.AiMode },
        { text: 'Find other Player', value: TicTacToe.MultiplayerMode }
    ];
};

/*!
    \class Grid
*/
function Grid() {
    this.cellChanged = message();
    this.cleared = message();
    this.clear();
}

Grid.Size = 3;

Grid.toIndex = function(row, column) {
    return row*Grid.Size + column;
};

Grid.toRow = function(index) {
    return Math.floor(index/Grid.Size);
};

Grid.toColumn = function(index) {
    return index%Grid.Size
};

Grid.restore = function(state) {
    var ret = new Grid();
    ret.restore(state);
    return ret;
};

Grid.prototype.clear = function() {
    this.cells = [_, _, _,
                  _, _, _,
                  _, _, _];
    this.blankCells = this.cells.length;
    this.cleared();
};

// [0, 1, 2,     [(0,0), (0,1), (0,2),
//  3, 4, 5, <=>  (1,0), (1,1), (1,2),
//  6, 7, 8]      (2,0), (2,1), (2,2)]

Grid.prototype.cellAt = function(row, column) {
    return this.cells[row*Grid.Size + column];
};

Grid.prototype.setCell = function(row, column, mark, playerIndex) {
    var index = row*Grid.Size + column;
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
};

Grid.prototype.isWinState = function(row, column, mark) {
    var rowEqual = true,
        columnEqual = true,
        majorDiagonalEqual = row === column,
        minorDiagonalEqual = (row + column === Grid.Size - 1);
    for (var k = 0; k < Grid.Size; k++) {
        rowEqual = rowEqual && this.cellAt(row, k) === mark;
        columnEqual = columnEqual && this.cellAt(k, column) === mark;
        majorDiagonalEqual = majorDiagonalEqual && this.cellAt(k, k) === mark;
        minorDiagonalEqual = minorDiagonalEqual && this.cellAt(k, Grid.Size - k - 1) === mark;
    }
    return rowEqual || columnEqual || majorDiagonalEqual || minorDiagonalEqual;
};

Grid.prototype.testWinState = function(row, column, mark) {
    var result = false;
    if (this.cellAt(row, column) === _) {
        var index = row*Grid.Size + column;
        this.cells[index] = mark;
        result = this.isWinState(row, column, mark);
        this.cells[index] = _;
    }
    return result;
};

Grid.prototype.dump = function() {
    return {
        cells: this.cells.map(function(cell) { return cell; })
    };
};

Grid.prototype.restore = function(state) {
    this.blankCells = 0;
    this.cells = state.cells.map(function(cell) {
        if (cell === _)
            this.blankCells++;
        return cell;
    }.bind(this));
};

Grid.prototype.debug = function() {
    var text = '',
        markText = {};
    markText[_] = '_';
    markText[X] = 'X';
    markText[O] = 'O';
    for (var i = 0; i < Grid.Size; i++) {
        for (var j = 0; j < Grid.Size; j++) {
            text += markText[this.cellAt(i, j)];
        }
        text += '\n';
    }
    return text;
}

TicTacToe.Grid = Grid;

/*!
    \class Player
*/
function Player(name) {
    this.match = null;
    this.index = -1;
    this.mark = _;
    if (Player.isReservedName(name))
        name = '';
    this.name = name || '';
    this.score = -1;
    this.moved = message();
    this.nameChanged = message();
    this.scoreChanged = message();
}

(function() {
    var reservedNames = {};
    reservedNames[TicTacToe.playerName(TicTacToe.Player1)] = true;
    reservedNames[TicTacToe.playerName(TicTacToe.Player2)] = true;

    Player.isReservedName = function(name) {
        return reservedNames[name];
    };
}());

Player.restore = function(state) {
    var ret = new Player();
    ret.restore(state);
    return ret;
};

Player.prototype.setMatch = function(match) {
    this.match = match;
};

Player.prototype.playerClass = function() {
    return TicTacToe.playerClass(this.index);
};

Player.prototype.setIndex = function(index) {
    this.index = index;
};

Player.prototype.setMark = function(mark) {
    this.mark = mark;
};

Player.prototype.markText = function() {
    return TicTacToe.markText(this.mark);
};

Player.prototype.setName = function(name) {
    if (Player.isReservedName(name))
        name = '';
    if (!name)
        name = TicTacToe.playerName(this.index);
    if (this.name !== name) {
        this.name = name;
        this.nameChanged(this);
    }
};

Player.prototype.setScore = function(score, force) {
    if (this.score !== score) {
        this.score = score;
        this.scoreChanged(this);
    }
};

Player.prototype.move = function(row, column) {
    console.log('Player.move()', this.index, row, column);
    this.moved(this, row, column);
};

Player.prototype.passMove = function() {
};

Player.prototype.isSelf = function() {
    return false;
};

Player.prototype.equals = function(other) {
    return this.index === other.index;
};

Player.prototype.dump = function() {
    return {
        index: this.index,
        mark: this.mark,
        name: this.name,
        score: this.score
    };
};

Player.prototype.restore = function(state) {
    this.index = state.index;
    this.mark = state.mark;
    this.name = state.name;
    this.score = state.score;
};

TicTacToe.Player = Player;

/*!
    \class AiPlayer
    \extends Player
*/
function AiPlayer(name, delay) {
    Player.call(this, name);
    this.delay = delay || AiPlayer.defaultMoveDelay;
}

AiPlayer.defaultMoveDelay = 300;

AiPlayer.moves = [4, 0, 2, 6, 8, 1, 3, 5, 7].map(function(index) {
    return { row: Grid.toRow(index), column: Grid.toColumn(index) };
});

AiPlayer.prototype = Object.create(Player.prototype);
AiPlayer.prototype.constructor = AiPlayer;

AiPlayer.prototype.findBestMove = function() {
    var bestMove,
        grid = this.match.grid,
        other = this.match.findPlayer(TicTacToe.otherPlayer(this));
    for (var i = 0; i < AiPlayer.moves.length; i++) {
        var move = AiPlayer.moves[i];
        if (grid.testWinState(move.row, move.column, this.mark))
            return move;
        if (grid.testWinState(move.row, move.column, other.mark))
            return move;
        if (grid.cellAt(move.row, move.column) === _ && !bestMove)
            bestMove = move;
    }
    return bestMove;
};

AiPlayer.prototype.move = function() {
    if (this.match.state === TicTacToe.GameOverState)
        Player.prototype.move.call(this);
};

AiPlayer.prototype.doMove = function() {
    var bestMove = this.findBestMove();
    if (bestMove)
        Player.prototype.move.call(this, bestMove.row, bestMove.column);
};

AiPlayer.prototype.passMove = function() {
    if (this.delay < 0) // direct call for testing purposes
        this.doMove();
    else
        setTimeout(this.doMove.bind(this), this.delay);
};

TicTacToe.AiPlayer = AiPlayer;

/*!
    \class Match
*/
function Match() {
    this.grid = new Grid();
    this.players = [];
    this.current = -1;
    this.state = TicTacToe.WaitingForPlayersState;
    this.stateChanged = message();
    this.movePassed = message();
    this.playerRemoved = message();
    this.move = this.move.bind(this);
}

Match.prototype.clear = function() {
    while (this.players.length !== 0)
        this.removePlayer(this.players[0]);
    this.grid.clear();
};

Match.prototype.setState = function(state, winner) {
    if (state !== this.state) {
        this.state = state;
        this.stateChanged(state, winner);
    }
};

Match.prototype.currentPlayer = function() {
    if (this.current >= 0 && this.current < this.players.length)
        return this.players[this.current];
};

Match.prototype.findPlayer = function(predicate) {
    return this.players.find(predicate);
};

Match.prototype.nextMove = function() {
    if (this.state !== TicTacToe.MatchRunningState)
        return;
    this.current++;
    if (this.current === this.players.length)
        this.current = 0;
    var player = this.currentPlayer();
    this.movePassed(player);
    player.passMove();
};

Match.prototype.start = function() {
    if (this.state === TicTacToe.MatchRunningState
        || this.players.length !== TicTacToe.MaxPlayers)
        return;
    this.grid.clear();
    this.setState(TicTacToe.MatchRunningState);
    this.current = -1;
    this.nextMove();
};

Match.prototype.addPlayer = function(player) {
    if (this.players.length === TicTacToe.MaxPlayers)
        return;
    player.setMatch(this);
    player.moved.subscribe(this.move);
    this.players.push(player);
    if (this.players.length === TicTacToe.MaxPlayers) {
        var player1 = this.players[0],
            player2 = this.players[1];
        player1.setMark(X);
        player1.setIndex(TicTacToe.Player1);
        player2.setMark(O);
        player2.setIndex(TicTacToe.Player2);
        this.setState(TicTacToe.PlayersReadyState);
        player1.setName(player1.name);
        player1.setScore(0);
        player2.setName(player2.name);
        player2.setScore(0);
        this.start();
    }
};

Match.prototype.removePlayer = function(player, cleared) {
    var index = this.players.indexOf(player);
    if (index !== -1) {
        var player = this.players.splice(index, 1)[0];
        player.moved.unsubscribe(this.move);
        player.setMatch(null);
        this.playerRemoved(player);
        if (this.players.length === 1) {
            this.current = 0;
            var winner = this.players[0];
            winner.setScore(winner.score + 1);
            this.setState(TicTacToe.MatchFinishedState, winner);
        }
        this.current = -1;
        this.setState(TicTacToe.WaitingForPlayersState);
    }
};

Match.prototype.move = function(player, row, column) {
    console.log('Match.move()', this.state, player.index, row, column, this.currentPlayer() === player);
    if (this.state === TicTacToe.MatchRunningState) {
        if (this.currentPlayer() === player) {
            var result = this.grid.setCell(row, column, player.mark, player.index);
            switch (result) {
            case TicTacToe.WinState:     player.setScore(player.score + 1); this.setState(TicTacToe.MatchFinishedState, player); this.current = -1; break;
            case TicTacToe.DrawState:    this.setState(TicTacToe.MatchFinishedState); this.current = -1; break;
            case TicTacToe.ProceedState: this.nextMove(); break;
            case TicTacToe.DiscardState: default: break;
            }
        }
    }
    else if (this.state === TicTacToe.MatchFinishedState) { // restarting with players order swapped
        this.players.push(this.players.shift());
        this.players[0].setMark(X);
        this.players[1].setMark(O);
        this.start();
    }
};

Match.prototype.dump = function() {
    return {
        index: this.grid.dump(),
        players: this.players.map(function(player) { return player.dump(); }),
        current: this.current,
        state: this.state
    };
};

Match.prototype.restore = function(state) {
    this.grid = Grid.restore(state.grid);
    this.players = state.players.map(function(player) { return Player.restore(player); });
    this.current = state.current;
    this.state = state.state;
};

TicTacToe.Match = Match;

/*!
    \class PlayerInfo
*/
function PlayerInfo(name, self) {
    this.name = name || '';
    this.self = self || false;
}

PlayerInfo.restore = function(state) {
    var ret = new PlayerInfo();
    ret.restore(state);
    return ret;
};

PlayerInfo.prototype.dump = function() {
    return {
        name: this.name,
        self: this.self
    };
};

PlayerInfo.prototype.restore = function(state) {
    this.name = state.name;
    this.self = state.self;
};

TicTacToe.PlayerInfo = PlayerInfo;

/*!
    \class Action
*/
function Action() {
}

(function() {
    var constructors = {};

    Action.register = function(constructor) {
        if (!constructors.hasOwnProperty(constructor.type))
            constructors[constructor.type] = constructor;
    };

    Action.create = function(name) {
        if (constructors.hasOwnProperty(name))
            return new (Function.prototype.bind.apply(constructors[name], arguments))();
    };

    Action.deserialize = function(state) {
        if (constructors.hasOwnProperty(state.type)) {
            var obj = new constructors[state.type]();
            obj.restore(state);
            return obj;
        }
    };

    Action.parse = function(text, reviver) {
        return Action.deserialize(JSON.parse(text, reviver));
    };
}());

Action.prototype.type = function() {
    return this.constructor.type;
};

Action.prototype.dump = function() {
    return {};
};

Action.prototype.serialize = function() {
    var state = this.dump();
    state.type = this.type();
    return state;
};

Action.prototype.restore = function(state) {
};

Action.prototype.stringify = function(replacer, space) {
    return JSON.stringify(this.serialize(), replacer, space);
};

TicTacToe.Action = Action;

/*!
    \class FindMatchAction
    \extends Action
*/
function FindMatchAction(playerName) {
    Action.call(this);
    this.playerName = playerName;
}

FindMatchAction.type = 'findMatch';

FindMatchAction.prototype = Object.create(Action.prototype);
FindMatchAction.prototype.constructor = FindMatchAction;

Action.register(FindMatchAction);

FindMatchAction.prototype.dump = function() {
    var state = Action.prototype.dump.call(this);
    state.playerName = this.playerName;
    return state;
};

FindMatchAction.prototype.restore = function(state) {
    this.playerName = state.playerName;
};

/*!
    \class MatchFoundAction
    \extends Action
*/
function MatchFoundAction(playersInfo) {
    Action.call(this);
    this.playersInfo = playersInfo;
}

MatchFoundAction.type = 'matchFound';

MatchFoundAction.prototype = Object.create(Action.prototype);
MatchFoundAction.prototype.constructor = MatchFoundAction;

Action.register(MatchFoundAction);

MatchFoundAction.prototype.dump = function() {
    var state = Action.prototype.dump.call(this);
    state.playersInfo = this.playersInfo.map(function(playerInfo) { return playerInfo.dump(); });
    return state;
};

MatchFoundAction.prototype.restore = function(state) {
    this.playersInfo = state.playersInfo.map(function(playerInfo) { return PlayerInfo.restore(playerInfo); });
};

/*!
    \class UpdatePlayerAction
    \extends Action
*/
function UpdatePlayerAction(playerIndex, propertyName, propertyValue) {
    Action.call(this);
    this.playerIndex = playerIndex;
    this.propertyName = propertyName;
    this.propertyValue = propertyValue;
}

UpdatePlayerAction.type = 'updatePlayer';

UpdatePlayerAction.prototype = Object.create(Action.prototype);
UpdatePlayerAction.prototype.constructor = UpdatePlayerAction;

Action.register(UpdatePlayerAction);

UpdatePlayerAction.prototype.dump = function() {
    var state = Action.prototype.dump.call(this);
    state.playerIndex = this.playerIndex;
    state.propertyName = this.propertyName;
    state.propertyValue = this.propertyValue;
    return state;
};

UpdatePlayerAction.prototype.restore = function(state) {
    this.playerIndex = state.playerIndex;
    this.propertyName = state.propertyName;
    this.propertyValue = state.propertyValue;
};

/*!
    \class MovePlayerAction
    \extends Action
*/
function MovePlayerAction(playerIndex, row, column) {
    Action.call(this);
    this.playerIndex = playerIndex;
    this.row = row;
    this.column = column;
}

MovePlayerAction.type = 'movePlayer';

MovePlayerAction.prototype = Object.create(Action.prototype);
MovePlayerAction.prototype.constructor = MovePlayerAction;

Action.register(MovePlayerAction);

MovePlayerAction.prototype.dump = function() {
    var state = Action.prototype.dump.call(this);
    state.playerIndex = this.playerIndex;
    state.row = this.row;
    state.column = this.column;
    return state;
};

MovePlayerAction.prototype.restore = function(state) {
    this.playerIndex = state.playerIndex;
    this.row = state.row;
    this.column = state.column;
};

/*!
    \class QuitAction
    \extends Action
*/
function QuitAction(playerIndex, code) {
    Action.call(this);
    this.playerIndex = playerIndex;
    this.code = code || QuitAction.Normal;
}

QuitAction.type = 'quit';

QuitAction.prototype = Object.create(Action.prototype);
QuitAction.prototype.constructor = QuitAction;

Action.register(QuitAction);

QuitAction.Normal         = 0;
QuitAction.Disconnected   = 1;
QuitAction.Desynchronized = 2;

QuitAction.prototype.dump = function() {
    var state = Action.prototype.dump.call(this);
    state.playerIndex = this.playerIndex;
    state.code = this.code;
    return state;
};

QuitAction.prototype.restore = function(state) {
    this.playerIndex = state.playerIndex;
    this.code = state.code;
};

/*!
    \class SyncAction
    \extends Action
*/
function SyncAction(match, player) {
    Action.call(this);
    if (match) {
        this.playerIndex = player.index;
        this.stateHash = SyncAction.getStateHash(match);
        var current = match.currentPlayer();
        this.current = current ? current.index : -1;
    }
}

SyncAction.getStateHash = function(match) {
    var state = match.dump();
    state.players.forEach(function(player) {
        delete player.name; // don't care about names
    });
    return md5(JSON.stringify(toPairsOrdered(state)));
};

SyncAction.type = 'sync';

SyncAction.prototype = Object.create(Action.prototype);
SyncAction.prototype.constructor = SyncAction;

Action.register(SyncAction);

SyncAction.prototype.dump = function() {
    var state = Action.prototype.dump.call(this);
    state.playerIndex = this.playerIndex;
    state.stateHash = this.stateHash;
    state.current = this.current;
    return state;
};

SyncAction.prototype.restore = function(state) {
    this.playerIndex = state.playerIndex;
    this.stateHash = state.stateHash;
    this.current = state.current;
};

/*!
    \class ProxyPlayer
    \extends Player
*/
function ProxyPlayer(gameClient, player, nameReadOnly) {
    Player.call(this, player.name);

    this.nameReadOnly = nameReadOnly || false;

    var setName = lodash.debounce(function(name) {
        this.nameLocked = false;
        ProxyPlayer.prototype.setName.call(this, name);
    }.bind(this), ProxyPlayer.DebounceInterval);
    this.nameLocked = false;
    this.setName = function(name) {
        this.nameLocked = true;
        setName(name);
    }.bind(this);
    this.updateName = function(name) {
        if (!this.nameLocked)
            Player.prototype.setName.call(this, name);
    }.bind(this);
    this.updateScore = Player.prototype.setScore.bind(this);

    this.handleNameChanged  = this.handleNameChanged.bind(this);
    this.handleScoreChanged = this.handleScoreChanged.bind(this);
    this.handleMoved        = this.handleMoved.bind(this);

    this.setPlayer(player);
    this.setGameClient(gameClient);
}

ProxyPlayer.DebounceInterval = 400;

ProxyPlayer.prototype = Object.create(Player.prototype);
ProxyPlayer.prototype.constructor = ProxyPlayer;

ProxyPlayer.prototype.setGameClient = function(gameClient) {
    this.gameClient = gameClient;
};

ProxyPlayer.prototype.setPlayer = function(player) {
    if (this.player != null) {
        this.player.nameChanged.unsubscribe(this.handleNameChanged);
        this.player.scoreChanged.unsubscribe(this.handleScoreChanged);
        this.player.moved.unsubscribe(this.handleMoved);
    }
    this.player = player;
    if (this.player != null) {
        this.player.nameChanged.subscribe(this.handleNameChanged);
        this.player.scoreChanged.subscribe(this.handleScoreChanged);
        this.player.moved.subscribe(this.handleMoved);
    }
};

ProxyPlayer.prototype.setMatch = function(match) {
    Player.prototype.setMatch.call(this, match);
    this.player.setMatch(match);
};

ProxyPlayer.prototype.setIndex = function(index) {
    Player.prototype.setIndex.call(this, index);
    this.player.setIndex(index);
};

ProxyPlayer.prototype.setMark = function(mark) {
    Player.prototype.setMark.call(this, mark);
    this.player.setMark(mark);
};

ProxyPlayer.prototype.setName = function(name) {
    console.log('ProxyPlayer.setName()', this.name, name, this.nameReadOnly);
    if (this.nameReadOnly && this.name) {
        if (name !== this.player.name) // discard
            this.nameChanged(this.player.name);
        return;
    }
    this.player.setName(name);
};

ProxyPlayer.prototype.handleNameChanged = function(player) {
    this.gameClient.updatePlayer(this, 'name', player.name);
};

ProxyPlayer.prototype.setScore = function(score) {
    console.log('ProxyPlayer.setScore()', score, this.player.score);
    this.player.setScore(score);
};

ProxyPlayer.prototype.handleScoreChanged = function(player) {
    this.gameClient.updatePlayer(this, 'score', player.score);
};

ProxyPlayer.prototype.updatePlayer = function(action) {
    console.log('ProxyPlayer.updatePlayer()', this.index, action.propertyName, action.propertyValue);
    switch (action.propertyName) {
    case 'name' : this.updateName(action.propertyValue) ; break;
    case 'score': this.updateScore(action.propertyValue); break;
    default: break;
    }
};

ProxyPlayer.prototype.passMove = function() {
    this.player.passMove();
};

ProxyPlayer.prototype.move = function(row, column) {
    this.player.move(row, column);
};

ProxyPlayer.prototype.handleMoved = function(player, row, column) {
    this.gameClient.movePlayer(this, row, column);
};

ProxyPlayer.prototype.movePlayer = function(action) {
    console.log('ProxyPlayer.movePlayer()', action);
    this.moved(this, action.row, action.column);
};

ProxyPlayer.prototype.isSelf = function() {
    return this.gameClient.player === this.player;
};

TicTacToe.ProxyPlayer = ProxyPlayer;

/*
    \class StatusQueue
*/
function StatusQueue(parent) {
    this.parent = parent;
    parent.showStatus = message();
    parent.hideStatus = message();
    this.queue = [];
    this.locked = false;
    this.minDisplayTime = StatusQueue.MinDisplayTime;
    this.maxDisplayTime = StatusQueue.MaxDisplayTime;
    this.unlock = this.unlock.bind(this);
}

StatusQueue.MinDisplayTime = 500;
StatusQueue.MaxDisplayTime = 3000;

StatusQueue.prototype.lock = function() {
    this.locked = true;
    setTimeout(this.unlock, this.minDisplayTime);
};

StatusQueue.prototype.unlock = function() {
    this.locked = false;
    this.pop();
};

StatusQueue.prototype.startHideTimer = function() {
    if (this.timerId == null) {
        this.timerId = setTimeout(function() {
            this.parent.hideStatus();
            this.timerId = null;
        }.bind(this), this.maxDisplayTime);
    }
};

StatusQueue.prototype.stopHideTimer = function() {
    if (this.timerId != null) {
        clearTimeout(this.timerId);
        this.timerId = null;
    }
};

StatusQueue.prototype.push = function(status) {
    this.queue.push(status);
    this.pop();
};

StatusQueue.prototype.pop = function() {
    if (this.locked)
        return;
    var status = this.queue.shift();
    if (!status)
        return;
    this.parent.showStatus(status);
    this.lock();
    this.stopHideTimer();
    if (!status.permanent)
        this.startHideTimer();
};

/*!
    \class GameClient
    \extends EventEmitter
*/
function GameClient(url) {
    EventEmitter.call(this);

    this.url = url;
    this.state = TicTacToe.NotConnectedState;

    this.matchReady = message();
    this.stateChanged = message();

    this.statusQueue = new StatusQueue(this);

    this.removePlayer = this.removePlayer.bind(this);

    this.setMatch(new Match());
    this.setPlayer(new Player());

    this.handleOpen    = this.handleOpen.bind(this);
    this.handleClose   = this.handleClose.bind(this);
    this.handleError   = this.handleError.bind(this)
    this.handleMessage = this.handleMessage.bind(this);

    this.handleMatchFound   = this.handleMatchFound.bind(this);
    this.handleUpdatePlayer = this.handleUpdatePlayer.bind(this);
    this.handleMovePlayer   = this.handleMovePlayer.bind(this);
    this.handleQuitPlayer   = this.handleQuitPlayer.bind(this);

    this.on('matchFound',   this.handleMatchFound);
    this.on('updatePlayer', this.handleUpdatePlayer);
    this.on('movePlayer',   this.handleMovePlayer);
    this.on('quit',         this.handleQuitPlayer);
}

GameClient.ReconnectInterval = 5000;

GameClient.prototype = Object.create(EventEmitter.prototype);
GameClient.prototype.constructor = GameClient;

GameClient.prototype.connect = function() {
    if (this.socket == null) {
        this.statusQueue.push({ text: 'Connecting to server...', permanent: true });
        this.socket = new WebSocket(this.url);
        this.socket.addEventListener('open',    this.handleOpen);
        this.socket.addEventListener('close',   this.handleClose);
        this.socket.addEventListener('error',   this.handleError);
        this.socket.addEventListener('message', this.handleMessage);
        this.closed = false;
    }
};

GameClient.prototype.disconnect = function() {
    if (this.socket != null) {
        this.closed = true;
        this.socket.close();
    }
};

GameClient.prototype.reconnect = function() {
    setTimeout(this.connect.bind(this), GameClient.ReconnectInterval);
};

GameClient.prototype.setState = function(stateFlag, on) {
    var state = setFlag(this.state, stateFlag, on);
    if (this.state !== state) {
        this.state = state;
        this.stateChanged(this.state);
    }
};

GameClient.prototype.testState = function(stateFlag) {
    return testFlag(this.state, stateFlag);
};

GameClient.prototype.setMode = function(mode) {
    if (this.mode !== mode) {
        switch (mode) {
        case TicTacToe.SoloMode:        this.startMatch([this.player, new Player()]); break;
        case TicTacToe.AiMode:          this.startMatch([this.player, new AiPlayer()]); break;
        case TicTacToe.MultiplayerMode: this.startMatch([new ProxyPlayer(this, this.player)]); this.findMatch(); break;
        default: break;
        }
        this.mode = mode;
    }
};

GameClient.prototype.handleOpen = function(e) {
    console.log('GameClient.handleOpen()');
    if (!this.testState(TicTacToe.ConnectedState)) {
        this.statusQueue.push({ text: 'Connection established.' });
        this.setState(TicTacToe.ConnectedState, true);
        if (this.testState(TicTacToe.GameRunningState)) {
            this.setState(TicTacToe.GameRunningState, false);
            this.setState(TicTacToe.FindingMatchState, true);
        }
        if (this.testState(TicTacToe.FindingMatchState)) {
            this.setState(TicTacToe.FindingMatchState, false);
            this.findMatch();
        }
    }
};

GameClient.prototype.handleClose = function(e) {
    if (this.testState(TicTacToe.ConnectedState)) {
        console.log('GameClient.handleClose()', e);
        this.setState(TicTacToe.ConnectedState, false);
        this.statusQueue.push({ text: 'Connection closed.' });
    }
    if (this.socket != null) {
        this.socket.removeEventListener('open',    this.handleOpen);
        this.socket.removeEventListener('close',   this.handleClose);
        this.socket.removeEventListener('error',   this.handleError);
        this.socket.removeEventListener('message', this.handleMessage);
        if (this.socket.destroy) // qt only
            this.socket.destroy();
        delete this.socket;
    }
    if (!this.closed)
        this.reconnect();
};

GameClient.prototype.handleError = function(e) {
    console.error('GameClient.handleError()', e);
};

GameClient.prototype.handleMessage = function(e) {
    try {
        var action = Action.parse(e.data);
        console.log('GameClient.handleMessage()', e.data, action);
        this.emit(action.type(), action);
    }
    catch (err) {
        console.error('GameClient.handleMessage()', err);
    }
};

GameClient.prototype.send = function(action) {
    if (this.testState(TicTacToe.ConnectedState)) {
        var data = action.stringify();
        console.log('GameClient.send()', data, action);
        this.socket.send(data);
    }
};

GameClient.prototype.setMatch = function(match) {
    if (this.match != null) {
        this.match.playerRemoved.unsubscribe(this.removePlayer);
    }
    this.match = match;
    if (this.match != null) {
        this.match.playerRemoved.subscribe(this.removePlayer);
    }
};

GameClient.prototype.startMatch = function(players) {
    this.match.clear();
    this.matchReady(this.match);
    players.forEach(function(player) {
        this.match.addPlayer(player);
    }.bind(this));
};

GameClient.prototype.setPlayer = function(player) {
    this.player = player;
};

GameClient.prototype.removePlayer = function(player) {
    console.log('GameClient.removePlayer()', player, this.player, player instanceof ProxyPlayer, player.equals(this.player));
    if (player instanceof ProxyPlayer) {
        if (player.player === this.player
            && !(this.testState(TicTacToe.GameRunningState | TicTacToe.FindingMatchState, true))) // matchFoundState
            this.quit();
        player.setPlayer();
    }
};

GameClient.prototype.findMatch = function() {
    console.log('GameClient.findMatch()', this.state);
    if (this.testState(TicTacToe.FindingMatchState)
        || this.testState(TicTacToe.GameRunningState))
        return;
    this.setState(TicTacToe.FindingMatchState, true);
    if (!this.testState(TicTacToe.ConnectedState)) {
        this.connect();
        return;
    }
    this.statusQueue.push({ text: 'Finding match...', permanent: true });
    this.send(Action.create('findMatch', this.player.name));
};

GameClient.prototype.updatePlayer = function(player, propertyName, propertyValue) {
    console.log('GameClient.updatePlayer()', player, propertyName, propertyValue);
    this.send(Action.create('updatePlayer', player.index, propertyName, propertyValue));
};

GameClient.prototype.movePlayer = function(player, row, column) {
    console.log('GameClient.movePlayer()', player, row, column);
    if (this.testState(TicTacToe.GameRunningState))
        this.send(Action.create('movePlayer', player.index, row, column));
    else
        this.findMatch();
};

GameClient.prototype.quit = function() {
    console.log('GameClient.quit()', this.state);
    this.statusQueue.push({ text: 'Quit match.' });
    this.send(Action.create('quit', this.player.index));
    this.setState(TicTacToe.GameRunningState, false);
    this.setState(TicTacToe.FindingMatchState, false);
    this.disconnect();
};

GameClient.prototype.sync = function() {
    console.log('GameClient.sync()');
    this.send(Action.create('sync', this.match, this.player));
};

GameClient.prototype.move  = function(row, column) {
    console.log('GameClient.move()', row, column);
    var player = this.match.currentPlayer() || this.player;
    player.move(row, column);
};

GameClient.prototype.handleMatchFound = function(action) {
    this.statusQueue.push({ text: 'Match found.' });
    this.setState(TicTacToe.GameRunningState, true);
    var players = action.playersInfo.map(function(playerInfo) {
        return new ProxyPlayer(this, playerInfo.self ? this.player : new Player(playerInfo.name), !playerInfo.self);
    }.bind(this));
    this.startMatch(players);
    this.setState(TicTacToe.FindingMatchState, false);
    this.sync();
};

GameClient.prototype.handleUpdatePlayer = function(action) {
    var player = this.match.findPlayer(TicTacToe.playerByIndex(action.playerIndex));
    if (player)
        player.updatePlayer(action);
};

GameClient.prototype.handleMovePlayer = function(action) {
    var player = this.match.findPlayer(TicTacToe.playerByIndex(action.playerIndex));
    if (player)
        player.movePlayer(action);
    this.sync();
};

GameClient.prototype.handleQuitPlayer = function(action) {
    var player = this.match.findPlayer(TicTacToe.playerByIndex(action.playerIndex));
    console.log('GameClient.handleQuitPlayer()', action, player);
    if (player) {
        this.statusQueue.push({ text: 'Player ' + player.name + ' left.' });
        this.match.removePlayer(player);
        this.setState(TicTacToe.GameRunningState, false);
        this.findMatch();
    }
};

TicTacToe.GameClient = GameClient;

/*!
    \class ServerClient
    \extends EventEmitter
*/
function ServerClient(server, socket) {
    console.log('ServerClient()');

    EventEmitter.call(this);

    this.server      = server;
    this.socket      = socket;
    this.match       = null;
    this.playerName  = '';
    this.playerIndex = -1;

    this.handleClose   = this.handleClose.bind(this);
    this.handleMessage = this.handleMessage.bind(this)

    socket.on('close',   this.handleClose);
    socket.on('message', this.handleMessage);

    this.on('findMatch',    this.handleFindMatch.bind(this));
    this.on('updatePlayer', this.handleUpdatePlayer.bind(this));
    this.on('movePlayer',   this.handleMove.bind(this));
    this.on('quit',         this.handleQuit.bind(this));
    this.on('sync',         this.handleSync.bind(this));
}

ServerClient.prototype = Object.create(EventEmitter.prototype);
ServerClient.prototype.constructor = ServerClient;

ServerClient.prototype.handleClose = function() {
    console.log('ServerClient.handleClose()');
    if (this.match)
        this.match.quitPlayer(this, QuitAction.Disconnected);
    this.server.removeClient(this);
    this.socket.removeListener('close',   this.handleClose);
    this.socket.removeListener('message', this.handleMessage);
    this.socket = null;
};

ServerClient.prototype.handleMessage = function(data) {
    try {
        var action = Action.parse(data);
        console.log('ServerClient.handleMessage()', data, action);
        this.emit(action.type(), action);
    }
    catch (err) {
        console.error('ServerClient.handleMessage()', err);
    }
};

ServerClient.prototype.send = function(action) {
    if (this.socket.readyState !== WebSocket.OPEN)
        return;
    var data = action.stringify();
    console.log('ServerClient.send()', data, action);
    this.socket.send(data);
};

ServerClient.prototype.handleFindMatch = function(action) {
    this.server.findMatch(this, action);
};

ServerClient.prototype.handleUpdatePlayer = function(action) {
    if (this.match)
        this.match.updatePlayer(this, action);
    else {
        if (action.propertyName === 'name')
            this.playerName = action.propertyValue;
        this.send(action);
    }
};

ServerClient.prototype.handleMove = function(action) {
    if (this.match)
        this.match.movePlayer(this, action);
};

ServerClient.prototype.handleQuit = function(action) {
    if (this.match)
        this.match.quitPlayer(this, action);
};

ServerClient.prototype.handleSync = function(action) {
    if (this.match)
        this.match.syncPlayer(this, action);
};

ServerClient.prototype.matchFound = function(playersInfo) {
    console.log('ServerClient.matchFound()', playersInfo);
    this.send(Action.create('matchFound', playersInfo));
};

ServerClient.prototype.quit = function(code) {
    console.log('ServerClient.quit()', this.playerIndex, code);
    this.send(Action.create('quit', this.playerIndex, code));
    this.playerIndex = -1;
};

/*!
    \class ServerMatch
*/
function ServerMatch(server, clients) {
    console.log('ServerMatch()');
    this.server = server;
    this.clients = clients;
    this.current = -1;
    this.syncActions = {};
    this.state = ServerMatch.InitState;
    if (this.clients.length === TicTacToe.MaxPlayers) {
        this.clients.forEach(function(client) {
            client.match = this;
            var playersInfo = this.clients.map(function(otherClient) {
                return new PlayerInfo(otherClient.playerName, client === otherClient);
            });
            client.matchFound(playersInfo);
        }.bind(this));
        this.state = ServerMatch.SyncState;
    }
}

ServerMatch.InitState = 0;
ServerMatch.SyncState = 1;
ServerMatch.MoveState = 1;

ServerMatch.prototype.updatePlayer = function(client, action) {
    this.clients.forEach(function(otherClient) {
        otherClient.send(action);
    });
};

ServerMatch.prototype.movePlayer = function(client, action) {
    console.log('ServerMatch.movePlayer()', client.playerIndex, action.playerIndex);
    if (this.state === ServerMatch.MoveState
        && (this.current === client.playerIndex || this.current === -1)) { // this.current === -1 for game over state
        this.clients.forEach(function(otherClient) {
            otherClient.send(action);
        });
        this.state = ServerMatch.SyncState;
    }
};

ServerMatch.prototype.syncPlayer = function(client, action) {
    if (this.state === ServerMatch.SyncState) {
        var index = this.clients.indexOf(client);
        if (index !== -1) {
            client.playerIndex = action.playerIndex;
            this.syncActions[index] = action;
            if (Object.keys(this.syncActions).length === this.clients.length) {
                for (var i = 1; i < this.clients.length; i++) {
                    var prevAction = this.syncActions[i - 1],
                        currAction = this.syncActions[i];
                    if (prevAction.stateHash !== currAction.stateHash) {
                        console.error('ServerMatch.syncPlayer(): state desynchronized.', prevAction, currAction);
                        this.clients.forEach(function(client) {
                            client.quit(QuitAction.Desynchronized);
                        });
                        this.close();
                        return;
                    }
                }
                console.log('ServerMatch.syncPlayer(): state synchronized.');
                this.current = action.current;
                this.syncActions = {};
                this.state = ServerMatch.MoveState;
            }
        }
    }
};

ServerMatch.prototype.quitPlayer = function(client, code) {
    var index = this.clients.indexOf(client);
    console.log('ServerMatch.quitPlayer()', index, client.playerIndex);
    if (index !== -1) {
        this.clients.splice(index, 1);
        this.clients.forEach(function(otherClient) {
            otherClient.send(Action.create('quit', client.playerIndex, code));
        });
        this.close();
        client.quit(code);
    }
};

ServerMatch.prototype.close = function() {
    console.log('ServerMatch.close()');
    this.clients.forEach(function(client) {
        client.match = null;
    });
    this.clients = [];
    this.server = null;
    this.current = -1;
    this.syncActions = {};
    this.state = ServerMatch.InitState;
};

/*!
    \class GameServer
*/
function GameServer(httpServer) {
    console.log('GameServer()');
    this.socketServer = new WebSocket.Server({ server: httpServer });
    this.socketServer.on('connection', this.handleConnection.bind(this));
    this.findingQueue = [];
}

GameServer.prototype.handleConnection = function(socket) {
    console.log('GameServer.handleConnection()');
    new ServerClient(this, socket);
};

GameServer.prototype.findMatch = function(client, action) {
    console.log('GameServer.findMatch()', action);
    client.playerName = action.playerName;
    this.findingQueue.push(client);
    if (this.findingQueue.length < TicTacToe.MaxPlayers)
        return;
    var clients = [],
        count = TicTacToe.MaxPlayers;
    while (count-- > 0)
        clients.push(this.findingQueue.shift());
    new ServerMatch(this, clients);
};

GameServer.prototype.removeClient = function(client) {
    var index = this.findingQueue.indexOf(client);
    console.log('GameServer.removeClient()', index);
    if (index !== -1)
        this.findingQueue.splice(index, 1);
};

TicTacToe.GameServer = GameServer;
