"use strict";
var Core = require('./core/atomWrapperWeb');
var UI = require("atom-ui-lib");
var workspace = Core.init();
function button(name) {
    return new UI.ToggleButton(name, UI.ButtonSizes.LARGE, UI.ButtonHighlights.INFO, UI.Icon.ALERT, function (event) { });
}
function divWithButton(name) {
    return { element: document.createElement('div').appendChild(button(name).renderUI()) };
}
workspace.getActivePane().addItem(divWithButton('Root'), 0);
workspace.getActivePane().splitRight({}).addItem(divWithButton('Right'), 0);
workspace.getActivePane().splitDown({}).addItem(divWithButton('Right-Down'), 0);
workspace.addModalPanel({ item: button('asdadasdasd').renderUI() });
//# sourceMappingURL=main.js.map