import { Signal } from '../../../lib/core/Signal';
import * as TicTacToe from '../../../lib/tictactoe/base/TicTacToe';
import { Grid } from '../../../lib/tictactoe/base/Grid';
import { GameClient } from '../../../lib/tictactoe/client/GameClient';
import '../../../lib/tictactoe/actions/actions';

//! \see http://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format
function format(str, ...args) {
    return str.replace(/{(\d+)}/g, function (match, number) {
        return typeof args[number] !== 'undefined' ? args[number] : match;
    });
}

/*!
    \fn parseUrl
    \see http://stackoverflow.com/a/15979390/2895579

    const result = parseUrl("http://example.com:3000");
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
    const a = document.createElement('a');
    a.href = url;
    return a;
}

function getWebSocketUrl(url) {
    const parsedUrl = parseUrl(url);
    return (parsedUrl.protocol === 'https:' ? 'wss://' : 'ws://') + parsedUrl.host;
}

function createSvgElement(name, attributes) {
    const element = document.createElementNS('http://www.w3.org/2000/svg', name);
    for (const attrName in attributes) {
        const attrValue = attributes[attrName];
        element.setAttribute(attrName, attrValue);
    }
    return element;
}

function createMarkSvgElement(mark, width, height, strokeWidth) {
    strokeWidth = strokeWidth || 1;
    const ret = createSvgElement('svg', { 'width': width, 'height': height, 'class': 'mark' });
    const style = 'stroke-width: ' + strokeWidth;
    const offset = Math.floor(strokeWidth / 2);
    const left = offset;
    const right = width - offset;
    const top = offset;
    const bottom = height - offset;
    if (mark === TicTacToe.X) {
        ret.appendChild(createSvgElement('line', { 'x1': left, 'y1': top, 'x2': right, 'y2': bottom, 'style': style }));
        ret.appendChild(createSvgElement('line', { 'x1': right, 'y1': top, 'x2': left, 'y2': bottom, 'style': style }));
    }
    else if (mark === TicTacToe.O) {
        ret.appendChild(createSvgElement('circle', { 'cx': width / 2, 'cy': height / 2, 'r': width / 2 - offset - 1, 'style': style }));
    }
    return ret;
}

function getElementComputedSize(element) {
    const style = getComputedStyle(element);

    const paddingWidth = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    const paddingHeight = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    const borderWidth = parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);
    const borderHeight = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);

    return {
        width: element.offsetWidth - paddingWidth - borderWidth,
        height: element.offsetHeight - paddingHeight - borderHeight
    };
}

function addClass(element, className) {
    const classList = element.getAttribute('class').split(' ');
    classList.push(className);
    element.setAttribute('class', classList.join(' '));
}

function setVisibility(element, visible) {
    element.style.visibility = visible ? 'visible' : 'hidden';
}

function setDisplay(element, display) {
    element.style.display = display ? display : 'none';
}

const dotsAnimation = (function (delay) {
    const elements = [];
    let timerId;

    function animateDots() {
        elements.forEach(function (element) {
            let text = element.textContent;
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
        const index = elements.indexOf(element);
        if (index !== -1) {
            elements.splice(index, 1);
            if (elements.length === 0)
                clearInterval(timerId);
        }
    }

    return {
        acquireAll(parent) {
            Array.prototype.forEach.call(parent.querySelectorAll('.dots'), function (element) {
                insertElement(element);
            });
        },
        acquire(parent) {
            insertElement(parent.querySelector('.dots'));
        },
        releaseAll(parent) {
            Array.prototype.forEach.call(parent.querySelectorAll('.dots'), function (element) {
                removeElement(element);
            });
        },
        release(parent) {
            removeElement(parent.querySelector('.dots'));
        }
    };
}(500));

/*!
    \class GridView
*/
class GridView {
    constructor(props) {
        props = Object.assign({}, props);
        this.cellClicked = new Signal();
        this.strokeWidth = props.strokeWidth || 4;
        this.updateCell = this.updateCell.bind(this);
        this.updateGrid = this.updateGrid.bind(this);
    }

    click(e) {
        switch (Object.prototype.toString.call(e.target)) {
            case '[object HTMLTableDataCellElement]': // ie/edge
            case '[object HTMLTableCellElement]':
                this.cellClicked(e.target.parentElement.rowIndex, e.target.cellIndex);
                break;
            default:
                this.cellClicked(-1, -1);
                break;
        }
    }

    setGrid(grid) {
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
    }

    updateCell(row, column, mark, index) {
        const cell = this.element.rows[row].cells[column];
        if (cell) {
            const cellSize = getElementComputedSize(cell);
            const markSvgElement = createMarkSvgElement(mark, cellSize.width, cellSize.height, this.strokeWidth);
            const playerClass = TicTacToe.playerClass(index);
            if (markSvgElement.classList)
                markSvgElement.classList.add(playerClass);
            else
                addClass(markSvgElement, playerClass);
            cell.appendChild(markSvgElement);
        }
    }

    updateGrid() {
        while (this.element.rows.length > 0)
            this.element.deleteRow(-1);
        for (let i = 0; i < Grid.Size; i++) {
            const row = this.element.insertRow();
            for (let j = 0; j < Grid.Size; j++) {
                const cell = row.insertCell();
                cell.className = 'cell';
                if (i !== 0)
                    cell.classList.add('nt');
                if (j !== 0)
                    cell.classList.add('nl');
                cell.onclick = this.click.bind(this);
            }
        }
    }

    mountElement(element) {
        this.element = element;
    }
}

/*!
    \class PushButton
*/
class PushButton {
    constructor(props) {
        props = Object.assign({}, props);
        this.clicked = new Signal();
        this.text = props.text || '';
        if (props.dataset)
            this.dataset = props.dataset;
    }

    click() {
        this.clicked(this);
    }

    mountElement(element) {
        this.element = element;
        element.onclick = this.click.bind(this);
        this.text = element.textContent;
    }

    createElement() {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = this.text;
        if (this.dataset)
            for (const key in this.dataset)
                button.dataset[key] = this.dataset[key];
        // console.log('PushButton.createElemet()', button.outerHTML);
        return button;
    }
}

/*!
    \class ToggleButton
    \extends PushButton
*/
class ToggleButton extends PushButton {
    constructor(props) {
        props = Object.assign({}, props);
        super(props);
        this.toggled = new Signal();
        this.checked = props.checked || false;
    }

    setChecked(checked) {
        this.checked = checked;
        if (this.element != null) {
            if (this.checked)
                this.element.classList.add('checked');
            else
                this.element.classList.remove('checked');
        }
        this.toggled(this);
    }

    click() {
        super.click();
        this.toggle();
    }

    toggle() {
        this.setChecked(!this.checked);
    }

    mountElement(element) {
        super.mountElement(element);
        this.setChecked(element.classList.contains('checked'));
    }

    createElement() {
        const button = super.createElement();
        button.classList.add('toggle-button');
        if (this.checked)
            button.classList.add('checked');
        return button;
    }
}

/*!
    \class ButtonGroup
*/
class ButtonGroup {
    constructor(props) {
        props = Object.assign({}, props);
        this.current = null;
        this.buttons = [];
        this.currentChanged = new Signal();
        this.toggleButton = this.toggleButton.bind(this);
    }

    add(button) {
        this.buttons.push(button);
        button.toggled.connect(this.toggleButton);
        if (this.element != null) {
            const element = button.createElement();
            button.mountElement(element);
            this.element.appendChild(element);
        }
        this.toggleButton(button);
    }

    clear() {
        while (this.buttons.length !== 0) {
            const button = this.buttons.pop();
            button.toggled.disconnect(this.toggleButton);
        }
    }

    toggleButton(button) {
        if (button.checked) {
            if (this.current === button)
                return;
            const previous = this.current;
            this.current = button;
            if (previous != null)
                previous.setChecked(false);
            this.currentChanged(button);
            return;
        }
        if (this.current === button)
            button.setChecked(true);
    }

    mountElement(element) {
        this.clear();
        this.element = element;
        [].forEach.call(element, (element) => {
            const button = new ToggleButton();
            button.mountElement(element);
            this.add(button);
        });
    }

    createElement() {
        const buttonGroup = document.createElement('div');
        buttonGroup.classList.add('button-group');
        this.buttons.forEach(function (button) {
            buttonGroup.appendChild(button.createElement());
        });
        return buttonGroup;
    }
}

/*!
    \class MatchScoreWidget
*/
class MatchScoreWidget {
    constructor() {
        this.widgets = {};
        this.players = [];
        this.updateName = this.updateName.bind(this);
        this.updateScore = this.updateScore.bind(this);
    }

    changeName(e) {
        const player = this.players.find(TicTacToe.playerByIndex(parseInt(e.target.dataset.playerIndex))), name = e.target.value;
        if (player) {
            console.log('MatchScoreWidget.changeName()', name);
            player.setName(name);
        }
    }

    removePlayer(player) {
        const index = this.players.indexOf(player);
        if (index !== -1) {
            this.players.splice(index, 1);
            player.nameChanged.disconnect(this.updateName);
            player.scoreChanged.disconnect(this.updateScore);
            const widget = this.widgets[player.index];
            widget.name.value = TicTacToe.playerName(player.index);
            widget.name.readOnly = false;
            widget.score.textContent = '0';
            setVisibility(widget.self, false);
        }
    }

    setPlayers(players) {
        this.players = players.slice();
        this.players.forEach((player) => {
            const widget = this.widgets[player.index];
            // if (player.name)
            //     widget.name.value = player.name;
            widget.name.readOnly = player.nameReadOnly;
            // widget.score.textContent = player.score;
            setVisibility(widget.self, player.isSelf());
            player.nameChanged.connect(this.updateName);
            player.scoreChanged.connect(this.updateScore);
        });
    }

    updateName(player) {
        const widget = this.widgets[player.index];
        if (widget.name.value !== player.name) {
            console.log('MatchScoreWidget.updateName()', player.name);
            widget.name.value = player.name;
        }
    }

    updateScore(player) {
        const widget = this.widgets[player.index];
        widget.score.textContent = player.score;
    }

    showSelfMarkTip(e) {
        const isVisible = window.getComputedStyle(e.target).visibility === 'visible';
        if (isVisible) {
            this.selfMarkTip.classList.remove('hidden');
            this.selfMarkTip.classList.add('visible');
        }
        else {
            this.selfMarkTip.classList.remove('visible');
            this.selfMarkTip.classList.add('hidden');
        }
    }

    hideSelfMarkTip(e) {
        this.selfMarkTip.classList.remove('visible');
        this.selfMarkTip.classList.add('hidden');
    }

    mountElement(element) {
        this.element = element;
        for (let playerIndex = TicTacToe.Player1; playerIndex < TicTacToe.MaxPlayers; playerIndex++) {
            const name = element.querySelector(format('.{0}.player-name-field', TicTacToe.playerClass(playerIndex))), self = element.querySelector(format('.{0}.self-mark', TicTacToe.playerClass(playerIndex))), score = element.querySelector(format('.{0}.score-output', TicTacToe.playerClass(playerIndex)));
            name.dataset.playerIndex = playerIndex;
            name.onchange = name.onpaste = name.onkeyup = this.changeName.bind(this);
            self.onmouseover = this.showSelfMarkTip.bind(this);
            self.onmouseout = this.hideSelfMarkTip.bind(this);
            setVisibility(self, false);
            this.widgets[playerIndex] = {
                name: name,
                self: self,
                score: score
            };
        }
        this.selfMarkTip = element.querySelector('.self-mark-tip');
    }
}

/*!
    \class MatchStatusWidget
*/
class MatchStatusWidget {
    constructor() {
        this.statusBlocks = {};
        this.updatePlayerName = this.updatePlayerName.bind(this);
    }

    toggleBlock(current, callback) {
        if (this.current != null) {
            setDisplay(this.statusBlocks[this.current]);
            dotsAnimation.release(this.statusBlocks[this.current]);
        }
        this.current = current;
        if (this.current != null) {
            const block = this.statusBlocks[this.current];
            if (typeof callback === 'function')
                callback(block);
            setDisplay(block, 'block');
            dotsAnimation.acquire(block);
        }
    }

    changeBlocksPlayer(block) {
        const otherPlayer = this.player.match.findPlayer(TicTacToe.otherPlayer(this.player));
        if (otherPlayer != null
            && block.classList.contains(otherPlayer.playerClass()))
            block.classList.remove(otherPlayer.playerClass());
        if (!block.classList.contains(this.player.playerClass()))
            block.classList.add(this.player.playerClass());
    }

    setPlayer(player) {
        if (this.player != null)
            this.player.nameChanged.disconnect(this.updatePlayerName);
        this.player = player;
        if (this.player != null)
            this.player.nameChanged.connect(this.updatePlayerName);
    }

    setWinner(winner) {
        this.winnerNameOutput.dataset.playerIndex = winner.index;
        this.winnerNameOutput.textContent = winner.name;
        this.setPlayer(winner);
        this.toggleBlock('win', this.changeBlocksPlayer.bind(this));
    }

    setCurrentPlayer(currentPlayer) {
        this.currentPlayerNameOutput.dataset.playerIndex = currentPlayer.index;
        this.currentPlayerNameOutput.textContent = currentPlayer.name;
        this.currentPlayerMarkOutput.textContent = currentPlayer.markText();
        this.setPlayer(currentPlayer);
        this.toggleBlock('move', this.changeBlocksPlayer.bind(this));
    }

    setDraw() {
        this.toggleBlock('draw');
    }

    setWait() {
        // this.toggleBlock();
        this.toggleBlock('wait');
    }

    updatePlayerName(player) {
        if (this.winnerNameOutput.dataset.playerIndex == player.index)
            this.winnerNameOutput.textContent = player.name;
        if (this.currentPlayerNameOutput.dataset.playerIndex == player.index)
            this.currentPlayerNameOutput.textContent = player.name;
    }

    mountElement(element) {
        this.element = element;
        Array.prototype.forEach.call(element.querySelectorAll('.status'), (statusBlock) => {
            const status = statusBlock.dataset.status;
            this.statusBlocks[status] = statusBlock;
            setDisplay(statusBlock);
        });
        this.setWait();
        this.currentPlayerNameOutput = element.querySelector('.current-player.player-name-output');
        this.currentPlayerMarkOutput = element.querySelector('.current-player.player-mark-output');
        this.winnerNameOutput = element.querySelector('.winner.player-name-output');
    }
}

/*!
    \class GameClientWidget
*/
class GameClientWidget {
    constructor(gameClient) {
        this.gameClient = gameClient;
        gameClient.showStatus.connect(this.showStatus.bind(this));
        gameClient.hideStatus.connect(this.hideStatus.bind(this));
    }

    showStatus(status) {
        if (status.text.endsWith('...'))
            status.text = status.text.substr(0, status.text.length - '...'.length) + '<span class="dots"></span>';
        dotsAnimation.release(this.statusBlock);
        this.statusBlock.innerHTML = status.text;
        dotsAnimation.acquire(this.statusBlock);
        this.statusBlock.classList.remove('fadeout');
        setVisibility(this.statusBlock, true);
    }

    hideStatus() {
        this.statusBlock.classList.add('fadeout');
    }

    changeMode(current) {
        const mode = parseInt(current.element.dataset.mode);
        console.log('Controller.changePlayMode()', mode);
        this.gameClient.setMode(mode);
    }

    mountElement(element) {
        this.element = element;
        const buttonGroup = new ButtonGroup();
        buttonGroup.currentChanged.connect(this.changeMode.bind(this));
        buttonGroup.mountElement(element.querySelector('.button-group'));
        TicTacToe.availableGameModes.forEach(function (mode, index) {
            const button = new ToggleButton({
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
    }
}

/*!
    \class Controller
*/
class Controller {
    constructor() {
        this.gameClient = new GameClient(getWebSocketUrl(document.URL), WebSocket);
        this.gameClient.matchReady.connect(this.setMatch.bind(this));
        this.updateCurrentPlayer = this.updateCurrentPlayer.bind(this);
        this.removePlayer = this.removePlayer.bind(this);
        this.updateMatchState = this.updateMatchState.bind(this);
    }

    move(row, column) {
        this.gameClient.move(row, column);
    }

    setMatch(match) {
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
    }

    updateCurrentPlayer(player) {
        this.statusWidget.setCurrentPlayer(player);
    }

    updateMatchState(state, winner) {
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
    }

    removePlayer(player) {
        this.scoreWidget.removePlayer(player);
    }

    mountElement(element) {
        this.element = element;
        this.gridView = new GridView();
        this.gridView.mountElement(element.querySelector('.grid-view'));
        this.gridView.cellClicked.connect(this.move.bind(this));
        this.scoreWidget = new MatchScoreWidget();
        this.scoreWidget.mountElement(element.querySelector('.match-score-widget'));
        this.statusWidget = new MatchStatusWidget();
        this.statusWidget.mountElement(element.querySelector('.match-status-widget'));
        this.gameClientWidget = new GameClientWidget(this.gameClient);
        this.gameClientWidget.mountElement(element.querySelector('.game-client-widget'));
    }
}

new Controller().mountElement(document);
