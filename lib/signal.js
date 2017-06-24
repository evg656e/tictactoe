console.log('defining signal');

/*!
    \class Signal
    \brief Implementation of signal/slot pattern.
    \see https://github.com/millermedeiros/js-signals/wiki/Comparison-between-different-Observer-Pattern-implementations
    \see http://robdodson.me/javascript-design-patterns-observer/
*/
export function Signal() {
    this.slots = null;
}

Signal.prototype.emit = function() {
    if (!this.slots)
        return false;
    if (typeof this.slots === 'function')
        this.slots.apply(this, arguments);
    else {
        var list = this.slots.slice(); // avoid 'once' side-effects
        for (var i = 0; i < list.length; i++)
            list[i].apply(this, arguments);
    }
    return true;
};

Signal.prototype.connect = function(slot) {
    if (typeof slot !== 'function')
        throw new TypeError('slot must be a function');
    if (!this.slots)
        this.slots = slot;
    else if (typeof this.slots === 'function')
        this.slots = [this.slots, slot];
    else
        this.slots.push(slot);
};

Signal.prototype.disconnect = function(slot) {
    if (typeof slot !== 'function')
        throw new TypeError('slot must be a function');
    if (!this.slots)
        return;
    if (typeof this.slots === 'function') {
        if (slot === this.slots)
            this.slots = null;
    }
    else {
        for (var i = this.slots.length; i-- > 0;)
            if (slot === this.slots[i])
                this.slots.splice(i, 1);
        if (this.slots.length === 1)
            this.slots = this.slots[0];
        else if (this.slots.length === 0)
            this.slots = null;
    }
};

Signal.prototype.once = function(slot) {
    if (typeof slot !== 'function')
        throw new TypeError('slot must be a function');
    var fired = false;
    function g() {
        if (!fired) {
            fired = true;
            this.disconnect(g);
            slot.apply(null, arguments);
        }
    }
    g.slot = slot;
    this.connect(g);
};

Signal.prototype.disconnectAll = function() {
    this.slots = null;
};

Signal.prototype.slotCount = function() {
    if (!this.slots)
        return 0;
    if (typeof this.slots === 'function')
        return 1;
    return this.slots.length;
};

export default function signal() {
    //! \see https://stackoverflow.com/questions/340383/can-a-javascript-object-have-a-prototype-chain-but-also-be-a-function
    function signal() {
        return Signal.prototype.emit.apply(signal, arguments);
    }
    Object.setPrototypeOf(signal, Signal.prototype);
    return signal;
}

if (!Object.setPrototypeOf) {
    Object.setPrototypeOf = function(obj, proto) {
        obj.__proto__ = proto;
        return obj;
    }
}
