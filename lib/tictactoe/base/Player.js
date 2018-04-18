import { Signal } from '../../core/Signal';
import * as TicTacToe from './TicTacToe';

const { _, X, O } = TicTacToe;

const reservedNames = {
    [TicTacToe.playerName(TicTacToe.Player1)]: true,
    [TicTacToe.playerName(TicTacToe.Player2)]: true
};

/*!
    \class Player
*/
export class Player {
    constructor(name) {
        this.match = null;
        this.index = -1;
        this.mark = _;
        if (Player.isReservedName(name))
            name = '';
        this.name = name || '';
        this.score = -1;
        this.moved = new Signal();
        this.nameChanged = new Signal();
        this.scoreChanged = new Signal();
    }

    setMatch(match) {
        this.match = match;
    }

    playerClass() {
        return TicTacToe.playerClass(this.index);
    }

    setIndex(index) {
        this.index = index;
    }

    setMark(mark) {
        this.mark = mark;
    }

    markText() {
        return TicTacToe.markText[this.mark];
    }

    setName(name) {
        if (Player.isReservedName(name))
            name = '';
        if (!name)
            name = TicTacToe.playerName(this.index);
        if (this.name !== name) {
            this.name = name;
            this.nameChanged(this);
        }
    }

    setScore(score, force) {
        if (this.score !== score) {
            this.score = score;
            this.scoreChanged(this);
        }
    }

    move(row, column) {
        this.moved(this, row, column);
    }

    passMove() {
    }

    isSelf() {
        return false;
    }

    equals(other) {
        return this.index === other.index;
    }

    dump() {
        return {
            index: this.index,
            mark: this.mark,
            name: this.name,
            score: this.score
        };
    }

    restore(state) {
        this.index = state.index;
        this.mark = state.mark;
        this.name = state.name;
        this.score = state.score;
    }

    static isReservedName(name) {
        return reservedNames[name];
    }

    static restore(state) {
        const ret = new Player();
        ret.restore(state);
        return ret;
    }
}
