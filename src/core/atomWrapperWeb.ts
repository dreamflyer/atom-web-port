/// <reference path="../../typings/main.d.ts" />

import path = require("path");
import atomStuff = require('./atomWebStuff');

var global = getGlobal();

export class Workspace {
    textEditor: TextEditor = null;

    rootPane: Pane = null;

    pane: Pane = null;

    container: HTMLDivElement = null;

    updateEverythingCallbacks: any[] = [];
    
    editorsCache: any = {};

    popup: HTMLElement = null;

    modalPanel: HTMLElement = null;

    editors: {};

    didDestroyPaneCallbacks: any[] = [];
    
    constructor() {
        this.initUI();
    }

    getDescriptors() {
        return global.projectDescriptors;
    }
    
    initUI() {
        var AtomTextEditor = this.registerElement('atom-text-editor', HTMLDivElement.prototype);

        AtomTextEditor.prototype.getModel = function() {
            return this.model ? this.model : new atomStuff.AtomTextEditorModel(this);
        };

        var oldSetAttribute = AtomTextEditor.prototype.setAttribute;
        var oldRemoveAttribute = AtomTextEditor.prototype.removeAttribute;

        AtomTextEditor.prototype.setAttribute = function(key, value) {
            oldSetAttribute.apply(this, [key, value]);

            if(key === 'mini') {
                this.getModel().mini = true;
            }

            this.getModel().updateInput();
        }

        AtomTextEditor.prototype.removeAttribute = function(key) {
            oldRemoveAttribute.apply(this, [key]);

            if(key === 'mini') {
                this.getModel().mini = false;
            }

            this.getModel().updateInput();
        }

        Object.defineProperty(AtomTextEditor.prototype, "textContent", {
            get: function() {
                return this.getModel().getText();
            },

            set: function(value) {
                this.getModel().setText(value);
            }
        });

        this.registerElement('atom-workspace', HTMLDivElement.prototype);
        this.registerElement('atom-workspace-axis', HTMLDivElement.prototype);
        this.registerElement('atom-panel-container', HTMLDivElement.prototype);
        this.registerElement('atom-panel', HTMLDivElement.prototype);
        this.registerElement('atom-pane-container', HTMLDivElement.prototype);
        this.registerElement('atom-pane-axis', HTMLDivElement.prototype);
        this.registerElement('atom-pane', HTMLDivElement.prototype);

        this.container = <HTMLDivElement>document.getElementById('root-pane-container');
        
        this.modalPanel = document.getElementById('modal-panel');

        this.modalPanel.style.display = 'none';

        this.clear();
    }

    clear() {
        if(this.rootPane) {
            this.rootPane.destroy();
        }

        (<any>this.container).innerHTML = '';

        this.rootPane = new Pane('main', this.container, this, null);

        this.pane = this.rootPane;
    }

    doUpdate() {
        this.updateEverythingCallbacks.forEach(callback => {
            callback();
        });
    }

    addModalPanel(itemHolder: any) {
        this.popup = itemHolder.item;

        this.modalPanel.appendChild(this.popup);

        this.modalPanel.style.display = null;

        return {
            destroy: () => {
                this.modalPanel.style.display = 'none';

                if(this.popup.parentElement) {
                    this.modalPanel.removeChild(this.popup);
                }
            }
        }
    }

    bottomPanel: HTMLElement = document.getElementById('bottom-panel');
    bottomPane: HTMLElement = null;

    addBottomPanel(itemHolder: any) {
        this.bottomPane = itemHolder.item.element;

        this.bottomPane.setAttribute('is', 'space-pen-div');

        this.bottomPane.className = 'raml-console pane-item';

        this.bottomPane.style.overflow = 'scroll';

        document.getElementById('bottom-panel-container').style.flexBasis = '170px';
        (<any>document).getElementById('bottom-panel-container').style.webkitFlexBasis = '170px';

        this.bottomPanel.appendChild(this.bottomPane);

        return {
            destroy: () => {
                this.bottomPanel.removeChild(this.bottomPane);

                document.getElementById('bottom-panel-container').style.flexBasis = '0px';
                (<any>document).getElementById('bottom-panel-container').style.webkitFlexBasis = '0px';
            }
        }
    }
    
    private registerElement(name: string, prototype, ext?: string): any {
        var config = {prototype: Object.create(prototype)}

        if(ext) {
            config['extends'] = ext;
        }

        return (<any>document).registerElement(name, config);
    }

    getActiveTextEditor(): TextEditor {
        return this.textEditor;
    }

    getTextEditors() {
        return this.textEditor ? [this.textEditor] : [];
    }

    onDidChangeActivePaneItem(callback: (arg:any) => void) {
        this.updateEverythingCallbacks.push(callback);

        return {
            dispose: () => {
                this.updateEverythingCallbacks = this.updateEverythingCallbacks.filter(child => {
                    return child !== callback;
                });
            }
        }
    }

    onDidAddPaneItem(callback: any) {
        console.log("TODO: may be need to implement onDidAddPaneItem method.");
    }

    onDidDestroyPane(callback: any) {
        this.didDestroyPaneCallbacks[0] = callback;
    }

    getActivePane(): Pane {
        return this.pane;
    }

    setActivePane(pane:Pane):void {
        this.pane = pane;
    }

    doCache(key:string, content: string) {
        this.editorsCache[key] = content;
    }

    getFromCache(key:string): string {
        return this.editorsCache[key];
    }
    
    paneForItem(item: any) {
        return item.pane;
    }

    paneDestroyed(pane: Pane) {
        if(pane.destroyed) {
            return;
        }

        this.didDestroyPaneCallbacks.forEach(callback => {
            callback({pane: pane});
        });
    }

    getPaneItems(pane?: Pane) {
        var actualPane = pane ? pane : this.rootPane;

        var result = [];

        if(actualPane) {
            Object.keys(actualPane.items).forEach(key=> {
                if(!actualPane.items[key]) {
                    return;
                }

                result.push(actualPane.items[key]);
            });

            actualPane.children.forEach(child => {
                result.push(this.getPaneItems(child));
            });
        }

        return result;
    }

    getActivePaneItem() {
        return null;
    }

    paneForURI(uri: string) {
        return null;
    }

    observeTextEditors(callback) {
        return {
            dispose: () => {}
        }
    }
}

class Pane {
    items:any =  {};

    id:string;
    parent: HTMLDivElement;
    workspace: Workspace;
    arg:any;

    container: HTMLDivElement;
    axis: HTMLDivElement;
    views: HTMLDivElement;

    children: Pane[] = [];

    destroyed = false;

    constructor(id: string, parentNode:HTMLDivElement, workspace:Workspace, arg:any) {
        this.id = id;
        this.parent = parentNode;
        this.workspace = workspace;
        this.arg = arg;

        workspace.setActivePane(this);

        this.container = <HTMLDivElement>document.createElement('atom-pane');
        this.container.className = 'pane';
        this.container.id = id;

        this.views = document.createElement('div');
        this.views.className = 'item-views';

        this.parent.appendChild(this.container);

        this.container.appendChild(this.views);
    }

    destroy() {
        this.children.forEach(child=> {
            child.destroy();
        });

        this.children = [];


        var items = this.items;

        Object.keys(items).forEach(key => {
            var item = items[key];

            item.pane = null;

            if(item && item.destroy) {
                item.destroy();
            }
        });

        this.items = {};

        this.destroyed = true;

        if(this.container.parentElement) {
            this.container.parentElement.removeChild(this.container);
        }

        workspace.paneDestroyed(this);
    }

    splitUp(arg: any): Pane {
        return this.newPane('up', arg);
    }

    splitDown(arg: any): Pane {
        return this.newPane('down', arg);
    }

    splitLeft(arg: any): Pane {
        return this.newPane('left', arg);
    }

    splitRight(arg: any): Pane {
        return this.newPane('right', arg);
    }

    newPane(id: string, arg:any):Pane {
        this.axis = <HTMLDivElement>document.createElement('atom-pane-axis');

        this.axis.className = id === 'left' || id === 'right' ? 'horizontal pane-row' : 'vertical pane-column';

        if(this.id === 'main-right') {
            this.axis.id = 'editor-tools-axis';
        }

        this.parent.replaceChild(this.axis, this.container);

        this.axis.appendChild(this.container);

        var result: Pane = new Pane(this.id + '-' + id, this.axis, this.workspace, arg);

        this.children.push(result);

        return result;
    }

    addItem(item:any, index:number) {
        if(this.items[index]) {
            this.views.removeChild(this.items[index].element);
        }

        this.items[index] = item;

        item.pane = this;

        this.views.appendChild(item.element);

        if(!isMutationSupport) {
            item.element.dispatchEvent(new global.Event("DOMNodeInserted"));
        }
    }

    activate() {

    }
}

interface Point {
    row:number;
    column:number;
}

interface Range {
    start:Point;
    end:Point;
}

interface IChangeCommand{
    newText:string;
    oldText:string;

    oldRange:Range;
    newRange:Range;
}

class TextBuffer {
    text:string = '';

    didChangecallbacks: any[] = [];

    stopChangingCallbacks: any[] = [];

    constructor(text:string) {
        this.text = text;
    }

    onDidChange(callback: any) {
        this.didChangecallbacks.push(callback);
    }

    getText(): string {
        return this.text;
    }

    doChange(arg: any) {
        this.didChangecallbacks.forEach(callback=>{
            var text = null;

            var lines: any[] = arg.lines;

            lines.forEach(line=> {
                text = text === null ? line : (text + '\n' + line);
            });

            var cmd: IChangeCommand = {
                newText: arg.action === 'insert' ? text : '',
                oldText: arg.action === 'remove' ? text : '',
                newRange: null,
                oldRange: <Range>{start: (arg.start), end: arg.end}
            };

            callback(cmd);
        })

        this.doStopChanging(arg);
    }

    doStopChanging(arg: any) {
        this.stopChangingCallbacks.forEach(callback=>{
            callback(null);
        })
    }

    onDidStopChanging(callback: any) {
        this.stopChangingCallbacks.push(callback);

        return {
            dispose: () => {
                this.stopChangingCallbacks = this.stopChangingCallbacks.filter(child => {
                    return child !== callback;
                });
            }
        }
    }

    characterIndexForPosition: any;

    positionForCharacterIndex: any;

    setTextInRange: any;
}

class TextEditorCursor {
    editor: TextEditor;

    changePositionCallbacks: any[] = [];

    constructor(editor: TextEditor) {
        this.editor = editor;
    }

    onDidChangePosition(callback: any) {
        this.changePositionCallbacks.push(callback);

        return {
            dispose: () => {
                this.changePositionCallbacks = this.changePositionCallbacks.filter(child => {
                    return child !== callback;
                });
            }
        }
    }

    getBufferPosition(): Point {
        return this.editor.getCursorBufferPosition();
    }

    doChangePosition() {
       this.changePositionCallbacks.forEach(callback => {
           callback();
       });
    }
}

function getRange(row1, col1, row2, col2): Range {
    var point1: Point = {row: row1, column: col1};
    var point2: Point = {row: row2, column: col2};

    return <Range>(isCorrectOrder(point1, point2) ? {start: point1, end: point2} : {start: point2, end: point1});
}

function isCorrectOrder(point1: Point, point2: Point): boolean {
    if(point1.row < point2.row) {
        return true;
    }

    if(point1.row > point2.row) {
        return false;
    }

    return point1.column < point2.column;
}

export class TextEditor {
    textBuffer: TextBuffer;

    editorPath: string;

    extension: string;

    dirtyState: boolean = false;

    element: HTMLElement = document.createElement('div');

    textElement: HTMLElement =  document.createElement('div');

    ace: any;

    aceEditor: any;

    cursor: TextEditorCursor;

    id: string;

    contextMenu = null;

    destroyCallbacks = [];

    grammar: any = {
        scopeName: 'no-grammar'
    }
    constructor(editorPath: string, id: string = 'ace_editor') {
        this.editorPath = editorPath;

        this.id = editorPath;

        this['soft-tabs'] = {};

        this.textElement.className = 'editor';

        this.textElement.style.position = 'relative';
        this.textElement.style.width = '100%';
        this.textElement.style.flex = '1';

        (<any>this).textElement.style.webkitFlex = '1';

        this.textElement.id = id;

        this.extension = path.extname(editorPath);

        this.grammar.scopeName = 'source' + this.extension;

        this.element.style.position = 'relative';
        this.element.style.width = '100%';

        this.element.className = 'text-editor-wrapper';
        this.element.style.display = 'flex';
        this.element.style.display = '-webkit-flex';

        this.element.appendChild(this.textElement);

        var textEditor = this;
    }

    onDidChangeCursorPosition(callback) {
        return this.getLastCursor().onDidChangePosition(callback);
    }

    menuItems() {
        var assistUtils = getLazy('assistUtils');

        var result = [
            {
                label: 'Goto Declaration',
                icon: 'ui-icon-home',
                handler: assistUtils.gotoDeclaration
            }, {
                label: 'Find Usages',
                icon: 'ui-icon-search',
                handler: assistUtils.findUsages
            }, {
                label: 'Rename',
                icon: 'ui-icon-tag',
                handler: assistUtils.renameRAMLElement
            }
        ];

        return result;
    }

    doSave() {
        
    }

    getPath():string {
        return this.editorPath;
    }

    getBuffer(): any {
        return this.textBuffer;
    }

    getLastCursor(): TextEditorCursor {
        if(!this.cursor) {
            this.cursor = new TextEditorCursor(this);
        }

        return this.cursor;
    }

    getCursorBufferPosition(): Point {
        var acePosition: Point = <Point>this.aceEditor.getCursorPosition();

        return {column: acePosition.column, row: acePosition.row};
    }

    setCursorBufferPosition(position: Point) {
        this.setSelectedBufferRange(<Range>{start: position, end: position}, null);
    }

    setSelectedBufferRange(range: Range, arg: any) {
        var AceRange = this.ace.require("ace/range").Range;

        var preparedRange: Range = getRange(range.start.row + 1, range.start.column, range.end.row + 1, range.end.column);

        var aceRange = new AceRange(preparedRange.start.row, preparedRange.start.column, preparedRange.end.row, preparedRange.end.column);

        this.aceEditor.resize(true);

        this.aceEditor.selection.setRange(aceRange);

        this.aceEditor.gotoLine(preparedRange.start.row, preparedRange.start.column, true);
    }
    
    getText(): string {
        return this.getBuffer().getText();
    }

    setText(text) {
        this.getBuffer().setText(text);
    }

    insertText(text:string) {
        this.aceEditor.insert(text);
    }

    getGrammar() {
        return this.grammar;
    }

    onDidStopChanging(callback) {
        return this.textBuffer.onDidStopChanging(callback);
    }

    onDidDestroy(callback) {
        this.destroyCallbacks.push(callback);

        return {
            dispose: () => {
                this.destroyCallbacks = this.destroyCallbacks.filter(child => {
                    return child !== callback;
                });
            }
        }
    }

    onDidChangePath(callback) {
        return {
            dispose: function() {}
        }
    }

    destroy() {
        this.destroyCallbacks.forEach(callback => callback());
    }
}

function getActionsTree(actions) {
    var actionsTree = {children: [], categories: {}};

    actions.forEach(action => {
        if(action.category && action.category.length > 0) {
            var current = actionsTree;

            for(var i = 0; i < action.category.length; i++) {
                var name = action.category[i];

                if(!current.categories[name]) {
                    var newCategory = {title: name, children: [], categories: {}};

                    current.categories[name] = newCategory;

                    current.children.push(newCategory);
                }

                current = current.categories[action.category[i]];
            }

            current.children.push(actionToItem(action));
        } else {
            actionsTree.children.push(actionToItem(action));
        }
    });

    return actionsTree.children;
}

function actionToItem(action) {
    return {
        title: action.name,
        action: action.onClick ? action.onClick : () => {},
        uiIcon: null
    }
}

function registerMenu(container, selector: string, actions: any[], beforeOpen, position?) {
    var menuItems = actions.map((menuItem) => {
        return <any>{
            title: menuItem.label,
            action: menuItem.handler,
            uiIcon: menuItem.icon,
            children: menuItem.children
        }
    });
}



class Deserializers {
    add(arg: any) {

    }
}

class TabViewer {
    element: HTMLDivElement = document.createElement('div');

    handles: {name: string; id: string;}[] = [];

    onOpen: (id: string) => void;
    onClose: (id: string) => void;

    constructor(onOpen: (id: string) => void, onClose: (id: string) => void) {
        this.onOpen = onOpen;
        this.onClose = onClose;

        this.element.style.position = 'relative';
        this.element.style.width = '100%';
        this.element.style.backgroundColor = 'black';
        this.element.id = "custom-tab-viewer";
    }

    open(id: string, name: string) {
        var active = {name: name, id: id, active: true};

        var oldHandles = this.handles;

        this.handles = [];

        var contains = false;

        oldHandles.forEach(handle => {
            this.handles.push(handle);

            var isActive = (handle.id === active.id);

            (<any>handle).active = isActive;

            if(isActive) {
                contains = true;
            }
        });

        if(!contains) {
            this.handles.push(active);
        }

        this.refresh();

        this.onOpen(active.id);
    }

    setDirty(dirties: string[]) {
        this.handles.forEach(handle => {
            (<any>handle).setDirty(dirties.indexOf(handle.id) >= 0);
        });
    }

    refresh() {
        
    }

    close(id: string) {
        var oldHandles = this.handles;

        this.handles = [];

        var activeClosed = false;

        oldHandles.forEach(handle => {
            if(handle.id !== id) {
                this.handles.push(handle);
            } else if((<any>handle).active) {
                activeClosed = true;
            }
        });

        if(this.handles.length > 0 && activeClosed) {
            (<any>this.handles[0]).active = true;
        }

        this.refresh();

        this.onClose(this.handles.length > 0 ? this.handles[0].id : null);
    }
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function showLoading() {
    document.getElementById("loading-gif").style.display = null;
}

function hideLoading() {
    document.getElementById("loading-gif").style.display = "none";
}


function areMutationEventsAvailable() {
    var result = false;

    var testElement = document.createElement('div');

    testElement.addEventListener('DOMNodeInserted', function() {
        result = true;
    });

    document.body.appendChild(testElement);
    document.body.removeChild(testElement);

    return result;
}

var isMutationSupport = areMutationEventsAvailable();

var idx = getParameterByName('project');

function isSimpleMode() {
    try {
        return global.atomMode === 'spec' || global.atomMode === 'newSpec';
    } catch(exception) {
        return false;
    }
}

export var config = {
    grammars: {
        'api-workbench.grammars': ['source.raml']
    },

    get: function(key) {
        return this.grammars[key];
    }
}

export var grammars = {
    grammarsByScopeName: {
        'text.xml': {scopeName: 'text.xml', fileTypes: ['xml']},
        'source.json': {scopeName: 'source.json', fileTypes: ['json']},
        'text.plain.null-grammar': {scopeName: 'text.plain.null-grammar', fileTypes: []}
    },

    getGrammars: function() {
        var result = [];

        Object.keys(this.grammarsByScopeName).forEach(key => {
            result.push(this.grammarsByScopeName[key]);
        });

        return result;
    }
}

export var deserializers = new Deserializers();

export var commands = {add: () => {}};

function getGlobal() {
    var globalGetter = function() {
        return this;
    }

    return globalGetter.apply(null);
}

(<any>window).remote = {require: () => new Object()};

function getLazy(moduleId) {
    return global.getLazy(moduleId);
}

export var workspace: Workspace;

export function init() {
    if(workspace) {
        return workspace;
    }
    
    workspace = new Workspace();
    
    return workspace;
}