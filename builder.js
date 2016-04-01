"use strict";
/// <reference path="./typings/main.d.ts" />
var webpack = require("webpack");
var path = require("path");
var fs = require('fs');
function doBuild() {
    var fullPath = path.resolve(__dirname, './src/main.js');
    var currentDirectory = path.dirname(fullPath);
    var outputPath = __dirname + "/bundle";
    if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath);
    }
    var config = {
        context: currentDirectory,
        entry: fullPath,
        output: {
            path: outputPath,
            filename: "bundle.js"
        },
        resolve: {
            alias: {}
        },
        externals: [
            {
                child_process: true,
                xmlhttprequest: true,
                pluralize: true,
                webpack: true,
                remote: true,
                "./dummyContentLoader": "contentLoader",
                "./resourceRegistry": "resourceRegistry",
                "./TSDeclModel": "TS",
                "./JavaClientSerializer": "JavaSerializer",
                "../../automation/executorDeploy": "executorDeploy",
                './atomWrapper': 'atom',
                '../raml1/atomWrapper': 'atom',
                '../../ramlscript/platformExecution': 'platformExecution',
                './tooltipManager': 'tooltipManagerReq'
            }
        ],
        plugins: [],
        module: {},
        target: "web",
        node: {
            console: false,
            global: true,
            process: true,
            Buffer: true,
            __filename: true,
            __dirname: true,
            setImmediate: true
        }
    };
    webpack(config, function (err, stats) {
        if (err) {
            console.log(err.message);
            return;
        }
        console.log(stats.toString({ reasons: true, errorDetails: true }));
    });
}
exports.doBuild = doBuild;
doBuild();
//# sourceMappingURL=builder.js.map