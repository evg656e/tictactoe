import debounce from 'lodash/debounce';
import { Player } from '../base/Player';

/*!
    \class ProxyPlayer
    \extends Player
*/
export class ProxyPlayer extends Player {
    constructor(gameClient, player, nameReadOnly = false) {
        super(player.name);

        this.nameReadOnly = nameReadOnly;
        this.nameLocked = false;

        const setName = debounce((name) => {
            this.nameLocked = false;
            super.setName(name);
        }, ProxyPlayer.DebounceInterval);

        this.setName = (name) => {
            this.nameLocked = true;
            setName(name);
        };

        this.updateName = (name) => {
            if (!this.nameLocked)
                super.setName(name);
        };

        this.updateScore = super.setScore.bind(this);
        this.handleNameChanged = this.handleNameChanged.bind(this);
        this.handleScoreChanged = this.handleScoreChanged.bind(this);
        this.handleMoved = this.handleMoved.bind(this);

        this.setPlayer(player);
        this.setGameClient(gameClient);
    }

    setGameClient(gameClient) {
        this.gameClient = gameClient;
    }

    setPlayer(player) {
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
    }

    setName(name) {
        if (!this.player)
            return;
        if (this.nameReadOnly && this.name) {
            if (name !== this.player.name) // discard
                this.nameChanged(this.player.name);
            return;
        }
        this.player.setName(name);
    }

    setMatch(match) {
        super.setMatch(match);
        this.player.setMatch(match);
    }

    setIndex(index) {
        super.setIndex(index);
        this.player.setIndex(index);
    }

    setMark(mark) {
        super.setMark(mark);
        this.player.setMark(mark);
    }

    setScore(score) {
        this.player.setScore(score);
    }

    handleNameChanged(player) {
        this.gameClient.updatePlayer(this, 'name', player.name);
    }

    handleScoreChanged(player) {
        this.gameClient.updatePlayer(this, 'score', player.score);
    }

    handleMoved(player, row, column) {
        this.gameClient.movePlayer(this, row, column);
    }

    updatePlayer(action) {
        switch (action.propertyName) {
        case 'name':
            this.updateName(action.propertyValue);
            break;
        case 'score':
            this.updateScore(action.propertyValue);
            break;
        default: break;
        }
    }

    passMove() {
        this.player.passMove();
    }

    move(row, column) {
        this.player.move(row, column);
    }

    movePlayer(action) {
        this.moved(this, action.row, action.column);
    }

    isSelf() {
        return this.gameClient.player === this.player;
    }
}
