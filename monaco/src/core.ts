//  https://basarat.gitbooks.io/typescript/content/docs/project/globals.html

import './styles/main.scss';
import content, * as favicon from './images/favicon.png';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import * as moment from 'moment';

// import EditorJS from './components/editor';
import Header from './components/Header';
import Paragraph from './components/Paragraph';
import SimpleImage from './components/SimpleImage';
import List from './components/List';
import Code from './components/Code';
import InlineCode from './components/InlineCode';

import { el, newEl, obj, richText } from './modules/Handy';

import { newTestJson, newStepJson, newMissionJson } from './modules/JsonTemplates';
import tooltip from './modules/Tooltip';
import subMenu from './modules/SubMenu';
import HTMLTree from './modules/HTMLTree';
import { parse } from 'url';

// const { el, obj, richText } = require('./modules/Handy');
const EditorJS = require('./components/editor');

//===== APP MODULES =====//

const App = {
    root: el('#root'),
    UI: {
        codexContainer: el('div', { id: 'codex-editor' }),

        pnlPreview: el('section', { id: 'preview-panel', className: 'hidden' }),
        pnlActions: el('section', { id: 'actions-panel' }),
        pnlCode: el('section', { id: 'code-panel' }),

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
    },
    populate: (parent: HTMLElement, elements: object) => {
        console.groupCollapsed('Populating', parent);

        obj(elements).forEachEntry((branch: string, stem: Window | [HTMLElement | Window, object] | HTMLElement) => {

            if (stem === self) {
                parent.append(App.UI[branch]);
                console.log('Added', App.UI[branch]);
            }
            else if (Array.isArray(stem)) {
                const [subBranch, leaf] = stem;

                if (subBranch === self) {
                    parent.append(App.UI[branch]);
                    console.log('Added', App.UI[branch]);

                    App.populate(App.UI[branch], leaf);
                }
                else {
                    if (App.UI.hasOwnProperty(branch)) {
                        App.UI[branch] = subBranch;
                    }

                    parent.append(subBranch as HTMLElement);
                    console.log('Added', subBranch);

                    App.populate(subBranch as HTMLElement, leaf);
                }
            }
            else {
                parent.append(stem as HTMLElement);
                console.log('Added', stem);
            }
        });

        console.groupEnd();
    }
};

let codexEditor = null;
let codeEditor = null;
let diffEditor = null;

//===== MEMORY MODULES =====//

let missionJson: MissionJson;
let projectFiles = ['index.html', 'style.css', 'script.js'];
let stepList = [];
let activeStep = 0;

const stepCodeCache = {};

let refreshTimer;
const refreshDelay = 800;

const editablePattern = {
    //  the 'positive lookbehind' syntax has limited compatibility
    excludingMarkup: /(?<=#BEGIN_EDITABLE#)[\s\S]*?(?=#END_EDITABLE#)/g,
    includingMarkup: /#BEGIN_EDITABLE#([\s\S]*?)#END_EDITABLE#/g
};

const codeTemplate = {
    html: '<!DOCTYPE html>\n<html>\n\t<head>\n\t\t<link rel="stylesheet" href="style.css"/>\n\t</head>\n\t<body>\n\n\t\t<h1>Welcome to HTML</h1>\n\n\t\t#BEGIN_EDITABLE#    #END_EDITABLE#\n\n\t\t<script src="script.js"></script>\n\t</body>\n</html>',
    css: '/* CSS */\n\n* {\n\tmargin: 0;\n\tbox-sizing: border-box;\n\t#BEGIN_EDITABLE#    #END_EDITABLE#\n}\n',
    js: '// JavaScript\n\nwindow.onload = init;\n\nfunction init() {}\n',
    transition: '// Transition:\nreturn `${codeWithoutMarkup}#BEGIN_EDITABLE##END_EDITABLE#`;\n// let output = codeWithoutMarkup; //.replace(/\s*<!--.*-->/g,\'\');\n// output = insertLine(output, \'key\', { line: \'\', offset: 0 });\n// output = makeEditableBlock(output, \'key\');\n// return output;'
};

const modeTypes = {
    newContents: 'new_contents',
    modify: 'modify',
}

const iconNames = {
    newContents: 'create',
    modify: 'build',
    leaveUnchanged: 'lock'
}

const langType = {
    html: 'html',
    css: 'css',
    js: 'javascript'
}

/**
 * - every step in `missionJson` conforms with this schema
 * - only holds data for the active step
 * - `stepJson` must be updated during step transitions
 * - it includes:
 * 1. all file types in the current mission
 * 2. file names of each type
 * 3. the monaco editor model & state of each file
 */
const modelStateSchema = {
    html: {
        'index': {
            model: monaco.editor.createModel(codeTemplate.html, langType.html),
            state: null
        }
    },
    css: {
        'style': {
            model: monaco.editor.createModel(codeTemplate.css, langType.css),
            state: null
        }
    },
    js: {
        'script': {
            model: monaco.editor.createModel(codeTemplate.js, langType.js),
            state: null
        }
    },
};

//===== INIT APP =====//

window.onload = init;

function init() {
    addFavIcon();
    assembleAppUI();
    createMissionJson();
    createNewStep();
    // createNewStep({
    //     title: 'Instruction',
    //     orderNo: 1000,
    // });
}


//===== LOAD FAVICON =====//

function addFavIcon() {
    const head = el('head');
    const link = el('link', {
        type: 'image/x-icon',
        rel: 'shortcut icon',
        href: favicon,
    });

    head.append(link);
}


//===== DOM =====//

function assembleAppUI() {

    //===== APP UI STRUCTURE =====//

    console.groupCollapsed('Building App UI');

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
                            btnNewStep: [el('div', {}), { icon: el('i', { className: 'material-icons', innerText: 'fiber_new' }) }],
                            btnDelStep: [el('div', {}), { icon: el('i', { className: 'material-icons', innerText: 'delete_forever' }) }],
                            btnNextStep: [el('div', {}), { icon: el('i', { className: 'material-icons', innerText: 'skip_next' }) }],
                            btnPrevStep: [el('div', {}), { icon: el('i', { className: 'material-icons', innerText: 'skip_previous' }) }],
                            btnStepType: [el('div', {}), { icon: el('i', { className: 'material-icons', innerText: 'code' }) }],
                            btnStepOrder: [el('div', {}), { icon: el('i', { className: 'material-icons', innerText: 'layers' }) }]
                        }]
                    }],
                    instUnit: [el('div', { className: 'action-unit' }), {
                        instHeader: el('h4', { innerText: 'INST' }),
                        instActions: [el('div', { className: 'action-buttons' }), {
                            btnTemplates: [el('div', {}), { icon: el('i', { className: 'material-icons', innerText: 'flash_on' }) }]
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
            pnlPreview: self,
        }],
        pnlCode: [self, {
            codeTabs: self,
            codeContainer: self,
        }]
    });

    console.groupEnd();

    //===== TOOLTIP =====//

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
    }, {
        tool: App.UI.btnTemplates,
        heading: 'templates',
        tip: 'click to choose a template'
    }, {
        tool: App.UI.btnGetPrev,
        heading: 'get previous',
        tip: 'overwrite the current tab with code from the previous step'
    }, {
        tool: App.UI.btnGetNext,
        heading: 'get next',
        tip: 'overwrite the current tab with code from the next step'
    }, {
        tool: App.UI.btnCodeMode,
        heading: 'mode',
        tip: 'click to choose the method by which the code for the current tab is defined'
    }, {
        tool: App.UI.btnModelAnswers,
        heading: 'edit answers',
        tip: 'show and hide the model answer panel'
    }, {
        tool: App.UI.btnToggleOutput,
        heading: 'output',
        tip: 'show and hide the code output preview panel'
    }], {
            dim: [App.UI.codexContainer]
        });

    //=====  SUBMENU GROUPS =====//

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
        host: App.UI.btnTemplates,
        items: {
            'filter_1': {
                tipHeading: 'introduction',
                tip: 'insert introduction step template',
                handler: () => { }
            },
            'filter_2': {
                tipHeading: 'generic step',
                tip: 'insert generic step template',
                handler: () => { }
            },
            'filter_3': {
                tipHeading: 'summary',
                tip: 'insert summary step template',
                handler: () => { }
            }
        }
    }, {
        host: App.UI.btnCodeMode,
        items: {
            'create': {
                tipHeading: 'use new content',
                tip: 'define the content of the current code tab from scratch',
                handler: () => {
                    
                }
            },
            'build': {
                tipHeading: 'modify content',
                tip: 'the content of the current tab will be defined by step transition code',
                handler: () => {
                    
                }
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
            dim: [App.UI.pnlCode]
        });

    //===== INITIALISE EDITORS =====//

    const { codexContainer, codeContainer } = App.UI;

    codexEditor = new EditorJS({
        holder: codexContainer,
        tools: {
            header: Header,
            paragraph: Paragraph,
            simpleImage: SimpleImage,
            list: List,
            code: Code,
            inlineCode: InlineCode,
        },
    });

    codeEditor = monaco.editor.create(codeContainer as HTMLElement, { theme: 'vs-dark' });

    registerTopLevelEvents();
}

function registerTopLevelEvents() {
    
}

/**
 * - creates a new `missionJson` object
 * - if `fromString` is passed, steps where `title === 'Deleted by merging process'` will be removed
 * @param {string} fromString must be valid mission JSON string, if provided, it will be parsed and assigned to `missionJson`
 * @param override if provided, it will be merged into `missionJson`
 */
function createMissionJson(fromString?: string, override?: MissionJson) {
    missionJson = fromString ? JSON.parse(fromString) : newMissionJson(override);
    
    stepList = obj(missionJson.steps)
        .filter('values', step => step.title !== 'Deleted by merging process')
        .sort((a: any, b: any) => a.orderNo - b.orderNo);
}

//===== STEP OPERATIONS =====//

/**
 * - create JSON object for each item in the `projectFile` array
 */
function createNewStep() {
    

    projectFiles.forEach(fullName => {
        const { name, type }  = parseFileName(fullName);
        //  create new tab
        const tab = el(App.UI.codeTabs).addNew('span', { className: 'tab', innerText: `${name}.${type}` });
        
        updateStepJson().file(fullName, codeTemplate[type]);
    });
}

function updateStepJson(stepNo: number = activeStep) {
    return {
        file: (fullName: string, contents: string) => {
            stepList[stepNo - 1].files[fullName].contents = contents;
        }
    };
}

/**
 * - creates a tab and attaches it to the tabs area
 * @param name - name of the file whose content will be stored in the new tab
 * @param type - type of the file whose content will be stored in the new tab
 */
function createNewTab(name: string, type: string) {
    
}

//===== GLOBAL =====//

function parseFileName(fileName: string) {
    const [match, name, type] = fileName.match(/\/?(.*)\.(.*)$/);
    return { match, name, type };
}

/**
 * - creates a new step 
 * - resets `modelStateSchema` to default code templates
 * - modifies `stepList` and `testList`
 * - does not transition to newly created step
 * @param override
 * @returns `void`
 */
// function createNewStep(override: StepJsonOverride = {}) {
//     const filesJson = {};
//     const testsJson = {};

//     //  reset schema to code templates for new steps
//     forEachSchemaFile((type, name) => {
//         const contents = codeTemplate[type];
//         const fullName = `${name}.${type}`;
//         //  usually when createNewStep is called, there will be no editable in the code base
//         //  this is here for quick testing purposes
//         //  but leaving in as an ensurance mechanism
//         const { answers, tests } = answerAndTestFrom(contents, name, type);

//         filesJson[fullName] = {
//             answers,
//             contents,
//             mode: modeTypes.newContents,
//         };

//         testsJson[fullName] = tests;

//         modelStateSchema[type][name] = {
//             model: monaco.editor.createModel(contents, langType[type]),
//             state: null,
//         };
//     });

//     //  use schema as base file structure of the new step
//     //  mutate it with override.files if exists
//     override.files = obj(filesJson).mutate(override.files || {});

//     const stepJson = newStepJson(override);
//     const existingStepIds = stepList.map(step => step.stepId);

//     while (existingStepIds.includes(stepJson.stepId)) {
//         stepJson.stepId = (Math.floor(Math.random() * (Number.MAX_SAFE_INTEGER - 1)) + 1).toString();
//     }

//     stepList.splice(activeStep, 0, stepJson);
//     testList.splice(activeStep, 0, testsJson);
// }


