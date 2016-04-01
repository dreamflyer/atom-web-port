/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Core = __webpack_require__(1);
	var UI = __webpack_require__(5);
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

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/// <reference path="../../typings/main.d.ts" />
	"use strict";
	var path = __webpack_require__(2);
	var atomStuff = __webpack_require__(4);
	var global = getGlobal();
	var Workspace = (function () {
	    function Workspace() {
	        this.textEditor = null;
	        this.rootPane = null;
	        this.pane = null;
	        this.container = null;
	        this.updateEverythingCallbacks = [];
	        this.editorsCache = {};
	        this.popup = null;
	        this.modalPanel = null;
	        this.didDestroyPaneCallbacks = [];
	        this.bottomPanel = document.getElementById('bottom-panel');
	        this.bottomPane = null;
	        this.initUI();
	    }
	    Workspace.prototype.getDescriptors = function () {
	        return global.projectDescriptors;
	    };
	    Workspace.prototype.initUI = function () {
	        var AtomTextEditor = this.registerElement('atom-text-editor', HTMLDivElement.prototype);
	        AtomTextEditor.prototype.getModel = function () {
	            return this.model ? this.model : new atomStuff.AtomTextEditorModel(this);
	        };
	        var oldSetAttribute = AtomTextEditor.prototype.setAttribute;
	        var oldRemoveAttribute = AtomTextEditor.prototype.removeAttribute;
	        AtomTextEditor.prototype.setAttribute = function (key, value) {
	            oldSetAttribute.apply(this, [key, value]);
	            if (key === 'mini') {
	                this.getModel().mini = true;
	            }
	            this.getModel().updateInput();
	        };
	        AtomTextEditor.prototype.removeAttribute = function (key) {
	            oldRemoveAttribute.apply(this, [key]);
	            if (key === 'mini') {
	                this.getModel().mini = false;
	            }
	            this.getModel().updateInput();
	        };
	        Object.defineProperty(AtomTextEditor.prototype, "textContent", {
	            get: function () {
	                return this.getModel().getText();
	            },
	            set: function (value) {
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
	        this.container = document.getElementById('root-pane-container');
	        this.modalPanel = document.getElementById('modal-panel');
	        this.modalPanel.style.display = 'none';
	        this.clear();
	    };
	    Workspace.prototype.clear = function () {
	        if (this.rootPane) {
	            this.rootPane.destroy();
	        }
	        this.container.innerHTML = '';
	        this.rootPane = new Pane('main', this.container, this, null);
	        this.pane = this.rootPane;
	    };
	    Workspace.prototype.doUpdate = function () {
	        this.updateEverythingCallbacks.forEach(function (callback) {
	            callback();
	        });
	    };
	    Workspace.prototype.addModalPanel = function (itemHolder) {
	        var _this = this;
	        this.popup = itemHolder.item;
	        this.modalPanel.appendChild(this.popup);
	        this.modalPanel.style.display = null;
	        return {
	            destroy: function () {
	                _this.modalPanel.style.display = 'none';
	                if (_this.popup.parentElement) {
	                    _this.modalPanel.removeChild(_this.popup);
	                }
	            }
	        };
	    };
	    Workspace.prototype.addBottomPanel = function (itemHolder) {
	        var _this = this;
	        this.bottomPane = itemHolder.item.element;
	        this.bottomPane.setAttribute('is', 'space-pen-div');
	        this.bottomPane.className = 'raml-console pane-item';
	        this.bottomPane.style.overflow = 'scroll';
	        document.getElementById('bottom-panel-container').style.flexBasis = '170px';
	        document.getElementById('bottom-panel-container').style.webkitFlexBasis = '170px';
	        this.bottomPanel.appendChild(this.bottomPane);
	        return {
	            destroy: function () {
	                _this.bottomPanel.removeChild(_this.bottomPane);
	                document.getElementById('bottom-panel-container').style.flexBasis = '0px';
	                document.getElementById('bottom-panel-container').style.webkitFlexBasis = '0px';
	            }
	        };
	    };
	    Workspace.prototype.registerElement = function (name, prototype, ext) {
	        var config = { prototype: Object.create(prototype) };
	        if (ext) {
	            config['extends'] = ext;
	        }
	        return document.registerElement(name, config);
	    };
	    Workspace.prototype.getActiveTextEditor = function () {
	        return this.textEditor;
	    };
	    Workspace.prototype.getTextEditors = function () {
	        return this.textEditor ? [this.textEditor] : [];
	    };
	    Workspace.prototype.onDidChangeActivePaneItem = function (callback) {
	        var _this = this;
	        this.updateEverythingCallbacks.push(callback);
	        return {
	            dispose: function () {
	                _this.updateEverythingCallbacks = _this.updateEverythingCallbacks.filter(function (child) {
	                    return child !== callback;
	                });
	            }
	        };
	    };
	    Workspace.prototype.onDidAddPaneItem = function (callback) {
	        console.log("TODO: may be need to implement onDidAddPaneItem method.");
	    };
	    Workspace.prototype.onDidDestroyPane = function (callback) {
	        this.didDestroyPaneCallbacks[0] = callback;
	    };
	    Workspace.prototype.getActivePane = function () {
	        return this.pane;
	    };
	    Workspace.prototype.setActivePane = function (pane) {
	        this.pane = pane;
	    };
	    Workspace.prototype.doCache = function (key, content) {
	        this.editorsCache[key] = content;
	    };
	    Workspace.prototype.getFromCache = function (key) {
	        return this.editorsCache[key];
	    };
	    Workspace.prototype.paneForItem = function (item) {
	        return item.pane;
	    };
	    Workspace.prototype.paneDestroyed = function (pane) {
	        if (pane.destroyed) {
	            return;
	        }
	        this.didDestroyPaneCallbacks.forEach(function (callback) {
	            callback({ pane: pane });
	        });
	    };
	    Workspace.prototype.getPaneItems = function (pane) {
	        var _this = this;
	        var actualPane = pane ? pane : this.rootPane;
	        var result = [];
	        if (actualPane) {
	            Object.keys(actualPane.items).forEach(function (key) {
	                if (!actualPane.items[key]) {
	                    return;
	                }
	                result.push(actualPane.items[key]);
	            });
	            actualPane.children.forEach(function (child) {
	                result.push(_this.getPaneItems(child));
	            });
	        }
	        return result;
	    };
	    Workspace.prototype.getActivePaneItem = function () {
	        return null;
	    };
	    Workspace.prototype.paneForURI = function (uri) {
	        return null;
	    };
	    Workspace.prototype.observeTextEditors = function (callback) {
	        return {
	            dispose: function () { }
	        };
	    };
	    return Workspace;
	}());
	exports.Workspace = Workspace;
	var Pane = (function () {
	    function Pane(id, parentNode, workspace, arg) {
	        this.items = {};
	        this.children = [];
	        this.destroyed = false;
	        this.id = id;
	        this.parent = parentNode;
	        this.workspace = workspace;
	        this.arg = arg;
	        workspace.setActivePane(this);
	        this.container = document.createElement('atom-pane');
	        this.container.className = 'pane';
	        this.container.id = id;
	        this.views = document.createElement('div');
	        this.views.className = 'item-views';
	        this.parent.appendChild(this.container);
	        this.container.appendChild(this.views);
	    }
	    Pane.prototype.destroy = function () {
	        this.children.forEach(function (child) {
	            child.destroy();
	        });
	        this.children = [];
	        var items = this.items;
	        Object.keys(items).forEach(function (key) {
	            var item = items[key];
	            item.pane = null;
	            if (item && item.destroy) {
	                item.destroy();
	            }
	        });
	        this.items = {};
	        this.destroyed = true;
	        if (this.container.parentElement) {
	            this.container.parentElement.removeChild(this.container);
	        }
	        exports.workspace.paneDestroyed(this);
	    };
	    Pane.prototype.splitUp = function (arg) {
	        return this.newPane('up', arg);
	    };
	    Pane.prototype.splitDown = function (arg) {
	        return this.newPane('down', arg);
	    };
	    Pane.prototype.splitLeft = function (arg) {
	        return this.newPane('left', arg);
	    };
	    Pane.prototype.splitRight = function (arg) {
	        return this.newPane('right', arg);
	    };
	    Pane.prototype.newPane = function (id, arg) {
	        this.axis = document.createElement('atom-pane-axis');
	        this.axis.className = id === 'left' || id === 'right' ? 'horizontal pane-row' : 'vertical pane-column';
	        if (this.id === 'main-right') {
	            this.axis.id = 'editor-tools-axis';
	        }
	        this.parent.replaceChild(this.axis, this.container);
	        this.axis.appendChild(this.container);
	        var result = new Pane(this.id + '-' + id, this.axis, this.workspace, arg);
	        this.children.push(result);
	        return result;
	    };
	    Pane.prototype.addItem = function (item, index) {
	        if (this.items[index]) {
	            this.views.removeChild(this.items[index].element);
	        }
	        this.items[index] = item;
	        item.pane = this;
	        this.views.appendChild(item.element);
	        if (!isMutationSupport) {
	            item.element.dispatchEvent(new global.Event("DOMNodeInserted"));
	        }
	    };
	    Pane.prototype.activate = function () {
	    };
	    return Pane;
	}());
	var TextBuffer = (function () {
	    function TextBuffer(text) {
	        this.text = '';
	        this.didChangecallbacks = [];
	        this.stopChangingCallbacks = [];
	        this.text = text;
	    }
	    TextBuffer.prototype.onDidChange = function (callback) {
	        this.didChangecallbacks.push(callback);
	    };
	    TextBuffer.prototype.getText = function () {
	        return this.text;
	    };
	    TextBuffer.prototype.doChange = function (arg) {
	        this.didChangecallbacks.forEach(function (callback) {
	            var text = null;
	            var lines = arg.lines;
	            lines.forEach(function (line) {
	                text = text === null ? line : (text + '\n' + line);
	            });
	            var cmd = {
	                newText: arg.action === 'insert' ? text : '',
	                oldText: arg.action === 'remove' ? text : '',
	                newRange: null,
	                oldRange: { start: (arg.start), end: arg.end }
	            };
	            callback(cmd);
	        });
	        this.doStopChanging(arg);
	    };
	    TextBuffer.prototype.doStopChanging = function (arg) {
	        this.stopChangingCallbacks.forEach(function (callback) {
	            callback(null);
	        });
	    };
	    TextBuffer.prototype.onDidStopChanging = function (callback) {
	        var _this = this;
	        this.stopChangingCallbacks.push(callback);
	        return {
	            dispose: function () {
	                _this.stopChangingCallbacks = _this.stopChangingCallbacks.filter(function (child) {
	                    return child !== callback;
	                });
	            }
	        };
	    };
	    return TextBuffer;
	}());
	var TextEditorCursor = (function () {
	    function TextEditorCursor(editor) {
	        this.changePositionCallbacks = [];
	        this.editor = editor;
	    }
	    TextEditorCursor.prototype.onDidChangePosition = function (callback) {
	        var _this = this;
	        this.changePositionCallbacks.push(callback);
	        return {
	            dispose: function () {
	                _this.changePositionCallbacks = _this.changePositionCallbacks.filter(function (child) {
	                    return child !== callback;
	                });
	            }
	        };
	    };
	    TextEditorCursor.prototype.getBufferPosition = function () {
	        return this.editor.getCursorBufferPosition();
	    };
	    TextEditorCursor.prototype.doChangePosition = function () {
	        this.changePositionCallbacks.forEach(function (callback) {
	            callback();
	        });
	    };
	    return TextEditorCursor;
	}());
	function getRange(row1, col1, row2, col2) {
	    var point1 = { row: row1, column: col1 };
	    var point2 = { row: row2, column: col2 };
	    return (isCorrectOrder(point1, point2) ? { start: point1, end: point2 } : { start: point2, end: point1 });
	}
	function isCorrectOrder(point1, point2) {
	    if (point1.row < point2.row) {
	        return true;
	    }
	    if (point1.row > point2.row) {
	        return false;
	    }
	    return point1.column < point2.column;
	}
	var TextEditor = (function () {
	    function TextEditor(editorPath, id) {
	        if (id === void 0) { id = 'ace_editor'; }
	        this.dirtyState = false;
	        this.element = document.createElement('div');
	        this.textElement = document.createElement('div');
	        this.contextMenu = null;
	        this.destroyCallbacks = [];
	        this.grammar = {
	            scopeName: 'no-grammar'
	        };
	        this.editorPath = editorPath;
	        this.id = editorPath;
	        this['soft-tabs'] = {};
	        this.textElement.className = 'editor';
	        this.textElement.style.position = 'relative';
	        this.textElement.style.width = '100%';
	        this.textElement.style.flex = '1';
	        this.textElement.style.webkitFlex = '1';
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
	    TextEditor.prototype.onDidChangeCursorPosition = function (callback) {
	        return this.getLastCursor().onDidChangePosition(callback);
	    };
	    TextEditor.prototype.menuItems = function () {
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
	    };
	    TextEditor.prototype.doSave = function () {
	    };
	    TextEditor.prototype.getPath = function () {
	        return this.editorPath;
	    };
	    TextEditor.prototype.getBuffer = function () {
	        return this.textBuffer;
	    };
	    TextEditor.prototype.getLastCursor = function () {
	        if (!this.cursor) {
	            this.cursor = new TextEditorCursor(this);
	        }
	        return this.cursor;
	    };
	    TextEditor.prototype.getCursorBufferPosition = function () {
	        var acePosition = this.aceEditor.getCursorPosition();
	        return { column: acePosition.column, row: acePosition.row };
	    };
	    TextEditor.prototype.setCursorBufferPosition = function (position) {
	        this.setSelectedBufferRange({ start: position, end: position }, null);
	    };
	    TextEditor.prototype.setSelectedBufferRange = function (range, arg) {
	        var AceRange = this.ace.require("ace/range").Range;
	        var preparedRange = getRange(range.start.row + 1, range.start.column, range.end.row + 1, range.end.column);
	        var aceRange = new AceRange(preparedRange.start.row, preparedRange.start.column, preparedRange.end.row, preparedRange.end.column);
	        this.aceEditor.resize(true);
	        this.aceEditor.selection.setRange(aceRange);
	        this.aceEditor.gotoLine(preparedRange.start.row, preparedRange.start.column, true);
	    };
	    TextEditor.prototype.getText = function () {
	        return this.getBuffer().getText();
	    };
	    TextEditor.prototype.setText = function (text) {
	        this.getBuffer().setText(text);
	    };
	    TextEditor.prototype.insertText = function (text) {
	        this.aceEditor.insert(text);
	    };
	    TextEditor.prototype.getGrammar = function () {
	        return this.grammar;
	    };
	    TextEditor.prototype.onDidStopChanging = function (callback) {
	        return this.textBuffer.onDidStopChanging(callback);
	    };
	    TextEditor.prototype.onDidDestroy = function (callback) {
	        var _this = this;
	        this.destroyCallbacks.push(callback);
	        return {
	            dispose: function () {
	                _this.destroyCallbacks = _this.destroyCallbacks.filter(function (child) {
	                    return child !== callback;
	                });
	            }
	        };
	    };
	    TextEditor.prototype.onDidChangePath = function (callback) {
	        return {
	            dispose: function () { }
	        };
	    };
	    TextEditor.prototype.destroy = function () {
	        this.destroyCallbacks.forEach(function (callback) { return callback(); });
	    };
	    return TextEditor;
	}());
	exports.TextEditor = TextEditor;
	function getActionsTree(actions) {
	    var actionsTree = { children: [], categories: {} };
	    actions.forEach(function (action) {
	        if (action.category && action.category.length > 0) {
	            var current = actionsTree;
	            for (var i = 0; i < action.category.length; i++) {
	                var name = action.category[i];
	                if (!current.categories[name]) {
	                    var newCategory = { title: name, children: [], categories: {} };
	                    current.categories[name] = newCategory;
	                    current.children.push(newCategory);
	                }
	                current = current.categories[action.category[i]];
	            }
	            current.children.push(actionToItem(action));
	        }
	        else {
	            actionsTree.children.push(actionToItem(action));
	        }
	    });
	    return actionsTree.children;
	}
	function actionToItem(action) {
	    return {
	        title: action.name,
	        action: action.onClick ? action.onClick : function () { },
	        uiIcon: null
	    };
	}
	function registerMenu(container, selector, actions, beforeOpen, position) {
	    var menuItems = actions.map(function (menuItem) {
	        return {
	            title: menuItem.label,
	            action: menuItem.handler,
	            uiIcon: menuItem.icon,
	            children: menuItem.children
	        };
	    });
	}
	var Deserializers = (function () {
	    function Deserializers() {
	    }
	    Deserializers.prototype.add = function (arg) {
	    };
	    return Deserializers;
	}());
	var TabViewer = (function () {
	    function TabViewer(onOpen, onClose) {
	        this.element = document.createElement('div');
	        this.handles = [];
	        this.onOpen = onOpen;
	        this.onClose = onClose;
	        this.element.style.position = 'relative';
	        this.element.style.width = '100%';
	        this.element.style.backgroundColor = 'black';
	        this.element.id = "custom-tab-viewer";
	    }
	    TabViewer.prototype.open = function (id, name) {
	        var _this = this;
	        var active = { name: name, id: id, active: true };
	        var oldHandles = this.handles;
	        this.handles = [];
	        var contains = false;
	        oldHandles.forEach(function (handle) {
	            _this.handles.push(handle);
	            var isActive = (handle.id === active.id);
	            handle.active = isActive;
	            if (isActive) {
	                contains = true;
	            }
	        });
	        if (!contains) {
	            this.handles.push(active);
	        }
	        this.refresh();
	        this.onOpen(active.id);
	    };
	    TabViewer.prototype.setDirty = function (dirties) {
	        this.handles.forEach(function (handle) {
	            handle.setDirty(dirties.indexOf(handle.id) >= 0);
	        });
	    };
	    TabViewer.prototype.refresh = function () {
	    };
	    TabViewer.prototype.close = function (id) {
	        var _this = this;
	        var oldHandles = this.handles;
	        this.handles = [];
	        var activeClosed = false;
	        oldHandles.forEach(function (handle) {
	            if (handle.id !== id) {
	                _this.handles.push(handle);
	            }
	            else if (handle.active) {
	                activeClosed = true;
	            }
	        });
	        if (this.handles.length > 0 && activeClosed) {
	            this.handles[0].active = true;
	        }
	        this.refresh();
	        this.onClose(this.handles.length > 0 ? this.handles[0].id : null);
	    };
	    return TabViewer;
	}());
	function getParameterByName(name) {
	    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"), results = regex.exec(location.search);
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
	    testElement.addEventListener('DOMNodeInserted', function () {
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
	    }
	    catch (exception) {
	        return false;
	    }
	}
	exports.config = {
	    grammars: {
	        'api-workbench.grammars': ['source.raml']
	    },
	    get: function (key) {
	        return this.grammars[key];
	    }
	};
	exports.grammars = {
	    grammarsByScopeName: {
	        'text.xml': { scopeName: 'text.xml', fileTypes: ['xml'] },
	        'source.json': { scopeName: 'source.json', fileTypes: ['json'] },
	        'text.plain.null-grammar': { scopeName: 'text.plain.null-grammar', fileTypes: [] }
	    },
	    getGrammars: function () {
	        var _this = this;
	        var result = [];
	        Object.keys(this.grammarsByScopeName).forEach(function (key) {
	            result.push(_this.grammarsByScopeName[key]);
	        });
	        return result;
	    }
	};
	exports.deserializers = new Deserializers();
	exports.commands = { add: function () { } };
	function getGlobal() {
	    var globalGetter = function () {
	        return this;
	    };
	    return globalGetter.apply(null);
	}
	window.remote = { require: function () { return new Object(); } };
	function getLazy(moduleId) {
	    return global.getLazy(moduleId);
	}
	function init() {
	    if (exports.workspace) {
	        return exports.workspace;
	    }
	    exports.workspace = new Workspace();
	    return exports.workspace;
	}
	exports.init = init;
	//# sourceMappingURL=atomWrapperWeb.js.map

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	// resolves . and .. elements in a path array with directory names there
	// must be no slashes, empty elements, or device names (c:\) in the array
	// (so also no leading and trailing slashes - it does not distinguish
	// relative and absolute paths)
	function normalizeArray(parts, allowAboveRoot) {
	  // if the path tries to go above the root, `up` ends up > 0
	  var up = 0;
	  for (var i = parts.length - 1; i >= 0; i--) {
	    var last = parts[i];
	    if (last === '.') {
	      parts.splice(i, 1);
	    } else if (last === '..') {
	      parts.splice(i, 1);
	      up++;
	    } else if (up) {
	      parts.splice(i, 1);
	      up--;
	    }
	  }

	  // if the path is allowed to go above the root, restore leading ..s
	  if (allowAboveRoot) {
	    for (; up--; up) {
	      parts.unshift('..');
	    }
	  }

	  return parts;
	}

	// Split a filename into [root, dir, basename, ext], unix version
	// 'root' is just a slash, or nothing.
	var splitPathRe =
	    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
	var splitPath = function(filename) {
	  return splitPathRe.exec(filename).slice(1);
	};

	// path.resolve([from ...], to)
	// posix version
	exports.resolve = function() {
	  var resolvedPath = '',
	      resolvedAbsolute = false;

	  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
	    var path = (i >= 0) ? arguments[i] : process.cwd();

	    // Skip empty and invalid entries
	    if (typeof path !== 'string') {
	      throw new TypeError('Arguments to path.resolve must be strings');
	    } else if (!path) {
	      continue;
	    }

	    resolvedPath = path + '/' + resolvedPath;
	    resolvedAbsolute = path.charAt(0) === '/';
	  }

	  // At this point the path should be resolved to a full absolute path, but
	  // handle relative paths to be safe (might happen when process.cwd() fails)

	  // Normalize the path
	  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
	    return !!p;
	  }), !resolvedAbsolute).join('/');

	  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
	};

	// path.normalize(path)
	// posix version
	exports.normalize = function(path) {
	  var isAbsolute = exports.isAbsolute(path),
	      trailingSlash = substr(path, -1) === '/';

	  // Normalize the path
	  path = normalizeArray(filter(path.split('/'), function(p) {
	    return !!p;
	  }), !isAbsolute).join('/');

	  if (!path && !isAbsolute) {
	    path = '.';
	  }
	  if (path && trailingSlash) {
	    path += '/';
	  }

	  return (isAbsolute ? '/' : '') + path;
	};

	// posix version
	exports.isAbsolute = function(path) {
	  return path.charAt(0) === '/';
	};

	// posix version
	exports.join = function() {
	  var paths = Array.prototype.slice.call(arguments, 0);
	  return exports.normalize(filter(paths, function(p, index) {
	    if (typeof p !== 'string') {
	      throw new TypeError('Arguments to path.join must be strings');
	    }
	    return p;
	  }).join('/'));
	};


	// path.relative(from, to)
	// posix version
	exports.relative = function(from, to) {
	  from = exports.resolve(from).substr(1);
	  to = exports.resolve(to).substr(1);

	  function trim(arr) {
	    var start = 0;
	    for (; start < arr.length; start++) {
	      if (arr[start] !== '') break;
	    }

	    var end = arr.length - 1;
	    for (; end >= 0; end--) {
	      if (arr[end] !== '') break;
	    }

	    if (start > end) return [];
	    return arr.slice(start, end - start + 1);
	  }

	  var fromParts = trim(from.split('/'));
	  var toParts = trim(to.split('/'));

	  var length = Math.min(fromParts.length, toParts.length);
	  var samePartsLength = length;
	  for (var i = 0; i < length; i++) {
	    if (fromParts[i] !== toParts[i]) {
	      samePartsLength = i;
	      break;
	    }
	  }

	  var outputParts = [];
	  for (var i = samePartsLength; i < fromParts.length; i++) {
	    outputParts.push('..');
	  }

	  outputParts = outputParts.concat(toParts.slice(samePartsLength));

	  return outputParts.join('/');
	};

	exports.sep = '/';
	exports.delimiter = ':';

	exports.dirname = function(path) {
	  var result = splitPath(path),
	      root = result[0],
	      dir = result[1];

	  if (!root && !dir) {
	    // No dirname whatsoever
	    return '.';
	  }

	  if (dir) {
	    // It has a dirname, strip trailing slash
	    dir = dir.substr(0, dir.length - 1);
	  }

	  return root + dir;
	};


	exports.basename = function(path, ext) {
	  var f = splitPath(path)[2];
	  // TODO: make this comparison case-insensitive on windows?
	  if (ext && f.substr(-1 * ext.length) === ext) {
	    f = f.substr(0, f.length - ext.length);
	  }
	  return f;
	};


	exports.extname = function(path) {
	  return splitPath(path)[3];
	};

	function filter (xs, f) {
	    if (xs.filter) return xs.filter(f);
	    var res = [];
	    for (var i = 0; i < xs.length; i++) {
	        if (f(xs[i], i, xs)) res.push(xs[i]);
	    }
	    return res;
	}

	// String.prototype.substr - negative index don't work in IE8
	var substr = 'ab'.substr(-1) === 'b'
	    ? function (str, start, len) { return str.substr(start, len) }
	    : function (str, start, len) {
	        if (start < 0) start = str.length + start;
	        return str.substr(start, len);
	    }
	;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3)))

/***/ },
/* 3 */
/***/ function(module, exports) {

	// shim for using process in browser

	var process = module.exports = {};
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = setTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    clearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        setTimeout(drainQueue, 0);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 4 */
/***/ function(module, exports) {

	"use strict";
	var AtomTextEditorModel = (function () {
	    function AtomTextEditorModel(owner) {
	        this.emitter = {
	            handlersByEventName: {}
	        };
	        this.grammarId = 'no-grammar';
	        this.owner = owner;
	        this.emitter.handlersByEventName['did-change'] = [function (event) {
	                console.log('"did-change" event handled by atom-text-editor');
	            }];
	        owner.model = this;
	    }
	    AtomTextEditorModel.prototype.setSoftWrapped = function (arg) {
	    };
	    AtomTextEditorModel.prototype.setPlaceholderText = function (text) {
	        if (this.input) {
	            this.input.placeholder = text;
	        }
	    };
	    AtomTextEditorModel.prototype.setGrammar = function (grammar) {
	        this.owner.grammar = grammar;
	        this.grammarId = grammar ? (grammar.scopeName ? grammar.scopeName : 'no-grammar') : 'no-grammar';
	        this.updateInput();
	    };
	    AtomTextEditorModel.prototype.setText = function (text) {
	        this.updateInput();
	        this.input.value = text;
	    };
	    AtomTextEditorModel.prototype.getText = function () {
	        this.updateInput();
	        return this.input.value;
	    };
	    AtomTextEditorModel.prototype.updateInput = function () {
	        var inputElementChanged = false;
	        if (!this.input) {
	            inputElementChanged = true;
	        }
	        else if (this.input.grammarId !== this.grammarId) {
	            inputElementChanged = true;
	        }
	        else if (this.isMini() !== this.input.mini) {
	            inputElementChanged = true;
	        }
	        if (inputElementChanged) {
	            this.createInputElement();
	        }
	    };
	    AtomTextEditorModel.prototype.createInputElement = function () {
	        var _this = this;
	        var oldInput = this.input;
	        if (this.isXml() || this.isJson()) {
	            var input = document.createElement('div');
	            var aceEditor = this.getAceEditor(input);
	            this.input = input;
	            aceEditor.on('change', function (event) {
	                input.oninput(event);
	            });
	            Object.defineProperty(input, 'value', {
	                set: function (value) { return aceEditor.setValue(value); },
	                get: function () { return aceEditor.getValue(); }
	            });
	        }
	        else {
	            this.input = document.createElement(this.isMini() ? 'input' : 'textarea');
	        }
	        this.input.style.width = '100%';
	        this.input.style.height = this.isMini() ? 'auto' : '100%';
	        this.input.style.backgroundColor = '#1b1d23';
	        this.input.style.border = "0px";
	        if (oldInput) {
	            this.input.value = oldInput.value;
	        }
	        this.owner.innerHTML = '';
	        this.owner.appendChild(this.input);
	        this.input.grammarId = this.grammarId;
	        this.input.mini = this.isMini();
	        var timeoutId;
	        this.input.oninput = function (event) {
	            if (timeoutId) {
	                clearTimeout(timeoutId);
	            }
	            timeoutId = setTimeout(function () {
	                if (_this.emitter.handlersByEventName['did-change']) {
	                    _this.emitter.handlersByEventName['did-change'].forEach(function (handler) {
	                        handler(event);
	                    });
	                }
	            }, 100);
	        };
	    };
	    AtomTextEditorModel.prototype.getAceEditor = function (element) {
	        var ace = this.getAce();
	        var aceEditor = ace.edit(element);
	        var langTools = ace.require('ace/ext/language_tools');
	        aceEditor.setTheme('ace/theme/tomorrow_night');
	        langTools.setCompleters([]);
	        aceEditor.getSession().setMode(this.getMode());
	        aceEditor.getSession().off("change", aceEditor.renderer.$gutterLayer.$updateAnnotations);
	        aceEditor.setOptions({
	            enableBasicAutocompletion: false,
	            enableLiveAutocompletion: false
	        });
	        aceEditor.getSession().setUseWorker(false);
	        return aceEditor;
	    };
	    AtomTextEditorModel.prototype.getAce = function () {
	        return eval('ace');
	    };
	    AtomTextEditorModel.prototype.getMode = function () {
	        var ace = this.getAce();
	        var modeName = this.isXml() ? 'ace/mode/xml' : 'ace/mode/json';
	        var AceMode = ace.require(modeName).Mode;
	        var result = new AceMode();
	        return result;
	    };
	    AtomTextEditorModel.prototype.getCursorBufferPosition = function () {
	        return { row: 0, column: this.input ? this.input.value.length : 0 };
	    };
	    AtomTextEditorModel.prototype.isXml = function () {
	        return this.grammarId === 'text.xml';
	    };
	    AtomTextEditorModel.prototype.isJson = function () {
	        return this.grammarId === 'source.json';
	    };
	    AtomTextEditorModel.prototype.isNoGrammar = function () {
	        return this.grammarId === 'no-grammar';
	    };
	    AtomTextEditorModel.prototype.isMini = function () {
	        return this.mini ? true : false;
	    };
	    return AtomTextEditorModel;
	}());
	exports.AtomTextEditorModel = AtomTextEditorModel;
	//# sourceMappingURL=atomWebStuff.js.map

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var _ = __webpack_require__(6);
	var diff = __webpack_require__(7);
	var tm = __webpack_require__(8);
	var Position;
	(function (Position) {
	    Position[Position["Before"] = 0] = "Before";
	    Position[Position["After"] = 1] = "After";
	})(Position || (Position = {}));
	;
	var CompositeDisposable = (function () {
	    function CompositeDisposable() {
	        this.items = [];
	    }
	    CompositeDisposable.prototype.add = function (d) {
	        this.items.push(d);
	    };
	    CompositeDisposable.prototype.remove = function (d) {
	        this.items = this.items.filter(function (x) { return x != d; });
	    };
	    CompositeDisposable.prototype.dispose = function () {
	        this.items.forEach(function (x) { return x.dispose(); });
	    };
	    return CompositeDisposable;
	})();
	exports.CompositeDisposable = CompositeDisposable;
	(function (StatusCode) {
	    StatusCode[StatusCode["OK"] = 0] = "OK";
	    StatusCode[StatusCode["WARNING"] = 1] = "WARNING";
	    StatusCode[StatusCode["ERROR"] = 2] = "ERROR";
	})(exports.StatusCode || (exports.StatusCode = {}));
	var StatusCode = exports.StatusCode;
	var BasicBinding = (function () {
	    function BasicBinding(value) {
	        if (value === void 0) { value = null; }
	        this.value = value;
	        this.listeners = [];
	        this.validators = [];
	        this.slisteners = [];
	    }
	    BasicBinding.prototype.addValidator = function (v) {
	        this.validators.push(v);
	    };
	    BasicBinding.prototype.removeValidator = function (v) {
	        this.validators = this.validators.filter(function (x) { return x != v; });
	    };
	    BasicBinding.prototype.addStatusListener = function (s) {
	        this.slisteners.push(s);
	    };
	    BasicBinding.prototype.removeStatusListener = function (s) {
	        this.slisteners = this.slisteners.filter(function (x) { return x != s; });
	    };
	    BasicBinding.prototype.status = function () {
	        return this._status;
	    };
	    BasicBinding.prototype.setStatus = function (newStatus) {
	        if (this._status != newStatus) {
	            this.slisteners.forEach(function (listener) { return listener(newStatus); });
	        }
	        this._status = newStatus;
	    };
	    BasicBinding.prototype.get = function () {
	        return this.value;
	    };
	    BasicBinding.prototype.set = function (v) {
	        var _this = this;
	        if (this.value != v) {
	            var oldValue = this.value;
	            this.value = v;
	            var ns = { code: StatusCode.OK, message: "" };
	            this.validators.forEach(function (x) {
	                var s = x(v);
	                if (s.code > ns.code)
	                    ns = s;
	            });
	            this.setStatus(ns);
	            this.listeners.forEach(function (listener) { return listener(v, oldValue, _this); });
	        }
	        return oldValue;
	    };
	    BasicBinding.prototype.addListener = function (listener) {
	        this.listeners.push(listener);
	    };
	    BasicBinding.prototype.removeListener = function (listener) {
	        this.listeners = this.listeners.filter(function (x) { return x != listener; });
	    };
	    return BasicBinding;
	})();
	exports.BasicBinding = BasicBinding;
	var BasicComponent = (function () {
	    function BasicComponent(_tagName, icon) {
	        var _this = this;
	        if (icon === void 0) { icon = null; }
	        this._tagName = _tagName;
	        this._disabled = false;
	        this._children = [];
	        this.focusListeners = [];
	        this._onAltClickListeners = [];
	        this._onKeyUpListeners = [];
	        this._onKeyDownListeners = [];
	        this._onKeyPressListeners = [];
	        this._bListener = function (x) {
	            if (!_this.inSet) {
	                _this.handleDataChanged();
	            }
	        };
	        this._binding = this.createBinding();
	        this._extraClasses = [];
	        this._extraStyles = {};
	        this.inSet = false;
	        this.disposable = new CompositeDisposable();
	        this._display = true;
	        this._onClickListeners = [];
	        this.firstInit = false;
	        this._icon = icon;
	    }
	    BasicComponent.prototype.id = function () {
	        return this._id;
	    };
	    BasicComponent.prototype.setId = function (id) {
	        this._id = id;
	        return this;
	    };
	    BasicComponent.prototype.disabled = function () { return this._disabled; };
	    BasicComponent.prototype.setDisabled = function (disabled) { this._disabled = disabled; this.handleLocalChange(); };
	    BasicComponent.prototype.setTabIndex = function (index) {
	        this.ui().tabIndex = index;
	    };
	    BasicComponent.prototype.createBinding = function () {
	        var b = new BasicBinding();
	        b.addListener(this._bListener);
	        return b;
	    };
	    BasicComponent.prototype.addFocusListener = function (e) {
	        this.focusListeners.push(e);
	    };
	    BasicComponent.prototype.removeFocusListener = function (e) {
	        this.focusListeners = this.focusListeners.filter(function (x) { return x != e; });
	    };
	    BasicComponent.prototype.addAltClickListener = function (e) {
	        this._onAltClickListeners.push(e);
	    };
	    BasicComponent.prototype.removeAltClickListener = function (e) {
	        this._onAltClickListeners = this._onAltClickListeners.filter(function (x) { return x != e; });
	    };
	    BasicComponent.prototype.addKeyDownListener = function (e) {
	        this._onKeyDownListeners.push(e);
	    };
	    BasicComponent.prototype.removeKeyDownListener = function (e) {
	        this._onKeyDownListeners = this._onKeyDownListeners.filter(function (x) { return x != e; });
	    };
	    BasicComponent.prototype.addKeyUpListener = function (e) {
	        this._onKeyUpListeners.push(e);
	    };
	    BasicComponent.prototype.removeKeyUpListener = function (e) {
	        this._onKeyUpListeners = this._onKeyUpListeners.filter(function (x) { return x != e; });
	    };
	    BasicComponent.prototype.addKeyPressListener = function (e) {
	        this._onKeyPressListeners.push(e);
	    };
	    BasicComponent.prototype.removeKeyPressListener = function (e) {
	        this._onKeyPressListeners = this._onKeyPressListeners.filter(function (x) { return x != e; });
	    };
	    BasicComponent.prototype.pad = function (left, right) {
	        this.padding_left = left;
	        this.padding_right = right;
	        return this;
	    };
	    BasicComponent.prototype.margin = function (left, right, top, bottom) {
	        if (top === void 0) { top = null; }
	        if (bottom === void 0) { bottom = null; }
	        this.margin_left = left;
	        this.margin_right = right;
	        this.margin_bottom = bottom;
	        this.margin_top = top;
	        return this;
	    };
	    BasicComponent.prototype.getAssociatedValue = function () {
	        if (this._binding) {
	            return this._binding.get();
	        }
	        return null;
	    };
	    BasicComponent.prototype.setAssociatedValue = function (v) {
	        this.inSet = true;
	        try {
	            this._binding.set(v);
	        }
	        finally {
	            this.inSet = false;
	        }
	    };
	    BasicComponent.prototype.getStyle = function () {
	        return this._extraStyles;
	    };
	    BasicComponent.prototype.caption = function () {
	        return this._caption;
	    };
	    BasicComponent.prototype.setCaption = function (s) {
	        this._caption = s;
	        this.handleLocalChange();
	        return this;
	    };
	    BasicComponent.prototype.setIcon = function (icon) {
	        this._icon = icon;
	        this.handleLocalChange();
	    };
	    BasicComponent.prototype.getIcon = function () {
	        return this._icon;
	    };
	    BasicComponent.prototype.setStyle = function (s, value) {
	        this._extraStyles[s] = value;
	        this.handleLocalChange();
	        return this;
	    };
	    BasicComponent.prototype.removeStyle = function (s) {
	        delete this._extraStyles[s];
	    };
	    BasicComponent.prototype.hasClass = function (className) {
	        return this._extraClasses.indexOf(className) != -1;
	    };
	    BasicComponent.prototype.clearUI = function () {
	        this._ui = null;
	    };
	    BasicComponent.prototype.applyTooltip = function (tooltip) {
	        var tooltipText = hc(tooltip).renderUI().innerHTML;
	        var outer = this;
	        this.tooltipComponentListener = {
	            changed: function (b) {
	                outer.disposable.remove(outer.tooltipHandle);
	                outer.tooltipHandle.dispose();
	                if (outer.tooltipComponent) {
	                    outer.applyTooltip(outer.tooltipComponent);
	                }
	            }
	        };
	        tooltip.addComponentListener(this.tooltipComponentListener);
	        var tooltipv = atom.tooltips.add(this.ui(), {
	            title: '<div class="raml-console-tooltip">' + tooltipText + '</div>',
	            delay: 100,
	            html: true
	        });
	        this.tooltipHandle = tooltipv;
	        this.disposable.add(tooltipv);
	    };
	    BasicComponent.prototype.handleDataChanged = function () { };
	    BasicComponent.prototype.setTooltip = function (t) {
	        return null;
	    };
	    BasicComponent.prototype.disposeTooltipListeners = function () {
	        if (this.tooltipComponent && this.tooltipComponentListener) {
	            this.tooltipComponent.removeComponentListener(this.tooltipComponentListener);
	            this.tooltipComponentListener = null;
	            this.tooltipHandle.dispose();
	            this.disposable.remove(this.tooltipHandle);
	        }
	    };
	    BasicComponent.prototype.dispose = function () {
	        this.disposable.dispose();
	        this._children.forEach(function (x) { return x.dispose(); });
	    };
	    BasicComponent.prototype.getPercentWidth = function () {
	        return this._percentWidth;
	    };
	    BasicComponent.prototype.setPercentWidth = function (value) {
	        this._percentWidth = value;
	        this.handleLocalChange();
	        return this;
	    };
	    BasicComponent.prototype.getPercentHeight = function () {
	        return this._percentHeight;
	    };
	    BasicComponent.prototype.setPercentHeight = function (value) {
	        this._percentHeight = value;
	        this.handleLocalChange();
	        return this;
	    };
	    BasicComponent.prototype.setDisplay = function (display) {
	        this._display = display;
	        this.handleLocalChange();
	    };
	    BasicComponent.prototype.getDisplay = function () {
	        return this._display;
	    };
	    BasicComponent.prototype.addClass = function (token) {
	        this._extraClasses.push(token);
	        if (this._ui) {
	            this._ui.classList.add(token);
	        }
	        return this;
	    };
	    BasicComponent.prototype.removeClass = function (token) {
	        this._extraClasses = this._extraClasses.filter(function (x) { return x != token; });
	        if (this._ui) {
	            this._ui.classList.remove(token);
	        }
	    };
	    BasicComponent.prototype.addOnClickListener = function (ev) {
	        this._onClickListeners.push(ev);
	        this.handleLocalChange();
	    };
	    BasicComponent.prototype.removeOnClickListener = function (ev) {
	        this._onClickListeners = this._onClickListeners.filter(function (x) { return x != ev; });
	        this.handleLocalChange();
	    };
	    BasicComponent.prototype.ui = function () {
	        if (this._ui == null)
	            this._ui = this.renderUI();
	        return this._ui;
	    };
	    BasicComponent.prototype.refresh = function () {
	        var ui = this.renderUI();
	        if (this._ui != null && this._ui.parentNode != null)
	            this._ui.parentNode.replaceChild(ui, this._ui);
	        this._ui = ui;
	    };
	    BasicComponent.prototype.setTagName = function (s) {
	        this._tagName = s;
	    };
	    BasicComponent.prototype.setBinding = function (b) {
	        this._binding = b;
	        b.addListener(this._bListener);
	        this.handleDataChanged();
	    };
	    BasicComponent.prototype.getBinding = function () {
	        return this._binding;
	    };
	    BasicComponent.prototype.selfInit = function () { };
	    BasicComponent.prototype.renderUI = function () {
	        var start = this.selfRender();
	        this._ui = start;
	        if (!this.firstInit) {
	            this.selfInit();
	            this.firstInit = true;
	        }
	        this.customize(start);
	        this._children.filter(function (x) { return x != null; }).forEach(function (child) { return start.appendChild(child.ui()); });
	        var footer = this.selfRenderFooter();
	        if (footer) {
	            start.appendChild(footer);
	        }
	        return start;
	    };
	    BasicComponent.prototype.customize = function (element) {
	        var _this = this;
	        if (this._icon) {
	            if (element.classList.contains("icon")) {
	                element.classList.remove(this._oldIcon);
	            }
	            else {
	                element.classList.add("icon");
	            }
	            var v = iconToClass(this._icon);
	            this._oldIcon = v;
	            element.classList.add(v);
	        }
	        else {
	            if (element.classList.contains("icon")) {
	                element.classList.remove(this._oldIcon);
	            }
	        }
	        element.onfocus = function (x) {
	            _this.focusListeners.forEach(function (y) { return y(_this); });
	        };
	        element.addEventListener("DOMNodeRemovedFromDocument", function (x) {
	            x.stopPropagation();
	            if (x.srcElement == _this._ui) {
	                _this.dispose();
	            }
	        });
	        if (this.tooltipComponent) {
	            this.applyTooltip(this.tooltipComponent);
	        }
	        if (this._onClickListeners.length > 0 || this._onAltClickListeners.length > 0) {
	            element.onclick = function (event) {
	                if (!_this.disabled()) {
	                    var listeners;
	                    if (event.altKey) {
	                        listeners = _this._onAltClickListeners;
	                    }
	                    else {
	                        listeners = _this._onClickListeners;
	                    }
	                    listeners.forEach(function (listener) { return listener(_this); });
	                    event.stopPropagation();
	                }
	            };
	        }
	        else {
	            element.onclick = null;
	        }
	        if (this._onKeyDownListeners.length > 0) {
	            element.onkeydown = function (event) {
	                _this._onKeyDownListeners.forEach(function (listener) { return listener(_this, event); });
	            };
	        }
	        if (this._onKeyUpListeners.length > 0) {
	            element.onkeydown = function (event) {
	                _this._onKeyUpListeners.forEach(function (listener) { return listener(_this, event); });
	            };
	        }
	        if (this._onKeyPressListeners.length > 0) {
	            element.onkeydown = function (event) {
	                _this._onKeyPressListeners.forEach(function (listener) { return listener(_this, event); });
	            };
	        }
	        var styleString = "";
	        if (this._percentWidth) {
	            styleString += "width:" + this._percentWidth + "%;";
	        }
	        if (this._percentHeight) {
	            styleString += "width:" + this._percentHeight + "%;";
	        }
	        if (this._extraStyles) {
	            for (var k in this._extraStyles) {
	                styleString += k + ":" + this._extraStyles[k] + (";");
	            }
	        }
	        if (this.disabled()) {
	            styleString += "color: gray;text-decoration:none;";
	        }
	        if (this.padding_left) {
	            styleString += "padding-left:" + this.padding_left + "px;";
	        }
	        if (this.padding_right) {
	            styleString += "padding-right:" + this.padding_right + "px;";
	        }
	        if (this.margin_left) {
	            styleString += "margin-left:" + this.margin_left + "px;";
	        }
	        if (this.margin_right) {
	            styleString += "margin-right:" + this.margin_right + "px;";
	        }
	        if (this.margin_bottom) {
	            styleString += "margin-bottom:" + this.margin_bottom + "px;";
	        }
	        if (this.margin_right) {
	            styleString += "margin-top:" + this.margin_top + "px;";
	        }
	        if (this._display == false) {
	            styleString += "display:none";
	        }
	        element.setAttribute("style", styleString);
	        this._extraClasses.forEach(function (x) { return element.classList.add(x); });
	    };
	    BasicComponent.prototype.selfRender = function () {
	        return document.createElement(this._tagName);
	    };
	    BasicComponent.prototype.selfRenderFooter = function () {
	        return null;
	    };
	    BasicComponent.prototype.parent = function () {
	        return this._parent;
	    };
	    BasicComponent.prototype.setParent = function (p) {
	        if (this._parent != null)
	            this._parent.removeChild(this);
	        this._parent = p;
	    };
	    BasicComponent.prototype.clear = function () {
	        for (var i = 0; i < this._children.length; i++)
	            try {
	                this._ui.removeChild(this._children[i].ui());
	            }
	            catch (e) { }
	        this._children = [];
	    };
	    BasicComponent.prototype.addChild = function (child, before, after) {
	        if (before === void 0) { before = null; }
	        if (child == null)
	            return;
	        var ui = this.ui();
	        child.setParent(this);
	        if (before == null) {
	            if (after == true || after == undefined) {
	                ui.appendChild(child.ui());
	                this._children.push(child);
	            }
	            else {
	                ui.insertBefore(child.ui(), ui.firstChild);
	                this._children.splice(0, 0, child);
	            }
	        }
	        else {
	            var bui = before.ui();
	            ui.insertBefore(child.ui(), after ? bui.nextElementSibling : bui);
	            this._children.splice(this._children.indexOf(before), 0, child);
	        }
	        this.changed();
	    };
	    BasicComponent.prototype.removeChild = function (child) {
	        this._children = this._children.filter(function (x) { return x != child; });
	        if (this._ui) {
	            try {
	                this._ui.removeChild(child.ui());
	            }
	            catch (e) { }
	        }
	        this.changed();
	    };
	    BasicComponent.prototype.replaceChild = function (newChild, oldChild) {
	        this.addChild(newChild, oldChild);
	        this.removeChild(oldChild);
	    };
	    BasicComponent.prototype.addComponentListener = function (cl) {
	        if (!this.componentListeners) {
	            this.componentListeners = [];
	        }
	        this.componentListeners.push(cl);
	    };
	    BasicComponent.prototype.removeComponentListener = function (cl) {
	        if (this.componentListeners) {
	            this.componentListeners = this.componentListeners.filter(function (x) { return x != cl; });
	        }
	    };
	    BasicComponent.prototype.handleLocalChange = function () {
	        var _this = this;
	        if (this.componentListeners) {
	            this.componentListeners.forEach(function (x) { return x.changed(_this); });
	        }
	        if (this._ui) {
	            this.customize(this._ui);
	        }
	    };
	    BasicComponent.prototype.changed = function () {
	        if (this._parent) {
	            this._parent.changed();
	        }
	    };
	    BasicComponent.prototype.children = function () {
	        return [].concat(this._children);
	    };
	    BasicComponent.prototype.isAttached = function () {
	        if (this._parent) {
	            return this._parent.isAttached();
	        }
	        return false;
	    };
	    return BasicComponent;
	})();
	exports.BasicComponent = BasicComponent;
	var CheckBox = (function (_super) {
	    __extends(CheckBox, _super);
	    function CheckBox(caption, icon, _onchange) {
	        _super.call(this, "div", icon);
	        this._onchange = _onchange;
	        this._required = false;
	        this.value = false;
	        this.setCaption(caption);
	    }
	    CheckBox.prototype.getActualField = function () {
	        return this;
	    };
	    CheckBox.prototype.setLabelWidth = function (w) { };
	    CheckBox.prototype.setLabelHeight = function (h) { this.getActualField().setStyle("line-height", h + "px"); };
	    CheckBox.prototype.setRequired = function (b) {
	        this._required = b;
	    };
	    CheckBox.prototype.handleDataChanged = function () {
	        this.setValue(this.getBinding().get());
	        return _super.prototype.handleDataChanged.call(this);
	    };
	    CheckBox.prototype.selfInit = function () {
	        var _this = this;
	        var element = this.ui();
	        element.classList.add("checkbox");
	        element.classList.add("settings-view");
	        element.classList.add("pane-item");
	        var cl = document.createElement("input");
	        cl.type = "checkbox";
	        this.actualInput = cl;
	        cl.checked = this.value;
	        cl.onchange = function (x) { var value = _this.getValue(); _this.setAssociatedValue(value); _this._onchange(_this, value); };
	        var id = "check" + (CheckBox.num++);
	        cl.id = id;
	        var label = document.createElement("label");
	        label.htmlFor = id;
	        element.appendChild(label);
	        label.appendChild(cl);
	        var title = document.createElement("div");
	        title.classList.add("setting-title");
	        title.setAttribute("style", "display:inline;");
	        title.textContent = this.caption();
	        label.appendChild(title);
	        var description = document.createElement("div");
	        description.classList.add("setting-description");
	        element.appendChild(description);
	    };
	    CheckBox.prototype.setValue = function (v) {
	        if (this.actualInput) {
	            this.actualInput.checked = v;
	        }
	        this.value = v;
	    };
	    CheckBox.prototype.getValue = function () {
	        return this.actualInput.checked;
	    };
	    CheckBox.prototype.refresh = function () {
	        this.actualInput.value = this.caption();
	    };
	    CheckBox.num = 0;
	    return CheckBox;
	})(BasicComponent);
	exports.CheckBox = CheckBox;
	var RadioButton = (function (_super) {
	    __extends(RadioButton, _super);
	    function RadioButton(caption, _rid, icon, _onchange) {
	        _super.call(this, "div", icon);
	        this._rid = _rid;
	        this._onchange = _onchange;
	        this._required = false;
	        this.value = false;
	        this.setCaption(caption);
	    }
	    RadioButton.prototype.getActualField = function () {
	        return this;
	    };
	    RadioButton.prototype.setLabelWidth = function (w) { };
	    RadioButton.prototype.setLabelHeight = function (h) { };
	    RadioButton.prototype.setRequired = function (b) {
	        this._required = b;
	    };
	    RadioButton.prototype.handleDataChanged = function () {
	        this.setValue(this.getBinding().get());
	        return _super.prototype.handleDataChanged.call(this);
	    };
	    RadioButton.prototype.selfInit = function () {
	        var _this = this;
	        var element = this.ui();
	        element.classList.add("radio");
	        element.classList.add("settings-view");
	        element.classList.add("pane-item");
	        var cl = document.createElement("input");
	        cl.type = "radio";
	        this.actualInput = cl;
	        cl.checked = this.value;
	        cl.onchange = function (x) { var v = _this.getValue(); _this.setAssociatedValue(v); _this._onchange(_this, v); };
	        cl.name = this.id();
	        var label = document.createElement("label");
	        label.htmlFor = cl.id;
	        element.appendChild(label);
	        label.appendChild(cl);
	        var title = document.createElement("div");
	        title.classList.add("setting-title");
	        title.setAttribute("style", "display:inline;");
	        title.textContent = this.caption();
	        label.appendChild(title);
	        var description = document.createElement("div");
	        description.classList.add("setting-description");
	        element.appendChild(description);
	    };
	    RadioButton.prototype.id = function () { return this._rid; };
	    RadioButton.prototype.setId = function (id) { this._rid = id; return this; };
	    RadioButton.prototype.setValue = function (v) {
	        if (this.actualInput) {
	            this.actualInput.checked = v;
	        }
	        this.value = v;
	    };
	    RadioButton.prototype.getValue = function () {
	        return this.actualInput.checked;
	    };
	    RadioButton.prototype.refresh = function () {
	        this.actualInput.value = this.caption();
	    };
	    return RadioButton;
	})(BasicComponent);
	exports.RadioButton = RadioButton;
	var Select = (function (_super) {
	    __extends(Select, _super);
	    function Select(caption, onChange, ic) {
	        if (onChange === void 0) { onChange = function (x) { return x; }; }
	        if (ic === void 0) { ic = null; }
	        _super.call(this, "div", ic);
	        this.onChange = onChange;
	        this._options = [];
	        this.setCaption(caption);
	    }
	    Select.prototype.getOptions = function () {
	        return this._options;
	    };
	    Select.prototype.setOptions = function (options) {
	        this._options = options;
	        this.handleLocalChange();
	    };
	    Select.prototype.handleLocalChange = function () {
	        _super.prototype.handleLocalChange.call(this);
	        if (this._select)
	            this._select.disabled = this.disabled();
	    };
	    Select.prototype.handleDataChanged = function () {
	        this._value = this.getBinding().get();
	        if (this.ui()) {
	            this._select.value = this._value;
	        }
	        return _super.prototype.handleDataChanged.call(this);
	    };
	    Select.prototype.selfInit = function () {
	        var _this = this;
	        this.ui().classList.add("settings-view");
	        this._select = document.createElement("select");
	        this.ui().appendChild(this._select);
	        this._select.classList.add("form-control");
	        this._options.forEach(function (x) {
	            var opt = document.createElement("option");
	            opt.text = x;
	            opt.value = x;
	            _this._select.appendChild(opt);
	        });
	        this._select.value = this._value;
	        this._select.disabled = this.disabled();
	        this._select.onchange = function (e) {
	            var newValue = _this.getValue();
	            _this.setAssociatedValue(newValue);
	            _this.onChange(_this, newValue);
	        };
	    };
	    Select.prototype.getValue = function () {
	        if (this.ui())
	            this._value = this._select.value;
	        return this._value;
	    };
	    Select.prototype.setValue = function (vl, fire) {
	        this._value = vl;
	        if (this.ui()) {
	            this._select.value = vl;
	        }
	        if (fire)
	            this.onChange(this, this.getValue());
	    };
	    return Select;
	})(BasicComponent);
	exports.Select = Select;
	var TextElement = (function (_super) {
	    __extends(TextElement, _super);
	    function TextElement(tag, txt, icon) {
	        if (txt === void 0) { txt = ""; }
	        if (icon === void 0) { icon = null; }
	        _super.call(this, tag, icon);
	        this._text = "";
	        if (typeof (txt) == 'object') {
	            this._binding = txt;
	            this._binding.addListener(this._bListener);
	            this._text = this.getBinding().get();
	        }
	        else
	            this._text = txt;
	    }
	    TextElement.prototype.getText = function () {
	        return this._text;
	    };
	    TextElement.prototype.setText = function (value, handle) {
	        if (handle === void 0) { handle = true; }
	        this._text = value;
	        if (handle)
	            this.handleLocalChange();
	    };
	    TextElement.prototype.handleDataChanged = function () {
	        this.setText(this.getBinding().get());
	        _super.prototype.handleDataChanged.call(this);
	    };
	    TextElement.prototype.caption = function () {
	        if (!_super.prototype.caption.call(this))
	            return this._text;
	        else
	            return _super.prototype.caption.call(this);
	    };
	    TextElement.prototype.customize = function (element) {
	        element.textContent = this._text;
	        _super.prototype.customize.call(this, element);
	    };
	    return TextElement;
	})(BasicComponent);
	exports.TextElement = TextElement;
	var InlineHTMLElement = (function (_super) {
	    __extends(InlineHTMLElement, _super);
	    function InlineHTMLElement(tag, txt, icon) {
	        if (txt === void 0) { txt = ""; }
	        if (icon === void 0) { icon = null; }
	        _super.call(this, tag, icon);
	        this._text = "";
	        this._text = txt;
	    }
	    InlineHTMLElement.prototype.getText = function () {
	        return this._text;
	    };
	    InlineHTMLElement.prototype.setText = function (value) {
	        this._text = value;
	        this.handleLocalChange();
	    };
	    InlineHTMLElement.prototype.handleDataChanged = function () {
	        this.setText(this.getBinding().get());
	        _super.prototype.handleDataChanged.call(this);
	    };
	    InlineHTMLElement.prototype.customize = function (element) {
	        element.innerHTML = this._text;
	        _super.prototype.customize.call(this, element);
	    };
	    return InlineHTMLElement;
	})(BasicComponent);
	exports.InlineHTMLElement = InlineHTMLElement;
	var Label = (function (_super) {
	    __extends(Label, _super);
	    function Label(txt, icon) {
	        if (txt === void 0) { txt = ""; }
	        if (icon === void 0) { icon = null; }
	        _super.call(this, "label", txt, icon);
	    }
	    return Label;
	})(TextElement);
	exports.Label = Label;
	var Panel = (function (_super) {
	    __extends(Panel, _super);
	    function Panel(_layoutType) {
	        if (_layoutType === void 0) { _layoutType = LayoutType.BLOCK; }
	        _super.call(this, _layoutType == LayoutType.BLOCK ? "div" : "span");
	        this._layoutType = _layoutType;
	        this.addClass(layoutTypeToString(_layoutType));
	    }
	    Panel.prototype.addChild = function (child, before) {
	        _super.prototype.addChild.call(this, child, before);
	        if (this._layoutType == LayoutType.BLOCK)
	            alignComponents(this._children);
	    };
	    Panel.prototype.renderUI = function (align) {
	        if (align === void 0) { align = true; }
	        var renderedUI = _super.prototype.renderUI.call(this);
	        if (align && this._layoutType == LayoutType.BLOCK)
	            alignComponents(this._children);
	        return renderedUI;
	    };
	    return Panel;
	})(BasicComponent);
	exports.Panel = Panel;
	var WrapPanel = (function (_super) {
	    __extends(WrapPanel, _super);
	    function WrapPanel() {
	        _super.apply(this, arguments);
	    }
	    WrapPanel.prototype.setLabelWidth = function (n) {
	        if (this.children().length > 0) {
	            this.children()[0].setLabelWidth(n);
	        }
	    };
	    WrapPanel.prototype.setLabelHeight = function (n) {
	    };
	    return WrapPanel;
	})(Panel);
	exports.WrapPanel = WrapPanel;
	(function (ButtonSizes) {
	    ButtonSizes[ButtonSizes["NORMAL"] = 0] = "NORMAL";
	    ButtonSizes[ButtonSizes["EXTRA_SMALL"] = 1] = "EXTRA_SMALL";
	    ButtonSizes[ButtonSizes["SMALL"] = 2] = "SMALL";
	    ButtonSizes[ButtonSizes["LARGE"] = 3] = "LARGE";
	})(exports.ButtonSizes || (exports.ButtonSizes = {}));
	var ButtonSizes = exports.ButtonSizes;
	(function (ButtonHighlights) {
	    ButtonHighlights[ButtonHighlights["NO_HIGHLIGHT"] = 0] = "NO_HIGHLIGHT";
	    ButtonHighlights[ButtonHighlights["PRIMARY"] = 1] = "PRIMARY";
	    ButtonHighlights[ButtonHighlights["INFO"] = 2] = "INFO";
	    ButtonHighlights[ButtonHighlights["SUCCESS"] = 3] = "SUCCESS";
	    ButtonHighlights[ButtonHighlights["WARNING"] = 4] = "WARNING";
	    ButtonHighlights[ButtonHighlights["ERROR"] = 5] = "ERROR";
	})(exports.ButtonHighlights || (exports.ButtonHighlights = {}));
	var ButtonHighlights = exports.ButtonHighlights;
	(function (TextClasses) {
	    TextClasses[TextClasses["NORMAL"] = 0] = "NORMAL";
	    TextClasses[TextClasses["SMALLER"] = 1] = "SMALLER";
	    TextClasses[TextClasses["SUBTLE"] = 2] = "SUBTLE";
	    TextClasses[TextClasses["HIGHLIGHT"] = 3] = "HIGHLIGHT";
	    TextClasses[TextClasses["INFO"] = 4] = "INFO";
	    TextClasses[TextClasses["SUCCESS"] = 5] = "SUCCESS";
	    TextClasses[TextClasses["WARNING"] = 6] = "WARNING";
	    TextClasses[TextClasses["ERROR"] = 7] = "ERROR";
	})(exports.TextClasses || (exports.TextClasses = {}));
	var TextClasses = exports.TextClasses;
	function textClassToString(clazz) {
	    switch (clazz) {
	        case TextClasses.NORMAL: return "text-normal";
	        case TextClasses.SMALLER: return "text-smaller";
	        case TextClasses.SUBTLE: return "text-subtle";
	        case TextClasses.HIGHLIGHT: return "text-highlight";
	        case TextClasses.INFO: return "text-info";
	        case TextClasses.SUCCESS: return "text-success";
	        case TextClasses.WARNING: return "text-warning";
	        case TextClasses.ERROR: return "text-error";
	        default: return "";
	    }
	}
	(function (HighLightClasses) {
	    HighLightClasses[HighLightClasses["NONE"] = 0] = "NONE";
	    HighLightClasses[HighLightClasses["HIGHLIGHT"] = 1] = "HIGHLIGHT";
	    HighLightClasses[HighLightClasses["HIGHLIGHT_INFO"] = 2] = "HIGHLIGHT_INFO";
	    HighLightClasses[HighLightClasses["HIGHLIGHT_SUCCESS"] = 3] = "HIGHLIGHT_SUCCESS";
	    HighLightClasses[HighLightClasses["HIGHLIGHT_WARNING"] = 4] = "HIGHLIGHT_WARNING";
	    HighLightClasses[HighLightClasses["HIGHLIGHT_ERROR"] = 5] = "HIGHLIGHT_ERROR";
	})(exports.HighLightClasses || (exports.HighLightClasses = {}));
	var HighLightClasses = exports.HighLightClasses;
	function highlightToText(clazz) {
	    switch (clazz) {
	        case HighLightClasses.NONE: return "no-highlight";
	        case HighLightClasses.HIGHLIGHT: return "highlight";
	        case HighLightClasses.HIGHLIGHT_INFO: return "highlight-info";
	        case HighLightClasses.HIGHLIGHT_SUCCESS: return "highlight-success";
	        case HighLightClasses.HIGHLIGHT_WARNING: return "highlight-warning";
	        case HighLightClasses.HIGHLIGHT_ERROR: return "highlight-error";
	        default: return null;
	    }
	}
	(function (LayoutType) {
	    LayoutType[LayoutType["BLOCK"] = 0] = "BLOCK";
	    LayoutType[LayoutType["INLINE_BLOCK"] = 1] = "INLINE_BLOCK";
	    LayoutType[LayoutType["INLINE_BLOCK_TIGHT"] = 2] = "INLINE_BLOCK_TIGHT";
	    LayoutType[LayoutType["BTN_GROUP"] = 3] = "BTN_GROUP";
	})(exports.LayoutType || (exports.LayoutType = {}));
	var LayoutType = exports.LayoutType;
	function layoutTypeToString(layoutType) {
	    switch (layoutType) {
	        case LayoutType.BLOCK: return "block";
	        case LayoutType.INLINE_BLOCK: return "inline-block";
	        case LayoutType.INLINE_BLOCK_TIGHT: return "inline-block-tight";
	        case LayoutType.BTN_GROUP: return "btn-group";
	        default: return null;
	    }
	}
	(function (Icon) {
	    Icon[Icon["NONE"] = 0] = "NONE";
	    Icon[Icon["ALERT"] = 1] = "ALERT";
	    Icon[Icon["ALIGNMENT_ALIGN"] = 2] = "ALIGNMENT_ALIGN";
	    Icon[Icon["ALIGNMENT_ALIGNED_TO"] = 3] = "ALIGNMENT_ALIGNED_TO";
	    Icon[Icon["ALIGNMENT_UNALIGN"] = 4] = "ALIGNMENT_UNALIGN";
	    Icon[Icon["ARROW_DOWN"] = 5] = "ARROW_DOWN";
	    Icon[Icon["ARROW_LEFT"] = 6] = "ARROW_LEFT";
	    Icon[Icon["ARROW_RIGHT"] = 7] = "ARROW_RIGHT";
	    Icon[Icon["ARROW_SMALL_DOWN"] = 8] = "ARROW_SMALL_DOWN";
	    Icon[Icon["ARROW_SMALL_LEFT"] = 9] = "ARROW_SMALL_LEFT";
	    Icon[Icon["ARROW_SMALL_RIGHT"] = 10] = "ARROW_SMALL_RIGHT";
	    Icon[Icon["ARROW_SMALL_UP"] = 11] = "ARROW_SMALL_UP";
	    Icon[Icon["ARROW_UP"] = 12] = "ARROW_UP";
	    Icon[Icon["BEER"] = 13] = "BEER";
	    Icon[Icon["BOOK"] = 14] = "BOOK";
	    Icon[Icon["BOOKMARK"] = 15] = "BOOKMARK";
	    Icon[Icon["BRIEFCASE"] = 16] = "BRIEFCASE";
	    Icon[Icon["BROADCAST"] = 17] = "BROADCAST";
	    Icon[Icon["BROWSER"] = 18] = "BROWSER";
	    Icon[Icon["BUG"] = 19] = "BUG";
	    Icon[Icon["CALENDAR"] = 20] = "CALENDAR";
	    Icon[Icon["CHECK"] = 21] = "CHECK";
	    Icon[Icon["CHECKLIST"] = 22] = "CHECKLIST";
	    Icon[Icon["CHEVRON_DOWN"] = 23] = "CHEVRON_DOWN";
	    Icon[Icon["CHEVRON_LEFT"] = 24] = "CHEVRON_LEFT";
	    Icon[Icon["CHEVRON_RIGHT"] = 25] = "CHEVRON_RIGHT";
	    Icon[Icon["CHEVRON_UP"] = 26] = "CHEVRON_UP";
	    Icon[Icon["CIRCLE_SLASH"] = 27] = "CIRCLE_SLASH";
	    Icon[Icon["CIRCUIT_BOARD"] = 28] = "CIRCUIT_BOARD";
	    Icon[Icon["CLIPPY"] = 29] = "CLIPPY";
	    Icon[Icon["CLOCK"] = 30] = "CLOCK";
	    Icon[Icon["CLOUD_DOWNLOAD"] = 31] = "CLOUD_DOWNLOAD";
	    Icon[Icon["CLOUD_UPLOAD"] = 32] = "CLOUD_UPLOAD";
	    Icon[Icon["CODE"] = 33] = "CODE";
	    Icon[Icon["COLOR_MODE"] = 34] = "COLOR_MODE";
	    Icon[Icon["COMMENT_ADD"] = 35] = "COMMENT_ADD";
	    Icon[Icon["COMMENT"] = 36] = "COMMENT";
	    Icon[Icon["COMMENT_DISCUSSION"] = 37] = "COMMENT_DISCUSSION";
	    Icon[Icon["CREDIT_CARD"] = 38] = "CREDIT_CARD";
	    Icon[Icon["DASH"] = 39] = "DASH";
	    Icon[Icon["DASHBOARD"] = 40] = "DASHBOARD";
	    Icon[Icon["DATABASE"] = 41] = "DATABASE";
	    Icon[Icon["DEVICE_CAMERA"] = 42] = "DEVICE_CAMERA";
	    Icon[Icon["DEVICE_CAMERA_VIDEO"] = 43] = "DEVICE_CAMERA_VIDEO";
	    Icon[Icon["DEVICE_DESKTOP"] = 44] = "DEVICE_DESKTOP";
	    Icon[Icon["DEVICE_MOBILE"] = 45] = "DEVICE_MOBILE";
	    Icon[Icon["DIFF"] = 46] = "DIFF";
	    Icon[Icon["DIFF_ADDED"] = 47] = "DIFF_ADDED";
	    Icon[Icon["DIFF_IGNORED"] = 48] = "DIFF_IGNORED";
	    Icon[Icon["DIFF_MODIFIED"] = 49] = "DIFF_MODIFIED";
	    Icon[Icon["DIFF_REMOVED"] = 50] = "DIFF_REMOVED";
	    Icon[Icon["DIFF_RENAMED"] = 51] = "DIFF_RENAMED";
	    Icon[Icon["ELLIPSIS"] = 52] = "ELLIPSIS";
	    Icon[Icon["EYE_UNWATCH"] = 53] = "EYE_UNWATCH";
	    Icon[Icon["EYE_WATCH"] = 54] = "EYE_WATCH";
	    Icon[Icon["EYE"] = 55] = "EYE";
	    Icon[Icon["FILE_BINARY"] = 56] = "FILE_BINARY";
	    Icon[Icon["FILE_CODE"] = 57] = "FILE_CODE";
	    Icon[Icon["FILE_DIRECTORY"] = 58] = "FILE_DIRECTORY";
	    Icon[Icon["FILE_MEDIA"] = 59] = "FILE_MEDIA";
	    Icon[Icon["FILE_PDF"] = 60] = "FILE_PDF";
	    Icon[Icon["FILE_SUBMODULE"] = 61] = "FILE_SUBMODULE";
	    Icon[Icon["FILE_SYMLINK_DIRECTORY"] = 62] = "FILE_SYMLINK_DIRECTORY";
	    Icon[Icon["FILE_SYMLINK_FILE"] = 63] = "FILE_SYMLINK_FILE";
	    Icon[Icon["FILE_TEXT"] = 64] = "FILE_TEXT";
	    Icon[Icon["FILE_ZIP"] = 65] = "FILE_ZIP";
	    Icon[Icon["FLAME"] = 66] = "FLAME";
	    Icon[Icon["FOLD"] = 67] = "FOLD";
	    Icon[Icon["GEAR"] = 68] = "GEAR";
	    Icon[Icon["GIFT"] = 69] = "GIFT";
	    Icon[Icon["GIST"] = 70] = "GIST";
	    Icon[Icon["GIST_SECRET"] = 71] = "GIST_SECRET";
	    Icon[Icon["GIT_BRANCH_CREATE"] = 72] = "GIT_BRANCH_CREATE";
	    Icon[Icon["GIT_BRANCH_DELETE"] = 73] = "GIT_BRANCH_DELETE";
	    Icon[Icon["GIT_BRANCH"] = 74] = "GIT_BRANCH";
	    Icon[Icon["GIT_COMMIT"] = 75] = "GIT_COMMIT";
	    Icon[Icon["GIT_COMPARE"] = 76] = "GIT_COMPARE";
	    Icon[Icon["GIT_MERGE"] = 77] = "GIT_MERGE";
	    Icon[Icon["GIT_PULL_REQUEST_ABANDONED"] = 78] = "GIT_PULL_REQUEST_ABANDONED";
	    Icon[Icon["GIT_PULL_REQUEST"] = 79] = "GIT_PULL_REQUEST";
	    Icon[Icon["GLOBE"] = 80] = "GLOBE";
	    Icon[Icon["GRAPH"] = 81] = "GRAPH";
	    Icon[Icon["HEART"] = 82] = "HEART";
	    Icon[Icon["HISTORY"] = 83] = "HISTORY";
	    Icon[Icon["HOME"] = 84] = "HOME";
	    Icon[Icon["HORIZONTAL_RULE"] = 85] = "HORIZONTAL_RULE";
	    Icon[Icon["HOURGLASS"] = 86] = "HOURGLASS";
	    Icon[Icon["HUBOT"] = 87] = "HUBOT";
	    Icon[Icon["INBOX"] = 88] = "INBOX";
	    Icon[Icon["INFO"] = 89] = "INFO";
	    Icon[Icon["ISSUE_CLOSED"] = 90] = "ISSUE_CLOSED";
	    Icon[Icon["ISSUE_OPENED"] = 91] = "ISSUE_OPENED";
	    Icon[Icon["ISSUE_REOPENED"] = 92] = "ISSUE_REOPENED";
	    Icon[Icon["JERSEY"] = 93] = "JERSEY";
	    Icon[Icon["JUMP_DOWN"] = 94] = "JUMP_DOWN";
	    Icon[Icon["JUMP_LEFT"] = 95] = "JUMP_LEFT";
	    Icon[Icon["JUMP_RIGHT"] = 96] = "JUMP_RIGHT";
	    Icon[Icon["JUMP_UP"] = 97] = "JUMP_UP";
	    Icon[Icon["KEY"] = 98] = "KEY";
	    Icon[Icon["KEYBOARD"] = 99] = "KEYBOARD";
	    Icon[Icon["LAW"] = 100] = "LAW";
	    Icon[Icon["LIGHT_BULB"] = 101] = "LIGHT_BULB";
	    Icon[Icon["LINK"] = 102] = "LINK";
	    Icon[Icon["LINK_EXTERNAL"] = 103] = "LINK_EXTERNAL";
	    Icon[Icon["LIST_ORDERED"] = 104] = "LIST_ORDERED";
	    Icon[Icon["LIST_UNORDERED"] = 105] = "LIST_UNORDERED";
	    Icon[Icon["LOCATION"] = 106] = "LOCATION";
	    Icon[Icon["GIST_PRIVATE"] = 107] = "GIST_PRIVATE";
	    Icon[Icon["MIRROR_PRIVATE"] = 108] = "MIRROR_PRIVATE";
	    Icon[Icon["GIT_FORK_PRIVATE"] = 109] = "GIT_FORK_PRIVATE";
	    Icon[Icon["LOCK"] = 110] = "LOCK";
	    Icon[Icon["LOGO_GITHUB"] = 111] = "LOGO_GITHUB";
	    Icon[Icon["MAIL"] = 112] = "MAIL";
	    Icon[Icon["MAIL_READ"] = 113] = "MAIL_READ";
	    Icon[Icon["MAIL_REPLY"] = 114] = "MAIL_REPLY";
	    Icon[Icon["MARK_GITHUB"] = 115] = "MARK_GITHUB";
	    Icon[Icon["MARKDOWN"] = 116] = "MARKDOWN";
	    Icon[Icon["MEGAPHONE"] = 117] = "MEGAPHONE";
	    Icon[Icon["MENTION"] = 118] = "MENTION";
	    Icon[Icon["MICROSCOPE"] = 119] = "MICROSCOPE";
	    Icon[Icon["MILESTONE"] = 120] = "MILESTONE";
	    Icon[Icon["MIRROR_PUBLIC"] = 121] = "MIRROR_PUBLIC";
	    Icon[Icon["MIRROR"] = 122] = "MIRROR";
	    Icon[Icon["MORTAR_BOARD"] = 123] = "MORTAR_BOARD";
	    Icon[Icon["MOVE_DOWN"] = 124] = "MOVE_DOWN";
	    Icon[Icon["MOVE_LEFT"] = 125] = "MOVE_LEFT";
	    Icon[Icon["MOVE_RIGHT"] = 126] = "MOVE_RIGHT";
	    Icon[Icon["MOVE_UP"] = 127] = "MOVE_UP";
	    Icon[Icon["MUTE"] = 128] = "MUTE";
	    Icon[Icon["NO_NEWLINE"] = 129] = "NO_NEWLINE";
	    Icon[Icon["OCTOFACE"] = 130] = "OCTOFACE";
	    Icon[Icon["ORGANIZATION"] = 131] = "ORGANIZATION";
	    Icon[Icon["PACKAGE"] = 132] = "PACKAGE";
	    Icon[Icon["PAINTCAN"] = 133] = "PAINTCAN";
	    Icon[Icon["PENCIL"] = 134] = "PENCIL";
	    Icon[Icon["PERSON_ADD"] = 135] = "PERSON_ADD";
	    Icon[Icon["PERSON_FOLLOW"] = 136] = "PERSON_FOLLOW";
	    Icon[Icon["PERSON"] = 137] = "PERSON";
	    Icon[Icon["PIN"] = 138] = "PIN";
	    Icon[Icon["PLAYBACK_FAST_FORWARD"] = 139] = "PLAYBACK_FAST_FORWARD";
	    Icon[Icon["PLAYBACK_PAUSE"] = 140] = "PLAYBACK_PAUSE";
	    Icon[Icon["PLAYBACK_PLAY"] = 141] = "PLAYBACK_PLAY";
	    Icon[Icon["PLAYBACK_REWIND"] = 142] = "PLAYBACK_REWIND";
	    Icon[Icon["PLUG"] = 143] = "PLUG";
	    Icon[Icon["REPO_CREATE"] = 144] = "REPO_CREATE";
	    Icon[Icon["GIST_NEW"] = 145] = "GIST_NEW";
	    Icon[Icon["FILE_DIRECTORY_CREATE"] = 146] = "FILE_DIRECTORY_CREATE";
	    Icon[Icon["FILE_ADD"] = 147] = "FILE_ADD";
	    Icon[Icon["PLUS"] = 148] = "PLUS";
	    Icon[Icon["PODIUM"] = 149] = "PODIUM";
	    Icon[Icon["PRIMITIVE_DOT"] = 150] = "PRIMITIVE_DOT";
	    Icon[Icon["PRIMITIVE_SQUARE"] = 151] = "PRIMITIVE_SQUARE";
	    Icon[Icon["PULSE"] = 152] = "PULSE";
	    Icon[Icon["PUZZLE"] = 153] = "PUZZLE";
	    Icon[Icon["QUESTION"] = 154] = "QUESTION";
	    Icon[Icon["QUOTE"] = 155] = "QUOTE";
	    Icon[Icon["RADIO_TOWER"] = 156] = "RADIO_TOWER";
	    Icon[Icon["REPO_DELETE"] = 157] = "REPO_DELETE";
	    Icon[Icon["REPO"] = 158] = "REPO";
	    Icon[Icon["REPO_CLONE"] = 159] = "REPO_CLONE";
	    Icon[Icon["REPO_FORCE_PUSH"] = 160] = "REPO_FORCE_PUSH";
	    Icon[Icon["GIST_FORK"] = 161] = "GIST_FORK";
	    Icon[Icon["REPO_FORKED"] = 162] = "REPO_FORKED";
	    Icon[Icon["REPO_PULL"] = 163] = "REPO_PULL";
	    Icon[Icon["REPO_PUSH"] = 164] = "REPO_PUSH";
	    Icon[Icon["ROCKET"] = 165] = "ROCKET";
	    Icon[Icon["RSS"] = 166] = "RSS";
	    Icon[Icon["RUBY"] = 167] = "RUBY";
	    Icon[Icon["SCREEN_FULL"] = 168] = "SCREEN_FULL";
	    Icon[Icon["SCREEN_NORMAL"] = 169] = "SCREEN_NORMAL";
	    Icon[Icon["SEARCH_SAVE"] = 170] = "SEARCH_SAVE";
	    Icon[Icon["SEARCH"] = 171] = "SEARCH";
	    Icon[Icon["SERVER"] = 172] = "SERVER";
	    Icon[Icon["SETTINGS"] = 173] = "SETTINGS";
	    Icon[Icon["LOG_IN"] = 174] = "LOG_IN";
	    Icon[Icon["SIGN_IN"] = 175] = "SIGN_IN";
	    Icon[Icon["LOG_OUT"] = 176] = "LOG_OUT";
	    Icon[Icon["SIGN_OUT"] = 177] = "SIGN_OUT";
	    Icon[Icon["SPLIT"] = 178] = "SPLIT";
	    Icon[Icon["SQUIRREL"] = 179] = "SQUIRREL";
	    Icon[Icon["STAR_ADD"] = 180] = "STAR_ADD";
	    Icon[Icon["STAR_DELETE"] = 181] = "STAR_DELETE";
	    Icon[Icon["STAR"] = 182] = "STAR";
	    Icon[Icon["STEPS"] = 183] = "STEPS";
	    Icon[Icon["STOP"] = 184] = "STOP";
	    Icon[Icon["REPO_SYNC"] = 185] = "REPO_SYNC";
	    Icon[Icon["SYNC"] = 186] = "SYNC";
	    Icon[Icon["TAG_REMOVE"] = 187] = "TAG_REMOVE";
	    Icon[Icon["TAG_ADD"] = 188] = "TAG_ADD";
	    Icon[Icon["TAG"] = 189] = "TAG";
	    Icon[Icon["TELESCOPE"] = 190] = "TELESCOPE";
	    Icon[Icon["TERMINAL"] = 191] = "TERMINAL";
	    Icon[Icon["THREE_BARS"] = 192] = "THREE_BARS";
	    Icon[Icon["THUMBSDOWN"] = 193] = "THUMBSDOWN";
	    Icon[Icon["THUMBSUP"] = 194] = "THUMBSUP";
	    Icon[Icon["TOOLS"] = 195] = "TOOLS";
	    Icon[Icon["TRASHCAN"] = 196] = "TRASHCAN";
	    Icon[Icon["TRIANGLE_DOWN"] = 197] = "TRIANGLE_DOWN";
	    Icon[Icon["TRIANGLE_LEFT"] = 198] = "TRIANGLE_LEFT";
	    Icon[Icon["TRIANGLE_RIGHT"] = 199] = "TRIANGLE_RIGHT";
	    Icon[Icon["TRIANGLE_UP"] = 200] = "TRIANGLE_UP";
	    Icon[Icon["UNFOLD"] = 201] = "UNFOLD";
	    Icon[Icon["UNMUTE"] = 202] = "UNMUTE";
	    Icon[Icon["VERSIONS"] = 203] = "VERSIONS";
	    Icon[Icon["REMOVE_CLOSE"] = 204] = "REMOVE_CLOSE";
	    Icon[Icon["X"] = 205] = "X";
	    Icon[Icon["ZAP"] = 206] = "ZAP";
	})(exports.Icon || (exports.Icon = {}));
	var Icon = exports.Icon;
	function iconToClass(icon) {
	    switch (icon) {
	        case Icon.ALERT: return 'icon-alert';
	        case Icon.ALIGNMENT_ALIGN: return 'icon-alignment-align';
	        case Icon.ALIGNMENT_ALIGNED_TO: return 'icon-alignment-aligned-to';
	        case Icon.ALIGNMENT_UNALIGN: return 'icon-alignment-unalign';
	        case Icon.ARROW_DOWN: return 'icon-arrow-down';
	        case Icon.ARROW_LEFT: return 'icon-arrow-left';
	        case Icon.ARROW_RIGHT: return 'icon-arrow-right';
	        case Icon.ARROW_SMALL_DOWN: return 'icon-arrow-small-down';
	        case Icon.ARROW_SMALL_LEFT: return 'icon-arrow-small-left';
	        case Icon.ARROW_SMALL_RIGHT: return 'icon-arrow-small-right';
	        case Icon.ARROW_SMALL_UP: return 'icon-arrow-small-up';
	        case Icon.ARROW_UP: return 'icon-arrow-up';
	        case Icon.BEER: return 'icon-beer';
	        case Icon.BOOK: return 'icon-book';
	        case Icon.BOOKMARK: return 'icon-bookmark';
	        case Icon.BRIEFCASE: return 'icon-briefcase';
	        case Icon.BROADCAST: return 'icon-broadcast';
	        case Icon.BROWSER: return 'icon-browser';
	        case Icon.BUG: return 'icon-bug';
	        case Icon.CALENDAR: return 'icon-calendar';
	        case Icon.CHECK: return 'icon-check';
	        case Icon.CHECKLIST: return 'icon-checklist';
	        case Icon.CHEVRON_DOWN: return 'icon-chevron-down';
	        case Icon.CHEVRON_LEFT: return 'icon-chevron-left';
	        case Icon.CHEVRON_RIGHT: return 'icon-chevron-right';
	        case Icon.CHEVRON_UP: return 'icon-chevron-up';
	        case Icon.CIRCLE_SLASH: return 'icon-circle-slash';
	        case Icon.CIRCUIT_BOARD: return 'icon-circuit-board';
	        case Icon.CLIPPY: return 'icon-clippy';
	        case Icon.CLOCK: return 'icon-clock';
	        case Icon.CLOUD_DOWNLOAD: return 'icon-cloud-download';
	        case Icon.CLOUD_UPLOAD: return 'icon-cloud-upload';
	        case Icon.CODE: return 'icon-code';
	        case Icon.COLOR_MODE: return 'icon-color-mode';
	        case Icon.COMMENT_ADD: return 'icon-comment-add';
	        case Icon.COMMENT: return 'icon-comment';
	        case Icon.COMMENT_DISCUSSION: return 'icon-comment-discussion';
	        case Icon.CREDIT_CARD: return 'icon-credit-card';
	        case Icon.DASH: return 'icon-dash';
	        case Icon.DASHBOARD: return 'icon-dashboard';
	        case Icon.DATABASE: return 'icon-database';
	        case Icon.DEVICE_CAMERA: return 'icon-device-camera';
	        case Icon.DEVICE_CAMERA_VIDEO: return 'icon-device-camera-video';
	        case Icon.DEVICE_DESKTOP: return 'icon-device-desktop';
	        case Icon.DEVICE_MOBILE: return 'icon-device-mobile';
	        case Icon.DIFF: return 'icon-diff';
	        case Icon.DIFF_ADDED: return 'icon-diff-added';
	        case Icon.DIFF_IGNORED: return 'icon-diff-ignored';
	        case Icon.DIFF_MODIFIED: return 'icon-diff-modified';
	        case Icon.DIFF_REMOVED: return 'icon-diff-removed';
	        case Icon.DIFF_RENAMED: return 'icon-diff-renamed';
	        case Icon.ELLIPSIS: return 'icon-ellipsis';
	        case Icon.EYE_UNWATCH: return 'icon-eye-unwatch';
	        case Icon.EYE_WATCH: return 'icon-eye-watch';
	        case Icon.EYE: return 'icon-eye';
	        case Icon.FILE_BINARY: return 'icon-file-binary';
	        case Icon.FILE_CODE: return 'icon-file-code';
	        case Icon.FILE_DIRECTORY: return 'icon-file-directory';
	        case Icon.FILE_MEDIA: return 'icon-file-media';
	        case Icon.FILE_PDF: return 'icon-file-pdf';
	        case Icon.FILE_SUBMODULE: return 'icon-file-submodule';
	        case Icon.FILE_SYMLINK_DIRECTORY: return 'icon-file-symlink-directory';
	        case Icon.FILE_SYMLINK_FILE: return 'icon-file-symlink-file';
	        case Icon.FILE_TEXT: return 'icon-file-text';
	        case Icon.FILE_ZIP: return 'icon-file-zip';
	        case Icon.FLAME: return 'icon-flame';
	        case Icon.FOLD: return 'icon-fold';
	        case Icon.GEAR: return 'icon-gear';
	        case Icon.GIFT: return 'icon-gift';
	        case Icon.GIST: return 'icon-gist';
	        case Icon.GIST_SECRET: return 'icon-gist-secret';
	        case Icon.GIT_BRANCH_CREATE: return 'icon-git-branch-create';
	        case Icon.GIT_BRANCH_DELETE: return 'icon-git-branch-delete';
	        case Icon.GIT_BRANCH: return 'icon-git-branch';
	        case Icon.GIT_COMMIT: return 'icon-git-commit';
	        case Icon.GIT_COMPARE: return 'icon-git-compare';
	        case Icon.GIT_MERGE: return 'icon-git-merge';
	        case Icon.GIT_PULL_REQUEST_ABANDONED: return 'icon-git-pull-request-abandoned';
	        case Icon.GIT_PULL_REQUEST: return 'icon-git-pull-request';
	        case Icon.GLOBE: return 'icon-globe';
	        case Icon.GRAPH: return 'icon-graph';
	        case Icon.HEART: return 'icon-heart';
	        case Icon.HISTORY: return 'icon-history';
	        case Icon.HOME: return 'icon-home';
	        case Icon.HORIZONTAL_RULE: return 'icon-horizontal-rule';
	        case Icon.HOURGLASS: return 'icon-hourglass';
	        case Icon.HUBOT: return 'icon-hubot';
	        case Icon.INBOX: return 'icon-inbox';
	        case Icon.INFO: return 'icon-info';
	        case Icon.ISSUE_CLOSED: return 'icon-issue-closed';
	        case Icon.ISSUE_OPENED: return 'icon-issue-opened';
	        case Icon.ISSUE_REOPENED: return 'icon-issue-reopened';
	        case Icon.JERSEY: return 'icon-jersey';
	        case Icon.JUMP_DOWN: return 'icon-jump-down';
	        case Icon.JUMP_LEFT: return 'icon-jump-left';
	        case Icon.JUMP_RIGHT: return 'icon-jump-right';
	        case Icon.JUMP_UP: return 'icon-jump-up';
	        case Icon.KEY: return 'icon-key';
	        case Icon.KEYBOARD: return 'icon-keyboard';
	        case Icon.LAW: return 'icon-law';
	        case Icon.LIGHT_BULB: return 'icon-light-bulb';
	        case Icon.LINK: return 'icon-link';
	        case Icon.LINK_EXTERNAL: return 'icon-link-external';
	        case Icon.LIST_ORDERED: return 'icon-list-ordered';
	        case Icon.LIST_UNORDERED: return 'icon-list-unordered';
	        case Icon.LOCATION: return 'icon-location';
	        case Icon.GIST_PRIVATE: return 'icon-gist-private';
	        case Icon.MIRROR_PRIVATE: return 'icon-mirror-private';
	        case Icon.GIT_FORK_PRIVATE: return 'icon-git-fork-private';
	        case Icon.LOCK: return 'icon-lock';
	        case Icon.LOGO_GITHUB: return 'icon-logo-github';
	        case Icon.MAIL: return 'icon-mail';
	        case Icon.MAIL_READ: return 'icon-mail-read';
	        case Icon.MAIL_REPLY: return 'icon-mail-reply';
	        case Icon.MARK_GITHUB: return 'icon-mark-github';
	        case Icon.MARKDOWN: return 'icon-markdown';
	        case Icon.MEGAPHONE: return 'icon-megaphone';
	        case Icon.MENTION: return 'icon-mention';
	        case Icon.MICROSCOPE: return 'icon-microscope';
	        case Icon.MILESTONE: return 'icon-milestone';
	        case Icon.MIRROR_PUBLIC: return 'icon-mirror-public';
	        case Icon.MIRROR: return 'icon-mirror';
	        case Icon.MORTAR_BOARD: return 'icon-mortar-board';
	        case Icon.MOVE_DOWN: return 'icon-move-down';
	        case Icon.MOVE_LEFT: return 'icon-move-left';
	        case Icon.MOVE_RIGHT: return 'icon-move-right';
	        case Icon.MOVE_UP: return 'icon-move-up';
	        case Icon.MUTE: return 'icon-mute';
	        case Icon.NO_NEWLINE: return 'icon-no-newline';
	        case Icon.OCTOFACE: return 'icon-octoface';
	        case Icon.ORGANIZATION: return 'icon-organization';
	        case Icon.PACKAGE: return 'icon-package';
	        case Icon.PAINTCAN: return 'icon-paintcan';
	        case Icon.PENCIL: return 'icon-pencil';
	        case Icon.PERSON_ADD: return 'icon-person-add';
	        case Icon.PERSON_FOLLOW: return 'icon-person-follow';
	        case Icon.PERSON: return 'icon-person';
	        case Icon.PIN: return 'icon-pin';
	        case Icon.PLAYBACK_FAST_FORWARD: return 'icon-playback-fast-forward';
	        case Icon.PLAYBACK_PAUSE: return 'icon-playback-pause';
	        case Icon.PLAYBACK_PLAY: return 'icon-playback-play';
	        case Icon.PLAYBACK_REWIND: return 'icon-playback-rewind';
	        case Icon.PLUG: return 'icon-plug';
	        case Icon.REPO_CREATE: return 'icon-repo-create';
	        case Icon.GIST_NEW: return 'icon-gist-new';
	        case Icon.FILE_DIRECTORY_CREATE: return 'icon-file-directory-create';
	        case Icon.FILE_ADD: return 'icon-file-add';
	        case Icon.PLUS: return 'icon-plus';
	        case Icon.PODIUM: return 'icon-podium';
	        case Icon.PRIMITIVE_DOT: return 'icon-primitive-dot';
	        case Icon.PRIMITIVE_SQUARE: return 'icon-primitive-square';
	        case Icon.PULSE: return 'icon-pulse';
	        case Icon.PUZZLE: return 'icon-puzzle';
	        case Icon.QUESTION: return 'icon-question';
	        case Icon.QUOTE: return 'icon-quote';
	        case Icon.RADIO_TOWER: return 'icon-radio-tower';
	        case Icon.REPO_DELETE: return 'icon-repo-delete';
	        case Icon.REPO: return 'icon-repo';
	        case Icon.REPO_CLONE: return 'icon-repo-clone';
	        case Icon.REPO_FORCE_PUSH: return 'icon-repo-force-push';
	        case Icon.GIST_FORK: return 'icon-gist-fork';
	        case Icon.REPO_FORKED: return 'icon-repo-forked';
	        case Icon.REPO_PULL: return 'icon-repo-pull';
	        case Icon.REPO_PUSH: return 'icon-repo-push';
	        case Icon.ROCKET: return 'icon-rocket';
	        case Icon.RSS: return 'icon-rss';
	        case Icon.RUBY: return 'icon-ruby';
	        case Icon.SCREEN_FULL: return 'icon-screen-full';
	        case Icon.SCREEN_NORMAL: return 'icon-screen-normal';
	        case Icon.SEARCH_SAVE: return 'icon-search-save';
	        case Icon.SEARCH: return 'icon-search';
	        case Icon.SERVER: return 'icon-server';
	        case Icon.SETTINGS: return 'icon-settings';
	        case Icon.LOG_IN: return 'icon-log-in';
	        case Icon.SIGN_IN: return 'icon-sign-in';
	        case Icon.LOG_OUT: return 'icon-log-out';
	        case Icon.SIGN_OUT: return 'icon-sign-out';
	        case Icon.SPLIT: return 'icon-split';
	        case Icon.SQUIRREL: return 'icon-squirrel';
	        case Icon.STAR_ADD: return 'icon-star-add';
	        case Icon.STAR_DELETE: return 'icon-star-delete';
	        case Icon.STAR: return 'icon-star';
	        case Icon.STEPS: return 'icon-steps';
	        case Icon.STOP: return 'icon-stop';
	        case Icon.REPO_SYNC: return 'icon-repo-sync';
	        case Icon.SYNC: return 'icon-sync';
	        case Icon.TAG_REMOVE: return 'icon-tag-remove';
	        case Icon.TAG_ADD: return 'icon-tag-add';
	        case Icon.TAG: return 'icon-tag';
	        case Icon.TELESCOPE: return 'icon-telescope';
	        case Icon.TERMINAL: return 'icon-terminal';
	        case Icon.THREE_BARS: return 'icon-three-bars';
	        case Icon.THUMBSDOWN: return 'icon-thumbsdown';
	        case Icon.THUMBSUP: return 'icon-thumbsup';
	        case Icon.TOOLS: return 'icon-tools';
	        case Icon.TRASHCAN: return 'icon-trashcan';
	        case Icon.TRIANGLE_DOWN: return 'icon-triangle-down';
	        case Icon.TRIANGLE_LEFT: return 'icon-triangle-left';
	        case Icon.TRIANGLE_RIGHT: return 'icon-triangle-right';
	        case Icon.TRIANGLE_UP: return 'icon-triangle-up';
	        case Icon.UNFOLD: return 'icon-unfold';
	        case Icon.UNMUTE: return 'icon-unmute';
	        case Icon.VERSIONS: return 'icon-versions';
	        case Icon.REMOVE_CLOSE: return 'icon-remove-close';
	        case Icon.X: return 'icon-x';
	        case Icon.ZAP: return 'icon-zap';
	        default: throw new Error("Should never happen");
	    }
	}
	exports.iconToClass = iconToClass;
	var Button = (function (_super) {
	    __extends(Button, _super);
	    function Button(content, _size, _highlight, _icon, onClick) {
	        if (_size === void 0) { _size = ButtonSizes.NORMAL; }
	        if (_highlight === void 0) { _highlight = ButtonHighlights.NO_HIGHLIGHT; }
	        if (_icon === void 0) { _icon = null; }
	        if (onClick === void 0) { onClick = null; }
	        _super.call(this, "button", _icon);
	        this._size = _size;
	        this._highlight = _highlight;
	        this._text = "";
	        if (onClick) {
	            this.addOnClickListener(onClick);
	        }
	        this._text = content;
	    }
	    Button.sizeString = function (buttonSize) {
	        switch (buttonSize) {
	            case ButtonSizes.NORMAL: return "normal";
	            case ButtonSizes.EXTRA_SMALL: return "btn-xs";
	            case ButtonSizes.SMALL: return "btn-sm";
	            case ButtonSizes.LARGE: return "btn-lg";
	            default: return null;
	        }
	    };
	    Button.highlightString = function (highlight) {
	        switch (highlight) {
	            case ButtonHighlights.NO_HIGHLIGHT: return "no";
	            case ButtonHighlights.PRIMARY: return "btn-primary";
	            case ButtonHighlights.INFO: return "btn-info";
	            case ButtonHighlights.WARNING: return "btn-warning";
	            case ButtonHighlights.ERROR: return "btn-error";
	            case ButtonHighlights.SUCCESS: return "btn-success";
	            default: return null;
	        }
	    };
	    Button.prototype.getText = function () {
	        return this._text;
	    };
	    Button.prototype.setText = function (value) {
	        this._text = value;
	        this._ui.value = value;
	    };
	    Button.prototype.handleDataChanged = function () {
	        this.setText(this.getBinding().get());
	        _super.prototype.handleDataChanged.call(this);
	    };
	    Button.prototype.customize = function (element) {
	        _super.prototype.customize.call(this, element);
	        element.textContent = this._text;
	        var h = Button.highlightString(this._highlight);
	        if (this._oldHighlightClass) {
	            element.classList.remove(this._oldHighlightClass);
	        }
	        this._oldHighlightClass = h;
	        element.classList.add(h);
	        if (this._oldSizeClass) {
	            element.classList.remove(this._oldSizeClass);
	        }
	        var s = Button.sizeString(this._size);
	        this._oldSizeClass = s;
	        element.classList.add(s);
	        element.classList.add("btn");
	    };
	    return Button;
	})(BasicComponent);
	exports.Button = Button;
	var ToggleButton = (function (_super) {
	    __extends(ToggleButton, _super);
	    function ToggleButton(content, size, highlight, icon, onClick) {
	        _super.call(this, content, size, highlight, icon, function (e) { e.toggle(); onClick(e); });
	        this._selected = false;
	        this._defaultHighlight = highlight;
	    }
	    ToggleButton.prototype.getSelected = function () {
	        return this._selected;
	    };
	    ToggleButton.prototype.handleDataChanged = function () {
	        this.setSelected(this.getBinding().get());
	        _super.prototype.handleDataChanged.call(this);
	    };
	    ToggleButton.prototype.setSelected = function (selected) {
	        this._selected = selected;
	        this._highlight = selected ? ButtonHighlights.INFO : this._defaultHighlight;
	        this.handleLocalChange();
	        return this;
	    };
	    ToggleButton.prototype.toggle = function () {
	        this.setSelected(!this._selected);
	    };
	    return ToggleButton;
	})(Button);
	exports.ToggleButton = ToggleButton;
	var SimpleRenderer = (function () {
	    function SimpleRenderer(_renderFunc) {
	        this._renderFunc = _renderFunc;
	    }
	    SimpleRenderer.prototype.render = function (model) {
	        return this._renderFunc(model);
	    };
	    return SimpleRenderer;
	})();
	exports.SimpleRenderer = SimpleRenderer;
	var PropertyChangeEvent = (function () {
	    function PropertyChangeEvent(source, value, property) {
	        if (value === void 0) { value = null; }
	        if (property === void 0) { property = null; }
	        this.source = source;
	        this.value = value;
	        this.property = property;
	    }
	    return PropertyChangeEvent;
	})();
	exports.PropertyChangeEvent = PropertyChangeEvent;
	var Viewer = (function (_super) {
	    __extends(Viewer, _super);
	    function Viewer() {
	        _super.apply(this, arguments);
	        this._contentui = new BasicComponent("ul");
	        this._children = [this._contentui];
	    }
	    Viewer.prototype.getInput = function () {
	        return this._model;
	    };
	    Viewer.prototype.setInput = function (value, refresh) {
	        if (refresh === void 0) { refresh = true; }
	        this._model = value;
	        try {
	            this.smartUpdateContent();
	        }
	        catch (e) {
	            console.log("Error at setInput: ", e);
	        }
	    };
	    Viewer.prototype.updateContent = function () { this.refresh(); };
	    Viewer.prototype.smartUpdateContent = function () { this.refresh(); };
	    return Viewer;
	})(BasicComponent);
	exports.Viewer = Viewer;
	var StructuredViewer = (function (_super) {
	    __extends(StructuredViewer, _super);
	    function StructuredViewer(_cp, renderer) {
	        var _this = this;
	        _super.call(this, "div", null);
	        this._cp = _cp;
	        this.renderer = renderer;
	        this.selectionListeners = [];
	        this.viewerFilters = [];
	        this.lst = function (e) {
	            _this.refresh();
	        };
	        this.currentSelection = [];
	        this.currentSelectionIds = [];
	        this.eh = function (x) {
	            _this.updateContent();
	        };
	        _cp.init(this);
	        if (this.renderer instanceof BasicListanable) {
	            renderer.addListener(this.eh);
	        }
	    }
	    StructuredViewer.prototype.setBasicLabelFunction = function (f) {
	        this.basicLabelProvider = f;
	    };
	    StructuredViewer.prototype.getBasicLabelFunction = function () {
	        return this.basicLabelProvider;
	    };
	    StructuredViewer.prototype.setKeyProvider = function (kp) {
	        this._keyProvider = kp;
	    };
	    StructuredViewer.prototype.getKeyProvider = function () {
	        return this._keyProvider;
	    };
	    StructuredViewer.prototype.nodeKey = function (node) {
	        if (this._keyProvider) {
	            return this._keyProvider.key(node);
	        }
	        if (!node) {
	            return "";
	        }
	        if (node['id']) {
	            if (typeof node['id'] == 'function') {
	                return node['id']();
	            }
	        }
	        return node;
	    };
	    StructuredViewer.prototype.addViewerFilter = function (filter) {
	        this.viewerFilters.push(filter);
	        filter.addListener(this.lst);
	        this.refresh();
	    };
	    StructuredViewer.prototype.removeViewerFilter = function (filter) {
	        this.viewerFilters = this.viewerFilters.filter(function (x) { return x != filter; });
	        filter.removeListener(this.lst);
	        this.refresh();
	    };
	    StructuredViewer.prototype.getViewerFilters = function () {
	        return [].concat(this.viewerFilters);
	    };
	    StructuredViewer.prototype.setViewerSorder = function (sorter) {
	        this.viewerSorter = sorter;
	        this.refresh();
	    };
	    StructuredViewer.prototype.getViewerSorter = function () {
	        return this.viewerSorter;
	    };
	    StructuredViewer.prototype.addSelectionListener = function (l) {
	        this.selectionListeners.push(l);
	    };
	    StructuredViewer.prototype.removeSelectionListener = function (l) {
	        this.selectionListeners = this.selectionListeners.filter(function (x) { return x != l; });
	    };
	    StructuredViewer.prototype.setSelectionInternal = function (newValue) {
	        var _this = this;
	        if (this.currentSelection != newValue) {
	            var oldS = new StructuredSelection(this.currentSelection);
	            var newS = new StructuredSelection(newValue);
	            var event = new SelectionChangedEvent(this, oldS, newS);
	            this.selectionListeners.forEach(function (x) { return x.selectionChanged(event); });
	            this.currentSelection = newValue;
	            this.currentSelectionIds = newValue.map(function (x) { return _this.nodeKey(x); });
	        }
	    };
	    StructuredViewer.prototype.getSelection = function () {
	        return new StructuredSelection([].concat(this.currentSelection));
	    };
	    StructuredViewer.prototype.getRenderedContent = function (p) {
	        var _this = this;
	        var unfilteredContent = this.unfilteredContent(p);
	        if (unfilteredContent) {
	            if (Array.isArray(unfilteredContent)) {
	                var elements = unfilteredContent;
	                this.viewerFilters.forEach(function (x) {
	                    elements = elements.filter(function (el) { return x.accept(_this, el, p); });
	                });
	                if (this.viewerSorter) {
	                    elements = _.sortBy(elements, function (el) { return _this.viewerSorter.order(_this, el, p); });
	                }
	                return elements;
	            }
	        }
	        return unfilteredContent;
	    };
	    StructuredViewer.prototype.unfilteredContent = function (p) {
	        return this._cp.elements(this.getInput());
	    };
	    StructuredViewer.prototype.processChildren = function (model, view) { return null; };
	    StructuredViewer.prototype.dispose = function () {
	        if (this.renderer instanceof BasicListanable) {
	            renderer.removeListener(this.eh);
	        }
	        _super.prototype.dispose.call(this);
	        this._cp.dispose();
	    };
	    return StructuredViewer;
	})(Viewer);
	exports.StructuredViewer = StructuredViewer;
	var ArrayContentProvider = (function () {
	    function ArrayContentProvider() {
	    }
	    ArrayContentProvider.prototype.elements = function (model) {
	        return model;
	    };
	    ArrayContentProvider.prototype.init = function (viewer) {
	    };
	    ArrayContentProvider.prototype.dispose = function () {
	    };
	    return ArrayContentProvider;
	})();
	exports.ArrayContentProvider = ArrayContentProvider;
	var StructuredSelection = (function () {
	    function StructuredSelection(elements) {
	        this.elements = [];
	        if (Array.isArray(elements)) {
	            this.elements = elements;
	        }
	        else {
	            this.elements = [elements];
	        }
	    }
	    StructuredSelection.prototype.isEmpty = function () {
	        return this.elements.length == 0;
	    };
	    return StructuredSelection;
	})();
	exports.StructuredSelection = StructuredSelection;
	var SelectionChangedEvent = (function () {
	    function SelectionChangedEvent(source, oldSelection, selection) {
	        this.source = source;
	        this.oldSelection = oldSelection;
	        this.selection = selection;
	    }
	    return SelectionChangedEvent;
	})();
	exports.SelectionChangedEvent = SelectionChangedEvent;
	var LabelRenderer = (function () {
	    function LabelRenderer(_label, ic) {
	        if (ic === void 0) { ic = null; }
	        this._label = _label;
	        this.ic = ic;
	    }
	    LabelRenderer.prototype.render = function (model) {
	        var label = new Label(this._label(model), this.ic ? this.ic(model) : null);
	        return label;
	    };
	    return LabelRenderer;
	})();
	exports.LabelRenderer = LabelRenderer;
	var ListView = (function (_super) {
	    __extends(ListView, _super);
	    function ListView() {
	        _super.apply(this, arguments);
	        this._panelCustomized = false;
	        this._scrollTo = 0;
	        this.multipleSelect = false;
	        this.selectedComponents = [];
	    }
	    ListView.prototype.getTreeModel = function () {
	        if (!this.treeModel)
	            this.treeModel = new tm.TreeModel(this._contentui);
	        return this.treeModel;
	    };
	    ListView.prototype.setBasicLabelFunction = function (f) {
	        this.basicLabelProvider = f;
	    };
	    ListView.prototype.clear = function () {
	        var model = this.getTreeModel();
	        var root = model.get(null);
	        root.container.children().forEach(function (child) { return root.container.removeChild(child); });
	        this._selected = null;
	        this.selectedComponents = [];
	        this.getTreeModel().clear();
	    };
	    ListView.prototype.put = function (element, parent, after, neighbour) {
	        if (after === void 0) { after = false; }
	        var pNode = this.treeModel.get(parent);
	        var nNode = this.treeModel.get(neighbour, pNode);
	        var nView = nNode ? nNode.view : null;
	        this.getTreeModel().insert(element, pNode, nNode, after);
	        var preview = this.renderer.render(element), view = this.wrapChild(element, preview);
	        if (after == true && neighbour == null) {
	            after = false;
	            nView = pNode.container.children()[0];
	        }
	        pNode.container.addChild(view, nView, after);
	    };
	    ListView.prototype.insertBefore = function (element, parent, before) {
	        return this.put(element, parent, false, before);
	    };
	    ListView.prototype.insertAfter = function (element, parent, after) {
	        return this.put(element, parent, true, after);
	    };
	    ListView.prototype.remove = function (element) {
	        var node = this.treeModel.get(element);
	        if (!node)
	            return;
	        this.unselectItem(node.view);
	        node.parent.container.removeChild(node.view);
	        this.treeModel.remove(node);
	    };
	    ListView.prototype.setComparator = function (cmp) {
	        this._cmp = cmp;
	    };
	    ListView.prototype.getComparator = function () {
	        if (this._cmp)
	            return this._cmp;
	        return function (x, y) { return x.hashkey != null && x.__hashkey__ == y.__hashkey__; };
	    };
	    ListView.prototype.propagateHashKey = function (parent, element) {
	        if (element['__hashkey__'])
	            return;
	        if (typeof element['hashkey'] == "function")
	            element['__hashkey__'] = element['hashkey']();
	        else if (this.getBasicLabelFunction()) {
	            var param = this.getBasicLabelFunction()(element);
	            element['__hashkey__'] = parent ? parent['__hashkey__'] + "::" + param : param;
	        }
	    };
	    ListView.prototype.smartUpdateContent = function (model) {
	        var _this = this;
	        if (model === void 0) { model = null; }
	        var pelements = this.getRenderedContent(model);
	        if (!pelements || !Array.isArray(pelements))
	            return;
	        this.customizePanel();
	        var elements = pelements, oldElements = this.getTreeModel().get(model).children.map(function (x) { return x.data; });
	        elements.forEach(function (e) { return _this.propagateHashKey(model, e); });
	        var differences = diff.diff(elements, oldElements, this.getComparator());
	        var after = null;
	        differences.forEach(function (diff) {
	            switch (diff.type) {
	                case '+':
	                    _this.insertAfter(diff.element, model, after);
	                    after = diff.element;
	                    break;
	                case '-':
	                    _this.remove(diff.element);
	                    break;
	                case '=':
	                    _this.treeModel.patch(oldElements[diff.bi], after = elements[diff.ai]);
	                    _this.smartUpdateContent(after);
	                    break;
	                default:
	                    throw "That should not ever happen. (DIFF_CORRUPTED_SMART_UPDATE_CONTENT)";
	            }
	        });
	    };
	    ListView.prototype.customizePanel = function () {
	        var _this = this;
	        if (this._panelCustomized == true)
	            return;
	        this._panelCustomized = true;
	        var cpane = this._contentui.ui();
	        cpane.onkeydown = function (e) { return _this.handleKey(e); };
	        cpane.classList.add("focusable-panel");
	        cpane.classList.add("list-group");
	        cpane.tabIndex = -1;
	    };
	    ListView.prototype.tryScrollToSelected = function () {
	        try {
	            var p = this.parent();
	        }
	        catch (e) {
	        }
	    };
	    ListView.prototype.handleKey = function (e) {
	        if (e.keyCode == 40) {
	            this.navigateDown();
	        }
	        if (e.keyCode == 38) {
	            this.navigateUp();
	        }
	    };
	    ListView.prototype.navigateDown = function () {
	    };
	    ListView.prototype.navigateUp = function () {
	    };
	    ListView.prototype.focusPane = function () {
	        this._contentui.ui().focus();
	    };
	    ListView.prototype.wrapChild = function (element, preview) {
	        var _this = this;
	        var view = new BasicComponent("li");
	        view.setBinding(new BasicBinding(element));
	        view.addChild(preview);
	        view.addOnClickListener(function (x) {
	            _this.selectItem(x);
	        });
	        if (_.find(this.currentSelectionIds, function (x) { return x == _this.nodeKey(element); })) {
	            view.addClass("selected");
	            this._selected = view;
	        }
	        this.getTreeModel().registerViews(element, view, null);
	        return view;
	    };
	    ListView.prototype.setSelection = function (element) {
	        if (this.ui()) {
	            var node = this.treeModel.get(element);
	            if (node == null)
	                return false;
	            this.selectItem(node.view);
	            return true;
	        }
	        else {
	            this.setSelectionInternal([element]);
	            return true;
	        }
	    };
	    ListView.prototype.setMultipleSelect = function (ms) {
	        this.multipleSelect = ms;
	    };
	    ListView.prototype.isMultipleSelect = function () {
	        return this.multipleSelect;
	    };
	    ListView.prototype.unselectItem = function (x) {
	        if (this._selected == null) {
	            return;
	        }
	        else if (this.multipleSelect) {
	            if (this.selectedComponents.indexOf(x) != -1) {
	                x.removeClass("selected");
	                this.selectedComponents = this.selectedComponents.filter(function (y) { return y != x; });
	                this.setSelectionInternal(this.selectedComponents.map(function (x) { return x.getBinding().get(); }));
	            }
	        }
	        else {
	            if (this._selected == x) {
	                this._selected.removeClass("selected");
	                this.setSelectionInternal([]);
	            }
	        }
	    };
	    ListView.prototype.selectItem = function (x) {
	        if (this.multipleSelect) {
	            if (this.selectedComponents.indexOf(x) != -1)
	                this.unselectItem(x);
	            else {
	                x.addClass("selected");
	                this.selectedComponents.push(x);
	                this.tryScrollToSelected();
	                this.setSelectionInternal(this.selectedComponents.map(function (x) { return x.getBinding().get(); }));
	            }
	        }
	        else {
	            if (this._selected) {
	                this._selected.removeClass("selected");
	            }
	            x.addClass("selected");
	            this._selected = x;
	            this.tryScrollToSelected();
	            this.setSelectionInternal([x.getBinding().get()]);
	        }
	    };
	    return ListView;
	})(StructuredViewer);
	exports.ListView = ListView;
	var DefaultTreeContentProvider = (function () {
	    function DefaultTreeContentProvider(_objectToChildren) {
	        this._objectToChildren = _objectToChildren;
	    }
	    DefaultTreeContentProvider.prototype.hasChildren = function (element) {
	        return this.children(element).length > 0;
	    };
	    DefaultTreeContentProvider.prototype.children = function (element) {
	        return this._objectToChildren(element);
	    };
	    DefaultTreeContentProvider.prototype.elements = function (model) {
	        if (model instanceof Array)
	            return model;
	        return this.children(model);
	    };
	    DefaultTreeContentProvider.prototype.init = function () {
	    };
	    DefaultTreeContentProvider.prototype.dispose = function () {
	    };
	    return DefaultTreeContentProvider;
	})();
	exports.DefaultTreeContentProvider = DefaultTreeContentProvider;
	function listSection(header, icon, input, renderer, addFilter, lf) {
	    if (addFilter === void 0) { addFilter = false; }
	    if (lf === void 0) { lf = null; }
	    var resp = section(header, icon);
	    var tw = new ListView(new ArrayContentProvider(), renderer);
	    if (lf) {
	        tw.setBasicLabelFunction(lf);
	    }
	    if (addFilter) {
	        resp.addChild(filterField(tw));
	    }
	    tw.setInput(input);
	    resp.addChild(tw);
	    return resp;
	}
	exports.listSection = listSection;
	function list(input, renderer) {
	    var rend = (typeof renderer == "function") ? new SimpleRenderer(renderer) : renderer;
	    var tw = new ListView(new ArrayContentProvider(), rend);
	    tw.setInput(input);
	    return tw;
	}
	exports.list = list;
	var NodeWithKey = (function () {
	    function NodeWithKey() {
	    }
	    return NodeWithKey;
	})();
	exports.NodeWithKey = NodeWithKey;
	var TreeViewer = (function (_super) {
	    __extends(TreeViewer, _super);
	    function TreeViewer(_tcp, renderer, labelProvider) {
	        _super.call(this, _tcp, renderer);
	        this._tcp = _tcp;
	        this.renderer = renderer;
	        this._chhNum = 100;
	        this._expandedNodes = [];
	        if (labelProvider)
	            this.setBasicLabelFunction(labelProvider);
	    }
	    TreeViewer.prototype.getComparator = function () {
	        var _this = this;
	        var pcmp = _super.prototype.getComparator.call(this);
	        if (pcmp == null)
	            return null;
	        return function (x, y) { return pcmp(x, y) && _this._tcp.hasChildren(x) == _this._tcp.hasChildren(y); };
	    };
	    TreeViewer.prototype.customizePanel = function () {
	        var _this = this;
	        if (this._panelCustomized == true)
	            return;
	        this._panelCustomized = true;
	        var cpane = this._contentui.ui();
	        cpane.onkeydown = function (e) { return _this.handleKey(e); };
	        cpane.classList.add("focusable-panel");
	        cpane.classList.add("list-tree");
	        cpane.classList.add("has-collapsable-children");
	        cpane.tabIndex = -1;
	    };
	    TreeViewer.prototype.isExpanded = function (node) {
	        var h = this._expandedNodes.indexOf(this.nodeKey(node)) != -1;
	        return h;
	    };
	    TreeViewer.prototype.getExpanded = function () {
	        return [].concat(this._expandedNodes);
	    };
	    TreeViewer.prototype.setSelection = function (element) {
	        var res = _super.prototype.setSelection.call(this, element);
	        if (res) {
	            this.setExpanded(element, true);
	            this.tryScrollToSelected();
	        }
	        return res;
	    };
	    TreeViewer.prototype.setExpanded = function (element, state) {
	        if (element == null)
	            return;
	        var node = this.getTreeModel().get(element);
	        if (node == null)
	            return;
	        var view = node.view, parent = node.parent ? node.parent.data : null;
	        if (state) {
	            if (!this.isExpanded(element)) {
	                this.setExpanded(parent, state);
	                this._expandedNodes.push(this.nodeKey(element));
	                view.addClass("expanded");
	                view.removeClass("collapsed");
	            }
	        }
	        else {
	            if (this.isExpanded(element)) {
	                var k = this.nodeKey(element);
	                this._expandedNodes = this._expandedNodes.filter(function (y) { return y != k; });
	                view.removeClass("expanded");
	                view.addClass("collapsed");
	            }
	        }
	    };
	    TreeViewer.prototype.wrapChild = function (element, preview) {
	        var _this = this;
	        if (this._tcp.hasChildren(element)) {
	            var d = new BasicComponent("div");
	            var view = _super.prototype.wrapChild.call(this, element, d);
	            view.addClass("list-nested-item");
	            d.addClass("list-item");
	            d.setStyle("display", "inline");
	            d.addChild(preview);
	            if (!this.isExpanded(element)) {
	                view.addClass("collapsed");
	            }
	            view.addOnClickListener(function (x) {
	                if (x.hasClass("collapsed")) {
	                    x.removeClass("collapsed");
	                    _this._expandedNodes.push(_this.nodeKey(element));
	                }
	                else {
	                    x.addClass("collapsed");
	                    _this._expandedNodes = _this._expandedNodes.filter(function (y) { return y != _this.nodeKey(element); });
	                }
	            });
	            var childList = new BasicComponent("ul");
	            childList.addClass("list-tree");
	            view.addChild(childList);
	            this.getTreeModel().registerViews(element, view, childList);
	            this.smartUpdateContent(element);
	            return view;
	        }
	        else {
	            var view = _super.prototype.wrapChild.call(this, element, preview);
	            view.addClass("list-item");
	            return view;
	        }
	    };
	    TreeViewer.prototype.unfilteredContent = function (p) {
	        if (p) {
	            return this._tcp.children(p);
	        }
	        return _super.prototype.unfilteredContent.call(this, p);
	    };
	    TreeViewer.prototype.tryExpand = function () {
	        var _this = this;
	        var v = this.getSelection();
	        v.elements.forEach(function (e) { return _this.setExpanded(e, true); });
	    };
	    TreeViewer.prototype.tryCollapse = function () {
	        var _this = this;
	        var v = this.getSelection();
	        v.elements.forEach(function (e) { return _this.setExpanded(e, false); });
	    };
	    TreeViewer.prototype.navigateDown = function () {
	    };
	    TreeViewer.prototype.navigateUp = function () {
	    };
	    TreeViewer.prototype.handleKey = function (e) {
	        _super.prototype.handleKey.call(this, e);
	        if (e.keyCode == 39) {
	            this.tryExpand();
	        }
	        if (e.keyCode == 37) {
	            this.tryCollapse();
	        }
	    };
	    TreeViewer.prototype.handleDataChanged = function () {
	        var oldInput = this.getInput();
	        var newInput = this.getBinding().get();
	        this.setInput(newInput, true);
	    };
	    return TreeViewer;
	})(ListView);
	exports.TreeViewer = TreeViewer;
	function h1(text) {
	    return new TextElement("h1", text, null);
	}
	exports.h1 = h1;
	function h2(text) {
	    var children = [];
	    for (var _i = 1; _i < arguments.length; _i++) {
	        children[_i - 1] = arguments[_i];
	    }
	    var el = new TextElement("h2", text, null);
	    children.forEach(function (x) { return el.addChild(x); });
	    return el;
	}
	exports.h2 = h2;
	function h3(text) {
	    var children = [];
	    for (var _i = 1; _i < arguments.length; _i++) {
	        children[_i - 1] = arguments[_i];
	    }
	    var el = new TextElement("h3", text, null);
	    children.forEach(function (x) { return el.addChild(x); });
	    return el;
	}
	exports.h3 = h3;
	function applyStyling(classes, element, highlights) {
	    if (classes) {
	        element.addClass(textClassToString(classes));
	    }
	    if (highlights) {
	        element.addClass(highlightToText(highlights));
	    }
	}
	exports.applyStyling = applyStyling;
	;
	function getGrammar(id) {
	    return _.find(atom.grammars.getGrammars(), function (x) { return x.scopeName == id; });
	}
	var AtomEditorElement = (function (_super) {
	    __extends(AtomEditorElement, _super);
	    function AtomEditorElement(text, _onchange) {
	        _super.call(this, "atom-text-editor", text);
	        this._onchange = _onchange;
	        this.mini = true;
	        this._txt = this.getBinding().get();
	    }
	    AtomEditorElement.prototype.setOnChange = function (onChange) {
	        this._onchange = onChange;
	    };
	    AtomEditorElement.prototype.setGrammar = function (id) {
	        this.grammar = id;
	        if (this.ui()) {
	            this.innerSetGrammar();
	        }
	    };
	    AtomEditorElement.prototype.innerSetGrammar = function () {
	        if (this.grammar) {
	            var editor = (this.ui().getModel());
	            var ag = getGrammar(this.grammar);
	            editor.setGrammar(ag);
	        }
	    };
	    AtomEditorElement.prototype.setMini = function (mini) {
	        this.mini = mini;
	    };
	    AtomEditorElement.prototype.isMini = function () {
	        return this.mini;
	    };
	    AtomEditorElement.prototype.selectAll = function () {
	        this.ui().getModel().selectAll();
	    };
	    AtomEditorElement.prototype.selectNone = function () {
	        this.ui().getModel().setSelectedScreenRange([[0, 0], [0, 0]]);
	    };
	    AtomEditorElement.prototype.setPlaceholder = function (text) {
	        this.ui().getModel().setPlaceholderText(text);
	    };
	    AtomEditorElement.prototype.placeholder = function () {
	        return this.ui().getModel().getPlaceholderText();
	    };
	    AtomEditorElement.prototype.setSoftWrapped = function (wrap) {
	        return this.ui().getModel().setSoftWrapped(wrap);
	    };
	    AtomEditorElement.prototype.customize = function (element) {
	        {
	            element.textContent = this.getText();
	            if (this.mini) {
	                element.setAttribute("mini", '');
	            }
	            var editor = (this.ui().getModel());
	            var ch = editor.emitter.handlersByEventName['did-change'];
	            var outer = this;
	            this.innerSetGrammar();
	            editor.emitter.handlersByEventName['did-change'] = [function (x) {
	                    ch[0](x);
	                    outer.setAssociatedValue(outer.getValue());
	                    outer._onchange(outer, outer.getValue());
	                }];
	        }
	        _super.prototype.customize.call(this, element);
	    };
	    AtomEditorElement.prototype.setText = function (newText, handle) {
	        if (handle === void 0) { handle = true; }
	        if (this.ui()) {
	            var editor = (this.ui().getModel());
	            editor.setText(newText);
	        }
	        _super.prototype.setText.call(this, newText, handle);
	    };
	    AtomEditorElement.prototype.handleDataChanged = function () {
	        var v = this.getBinding().get();
	        this.setText(v ? ("" + v) : "");
	        return _super.prototype.handleDataChanged.call(this);
	    };
	    AtomEditorElement.prototype.getValue = function () {
	        return this.ui().getModel().getText();
	    };
	    return AtomEditorElement;
	})(TextElement);
	exports.AtomEditorElement = AtomEditorElement;
	function input(text, onchange) {
	    var v = new AtomEditorElement(text, onchange);
	    return v;
	}
	exports.input = input;
	function alignComponents(comps) {
	    var maxL = 0;
	    comps = comps.filter(function (x) { return (isField(x) && !isCheckBox(x)); });
	    if (comps.length < 1)
	        return;
	    comps.forEach(function (x) {
	        var label = x.caption();
	        if (label != null && label.length > maxL) {
	            maxL = label.length;
	        }
	    });
	    comps.forEach(function (x) {
	        var f = x;
	        f.setLabelWidth(maxL);
	        f.setLabelHeight(f.ui().clientHeight);
	    });
	}
	exports.alignComponents = alignComponents;
	function isField(c) {
	    if (c instanceof CheckBox) {
	        return false;
	    }
	    if (c["caption"]) {
	        if (typeof c["caption"] == 'function') {
	            if (c["setLabelWidth"]) {
	                if (typeof c["setLabelWidth"] == 'function') {
	                    return true;
	                }
	            }
	        }
	    }
	    return false;
	}
	function isCheckBox(c) {
	    return c instanceof CheckBox;
	}
	var AbstractWrapEditor = (function (_super) {
	    __extends(AbstractWrapEditor, _super);
	    function AbstractWrapEditor() {
	        _super.apply(this, arguments);
	    }
	    AbstractWrapEditor.prototype.getBinding = function () {
	        return this._actualField.getBinding();
	    };
	    AbstractWrapEditor.prototype.setBinding = function (b) {
	        this._actualField.setBinding(b);
	    };
	    AbstractWrapEditor.prototype.getActualField = function () {
	        return this._actualField;
	    };
	    AbstractWrapEditor.prototype.addFocusListener = function (e) {
	        return this._actualField.addFocusListener(e);
	    };
	    AbstractWrapEditor.prototype.removeFocusListener = function (e) {
	        return this._actualField.addFocusListener(e);
	    };
	    return AbstractWrapEditor;
	})(BasicComponent);
	exports.AbstractWrapEditor = AbstractWrapEditor;
	var DialogField = (function (_super) {
	    __extends(DialogField, _super);
	    function DialogField(caption, l) {
	        if (l === void 0) { l = LayoutType.INLINE_BLOCK; }
	        _super.call(this, "span", null);
	        this._required = false;
	        this.setCaption(caption);
	        this.createLabel(caption);
	    }
	    DialogField.prototype.setRequired = function (b) {
	        this._required = b;
	        if (this._textLabel) {
	            if (this._required) {
	                if (!this._rlab) {
	                    this._rlab = label("*", null, TextClasses.HIGHLIGHT).pad(3, 0);
	                    this._textLabelPanel.addChild(this._rlab);
	                }
	                else {
	                    this._rlab.setDisplay(true);
	                }
	            }
	            else {
	                if (this._rlab) {
	                    this._rlab.setDisplay(false);
	                }
	            }
	        }
	        this.handleLocalChange();
	    };
	    DialogField.prototype.setLabelWidth = function (w) {
	        this._textLabelPanel.setStyle("width", w + "ch");
	    };
	    DialogField.prototype.setLabelHeight = function (h) {
	        this._textLabel.setStyle("margin-top", "6px");
	    };
	    DialogField.prototype.selfInit = function () {
	        this._actualField.setStyle("flex", "1");
	        this.setPercentWidth(100);
	        this.setStyle("display", "flex");
	        this.addChild(this._textLabelPanel);
	        this.addChild(this._actualField);
	    };
	    DialogField.prototype.hideLabel = function () {
	        this._textLabelPanel.setStyle("width", "0px");
	        this._textLabelPanel.setStyle("margin-right", "0px");
	        this.setStyle("margin-right", "0px");
	    };
	    DialogField.prototype.makeLabelNextToField = function () {
	        this._textLabelPanel.setStyle("margin-right", "0px");
	    };
	    DialogField.prototype.createLabel = function (caption) {
	        this._textLabel = label(this.caption());
	        this._textLabelPanel = hc(this._textLabel);
	        this._textLabelPanel.addChild(this._textLabel);
	        this.setRequired(this._required);
	        this._textLabelPanel.setStyle("float", "left");
	    };
	    return DialogField;
	})(AbstractWrapEditor);
	exports.DialogField = DialogField;
	var WrapEditor = (function (_super) {
	    __extends(WrapEditor, _super);
	    function WrapEditor() {
	        _super.call(this, "div");
	    }
	    WrapEditor.prototype.selfRender = function () {
	        return _super.prototype.selfRender.call(this);
	    };
	    WrapEditor.prototype.createBinding = function () {
	        return new BasicBinding();
	    };
	    WrapEditor.prototype.setActualField = function (newField, conv) {
	        if (this._actualField != null && this._actualField.ui()) {
	            var oldUI = this._actualField.ui();
	            var oldV = this._actualField.getBinding().get();
	            newField.getBinding().set(conv(oldV));
	            var node = this.ui();
	            var newUI = newField.ui();
	            node.replaceChild(newUI, oldUI);
	            this.removeChild(this._actualField);
	        }
	        this._actualField = newField;
	        this.addChild(newField);
	    };
	    return WrapEditor;
	})(AbstractWrapEditor);
	exports.WrapEditor = WrapEditor;
	var TwoDispatchBinding = (function () {
	    function TwoDispatchBinding(f, s, active) {
	        this.f = f;
	        this.s = s;
	        this.active = active;
	    }
	    TwoDispatchBinding.prototype.get = function () {
	        var val = this.active.get();
	        if (this.active == this.f) {
	            if (this.firstConverter) {
	                val = this.firstConverter(val);
	            }
	        }
	        if (this.active == this.s) {
	            if (this.secondConverter) {
	                val = this.secondConverter(val);
	            }
	        }
	        return val;
	    };
	    TwoDispatchBinding.prototype.set = function (v) {
	        this.active.set(v);
	    };
	    TwoDispatchBinding.prototype.addValidator = function (v) {
	    };
	    TwoDispatchBinding.prototype.removeValidator = function (v) {
	    };
	    TwoDispatchBinding.prototype.addStatusListener = function (s) {
	    };
	    TwoDispatchBinding.prototype.removeStatusListener = function (s) {
	    };
	    TwoDispatchBinding.prototype.status = function () {
	        return this.active.status();
	    };
	    TwoDispatchBinding.prototype.addListener = function (listener) {
	        this.f.addListener(listener);
	        this.s.addListener(listener);
	    };
	    TwoDispatchBinding.prototype.removeListener = function (listener) {
	        this.f.removeListener(listener);
	        this.s.removeListener(listener);
	    };
	    return TwoDispatchBinding;
	})();
	var StuffWithButtons = (function (_super) {
	    __extends(StuffWithButtons, _super);
	    function StuffWithButtons(host) {
	        _super.call(this);
	        this.host = host;
	    }
	    StuffWithButtons.prototype.setPlusVisible = function (v) {
	        var _this = this;
	        if (!v) {
	            if (this.plus) {
	                this.plus.setDisplay(false);
	            }
	        }
	        else {
	            if (this.plus) {
	                this.plus.setDisplay(true);
	            }
	            else {
	                this.plus = a("+", function (x) {
	                    _this.host.createElementUI();
	                    _this.host.updateSigns();
	                });
	                this.addChild(this.plus);
	            }
	        }
	    };
	    StuffWithButtons.prototype.setMinusVisible = function (v) {
	        var _this = this;
	        if (!v) {
	            if (this.minus) {
	                this.minus.setDisplay(false);
	                this.minus = null;
	            }
	        }
	        else {
	            if (this.minus) {
	                this.minus.setDisplay(true);
	            }
	            else {
	                var minus = a("-", function (x) {
	                    _this.host._actualField.removeChild(_this);
	                    _this.host.containers = _this.host.containers.filter(function (x) { return x != _this; });
	                    _this.host.updateSigns();
	                });
	                this.minus = minus;
	                this.addChild(minus);
	            }
	        }
	    };
	    return StuffWithButtons;
	})(Panel);
	exports.StuffWithButtons = StuffWithButtons;
	var MultiValueField = (function (_super) {
	    __extends(MultiValueField, _super);
	    function MultiValueField(caption, value, onChange, _controller) {
	        var _this = this;
	        _super.call(this, caption, LayoutType.INLINE_BLOCK);
	        this._controller = _controller;
	        this.containers = [];
	        this._actualField = new Panel();
	        var items = this._controller.decompose(value);
	        items.forEach(function (x) {
	            _this.createElementUI(x);
	        });
	        this.updateSigns();
	    }
	    MultiValueField.prototype.updateSigns = function () {
	        this.containers.forEach(function (x) { return x.setPlusVisible(false); });
	        if (this.containers.length == 0) {
	            this.createElementUI(null);
	        }
	        this.containers[this.containers.length - 1].setMinusVisible(true);
	        this.containers[this.containers.length - 1].setPlusVisible(true);
	        if (this.containers.length == 1) {
	            this.containers[0].setMinusVisible(false);
	        }
	        this.getBinding().set(this._controller.compose(this.containers.map(function (x) { return x.embedded.getBinding().get(); })));
	    };
	    MultiValueField.prototype.createElementUI = function (v) {
	        var _this = this;
	        var fld = this._controller.createNewField();
	        fld.getBinding().set(v);
	        fld.getBinding().addListener(function (x) {
	            var vl = fld.getBinding().get();
	            _this.getBinding().set(_this._controller.compose(_this.containers.map(function (x) { return x.embedded.getBinding().get(); })));
	        });
	        var container = new StuffWithButtons(this);
	        container.addChild(fld);
	        container.embedded = fld;
	        container.setMinusVisible(true);
	        container.setPlusVisible(true);
	        this._actualField.addChild(container);
	        this.containers.push(container);
	        return container;
	    };
	    return MultiValueField;
	})(DialogField);
	exports.MultiValueField = MultiValueField;
	var FieldWithCustomization = (function (_super) {
	    __extends(FieldWithCustomization, _super);
	    function FieldWithCustomization(caption, value, onChange, _controller) {
	        var _this = this;
	        _super.call(this, caption, LayoutType.INLINE_BLOCK);
	        this._controller = _controller;
	        this._actualField = new Panel();
	        this.hideLabel();
	        var basic = this._controller.createBasicField();
	        this.basic = basic;
	        var details = this._controller.createDetailsField();
	        this._actualField.addChild(basic);
	        this._actualField.addChild(details);
	        this.defails = details;
	        var basicPart = this._controller.getBasicPart(value);
	        basic.getBinding().set(basicPart);
	        details.setDisplay(this._controller.isDetailsVisible(basicPart, value));
	        basic.getBinding().addListener(function (x) {
	            var nv = _this.getBinding().get();
	            var bp = basic.getBinding().get();
	            details.setDisplay(_this._controller.isDetailsVisible(bp, nv));
	            _this._controller.updateDetails(bp, nv, details);
	        });
	    }
	    FieldWithCustomization.prototype.getBinding = function () {
	        return this._binding;
	    };
	    FieldWithCustomization.prototype.handleDataChanged = function () {
	        var value = this.getBinding().get();
	        var bp = this._controller.getBasicPart(value);
	        this.basic.getBinding().set(bp);
	        this.defails.setDisplay(this._controller.isDetailsVisible(bp, value));
	        this._controller.updateDetails(bp, value, this.defails);
	        return _super.prototype.handleDataChanged.call(this);
	    };
	    return FieldWithCustomization;
	})(DialogField);
	exports.FieldWithCustomization = FieldWithCustomization;
	var DialogFieldWithModes = (function (_super) {
	    __extends(DialogFieldWithModes, _super);
	    function DialogFieldWithModes(caption, value, onChange, _config) {
	        var _this = this;
	        _super.call(this, caption, LayoutType.INLINE_BLOCK);
	        this._config = _config;
	        this.isFirst = false;
	        this._actualField = new WrapEditor();
	        var canGo = false;
	        if (_config.firstValidator(value).code != StatusCode.ERROR) {
	            this._actualField.setActualField(_config.firstOption, _config.secondToFirstConverter);
	            this.isFirst = true;
	            canGo = _config.secondValidator(value).code == StatusCode.OK;
	        }
	        else {
	            this._actualField.setActualField(_config.secondOption, _config.firstToSecondConverter);
	        }
	        this.ref = a(this.isFirst ? _config.firstOptionLabel : _config.secondOptionLabel, function (x) {
	            _this.switchMode();
	        });
	        this.ref.setDisabled(!canGo);
	        if (this.isFirst && _config.valueComesAsSecond) {
	            value = this._config.secondToFirstConverter(value);
	        }
	        this.getBinding().set(value);
	        this.getBinding().addListener(function (x) {
	            if (_this.isFirst) {
	                canGo = _this._config.secondValidator(x).code == StatusCode.OK;
	            }
	            else {
	                canGo = _this._config.firstValidator(x).code == StatusCode.OK;
	            }
	            _this.ref.setDisabled(!canGo);
	        });
	    }
	    DialogFieldWithModes.prototype.getBinding = function () {
	        var bnd = new TwoDispatchBinding(this._config.firstOption.getBinding(), this._config.secondOption.getBinding(), this._actualField.getBinding());
	        bnd.firstConverter = this._config.firstToOutConverter;
	        bnd.secondConverter = this._config.secondToOutConverter;
	        return bnd;
	    };
	    DialogFieldWithModes.prototype.switchMode = function () {
	        if (this.isFirst) {
	            this._actualField.setActualField(this._config.secondOption, this._config.firstToSecondConverter);
	            this.isFirst = false;
	            this.ref.setText(this._config.secondOptionLabel);
	        }
	        else {
	            this._actualField.setActualField(this._config.firstOption, this._config.secondToFirstConverter);
	            this.isFirst = true;
	            this.ref.setText(this._config.firstOptionLabel);
	        }
	    };
	    DialogFieldWithModes.prototype.selfInit = function () {
	        _super.prototype.selfInit.call(this);
	        this.addChild(this.ref);
	    };
	    return DialogFieldWithModes;
	})(DialogField);
	exports.DialogFieldWithModes = DialogFieldWithModes;
	var TextField = (function (_super) {
	    __extends(TextField, _super);
	    function TextField(caption, value, onChange, layoutType, placeholder) {
	        if (layoutType === void 0) { layoutType = LayoutType.INLINE_BLOCK; }
	        _super.call(this, caption, layoutType);
	        this._actualField = input(value, onChange);
	        if (typeof (value) == 'string')
	            this.getBinding().set(value);
	        if (placeholder)
	            this.getActualField().setPlaceholder(placeholder);
	        this.getActualField().setSoftWrapped(false);
	    }
	    TextField.prototype.setTabIndex = function (index) {
	        this.getActualField().setTabIndex(index);
	    };
	    TextField.prototype.customize = function (element) {
	        _super.prototype.customize.call(this, element);
	        this.addClass('text-field');
	    };
	    return TextField;
	})(DialogField);
	exports.TextField = TextField;
	var SelectField = (function (_super) {
	    __extends(SelectField, _super);
	    function SelectField(caption, onChange, value, ic, options, l) {
	        if (options === void 0) { options = []; }
	        if (l === void 0) { l = LayoutType.INLINE_BLOCK; }
	        _super.call(this, caption, l);
	        this._actualField = new Select(caption, onChange, ic);
	        this._actualField.setOptions(options);
	        this.getBinding().set(value);
	    }
	    SelectField.prototype.setDisabled = function (disabled) {
	        return this.getActualField().setDisabled(disabled);
	    };
	    return SelectField;
	})(DialogField);
	exports.SelectField = SelectField;
	var LabelField = (function (_super) {
	    __extends(LabelField, _super);
	    function LabelField(caption, value, icon, tc, hl, l) {
	        if (caption === void 0) { caption = ''; }
	        if (value === void 0) { value = ''; }
	        if (l === void 0) { l = LayoutType.INLINE_BLOCK; }
	        _super.call(this, caption, l);
	        this._actualField = new Label(value, icon);
	        if (tc || hl)
	            applyStyling(tc, this._actualField, hl);
	    }
	    LabelField.prototype.setText = function (text, handle) {
	        this.getActualField().setText(text, handle);
	    };
	    LabelField.prototype.getText = function () { return this.getActualField().getText(); };
	    return LabelField;
	})(DialogField);
	exports.LabelField = LabelField;
	var CustomField = (function (_super) {
	    __extends(CustomField, _super);
	    function CustomField(caption, value, onChange, l) {
	        if (l === void 0) { l = LayoutType.INLINE_BLOCK; }
	        _super.call(this, caption, l);
	        this._actualField = value;
	    }
	    return CustomField;
	})(DialogField);
	exports.CustomField = CustomField;
	var EnumField = (function (_super) {
	    __extends(EnumField, _super);
	    function EnumField(caption, value, options, onChange, l) {
	        if (l === void 0) { l = LayoutType.INLINE_BLOCK; }
	        _super.call(this, caption, l);
	        this.options = options;
	        this.createLabel(caption);
	        this._actualField = new Select(value, onChange);
	        this._actualField.setOptions(options);
	        this._actualField.setStyle("margin-bottom", "0.75em");
	        this._actualField.setValue(value);
	    }
	    EnumField.prototype.setRequired = function (b) {
	        _super.prototype.setRequired.call(this, b);
	        if (this._actualField) {
	            if (!b) {
	                this._actualField.setOptions(_.unique(this.options.concat([''])));
	            }
	            else {
	                this._actualField.setOptions(this.options);
	            }
	        }
	    };
	    return EnumField;
	})(DialogField);
	exports.EnumField = EnumField;
	function texfField(lbl, text, onchange) {
	    return new TextField(lbl, text, onchange);
	}
	exports.texfField = texfField;
	(function (FieldTypes) {
	    FieldTypes[FieldTypes["BOOL"] = 0] = "BOOL";
	    FieldTypes[FieldTypes["STRING"] = 1] = "STRING";
	    FieldTypes[FieldTypes["NUMBER"] = 2] = "NUMBER";
	    FieldTypes[FieldTypes["INTEGER"] = 3] = "INTEGER";
	    FieldTypes[FieldTypes["ENUM"] = 4] = "ENUM";
	    FieldTypes[FieldTypes["DATE"] = 5] = "DATE";
	})(exports.FieldTypes || (exports.FieldTypes = {}));
	var FieldTypes = exports.FieldTypes;
	function createInputField(spec, vl, onchange) {
	    if (onchange === void 0) { onchange = function (x) { return x; }; }
	    var res = null;
	    if (vl == null) {
	        vl = "";
	    }
	    switch (spec.type) {
	        case FieldTypes.BOOL:
	            res = new CheckBox("", null, onchange).pad(-10, 10);
	            break;
	        case FieldTypes.STRING:
	            res = texfField(spec.caption, "" + vl, onchange);
	            break;
	        case FieldTypes.NUMBER:
	        case FieldTypes.INTEGER:
	            res = texfField(spec.caption, "" + vl, onchange);
	            res.getBinding().addValidator(function (x) {
	                if (isNaN(x)) {
	                    return { code: StatusCode.ERROR, message: spec.caption + " should be a number" };
	                }
	                if (spec.type == FieldTypes.INTEGER) {
	                    if (x && x.indexOf(".") != -1) {
	                        return { code: StatusCode.ERROR, message: spec.caption + " should be integer" };
	                    }
	                }
	                return { code: StatusCode.OK, message: "" };
	            });
	            break;
	        case FieldTypes.ENUM:
	            res = new EnumField(spec.caption, "" + vl, spec.realm, onchange);
	            break;
	        case FieldTypes.DATE:
	            res = texfField(spec.caption, "" + vl, onchange);
	            break;
	        default:
	            res = texfField(spec.caption + "(untyped)", "" + vl, onchange);
	    }
	    res.getBinding().set(vl);
	    res.setRequired(spec.required);
	    if (spec.required) {
	        res.getBinding().addValidator(function (x) { return (x != null && x.length > 0) ? { code: StatusCode.OK, message: "" } : { code: StatusCode.ERROR, message: spec.caption + " is required" }; });
	    }
	    return res;
	}
	exports.createInputField = createInputField;
	function okStatus() {
	    return { code: StatusCode.OK, message: "" };
	}
	exports.okStatus = okStatus;
	function errorStatus(message) {
	    return { code: StatusCode.ERROR, message: message };
	}
	exports.errorStatus = errorStatus;
	function createSmallTypeScriptEditor(caption, value, onchange) {
	    if (onchange === void 0) { onchange = function (x) { return x; }; }
	    var res = texfField(caption, value, onchange);
	    res.getActualField().setGrammar("source.ts");
	    return res;
	}
	exports.createSmallTypeScriptEditor = createSmallTypeScriptEditor;
	var BasicListanable = (function () {
	    function BasicListanable() {
	        this._listeners = [];
	    }
	    BasicListanable.prototype.addListener = function (listener) {
	        this._listeners.push(listener);
	    };
	    BasicListanable.prototype.removeListener = function (listener) {
	        this._listeners = this._listeners.filter(function (x) { return x != listener; });
	    };
	    BasicListanable.prototype.fireChange = function (e) {
	        var _this = this;
	        this._listeners.forEach(function (x) { return _this.notify(e, x); });
	    };
	    BasicListanable.prototype.notify = function (e, l) {
	        throw new Error("Not implemented");
	    };
	    return BasicListanable;
	})();
	exports.BasicListanable = BasicListanable;
	var BasicFilter = (function (_super) {
	    __extends(BasicFilter, _super);
	    function BasicFilter() {
	        _super.apply(this, arguments);
	        this._filterPattern = "";
	    }
	    BasicFilter.prototype.setPattern = function (s) {
	        this._filterPattern = s;
	        this.fireChange(new PropertyChangeEvent(this));
	    };
	    BasicFilter.prototype.getPatten = function () {
	        return this._filterPattern;
	    };
	    BasicFilter.prototype.accept = function (viewer, value, parent) {
	        if (viewer.getBasicLabelFunction()) {
	            value = viewer.getBasicLabelFunction()(value);
	        }
	        if (value && value["filterLabel"]) {
	            if (typeof value["filterLabel"] == 'function') {
	                return value["filterLabel"]().indexOf(this._filterPattern) != -1;
	            }
	        }
	        if (this._filterPattern.length > 0) {
	            try {
	                return JSON.stringify(value).indexOf(this._filterPattern) != -1;
	            }
	            catch (e) {
	                return true;
	            }
	        }
	        return true;
	    };
	    BasicFilter.prototype.notify = function (e, l) {
	        l(e);
	    };
	    return BasicFilter;
	})(BasicListanable);
	exports.BasicFilter = BasicFilter;
	var ToggleFilter = (function (_super) {
	    __extends(ToggleFilter, _super);
	    function ToggleFilter(func) {
	        _super.call(this);
	        this._on = false;
	        this._func = func;
	    }
	    ToggleFilter.prototype.setOn = function (s) {
	        this._on = s;
	        this.fireChange(new PropertyChangeEvent(this));
	    };
	    ToggleFilter.prototype.isOn = function () {
	        return this._on;
	    };
	    ToggleFilter.prototype.accept = function (viewer, value, parent) {
	        if (!this._on) {
	            return true;
	        }
	        return this._func(value);
	    };
	    ToggleFilter.prototype.notify = function (e, l) {
	        l(e);
	    };
	    return ToggleFilter;
	})(BasicListanable);
	exports.ToggleFilter = ToggleFilter;
	var Section = (function (_super) {
	    __extends(Section, _super);
	    function Section(_header, collapsible) {
	        _super.call(this);
	        this._header = _header;
	        this._headerVisible = true;
	        this._expanded = true;
	        this.setCollapsible(collapsible);
	        _header.setPercentWidth(100);
	        _header.addClass("sub-title");
	    }
	    Section.prototype.getHeaderVisible = function () {
	        return this._headerVisible;
	    };
	    Section.prototype.setHeaderVisible = function (value) {
	        this._headerVisible = value;
	        if (!value) {
	            this.setExpanded(true);
	        }
	        this.handleLocalChange();
	    };
	    Section.prototype.caption = function () { return this._header.caption(); };
	    Section.prototype.isExpanded = function () {
	        return this._expanded;
	    };
	    Section.prototype.getHeader = function () {
	        return this._header;
	    };
	    Section.prototype.getIcon = function () {
	        return this._header.getIcon();
	    };
	    Section.prototype.customize = function (element) {
	        if (this._headerVisible) {
	            element.appendChild(this._header.ui());
	        }
	        if (!this._expanded) {
	            this.setExpanded(this._expanded);
	        }
	        _super.prototype.customize.call(this, element);
	    };
	    Section.prototype.setCollapsible = function (c) {
	        var _this = this;
	        if (!c) {
	            if (this._chevron) {
	                this._header.removeChild(this._chevron);
	                this._header.removeOnClickListener(this._collapseListener);
	                this._chevron = null;
	            }
	        }
	        else {
	            if (!this._chevron) {
	                var l = label("", Icon.CHEVRON_RIGHT).setStyle("float", "left");
	                this._chevron = l;
	                this._header.addChild(l);
	                this._collapseListener = function (x) {
	                    _this.setExpanded(!_this.isExpanded());
	                };
	                this._header.addOnClickListener(this._collapseListener);
	            }
	        }
	    };
	    Section.prototype.setExpanded = function (expanded) {
	        if (this._chevron) {
	            this._chevron.setIcon(expanded ? Icon.CHEVRON_DOWN : Icon.CHEVRON_RIGHT);
	        }
	        this._children.forEach(function (x, n) {
	            if (x instanceof BasicComponent) {
	                x.setDisplay(expanded);
	            }
	        });
	        this._expanded = expanded;
	    };
	    return Section;
	})(Panel);
	exports.Section = Section;
	var BasicViewer = (function (_super) {
	    __extends(BasicViewer, _super);
	    function BasicViewer(renderer) {
	        _super.call(this, "div", null);
	        this.panel = new Panel();
	        this.renderer = renderer;
	    }
	    BasicViewer.prototype.dispose = function () {
	        _super.prototype.dispose.call(this);
	    };
	    BasicViewer.prototype.renderUI = function () {
	        return this.panel.renderUI();
	    };
	    BasicViewer.prototype.setInput = function (value, refresh) {
	        if (refresh === void 0) { refresh = true; }
	        this._model = value;
	        var ui = this.renderer.render(value);
	        if (this.panel) {
	            this.panel.clear();
	            this.panel.addChild(ui);
	        }
	    };
	    return BasicViewer;
	})(Viewer);
	exports.BasicViewer = BasicViewer;
	var TabFolder = (function (_super) {
	    __extends(TabFolder, _super);
	    function TabFolder() {
	        _super.call(this, LayoutType.BLOCK);
	        this._selectedIndex = -1;
	        this._buttons = vc();
	        this._tabs = [];
	        this._buttons.margin(0, 0, 0, 4);
	        _super.prototype.addChild.call(this, this._buttons);
	    }
	    TabFolder.prototype.add = function (header, icon, content, extraClass) {
	        var _this = this;
	        var len = this._tabs.length;
	        var button = new ToggleButton(header, ButtonSizes.SMALL, ButtonHighlights.NO_HIGHLIGHT, icon, function () { return _this.setSelectedIndex(len); });
	        if (extraClass) {
	            button.addClass(extraClass);
	        }
	        this._tabs.push({
	            header: header,
	            icon: icon,
	            button: button,
	            hidden: false,
	            content: content
	        });
	        this._buttons.addChild(button);
	        if (len == 0)
	            this.setSelectedIndex(0);
	    };
	    TabFolder.prototype.tabsCount = function () {
	        return this._tabs.length;
	    };
	    TabFolder.prototype.addChild = function (childPanel) {
	        this.add(childPanel.caption(), childPanel.getIcon(), childPanel);
	    };
	    TabFolder.prototype.replaceChild = function (newChild, oldChild) {
	        _super.prototype.addChild.call(this, newChild, oldChild);
	        this.removeChild(oldChild);
	    };
	    TabFolder.prototype.get = function (index) {
	        if (index < 0 || index > this._tabs.length)
	            return null;
	        return {
	            header: this._tabs[index].header,
	            content: this._tabs[index].content
	        };
	    };
	    TabFolder.prototype.setOnSelected = function (f) {
	        this._onselected = f;
	    };
	    TabFolder.prototype.selectedComponent = function () {
	        return this._tabs[this._selectedIndex].content;
	    };
	    TabFolder.prototype.toggle = function (index, show) {
	        if (index < 0 || index > this._tabs.length)
	            return;
	        var tab = this._tabs[index];
	        if (!show && index == this._selectedIndex)
	            this.setSelectedIndex(0);
	        tab.hidden = !show;
	        tab.button.setDisplay(show);
	    };
	    TabFolder.prototype.setSelectedIndex = function (index) {
	        while (this._tabs[index].hidden)
	            index++;
	        if (index < 0 || index > this._tabs.length || index == this._selectedIndex)
	            return;
	        var newTab = this._tabs[index];
	        newTab.button.setSelected(true);
	        if (this._selectedIndex >= 0) {
	            var oldTab = this._tabs[this._selectedIndex];
	            oldTab.button.setSelected(false);
	            this.replaceChild(newTab.content, oldTab.content);
	        }
	        else {
	            _super.prototype.addChild.call(this, newTab.content);
	        }
	        if (newTab.content instanceof BasicComponent)
	            newTab.content.margin(0, 0, 4, 4);
	        this._selectedIndex = index;
	        if (this._onselected) {
	            this._onselected();
	        }
	    };
	    return TabFolder;
	})(Panel);
	exports.TabFolder = TabFolder;
	function label(text, ic, tc, th) {
	    if (ic === void 0) { ic = null; }
	    if (tc === void 0) { tc = null; }
	    if (th === void 0) { th = null; }
	    var v = new TextElement("label", text, ic);
	    applyStyling(tc, v, th);
	    return v;
	}
	exports.label = label;
	function html(text) {
	    var v = new InlineHTMLElement("span", text);
	    return v;
	}
	exports.html = html;
	function a(text, e, ic, tc, th) {
	    if (ic === void 0) { ic = null; }
	    if (tc === void 0) { tc = null; }
	    if (th === void 0) { th = null; }
	    var v = new TextElement("a", text, ic);
	    v.addOnClickListener(e);
	    applyStyling(tc, v, th);
	    return v;
	}
	exports.a = a;
	function checkBox(caption, h) {
	    if (h === void 0) { h = function (x) { }; }
	    return new CheckBox(caption, null, h);
	}
	exports.checkBox = checkBox;
	function select(caption) {
	    return new Select(caption, function (x) { return x; });
	}
	exports.select = select;
	function button(txt, _size, _highlight, _icon, onClick) {
	    if (_size === void 0) { _size = ButtonSizes.NORMAL; }
	    if (_highlight === void 0) { _highlight = ButtonHighlights.NO_HIGHLIGHT; }
	    if (_icon === void 0) { _icon = null; }
	    if (onClick === void 0) { onClick = null; }
	    return new Button(txt, _size, _highlight, _icon, onClick);
	}
	exports.button = button;
	function buttonSimple(txt, onClick, _icon) {
	    if (onClick === void 0) { onClick = null; }
	    if (_icon === void 0) { _icon = null; }
	    return new Button(txt, ButtonSizes.NORMAL, ButtonHighlights.NO_HIGHLIGHT, _icon, onClick);
	}
	exports.buttonSimple = buttonSimple;
	function toggle(txt, _size, _highlight, _icon, onClick) {
	    if (_size === void 0) { _size = ButtonSizes.NORMAL; }
	    if (_highlight === void 0) { _highlight = ButtonHighlights.NO_HIGHLIGHT; }
	    if (_icon === void 0) { _icon = null; }
	    if (onClick === void 0) { onClick = null; }
	    return new ToggleButton(txt, _size, _highlight, _icon, onClick);
	}
	exports.toggle = toggle;
	function renderer(v) {
	    return new SimpleRenderer(v);
	}
	exports.renderer = renderer;
	function treeViewer(childFunc, renderer, labelProvider) {
	    return new TreeViewer(new DefaultTreeContentProvider(childFunc), renderer, labelProvider);
	}
	exports.treeViewer = treeViewer;
	function treeViewerSection(header, icon, input, childFunc, renderer) {
	    var resp = section(header, icon);
	    var tw = treeViewer(childFunc, renderer);
	    tw.renderUI();
	    tw.setInput(input);
	    resp.addChild(filterField(tw));
	    resp.viewer = tw;
	    resp.addChild(tw);
	    return resp;
	}
	exports.treeViewerSection = treeViewerSection;
	function filterField(viewer) {
	    var flt = new BasicFilter();
	    var t = new TextField("Filter:", "", function (x) {
	        flt.setPattern(x.getValue());
	    }, LayoutType.INLINE_BLOCK);
	    t.setStyle("margin-bottom", "5px");
	    viewer.addViewerFilter(flt);
	    return t;
	}
	exports.filterField = filterField;
	function toggleFilter(viewer, icon, pred, on, desc) {
	    if (on === void 0) { on = false; }
	    if (desc === void 0) { desc = ""; }
	    var flt = new ToggleFilter(pred);
	    var t = toggle("", ButtonSizes.EXTRA_SMALL, ButtonHighlights.NO_HIGHLIGHT, icon, function (x) {
	        flt.setOn(!flt.isOn());
	    });
	    t.setSelected(on);
	    flt.setOn(on);
	    viewer.addViewerFilter(flt);
	    return t;
	}
	exports.toggleFilter = toggleFilter;
	function section(text, ic, collapsable, colapsed) {
	    if (ic === void 0) { ic = null; }
	    if (collapsable === void 0) { collapsable = true; }
	    if (colapsed === void 0) { colapsed = false; }
	    var children = [];
	    for (var _i = 4; _i < arguments.length; _i++) {
	        children[_i - 4] = arguments[_i];
	    }
	    var textElement = new TextElement("h2", text, ic);
	    var newSection = new Section(textElement, collapsable);
	    children.filter(function (x) { return x != null; }).forEach(function (x) { return newSection.addChild(x); });
	    newSection.setExpanded(!colapsed);
	    return newSection;
	}
	exports.section = section;
	function masterDetailsPanel(selectionProvider, viewer, convert, horizontal) {
	    if (convert === void 0) { convert = null; }
	    if (horizontal === void 0) { horizontal = false; }
	    var panel = horizontal ? hc(selectionProvider, viewer) : vc(selectionProvider, viewer);
	    masterDetails(selectionProvider, viewer, convert);
	    return panel;
	}
	exports.masterDetailsPanel = masterDetailsPanel;
	function hcTight() {
	    var children = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        children[_i - 0] = arguments[_i];
	    }
	    var panel = new Panel(LayoutType.INLINE_BLOCK_TIGHT);
	    children.forEach(function (x) { return panel.addChild(x); });
	    return panel;
	}
	exports.hcTight = hcTight;
	function hc() {
	    var children = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        children[_i - 0] = arguments[_i];
	    }
	    var panel = new Panel(LayoutType.INLINE_BLOCK);
	    children.forEach(function (x) { return panel.addChild(x); });
	    return panel;
	}
	exports.hc = hc;
	function vc() {
	    var children = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        children[_i - 0] = arguments[_i];
	    }
	    var panel = new Panel(LayoutType.BLOCK);
	    children.forEach(function (x) { return panel.addChild(x); });
	    return panel;
	}
	exports.vc = vc;
	function li() {
	    var children = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        children[_i - 0] = arguments[_i];
	    }
	    var panel = new Panel(LayoutType.BLOCK);
	    panel.setTagName("li");
	    children.forEach(function (x) { return panel.addChild(x); });
	    return panel;
	}
	exports.li = li;
	function masterDetails(selectionProvider, viewer, convert) {
	    if (convert === void 0) { convert = null; }
	    selectionProvider.addSelectionListener({
	        selectionChanged: function (e) {
	            if (!e.selection.isEmpty()) {
	                var val = e.selection.elements[0];
	                if (convert) {
	                    var vl = convert(val);
	                    viewer.setInput(vl);
	                }
	                else {
	                    viewer.setInput(val);
	                }
	            }
	            else {
	                viewer.setInput(null);
	            }
	        }
	    });
	}
	exports.masterDetails = masterDetails;
	function prompt(name, callBack, initialValue) {
	    var pane = null;
	    var section = section(name, Icon.BOOK, false, false);
	    var textValue = initialValue;
	    section.addChild(new AtomEditorElement(initialValue, function (x) { return textValue = x.getBinding().get(); }));
	    var buttonBar = hc().setPercentWidth(100).setStyle("display", "flex");
	    buttonBar.addChild(label("", null, null, null).setStyle("flex", "1"));
	    buttonBar.addChild(button("Cancel", ButtonSizes.NORMAL, ButtonHighlights.NO_HIGHLIGHT, Icon.NONE, function (x) { pane.destroy(); }).margin(10, 10));
	    var okButton = button("Submit", ButtonSizes.NORMAL, ButtonHighlights.SUCCESS, Icon.NONE, function (x) {
	        pane.destroy();
	        callBack(textValue);
	    });
	    buttonBar.addChild(okButton);
	    section.addChild(buttonBar);
	    pane = atom.workspace.addModalPanel({ item: section.renderUI() });
	}
	exports.prompt = prompt;
	exports.fdUtils = __webpack_require__(9);
	//# sourceMappingURL=UI.js.map

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;//     Underscore.js 1.8.3
	//     http://underscorejs.org
	//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	//     Underscore may be freely distributed under the MIT license.

	(function() {

	  // Baseline setup
	  // --------------

	  // Establish the root object, `window` in the browser, or `exports` on the server.
	  var root = this;

	  // Save the previous value of the `_` variable.
	  var previousUnderscore = root._;

	  // Save bytes in the minified (but not gzipped) version:
	  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

	  // Create quick reference variables for speed access to core prototypes.
	  var
	    push             = ArrayProto.push,
	    slice            = ArrayProto.slice,
	    toString         = ObjProto.toString,
	    hasOwnProperty   = ObjProto.hasOwnProperty;

	  // All **ECMAScript 5** native function implementations that we hope to use
	  // are declared here.
	  var
	    nativeIsArray      = Array.isArray,
	    nativeKeys         = Object.keys,
	    nativeBind         = FuncProto.bind,
	    nativeCreate       = Object.create;

	  // Naked function reference for surrogate-prototype-swapping.
	  var Ctor = function(){};

	  // Create a safe reference to the Underscore object for use below.
	  var _ = function(obj) {
	    if (obj instanceof _) return obj;
	    if (!(this instanceof _)) return new _(obj);
	    this._wrapped = obj;
	  };

	  // Export the Underscore object for **Node.js**, with
	  // backwards-compatibility for the old `require()` API. If we're in
	  // the browser, add `_` as a global object.
	  if (true) {
	    if (typeof module !== 'undefined' && module.exports) {
	      exports = module.exports = _;
	    }
	    exports._ = _;
	  } else {
	    root._ = _;
	  }

	  // Current version.
	  _.VERSION = '1.8.3';

	  // Internal function that returns an efficient (for current engines) version
	  // of the passed-in callback, to be repeatedly applied in other Underscore
	  // functions.
	  var optimizeCb = function(func, context, argCount) {
	    if (context === void 0) return func;
	    switch (argCount == null ? 3 : argCount) {
	      case 1: return function(value) {
	        return func.call(context, value);
	      };
	      case 2: return function(value, other) {
	        return func.call(context, value, other);
	      };
	      case 3: return function(value, index, collection) {
	        return func.call(context, value, index, collection);
	      };
	      case 4: return function(accumulator, value, index, collection) {
	        return func.call(context, accumulator, value, index, collection);
	      };
	    }
	    return function() {
	      return func.apply(context, arguments);
	    };
	  };

	  // A mostly-internal function to generate callbacks that can be applied
	  // to each element in a collection, returning the desired result — either
	  // identity, an arbitrary callback, a property matcher, or a property accessor.
	  var cb = function(value, context, argCount) {
	    if (value == null) return _.identity;
	    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
	    if (_.isObject(value)) return _.matcher(value);
	    return _.property(value);
	  };
	  _.iteratee = function(value, context) {
	    return cb(value, context, Infinity);
	  };

	  // An internal function for creating assigner functions.
	  var createAssigner = function(keysFunc, undefinedOnly) {
	    return function(obj) {
	      var length = arguments.length;
	      if (length < 2 || obj == null) return obj;
	      for (var index = 1; index < length; index++) {
	        var source = arguments[index],
	            keys = keysFunc(source),
	            l = keys.length;
	        for (var i = 0; i < l; i++) {
	          var key = keys[i];
	          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
	        }
	      }
	      return obj;
	    };
	  };

	  // An internal function for creating a new object that inherits from another.
	  var baseCreate = function(prototype) {
	    if (!_.isObject(prototype)) return {};
	    if (nativeCreate) return nativeCreate(prototype);
	    Ctor.prototype = prototype;
	    var result = new Ctor;
	    Ctor.prototype = null;
	    return result;
	  };

	  var property = function(key) {
	    return function(obj) {
	      return obj == null ? void 0 : obj[key];
	    };
	  };

	  // Helper for collection methods to determine whether a collection
	  // should be iterated as an array or as an object
	  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
	  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
	  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
	  var getLength = property('length');
	  var isArrayLike = function(collection) {
	    var length = getLength(collection);
	    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
	  };

	  // Collection Functions
	  // --------------------

	  // The cornerstone, an `each` implementation, aka `forEach`.
	  // Handles raw objects in addition to array-likes. Treats all
	  // sparse array-likes as if they were dense.
	  _.each = _.forEach = function(obj, iteratee, context) {
	    iteratee = optimizeCb(iteratee, context);
	    var i, length;
	    if (isArrayLike(obj)) {
	      for (i = 0, length = obj.length; i < length; i++) {
	        iteratee(obj[i], i, obj);
	      }
	    } else {
	      var keys = _.keys(obj);
	      for (i = 0, length = keys.length; i < length; i++) {
	        iteratee(obj[keys[i]], keys[i], obj);
	      }
	    }
	    return obj;
	  };

	  // Return the results of applying the iteratee to each element.
	  _.map = _.collect = function(obj, iteratee, context) {
	    iteratee = cb(iteratee, context);
	    var keys = !isArrayLike(obj) && _.keys(obj),
	        length = (keys || obj).length,
	        results = Array(length);
	    for (var index = 0; index < length; index++) {
	      var currentKey = keys ? keys[index] : index;
	      results[index] = iteratee(obj[currentKey], currentKey, obj);
	    }
	    return results;
	  };

	  // Create a reducing function iterating left or right.
	  function createReduce(dir) {
	    // Optimized iterator function as using arguments.length
	    // in the main function will deoptimize the, see #1991.
	    function iterator(obj, iteratee, memo, keys, index, length) {
	      for (; index >= 0 && index < length; index += dir) {
	        var currentKey = keys ? keys[index] : index;
	        memo = iteratee(memo, obj[currentKey], currentKey, obj);
	      }
	      return memo;
	    }

	    return function(obj, iteratee, memo, context) {
	      iteratee = optimizeCb(iteratee, context, 4);
	      var keys = !isArrayLike(obj) && _.keys(obj),
	          length = (keys || obj).length,
	          index = dir > 0 ? 0 : length - 1;
	      // Determine the initial value if none is provided.
	      if (arguments.length < 3) {
	        memo = obj[keys ? keys[index] : index];
	        index += dir;
	      }
	      return iterator(obj, iteratee, memo, keys, index, length);
	    };
	  }

	  // **Reduce** builds up a single result from a list of values, aka `inject`,
	  // or `foldl`.
	  _.reduce = _.foldl = _.inject = createReduce(1);

	  // The right-associative version of reduce, also known as `foldr`.
	  _.reduceRight = _.foldr = createReduce(-1);

	  // Return the first value which passes a truth test. Aliased as `detect`.
	  _.find = _.detect = function(obj, predicate, context) {
	    var key;
	    if (isArrayLike(obj)) {
	      key = _.findIndex(obj, predicate, context);
	    } else {
	      key = _.findKey(obj, predicate, context);
	    }
	    if (key !== void 0 && key !== -1) return obj[key];
	  };

	  // Return all the elements that pass a truth test.
	  // Aliased as `select`.
	  _.filter = _.select = function(obj, predicate, context) {
	    var results = [];
	    predicate = cb(predicate, context);
	    _.each(obj, function(value, index, list) {
	      if (predicate(value, index, list)) results.push(value);
	    });
	    return results;
	  };

	  // Return all the elements for which a truth test fails.
	  _.reject = function(obj, predicate, context) {
	    return _.filter(obj, _.negate(cb(predicate)), context);
	  };

	  // Determine whether all of the elements match a truth test.
	  // Aliased as `all`.
	  _.every = _.all = function(obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var keys = !isArrayLike(obj) && _.keys(obj),
	        length = (keys || obj).length;
	    for (var index = 0; index < length; index++) {
	      var currentKey = keys ? keys[index] : index;
	      if (!predicate(obj[currentKey], currentKey, obj)) return false;
	    }
	    return true;
	  };

	  // Determine if at least one element in the object matches a truth test.
	  // Aliased as `any`.
	  _.some = _.any = function(obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var keys = !isArrayLike(obj) && _.keys(obj),
	        length = (keys || obj).length;
	    for (var index = 0; index < length; index++) {
	      var currentKey = keys ? keys[index] : index;
	      if (predicate(obj[currentKey], currentKey, obj)) return true;
	    }
	    return false;
	  };

	  // Determine if the array or object contains a given item (using `===`).
	  // Aliased as `includes` and `include`.
	  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
	    if (!isArrayLike(obj)) obj = _.values(obj);
	    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
	    return _.indexOf(obj, item, fromIndex) >= 0;
	  };

	  // Invoke a method (with arguments) on every item in a collection.
	  _.invoke = function(obj, method) {
	    var args = slice.call(arguments, 2);
	    var isFunc = _.isFunction(method);
	    return _.map(obj, function(value) {
	      var func = isFunc ? method : value[method];
	      return func == null ? func : func.apply(value, args);
	    });
	  };

	  // Convenience version of a common use case of `map`: fetching a property.
	  _.pluck = function(obj, key) {
	    return _.map(obj, _.property(key));
	  };

	  // Convenience version of a common use case of `filter`: selecting only objects
	  // containing specific `key:value` pairs.
	  _.where = function(obj, attrs) {
	    return _.filter(obj, _.matcher(attrs));
	  };

	  // Convenience version of a common use case of `find`: getting the first object
	  // containing specific `key:value` pairs.
	  _.findWhere = function(obj, attrs) {
	    return _.find(obj, _.matcher(attrs));
	  };

	  // Return the maximum element (or element-based computation).
	  _.max = function(obj, iteratee, context) {
	    var result = -Infinity, lastComputed = -Infinity,
	        value, computed;
	    if (iteratee == null && obj != null) {
	      obj = isArrayLike(obj) ? obj : _.values(obj);
	      for (var i = 0, length = obj.length; i < length; i++) {
	        value = obj[i];
	        if (value > result) {
	          result = value;
	        }
	      }
	    } else {
	      iteratee = cb(iteratee, context);
	      _.each(obj, function(value, index, list) {
	        computed = iteratee(value, index, list);
	        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
	          result = value;
	          lastComputed = computed;
	        }
	      });
	    }
	    return result;
	  };

	  // Return the minimum element (or element-based computation).
	  _.min = function(obj, iteratee, context) {
	    var result = Infinity, lastComputed = Infinity,
	        value, computed;
	    if (iteratee == null && obj != null) {
	      obj = isArrayLike(obj) ? obj : _.values(obj);
	      for (var i = 0, length = obj.length; i < length; i++) {
	        value = obj[i];
	        if (value < result) {
	          result = value;
	        }
	      }
	    } else {
	      iteratee = cb(iteratee, context);
	      _.each(obj, function(value, index, list) {
	        computed = iteratee(value, index, list);
	        if (computed < lastComputed || computed === Infinity && result === Infinity) {
	          result = value;
	          lastComputed = computed;
	        }
	      });
	    }
	    return result;
	  };

	  // Shuffle a collection, using the modern version of the
	  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
	  _.shuffle = function(obj) {
	    var set = isArrayLike(obj) ? obj : _.values(obj);
	    var length = set.length;
	    var shuffled = Array(length);
	    for (var index = 0, rand; index < length; index++) {
	      rand = _.random(0, index);
	      if (rand !== index) shuffled[index] = shuffled[rand];
	      shuffled[rand] = set[index];
	    }
	    return shuffled;
	  };

	  // Sample **n** random values from a collection.
	  // If **n** is not specified, returns a single random element.
	  // The internal `guard` argument allows it to work with `map`.
	  _.sample = function(obj, n, guard) {
	    if (n == null || guard) {
	      if (!isArrayLike(obj)) obj = _.values(obj);
	      return obj[_.random(obj.length - 1)];
	    }
	    return _.shuffle(obj).slice(0, Math.max(0, n));
	  };

	  // Sort the object's values by a criterion produced by an iteratee.
	  _.sortBy = function(obj, iteratee, context) {
	    iteratee = cb(iteratee, context);
	    return _.pluck(_.map(obj, function(value, index, list) {
	      return {
	        value: value,
	        index: index,
	        criteria: iteratee(value, index, list)
	      };
	    }).sort(function(left, right) {
	      var a = left.criteria;
	      var b = right.criteria;
	      if (a !== b) {
	        if (a > b || a === void 0) return 1;
	        if (a < b || b === void 0) return -1;
	      }
	      return left.index - right.index;
	    }), 'value');
	  };

	  // An internal function used for aggregate "group by" operations.
	  var group = function(behavior) {
	    return function(obj, iteratee, context) {
	      var result = {};
	      iteratee = cb(iteratee, context);
	      _.each(obj, function(value, index) {
	        var key = iteratee(value, index, obj);
	        behavior(result, value, key);
	      });
	      return result;
	    };
	  };

	  // Groups the object's values by a criterion. Pass either a string attribute
	  // to group by, or a function that returns the criterion.
	  _.groupBy = group(function(result, value, key) {
	    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
	  });

	  // Indexes the object's values by a criterion, similar to `groupBy`, but for
	  // when you know that your index values will be unique.
	  _.indexBy = group(function(result, value, key) {
	    result[key] = value;
	  });

	  // Counts instances of an object that group by a certain criterion. Pass
	  // either a string attribute to count by, or a function that returns the
	  // criterion.
	  _.countBy = group(function(result, value, key) {
	    if (_.has(result, key)) result[key]++; else result[key] = 1;
	  });

	  // Safely create a real, live array from anything iterable.
	  _.toArray = function(obj) {
	    if (!obj) return [];
	    if (_.isArray(obj)) return slice.call(obj);
	    if (isArrayLike(obj)) return _.map(obj, _.identity);
	    return _.values(obj);
	  };

	  // Return the number of elements in an object.
	  _.size = function(obj) {
	    if (obj == null) return 0;
	    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
	  };

	  // Split a collection into two arrays: one whose elements all satisfy the given
	  // predicate, and one whose elements all do not satisfy the predicate.
	  _.partition = function(obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var pass = [], fail = [];
	    _.each(obj, function(value, key, obj) {
	      (predicate(value, key, obj) ? pass : fail).push(value);
	    });
	    return [pass, fail];
	  };

	  // Array Functions
	  // ---------------

	  // Get the first element of an array. Passing **n** will return the first N
	  // values in the array. Aliased as `head` and `take`. The **guard** check
	  // allows it to work with `_.map`.
	  _.first = _.head = _.take = function(array, n, guard) {
	    if (array == null) return void 0;
	    if (n == null || guard) return array[0];
	    return _.initial(array, array.length - n);
	  };

	  // Returns everything but the last entry of the array. Especially useful on
	  // the arguments object. Passing **n** will return all the values in
	  // the array, excluding the last N.
	  _.initial = function(array, n, guard) {
	    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
	  };

	  // Get the last element of an array. Passing **n** will return the last N
	  // values in the array.
	  _.last = function(array, n, guard) {
	    if (array == null) return void 0;
	    if (n == null || guard) return array[array.length - 1];
	    return _.rest(array, Math.max(0, array.length - n));
	  };

	  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
	  // Especially useful on the arguments object. Passing an **n** will return
	  // the rest N values in the array.
	  _.rest = _.tail = _.drop = function(array, n, guard) {
	    return slice.call(array, n == null || guard ? 1 : n);
	  };

	  // Trim out all falsy values from an array.
	  _.compact = function(array) {
	    return _.filter(array, _.identity);
	  };

	  // Internal implementation of a recursive `flatten` function.
	  var flatten = function(input, shallow, strict, startIndex) {
	    var output = [], idx = 0;
	    for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
	      var value = input[i];
	      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
	        //flatten current level of array or arguments object
	        if (!shallow) value = flatten(value, shallow, strict);
	        var j = 0, len = value.length;
	        output.length += len;
	        while (j < len) {
	          output[idx++] = value[j++];
	        }
	      } else if (!strict) {
	        output[idx++] = value;
	      }
	    }
	    return output;
	  };

	  // Flatten out an array, either recursively (by default), or just one level.
	  _.flatten = function(array, shallow) {
	    return flatten(array, shallow, false);
	  };

	  // Return a version of the array that does not contain the specified value(s).
	  _.without = function(array) {
	    return _.difference(array, slice.call(arguments, 1));
	  };

	  // Produce a duplicate-free version of the array. If the array has already
	  // been sorted, you have the option of using a faster algorithm.
	  // Aliased as `unique`.
	  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
	    if (!_.isBoolean(isSorted)) {
	      context = iteratee;
	      iteratee = isSorted;
	      isSorted = false;
	    }
	    if (iteratee != null) iteratee = cb(iteratee, context);
	    var result = [];
	    var seen = [];
	    for (var i = 0, length = getLength(array); i < length; i++) {
	      var value = array[i],
	          computed = iteratee ? iteratee(value, i, array) : value;
	      if (isSorted) {
	        if (!i || seen !== computed) result.push(value);
	        seen = computed;
	      } else if (iteratee) {
	        if (!_.contains(seen, computed)) {
	          seen.push(computed);
	          result.push(value);
	        }
	      } else if (!_.contains(result, value)) {
	        result.push(value);
	      }
	    }
	    return result;
	  };

	  // Produce an array that contains the union: each distinct element from all of
	  // the passed-in arrays.
	  _.union = function() {
	    return _.uniq(flatten(arguments, true, true));
	  };

	  // Produce an array that contains every item shared between all the
	  // passed-in arrays.
	  _.intersection = function(array) {
	    var result = [];
	    var argsLength = arguments.length;
	    for (var i = 0, length = getLength(array); i < length; i++) {
	      var item = array[i];
	      if (_.contains(result, item)) continue;
	      for (var j = 1; j < argsLength; j++) {
	        if (!_.contains(arguments[j], item)) break;
	      }
	      if (j === argsLength) result.push(item);
	    }
	    return result;
	  };

	  // Take the difference between one array and a number of other arrays.
	  // Only the elements present in just the first array will remain.
	  _.difference = function(array) {
	    var rest = flatten(arguments, true, true, 1);
	    return _.filter(array, function(value){
	      return !_.contains(rest, value);
	    });
	  };

	  // Zip together multiple lists into a single array -- elements that share
	  // an index go together.
	  _.zip = function() {
	    return _.unzip(arguments);
	  };

	  // Complement of _.zip. Unzip accepts an array of arrays and groups
	  // each array's elements on shared indices
	  _.unzip = function(array) {
	    var length = array && _.max(array, getLength).length || 0;
	    var result = Array(length);

	    for (var index = 0; index < length; index++) {
	      result[index] = _.pluck(array, index);
	    }
	    return result;
	  };

	  // Converts lists into objects. Pass either a single array of `[key, value]`
	  // pairs, or two parallel arrays of the same length -- one of keys, and one of
	  // the corresponding values.
	  _.object = function(list, values) {
	    var result = {};
	    for (var i = 0, length = getLength(list); i < length; i++) {
	      if (values) {
	        result[list[i]] = values[i];
	      } else {
	        result[list[i][0]] = list[i][1];
	      }
	    }
	    return result;
	  };

	  // Generator function to create the findIndex and findLastIndex functions
	  function createPredicateIndexFinder(dir) {
	    return function(array, predicate, context) {
	      predicate = cb(predicate, context);
	      var length = getLength(array);
	      var index = dir > 0 ? 0 : length - 1;
	      for (; index >= 0 && index < length; index += dir) {
	        if (predicate(array[index], index, array)) return index;
	      }
	      return -1;
	    };
	  }

	  // Returns the first index on an array-like that passes a predicate test
	  _.findIndex = createPredicateIndexFinder(1);
	  _.findLastIndex = createPredicateIndexFinder(-1);

	  // Use a comparator function to figure out the smallest index at which
	  // an object should be inserted so as to maintain order. Uses binary search.
	  _.sortedIndex = function(array, obj, iteratee, context) {
	    iteratee = cb(iteratee, context, 1);
	    var value = iteratee(obj);
	    var low = 0, high = getLength(array);
	    while (low < high) {
	      var mid = Math.floor((low + high) / 2);
	      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
	    }
	    return low;
	  };

	  // Generator function to create the indexOf and lastIndexOf functions
	  function createIndexFinder(dir, predicateFind, sortedIndex) {
	    return function(array, item, idx) {
	      var i = 0, length = getLength(array);
	      if (typeof idx == 'number') {
	        if (dir > 0) {
	            i = idx >= 0 ? idx : Math.max(idx + length, i);
	        } else {
	            length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
	        }
	      } else if (sortedIndex && idx && length) {
	        idx = sortedIndex(array, item);
	        return array[idx] === item ? idx : -1;
	      }
	      if (item !== item) {
	        idx = predicateFind(slice.call(array, i, length), _.isNaN);
	        return idx >= 0 ? idx + i : -1;
	      }
	      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
	        if (array[idx] === item) return idx;
	      }
	      return -1;
	    };
	  }

	  // Return the position of the first occurrence of an item in an array,
	  // or -1 if the item is not included in the array.
	  // If the array is large and already in sort order, pass `true`
	  // for **isSorted** to use binary search.
	  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
	  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

	  // Generate an integer Array containing an arithmetic progression. A port of
	  // the native Python `range()` function. See
	  // [the Python documentation](http://docs.python.org/library/functions.html#range).
	  _.range = function(start, stop, step) {
	    if (stop == null) {
	      stop = start || 0;
	      start = 0;
	    }
	    step = step || 1;

	    var length = Math.max(Math.ceil((stop - start) / step), 0);
	    var range = Array(length);

	    for (var idx = 0; idx < length; idx++, start += step) {
	      range[idx] = start;
	    }

	    return range;
	  };

	  // Function (ahem) Functions
	  // ------------------

	  // Determines whether to execute a function as a constructor
	  // or a normal function with the provided arguments
	  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
	    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
	    var self = baseCreate(sourceFunc.prototype);
	    var result = sourceFunc.apply(self, args);
	    if (_.isObject(result)) return result;
	    return self;
	  };

	  // Create a function bound to a given object (assigning `this`, and arguments,
	  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
	  // available.
	  _.bind = function(func, context) {
	    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
	    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
	    var args = slice.call(arguments, 2);
	    var bound = function() {
	      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
	    };
	    return bound;
	  };

	  // Partially apply a function by creating a version that has had some of its
	  // arguments pre-filled, without changing its dynamic `this` context. _ acts
	  // as a placeholder, allowing any combination of arguments to be pre-filled.
	  _.partial = function(func) {
	    var boundArgs = slice.call(arguments, 1);
	    var bound = function() {
	      var position = 0, length = boundArgs.length;
	      var args = Array(length);
	      for (var i = 0; i < length; i++) {
	        args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
	      }
	      while (position < arguments.length) args.push(arguments[position++]);
	      return executeBound(func, bound, this, this, args);
	    };
	    return bound;
	  };

	  // Bind a number of an object's methods to that object. Remaining arguments
	  // are the method names to be bound. Useful for ensuring that all callbacks
	  // defined on an object belong to it.
	  _.bindAll = function(obj) {
	    var i, length = arguments.length, key;
	    if (length <= 1) throw new Error('bindAll must be passed function names');
	    for (i = 1; i < length; i++) {
	      key = arguments[i];
	      obj[key] = _.bind(obj[key], obj);
	    }
	    return obj;
	  };

	  // Memoize an expensive function by storing its results.
	  _.memoize = function(func, hasher) {
	    var memoize = function(key) {
	      var cache = memoize.cache;
	      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
	      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
	      return cache[address];
	    };
	    memoize.cache = {};
	    return memoize;
	  };

	  // Delays a function for the given number of milliseconds, and then calls
	  // it with the arguments supplied.
	  _.delay = function(func, wait) {
	    var args = slice.call(arguments, 2);
	    return setTimeout(function(){
	      return func.apply(null, args);
	    }, wait);
	  };

	  // Defers a function, scheduling it to run after the current call stack has
	  // cleared.
	  _.defer = _.partial(_.delay, _, 1);

	  // Returns a function, that, when invoked, will only be triggered at most once
	  // during a given window of time. Normally, the throttled function will run
	  // as much as it can, without ever going more than once per `wait` duration;
	  // but if you'd like to disable the execution on the leading edge, pass
	  // `{leading: false}`. To disable execution on the trailing edge, ditto.
	  _.throttle = function(func, wait, options) {
	    var context, args, result;
	    var timeout = null;
	    var previous = 0;
	    if (!options) options = {};
	    var later = function() {
	      previous = options.leading === false ? 0 : _.now();
	      timeout = null;
	      result = func.apply(context, args);
	      if (!timeout) context = args = null;
	    };
	    return function() {
	      var now = _.now();
	      if (!previous && options.leading === false) previous = now;
	      var remaining = wait - (now - previous);
	      context = this;
	      args = arguments;
	      if (remaining <= 0 || remaining > wait) {
	        if (timeout) {
	          clearTimeout(timeout);
	          timeout = null;
	        }
	        previous = now;
	        result = func.apply(context, args);
	        if (!timeout) context = args = null;
	      } else if (!timeout && options.trailing !== false) {
	        timeout = setTimeout(later, remaining);
	      }
	      return result;
	    };
	  };

	  // Returns a function, that, as long as it continues to be invoked, will not
	  // be triggered. The function will be called after it stops being called for
	  // N milliseconds. If `immediate` is passed, trigger the function on the
	  // leading edge, instead of the trailing.
	  _.debounce = function(func, wait, immediate) {
	    var timeout, args, context, timestamp, result;

	    var later = function() {
	      var last = _.now() - timestamp;

	      if (last < wait && last >= 0) {
	        timeout = setTimeout(later, wait - last);
	      } else {
	        timeout = null;
	        if (!immediate) {
	          result = func.apply(context, args);
	          if (!timeout) context = args = null;
	        }
	      }
	    };

	    return function() {
	      context = this;
	      args = arguments;
	      timestamp = _.now();
	      var callNow = immediate && !timeout;
	      if (!timeout) timeout = setTimeout(later, wait);
	      if (callNow) {
	        result = func.apply(context, args);
	        context = args = null;
	      }

	      return result;
	    };
	  };

	  // Returns the first function passed as an argument to the second,
	  // allowing you to adjust arguments, run code before and after, and
	  // conditionally execute the original function.
	  _.wrap = function(func, wrapper) {
	    return _.partial(wrapper, func);
	  };

	  // Returns a negated version of the passed-in predicate.
	  _.negate = function(predicate) {
	    return function() {
	      return !predicate.apply(this, arguments);
	    };
	  };

	  // Returns a function that is the composition of a list of functions, each
	  // consuming the return value of the function that follows.
	  _.compose = function() {
	    var args = arguments;
	    var start = args.length - 1;
	    return function() {
	      var i = start;
	      var result = args[start].apply(this, arguments);
	      while (i--) result = args[i].call(this, result);
	      return result;
	    };
	  };

	  // Returns a function that will only be executed on and after the Nth call.
	  _.after = function(times, func) {
	    return function() {
	      if (--times < 1) {
	        return func.apply(this, arguments);
	      }
	    };
	  };

	  // Returns a function that will only be executed up to (but not including) the Nth call.
	  _.before = function(times, func) {
	    var memo;
	    return function() {
	      if (--times > 0) {
	        memo = func.apply(this, arguments);
	      }
	      if (times <= 1) func = null;
	      return memo;
	    };
	  };

	  // Returns a function that will be executed at most one time, no matter how
	  // often you call it. Useful for lazy initialization.
	  _.once = _.partial(_.before, 2);

	  // Object Functions
	  // ----------------

	  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
	  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
	  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
	                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

	  function collectNonEnumProps(obj, keys) {
	    var nonEnumIdx = nonEnumerableProps.length;
	    var constructor = obj.constructor;
	    var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;

	    // Constructor is a special case.
	    var prop = 'constructor';
	    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

	    while (nonEnumIdx--) {
	      prop = nonEnumerableProps[nonEnumIdx];
	      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
	        keys.push(prop);
	      }
	    }
	  }

	  // Retrieve the names of an object's own properties.
	  // Delegates to **ECMAScript 5**'s native `Object.keys`
	  _.keys = function(obj) {
	    if (!_.isObject(obj)) return [];
	    if (nativeKeys) return nativeKeys(obj);
	    var keys = [];
	    for (var key in obj) if (_.has(obj, key)) keys.push(key);
	    // Ahem, IE < 9.
	    if (hasEnumBug) collectNonEnumProps(obj, keys);
	    return keys;
	  };

	  // Retrieve all the property names of an object.
	  _.allKeys = function(obj) {
	    if (!_.isObject(obj)) return [];
	    var keys = [];
	    for (var key in obj) keys.push(key);
	    // Ahem, IE < 9.
	    if (hasEnumBug) collectNonEnumProps(obj, keys);
	    return keys;
	  };

	  // Retrieve the values of an object's properties.
	  _.values = function(obj) {
	    var keys = _.keys(obj);
	    var length = keys.length;
	    var values = Array(length);
	    for (var i = 0; i < length; i++) {
	      values[i] = obj[keys[i]];
	    }
	    return values;
	  };

	  // Returns the results of applying the iteratee to each element of the object
	  // In contrast to _.map it returns an object
	  _.mapObject = function(obj, iteratee, context) {
	    iteratee = cb(iteratee, context);
	    var keys =  _.keys(obj),
	          length = keys.length,
	          results = {},
	          currentKey;
	      for (var index = 0; index < length; index++) {
	        currentKey = keys[index];
	        results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
	      }
	      return results;
	  };

	  // Convert an object into a list of `[key, value]` pairs.
	  _.pairs = function(obj) {
	    var keys = _.keys(obj);
	    var length = keys.length;
	    var pairs = Array(length);
	    for (var i = 0; i < length; i++) {
	      pairs[i] = [keys[i], obj[keys[i]]];
	    }
	    return pairs;
	  };

	  // Invert the keys and values of an object. The values must be serializable.
	  _.invert = function(obj) {
	    var result = {};
	    var keys = _.keys(obj);
	    for (var i = 0, length = keys.length; i < length; i++) {
	      result[obj[keys[i]]] = keys[i];
	    }
	    return result;
	  };

	  // Return a sorted list of the function names available on the object.
	  // Aliased as `methods`
	  _.functions = _.methods = function(obj) {
	    var names = [];
	    for (var key in obj) {
	      if (_.isFunction(obj[key])) names.push(key);
	    }
	    return names.sort();
	  };

	  // Extend a given object with all the properties in passed-in object(s).
	  _.extend = createAssigner(_.allKeys);

	  // Assigns a given object with all the own properties in the passed-in object(s)
	  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
	  _.extendOwn = _.assign = createAssigner(_.keys);

	  // Returns the first key on an object that passes a predicate test
	  _.findKey = function(obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var keys = _.keys(obj), key;
	    for (var i = 0, length = keys.length; i < length; i++) {
	      key = keys[i];
	      if (predicate(obj[key], key, obj)) return key;
	    }
	  };

	  // Return a copy of the object only containing the whitelisted properties.
	  _.pick = function(object, oiteratee, context) {
	    var result = {}, obj = object, iteratee, keys;
	    if (obj == null) return result;
	    if (_.isFunction(oiteratee)) {
	      keys = _.allKeys(obj);
	      iteratee = optimizeCb(oiteratee, context);
	    } else {
	      keys = flatten(arguments, false, false, 1);
	      iteratee = function(value, key, obj) { return key in obj; };
	      obj = Object(obj);
	    }
	    for (var i = 0, length = keys.length; i < length; i++) {
	      var key = keys[i];
	      var value = obj[key];
	      if (iteratee(value, key, obj)) result[key] = value;
	    }
	    return result;
	  };

	   // Return a copy of the object without the blacklisted properties.
	  _.omit = function(obj, iteratee, context) {
	    if (_.isFunction(iteratee)) {
	      iteratee = _.negate(iteratee);
	    } else {
	      var keys = _.map(flatten(arguments, false, false, 1), String);
	      iteratee = function(value, key) {
	        return !_.contains(keys, key);
	      };
	    }
	    return _.pick(obj, iteratee, context);
	  };

	  // Fill in a given object with default properties.
	  _.defaults = createAssigner(_.allKeys, true);

	  // Creates an object that inherits from the given prototype object.
	  // If additional properties are provided then they will be added to the
	  // created object.
	  _.create = function(prototype, props) {
	    var result = baseCreate(prototype);
	    if (props) _.extendOwn(result, props);
	    return result;
	  };

	  // Create a (shallow-cloned) duplicate of an object.
	  _.clone = function(obj) {
	    if (!_.isObject(obj)) return obj;
	    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
	  };

	  // Invokes interceptor with the obj, and then returns obj.
	  // The primary purpose of this method is to "tap into" a method chain, in
	  // order to perform operations on intermediate results within the chain.
	  _.tap = function(obj, interceptor) {
	    interceptor(obj);
	    return obj;
	  };

	  // Returns whether an object has a given set of `key:value` pairs.
	  _.isMatch = function(object, attrs) {
	    var keys = _.keys(attrs), length = keys.length;
	    if (object == null) return !length;
	    var obj = Object(object);
	    for (var i = 0; i < length; i++) {
	      var key = keys[i];
	      if (attrs[key] !== obj[key] || !(key in obj)) return false;
	    }
	    return true;
	  };


	  // Internal recursive comparison function for `isEqual`.
	  var eq = function(a, b, aStack, bStack) {
	    // Identical objects are equal. `0 === -0`, but they aren't identical.
	    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
	    if (a === b) return a !== 0 || 1 / a === 1 / b;
	    // A strict comparison is necessary because `null == undefined`.
	    if (a == null || b == null) return a === b;
	    // Unwrap any wrapped objects.
	    if (a instanceof _) a = a._wrapped;
	    if (b instanceof _) b = b._wrapped;
	    // Compare `[[Class]]` names.
	    var className = toString.call(a);
	    if (className !== toString.call(b)) return false;
	    switch (className) {
	      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
	      case '[object RegExp]':
	      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
	      case '[object String]':
	        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
	        // equivalent to `new String("5")`.
	        return '' + a === '' + b;
	      case '[object Number]':
	        // `NaN`s are equivalent, but non-reflexive.
	        // Object(NaN) is equivalent to NaN
	        if (+a !== +a) return +b !== +b;
	        // An `egal` comparison is performed for other numeric values.
	        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
	      case '[object Date]':
	      case '[object Boolean]':
	        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
	        // millisecond representations. Note that invalid dates with millisecond representations
	        // of `NaN` are not equivalent.
	        return +a === +b;
	    }

	    var areArrays = className === '[object Array]';
	    if (!areArrays) {
	      if (typeof a != 'object' || typeof b != 'object') return false;

	      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
	      // from different frames are.
	      var aCtor = a.constructor, bCtor = b.constructor;
	      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
	                               _.isFunction(bCtor) && bCtor instanceof bCtor)
	                          && ('constructor' in a && 'constructor' in b)) {
	        return false;
	      }
	    }
	    // Assume equality for cyclic structures. The algorithm for detecting cyclic
	    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

	    // Initializing stack of traversed objects.
	    // It's done here since we only need them for objects and arrays comparison.
	    aStack = aStack || [];
	    bStack = bStack || [];
	    var length = aStack.length;
	    while (length--) {
	      // Linear search. Performance is inversely proportional to the number of
	      // unique nested structures.
	      if (aStack[length] === a) return bStack[length] === b;
	    }

	    // Add the first object to the stack of traversed objects.
	    aStack.push(a);
	    bStack.push(b);

	    // Recursively compare objects and arrays.
	    if (areArrays) {
	      // Compare array lengths to determine if a deep comparison is necessary.
	      length = a.length;
	      if (length !== b.length) return false;
	      // Deep compare the contents, ignoring non-numeric properties.
	      while (length--) {
	        if (!eq(a[length], b[length], aStack, bStack)) return false;
	      }
	    } else {
	      // Deep compare objects.
	      var keys = _.keys(a), key;
	      length = keys.length;
	      // Ensure that both objects contain the same number of properties before comparing deep equality.
	      if (_.keys(b).length !== length) return false;
	      while (length--) {
	        // Deep compare each member
	        key = keys[length];
	        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
	      }
	    }
	    // Remove the first object from the stack of traversed objects.
	    aStack.pop();
	    bStack.pop();
	    return true;
	  };

	  // Perform a deep comparison to check if two objects are equal.
	  _.isEqual = function(a, b) {
	    return eq(a, b);
	  };

	  // Is a given array, string, or object empty?
	  // An "empty" object has no enumerable own-properties.
	  _.isEmpty = function(obj) {
	    if (obj == null) return true;
	    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
	    return _.keys(obj).length === 0;
	  };

	  // Is a given value a DOM element?
	  _.isElement = function(obj) {
	    return !!(obj && obj.nodeType === 1);
	  };

	  // Is a given value an array?
	  // Delegates to ECMA5's native Array.isArray
	  _.isArray = nativeIsArray || function(obj) {
	    return toString.call(obj) === '[object Array]';
	  };

	  // Is a given variable an object?
	  _.isObject = function(obj) {
	    var type = typeof obj;
	    return type === 'function' || type === 'object' && !!obj;
	  };

	  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
	  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
	    _['is' + name] = function(obj) {
	      return toString.call(obj) === '[object ' + name + ']';
	    };
	  });

	  // Define a fallback version of the method in browsers (ahem, IE < 9), where
	  // there isn't any inspectable "Arguments" type.
	  if (!_.isArguments(arguments)) {
	    _.isArguments = function(obj) {
	      return _.has(obj, 'callee');
	    };
	  }

	  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
	  // IE 11 (#1621), and in Safari 8 (#1929).
	  if (typeof /./ != 'function' && typeof Int8Array != 'object') {
	    _.isFunction = function(obj) {
	      return typeof obj == 'function' || false;
	    };
	  }

	  // Is a given object a finite number?
	  _.isFinite = function(obj) {
	    return isFinite(obj) && !isNaN(parseFloat(obj));
	  };

	  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
	  _.isNaN = function(obj) {
	    return _.isNumber(obj) && obj !== +obj;
	  };

	  // Is a given value a boolean?
	  _.isBoolean = function(obj) {
	    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
	  };

	  // Is a given value equal to null?
	  _.isNull = function(obj) {
	    return obj === null;
	  };

	  // Is a given variable undefined?
	  _.isUndefined = function(obj) {
	    return obj === void 0;
	  };

	  // Shortcut function for checking if an object has a given property directly
	  // on itself (in other words, not on a prototype).
	  _.has = function(obj, key) {
	    return obj != null && hasOwnProperty.call(obj, key);
	  };

	  // Utility Functions
	  // -----------------

	  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
	  // previous owner. Returns a reference to the Underscore object.
	  _.noConflict = function() {
	    root._ = previousUnderscore;
	    return this;
	  };

	  // Keep the identity function around for default iteratees.
	  _.identity = function(value) {
	    return value;
	  };

	  // Predicate-generating functions. Often useful outside of Underscore.
	  _.constant = function(value) {
	    return function() {
	      return value;
	    };
	  };

	  _.noop = function(){};

	  _.property = property;

	  // Generates a function for a given object that returns a given property.
	  _.propertyOf = function(obj) {
	    return obj == null ? function(){} : function(key) {
	      return obj[key];
	    };
	  };

	  // Returns a predicate for checking whether an object has a given set of
	  // `key:value` pairs.
	  _.matcher = _.matches = function(attrs) {
	    attrs = _.extendOwn({}, attrs);
	    return function(obj) {
	      return _.isMatch(obj, attrs);
	    };
	  };

	  // Run a function **n** times.
	  _.times = function(n, iteratee, context) {
	    var accum = Array(Math.max(0, n));
	    iteratee = optimizeCb(iteratee, context, 1);
	    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
	    return accum;
	  };

	  // Return a random integer between min and max (inclusive).
	  _.random = function(min, max) {
	    if (max == null) {
	      max = min;
	      min = 0;
	    }
	    return min + Math.floor(Math.random() * (max - min + 1));
	  };

	  // A (possibly faster) way to get the current timestamp as an integer.
	  _.now = Date.now || function() {
	    return new Date().getTime();
	  };

	   // List of HTML entities for escaping.
	  var escapeMap = {
	    '&': '&amp;',
	    '<': '&lt;',
	    '>': '&gt;',
	    '"': '&quot;',
	    "'": '&#x27;',
	    '`': '&#x60;'
	  };
	  var unescapeMap = _.invert(escapeMap);

	  // Functions for escaping and unescaping strings to/from HTML interpolation.
	  var createEscaper = function(map) {
	    var escaper = function(match) {
	      return map[match];
	    };
	    // Regexes for identifying a key that needs to be escaped
	    var source = '(?:' + _.keys(map).join('|') + ')';
	    var testRegexp = RegExp(source);
	    var replaceRegexp = RegExp(source, 'g');
	    return function(string) {
	      string = string == null ? '' : '' + string;
	      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
	    };
	  };
	  _.escape = createEscaper(escapeMap);
	  _.unescape = createEscaper(unescapeMap);

	  // If the value of the named `property` is a function then invoke it with the
	  // `object` as context; otherwise, return it.
	  _.result = function(object, property, fallback) {
	    var value = object == null ? void 0 : object[property];
	    if (value === void 0) {
	      value = fallback;
	    }
	    return _.isFunction(value) ? value.call(object) : value;
	  };

	  // Generate a unique integer id (unique within the entire client session).
	  // Useful for temporary DOM ids.
	  var idCounter = 0;
	  _.uniqueId = function(prefix) {
	    var id = ++idCounter + '';
	    return prefix ? prefix + id : id;
	  };

	  // By default, Underscore uses ERB-style template delimiters, change the
	  // following template settings to use alternative delimiters.
	  _.templateSettings = {
	    evaluate    : /<%([\s\S]+?)%>/g,
	    interpolate : /<%=([\s\S]+?)%>/g,
	    escape      : /<%-([\s\S]+?)%>/g
	  };

	  // When customizing `templateSettings`, if you don't want to define an
	  // interpolation, evaluation or escaping regex, we need one that is
	  // guaranteed not to match.
	  var noMatch = /(.)^/;

	  // Certain characters need to be escaped so that they can be put into a
	  // string literal.
	  var escapes = {
	    "'":      "'",
	    '\\':     '\\',
	    '\r':     'r',
	    '\n':     'n',
	    '\u2028': 'u2028',
	    '\u2029': 'u2029'
	  };

	  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

	  var escapeChar = function(match) {
	    return '\\' + escapes[match];
	  };

	  // JavaScript micro-templating, similar to John Resig's implementation.
	  // Underscore templating handles arbitrary delimiters, preserves whitespace,
	  // and correctly escapes quotes within interpolated code.
	  // NB: `oldSettings` only exists for backwards compatibility.
	  _.template = function(text, settings, oldSettings) {
	    if (!settings && oldSettings) settings = oldSettings;
	    settings = _.defaults({}, settings, _.templateSettings);

	    // Combine delimiters into one regular expression via alternation.
	    var matcher = RegExp([
	      (settings.escape || noMatch).source,
	      (settings.interpolate || noMatch).source,
	      (settings.evaluate || noMatch).source
	    ].join('|') + '|$', 'g');

	    // Compile the template source, escaping string literals appropriately.
	    var index = 0;
	    var source = "__p+='";
	    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
	      source += text.slice(index, offset).replace(escaper, escapeChar);
	      index = offset + match.length;

	      if (escape) {
	        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
	      } else if (interpolate) {
	        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
	      } else if (evaluate) {
	        source += "';\n" + evaluate + "\n__p+='";
	      }

	      // Adobe VMs need the match returned to produce the correct offest.
	      return match;
	    });
	    source += "';\n";

	    // If a variable is not specified, place data values in local scope.
	    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

	    source = "var __t,__p='',__j=Array.prototype.join," +
	      "print=function(){__p+=__j.call(arguments,'');};\n" +
	      source + 'return __p;\n';

	    try {
	      var render = new Function(settings.variable || 'obj', '_', source);
	    } catch (e) {
	      e.source = source;
	      throw e;
	    }

	    var template = function(data) {
	      return render.call(this, data, _);
	    };

	    // Provide the compiled source as a convenience for precompilation.
	    var argument = settings.variable || 'obj';
	    template.source = 'function(' + argument + '){\n' + source + '}';

	    return template;
	  };

	  // Add a "chain" function. Start chaining a wrapped Underscore object.
	  _.chain = function(obj) {
	    var instance = _(obj);
	    instance._chain = true;
	    return instance;
	  };

	  // OOP
	  // ---------------
	  // If Underscore is called as a function, it returns a wrapped object that
	  // can be used OO-style. This wrapper holds altered versions of all the
	  // underscore functions. Wrapped objects may be chained.

	  // Helper function to continue chaining intermediate results.
	  var result = function(instance, obj) {
	    return instance._chain ? _(obj).chain() : obj;
	  };

	  // Add your own custom functions to the Underscore object.
	  _.mixin = function(obj) {
	    _.each(_.functions(obj), function(name) {
	      var func = _[name] = obj[name];
	      _.prototype[name] = function() {
	        var args = [this._wrapped];
	        push.apply(args, arguments);
	        return result(this, func.apply(_, args));
	      };
	    });
	  };

	  // Add all of the Underscore functions to the wrapper object.
	  _.mixin(_);

	  // Add all mutator Array functions to the wrapper.
	  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
	    var method = ArrayProto[name];
	    _.prototype[name] = function() {
	      var obj = this._wrapped;
	      method.apply(obj, arguments);
	      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
	      return result(this, obj);
	    };
	  });

	  // Add all accessor Array functions to the wrapper.
	  _.each(['concat', 'join', 'slice'], function(name) {
	    var method = ArrayProto[name];
	    _.prototype[name] = function() {
	      return result(this, method.apply(this._wrapped, arguments));
	    };
	  });

	  // Extracts the result from a wrapped and chained object.
	  _.prototype.value = function() {
	    return this._wrapped;
	  };

	  // Provide unwrapping proxy for some methods used in engine operations
	  // such as arithmetic and JSON stringification.
	  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

	  _.prototype.toString = function() {
	    return '' + this._wrapped;
	  };

	  // AMD registration happens at the end for compatibility with AMD loaders
	  // that may not enforce next-turn semantics on modules. Even though general
	  // practice for AMD registration is to be anonymous, underscore registers
	  // as a named module because, like jQuery, it is a base library that is
	  // popular enough to be bundled in a third party lib, but not be part of
	  // an AMD load request. Those cases could generate an error when an
	  // anonymous define() is called outside of a loader request.
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function() {
	      return _;
	    }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  }
	}.call(this));


/***/ },
/* 7 */
/***/ function(module, exports) {

	var MSlice = (function () {
	    function MSlice(sa, sb, n) {
	        this.sa = sa;
	        this.sb = sb;
	        this.n = n;
	    }
	    return MSlice;
	})();
	function longest_matching_slice(a, a0, a1, b, b0, b1, cmp) {
	    var sa = a0, sb = b0, n = 0;
	    var runs = [];
	    for (var i = a0; i < a1; i++) {
	        var new_runs = [];
	        for (var j = b0; j < b1; j++) {
	            if (cmp(a[i], b[j])) {
	                var k = new_runs[j] = (runs[j - 1] ? runs[j - 1] : 0) + 1;
	                if (k > n) {
	                    sa = i - k + 1;
	                    sb = j - k + 1;
	                    n = k;
	                }
	            }
	        }
	        runs = new_runs;
	    }
	    return new MSlice(sa, sb, n);
	}
	function matching_slices(a, a0, a1, b, b0, b1, cmp) {
	    var lms = longest_matching_slice(a, a0, a1, b, b0, b1, cmp);
	    if (lms.n == 0)
	        return [];
	    var slices1 = matching_slices(a, a0, lms.sa, b, b0, lms.sb, cmp);
	    var slices2 = matching_slices(a, lms.sa + lms.n, a1, b, lms.sb + lms.n, b1, cmp);
	    return slices1.concat([lms]).concat(slices2);
	}
	function diff(a, b, cmp) {
	    if (!cmp)
	        cmp = function (x, y) { return x == y; };
	    var ia = 0, ib = 0;
	    var slices = matching_slices(a, 0, a.length, b, 0, b.length, cmp);
	    slices.push(new MSlice(a.length, b.length, 0));
	    var result = [];
	    var after = null;
	    slices.forEach(function (slice) {
	        for (var i = ia; i < slice.sa; i++)
	            result.push({ type: '+', element: a[i] });
	        for (var i = ib; i < slice.sb; i++)
	            result.push({ type: '-', element: b[i] });
	        for (var i = 0; i < slice.n; i++)
	            if (a[slice.sa + i] != b[slice.sb + i])
	                result.push({ type: '=', bi: slice.sb + i, ai: slice.sa + i });
	        after = a[slice.sa + slice.n - 1];
	        ia = slice.sa + slice.n;
	        ib = slice.sb + slice.n;
	    });
	    return result;
	}
	exports.diff = diff;
	//# sourceMappingURL=diff.js.map

/***/ },
/* 8 */
/***/ function(module, exports) {

	var Node = (function () {
	    function Node(parent, data, view, container) {
	        this.parent = parent;
	        this.data = data;
	        this.view = view;
	        this.container = container;
	        this.children = [];
	    }
	    Node.prototype.indexOf = function (predicate) {
	        for (var i = 0; i < this.children.length; i++)
	            if (predicate(this.children[i]) == true)
	                return i;
	        return -1;
	    };
	    Node.prototype.addChild = function (child, index) {
	        if (index == null)
	            index = this.children.length;
	        else if (index < 0 || index > this.children.length)
	            throw new Error("IncorrectArgument");
	        this.children.splice(index, 0, child);
	    };
	    Node.prototype.removeChild = function (element) {
	        if (typeof (element) == "number") {
	            var index = element;
	            if (index < 0 || index > this.children.length)
	                throw new Error("IncorrectArgument");
	            this.children.splice(index, 1);
	        }
	        else {
	            var index = this.indexOf(function (x) { return x == element; });
	            this.removeChild(index);
	        }
	    };
	    return Node;
	})();
	exports.Node = Node;
	var TreeModel = (function () {
	    function TreeModel(rootComponent) {
	        this.root = new Node();
	        this.root.container = rootComponent;
	        this.clear();
	    }
	    TreeModel.prototype.find = function (parent) {
	        if (parent == null)
	            return this.root;
	        return this.flat.get(parent);
	    };
	    TreeModel.prototype.clear = function () {
	        this.root.children = [];
	        this.flat = new Map();
	    };
	    TreeModel.prototype.insert = function (element, parent, neighbour, after) {
	        if (after === void 0) { after = false; }
	        var node = new Node(parent, element);
	        if (after)
	            this.insertAfter(node, parent, neighbour);
	        else
	            this.insertBefore(node, parent, neighbour);
	        this.flat.set(element, node);
	    };
	    TreeModel.prototype.insertBefore = function (node, parent, before) {
	        var index = before ? parent.indexOf(function (x) { return x == before; }) : null;
	        parent.addChild(node, index);
	    };
	    TreeModel.prototype.insertAfter = function (node, parent, after) {
	        var index = after ? parent.indexOf(function (x) { return x == after; }) : -1;
	        parent.addChild(node, index + 1);
	    };
	    TreeModel.prototype.remove = function (node) {
	        node.parent.removeChild(node);
	    };
	    TreeModel.prototype.get = function (element, parent) {
	        if (parent)
	            return parent.children[parent.indexOf(function (e) { return e.data == element; })];
	        else
	            return this.find(element);
	    };
	    TreeModel.prototype.registerViews = function (element, view, container) {
	        var node = this.find(element);
	        if (!node)
	            throw "RegisterViewException";
	        node.container = container;
	        node.view = view;
	    };
	    TreeModel.prototype.patch = function (before, after) {
	        var node = this.find(before);
	        if (node)
	            node.data = after;
	        this.flat.set(after, node);
	        this.flat.delete(before);
	    };
	    return TreeModel;
	})();
	exports.TreeModel = TreeModel;
	//# sourceMappingURL=treeModel.js.map

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {var remote = __webpack_require__(10);
	var dialog = remote.require("dialog");
	function openFileDialogModal(title, defaultPath, filters) {
	    var options = constructOptions(title, defaultPath, filters, ['openFile']);
	    return dialog.showOpenDialog(options);
	}
	exports.openFileDialogModal = openFileDialogModal;
	function openFileDialog(title, callBack, defaultPath, filters) {
	    var options = constructOptions(title, defaultPath, filters, ['openFile']);
	    dialog.showOpenDialog(options, function (resultPath) {
	        if (resultPath)
	            callBack(resultPath[0]);
	    });
	}
	exports.openFileDialog = openFileDialog;
	function openFolderDialogModal(title, createDirectory, defaultPath, filters) {
	    var properties = ['openDirectory'];
	    if (createDirectory)
	        properties.push('createDirectory');
	    var options = constructOptions(title, defaultPath, filters, properties);
	    return dialog.showOpenDialog(options);
	}
	exports.openFolderDialogModal = openFolderDialogModal;
	function openFolderDialog(title, callBack, createDirectory, defaultPath, filters) {
	    var properties = ['openDirectory'];
	    if (createDirectory)
	        properties.push('createDirectory');
	    var options = constructOptions(title, defaultPath, filters, properties);
	    dialog.showOpenDialog(options, function (resultPath) {
	        if (resultPath)
	            callBack(resultPath[0]);
	    });
	}
	exports.openFolderDialog = openFolderDialog;
	function saveFileDialogModal(title, defaultPath, filters) {
	    var options = constructOptions(title, defaultPath, filters, ['saveFile']);
	    return dialog.showSaveDialog(options);
	}
	exports.saveFileDialogModal = saveFileDialogModal;
	function constructOptions(title, defaultPath, filters, properties) {
	    var options = {
	        title: title,
	        properties: properties,
	    };
	    if (defaultPath) {
	        options.defaultPath = defaultPath;
	    }
	    if (filters) {
	        options.filters = filters;
	    }
	    return options;
	}
	function getHome() {
	    var home = process.env["HOME"];
	    if (home) {
	        return home;
	    }
	    var userProfile = process.env["USERPROFILE"];
	    if (userProfile) {
	        return userProfile;
	    }
	    var publicFolder = process.env["PUBLIC"];
	    if (publicFolder) {
	        return publicFolder;
	    }
	    var atomHome = process.env["ATOM_HOME"];
	    if (atomHome) {
	        return atomHome;
	    }
	    return "";
	}
	exports.getHome = getHome;
	//# sourceMappingURL=fileDialogUtils.js.map
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3)))

/***/ },
/* 10 */
/***/ function(module, exports) {

	module.exports = remote;

/***/ }
/******/ ]);