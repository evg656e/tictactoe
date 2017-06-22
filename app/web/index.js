import signal    from '../../lib/signal.js';
import TicTacToe from '../../lib/tictactoeclient.js';

/*!
    \fn parseUrl
    \see http://stackoverflow.com/a/15979390/2895579

    var result = parseUrl("http://example.com:3000");
    result.protocol; // => "http:"
    result.host;     // => "example.com:3000"
    result.hostname; // => "example.com"
    result.port;     // => "3000"
    result.pathname; // => "/pathname/"
    result.hash;     // => "#hash"
    result.search;   // => "?search=test"
    result.origin;   // => "http://example.com:3000"
*/
function parseUrl(url) {
    var a = document.createElement('a');
    a.href = url;
    return a;
}

function getWebSocketUrl(url) {
    var url = parseUrl(url);
    return (url.protocol === 'https:' ? 'wss://' : 'ws://') + url.host;
}

var svgNS = 'http://www.w3.org/2000/svg';

function createSvgElement(name, attributes) {
    var element = document.createElementNS(svgNS, name);
    for (var attrName in attributes) {
        var attrValue = attributes[attrName];
        element.setAttribute(attrName, attrValue);
    }
    return element;
}

function createMarkSvgElement(mark, width, height, strokeWidth) {
    strokeWidth = strokeWidth || 1;
    var ret = createSvgElement('svg', { 'width': width, 'height': height, 'class': 'mark' }),
        style = 'stroke-width: ' + strokeWidth,
        offset = Math.floor(strokeWidth/2),
        left  = offset,
        right = width - offset,
        top   = offset,
        bottom = height - offset;
    if (mark === TicTacToe.X) {
        ret.appendChild(createSvgElement('line', { 'x1': left,  'y1': top, 'x2': right, 'y2': bottom, 'style': style }));
        ret.appendChild(createSvgElement('line', { 'x1': right, 'y1': top, 'x2': left,  'y2': bottom, 'style': style }));
    }
    else if (mark === TicTacToe.O) {
        ret.appendChild(createSvgElement('circle', { 'cx': width/2, 'cy': height/2, 'r': width/2 - offset - 1, 'style': style }));
    }
    return ret;
}

function getElementComputedSize(element) {
    var style = getComputedStyle(element),

        paddingWidth  = parseFloat(style.paddingLeft)     + parseFloat(style.paddingRight),
        paddingHeight = parseFloat(style.paddingTop)      + parseFloat(style.paddingBottom),
        borderWidth   = parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth),
        borderHeight  = parseFloat(style.borderTopWidth)  + parseFloat(style.borderBottomWidth);

    return {
        width:  element.offsetWidth  - paddingWidth  - borderWidth,
        height: element.offsetHeight - paddingHeight - borderHeight
    };
}

function addClass(element, className) {
    var classList = element.getAttribute('class').split(' ');
    classList.push(className);
    element.setAttribute('class', classList.join(' '));
}

function setVisibility(element, visible) {
    element.style.visibility = visible ? 'visible' : 'hidden';
}

function setDisplay(element, display) {
    element.style.display = display ? display : 'none';
}

var dotsAnimation = (function(delay) {
    var elements = [],
        timerId;

    function animateDots() {
        elements.forEach(function(element) {
            var text = element.textContent;
            if (text.endsWith('...'))
                text = text.substr(0, text.length - '...'.length);
            else if (text.endsWith('..'))
                text = text.substr(0, text.length - '..'.length) + '...';
            else if (text.endsWith('.'))
                text = text.substr(0, text.length - '.'.length) + '..';
            else
                text += '.';
            element.textContent = text;
        });
    }

    function insertElement(element) {
        if (!element)
            return;
        if (elements.length === 0)
            timerId = setInterval(animateDots, delay);
        elements.push(element);
    }

    function removeElement(element) {
        if (!element)
            return;
        var index = elements.indexOf(element);
        if (index !== -1) {
            elements.splice(index, 1);
            if (elements.length === 0)
                clearInterval(timerId);
        }
    }

    return {
        acquireAll: function(parent) {
            Array.prototype.forEach.call(parent.querySelectorAll('.dots'), function(element) {
                insertElement(element);
            });
        },
        acquire: function(parent) {
            insertElement(parent.querySelector('.dots'));
        },
        releaseAll: function(parent) {
            Array.prototype.forEach.call(parent.querySelectorAll('.dots'), function(element) {
                removeElement(element);
            });
        },
        release: function(parent) {
            removeElement(parent.querySelector('.dots'));
        }
    };
}(500));

/*!
    \class GridView
*/
function GridView(props) {
    props = props || {};
    this.cellClicked = signal();
    this.strokeWidth = props.strokeWidth || 4;
    this.updateCell = this.updateCell.bind(this);
    this.updateGrid = this.updateGrid.bind(this);
}

GridView.prototype.updateCell = function(row, column, mark, index) {
    var cell = this.element.rows[row].cells[column];
    if (cell) {
        var cellSize = getElementComputedSize(cell),
            markSvgElement = createMarkSvgElement(mark, cellSize.width, cellSize.height, this.strokeWidth),
            playerClass = TicTacToe.playerClass(index);
        if (markSvgElement.classList)
            markSvgElement.classList.add(playerClass);
        else
            addClass(markSvgElement, playerClass);
        cell.appendChild(markSvgElement);
    }
};

GridView.prototype.updateGrid = function() {
    while (this.element.rows.length > 0)
        this.element.deleteRow(-1);
    for (var i = 0; i < TicTacToe.Grid.Size; i++) {
        var row = this.element.insertRow();
        for (var j = 0; j < TicTacToe.Grid.Size; j++) {
            var cell = row.insertCell();
            cell.className = 'cell';
            if (i !== 0)
                cell.classList.add('nt');
            if (j !== 0)
                cell.classList.add('nl');
            cell.onclick = this.click.bind(this);
        }
    }
};

GridView.prototype.click = function(e) {
    switch (Object.prototype.toString.call(e.target)) {
    case '[object HTMLTableDataCellElement]': // ie/edge
    case '[object HTMLTableCellElement]':
        this.cellClicked(e.target.parentElement.rowIndex, e.target.cellIndex); break;
    default: this.cellClicked(-1, -1); break;
    }
};

GridView.prototype.setGrid = function(grid) {
    if (this.grid != null) {
        this.grid.cellChanged.disconnect(this.updateCell);
        this.grid.cleared.disconnect(this.updateGrid);
    }
    this.grid = grid;
    if (this.grid != null) {
        this.grid.cellChanged.connect(this.updateCell);
        this.grid.cleared.connect(this.updateGrid);
    }
    this.updateGrid();
};

GridView.prototype.bindElement = function(element) {
    this.element = element;
};

/*!
    \class PushButton
*/
function PushButton(props) {
    props = props || {};
    this.clicked = signal();
    this.text = props.text || '';
    if (props.dataset)
        this.dataset = props.dataset;
}

PushButton.prototype.click = function() {
    this.clicked(this);
};

PushButton.prototype.bindElement = function(element) {
    this.element = element;
    element.onclick = this.click.bind(this);
    this.text = element.textContent;
};

PushButton.prototype.createElement = function() {
    var button = document.createElement('button');
    button.type = 'button';
    button.textContent = this.text;
    if (this.dataset)
        for (var key in this.dataset)
            button.dataset[key] = this.dataset[key];
//        console.log('PushButton.createElemet()', button.outerHTML);
    return button;
};

/*!
    \class ToggleButton
    \extends PushButton
*/
function ToggleButton(props) {
    props = props || {};
    PushButton.call(this, props);
    this.toggled = signal();
    this.checked = props.checked || false;
}

ToggleButton.prototype = Object.create(PushButton.prototype);
ToggleButton.prototype.constructor = ToggleButton;

ToggleButton.prototype.setChecked = function(checked) {
    this.checked = checked;
    if (this.element != null) {
        if (this.checked)
            this.element.classList.add('checked');
        else
            this.element.classList.remove('checked');
    }
    this.toggled(this);
};

ToggleButton.prototype.click = function() {
    PushButton.prototype.click.call(this);
    this.toggle();
};

ToggleButton.prototype.toggle = function() {
    this.setChecked(!this.checked);
};

ToggleButton.prototype.bindElement = function(element) {
    PushButton.prototype.bindElement.call(this, element);
    this.setChecked(element.classList.contains('checked'));
};

ToggleButton.prototype.createElement = function() {
    var button = PushButton.prototype.createElement.call(this);
    button.classList.add('toggle-button');
    if (this.checked)
        button.classList.add('checked');
    return button;
};

function ButtonGroup(props) {
    props = props || {};
    this.current = null;
    this.buttons = [];
    this.currentChanged = signal();
    this.toggleButton = this.toggleButton.bind(this);
}

ButtonGroup.prototype.toggleButton = function(button) {
    if (button.checked) {
        if (this.current === button)
            return;
        var previous = this.current;
        this.current = button;
        if (previous != null)
            previous.setChecked(false);
        this.currentChanged(button);
        return;
    }
    if (this.current === button)
        button.setChecked(true);
};

ButtonGroup.prototype.add = function(button) {
    this.buttons.push(button);
    button.toggled.connect(this.toggleButton);
    if (this.element != null) {
        var element = button.createElement();
        button.bindElement(element);
        this.element.appendChild(element);
    }
    this.toggleButton(button);
};

ButtonGroup.prototype.clear = function() {
    while (this.buttons.length !== 0) {
        var button = this.buttons.pop();
        button.toggled.disconnect(this.toggleButton);
    }
};

ButtonGroup.prototype.bindElement = function(element) {
    this.clear();
    this.element = element;
    [].forEach.call(element, function(element) {
        var button = new ToggleButton();
        button.bindElement(element);
        this.add(button);
    }.bind(this));
};

ButtonGroup.prototype.createElement = function() {
    var buttonGroup = document.createElement('div');
    buttonGroup.classList.add('button-group');
    this.buttons.forEach(function(button) {
        buttonGroup.appendChild(button.createElement());
    });
    return buttonGroup;
};

function MatchScoreWidget() {
    this.widgets = {};
    this.players = [];
    this.updateName = this.updateName.bind(this);
    this.updateScore = this.updateScore.bind(this);
}

MatchScoreWidget.prototype.changeName = function(e) {
    var player = this.players.find(TicTacToe.playerByIndex(parseInt(e.target.dataset.playerIndex))),
        name = e.target.value;
    if (player) {
        console.log('MatchScoreWidget.changeName()', name);
        player.setName(name);
    }
};

MatchScoreWidget.prototype.updateName = function(player) {
    var widget = this.widgets[player.index];
    if (widget.name.value !== player.name) {
        console.log('MatchScoreWidget.updateName()', player.name);
        widget.name.value = player.name;
    }
};

MatchScoreWidget.prototype.updateScore = function(player) {
    var widget = this.widgets[player.index];
    widget.score.textContent = player.score;
};

MatchScoreWidget.prototype.removePlayer = function(player) {
    var index = this.players.indexOf(player);
    if (index !== -1) {
        this.players.splice(index, 1);
        player.nameChanged.disconnect(this.updateName);
        player.scoreChanged.disconnect(this.updateScore);
        var widget = this.widgets[player.index];
        widget.name.value        = TicTacToe.playerName(player.index);
        widget.name.readOnly     = false;
        widget.score.textContent = '0';
        setVisibility(widget.self, false);
    }
};

MatchScoreWidget.prototype.setPlayers = function(players) {
    this.players = players.slice();
    this.players.forEach(function(player) {
        var widget = this.widgets[player.index];
//        if (player.name)
//            widget.name.value    = player.name;
        widget.name.readOnly     = player.nameReadOnly;
//        widget.score.textContent = player.score;
        setVisibility(widget.self, player.isSelf());
        player.nameChanged.connect(this.updateName);
        player.scoreChanged.connect(this.updateScore);
    }.bind(this));
};

MatchScoreWidget.prototype.showSelfMarkTip = function(e) {
    var isVisible = window.getComputedStyle(e.target).visibility === 'visible';
    if (isVisible) {
        this.selfMarkTip.classList.remove('hidden');
        this.selfMarkTip.classList.add('visible');
    }
    else {
        this.selfMarkTip.classList.remove('visible');
        this.selfMarkTip.classList.add('hidden');
    }
};

MatchScoreWidget.prototype.hideSelfMarkTip = function(e) {
    this.selfMarkTip.classList.remove('visible');
    this.selfMarkTip.classList.add('hidden');
};

MatchScoreWidget.prototype.bindElement = function(element) {
    this.element = element;
    for (var playerIndex = TicTacToe.Player1; playerIndex < TicTacToe.MaxPlayers; playerIndex++) {
        var name  = element.querySelector('.{0}.player-name-field'.format(TicTacToe.playerClass(playerIndex))),
            self  = element.querySelector('.{0}.self-mark'        .format(TicTacToe.playerClass(playerIndex))),
            score = element.querySelector('.{0}.score-output'     .format(TicTacToe.playerClass(playerIndex)));
        name.dataset.playerIndex = playerIndex;
        name.onchange = name.onpaste = name.onkeyup = this.changeName.bind(this);
        self.onmouseover = this.showSelfMarkTip.bind(this);
        self.onmouseout  = this.hideSelfMarkTip.bind(this);
        setVisibility(self, false);
        this.widgets[playerIndex] = {
            name : name,
            self : self,
            score: score
        };
    }
    this.selfMarkTip = element.querySelector('.self-mark-tip');
};

function MatchStatusWidget() {
    this.statusBlocks = {};
    this.updatePlayerName = this.updatePlayerName.bind(this);
}

MatchStatusWidget.prototype.toggleBlock = function(current, callback) {
    if (this.current != null) {
        setDisplay(this.statusBlocks[this.current]);
        dotsAnimation.release(this.statusBlocks[this.current]);
    }
    this.current = current;
    if (this.current != null) {
        var block = this.statusBlocks[this.current];
        if (typeof callback === 'function')
            callback(block);
        setDisplay(block, 'block');
        dotsAnimation.acquire(block);
    }
};

MatchStatusWidget.prototype.changeBlocksPlayer = function(block) {
    var otherPlayer = this.player.match.findPlayer(TicTacToe.otherPlayer(this.player));
    if (otherPlayer != null
        && block.classList.contains(otherPlayer.playerClass()))
        block.classList.remove(otherPlayer.playerClass());
    if (!block.classList.contains(this.player.playerClass()))
        block.classList.add(this.player.playerClass());
};

MatchStatusWidget.prototype.updatePlayerName = function(player) {
    if (this.winnerNameOutput.dataset.playerIndex == player.index)
        this.winnerNameOutput.textContent = player.name;
    if (this.currentPlayerNameOutput.dataset.playerIndex == player.index)
        this.currentPlayerNameOutput.textContent = player.name;
};

MatchStatusWidget.prototype.setPlayer = function(player) {
    if (this.player != null)
        this.player.nameChanged.disconnect(this.updatePlayerName);
    this.player = player;
    if (this.player != null)
        this.player.nameChanged.connect(this.updatePlayerName);
};

MatchStatusWidget.prototype.setWinner = function(winner) {
    this.winnerNameOutput.dataset.playerIndex = winner.index;
    this.winnerNameOutput.textContent = winner.name;
    this.setPlayer(winner);
    this.toggleBlock('win', this.changeBlocksPlayer.bind(this));
};

MatchStatusWidget.prototype.setCurrentPlayer = function(currentPlayer) {
    this.currentPlayerNameOutput.dataset.playerIndex = currentPlayer.index;
    this.currentPlayerNameOutput.textContent = currentPlayer.name;
    this.currentPlayerMarkOutput.textContent = currentPlayer.markText();
    this.setPlayer(currentPlayer);
    this.toggleBlock('move', this.changeBlocksPlayer.bind(this));
};

MatchStatusWidget.prototype.setDraw = function() {
    this.toggleBlock('draw');
};

MatchStatusWidget.prototype.setWait = function() {
//    this.toggleBlock();
    this.toggleBlock('wait');
};

MatchStatusWidget.prototype.bindElement = function(element) {
    this.element = element;
    Array.prototype.forEach.call(element.querySelectorAll('.status'), function(statusBlock) {
        var status = statusBlock.dataset.status;
        this.statusBlocks[status] = statusBlock;
        setDisplay(statusBlock);
    }.bind(this));
    this.setWait();
    this.currentPlayerNameOutput = element.querySelector('.current-player.player-name-output');
    this.currentPlayerMarkOutput = element.querySelector('.current-player.player-mark-output');
    this.winnerNameOutput = element.querySelector('.winner.player-name-output');
};

function GameClientWidget(gameClient) {
    this.gameClient = gameClient;
    gameClient.showStatus.connect(this.showStatus.bind(this));
    gameClient.hideStatus.connect(this.hideStatus.bind(this));
}

GameClientWidget.prototype.showStatus = function(status) {
    if (status.text.endsWith('...'))
        status.text = status.text.substr(0, status.text.length - '...'.length) + '<span class="dots"></span>';
    dotsAnimation.release(this.statusBlock);
    this.statusBlock.innerHTML = status.text;
    dotsAnimation.acquire(this.statusBlock);
    this.statusBlock.classList.remove('fadeout');
    setVisibility(this.statusBlock, true);
};

GameClientWidget.prototype.hideStatus = function() {
    this.statusBlock.classList.add('fadeout');
};

GameClientWidget.prototype.changeMode = function(current) {
    var mode = parseInt(current.element.dataset.mode);
    console.log('Controller.changePlayMode()', mode);
    this.gameClient.setMode(mode);
};

GameClientWidget.prototype.bindElement = function(element) {
    this.element = element;
    var buttonGroup = new ButtonGroup();
    buttonGroup.currentChanged.connect(this.changeMode.bind(this));
    buttonGroup.bindElement(element.querySelector('.button-group'));
    TicTacToe.availableGameModes().forEach(function(mode, index) {
        var button = new ToggleButton({
            text: mode.text,
            checked: index === 0,
            dataset: {
                mode: mode.value
            }
        });
        buttonGroup.add(button);
    });
    this.statusBlock = element.querySelector('.status');
    setVisibility(this.statusBlock, false);
};

function Controller() {
    this.gameClient = new TicTacToe.GameClient(getWebSocketUrl(document.URL));
    this.gameClient.matchReady.connect(this.setMatch.bind(this));
    this.updateCurrentPlayer = this.updateCurrentPlayer.bind(this);
    this.removePlayer = this.removePlayer.bind(this);
    this.updateMatchState = this.updateMatchState.bind(this);
}

Controller.prototype.move = function(row, column) {
    this.gameClient.move(row, column);
};

Controller.prototype.updateMatchState = function(state, winner) {
    console.log('Controller.updateMatchState', state, winner);
    if (state === TicTacToe.PlayersReadyState) {
        this.scoreWidget.setPlayers(this.match.players);
    }
    else if (state === TicTacToe.MatchFinishedState) {
        if (winner != null)
            this.statusWidget.setWinner(winner);
        else
            this.statusWidget.setDraw();
    }
    else if (state === TicTacToe.WaitingForPlayersState) {
        this.statusWidget.setWait();
    }
};

Controller.prototype.updateCurrentPlayer = function(player) {
    this.statusWidget.setCurrentPlayer(player);
};

Controller.prototype.removePlayer = function(player) {
    this.scoreWidget.removePlayer(player);
};

Controller.prototype.setMatch = function(match) {
    if (this.match != null) {
        this.match.movePassed.disconnect(this.updateCurrentPlayer);
        this.match.stateChanged.disconnect(this.updateMatchState);
        this.match.playerRemoved.disconnect(this.removePlayer);
    }
    this.match = match;
    if (this.match != null) {
        this.match.movePassed.connect(this.updateCurrentPlayer);
        this.match.stateChanged.connect(this.updateMatchState);
        this.match.playerRemoved.connect(this.removePlayer);
        if (this.gridView != null)
            this.gridView.setGrid(this.match.grid);
    }
};

Controller.prototype.bindElement = function(element) {
    this.element = element;

    this.gridView = new GridView();
    this.gridView.bindElement(element.querySelector('.grid-view'));
    this.gridView.cellClicked.connect(this.move.bind(this));

    this.scoreWidget = new MatchScoreWidget();
    this.scoreWidget.bindElement(element.querySelector('.match-score-widget'));

    this.statusWidget = new MatchStatusWidget();
    this.statusWidget.bindElement(element.querySelector('.match-status-widget'));

    this.gameClientWidget = new GameClientWidget(this.gameClient);
    this.gameClientWidget.bindElement(element.querySelector('.game-client-widget'));
};

var controller = new Controller();
controller.bindElement(document);
