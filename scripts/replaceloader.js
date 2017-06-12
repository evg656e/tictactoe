var readline = require('readline');
var fs       = require('fs');
var crypto   = require('crypto');
var lister   = require('./lister').create;

var root = process.argv[2] || '.';

String.prototype.replaceAt = function(pos, n, after) {
    return this.substr(0, pos) + after + this.substr(pos + n);
};

var loaderFile = 'loader.templ.js';
var templ = [];

var beginRx = /function\s+loader\([^)]*\)\s*{/;
var endRx   = /\/\*loader\.\*\/}/;

var StateOut  = 0,
    StateIn   = 1,
    StateDone = 2;

var rl = readline.createInterface({
    input: fs.createReadStream(loaderFile)
});

rl.on('line', function(line) {
    templ.push(line);
});

rl.on('close', function() {
    var ls = lister(root, {
        recursive: true,
        include: [/.*\.js$/],
        exclude: [/\.git.*/, /.*build-.*/, 'node_modules', loaderFile]
    });

    var lastLine = templ.length - 1;

    ls.on('entry', function(path) {
        var rl = readline.createInterface({
            input: fs.createReadStream(path)
        });

        var tmppath = path + '_' + crypto.randomBytes(8).toString('hex');

        var ws = fs.createWriteStream(tmppath);

        function println(str) {
            ws.write(str + '\n');
        }

        console.log('Processing file:', path);

        var state = StateOut;
        var currLine = 0;

        ws.on('close', function() {
            if (state !== StateDone) {
                console.log('File skipped:', path);
                fs.unlink(tmppath, function(err) {
                    if (err)
                        throw err;
                });
                return;
            }
            fs.unlink(path, function() {
                fs.rename(tmppath, path, function(err) {
                    if (err)
                        throw err;
                    console.log('File updated:', path);
                });
            });
        });

        rl.on('line', function(line) {
            var match;
            if (state === StateOut) {
                match = beginRx.exec(line);
                if (match != null) {
                    state = StateIn;
                    println(line.replaceAt(match.index, match[0].length, templ[currLine++]));
                }
            }
            else if (state === StateIn) {
                match = endRx.exec(line);
                if (match != null) {
                    state = StateDone;
                    while (currLine < lastLine)
                        println(templ[currLine++]);
                    println(line.replaceAt(match.index, match[0].length, templ[lastLine]));
                }
                else if (currLine < lastLine) {
                    println(templ[currLine++]);
                }
            }
            else {
                println(line);
            }
        });

        rl.on('close', function() {
            ws.end();
        });
    });
});
