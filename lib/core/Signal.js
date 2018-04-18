function emit0(self, slots) {
    if (typeof slots === 'function')
        slots.call(self);
    else {
        const n = slots.length;
        const _slots = slots.slice();
        for (let i = 0; i < n; ++i)
            _slots[i].call(self);
    }
}

function emit1(self, slots, arg1) {
    if (typeof slots === 'function')
        slots.call(self, arg1);
    else {
        const n = slots.length;
        const _slots = slots.slice();
        for (let i = 0; i < n; ++i)
            _slots[i].call(self, arg1);
    }
}

function emit2(self, slots, arg1, arg2) {
    if (typeof slots === 'function')
        slots.call(self, arg1, arg2);
    else {
        const n = slots.length;
        const _slots = slots.slice();
        for (let i = 0; i < n; ++i)
            _slots[i].call(self, arg1, arg2);
    }
}

function emit3(self, slots, arg1, arg2, arg3) {
    if (typeof slots === 'function')
        slots.call(self, arg1, arg2, arg3);
    else {
        const n = slots.length;
        const _slots = slots.slice();
        for (let i = 0; i < n; ++i)
            _slots[i].call(self, arg1, arg2, arg3);
    }
}

function emitN(self, slots, args) {
    if (typeof slots === 'function')
        slots.apply(self, args);
    else {
        const n = slots.length;
        const _slots = slots.slice();
        for (let i = 0; i < n; ++i)
            _slots[i].apply(self, args);
    }
}

/*!
    \class Signal
    \brief Implementation of signal/slot pattern.
    \see https://github.com/millermedeiros/js-signals/wiki/Comparison-between-different-Observer-Pattern-implementations
    \see http://robdodson.me/javascript-design-patterns-observer/
*/
export class Signal extends Function {
    constructor() {
        super();
        //! \see https://stackoverflow.com/questions/340383/can-a-javascript-object-have-a-prototype-chain-but-also-be-a-function
        //! \see https://stackoverflow.com/questions/36871299/how-to-extend-function-with-es6-classes
        function signal() {
            const slots = signal._slots;
            if (!slots)
                return false;
            const n = arguments.length;
            switch (n) {
                case 0:
                    emit0(signal, slots);
                    break;
                case 1:
                    emit1(signal, slots, arguments[0]);
                    break;
                case 2:
                    emit2(signal, slots, arguments[0], arguments[1]);
                    break;
                case 3:
                    emit3(signal, slots, arguments[0], arguments[1], arguments[2]);
                    break;
                default:
                    const args = new Array(n);
                    for (let i = 0; i < n; ++i)
                        args[i] = arguments[i];
                    emitN(signal, slots, args);
            }
            return true;
        }
        return Object.setPrototypeOf(signal, Signal.prototype);
    }

    emit() {
        const slots = this._slots;
        if (!slots)
            return false;
        const n = arguments.length;
        switch (n) {
            case 0:
                emit0(this, slots);
                break;
            case 1:
                emit1(this, slots, arguments[0]);
                break;
            case 2:
                emit2(this, slots, arguments[0], arguments[1]);
                break;
            case 3:
                emit3(this, slots, arguments[0], arguments[1], arguments[2]);
                break;
            default:
                const args = new Array(n);
                for (let i = 0; i < n; ++i)
                    args[i] = arguments[i];
                emitN(this, slots, args);
        }
        return true;
    }

    connect(slot) {
        if (typeof slot !== 'function')
            throw new TypeError('slot must be a function');
        if (!this._slots)
            this._slots = slot;
        else if (typeof this._slots === 'function')
            this._slots = [this._slots, slot];
        else
            this._slots.push(slot);
    }

    disconnect(slot) {
        if (typeof slot !== 'function')
            throw new TypeError('slot must be a function');
        if (!this._slots)
            return;
        if (typeof this._slots === 'function') {
            if (slot === this._slots)
                delete this._slots;
        }
        else {
            for (let i = this._slots.length; i-- > 0;)
                if (slot === this._slots[i])
                    this._slots.splice(i, 1);
            if (this._slots.length === 1)
                this._slots = this._slots[0];
            else if (this._slots.length === 0)
                delete this._slots;
        }
    }

    once(slot) {
        if (typeof slot !== 'function')
            throw new TypeError('slot must be a function');
        let fired = false;
        function wrapper(...args) {
            if (!fired) {
                fired = true;
                this.disconnect(wrapper);
                slot.apply(this, args);
            }
        }
        this.connect(wrapper);
    }

    disconnectAll() {
        delete this._slots;
    }

    slotCount() {
        if (!this._slots)
            return 0;
        if (typeof this._slots === 'function')
            return 1;
        return this._slots.length;
    }
}

export function signal() {
    return new Signal();
}
