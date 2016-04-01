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