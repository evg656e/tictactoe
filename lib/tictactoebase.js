import EventEmitter from 'events';
import debounce     from 'lodash/debounce';
import signal       from './signal.js';
import md5          from './md5.js';

console.log('defining TicTacToe');

// some polyfills

if (!EventEmitter.prototype.off)
    EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

//! \see https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex
if (!Array.prototype.findIndex) {
    Array.prototype.findIndex = function(predicate) {
        if (this == null) {
            throw new TypeError('Array.prototype.findIndex called on null or undefined');
        }
        if (typeof predicate !== 'function') {
            throw new TypeError('predicate must be a function');
        }
        var list = Object(this);
        var length = list.length >>> 0;
        var thisArg = arguments[1];
        var value;

        for (var i = 0; i < length; i++) {
            value = list[i];
            if (predicate.call(thisArg, value, i, list)) {
                return i;
            }
        }
        return -1;
    };
}

//! \see https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Array/find
if (!Array.prototype.find) {
    Array.prototype.find = function(predicate) {
        if (this == null) {
            throw new TypeError('Array.prototype.find called on null or undefined');
        }
        if (typeof predicate !== 'function') {
            throw new TypeError('predicate must be a function');
        }
        var list = Object(this);
        var length = list.length >>> 0;
        var thisArg = arguments[1];
        var value;

        for (var i = 0; i < length; i++) {
            value = list[i];
            if (predicate.call(thisArg, value, i, list)) {
                return value;
            }
        }
        return undefined;
    };
}

//! \see http://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format
if (!String.prototype.format) {
    String.prototype.format = function() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] !== 'undefined' ? args[number] : match;
        });
    };
}

//! \see https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith
if (!String.prototype.startsWith) {
    Object.defineProperty(String.prototype, 'startsWith', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function(searchString, position) {
            position = position || 0;
            return this.lastIndexOf(searchString, position) === position;
        }
    });
}

//! \see https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith
if (!String.prototype.endsWith) {
    Object.defineProperty(String.prototype, 'endsWith', {
        value: function(searchString, position) {
            var subjectString = this.toString();
            if (position === undefined || position > subjectString.length) {
                position = subjectString.length;
            }
            position -= searchString.length;
            var lastIndex = subjectString.indexOf(searchString, position);
            return lastIndex !== -1 && lastIndex === position;
        }
    });
}

//    function toPairsOrdered(arg) {
//        switch (Object.prototype.toString.call(arg)) {
//        case '[object Object]': return Object.keys(arg).map(function(key) { var pair = {}; pair[key] = toPairsOrdered(arg[key]); return pair; }).sort(function(lhs, rhs) { return Object.keys(lhs)[0].localeCompare(Object.keys(rhs)[0]); });
//        case '[object Array]' : return arg.map(function(val) { return toPairsOrdered(val); });
//        default:                return arg;
//        }
//    }

function toPairsOrdered(arg) {
    switch (Object.prototype.toString.call(arg)) {
    case '[object Object]': return Object.keys(arg).map(function(key) { return [key, toPairsOrdered(arg[key])]; }).sort(function(lhs, rhs) { return lhs[0].localeCompare(rhs[0]); });
    case '[object Array]' : return arg.map(function(val) { return toPairsOrdered(val); });
    default:                return arg;
    }
}

/*!
    \class TicTacToe
*/
export default function TicTacToe() {
}

TicTacToe.toPairsOrdered = toPairsOrdered; // for test

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
    this.cellChanged = signal();
    this.cleared = signal();
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
    this.moved = signal();
    this.nameChanged = signal();
    this.scoreChanged = signal();
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
    this.stateChanged = signal();
    this.movePassed = signal();
    this.playerRemoved = signal();
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
    player.moved.connect(this.move);
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
        player.moved.disconnect(this.move);
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

TicTacToe.QuitAction = QuitAction;

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

    var setName = debounce(function(name) {
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
        this.player.nameChanged.disconnect(this.handleNameChanged);
        this.player.scoreChanged.disconnect(this.handleScoreChanged);
        this.player.moved.disconnect(this.handleMoved);
    }
    this.player = player;
    if (this.player != null) {
        this.player.nameChanged.connect(this.handleNameChanged);
        this.player.scoreChanged.connect(this.handleScoreChanged);
        this.player.moved.connect(this.handleMoved);
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
