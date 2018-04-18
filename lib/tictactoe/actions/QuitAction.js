import { Action } from './Action';

/*!
    \class QuitAction
    \extends Action
*/
export class QuitAction extends Action {
    constructor(playerIndex, code) {
        super();
        this.playerIndex = playerIndex;
        this.code = code || QuitAction.Normal;
    }

    dump() {
        const state = super.dump();
        state.playerIndex = this.playerIndex;
        state.code = this.code;
        return state;
    }

    restore(state) {
        this.playerIndex = state.playerIndex;
        this.code = state.code;
    }
}

QuitAction.Normal = 0;
QuitAction.Disconnected = 1;
QuitAction.Desynchronized = 2;

QuitAction.type = 'quit';

Action.register(QuitAction);
