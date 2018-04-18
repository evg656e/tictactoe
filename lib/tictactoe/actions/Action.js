const constructors = {};

/*!
    \class Action
*/
export class Action {
    constructor() {
    }

    type() {
        return this.constructor.type;
    }

    dump() {
        return {};
    }

    serialize() {
        const state = this.dump();
        state.type = this.type();
        return state;
    }

    restore(state) {
    }

    stringify(replacer, space) {
        return JSON.stringify(this.serialize(), replacer, space);
    }

    static register(constructor) {
        if (!constructors.hasOwnProperty(constructor.type))
            constructors[constructor.type] = constructor;
    }

    static create(name) {
        if (constructors.hasOwnProperty(name))
            return new (Function.prototype.bind.apply(constructors[name], arguments))();
    }

    static deserialize(state) {
        if (constructors.hasOwnProperty(state.type)) {
            const obj = new constructors[state.type]();
            obj.restore(state);
            return obj;
        }
    }

    static parse(text, reviver) {
        return Action.deserialize(JSON.parse(text, reviver));
    }
}
