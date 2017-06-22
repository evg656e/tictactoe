console.log('defining signal');

/*!
    \fn signal
    \brief Implementation of signal/slot pattern.
    \see https://github.com/millermedeiros/js-signals/wiki/Comparison-between-different-Observer-Pattern-implementations
    \see http://robdodson.me/javascript-design-patterns-observer/
*/
export default function signal() {
    var slots;

    function signal() {
        if (!slots)
            return false;
        if (typeof slots === 'function')
            slots.apply(null, arguments);
        else {
            var list = slots.slice(); // avoid 'once' side-effects
            for (var i = 0; i < list.length; i++)
                list[i].apply(null, arguments);
        }
        return true;
    }

    signal.connect = function(slot) {
        if (typeof slot !== 'function')
            throw new TypeError('slot must be a function');
        if (!slots)
            slots = slot;
        else if (typeof slots === 'function')
            slots = [slots, slot];
        else
            slots.push(slot);
    };

    signal.disconnect = function(slot) {
        if (typeof slot !== 'function')
            throw new TypeError('slot must be a function');
        if (!slots)
            return;
        if (typeof slots === 'function') {
            if (slot === slots)
                slots = null;
        }
        else {
            for (var i = slots.length; i-- > 0;)
                if (slot === slots[i])
                    slots.splice(i, 1);
            if (slots.length === 1)
                slots = slots[0];
            else if (slots.length === 0)
                slots = null;
        }
    };

    signal.once = function(slot) {
        if (typeof slot !== 'function')
            throw new TypeError('slot must be a function');
        var fired = false;
        function g() {
            if (!fired) {
                fired = true;
                signal.disconnect(g);
                slot.apply(null, arguments);
            }
        }
        g.slot = slot;
        signal.connect(g);
    };

    signal.disconnectAll = function() {
        slots = null;
    };

    signal.slotCount = function() {
        if (!slots)
            return 0;
        if (typeof slots === 'function')
            return 1;
        return slots.length;
    };

    return signal;
}
