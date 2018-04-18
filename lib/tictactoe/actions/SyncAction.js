import { md5 } from '../../core/md5';
import { Action } from './Action';

export function toPairsOrdered(arg) {
    switch (Object.prototype.toString.call(arg)) {
    case '[object Object]': return Object.keys(arg).map((key) => [key, toPairsOrdered(arg[key])]).sort((lhs, rhs) => lhs[0].localeCompare(rhs[0]));
    case '[object Array]': return arg.map((val) => toPairsOrdered(val));
    default: return arg;
    }
}

/*!
    \class SyncAction
    \extends Action
*/
export class SyncAction extends Action {
    constructor(match, player) {
        super();
        if (match) {
            this.playerIndex = player.index;
            this.stateHash = SyncAction.getStateHash(match);
            const current = match.currentPlayer();
            this.current = current ? current.index : -1;
        }
    }

    dump() {
        const state = super.dump();
        state.playerIndex = this.playerIndex;
        state.stateHash = this.stateHash;
        state.current = this.current;
        return state;
    }

    restore(state) {
        this.playerIndex = state.playerIndex;
        this.stateHash = state.stateHash;
        this.current = state.current;
    }

    static getStateHash(match) {
        const state = match.dump();
        state.players.forEach((player) => {
            delete player.name; // don't care about names
        });
        return md5(JSON.stringify(toPairsOrdered(state)));
    }
}

SyncAction.type = 'sync';

Action.register(SyncAction);
