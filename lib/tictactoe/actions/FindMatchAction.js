import { Action } from './Action';

/*!
    \class FindMatchAction
    \extends Action
*/
export class FindMatchAction extends Action {
    constructor(playerName) {
        super();
        this.playerName = playerName;
    }

    dump() {
        const state = super.dump();
        state.playerName = this.playerName;
        return state;
    }

    restore(state) {
        this.playerName = state.playerName;
    }
}

FindMatchAction.type = 'findMatch';

Action.register(FindMatchAction);
