var fs = require('fs');
var path = require('path');
var EventEmitter = require('events').EventEmitter;

function stringFilter(str, path) {
    return path.endsWith(str);
}

function regexpFilter(rx, path) {
    return rx.test(path);
}

function defaultFilter() {
    return false;
}

function compileFilters(filters) {
    if (!filters)
        return;
    return filters.map(function(arg) {
        switch (Object.prototype.toString.call(arg)) {
        case '[object String]'  : return stringFilter.bind(null, arg);
        case '[object RegExp]'  : return regexpFilter.bind(null, arg);
        case '[object Function]': return arg;
        case '[object Object]'  : return typeof arg.filter === 'function' ? arg.filter.bind(arg) : defaultFilter;
        default: return defaultFilter;
        }
    });
}

function isExcluded(name, options) {
    if (!options.exclude)
        return false;
    return options.exclude.some(function(filter) {
        return filter(name);
    });
}

function isIncluded(name, options) {
    if (!options.include)
        return true;
    return options.include.some(function(filter) {
        return filter(name);
    });
}

function fallDown(parent, options) {
    return !parent || options.recursive;
}

function Lister(root, options) {
    EventEmitter.call(this);
    this.options = options || {};
    this.options.exclude = compileFilters(this.options.exclude);
    this.options.include = compileFilters(this.options.include);
    this.init();
    this.list(root);
}

Lister.prototype = Object.create(EventEmitter.prototype);
Lister.prototype.constructor = Lister;

Lister.create = function(root, options) {
    return new Lister(root, options);
};

Lister.prototype.init = function() {
    this.pending = 0;
};

Lister.prototype.push = function() {
    this.pending++;
};

Lister.prototype.pop = function() {
    if (--this.pending === 0)
        this.emit('end');
};

Lister.prototype.raiseError = function(err, pathname, stat, parent) {
    this.emit('error', err, pathname, stat, parent);
    this.pop();
};

Lister.prototype.list = function(current, parent) {
    this.push();
    fs.stat(current, function(err, stat) {
        if (err) {
            raiseError(err, current, stat, parent);
            return;
        }
        if (isExcluded(current, this.options)) {
            this.pop();
            return;
        }
        if (isIncluded(current, this.options))
            this.emit('entry', current, stat, parent);
        if (stat.isDirectory()
            && fallDown(parent, this.options)) {
            this.push();
            fs.readdir(current, function(err, children) {
                if (err) {
                    raiseError(err, current, stat, parent);
                    return;
                }
                children.forEach(function(child) {
                    this.list(path.join(current, child), current);
                }.bind(this));
                this.pop();
            }.bind(this));
        }
        this.pop();
    }.bind(this));
};

module.exports = Lister;
