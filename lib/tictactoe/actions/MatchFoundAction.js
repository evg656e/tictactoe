import { Action } from './Action';
import { PlayerInfo } from './PlayerInfo';

/*!
    \class MatchFoundAction
    \extends Action
*/
export class MatchFoundAction extends Action {
    constructor(playersInfo) {
        super();
        this.playersInfo = playersInfo;
    }

    dump() {
        const state = super.dump(this);
        state.playersInfo = this.playersInfo.map((playerInfo) => playerInfo.dump());
        return state;
    }

    restore(state) {
        this.playersInfo = state.playersInfo.map((playerInfo) => PlayerInfo.restore(playerInfo));
    }
}

MatchFoundAction.type = 'matchFound';

Action.register(MatchFoundAction);
