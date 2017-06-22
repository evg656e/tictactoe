const ConcatSource = require("webpack-sources").ConcatSource;

class QmlPragmaLibraryWebpackPlugin {
	apply(compiler) {
		compiler.plugin("compilation", (compilation) => {
            compilation.plugin("optimize-chunk-assets", (chunks, callback) => {
                chunks.forEach((chunk) => {
                    chunk.files.forEach((file) => {
                        compilation.assets[file] = new ConcatSource(".pragma library", "\n", compilation.assets[file]);
                    });
                });
                callback();
            });
		});
	}
}

module.exports = QmlPragmaLibraryWebpackPlugin;
