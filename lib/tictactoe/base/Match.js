import { Signal } from '../../core/Signal';
import * as TicTacToe from './TicTacToe';
import { Grid } from './Grid';
import { Player } from './Player';

const { _, X, O } = TicTacToe;

/*!
    \class Match
*/
export class Match {
    constructor() {
        this.grid = new Grid();
        this.players = [];
        this.current = -1;
        this.state = TicTacToe.WaitingForPlayersState;
        this.stateChanged = new Signal();
        this.movePassed = new Signal();
        this.playerRemoved = new Signal();
        this.move = this.move.bind(this);
    }

    clear() {
        while (this.players.length !== 0)
            this.removePlayer(this.players[0]);
        this.grid.clear();
    }

    setState(state, winner) {
        if (state !== this.state) {
            this.state = state;
            this.stateChanged(state, winner);
        }
    }

    currentPlayer() {
        if (this.current >= 0 && this.current < this.players.length)
            return this.players[this.current];
    }

    findPlayer(predicate) {
        return this.players.find(predicate);
    }

    nextMove() {
        if (this.state !== TicTacToe.MatchRunningState)
            return;
        this.current++;
        if (this.current === this.players.length)
            this.current = 0;
        const player = this.currentPlayer();
        this.movePassed(player);
        player.passMove();
    }

    start() {
        if (this.state === TicTacToe.MatchRunningState
            || this.players.length !== TicTacToe.MaxPlayers)
            return;
        this.grid.clear();
        this.setState(TicTacToe.MatchRunningState);
        this.current = -1;
        this.nextMove();
    }

    addPlayer(player) {
        if (this.players.length === TicTacToe.MaxPlayers)
            return;
        player.setMatch(this);
        player.moved.connect(this.move);
        this.players.push(player);
        if (this.players.length === TicTacToe.MaxPlayers) {
            const player1 = this.players[0];
            const player2 = this.players[1];
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
    }

    removePlayer(player) {
        const index = this.players.indexOf(player);
        if (index !== -1) {
            const player = this.players.splice(index, 1)[0];
            player.moved.disconnect(this.move);
            player.setMatch(null);
            this.playerRemoved(player);
            if (this.players.length === 1) {
                this.current = 0;
                const winner = this.players[0];
                winner.setScore(winner.score + 1);
                this.setState(TicTacToe.MatchFinishedState, winner);
            }
            this.current = -1;
            this.setState(TicTacToe.WaitingForPlayersState);
        }
    }

    move(player, row, column) {
        if (this.state === TicTacToe.MatchRunningState) {
            if (this.currentPlayer() === player) {
                const result = this.grid.setCell(row, column, player.mark, player.index);
                switch (result) {
                case TicTacToe.WinState: player.setScore(player.score + 1); this.setState(TicTacToe.MatchFinishedState, player); this.current = -1; break;
                case TicTacToe.DrawState: this.setState(TicTacToe.MatchFinishedState); this.current = -1; break;
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
    }

    dump() {
        return {
            index: this.grid.dump(),
            players: this.players.map((player) => player.dump()),
            current: this.current,
            state: this.state
        };
    }

    restore(state) {
        this.grid = Grid.restore(state.grid);
        this.players = state.players.map((player) => Player.restore(player));
        this.current = state.current;
        this.state = state.state;
    }
}
