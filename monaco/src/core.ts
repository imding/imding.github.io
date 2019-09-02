//  https://basarat.gitbooks.io/typescript/content/docs/project/globals.html

import './styles/main.scss';
import * as favicon from './images/favicon.png';
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

// const { el, obj, richText } = require('./modules/Handy');
const EditorJS = require('./components/editor');

//===== INITIALISE APP =====//

const App = {
    root: el('#root'),
    stepCodeCache: {},
    Editors: {
        codexEditor: null,
        codeEditor: null,
        diffEditor: null
    },
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

//===== INITIALISE VARIABLES =====//

let missionJson: MissionJson;
let stepList = [];
let testList = [];
let activeStep = 1;

let refreshTimer;
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
    transition: '// Transition:\nreturn `${codeWithoutMarkup}#BEGIN_EDITABLE##END_EDITABLE#`;\n// let output = codeWithoutMarkup; //.replace(/\s*<!--.*-->/g,\'\');\n// output = insertLine(output, \'key\', { line: \'\', offset: 0 });\n// output = makeEditableBlock(output, \'key\');\n// return output;'
};

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

//===== INIT APP =====//

window.onload = init;

function init(): void {
    addFavIcon();
    assembleAppUI();
    createMissionJson();
    createNewStep({
        title: 'Instruction',
        orderNo: 1000,
    });

    App.Editors.codexEditor.isReady.then(() => loadStepContents(1));
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
                    // const { name, type, fullName } = App.UI.codeTabs.active;

                    // if (stepList[activeStep - 1].files[fullName].mode === 'modify') {
                    //     App.stepCodeCache[fullName] = modelStateSchema[type][name].model.getValue();
                    //     console.log(`content of "${fullName}" saved to cache.`);
                    // }
                }
            },
            'build': {
                tipHeading: 'modify content',
                tip: 'the content of the current tab will be defined by step transition code',
                handler: () => {
                    const { name, type, fullName } = App.UI.codeTabs.active;
                    const { stepIndex, stepJson } = parseStepJson();

                    if (stepJson.files[fullName].mode === 'new_content') {
                        App.stepCodeCache[fullName] = modelStateSchema[type][name].model.getValue();
                        console.log(`content of "${fullName}" saved to cache.`);
                    }

                    App.Editors.codeEditor.setModel(monaco.editor.createModel(codeTemplate.transition, 'javascript'));
                    App.UI.btnCodeMode.firstElementChild.innerText = 'build';
                    stepList[stepIndex].files[fullName].mode = 'modify';
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

    function storeCodeToCache() {

    }

    //===== INITIALISE EDITORS =====//

    const { codexContainer, codeContainer } = App.UI;

    App.Editors.codexEditor = new EditorJS({
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

    App.Editors.codeEditor = monaco.editor.create(codeContainer as HTMLElement, { theme: 'vs-dark' });

    registerTopLevelEvents();
}

function registerTopLevelEvents() {
    const {
        btnOpenProject, btnSaveProject, btnContinue,
        btnNewStep, btnDelStep, btnNextStep, btnPrevStep,
        btnTemplates,
        btnModelAnswers, btnToggleOutput,
        pnlPreview, codeTabs
    } = App.UI;

    window.onresize = () => (App.Editors.codeEditor || App.Editors.diffEditor).layout();

    btnOpenProject.onclick = () => {
        const fileInput = newEl('input', { type: 'file', accept: '.json' }) as HTMLInputElement;
        fileInput.click();
        fileInput.onchange = () => {
            const reader = new FileReader();
            reader.readAsText(fileInput.files[0], 'UTF-8');
            reader.onload = () => {
                createMissionJson(reader.result as string);
                loadStepContents(1);
                btnOpenProject.classList.add('disabled');
            };
        };
    };

    btnNewStep.onclick = () => {
        createNewStep();
        btnNextStep.click();
    };
    btnNextStep.onclick = () => goToStep(activeStep + 1);
    btnPrevStep.onclick = () => goToStep(activeStep - 1);

    btnModelAnswers.onclick = () => {
        //  this handler assumes the code content includes at least one valid editable markup
        //  this button should be disabled otherwise
        const { stepTypeIsCode } = parseStepJson();

        if (stepTypeIsCode) {
            storeTabData();

            if (App.Editors.codeEditor) {
                //  must dispose editor before creating another
                const originalModel = App.Editors.codeEditor.getModel();

                App.Editors.codeEditor.dispose();
                App.Editors.codeEditor = null;

                const codeWithAnswers = getTabModelCode(codeTabs.active);

                App.Editors.diffEditor = monaco.editor.createDiffEditor(el('#code-editor'));
                App.Editors.diffEditor.setModel({
                    original: originalModel,
                    modified: monaco.editor.createModel(codeWithAnswers, languageFromType(codeTabs.active.type)),
                });

                btnModelAnswers.firstElementChild.classList.add('active-green');
            }
            else {
                turnOffModelAnswers();
            }
        }
        else console.warn('The current step type does not support model answers.');
    };

    btnToggleOutput.onclick = () => {
        if (/code|interactive/.test(stepList[activeStep - 1].type)) {
            pnlPreview.classList.toggle('hidden');
            btnToggleOutput.firstElementChild.classList.toggle('active-blue');

            if (pnlPreview.classList.contains('hidden')) {
                pnlPreview.removeChild(pnlPreview.iframe);
            }
            else {
                pnlPreview.iframe = pnlPreview.appendChild(newEl('iframe'));
                refreshOutput();
            }
        }
    };
}

//===== PROJECT OPERATION =====//

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
    testList = stepList
        .map(step => Object.values(step.tests))
        .sort((a: any, b: any) => a.orderNo - b.orderNo);
}

function saveToLocal() {
    storeStepContents(activeStep);

    stepList.forEach(step => {
        missionJson.steps[step.stepId] = step;
    });

    missionJson.settings.lastModified = moment().format();

    localStorage.setItem(`BSD:${missionJson.settings.title}`, JSON.stringify(missionJson));
    console.log('Saved to local');
}

function loadFromLocal() {
    let projects = [];
    let options = 'Choose a project to load:';

    obj(localStorage).forEachKey(key => {
        if (key.startsWith('BSD:')) {
            projects.push(localStorage.getItem(key));
        }
    });

    projects = projects.map((project, idx) => {
        project = JSON.parse(project);
        options += `\n${idx + 1}. ${project.settings.title} @ ${project.settings.lastModified}`;
        return project;
    });

    if (projects.length === 0) return alert('There is no locally stored project.');

    const userChoice = Number(prompt(options));

    if (userChoice >= 0 && userChoice <= projects.length) {
        //  reset codeModelStates
        obj(modelStateSchema).forEachKey(type => delete modelStateSchema[type]);

        missionJson = projects[userChoice - 1];

        stepList = obj(missionJson.steps).sort('values', (a, b) => a.orderNo - b.orderNo);

        //  clear file schema before loading a new project
        obj(modelStateSchema).forEachKey(type => delete modelStateSchema[type]);

        obj(stepList[0].files).forEachEntry((fileFullName, file) => {
            const [name, type] = fileFullName.split('.');
            const { contents } = file;

            //  build model state for first step
            modelStateSchema[type] ? null : modelStateSchema[type] = {};
            modelStateSchema[type][name] = {
                model: monaco.editor.createModel(contents, languageFromType(type)),
                state: null,
            };
        });

        App.Editors.codeEditor.setModel(modelStateSchema.html['index'].model);

        refreshOutput();
    }
    else return;
}

//===== STEP OPERATIONS =====//

/**
 * - creates a new step 
 * - resets `modelStateSchema` to default code templates
 * - modifies `stepList` and `testList`
 * - does not transition to newly created step
 * @param override
 * @returns `void`
 */
function createNewStep(override: StepJsonOverride = {}) {
    const filesJson = {};
    const testsJson = {};

    //  reset schema to code templates for new steps
    forEachSchemaFile((type, name) => {
        const contents = codeTemplate[type];
        const fullName = `${name}.${type}`;
        //  usually when createNewStep is called, there will be no editable in the code base
        //  this is here for quick testing purposes
        //  but leaving in as an ensurance mechanism
        const { answers, tests } = answerAndTestFrom(contents, name, type);

        filesJson[fullName] = {
            answers,
            contents,
            mode: 'new_content',
        };

        testsJson[fullName] = tests;

        modelStateSchema[type][name] = {
            model: monaco.editor.createModel(contents, languageFromType(type)),
            state: null,
        };
    });

    //  use schema as base file structure of the new step
    //  mutate it with override.files if exists
    override.files = obj(filesJson).mutate(override.files || {});

    const stepJson = newStepJson(override);
    const existingStepIds = stepList.map(step => step.stepId);

    while (existingStepIds.includes(stepJson.stepId)) {
        stepJson.stepId = (Math.floor(Math.random() * (Number.MAX_SAFE_INTEGER - 1)) + 1).toString();
    }

    stepList.splice(activeStep, 0, stepJson);
    testList.splice(activeStep, 0, testsJson);
}

function goToStep(stepNo: number) {
    if (stepNo < 1 || stepNo > stepList.length) return console.warn(`There is no step ${stepNo}`);
    storeStepContents(activeStep).then(() => loadStepContents(stepNo));
}

/**
 * - stores the instructions and code in the active tab
 * - modifies `stepList`
 * @param stepNo - the step to store
 */
function storeStepContents(stepNo: number) {
    const { stepIndex, stepHasCode } = parseStepJson(stepNo);

    //  store instructions in current step
    return App.Editors.codexEditor.save().then(contents => {
        const instructions = contents.blocks;

        if (instructions.length) {
            stepList[stepIndex].title = instructions.shift().data.text;

            const contentKey = stepHasCode ? 'instructions' : 'text';
            const stepContent = instructions.map(block => `<p>${block.data.text}</p>`).join('');

            stepList[stepIndex].content[contentKey] = stepContent;
        }

        //  store code in the active tab of the current step
        if (stepHasCode) {
            storeTabData();

            obj(stepList[stepIndex].files).forEachKey(fullName => {
                const [_, name, type] = fullName.match(fileNamePattern);
                const contents = modelStateSchema[type][name].model.getValue();

                stepList[stepIndex].files[fullName].contents = contents;
            });
        }

        return {
            then: (callback: () => any) => callback()
        };
    });
}

/**
 * - updates UI to display the content of a step
 * - does not store data for the current step
 * @param stepNo - the step to load
 */
function loadStepContents(stepNo: number) {
    const { codeEditor, diffEditor, codexEditor } = App.Editors;
    const { btnStepType, btnToggleOutput, pnlPreview, codeTabs } = App.UI;
    const { stepIndex, stepHasCode, stepJson, stepTypeIsCode } = parseStepJson(stepNo);
    const loadStepInstructions = () => {
        codexEditor.blocks.clear();
        codexEditor.blocks.insert('header', { text: stepJson.title }, {}, 0, true);

        const stepContent = stepJson.content[['instructions', 'text'][stepHasCode ? 0 : 1]];
        const stepContentTree = new HTMLTree(stepContent);

        stepContentTree.forEach(node => {
            const { tagName } = node.openingTag;

            //  prevent inserting empty blocks into the codex editor
            node.rawContent = node.rawContent.replace(/(^&nbsp;)|(&nbsp;$)|(^<br\s*\/?>$)/g, '');
            if (node.rawContent.length === 0) return;

            let blockType = 'paragraph';
            let blockContent: object = { text: node.rawContent };

            if (/^pre$/.test(tagName)) {
                blockType = 'code';
                blockContent = { code: node.content[0].rawContent };
            }
            else if (/^[u|o]l$/.test(tagName)) {
                blockType = 'list';
                blockContent = {
                    style: `${tagName === 'ul' ? 'un' : ''}ordered`,
                    //  assumes each <li> has only one child
                    items: node.content.map(child => child.content[0].rawContent)
                };
            }
            else if (/^center$/.test(tagName)) {
                blockContent = { text: node.content[0].rawContent };
            }

            codexEditor.blocks.insert(blockType, blockContent);
        });
    };
    const loadStepCode = () => {
        //  unpack all types of files in model & state schema
        forEachSchemaFile((type, name) => {
            const fullName = `${name}.${type}`;
            const fileUnchanged = !stepJson.files.hasOwnProperty(fullName);
            let contents: string;

            if (fileUnchanged) {
                let idx = stepIndex - 1;

                do {
                    //  loop through earlier steps to find user defined code contents
                    //  i.e. unchanged or modify
                    if (stepList[idx].files.hasOwnProperty(fullName)) {
                        contents = stepList[idx].files[fullName].contents;
                    }
                }
                while (!contents && idx-- >= 1);
            }
            else contents = stepJson.files[fullName].contents;

            const language = stepJson.files[fullName].mode === 'modify' ? 'javascript' : languageFromType(type);

            modelStateSchema[type][name] = {
                model: monaco.editor.createModel(contents, language),
                state: null
            };
        });

        //  update code editor tabs
        populateTabs(`active:${stepJson.content.startTab || 'index.html'}`);
    };
    const disableCodeEditor = (message: string) => {
        el(codeTabs).forEachChild((tab: Tab) => {
            if (tab.classList.contains('active')) {
                tab.innerText = '...';
            }
            else el(codeTabs).remove(tab);
        });

        codeEditor.setModel(monaco.editor.createModel(message));
        codeEditor.updateOptions({ readOnly: true });
    };
    const iconFromStepType = (type: string) => {
        return type.replace(/text/, 'assignment').replace(/interactive/, 'extension');
    };

    activeStep = stepNo;

    loadStepInstructions();

    if (stepHasCode) {
        loadStepCode();
        refreshOutput();
    }
    else {
        if (diffEditor && !stepTypeIsCode) turnOffModelAnswers();
        
        disableCodeEditor(`The code editor is disabled for ${stepJson.type} steps.`);

        if (pnlPreview.iframe) {
            pnlPreview.classList.toggle('hidden');
            btnToggleOutput.firstElementChild.classList.toggle('active-blue');
            el(pnlPreview).remove(pnlPreview.iframe);
        }
    }

    btnStepType.firstElementChild.innerText = iconFromStepType(stepJson.type);
}

/**
 * @param stepNo 
 * @returns object { `stepIndex`, `stepJson`, `stepHasCode` }
 */
function parseStepJson(stepNo: number = activeStep) {
    const stepIndex = stepNo - 1;

    return {
        stepIndex,
        stepJson: stepList[stepIndex],
        stepHasCode: /code|interactive/.test(stepList[stepIndex].type),
        stepTypeIsCode: stepList[stepIndex].type === 'code',
        stepHasEditableIn: (tab: Tab) => {
            return editablePattern.includingMarkup.test(stepList[stepIndex].files[tab.fullName].contents);
        } 
    };
}

//===== SECTION: IFRAME OPERATIONS =====//

function refreshOutput(now = true) {
    if (!App.UI.pnlPreview.iframe) return;

    const refresh = () => {
        let srcHtml = Object.values(modelStateSchema.html)[0].model.getValue();
        const linkAndScript = srcHtml.match(/<link\s+[\s\S]*?>|<script[\s\S]*?>[\s\S]*?<\/script\s*>/gi);

        linkAndScript.forEach(elementString => {
            const tree = new HTMLTree(elementString);

            if (tree.error) return;

            const node = tree[0];

            const tagType = node.openingTag.tagName;
            const attrType = tagType === 'link' ? 'href' : tagType === 'script' ? 'src' : '';
            const attrValue = node.openingTag.attrs.filter(attr => attr.name === attrType)[0].value;
            const [_, name, type] = attrValue.match(fileNamePattern);

            if (!modelStateSchema[type]) return;
            if (!modelStateSchema[type][name]) return;

            const replacement: [string, string] =
                type === 'css' ?
                    [node.openingTag.raw,
                    `<style>${modelStateSchema[type][name].model.getValue()}</style>`]
                    :
                    type === 'js' ?
                        [`${node.openingTag.raw}${node.rawContent}${node.closingTag.raw}`,
                        `<script>${modelStateSchema[type][name].model.getValue()}</script>`]
                        :
                        ['', ''];

            srcHtml = srcHtml.replace(...replacement);
        });

        App.UI.pnlPreview.iframe.srcdoc =
            srcHtml
                //  transform relative platform paths to absolute paths
                .replace(/(['"])\s*(\/resources\/)/g, '$1https://app.bsd.education$2')
                //  remove editable markup
                .replace(/#(BEGIN\s*|\s*END)_EDITABLE#/g, '');
    };

    if (now) return refresh();
    else if (refreshTimer) clearTimeout(refreshTimer);

    refreshTimer = setTimeout(refresh, refreshDelay);
}

//===== CODE OPERATIONS =====//

function populateTabs(active: string) {
    const { codeTabs } = App.UI;
    const loadTabData = (tab: Tab) => {
        const { mode } = parseStepJson().stepJson.files[tab.fullName];
        const modeIcon = mode.replace(/new_content/, 'create').replace(/modify/, 'build');
        const targetTabData = modelStateSchema[tab.type][tab.name];
        const setCodeModelState = () => {
            App.Editors.codeEditor.setModel(targetTabData.model);
            App.Editors.codeEditor.restoreViewState(targetTabData.state);
        };
        const setDiffModelState = () => {
            const codeWithAnswers = getTabModelCode(tab);

            App.Editors.diffEditor.setModel({
                original: targetTabData.model,
                modified: monaco.editor.createModel(codeWithAnswers, languageFromType(tab.type))
            });
        };

        App.Editors.codeEditor ? setCodeModelState() : setDiffModelState();
        App.UI.btnCodeMode.firstElementChild.innerText = modeIcon;
        App.UI.codeTabs.active = tab;
    };

    el(codeTabs).remove(...codeTabs.children);

    forEachSchemaFile((type, name) => {
        const fullName = `${name}.${type}`;
        const isActive = active === `active:${fullName}`;
        const tab: Tab = el(codeTabs).addNew('span', { className: `tab${isActive ? ' active' : ''}`, innerText: fullName });

        tab.name = name;
        tab.type = type;
        tab.fullName = fullName;
        tab.onclick = () => {
            const { codeEditor, diffEditor } = App.Editors;
            const { stepTypeIsCode } = parseStepJson();

            storeTabData();

            if (diffEditor && !stepTypeIsCode) {
                turnOffModelAnswers();
            }

            //  toggle the "active" class name on current and target tabs
            codeTabs.active.classList.remove('active');
            tab.classList.add('active');

            loadTabData(tab);

            (codeEditor || diffEditor).focus();
        };

        if (isActive) loadTabData(tab);
    });

    return { then: callback => callback() };
}

function turnOffModelAnswers() {
    //  must dispose editor before creating another
    const diffModel = App.Editors.diffEditor.getModel();

    App.Editors.diffEditor.dispose();
    App.Editors.diffEditor = null;

    App.Editors.codeEditor = monaco.editor.create(el('#code-editor'), { theme: 'vs-dark' });
    App.Editors.codeEditor.setModel(diffModel.original);

    App.UI.btnModelAnswers.firstElementChild.classList.remove('active-green');
}

function storeTabData() {
    const { codeEditor, diffEditor } = App.Editors;
    const { name, type, fullName } = App.UI.codeTabs.active;

    if (codeEditor) {
        modelStateSchema[type][name] = {
            model: codeEditor.getModel(),
            state: codeEditor.saveViewState(),
        };
    }
    else {
        const stepIndex = activeStep - 1;
        const codeWithAnswers = diffEditor.getModel().modified.getValue();
        const { answers, tests } = answerAndTestFrom(codeWithAnswers, name, type);

        stepList[stepIndex].files[fullName].answers = answers;
        testList[stepIndex][fullName] = tests;
    }
}

function getTabModelCode(tab: Tab) {
    const { name, type, fullName } = tab;
    const stepIndex = activeStep - 1;
    const authorCode = modelStateSchema[type][name].model.getValue();

    return authorCode.split(editablePattern.excludingMarkup).map((chunk, idx) => {
        const answer = stepList[stepIndex].files[fullName].answers[idx];
        return answer ? `${chunk}${answer}` : chunk;
    }).join('');
}

function answerAndTestFrom(code: string, name: string, type: string) {
    const answers = code.match(editablePattern.excludingMarkup) || [];
    const tests = answers.map((answer, idx) => {
        return { answer, name, type, editableIndex: idx };
    });

    return { answers, tests };
}

//===== GLOBAL =====//

function forEachSchemaFile(callback: (type?: string, name?: string, modelState?: { model: monaco.editor.ITextModel, state: monaco.editor.IViewState }) => void) {
    forEachSchemaType((type, files) => {
        obj(files).forEachEntry((name, data) => callback(type, name, { model: data.model, state: data.state }));
    });
}

function forEachSchemaType(callback: (type?: string, files?: Array<object>) => void) {
    obj(modelStateSchema).forEachEntry((type, files) => callback(type, files));
}

function languageFromType(string: string) {
    return string.replace(/^js$/, 'javascript');
}
