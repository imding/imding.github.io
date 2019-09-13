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

import { newTestJson, newStepJson, newMissionJson, newFileJson } from './modules/JsonTemplates';
import tooltip from './modules/Tooltip';
import subMenu from './modules/SubMenu';
import HTMLTree from './modules/HTMLTree';
import { parse } from 'url';

// const { el, obj, richText } = require('./modules/Handy');
const EditorJS = require('./components/editor');

const consoleFold = false;

//===== APP MODULES =====//

const App = {
    colors: {
        code: { color: 'dodgerblue' },
        string: { color: 'darkorange' }
    },
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
        btnObjectives: null,

        btnGetPrev: null,
        btnGetNext: null,
        btnCodeMode: null,
        btnModelAnswers: null,
        btnToggleOutput: null,

        stepInfo: el('span', { id: 'step-info' }),
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
let missionFiles = ['index.html', 'style.css', 'script.js'];
let stepList = [];
let stepJson: StepJson;
let activeStep: number;
let activeTab: Tab;

/**
 * - cache memory to store code content before switching file modes
 * - NOTES
 *  - erased during step transition
 */
const stepCache = {
    text: '',
    new_contents: {},
    modify: {},
    interactive: {},
};

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

const stepType: StepType = {
    code: 'code',
    interactive: 'interactive',
    text: 'text'
};

const fileMode: FileMode = {
    newContents: 'new_contents',
    modify: 'modify',
    noChange: 'no_change'
};

const iconNames = {
    'text': 'assignment',
    'code': 'code',
    'interactive': 'extension',
    'new_contents': 'create',
    'modify': 'build',
    'no_change': 'lock'
};

const langType = {
    html: 'html',
    css: 'css',
    js: 'javascript'
};

const refreshDelay = 800;
let refreshTimer;

//===== INIT APP =====//

window.onload = init;

function init() {
    debugGroup('Initialising app...');

    addFavIcon();
    assembleAppUI();
    createMissionStructure();
    createTabs();
    newStepListItem();
    loadStep(++activeStep);

    console.groupEnd();
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

    debugGroup('assembleAppUI()');

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
                            btnStepType: [el('div', {}), { icon: el('i', { className: 'material-icons' }) }],
                            btnStepOrder: [el('div', {}), { icon: el('i', { className: 'material-icons', innerText: 'layers' }) }]
                        }]
                    }],
                    instUnit: [el('div', { className: 'action-unit' }), {
                        instHeader: el('h4', { innerText: 'INST' }),
                        instActions: [el('div', { className: 'action-buttons' }), {
                            btnTemplates: [el('div', {}), { icon: el('i', { className: 'material-icons', innerText: 'flash_on' }) }],
                            btnObjectives: [el('div', {}), { icon: el('i', { className: 'material-icons', innerText: 'done_all' }) }]
                        }]
                    }],
                    codeUnit: [el('div', { className: 'action-unit' }), {
                        codeHeader: el('h4', { innerText: 'CODE' }),
                        codeActions: [el('div', { className: 'action-buttons' }), {
                            btnGetPrev: [el('div', {}), { icon: el('i', { className: 'material-icons', innerText: 'chevron_right' }) }],
                            btnGetNext: [el('div', {}), { icon: el('i', { className: 'material-icons', innerText: 'chevron_left' }) }],
                            btnCodeMode: [el('div', {}), { icon: el('i', { className: 'material-icons' }) }],
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
        tip: 'show the next step'
    }, {
        tool: App.UI.btnPrevStep,
        heading: 'previous',
        tip: 'show the previous step'
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
        tool: App.UI.btnObjectives,
        heading: 'generate objectives',
        tip: 'click to generate objective tests using model answers'
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
                handler: enableTextStep
            },
            'code': {
                tipHeading: 'code',
                tip: 'code steps can contain editables where the learner can write code',
                handler: enableCodeStep
            },
            'extension': {
                tipHeading: 'interactive',
                tip: 'the code panel is hidden in interactive steps and the learner is expected to interact with the output',
                handler: enableInteractiveStep
            }
        }
    }, {
        host: App.UI.btnTemplates,
        items: {
            'looks_one': {
                tipHeading: 'introduction',
                tip: 'insert introduction step template',
                handler: () => { }
            },
            'looks_two': {
                tipHeading: 'generic step',
                tip: 'insert generic step template',
                handler: () => { }
            },
            'looks_3': {
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
                handler: () => switchFileMode(fileMode.newContents)
            },
            'build': {
                tipHeading: 'modify content',
                tip: 'the content of the current tab will be defined by step transition code',
                handler: () => switchFileMode(fileMode.modify)
            },
            'lock': {
                tipHeading: 'leave unchanged',
                tip: 'the content of this code tab will be the same as the previous step',
                handler: () => switchFileMode(fileMode.noChange)
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

    codeEditor = monaco.editor.create(codeContainer, { theme: 'vs-dark' });

    registerTopLevelEvents();
}

function registerTopLevelEvents() {
    const {
        pnlActions,
        btnOpenProject, btnNewStep, btnDelStep, btnNextStep, btnPrevStep,
        btnModelAnswers
    } = App.UI;

    pnlActions.onscroll = () => {
        const actionPanelScrolled = new Event('actionPanelScrolled');
        window.dispatchEvent(actionPanelScrolled);
    };

    btnOpenProject.onclick = openProject;
    btnNewStep.onclick = createNewStep;
    btnDelStep.onclick = () => deleteStep();
    btnNextStep.onclick = () => goToStep(activeStep + 1);
    btnPrevStep.onclick = () => goToStep(activeStep - 1);
    btnModelAnswers.onclick = toggleEditAnswers;

    window.onresize = () => (codeEditor || diffEditor).layout();
}

//===== PROJECT OPERATIONS =====//

/**
 * - creates a new `missionJson` object
 * - if `fromString` is passed, steps where `title === 'Deleted by merging process'` will be removed
 * @param {string} fromString must be valid mission JSON string, if provided, it will be parsed and assigned to `missionJson`
 * @param override if provided, it will be merged into `missionJson`
 */
function createMissionStructure(fromString?: string, override?: MissionJson) {
    debugGroup('createMissionStructure(fromString, override)');
    debugGroup(...richText(['fromString', App.colors.code])).end(fromString);
    debugGroup(...richText(['override', App.colors.code])).end(override);

    const { code, string } = App.colors;

    //  FIXME: add custom properties to JSON.parse(fromString)
    missionJson = fromString ? JSON.parse(fromString) : newMissionJson(override);
    console.log(...richText('Updated ', ['missionJson', code]), { missionJson });

    stepList = obj(missionJson.steps)
        .filter('values', step => step.title !== 'Deleted by merging process')
        .sort((a: any, b: any) => a.orderNo - b.orderNo)
        .map((step, idx) => {
            debugGroup(...richText('Step ', [`${idx + 1}`, code], ' is ', [`"${step.type}"`, string]));

            if (step.type === stepType.code || step.type === stepType.interactive) {
                if (!step.model) {
                    step.model = {};
                    console.log(...richText('Initialised ', [`stepList[${idx}].model`, code]));
                }
    
                //  TODO: sort files based on extension: html > css > js
                obj(step.files).forEachEntry((fullName, stepData) => {
                    console.log(...richText([`stepList[${idx}].model["${fullName}"]`, code], ` is ${step.model[fullName] ? '' : 'not '}found, file is in `, [`"${stepData.mode || fileMode.noChange}"`, string], ' mode'));

                    if (step.model[fullName]) return;

                    if (stepData.mode && stepData.mode !== fileMode.noChange) {
                        step.model[fullName] = monaco.editor.createModel(
                            stepData.contents, 
                            langType[stepData.mode === fileMode.newContents ? parseFileName(fullName).type : 'js']);
                        console.log(...richText('Created new model for ', [`"${fullName}"`, string]));
                    }
                    else {
                        //  TODO: handle "leave_unchanged"
                    }
                });
            }
            else {
                //  TODO: handle text steps
            }

            console.groupEnd();

            return step;
        });
    console.log(...richText('Updated ', ['stepList', code]), stepList);

    //  stepList array empty when no fromString is passed
    //  for activeStep to be correctly synced it should be 0 to begin with
    activeStep = stepList.length ? 1 : 0;

    console.groupEnd();
}

function openProject() {
    const fileInput = newEl('input', { type: 'file', accept: '.json' }) as HTMLInputElement;
    fileInput.click();
    fileInput.onchange = () => {
        const reader = new FileReader();
        reader.readAsText(fileInput.files[0], 'UTF-8');
        reader.onload = () => {
            createMissionStructure(reader.result as string);
            loadStep(1);
        };
    };
}

//===== STEP OPERATIONS =====//

function createNewStep() {
    debugGroup('createNewStep()');

    storeAnswers();
    newStepListItem();
    loadStep(++activeStep);

    console.groupEnd();
}

/**
 * - inserts new step JSON to `stepList` at index `placement`
 * - for each file in `missionFiles`:
 *  - adds new file JSON to `stepList[activeStep - 1].files`
 *  - adds new file model to `stepList[activeStep - 1].model`
 *  - creates new tab for the file (sets 'active' if it's the first tab)
 * @param placement
 * @param override
 */
function newStepListItem(placement?: number, override?: StepJsonOverride) {
    debugGroup('newStepListItem(', placement || (activeStep ? activeStep : 0), override, ')');

    placement = placement || (activeStep ? activeStep : 0);
    override = override || {};

    //  insert new step JSON into stepList after the current step
    stepList.splice(placement, 0, newStepJson(override));


    //  populate step files using the structure of missionFiles
    missionFiles.forEach(fullName => {
        const { type } = parseFileName(fullName);
        const fileJson = newFileJson({
            contents: codeTemplate[type],
            mode: 'new_contents',
            answers: []
        })

        //  add default file JSON to new step
        stepList[placement].files[fullName] = fileJson;
        //  set file model on new step
        stepList[placement].model[fullName] = monaco.editor.createModel(fileJson.contents, langType[type]);

        console.log(...richText('Updated ', [`stepList[${placement}].files`, App.colors.code]), stepList[placement].files);
    });

    console.groupEnd();
}

function goToStep(stepNo: number) {
    if (stepNo === activeStep) {
        return console.warn('Skipped loading the current step');
    }
    else if (stepNo > activeStep && activeStep === stepList.length) {
        return console.warn(`There is no step ${stepNo}`);
    }
    else if (stepNo < activeStep && activeStep === 1) {
        return console.warn('This is the first step');
    }

    debugGroup('goToStep(', stepNo, ')');

    stepList[activeStep - 1] = stepJson;
    storeAnswers();
    loadStep(activeStep = stepNo);
    console.log(...richText(['activeStep', App.colors.code], ' is now '), stepNo);

    console.groupEnd();
}

/**
 * - fetches step data from `stepList` array
 * - stores it in `stepJson` for use within the step
 * - 
 * - sets the code editor model
 * @param stepNo 
 */
function loadStep(stepNo: number) {
    debugGroup('loadStep(', stepNo, ')');

    const { code } = App.colors;
    //  retrieve step data from stepList
    const idx = stepNo - 1;

    //  TODO: update instructions
    codexEditor.isReady.then(() => {
        codexEditor.blocks.clear();
        codexEditor.blocks.insert('header', { text: `Step ${stepNo}` }, {}, 0);
    });

    stepJson = stepList[idx];
    console.log(...richText('Fetched ', ['stepJson', code], ' from ', [`stepList[${idx}]`, code]), { stepJson });

    obj(stepCache).forEachKey(key => stepCache[key] = {});
    console.log(...richText('Cleared ', ['stepCache', code]));

    //  update code editor
    if (stepJson.type === stepType.code || stepJson.type === stepType.interactive) {
        loadTab();
    }
    else if (stepJson.type = stepType.text) {
        enableTextStep();
    }
    
    if (App.UI.btnStepType.firstElementChild.innerText !== iconNames[stepJson.type]) {
        App.UI.btnStepType.firstElementChild.innerText = iconNames[stepJson.type];
        console.log(...richText('Changed ', ['btnStepType', App.colors.code], ' icon to ', [`"${iconNames[stepJson.type]}"`, App.colors.string]));
    }

    console.groupEnd();
}

function deleteStep(stepNo: number = activeStep) {
    debugGroup('deleteStep(', stepNo, ')');

    if (stepList.length === 1) {
        console.warn('Skipped deleting the only step');
    }
    else {
        stepList.splice(stepNo - 1, 1);
        console.log(...richText([`stepList[${stepNo - 1}]`, App.colors.code], ' has been removed'));

        if (stepNo === activeStep) {
            loadStep(activeStep > stepList.length ? --activeStep : activeStep);
        }
    }

    console.groupEnd();
}

function enableTextStep() {
    debugGroup('enabledTextStep()');

    storeModelsToCache();

    //  TODO: implement proper text step content editor
    disableCodePanel('The code editor is disabled for text steps.');

    stepJson.type = stepType.text;
    console.log(...richText('Changed ', ['stepJson.type', App.colors.code], ' to ', [stepType.text, App.colors.string]));

    App.UI.btnStepType.firstElementChild.innerText = iconNames.text;

    console.groupEnd();
}

function enableCodeStep() {
    debugGroup('enableCodeStep()');

    syncTabs();
    storeModelsToCache();

    stepJson.type = stepType.code;
    console.log(...richText('Changed ', ['stepJson.type', App.colors.code], ' to ', [stepType.code, App.colors.string]));

    loadModelsFromCache();

    App.UI.btnStepType.firstElementChild.innerText = iconNames.code;

    console.groupEnd();
}

function enableInteractiveStep() {
    debugGroup('enableInteractiveStep()');

    syncTabs();
    storeModelsToCache();

    stepJson.type = stepType.interactive;
    console.log(...richText('Changed ', ['stepJson.type', App.colors.code], ' to ', [stepType.interactive, App.colors.string]));

    loadModelsFromCache();

    App.UI.btnStepType.firstElementChild.innerText = iconNames.interactive;

    console.groupEnd();
}

//===== CODE OPERATIONS =====//

/**
 * - create tabs using `missionFiles` array
 * - attaches `onclick` event handlers for each tab
 * - sets the first item as the `activeTab`
 * - NOTES
 *  - tabs count & positions are fixed throughout all steps
 * - PENDING
 *  - implement adding and removing tabs
 */
function createTabs() {
    debugGroup('createTabs()');

    App.UI.codeTabs.innerHTML = '';

    missionFiles.forEach(fullName => {
        const { name, type } = parseFileName(fullName);
        const active = App.UI.codeTabs.children.length === 0;

        const tab = el(App.UI.codeTabs).addNew('span', { className: `${active ? 'active ' : ''}tab`, innerText: `${name}.${type}` });
        console.log('Added', tab);

        tab.name = name;
        tab.type = type;

        tab.addEventListener('click', switchTab);

        if (active) activeTab = tab;
    });

    console.groupEnd();
}

function switchTab() {
    debugGroup('switchTab()');

    if (activeTab === event.target) {
        console.log('Skipped loading the same tab');
    }
    else {
        storeAnswers();
        activeTab.classList.remove('active');
        activeTab = event.target as Tab;
        loadTab();
    }

    console.groupEnd();
}

/**
 * - lodas the code content for the active tab
 * @param tab 
 */
function loadTab(tab: Tab = activeTab) {
    debugGroup('loadTab(', tab, ')');

    const { code, string } = App.colors;

    tab.classList.add('active');

    if (tab.innerText === 'disabled') {
        createTabs();
        tab = activeTab;
    }

    if (stepJson.files[tab.innerText].contents) {
        if (App.UI.btnCodeMode.firstElementChild.innerText !== iconNames[stepJson.files[tab.innerText].mode]) {
            App.UI.btnCodeMode.firstElementChild.innerText = iconNames[stepJson.files[tab.innerText].mode];
            console.log(...richText('Changed ', ['btnCodeMode', code], ' icon to ', [`"${iconNames[stepJson.files[tab.innerText].mode]}"`, string]));
        }
    }
    else {
        stepJson.model[tab.innerText] = resolveTabContent(activeStep - 1, tab.innerText);

        App.UI.btnCodeMode.firstElementChild.innerText = iconNames[fileMode.noChange];
        console.log(...richText('Changed ', ['btnCodeMode', code], ' icon to ', [`"${iconNames[fileMode.noChange]}"`, string]));
    }

    if (codeEditor) {
        codeEditor.setModel(stepJson.model[tab.innerText]);
        codeEditor.updateOptions({ readOnly: !stepJson.files[tab.innerText].contents });
        console.log(...richText('Updated ', ['codeEditor', code], ' model to ', [`stepJson.model["${tab.innerText}"]`, code]));
    }
    else updateDiffEditor({
        tab,
        onFail: () => {
            removeDiffEditor();
            createCodeEditor();
            console.warn(`Reverted to "code authoring mode" because the "${tab.innerText}" tab doesn't contain editable markup`);
        },
    });

    console.groupEnd();
}

function syncTabs() {
    if (App.UI.codeTabs.children.length !== missionFiles.length) {
        createTabs();
    }
}

/**
 * - backtracks from the currect step to the first step in the project
 * - backtracking stops at the step where the `tabName` tab is in "new_contents" mode
 * - traversed steps are stored in `stepChain`
 * - iterates on `stepChain` to determine the content for `tabName` tab
 * - updates `stepJson.model[tabName]` with resulting content
 * - NOTES
 *  - does not call `codeEditor.setModel()`
 * @param tabName
 */
function resolveTabContent(cutoffStep: number, tabName: string) {
    const { code, string } = App.colors;

    debugGroup(...richText('resolveTabContent(cutoffStep: ', [`${cutoffStep}`, code], ', tabName: ', [`"${tabName}"`, string], ')'));

    const stepChain = [];

    for (let i = cutoffStep - 1; i >= 0; i--) {
        const step = stepList[i];

        stepChain.unshift(step);
        
        if (step.type !== stepType.code) {
            console.log(...richText('Step ', [`${i + 1}`, code], ' is ', [`"${step.type}"`, string], ', backtracking...'));
        }
        else {
            if (step.files) {
                if (step.files[tabName].mode === fileMode.newContents) {
                    console.log(...richText([`"${tabName}"`, string], ' in step ', [`${i + 1}`, code], ' is in ', [`"${fileMode.newContents}"`, string], ' mode'));
                    i = 0;
                }
                else {
                    console.log(...richText([`"${tabName}"`, string], ' in step ', [`${i + 1}`, code], ' is in ', [`"${step.files[tabName].mode || fileMode.noChange}"`, string], ' mode, backtracking...'));
                }
            }
            else {
                alert('fix me');
            }
        }
    }

    console.log(...richText('Iterating on ', ['stepChain', code], ' to determine ', [`"${tabName}"`, string], ' content in step ', [`${activeStep}`, code]));

    let transformedContent: string = stepChain.shift().model[tabName].getValue();
    let errorMessage: string;

    const resolved = stepChain.every((step, idx) => {
        if (step.type !== stepType.code || !step.files[tabName].contents) return true;
        
        const stepNo = activeStep - stepChain.length - idx;
        const newContents = new Function('codeWithoutMarkup', removeJsComments(step.model[tabName].getValue()).trim());

        try {
            //  TODO: add answers to transformedContent
            transformedContent = newContents(removeEditableMarkup(transformedContent));

            if (typeof transformedContent !== 'string') {
                errorMessage = `Transition logic in step ${stepNo} does not return a string`;
            }
        }
        catch (err) {
            errorMessage = `Transition logic in step ${stepNo} failed`;
            console.warn(err);
        }

        return !errorMessage;
    });

    console.groupEnd();

    if (resolved) {
        return monaco.editor.createModel(transformedContent, langType[parseFileName(tabName).type]);
    }
    else {
        return monaco.editor.createModel(errorMessage);
    }
}

function switchFileMode(mode: SingleMode) {
    if (mode !== fileMode.newContents && activeStep === 1) {
        return console.warn('File contents must be manually defined for the first step');
    }
    else if (stepJson.type !== stepType.code) {
        return console.warn(...richText('The ', [`"${mode}"`, App.colors.string], ' option is not compatible with ', [`"${stepJson.type}"`, App.colors.string], ' steps'));
    }
    else if (diffEditor) {
        return console.warn('Disable "edit answer" mode before changing file mode');
    }

    debugGroup('switchFileMode()');

    const { code, string } = App.colors;
    const cacheCurrentModel = () => {
        stepCache[stepJson.files[activeTab.innerText].mode][activeTab.innerText] = codeEditor.getModel();
        debugGroup(...richText('Stored content in ', [`stepCache.${stepJson.files[activeTab.innerText].mode}["${activeTab.innerText}"]`, code])).end(codeEditor.getValue());
    };

    if (mode === fileMode.noChange) {
        cacheCurrentModel();
        stepJson.model[activeTab.innerText] = resolveTabContent(activeStep - 1, activeTab.innerText);
        delete stepJson.files[activeTab.innerText].contents;
    }
    else {
        if (stepCache[mode][activeTab.innerText]) {
            console.log(...richText('Switching to ', [`"${mode}"`, string], ' with cache'));

            stepJson.model[activeTab.innerText] = stepCache[mode][activeTab.innerText];
            console.log(...richText([`stepJson.model["${activeTab.innerText}"]`, code], ' now using ', [`stepCache.${mode}["${activeTab.innerText}"]`, code]));
        }
        else {
            console.log(...richText('Switching to ', [`"${mode}"`, string], ' without cache'));

            if (mode === fileMode.newContents) {
                stepJson.model[activeTab.innerText] = monaco.editor.createModel(codeTemplate[activeTab.type], langType[activeTab.type]);
                console.log(...richText([`stepJson.model["${activeTab.innerText}"]`, code], ' now using the default ', [`"${activeTab.type.toUpperCase()}"`], ' model'));
            }
            else {
                stepJson.model[activeTab.innerText] = monaco.editor.createModel(codeTemplate.transition, langType.js);
                console.log(...richText([`stepJson.model["${activeTab.innerText}"]`, code], ' now using the default "transition" model'));
            }
        }

        if (!stepJson.files[activeTab.innerText].contents) {
            stepJson.files[activeTab.innerText] = newFileJson({ mode });
            console.log(...richText('Template contents have been transferred to ', [`stepJson.files["${activeTab.innerText}"]`, code]));
        }
        else {
            cacheCurrentModel();
        }

        stepJson.files[activeTab.innerText].mode = mode;
    }

    codeEditor.setModel(stepJson.model[activeTab.innerText]);
    console.log(...richText([`stepJson.model["${activeTab.innerText}"]`, code], ' is applied to the code editor'));

    codeEditor.updateOptions({ readOnly: mode === fileMode.noChange });
    App.UI.btnCodeMode.firstElementChild.innerText = iconNames[mode];

    console.groupEnd();
}

function toggleEditAnswers() {
    debugGroup('toggleEditAnswers()');

    if (codeEditor) {
        updateDiffEditor({
            onFail: () => console.warn(`Skipped "edit answers mode" because the "${activeTab.innerText}" tab doesn't contain editable markup`),
            onSuccess: () => {
                //  highlight button icon
                App.UI.btnModelAnswers.firstElementChild.classList.add('active-green');
            }
        });
    }
    else {
        removeDiffEditor();
        createCodeEditor();
    }

    console.groupEnd();
}

function createCodeEditor() {
    debugGroup('createCodeEditor(model)');

    codeEditor = monaco.editor.create(App.UI.codeContainer);
    codeEditor.setModel(stepJson.model[activeTab.innerText]);

    console.groupEnd();
}

/**
 * - updates diff editor content 
 * - NOTES
 *  - only consumes the `stepJson` object
 *  - update `stepJson.files[cfg.tab.innerText].contents` before calling this method
 * - PENDING
 *  - remove comments from code editor before generating diff content
 * @param cfg - `{ tab, onFail, onSuccess }`
 */
function updateDiffEditor(cfg: DiffEditorConfig) {
    if (stepJson.type !== stepType.code) {
        return console.warn(...richText(['"edit answer mode"', App.colors.string], ' is not compatible with ', [`"${stepJson.type}"`, App.colors.string], ' steps'));
    }

    debugGroup('updateDiffEditor()');

    const { code, string } = App.colors;
    const tab = cfg.tab || activeTab;
    const failCallback = cfg.onFail || (() => { });
    const successCallback = cfg.onSuccess || (() => { });

    const original: monaco.editor.IModel =
        stepJson.files[tab.innerText].mode === fileMode.modify ?
            resolveTabContent(activeStep, tab.innerText) :
            stepJson.model[tab.innerText];

    //  FIXME: need to strip all types of comments from code editor content
    let authorContent = original.getValue();

    debugGroup(`Working from: "${tab.innerText}"`).end(authorContent);

    let authorEditableContents = authorContent.match(editablePattern.excludingMarkup);

    //  ensure code contains editable markup
    if (authorEditableContents === null) {
        authorEditableContents = [];
        
        if (stepJson.files[tab.innerText].mode !== fileMode.modify) {
            return failCallback();
        }
    }

    const storedAnswers = stepJson.files[tab.innerText].answers || [];
    const codeChunks = authorContent.split(editablePattern.excludingMarkup);

    //  get rid of editable markup with no content, i.e. #BEGIN_EDITABLE##END_EDITABLE#
    authorEditableContents = authorEditableContents.filter((content: string) => content.length);

    if (storedAnswers.length !== authorEditableContents.length) {
        //  clear the answers array if the number of editables don't match with the number of answers
        stepJson.files[tab.innerText].answers = [];
        console.log(...richText('Cleared ', [`stepJson.files["${tab.innerText}"].answers`, code]));
    }

    authorEditableContents
        //  insert either stored answer or author editable content into the nth editable region
        .forEach((content: string, idx: number) => {
            if (storedAnswers[idx] !== undefined) {
                codeChunks[idx] += storedAnswers[idx];
                console.log('Editable', idx, `using stored answer "${storedAnswers[idx]}"`);
            }
            else {
                codeChunks[idx] += content;
                console.log('Editable', idx, `using author editable content "${content}"`);
            }
        });

    //  create modified model for the diff editor
    const modified = monaco.editor.createModel(codeChunks.join(''), langType[tab.type]);

    //  must empty codeContainer before adding diff editor to it
    if (codeEditor) {
        codeEditor.dispose();
        codeEditor = null;

        diffEditor = monaco.editor.createDiffEditor(App.UI.codeContainer);
    }

    diffEditor.setModel({ original, modified });

    successCallback();

    console.groupEnd();
}

function removeDiffEditor() {
    debugGroup('removeDiffEditor()');

    storeAnswers();

    diffEditor.dispose();
    diffEditor = null;

    //  remove highlight from button icon
    App.UI.btnModelAnswers.firstElementChild.classList.remove('active-green');

    console.groupEnd();
}

/**
 * - extracts answers from the diff editor and write to `stepJson.files[activeTab.innerText].answers`
 */
function storeAnswers() {
    if (codeEditor) return;

    debugGroup('storeAnswers()');

    const answers = diffEditor.getModel().modified.getValue().match(editablePattern.excludingMarkup);

    if (answers) {
        stepJson.files[activeTab.innerText].answers = answers.map((answer: string) => {
            return /\S/.test(answer) ? answer.trim() : answer;
        });
        console.log(...richText('Updated', [`stepJson.files["${activeTab.innerText}"].answers`, App.colors.code]), stepJson.files[activeTab.innerText].answers);
    }
    else console.warn(`No answer found in "${activeTab.innerText}"`);

    console.groupEnd();
}

function storeModelsToCache() {
    if (!stepJson.model) return;

    debugGroup('storeModelsToCache()');

    const { code } = App.colors;

    obj(stepJson.model).forEachEntry((fullName, model) => {
        const cacheType = stepJson.type === stepType.code ? stepJson.files[fullName].mode : stepJson.type;
        stepCache[cacheType][fullName] = model;
        debugGroup(...richText('Transferred ', [`stepJson.model["${fullName}"]`, code], ' to ', [`stepCache.${cacheType}`, code])).end((stepCache[stepJson.type]));

        delete stepJson.model[fullName];
        console.log(...richText('Deleted ', [`stepJson.model["${fullName}"]`, code]));
    });

    console.groupEnd();
}

function loadModelsFromCache() {
    debugGroup('loadModelsFromCache()');

    missionFiles.forEach(fullName => {
        const cacheType = stepJson.type === stepType.code ? stepJson.files[fullName].mode : stepJson.type;

        if (stepCache[cacheType][fullName]) {
            stepJson.model[fullName] = stepCache[cacheType][fullName];
            console.log(...richText('Updated ', [`stepJson.model["${fullName}"]`, App.colors.code], ' using ', [`stepCache.${cacheType}`, App.colors.code]));
        }
        else {
            const { type } = parseFileName(fullName);
            stepJson.model[fullName] = monaco.editor.createModel(codeTemplate[type], langType[type]);
            console.log(...richText('Updated ', [`stepJson.model["${fullName}"]`, App.colors.code], ' using ', [`codeTemplate["${type}"]`, App.colors.code]));
        }
    });

    codeEditor.setModel(stepJson.model[activeTab.innerText]);
    codeEditor.updateOptions({ readOnly: false });
    codeEditor.focus();

    console.groupEnd();
}

function disableCodePanel(message: string) {
    debugGroup(`disableCodePanel("${message}")`);

    el(App.UI.codeTabs).forEachChild((tab: Tab) => {
        if (tab.classList.contains('active')) {
            tab.innerText = 'disabled';
        }
        else {
            el(App.UI.codeTabs).remove(tab);
            console.log(`Removed the "${tab.innerText}" tab`);
        }
    });

    codeEditor.setModel(monaco.editor.createModel(message));
    codeEditor.updateOptions({ readOnly: true });

    console.groupEnd();
}

//===== GLOBAL =====//

function parseFileName(fileName?: string) {
    fileName = fileName || activeTab.innerText;

    const [match, name, type] = fileName.match(/\/?(.*)\.(.*)$/);

    return { match, name, type };
}

function debugGroup(...message: Array<any>) {
    console[`group${consoleFold ? 'Collapsed' : ''}`](...message);
    return {
        end: (...message: Array<any>) => {
            if (message.length) {
                console.log(...message);
            }
            console.groupEnd();
        }
    };
}

function removeJsComments(content: string) {
    return content.replace(/\s*\/\/.*/g, '');
}

function removeEditableMarkup(content) {
    return content.replace(/#(BEGIN|END)_EDITABLE#/g, '');
} 
