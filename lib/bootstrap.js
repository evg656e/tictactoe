function bootstrap(root, fac, id, deps, opts) {
    if (typeof id !== 'string') {
        deps = id;
        opts = deps;
        id = undefined;
    }
    deps = (deps || []).map(function(dep) {
        return {
            id: dep.substring(dep.lastIndexOf('/') + 1),
            path: dep.substring(0, dep.lastIndexOf('/') + 1),
            filePath: dep.substring(0, dep.lastIndexOf('/') + 1) + dep.substring(dep.lastIndexOf('/') + 1).toLowerCase() + '.js'
        };
    });
    if (typeof document === 'object' && document.createElement && document.querySelector) {
        bootstrap.scriptLoader = bootstrap.scriptLoader || (function() {
            return {
                modules: [],
                indices: {},
                loading: 0,
                push: function(id, fac, deps) {
                    this.modules.push({ id: id, fac: fac, deps: deps });
                    this.indices[id] = this.modules.length - 1;
                    this.loading++;
                    deps.forEach(function(dep) {
                        this.rearrange(id, dep.id);
                        if (!root[dep.id]) {
                            root[dep.id] = {};
                            this.loading++;
                            var script = document.createElement('script');
                            script.src = this.basePath(id) + dep.filePath;
                            script.onreadystatechange = script.onload = this.pop.bind(this);
                            script.onerror = this.error.bind(this);
                            document.head.appendChild(script);
                        }
                    }.bind(this));
                },
                pop: function() {
                    if (--this.loading === 0) {
                        for (var mod; (mod = this.modules.pop()) !== undefined;) {
                            var res = mod.fac.apply(root, mod.deps.map(function(dep) { return root[dep.id]; }));
                            if (mod.id && res)
                                root[mod.id] = res;
                        }
                        delete bootstrap.scriptLoader;
                    }
                },
                rearrange: function(parentId, childId) {
                    var parentIndex = this.indices[parentId],
                        childIndex = this.indices[childId];
                    if (childIndex !== undefined
                        && parentIndex !== undefined
                        && childIndex < parentIndex) {
                        var mod = this.modules.splice(childIndex, 1)[0];
                        this.modules.splice(parentIndex, 0, mod);
                        this.indices = this.modules.reduce(function(indices, mod, index) { return indices[mod.id] = index, indices; }, {});
                        mod.deps.forEach(function(dep) { this.rearrange(childId, dep.id); }.bind(this));
                    }
                },
                error: function(error) {
                    console.error('The script ' + error.target.src + ' is not accessible.');
                },
                basePath: function(id) {
                    var script = id ? document.querySelector('script[src$="' + id.toLowerCase()  + '.js"]') : id;
                    return script ? script.src.substring(0, script.src.lastIndexOf('/') + 1) : '';
                },
                waitForDomReady: function() {
                    this.loading++;
                    document.addEventListener('DOMContentLoaded', this.pop.bind(this));
                }
            };
        }());
        var waitForDomReady = bootstrap.scriptLoader.loading === 0;
        bootstrap.scriptLoader.push(id, fac, deps);
        if (waitForDomReady)
            bootstrap.scriptLoader.waitForDomReady();
        bootstrap.scriptLoader.pop();
    }
}
