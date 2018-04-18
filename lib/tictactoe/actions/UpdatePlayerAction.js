import { Action } from './Action';

/*!
    \class UpdatePlayerAction
    \extends Action
*/
export class UpdatePlayerAction extends Action {
    constructor(playerIndex, propertyName, propertyValue) {
        super();
        this.playerIndex = playerIndex;
        this.propertyName = propertyName;
        this.propertyValue = propertyValue;
    }

    dump() {
        const state = super.dump();
        state.playerIndex = this.playerIndex;
        state.propertyName = this.propertyName;
        state.propertyValue = this.propertyValue;
        return state;
    }

    restore(state) {
        this.playerIndex = state.playerIndex;
        this.propertyName = state.propertyName;
        this.propertyValue = state.propertyValue;
    }
}

UpdatePlayerAction.type = 'updatePlayer';

Action.register(UpdatePlayerAction);
