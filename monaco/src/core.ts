//  https://basarat.gitbooks.io/typescript/content/docs/project/globals.html

import './styles/main.scss';
import * as favicon from './images/favicon.png';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

// import * as seedrandom from 'seedrandom';

// import EditorJS from '@editorjs/editorjs';
import Header from './components/Header';
import Paragraph from './components/Paragraph';
import SimpleImage from './components/SimpleImage';
import List from './components/List';
import Code from './components/Code';
import InlineCode from './components/InlineCode';

import { el, obj, richText } from './modules/Handy';

import tooltip from './modules/Tooltip';
import subMenu from './modules/SubMenu';

// const { el, obj, richText } = require('./modules/Handy');
const EditorJS = require('@editorjs/editorjs');

//===== SECTION: INITIALISE APP =====//

const App = {
    root: el('#root'),
    UI: {
        codexContainer: el('div', { id: 'codex-editor' }),
        codexEditor: null,
        preview: el('section', { id: 'preview-panel', className: 'hidden' }),

        pnlActions: el('section', { id: 'actions-panel' }),

        btnProjectSettings: null,
        btnOpenProject: null,
        btnSaveProject: null,
        btnCopyJson: null,
        btnContinue: null,

        btnNewStep: null,
        btnDelStep: null,
        btnNextStep: null,
        btnPrevStep: null,
        btnStepType: null,
        btnStepOrder: null,

        btnTemplates: null,

        btnGetPrev: null,
        btnGetNext: null,
        btnCodeMode: null,
        btnModelAnswers: null,
        btnToggleOutput: null,

        codeTabs: el('div', { id: 'code-tabs' }),
        codeContainer: el('div', { id: 'code-editor' }),
        codeEditor: null
    },
    populate: (parent: HTMLElement, elements: object) => {
        obj(elements).forEachEntry((branch: string, stem: Window | [HTMLElement | Window, object] | HTMLElement) => {
            if (stem === self) {
                parent.append(App.UI[branch]);
                console.log(...richText('1. added ', [App.UI[branch].id || App.UI[branch].className || App.UI[branch].tagName, { color: 'skyblue' }], ' to ', [parent.id || parent.className || parent.tagName, { color: 'skyblue' }]));
            }
            else if (Array.isArray(stem)) {
                const [subBranch, leaf] = stem;

                if (subBranch === self) {
                    parent.append(App.UI[branch]);
                    console.log(...richText('2. added ', [App.UI[branch].id || App.UI[branch].className || App.UI[branch].tagName, { color: 'skyblue' }], ' to ', [parent.id || parent.className || parent.tagName, { color: 'skyblue' }]));

                    App.populate(App.UI[branch], leaf);
                }
                else {
                    if (App.UI.hasOwnProperty(branch)) {
                        App.UI[branch] = subBranch;
                    }

                    parent.append(subBranch as HTMLElement);
                    console.log(...richText('3. added ', [(subBranch as HTMLElement).id || (subBranch as HTMLElement).className || (subBranch as HTMLElement).tagName, { color: 'skyblue' }], ' to ', [parent.id || parent.className || parent.tagName, { color: 'skyblue' }]));
                    
                    App.populate(subBranch as HTMLElement, leaf);
                }
            }
            else {
                console.log(...richText('4. added ', [(stem as HTMLElement).id || (stem as HTMLElement).className || (stem as HTMLElement).tagName, { color: 'skyblue' }], ' to ', [parent.id || parent.className || parent.tagName, { color: 'skyblue' }]));
                parent.append(stem as HTMLElement);
            }
        });
    }
};

//===== SECTION: INITIALISE VARIABLES =====//

let missionJson: MissionJSON;
let stepList = [];
let testList = [];
let activeStep = 1;

let refreshTimer: number;
const refreshDelay = 800;

// const rng = seedrandom('vital');

const fileNamePattern = /\/?(.*)\.(.*)$/;

//  the 'positive lookbehind' syntax has limited compatibility
const editablePattern = {
    excludingMarkup: /(?<=#BEGIN_EDITABLE#)[\s\S]*?(?=#END_EDITABLE#)/g,
    includingMarkup: /#BEGIN_EDITABLE#([\s\S]*?)#END_EDITABLE#/g
};

const codeTemplate = {
    html: '<!DOCTYPE html>\n<html>\n\t<head>\n\t\t<link rel="stylesheet" href="style.css"/>\n\t</head>\n\t<body>\n\n\t\t#BEGIN_EDITABLE#<h1>Welcome to HTML</h1>#END_EDITABLE#\n\n\t\t<script src="script.js"></script>\n\t</body>\n</html>',
    css: '/* CSS */\n\n* {\n\t#BEGIN_EDITABLE#margin: 0;#END_EDITABLE#\n\tbox-sizing: border-box;\n}\n',
    js: '// JavaScript\n\n#BEGIN_EDITABLE#window.onload = init;#END_EDITABLE#\n\nfunction init() {}\n',
};

const modelStateSchema = {
    html: {
        'index': {
            model: monaco.editor.createModel(codeTemplate.html, 'html'),
            state: null
        }
    },
    css: {
        'style': {
            model: monaco.editor.createModel(codeTemplate.css, 'css'),
            state: null
        }
    },
    js: {
        'script': {
            model: monaco.editor.createModel(codeTemplate.js, 'javascript'),
            state: null
        }
    },
};

//===== SECTION: LOAD APP =====//

window.onload = init;

function init(): void {

    //===== SECTION: ASSIGN FAVICON =====//

    const head = el('head');
    const link = el('link', {
        type: 'image/x-icon',
        rel: 'shortcut icon',
        href: favicon,
    });

    head.append(link);

    //===== SECTION: BUILD DOM =====//

    App.populate(el('#root') as HTMLElement, {
        pnlLeft: [el('section', { id: 'left-panel' }), {
            pnlTopLeft: [el('section', { id: 'top-left-panel' }), {
                codexContainer: self,
                pnlActions: [self, {
                    projUnit: [el('div', { className: 'action-unit' }), {
                        projHeader: el('h4', { innerText: 'PROJ' }),
                        projActions: [el('div', { className: 'action-buttons' }), {
                            btnProjectSettings: [el('div', {}), { icon: el('i', { className: 'material-icons', innerText: 'settings_applications' }) }],
                            btnOpenProject: [el('div', {}), { icon: el('i', { className: 'material-icons', innerText: 'folder_open' }) }],
                            btnSaveProject: [el('div', {}), { icon: el('i', { className: 'material-icons', innerText: 'save' }) }],
                            btnCopyJson: [el('div', {}), { icon: el('i', { className: 'material-icons', innerText: 'receipt' }) }],
                            btnContinue: [el('div', {}), { icon: el('i', { className: 'material-icons', innerText: 'unarchive' }) }]
                        }]
                    }],
                    stepUnit: [el('div', { className: 'action-unit' }), {
                        stepHeader: el('h4', { innerText: 'STEP' }),
                        stepActions: [el('div', { className: 'action-buttons' }), {
                            btnNewStep: [el('div', {}), { icon: el('i', { className: 'material-icons', innerText: 'add' }) }],
                            btnDelStep: [el('div', {}), { icon: el('i', { className: 'material-icons', innerText: 'clear' }) }],
                            btnNextStep: [el('div', {}), { icon: el('i', { className: 'material-icons', innerText: 'skip_next' }) }],
                            btnPrevStep: [el('div', {}), { icon: el('i', { className: 'material-icons', innerText: 'skip_previous' }) }],
                            btnStepType: [el('div', {}), { icon: el('i', { className: 'material-icons', innerText: 'code' }) }],
                            btnStepOrder: [el('div', {}), { icon: el('i', { className: 'material-icons', innerText: 'reorder' }) }]
                        }]
                    }],
                    instUnit: [el('div', { className: 'action-unit' }), {
                        instHeader: el('h4', { innerText: 'INST' }),
                        instActions: [el('div', { className: 'action-buttons' }), {
                            btnTemplates: [el('div', {}), { icon: el('i', { className: 'material-icons', innerText: 'add' }) }]
                        }]
                    }],
                    codeUnit: [el('div', { className: 'action-unit' }), {
                        codeHeader: el('h4', { innerText: 'CODE' }),
                        codeActions: [el('div', { className: 'action-buttons' }), {
                            btnGetPrev: [el('div', {}), { icon: el('i', { className: 'material-icons', innerText: 'chevron_right' }) }],
                            btnGetNext: [el('div', {}), { icon: el('i', { className: 'material-icons', innerText: 'chevron_left' }) }],
                            btnCodeMode: [el('div', {}), { icon: el('i', { className: 'material-icons', innerText: 'create' }) }],
                            btnModelAnswers: [el('div', {}), { icon: el('i', { className: 'material-icons', innerText: 'spellcheck' }) }],
                            btnToggleOutput: [el('div', {}), { icon: el('i', { className: 'material-icons', innerText: 'visibility' }) }]
                        }]
                    }]
                }]
            }],
            preview: self,
        }],
        pnlCode: [el('section', { id: 'code-panel' }), {
            codeTabs: self,
            codeContainer: self,
        }]
    });

    tooltip([{
        tool: App.UI.btnProjectSettings,
        heading: 'settings',
        tip: 'view and edit project level settings'
    }, {
        tool: App.UI.btnOpenProject,
        heading: 'open',
        tip: 'open project from a JSON file containing a valid mission data structure'
    }, {
        tool: App.UI.btnSaveProject,
        heading: 'save',
        tip: 'save the current project to disk as a JSON file'
    }, {
        tool: App.UI.btnCopyJson,
        heading: 'copy json',
        tip: 'can be used with the "Import JSON" feature on the BSD Online'
    }, {
        tool: App.UI.btnContinue,
        heading: 'continue',
        tip: 'load a project from local storage, doing so will overwite the current project'
    }, {
        tool: App.UI.btnNewStep,
        heading: 'new',
        tip: 'create a new step after the current step and display it'
    }, {
        tool: App.UI.btnDelStep,
        heading: 'delete',
        tip: 'delete the current step and display the next step'
    }, {
        tool: App.UI.btnNextStep,
        heading: 'next',
        tip: 'move to the next step'
    }, {
        tool: App.UI.btnPrevStep,
        heading: 'previous',
        tip: 'move to the previous step'
    }, {
        tool: App.UI.btnStepType,
        heading: 'type',
        tip: 'click to change the type of the current step'
    }, {
        tool: App.UI.btnStepOrder,
        heading: 'order',
        tip: 'click to view and rearrange the order of steps'
    }], {
            dim: [App.UI.codexContainer]
        });

    subMenu(App.UI.pnlActions, [{
        host: App.UI.btnStepType,
        items: {
            'assignment': {
                tipHeading: 'text',
                tip: 'text steps are ready-only and no interaction is required from the learner',
                handler: () => { }
            },
            'code': {
                tipHeading: 'code',
                tip: 'code steps can contain editables where the learner can write code',
                handler: () => { }
            },
            'extension': {
                tipHeading: 'interactive',
                tip: 'the code panel is hidden in interactive steps and the learner is expected to interact with the output',
                handler: () => { }
            }
        }
    }, {
        host: App.UI.btnCodeMode,
        items: {
            'create': {
                tipHeading: 'use new content',
                tip: 'define the content of the current code tab from scratch',
                handler: () => { }
            },
            'build': {
                tipHeading: 'modify content',
                tip: 'the content of this code tab will be determined by step transition code',
                handler: () => { }
            },
            'lock': {
                tipHeading: 'leave unchanged',
                tip: 'the content of this code tab will be the same as the previous step',
                handler: () => { }
            }
        }
    }], {
            placement: 'right',
            distance: 15,
        });

    //===== SECTION: INITIALISE EDITORS =====//

    const { codexContainer, codeContainer } = App.UI;

    App.UI.codexEditor = new EditorJS({
        holder: codexContainer,
    });

    App.UI.codeEditor = monaco.editor.create(codeContainer as HTMLElement, { theme: 'vs-dark' });
}



