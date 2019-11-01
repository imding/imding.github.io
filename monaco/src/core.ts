//  https://basarat.gitbooks.io/typescript/content/docs/project/globals.html

import './styles/main.scss';
import * as streamSaver from 'streamsaver';
import * as favicon from './images/favicon.png';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import * as moment from 'moment';
import * as asana from 'asana';

// import EditorJS from './components/editor';
import Header from './components/CodeX/Header';
import Paragraph from './components/CodeX/Paragraph';
import SimpleImage from './components/CodeX/SimpleImage';
import List from './components/CodeX/List';
import Code from './components/CodeX/Code';
import InlineCode from './components/CodeX/InlineCode';

import { el, newEl, obj, RichText, uuidv4 } from './components/Handy';

import { newTestJson, newMissionJson, newFileJson, newStepJson } from './components/JsonTemplates';
import tooltip from './components/Tooltip';
import subMenu from './components/SubMenu';
import HTMLTree from './components/HTMLTree';

// const { el, obj, richText } = require('./modules/Handy');
const EditorJS = require('./components/CodeX/editor');

const consoleDebug = true;
const consoleFold = false;
const clr = {
    code: { color: 'dodgerblue' },
    string: { color: 'darkorange' },
    tomato: { color: 'tomato' }
};

//===== APP MODULES =====//

let App: any;
let codexEditor = null;
let codeEditor = null;
let diffEditor = null;

//===== MEMORY MODULES =====//


interface File {
    author?: monaco.editor.IModel,
    mode?: string,
    answers?: [] | Array<string>
}

interface Step {
    orderNo?: number
    type?: string,
    hasCode?: boolean,
    text?: string,
    title?: string,
    stepId?: string
}

let missionJson: MissionJson;
let missionFiles: Array<string>;
let stepList: Array<Step>;
let activeStep: Step;
let activeStepNo: number;
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
    includingMarkup: /#BEGIN_EDITABLE#([\s\S]*?)#END_EDITABLE#/g,
    justMarkup: /#(BEGIN|END)_EDITABLE#/g
};

const codeTemplate = {
    html: '<!DOCTYPE html>\n<html>\n\n<head>\n\t<link rel="stylesheet" href="style.css" />\n</head>\n\n<body>\n\n\t<h1>Welcome to HTML</h1>\n\n\t#BEGIN_EDITABLE#    #END_EDITABLE#\n\n\t<script src="script.js"></script>\n</body>\n\n</html>',
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
    console.groupCollapsed('Initialising app...');

    resetApp();
    addFavIcon();
    assembleUI();
    createStep(0).go();

    // initAsanaAPI();


    // JS validation settings
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false
    });

    // JS compiler options
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ES2016,
        allowNonTsExtensions: true
    });

    //  CSS formatting provider
    monaco.languages.registerDocumentFormattingEditProvider('css', {
        async provideDocumentFormattingEdits(model, options, token) {
            const prettier = await import('prettier/standalone');
            const css = await import('prettier/parser-postcss');

            return [{
                text: prettier.format(model.getValue(), {
                    parser: 'css',
                    plugins: [css],
                    tabWidth: 4
                }),
                range: model.getFullModelRange()
            }];
        }
    });


    codeEditor.focus();

    console.groupEnd();

    log(['App initialised', clr.tomato]);
}

function resetApp() {
    //  collect all non-script elements
    const bin = Array.from(document.body.children).filter(element => element.tagName !== 'SCRIPT');
    //  delete all non-script elements
    bin.forEach(element => document.body.removeChild(element));
    //  add app root element
    document.body.insertBefore(newEl('div', { id: 'root' }), document.body.firstElementChild);

    App = {
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
            btnFileMode: null,
            btnModelAnswers: null,
            btnToggleOutput: null,

            stepInfo: el('span', { id: 'step-info' }),
            tabContainer: el('div', { id: 'code-tabs' }),
            codeContainer: el('div', { id: 'code-editor' }),
        },
        populate: (parent: HTMLElement, elements: object) => {
            debugGroup('Populating', parent);

            obj(elements).forEachEntry((branch: string, stem: Window | [HTMLElement | Window, object] | HTMLElement) => {

                if (stem === self) {
                    parent.append(App.UI[branch]);
                    log('Added', App.UI[branch]);
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

    missionFiles = ['index.html', 'style.css', 'script.js'];
    stepList = [];
    activeStep = {};
    activeStepNo = 0;
    activeTab = null;

    missionJson = newMissionJson();
}

//===== LOAD FAVICON =====/

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

function assembleUI() {

    //===== APP UI STRUCTURE =====//

    debugGroup('assembleUI()');

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
                            btnFileMode: [el('div', {}), { icon: el('i', { className: 'material-icons' }) }],
                            btnModelAnswers: [el('div', {}), { icon: el('i', { className: 'material-icons', innerText: 'spellcheck' }) }],
                            btnToggleOutput: [el('div', {}), { icon: el('i', { className: 'material-icons', innerText: 'visibility' }) }]
                        }]
                    }]
                }]
            }],
            pnlPreview: self,
        }],
        pnlCode: [self, {
            tabContainer: self,
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
        tool: App.UI.btnFileMode,
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
                handler: () => setStepType(stepType.text)
            },
            'code': {
                tipHeading: 'code',
                tip: 'code steps can contain editables where the learner can write code',
                handler: () => setStepType(stepType.code)
            },
            'extension': {
                tipHeading: 'interactive',
                tip: 'the code panel is hidden in interactive steps and the learner is expected to interact with the output',
                handler: () => setStepType(stepType.interactive)
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
        host: App.UI.btnFileMode,
        items: {
            'create': {
                tipHeading: 'use new content',
                tip: 'define the content of the current code tab from scratch',
                handler: () => setFileMode(fileMode.newContents)
            },
            'build': {
                tipHeading: 'modify content',
                tip: 'the content of the current tab will be defined by step transition code',
                handler: () => setFileMode(fileMode.modify)
            },
            'lock': {
                tipHeading: 'leave unchanged',
                tip: 'the content of this code tab will be the same as the previous step',
                handler: () => setFileMode(fileMode.noChange)
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

    codeEditor = monaco.editor.create(codeContainer, { theme: 'vs-dark', scrollBeyondLastLine: false, formatOnPaste: true });
    
    registerTopLevelEvents();
}

function registerTopLevelEvents() {
    const {
        pnlActions,
        btnOpenProject, btnSaveProject,
        btnNewStep, btnDelStep, btnNextStep, btnPrevStep,
        btnModelAnswers, btnToggleOutput
    } = App.UI;

    pnlActions.addEventListener('scroll', () => {
        const actionPanelScrolled = new Event('actionPanelScrolled');
        window.dispatchEvent(actionPanelScrolled);
    });

    btnOpenProject.addEventListener('click', projectFromFile);
    btnSaveProject.addEventListener('click', saveProjectToDisk);

    btnNewStep.addEventListener('click', () => createStep(activeStepNo).go());
    btnDelStep.addEventListener('click', () => deleteStep(activeStepNo));
    btnNextStep.addEventListener('click', () => goToStep(activeStepNo + 1));
    btnPrevStep.addEventListener('click', () => goToStep(activeStepNo - 1));

    btnModelAnswers.addEventListener('click', toggleAnswerEditor);
    btnToggleOutput.addEventListener('click', toggleOutput);

    codeEditor.onDidChangeModelContent(() => refreshOutput(false));

    window.onresize = () => (codeEditor || diffEditor).layout();
}

//===== PROJECT OPERATIONS =====//

function projectFromFile() {
    const fileInput = newEl('input', { type: 'file', accept: '.json' }) as HTMLInputElement;
    fileInput.click();
    fileInput.onchange = () => {
        const reader = new FileReader();

        reader.readAsText(fileInput.files[0], 'UTF-8');
        reader.onload = () => {
            stepList = [];
            missionFiles = [];

            const mission = JSON.parse(reader.result as string);

            obj(mission.steps)
                .sort('values', (a, b) => a.orderNo - b.orderNo)
                .forEach((step, idx) => {
                    const title = step.title;
                    const type = step.type;
                    const hasCode = type === stepType.code || type === stepType.interactive;
                    const orderNo = (idx + 1) * 1000;
                    const stepId = step.stepId;
                    const stepObj: Step = { orderNo, hasCode, type, title, stepId };

                    if (hasCode) {
                        const stepFiles = Object.entries(step.files) as Array<[string, any]>;

                        if (stepFiles.length > missionFiles.length) {
                            missionFiles = stepFiles.map(entry => entry[0]);
                        }

                        stepFiles.forEach(file => {
                            const [fileName, fileData] = file;
                            const fileObj: File = { mode: fileData.mode || fileMode.newContents };

                            fileData.answers = fileData.answers || [];
                            fileData.contents = fileData.contents || fileData.contentsWithAnswers;

                            if (fileObj.mode === fileMode.newContents) {
                                const content = insertAnswers(fileData.contents, fileData.answers);
                                const type = langType[parseFileName(fileName).type];

                                fileObj.author = monaco.editor.createModel(content, type);
                            }
                            else if (fileObj.mode === fileMode.modify) {
                                fileObj.author = monaco.editor.createModel(fileData.contents, langType.js);
                            }

                            if (step.type === stepType.code) {
                                fileObj.answers = fileData.answers;
                            }
                            else {
                                fileObj.author = monaco.editor.createModel(fileData.contents, langType[parseFileName(fileName).type]);
                            }

                            stepObj[fileName] = fileObj;
                        });
                    }
                    else if (type === stepType.text) {
                        stepObj.text = step.content.text;
                    }

                    stepList.push(stepObj);
                });

            const transform = (name: string) => parseFileName(name).type.replace('html', 'a').replace('css', 'b').replace('js', 'c');

            missionFiles = missionFiles.sort((a, b) => transform(a) < transform(b) ? -1 : 1);
            missionJson.missionUuid = mission.missionUuid;

            loadStepData(1);
        };
    };
}

function goToStep(targetStepNo: number) {
    debugGroup('goToStep(', targetStepNo, ')');

    if (targetStepNo < 1 || targetStepNo > stepList.length) {
        warn('There is no step ', [targetStepNo, clr.code]);
    }
    else {
        //  write active step to step list
        if (activeStepNo) {
            stepList[activeStepNo - 1] = activeStep;
            log('Stored step ', [activeStepNo, clr.code], ' data');
        }

        loadStepData(targetStepNo);
    }

    console.groupEnd();
}

function loadStepData(targetStepNo: number) {
    debugGroup('loadStepData(', targetStepNo, ')');

    const { tabContainer, btnStepType, btnFileMode, btnModelAnswers } = App.UI;

    if (tabContainer.children.length !== missionFiles.length) {
        removeTabs();
        missionFiles.forEach((fullName, idx) => addTab(fullName, !idx));
    }

    const targetStep = stepList[targetStepNo - 1];
    const tabName = activeTab.innerText;
    const addFileObject = () => stepList[targetStepNo - 1][tabName] = { mode: fileMode.noChange };

    if (targetStep.hasCode) {
        const targetTab = targetStep[activeTab.innerText] || addFileObject();
        const noChange = targetTab.mode === fileMode.noChange;

        if (codeEditor) {
            updateAuthorContent(getAuthorModel(tabName, targetStepNo), noChange);
        }
        else {
            storeAnswers();

            if (targetStep.type === stepType.interactive) {
                diffToAuthor(getAuthorModel(tabName, targetStepNo), false);
                btnModelAnswers.firstElementChild.classList.remove('active-green');
            }
            else {
                diffEditor.setModel(getDiffModels(tabName, targetStepNo));
            }
        }

        btnFileMode.firstElementChild.innerText = iconNames[targetTab.mode];
    }
    else if (targetStep.type === stepType.text) {
        if (diffEditor) {
            storeAnswers();
            diffToAuthor();
            btnModelAnswers.firstElementChild.classList.remove('active-green');
        }

        disableCodeEditor();
    }

    btnStepType.firstElementChild.innerText = iconNames[targetStep.type];

    codexEditor.isReady.then(() => {
        codexEditor.blocks.clear();
        codexEditor.blocks.insert('header', { text: `Step ${targetStepNo}` }, {}, 0);
        codexEditor.blocks.insert('header', { text: targetStep.title }, {}, 1);
    });

    activeStepNo = targetStepNo;
    activeStep = targetStep;

    log('Loaded ', [activeTab.innerText, clr.string], ' tab');
    console.groupEnd();
}

function saveProjectToDisk() {
    if (diffEditor) storeAnswers();

    stepList[activeStepNo - 1] = activeStep;

    missionJson.settings.lastModified = moment().format();

    stepList.forEach((step, stepIndex) => {
        const stepObj = newStepJson({
            title: step.title,
            stepId: step.stepId,
            type: step.type as SingleType,
            orderNo: step.orderNo
        });

        if (step.hasCode) {
            missionFiles.forEach(fileName => {
                const model = getDiffModels(fileName, stepIndex + 1);

                stepObj.files[fileName] = {
                    mode: step[fileName].mode,
                    contents: model.original.getValue().trim()
                };

                if (step.type === stepType.code && step[fileName].answers.length > 0) {
                    stepObj.files[fileName].answers = step[fileName].answers;
                    stepObj.files[fileName].contentsWithAnswers = model.modified.getValue().trim();
                }
            });
        }
        
        missionJson.steps[step.stepId] = stepObj;
    });


    const fileContent = JSON.stringify(missionJson);
    const blob = new Blob([(fileContent)]);
    const fileStream = streamSaver.createWriteStream(`${missionJson.settings.title}.json`, { size: blob.size });

    new Response(fileContent).body
        .pipeTo(fileStream)
        .then(null, err => {
            alert('Save failed');
            console.log(err);
        })
}

// export const asanaTaskSummaryDs = createDerivedState(
//     {
//         [createDerivedState.key]: 'asanaTaskSummaryDs',
//     },
//     async () => {
//         // keep invoking asana API to get summary of all tasks
//         // in batches of 100 items
//     }
// );


// export const asanaMissionTasksDs = createDerivedState(
//     {
//         [createDerivedState.key]: 'asanaMissionTasksDs',
//         missionUuid: createDerivedState.input.uuid,
//         taskSummary: asanaTaskSummaryDs.auto(),
//     },
//     async ({ missionUuid, taskSummary }) => {
//         // Look up the task summary to find the Asana IDs of all tasks
//         // that relate to this missionUuid.
//         // Repeatedly invoke the asana API to get details for each item.
//         // Make sure to handle '429 Too Many Requests' rate limit responses.
//     }
// );

// // Example usage
// // --------------
// const cache = this.services;

// const summaryOfAllTasks = await asanaTaskSummaryDs.get({ cache });

// // Notice how you don't bother specifying the taskSummary as a parameter. 
// // It is automatically accessed via the 'auto' input.
// const missionTasks = await asanaMissionTasksDs.get({ cache, missionUuid: 'abcd' });

function initAsanaAPI() {
    const deprecationHeaders = { "defaultHeaders": { "asana-enable": "new_sections,string_ids" } };
    const asanaClient = asana.Client.create(deprecationHeaders).useAccessToken('0/f2986549b0f0906a2bbe501dabc38a61');

    const workspaceId = '8691139927938';
    let params = {
        'projects.any': '379597955490248',
        'sort_by': 'created_at',
        // 'custom_fields.846373207670449.is_set': true,
        'completed': false,
        'limit': 100
    };

    let summaryList = [];

    const searchWithParam = params => {
        return asanaClient.tasks.searchInWorkspace(workspaceId, params).then(response => {
            response.data.forEach(task => summaryList.push({
                gid: task.gid,
                // missionUuid: task.missionUuid,
                name: task.name
            }));

            if (response.data.length === 100) {
                const lastItemId = response.data[response.data.length - 1].gid;
                
                asanaClient.tasks.findById(lastItemId).then(taskDetail => {
                    params['created_at.before'] = taskDetail.created_at;
                    console.log(taskDetail.created_at);
                    return searchWithParam(params);
                });
            }
            else {
                summaryList = summaryList.sort((a, b) => a.name > b.name ? 1 : -1);
                console.log('Successfully fetched ', summaryList.length, ' items');
                console.log(summaryList);
                return summaryList;
            }
        });
    };

    return searchWithParam(params);
}

//===== STEP OPERATIONS =====//

function createStep(placement: number = activeStepNo - 1, newStepType: SingleType = stepType.code) {
    debugGroup('createNewStep(placement:', placement, ', type:', newStepType, ')');

    const newStep: Step = {
        type: newStepType,
        orderNo: (placement + 1) * 1000
    };

    if (newStepType === stepType.code || newStepType === stepType.interactive) {
        //  step is requried to be consistent with missionFiles
        newStep.hasCode = true;
        //  initialise step files based on missionFiles
        missionFiles.forEach((fullName, idx) => {
            debugGroup('Iteration ', [idx, clr.code], ' on ', ['missionFiles', clr.code]);

            const { type: newFileType } = parseFileName(fullName);
            const content = codeTemplate[newFileType].replace(editablePattern.excludingMarkup, ` step ${placement + 1} ${newFileType} `);
            const model = monaco.editor.createModel(content, langType[newFileType]);

            newStep[fullName] = {
                author: model,
                mode: fileMode.newContents,
                answers: []
            };

            log('Set ', [fullName, clr.string], ' mode to ', [newStep[fullName].mode, clr.string]);
            debugGroup('Set ', [fullName, clr.string], ' content').end(newStep[fullName].author.getValue());
            debugGroup('Set ', [fullName, clr.string], ' answers').end(newStep[fullName].answers);

            console.groupEnd();
        });
    }

    stepList.splice(placement, 0, newStep);

    console.groupEnd();

    return {
        then: (callback: () => any) => callback(),
        go: () => goToStep(placement + 1)
    };
}

function deleteStep(targetStepNo: number = activeStepNo) {
    debugGroup('deleteStep(', targetStepNo, ')');

    if (stepList.length === 1) {
        console.warn('Skipped deleting the only step');
    }
    else {
        stepList.splice(targetStepNo - 1, 1);

        //  if the active step is being deleted
        if (activeStepNo === targetStepNo) {
            //  if active step number is outside of new step list range
            if (activeStepNo > stepList.length) {
                activeStepNo = stepList.length;
            }

            loadStepData(activeStepNo);
        }

        log([`stepList[${targetStepNo - 1}]`, clr.code], ' has been deleted.');
    }

    console.groupEnd();
}

function setStepType(targetType: SingleType) {
    debugGroup('setStepType(', [targetType, clr.string], ')');

    if (diffEditor) {
        diffToAuthor();
        App.UI.btnModelAnswers.firstElementChild.classList.remove('active-green');
    }

    if (targetType === activeStep.type) {
        warn('Step ', [activeStepNo, clr.code], ' is already ', [activeStep.type, clr.string]);
    }
    else {
        if (targetType === stepType.code || targetType === stepType.interactive) {
            const updateStepFile = (fileName: string) => {
                const type = parseFileName(fileName).type;

                activeStep[fileName] = {
                    mode: fileMode.newContents,
                    author: monaco.editor.createModel(codeTemplate[type], langType[type]),
                    answers: []
                };
            };

            if (activeStep.type === stepType.text) {
                removeTabs();
                missionFiles.forEach((fullName, idx) => {
                    updateStepFile(fullName);
                    addTab(fullName, !idx);
                });
                delete activeStep.text;
            }
            else {
                missionFiles.forEach(fullName => updateStepFile(fullName));
            }

            updateAuthorContent(activeStep[activeTab.innerText].author, false);
            activeStep.hasCode = true;
        }
        else if (targetType === stepType.text) {
            activeStep.text = 'text step';
            activeStep.hasCode = false;
            missionFiles.forEach(fullName => delete activeStep[fullName]);
            disableCodeEditor();
        }

        activeStep.type = targetType;
        App.UI.btnStepType.firstElementChild.innerText = iconNames[targetType];
    }

    console.groupEnd();
}

function switchTab(evt: MouseEvent) {
    debugGroup('switchTab()');

    const targetTab = evt.target as Tab;

    if (targetTab.classList.contains('active')) {
        warn('Skipped switching to the active tab.');
    }
    else {
        const targetTabName = targetTab.innerText;
        const targetFile = activeStep[targetTabName];

        if (codeEditor) {
            updateAuthorContent(getAuthorModel(targetTabName), targetFile.mode === fileMode.noChange);
        }
        else {
            storeAnswers();
            diffEditor.setModel(getDiffModels(targetTabName));
        }

        activeTab.classList.remove('active');
        targetTab.classList.add('active');

        activeTab = targetTab;

        App.UI.btnFileMode.firstElementChild.innerText = iconNames[targetFile.mode];
        log('Loaded ', [targetTabName, clr.string], ' tab');
    }

    console.groupEnd();
}

function addTab(label: string, active: boolean) {
    const tab = el(App.UI.tabContainer).addNew('span', { className: `${active ? 'active ' : ''}tab`, innerText: label });

    log('Added ', tab);

    if (active) {
        activeTab = tab;
        log('Set to active.');
    }

    tab.type = missionFiles.includes(label) ? parseFileName(label).type : null;
    tab.addEventListener('click', switchTab);
}

function removeTabs() {
    const { tabContainer } = App.UI;

    while (tabContainer.children.length > 0) {
        tabContainer.removeChild(tabContainer.firstElementChild);
    }

    log('Cleared tabs.');
}

function diffToAuthor(model?: monaco.editor.IModel, readOnly?: boolean) {
    diffEditor.dispose();
    diffEditor = null;
    codeEditor = monaco.editor.create(App.UI.codeContainer, { scrollBeyondLastLine: false });
    
    if (model) updateAuthorContent(model, readOnly);
    codeEditor.onDidChangeModelContent(() => refreshOutput(false));
}

function updateAuthorContent(model: monaco.editor.IModel, readOnly?: boolean) {
    codeEditor.setModel(model);
    codeEditor.focus();
    if (readOnly !== undefined) codeEditor.updateOptions({ readOnly });
}

function disableCodeEditor() {
    removeTabs();
    addTab('Disabled', true);
    updateAuthorContent(monaco.editor.createModel('Code editor is disabled for text steps'), true);
}

function toggleOutput() {
    console.group('toggleOutput');

    if (activeStep.hasCode) {
        const { pnlPreview, btnToggleOutput } = App.UI;
        
        if (App.UI.pnlPreview.classList.contains('hidden')) {
            pnlPreview.iframe = el(pnlPreview).addNew('iframe');
            refreshOutput();
            pnlPreview.classList.remove('hidden');
            btnToggleOutput.firstElementChild.classList.add('active-blue');
        }
        else hideOutput();
    }
    else {
        warn('The output panel is not available for ', [activeStep.type, clr.string], ' steps');
    }

    console.groupEnd();
}

function hideOutput() {
    const { pnlPreview, btnToggleOutput } = App.UI;

    el(pnlPreview).remove(pnlPreview.iframe);
    pnlPreview.classList.add('hidden');
    btnToggleOutput.firstElementChild.classList.remove('active-blue');
}

function refreshOutput(now: boolean = true) {
    debugGroup('refreshOutput(now =', now, ')');

    const { pnlPreview } = App.UI;

    if (pnlPreview.iframe) {
        const refresh = () => {
            let srcHtml = getAuthorOrLearnerContent('index.html');
            const linkAndScript = srcHtml.match(/<link\s+[\s\S]*?>|<script[\s\S]*?>[\s\S]*?<\/script\s*>/gi);
        
            linkAndScript.forEach((node: any) => {
                const tree = new HTMLTree(node);
        
                if (tree.error) {
                    warn('Error: ', [tree.error, clr.string]);
                }
                else {
                    node = tree[0];
            
                    const tagType = node.openingTag.tagName;
                    const attrType = tagType === 'link' ? 'href' : tagType === 'script' ? 'src' : '';
                    const attrValue = node.openingTag.attrs.filter(attr => attr.name === attrType)[0].value;
                    const isPrivateFile = activeStep.hasOwnProperty(attrValue);
                    const nodeRaw = `${node.openingTag.raw}${node.rawContent}${node.closingTag.raw}`;
                    const { type } = parseFileName(attrValue);
            
                    if (isPrivateFile) {
                        if (/^(css|js)$/.test(type)) {
                            const isCss = type === 'css';
                            const replaceTarget = isCss ? node.openingTag.raw : nodeRaw;
                            const newTag = isCss ? 'style' : 'script';
                            const content = getAuthorOrLearnerContent(attrValue).trim().split('\n').map(line => `\t\t\t${line}`).join('\n');
            
                            srcHtml = srcHtml.replace(replaceTarget, `<${newTag}>\n${content}\n\t\t</${newTag}>`);
                        }
                    }
                    else {
                        log([nodeRaw, clr.string], ' points to external file');
                    }
                }
            });
        
            srcHtml = srcHtml
                //  transform relative platform paths to absolute paths
                .replace(/(['"])\s*(\/resources\/)/g, '$1https://app.bsd.education$2')
                //  remove editable markup
                .replace(editablePattern.justMarkup, '');
        
            pnlPreview.iframe.srcdoc = srcHtml;
            log('Output panel refreshed');
        };
    
        if (now) refresh();
        else {
            if (refreshTimer) clearTimeout(refreshTimer);
            refreshTimer = setTimeout(refresh, refreshDelay);
        }
    }

    console.groupEnd();
}

function getAuthorOrLearnerContent(tabName: string, stepNo: number = activeStepNo): string {
    const isActive = activeTab.innerText === tabName;
    let result: monaco.editor.IModel;

    if (isActive) {
        result = codeEditor || diffEditor.getModel().modified
    }
    else if (codeEditor) {
        result = stepList[stepNo - 1][tabName].author;
    }
    else {
        result = getDiffModels(tabName, stepNo).modified;
    }

    return result.getValue();
}

//===== FILE OPERATIONS =====//

function setFileMode(targetMode: SingleMode) {
    debugGroup('setFileMode(', [targetMode, clr.string], ')');

    if (activeStep.type === stepType.code) {
        const currentMode = activeStep[activeTab.innerText].mode;

        if (currentMode === targetMode) {
            warn([activeTab.innerText, clr.string], ' tab is already in ', [targetMode, clr.string], ' mode.');
        }
        else if (activeStepNo === 1 && targetMode !== fileMode.newContents) {
            warn([targetMode, clr.string], ' mode can not be applied to files in the first step');
        }
        else {
            const newContents = targetMode === fileMode.newContents;
            const noChange = targetMode === fileMode.noChange;
            const type = langType[targetMode === fileMode.modify ? 'js' : activeTab.type];
            let content = newContents ? codeTemplate[activeTab.type] : codeTemplate.transition;
            let answers = [];

            activeStep[activeTab.innerText].mode = targetMode;

            if (noChange) {
                const data = resolveAuthorContent();

                content = data.resolvedContent;
                answers = data.answers;
            }

            const model = monaco.editor.createModel(content, type);

            activeStep[activeTab.innerText].author = model;
            activeStep[activeTab.innerText].answers = answers;

            if (diffEditor) {
                diffToAuthor();
                App.UI.btnModelAnswers.firstElementChild.classList.remove('active-green');
            }

            updateAuthorContent(model, noChange);
            App.UI.btnFileMode.firstElementChild.innerText = iconNames[targetMode];
        }
    }
    else {
        warn('File mode options are not available for ', [activeStep.type, clr.string], ' steps');
    }

    console.groupEnd();
}

function toggleAnswerEditor() {
    debugGroup('toggleAnswerEditor()');

    if (activeStep.type === stepType.code) {
        const { codeContainer, btnModelAnswers } = App.UI;

        if (codeEditor) {
            const diffModels = getDiffModels();

            codeEditor.dispose();
            codeEditor = null;

            diffEditor = monaco.editor.createDiffEditor(codeContainer, { scrollBeyondLastLine: false });
            diffEditor.setModel(diffModels);
            
            setTimeout(() => diffEditor.onDidUpdateDiff(() => refreshOutput(false)), 100);

            btnModelAnswers.firstElementChild.classList.add('active-green');
        }
        else {
            storeAnswers();
            diffToAuthor(getAuthorModel(), activeStep[activeTab.innerText].mode === fileMode.noChange);
            btnModelAnswers.firstElementChild.classList.remove('active-green');
        }

        refreshOutput();
    }
    else {
        warn('Answers editor is not available for ', [activeStep.type, clr.string], ' steps');
    }

    console.groupEnd();
}

function storeAnswers(tabName: string = activeTab.innerText) {
    const { modified: modelWithAnswers } = diffEditor.getModel();
    const answers = modelWithAnswers.getValue().match(editablePattern.excludingMarkup) || [];

    answers.forEach((answer: string, idx: number) => {
        if (answer && answer.trim().length && answer !== activeStep[tabName].answers[idx]) {
            activeStep[tabName].answers[idx] = answer;
            log('Editable ', [idx, clr.code], ' answer updated: ', [`"${answer}"`, clr.string]);
        }
    });
}

function getAuthorModel(tabName: string = activeTab.innerText, stepNo: number = activeStepNo) {
    const step = stepList[stepNo - 1];

    if (step[tabName].mode === fileMode.noChange) {
        const content = resolveAuthorContent(tabName, stepNo).resolvedContent;
        const type = langType[parseFileName(tabName).type];

        return monaco.editor.createModel(content, type);
    }

    return step[tabName].author;
}

function getDiffModels(tabName: string = activeTab.innerText, stepNo: number = activeStepNo) {
    const { resolvedContent: authorTabContent, answers } = resolveAuthorContent(tabName, stepNo);
    const learnerContent = getLearnerView(authorTabContent, answers);
    const contentWithAnswers = insertAnswers(authorTabContent, answers);
    const type = langType[parseFileName(tabName).type];

    return {
        original: monaco.editor.createModel(learnerContent, type),
        modified: monaco.editor.createModel(contentWithAnswers, type)
    };
}

function resolveAuthorContent(tabName: string = activeTab.innerText, targetStepNo: number = activeStepNo) {
    debugGroup('resolveTabContent(', [tabName, clr.string] ,')');

    const activeFile: File = (targetStepNo === activeStepNo ? activeStep : stepList[targetStepNo - 1])[tabName];
    let result: { resolvedContent: string, answers: Array<string> | [] };

    if (activeFile.mode === fileMode.newContents) {
        log('No resolution needed for step ', [targetStepNo, clr.code]);
        result = { resolvedContent: activeFile.author.getValue(), answers: activeFile.answers };
    }
    else {
        const relevantSteps = [];

        stepList
            .slice(0, targetStepNo)
            .reverse()
            .filter(step => step.type === stepType.code)
            .some(step => {
                relevantSteps.unshift(step);
                log('Step ', [step.orderNo / 1000, clr.code], ' is relevant: ', [step[tabName].mode, clr.string]);
                return step[tabName].mode === fileMode.newContents;
            });

        const staticContent = relevantSteps.shift()[tabName];

        if (relevantSteps.length) {
            let resolvedContent = insertAnswers(staticContent.author.getValue(), staticContent.answers);
            let errorMessage: string;

            const insertLine = (code: string | Array<string>, key: string, options: { line: string, offset?: number }) => {
                key = key.replace(/\+/, '\\+');

                const match = (code as string).match(new RegExp(key, 'g'));

                if (!match) log(`step logic failed: '${key}' can not be found.`);
                else if (match.length > 1) log(`step logic failed: '${key}' is not unique.`);
                else {
                    code = (code as string).split(/\r?\n/);

                    code.some((e, i) => {
                        const query = new RegExp(key).test(e);

                        if (query) {
                            const defaultOptions = { line: '', offset: 0 };
                            const opt = Object.assign({}, defaultOptions, options);

                            (code as Array<string>).splice(i + 1 + opt.offset, 0, opt.line);
                            // log(`Adding [${opt.line}] after line ${i + 1}`);
                            return query;
                        }
                    });

                    return code.join('\n');
                }
            }

            result = {
                resolvedContent: staticContent.author.getValue(),
                answers: staticContent.answers
            }

            relevantSteps.some((step, idx) => {
                const stepNo = step.orderNo / 1000;
                const answers = step[tabName].answers;

                if (step[tabName].mode === fileMode.modify) {
                    const transitionLogic = step[tabName].author.getValue();
                    const applyTransition = new Function('codeWithoutMarkup', 'insertLine', transitionLogic);

                    debugGroup('Resolving ', [tabName, clr.string], ' tab in step ', [stepNo, clr.code]).end(transitionLogic);

                    try {
                        resolvedContent = applyTransition(removeEditableMarkup(resolvedContent), insertLine);

                        if (idx < relevantSteps.length - 1) {
                            resolvedContent = insertAnswers(resolvedContent, answers);
                        }
                        else result = { resolvedContent, answers };

                        if (typeof resolvedContent !== 'string') {
                            errorMessage = `Transition logic in step ${stepNo} does not return a string`;
                        }
                        else {
                            debugGroup('Resolved content for step ', [stepNo, clr.code]).end(resolvedContent);
                        }
                    }
                    catch (err) {
                        errorMessage = err.toString();
                        warn(err);
                    }

                    return errorMessage;
                }
                else {
                    result.answers = answers;
                    log('No resolution needed for step ', [stepNo, clr.code]);
                }
            });

            if (errorMessage) {
                return result = {
                    resolvedContent: errorMessage,
                    answers: []
                };
            }
        }
    }

    console.groupEnd();
    return result;
}

//===== CODE OPERATIONS =====//

function insertAnswers(authorContent: string, answers: Array<string>) {
    if (answers && answers.length) {
        const codeChunks = authorContent.split(editablePattern.excludingMarkup);
        return codeChunks.map((chunk: string, idx: number) => `${chunk}${answers[idx] || ''}`).join('');
    }

    return authorContent;
}

function getLearnerView(content: string, answers: Array<string>) {
    const editableContents = content.match(editablePattern.excludingMarkup);

    if (editableContents) {
        const codeChunks = content.split(editablePattern.excludingMarkup);

        return codeChunks.map((chunk, idx) => {
            const editableContent = editableContents[idx];
            const meaningfulContent = editableContent && editableContent.trim().length;
            const clearEditable = meaningfulContent && (answers[idx] === undefined || editableContent === answers[idx]);

            return `${chunk}${clearEditable ? '    ' : editableContent || ''}`;
        }).join('');
    }

    return content;
}

function removeEditableMarkup(content: string) {
    return content.replace(/#(BEGIN|END)_EDITABLE#/g, '');
}

function removeJsComments(content: string) {
    return content.replace(/\s*\/\/.*/g, '');
}

//===== GLOBAL =====//

function parseFileName(label: string = activeTab.innerText) {
    const [match, name, type] = label.match(/\/?(.*)\.(.*)$/);
    return { match, name, type };
}

function rt(segments: RichText) {
    const plain = segments.every(segment => !Array.isArray(segment));

    if (plain) {
        return segments;
    }
    else {
        let message = '';
        const styles = [];

        segments.forEach(segment => {
            if (Array.isArray(segment)) {
                const [content, rule] = segment;
                let ruleString = '';

                message += `%c${content}`;

                obj(rule).forEachEntry((prop, val) => {
                    ruleString += `${prop}:${val};`;
                });

                styles.push(ruleString);
            }
            else if (typeof segment === 'string') {
                message += `%c${segment}`;
                styles.push('color: gainsboro;');
            }
        });
        return [message, ...styles];
    }
}

function log(...segments: RichText) {
    if (!consoleDebug) return;
    console.log(...rt(segments));
}

function warn(...segments: RichText) {
    if (!consoleDebug) return;
    console.warn(...rt(segments));
}

function debugGroup(...segments: RichText) {
    console[`group${consoleFold ? 'Collapsed' : ''}`](...rt(segments));

    return {
        end: (...endSegments: RichText) => {
            if (endSegments.length) {
                console.log(...endSegments);
            }
            console.groupEnd();
        }
    };
}
