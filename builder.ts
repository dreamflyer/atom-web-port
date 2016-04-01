/// <reference path="./typings/main.d.ts" />
var webpack = require("webpack");

import path =require("path");
import fs = require('fs');

export function doBuild() {
    var fullPath = path.resolve(__dirname, './src/main.js');

    var currentDirectory = path.dirname(fullPath);

    var outputPath = __dirname + "/bundle";

    if(!fs.existsSync(outputPath)) {
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
            alias: {
                // atom: path.resolve(__dirname, './UI.js'),
                // pathwatcher: path.resolve(__dirname, './pathwatcherWeb.js'),
                // fs: path.resolve(__dirname, './webFs.js'),
                // 'atom-space-pen-views': path.resolve(__dirname, './spacePenViewsWeb.js'),
                // 'webFsPort': currentDirectory + "/bundled/webFsPort.js",
                // dummyContentLoader: path.resolve(__dirname, needServer ? './dummyContentLoader.js' : './embedContentLoader.js')
            }
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

        plugins: [
            //new webpack.optimize.UglifyJsPlugin({
            //    minimize: false,
            //    output: {comments: false},
            //    sourceMap: false
            //}),

            // new StringReplacePlugin(),

            // new webpack.DefinePlugin({
            //     'process.platform': {
            //         match: function(arg) {
            //
            //         }
            //     },
            //     'process.env': {
            //         'HOME': '"/virtual"'
            //     },
            //     'global.WeakMap': null
            // })
        ],

        module: {

        },

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

doBuild();