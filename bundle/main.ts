/// <reference path="../typings/main.d.ts" />

import UI = require("atom-ui-lib");

var workspace: AtomCore.IWorkspace = <any>atom.workspace;

function button(name: string, callback?) {
    return new UI.ToggleButton(name ,UI.ButtonSizes.LARGE, UI.ButtonHighlights.INFO, UI.Icon.ALERT, event => callback ? callback() : null)
}

function divWithButton(name) {
    return {element: document.createElement('div').appendChild(button(name).renderUI()), getTitle: () => name};
}


workspace.getActivePane().addItem(divWithButton('Root'), 0);

var pane1 = workspace.getActivePane().splitRight({});

pane1.addItem(divWithButton('Right0'), 0);
pane1.addItem(divWithButton('Right1'), 1);
pane1.addItem(divWithButton('Right2'), 2);

workspace.getActivePane().splitDown({}).addItem(divWithButton('Right-Down'), 0);
workspace.getActivePane().splitDown({}).addItem(divWithButton('Right-Down-Down'), 0);


var pane;

pane = workspace.addModalPanel({item: button('asdadasdasd', () => pane.destroy()).renderUI()});