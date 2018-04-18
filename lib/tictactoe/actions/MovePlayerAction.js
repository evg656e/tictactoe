import { Action } from './Action';

/*!
    \class MovePlayerAction
    \extends Action
*/
export class MovePlayerAction extends Action {
    constructor(playerIndex, row, column) {
        super();
        this.playerIndex = playerIndex;
        this.row = row;
        this.column = column;
    }

    dump() {
        const state = super.dump();
        state.playerIndex = this.playerIndex;
        state.row = this.row;
        state.column = this.column;
        return state;
    }

    restore(state) {
        this.playerIndex = state.playerIndex;
        this.row = state.row;
        this.column = state.column;
    }
}

MovePlayerAction.type = 'movePlayer';

Action.register(MovePlayerAction);
