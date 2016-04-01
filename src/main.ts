import Core = require('./core/atomWrapperWeb');
import UI = require("atom-ui-lib");
import {ButtonSizes} from "atom-ui-lib/dist/UI";

var workspace: Core.Workspace = Core.init();

function button(name: string) {
    return new UI.ToggleButton(name ,UI.ButtonSizes.LARGE, UI.ButtonHighlights.INFO, UI.Icon.ALERT, event => {})
}

function divWithButton(name) {
    return {element: document.createElement('div').appendChild(button(name).renderUI())};
}


workspace.getActivePane().addItem(divWithButton('Root'), 0);

workspace.getActivePane().splitRight({}).addItem(divWithButton('Right'), 0);

workspace.getActivePane().splitDown({}).addItem(divWithButton('Right-Down'), 0);

workspace.addModalPanel({item: button('asdadasdasd').renderUI()});