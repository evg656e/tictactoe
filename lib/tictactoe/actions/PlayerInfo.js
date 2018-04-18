/*!
    \class PlayerInfo
*/
export class PlayerInfo {
    constructor(name, self) {
        this.name = name || '';
        this.self = self || false;
    }

    dump() {
        return {
            name: this.name,
            self: this.self
        };
    }

    restore(state) {
        this.name = state.name;
        this.self = state.self;
    }

    static restore(state) {
        const ret = new PlayerInfo();
        ret.restore(state);
        return ret;
    }
}
