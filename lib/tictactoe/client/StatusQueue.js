import { Signal } from '../../core/Signal';

/*
    \class StatusQueue
*/
export class StatusQueue {
    constructor(parent) {
        this.parent = parent;
        parent.showStatus = new Signal();
        parent.hideStatus = new Signal();
        this.queue = [];
        this.locked = false;

        this.minDisplayTime = StatusQueue.MinDisplayTime;
        this.maxDisplayTime = StatusQueue.MaxDisplayTime;

        this.unlock = this.unlock.bind(this);
    }

    lock() {
        this.locked = true;
        setTimeout(this.unlock, this.minDisplayTime);
    }

    unlock() {
        this.locked = false;
        this.pop();
    }

    startHideTimer() {
        if (this.timerId == null) {
            this.timerId = setTimeout(() => {
                this.parent.hideStatus();
                this.timerId = null;
            }, this.maxDisplayTime);
        }
    }

    stopHideTimer() {
        if (this.timerId != null) {
            clearTimeout(this.timerId);
            this.timerId = null;
        }
    }

    push(status) {
        this.queue.push(status);
        this.pop();
    }

    pop() {
        if (this.locked)
            return;
        var status = this.queue.shift();
        if (!status)
            return;
        this.parent.showStatus(status);
        this.lock();
        this.stopHideTimer();
        if (!status.permanent)
            this.startHideTimer();
    }
}

StatusQueue.MinDisplayTime = 500;
StatusQueue.MaxDisplayTime = 3000;
