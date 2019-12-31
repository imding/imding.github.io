//  https://basarat.gitbooks.io/typescript/content/docs/project/globals.html

import './styles/main.scss';
import * as esprima from 'esprima';
import * as streamSaver from 'streamsaver';
import * as favicon from './images/favicon.png';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import * as moment from 'moment';
import * as asana from 'asana';
import * as EditorJS from './components/CodeX/editor';

import Header from './components/CodeX/Header';
import Paragraph from './components/CodeX/Paragraph';
import Image from './components/CodeX/Image';
import InlineCode from './components/CodeX/InlineCode';
import List from './components/CodeX/List';
import Code from './components/CodeX/Code';
import Objective from './components/CodeX/Objective';
import { HtmlGlossary, CssGlossary, JsGlossary } from './components/CodeX/Glossary';

import { el, newEl, obj, RichText, uid, decamelise } from './components/Handy';
import { newMissionJson, newStepJson } from './components/JsonTemplates';
import tooltip from './components/Tooltip';
import subMenu from './components/SubMenu';
import HTMLTree from './components/HTMLTree';

// const EditorJS = require('@editorjs/editorjs');

const consoleDebug = true;
const consoleFold = true;
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

const asanaWorkspaceId = '8691139927938';
const feedbackProjectId = '379597955490248';
// const asanaClient = initAsanaAPI();

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
    stepId?: string,
    content?: {
        instructions?: any,
        text?: string,
        startTab?: string,
    },
    tests?: any
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

const bsdMarkup = {
    any: /##ANY##/,
    string: /##STRING##/
};

const editablePattern = {
    //  the 'positive lookbehind' syntax has limited compatibility
    excludingMarkup: /(?<=#BEGIN_EDITABLE#)[\s\S]*?(?=#END_EDITABLE#)/g,
    includingMarkup: /#BEGIN_EDITABLE#([\s\S]*?)#END_EDITABLE#/g,
    justMarkup: /#(BEGIN|END)_EDITABLE#/g
};

const codeTemplate = {
    html: '<!DOCTYPE html>\n<html>\n\n\t<head>\n\t\t<link rel="stylesheet" href="style.css" />\n\t</head>\n\n\t<body>\n\n\t\t#BEGIN_EDITABLE#<h1>Welcome to HTML</h1>#END_EDITABLE#\n\n\t\t<script src="script.js"></script>\n\n\t</body>\n\n</html>\n',
    css: '/* CSS */\n\n* {\n\tmargin: 0;\n\tbox-sizing: border-box;\n}\n',
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

const cachePrefix = 'mission:';
const cacheInterval = 100;

let pkey;
let altKey;
let focus;

//===== INIT APP =====//

window.onload = init;

function init() {
    console.groupCollapsed('Initialising app...');

    resetApp();
    addFavIcon();
    assembleUI();
    createStep(0).go();

    const registerCompletion = lang => monaco.languages.registerCompletionItemProvider(lang, {
        provideCompletionItems: (model, position) => ({
            suggestions: [{
                label: 'Editable',
                kind: monaco.languages.CompletionItemKind.Text,
                insertText: '#BEGIN_EDITABLE# ${1:content} #END_EDITABLE#',
                range: {
                    startLineNumber: position.lineNumber,
                    startColumn: position.column - 1,
                    endLineNumber: 0,
                    endColumn: 0
                },
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
            }]
        })
    });

    ['html', 'css', 'javascript'].forEach(lang => registerCompletion(lang));

    monaco.languages.html.htmlDefaults.setOptions({
        format: {
            tabSize: 4,
            insertSpaces: false,
            wrapLineLength: 0,
            unformatted: '',
            contentUnformatted: '',
            indentInnerHtml: true,
            preserveNewLines: true,
            maxPreserveNewLines: 1,
            indentHandlebars: true,
            endWithNewline: true,
            extraLiners: '',
            wrapAttributes: 'auto',
        }
    });

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

    setInterval(() => {
        if (missionJson.settings.autoSave) cacheProject();
    }, cacheInterval * 1000);

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

            pnlLeft: el('section', { id: 'left-panel' }),
            pnlPreview: el('section', { id: 'preview-panel', className: 'hidden' }),
            pnlActions: el('section', { id: 'actions-panel' }),
            pnlCode: el('section', { id: 'code-panel' }),

            btnProjectSettings: null,
            btnOpenProject: null,
            btnSaveProject: null,
            btnCopyJson: null,
            btnContinue: null,
            btnTickets: null,

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
            btnRefreshOutput: null,
            btnToggleOutputSize: null,

            stepInfo: el('span', { id: 'step-info' }),
            tabContainer: el('div', { id: 'code-tabs' }),
            codeContainer: el('div', { id: 'code-editor' }),
        },
        output: { large: false },
        settings: {
            opened: false,
            unsavedChanges: false,
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
        pnlLeft: [self, {
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
                            btnContinue: [el('div', {}), { icon: el('i', { className: 'material-icons', innerText: 'unarchive' }) }],
                            btnTickets: [el('div', {}), { icon: el('i', { className: 'material-icons', innerText: 'assignment_late' }) }]
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
                            btnToggleOutput: [el('div', {}), { icon: el('i', { className: 'material-icons', innerText: 'visibility' }) }],
                            btnRefreshOutput: [el('div', { className: 'hidden' }), { icon: el('i', { className: 'material-icons active-blue mini', innerText: 'autorenew' }) }],
                            btnToggleOutputSize: [el('div', { className: 'hidden' }), { icon: el('i', { className: 'material-icons active-blue mini', innerText: 'zoom_in' }) }],
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
        tip: 'open JSON file containing a valid mission data structure'
    }, {
        tool: App.UI.btnSaveProject,
        heading: 'save',
        tip: 'save the current project to disk as a JSON file'
    }, {
        tool: App.UI.btnCopyJson,
        heading: 'copy json',
        tip: 'produce input data for the "Import JSON" feature on BSD Online'
    }, {
        tool: App.UI.btnContinue,
        heading: 'continue',
        tip: 'load a project from browser local storage, this will overwite the current project'
    }, {
        tool: App.UI.btnTickets,
        heading: 'tickets',
        tip: 'display issue tickets regarding this project'
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
        tip: 'display the next step'
    }, {
        tool: App.UI.btnPrevStep,
        heading: 'previous',
        tip: 'display the previous step'
    }, {
        tool: App.UI.btnStepType,
        heading: 'type',
        tip: 'change the current step type'
    }, {
        tool: App.UI.btnStepOrder,
        heading: 'order',
        tip: 'view and rearrange the order of steps'
    }, {
        tool: App.UI.btnTemplates,
        heading: 'templates',
        tip: 'insert a template into the instruction panel'
    }, {
        tool: App.UI.btnObjectives,
        heading: 'generate objectives',
        tip: 'insert objectives into the instruction panel'
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
        tip: 'choose the method by which the code for the current tab is defined'
    }, {
        tool: App.UI.btnModelAnswers,
        heading: 'edit answers',
        tip: 'show and hide the model answer panel'
    }, {
        tool: App.UI.btnToggleOutput,
        heading: 'output',
        tip: 'show and hide the code output preview panel'
    }, {
        tool: App.UI.btnRefreshOutput,
        heading: 'refresh',
        tip: 'reevaluate the code and refresh the output'
    }, {
        tool: App.UI.btnToggleOutputSize,
        heading: 'adjust size',
        tip: 'adjust the size of the output window'
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
            //  need to define tools as an object with `class` property
            //  to access inline tools
            paragraph: {
                class: Paragraph
            },
            inlineCode: {
                class: InlineCode,
                shortcut: 'CMD+D'
            },
            image: Image,
            list: {
                class: List,
                inlineToolbar: true
            },
            code: Code,
            objective: {
                class: Objective,
                inlineToolbar: true,
                config: {
                    getTabs: () => Array.from(App.UI.tabContainer.querySelectorAll('.tab')),
                    getActiveStep: () => activeStep,
                    getActiveTab: () => activeTab.innerText,
                    getDiffModels,
                    stepType,
                    fileMode,
                    editablePattern,
                },
            },
            htmlGlossary: HtmlGlossary,
            cssGlossary: CssGlossary,
            jsGlossary: JsGlossary,
        },
    });

    codeEditor = monaco.editor.create(codeContainer, { theme: 'vs-dark', scrollBeyondLastLine: false, formatOnPaste: true });

    registerTopLevelEvents();
}

function registerTopLevelEvents() {
    const {
        pnlActions, pnlPreview,
        btnProjectSettings, btnOpenProject, btnSaveProject, btnCopyJson, btnContinue, btnTickets,
        btnNewStep, btnDelStep, btnNextStep, btnPrevStep,
        btnGetPrev, btnGetNext, btnModelAnswers, btnToggleOutput, btnRefreshOutput, btnToggleOutputSize
    } = App.UI;

    pnlActions.addEventListener('scroll', () => {
        const actionPanelScrolled = new Event('actionPanelScrolled');
        window.dispatchEvent(actionPanelScrolled);
    });

    btnProjectSettings.addEventListener('click', toggleSettings);
    btnOpenProject.addEventListener('click', openProjectFromJson);
    btnSaveProject.addEventListener('click', saveProjectToDisk);
    btnCopyJson.addEventListener('click', copyMissionJson);
    btnContinue.addEventListener('click', loadFromCache);
    // btnTickets.addEventListener('click', fetchAsanaTickets);

    btnNewStep.addEventListener('click', () => createStep(activeStepNo).go());
    btnDelStep.addEventListener('click', () => deleteStep(activeStepNo));
    btnNextStep.addEventListener('click', () => goToStep(activeStepNo + 1));
    btnPrevStep.addEventListener('click', () => goToStep(activeStepNo - 1));

    btnGetPrev.addEventListener('click', () => mirrorTabContent(activeStepNo - 1));
    btnGetNext.addEventListener('click', () => mirrorTabContent(activeStepNo + 1));
    btnModelAnswers.addEventListener('click', toggleAnswerEditor);
    btnToggleOutput.addEventListener('click', toggleOutput);
    btnRefreshOutput.addEventListener('click', refreshOutput);
    btnToggleOutputSize.addEventListener('click', toggleOutputSize);

    window.onresize = () => (codeEditor || diffEditor).layout();
    window.onkeydown = (event: KeyboardEvent) => {
        // disable F5 key
        if (/F5|ControlLeft/.test(event.code)) {
            event.preventDefault();
            return;
        }

        // handle right alt key
        else if (event.code == 'AltRight' && !altKey) {
            altKey = true;
            focus = document.activeElement;
            focus.blur();
        }

        // handles shortcut combos
        if (altKey && event.code != pkey) {
            event.preventDefault();

            switch (event.code) {
                case 'Digit0': break;
                case 'Digit1': break;
                case 'Digit2': break;

                case 'Slash': break;
                case 'KeyM': toggleOutputSize(); break;
                case 'KeyN': btnNewStep.click(); break;
                case 'KeyP': pnlPreview.classList.contains('hidden') ? toggleOutput() : refreshOutput(); break;
                case 'KeyL': break;
                case 'KeyK': break;
                case 'KeyI': break;
                case 'KeyO': break;
                case 'KeyG': break;
                case 'Backspace': hideOutput(); break;
                case 'BracketLeft': btnPrevStep.click(); break;
                case 'BracketRight': btnNextStep.click(); break;
                case 'Minus': activeTab.previousElementSibling && (activeTab.previousElementSibling as HTMLElement).click(); break;
                case 'Equal': activeTab.nextElementSibling && (activeTab.nextElementSibling as HTMLElement).click(); break;
                case 'Period': btnGetPrev.click(); break;
                case 'Comma': btnGetNext.click(); break;
                case 'Backslash': break;
            }

            // LIST OF KEYS TO ALLOW REPEATED PRESS
            pkey = event.code.replace(/KeyP|KeyL|KeyI|KeyM|BracketLeft|BracketRight|Minus|Equal|Backslash/, '');
        }
    };
    window.onkeyup = (event: KeyboardEvent) => {
        if (event.code === 'AltRight') {
            focus.focus();
            altKey = false;
        }
    };
}

//===== PROJECT OPERATIONS =====//

function toggleSettings() {
    if (App.root.querySelector('#settings-container')) {
        return alert('Settings window is already open');
    }

    const { title, majorRevision, minorRevision, cardImage } = missionJson.settings;
    const settings = {
        container: el('div', { id: 'settings-container' }),
        inputs: {
            projectName: el('input', { value: title }),
            projectVersion: el('input', { value: `${majorRevision}.${minorRevision}` }),
            projectCard: el('input', { value: cardImage })
        },
        togglesContainer: el('div', { id: 'toggles-container' }),
        toggles: {
            autoSave: el('div', { className: 'material-icons toggle' }),
            searchable: el('div', { className: 'material-icons toggle' })
        },
        actionsPanel: el('div', { id: 'settings-actions' }),
        btnSave: el('button', { id: 'save-settings', className: 'material-icons', innerText: 'check' }),
        btnCancel: el('button', { id: 'cancel-settings', className: 'material-icons', innerText: 'close' })
    };
    const saveAndCloseSettings = () => {
        const name = settings.inputs.projectName.value.trim();
        const version = settings.inputs.projectVersion.value.trim();
        const cardImage = settings.inputs.projectCard.value.trim();

        if (/\d+\.\d+/.test(version)) {
            const [majorRevision, minorRevision] = version.split('.');

            if (majorRevision < missionJson.settings.majorRevision) {
                return alert(`Major version number can not be smaller than ${missionJson.settings.majorRevision}`);
            }
            else if (majorRevision === missionJson.settings.majorRevision) {
                if (minorRevision < missionJson.settings.minorRevision) {
                    return alert(`Minor version number can not be smaller than ${missionJson.settings.minorRevision}`);
                }
            }

            const title = name === '' ? uid('Project') : name;

            Object.assign(missionJson.settings, {
                title,
                missionName: title.toLowerCase().replace(/\s/g, '-').replace(/[^a-zA-z0-9-\s]/g, ''),
                majorRevision: Number(majorRevision),
                minorRevision: Number(minorRevision),
                revision: `(${majorRevision},${minorRevision})`,
                cardImage
            });

            settings.container.remove();

            App.settings.opened = false;
            App.settings.unsavedChanges = false;

            App.UI.pnlCode.classList.remove('dim');
        }
        else return alert('Version number format should be [number].[number]');
    };
    const closeSettings = () => {
        if (App.settings.unsavedChanges && confirm('"OK" to save changes, "CANCEL" to discard.')) {
            return saveAndCloseSettings();
        }

        settings.container.remove();

        App.settings.opened = false;

        App.UI.pnlCode.classList.remove('dim');
    };
    const registerChange = () => {
        if (App.settings.unsavedChanges) {
            return removeInputListeners();
        }

        App.settings.unsavedChanges = true;
    };
    const removeInputListeners = () => {
        for (const key in settings.inputs) {
            settings.inputs[key].removeEventListener('input', registerChange);
        }
    };

    for (const key in settings.toggles) {
        const toggleContainer = el('div', { className: 'toggle-item' });

        toggleContainer.append(
            el('p', { innerText: decamelise(key) }),
            settings.toggles[key]
        );
        settings.togglesContainer.append(toggleContainer);

        settings.toggles[key].innerText = `check_box${missionJson.settings[key] ? '' : '_outline_blank'}`
        settings.toggles[key].addEventListener('click', () => {
            missionJson.settings[key] = !missionJson.settings[key];
            settings.toggles[key].innerText = `check_box${missionJson.settings[key] ? '' : '_outline_blank'}`;
        });
    }

    settings.container.append(
        el('p', { innerText: 'Project Name' }),
        settings.inputs.projectName,
        el('p', { innerText: 'Version' }),
        settings.inputs.projectVersion,
        el('p', { innerText: 'Card Image' }),
        settings.inputs.projectCard,
        settings.togglesContainer,
        settings.actionsPanel,
    );

    settings.actionsPanel.append(settings.btnSave, settings.btnCancel);
    settings.btnSave.addEventListener('click', saveAndCloseSettings);
    settings.btnCancel.addEventListener('click', closeSettings);

    for (const key in settings.inputs) {
        settings.inputs[key].addEventListener('input', registerChange);
    }

    App.root.append(settings.container);
    App.settings.opened = true;
    App.UI.pnlCode.classList.add('dim');
}

function openProjectFromJson() {
    const fileInput = newEl('input', { type: 'file', accept: '.json' }) as HTMLInputElement;
    fileInput.click();
    fileInput.onchange = () => {
        const reader = new FileReader();

        reader.readAsText(fileInput.files[0], 'UTF-8');
        reader.onload = () => parseAndLoadJson(JSON.parse(reader.result as string));
    };
}

function parseAndLoadJson(mission) {
    stepList = [];
    missionFiles = [];

    //  FIXME: obj().sort() shouldn't convert object to array
    const missionSteps = obj(mission.steps).sort('values', (a, b) => a.orderNo - b.orderNo).filter(step => !step.deleted);
    const transformString = string => {
        const glossaryPattern = /^#glossary\/(html|css|javascript)\/(.*)$/;
        const nodes = new HTMLTree(string).map(node => {
            if (node.type === 'text') return node.raw;

            const tagName = node.openingTag.tagName;
            const rawNode = `${node.openingTag.raw}${node.isVoid ? '' : `${node.rawContent}${node.closingTag.raw}`}`;

            if (tagName === 'a') {
                const hrefs = node.openingTag.attrs.filter(attr => attr.name === 'href');

                if (hrefs.length === 0) return node.rawContent;
                else if (hrefs.length > 1) {
                    throw warn('Multiple "href" attribute found');
                }

                const details = hrefs[0].value.match(glossaryPattern);

                if (details) {
                    //  IMPORTANT: class name led by "glossary" followed by "[type]-glossary"
                    return `<span class="glossary ${details[1]}-glossary" accesskey="${details[2]}">${node.content[0].rawCollapsed}</span>`;
                }
                else return rawNode;
            }
            else if (tagName === 'code') {
                return `<code class="syntax">${node.rawContent}</code>`;
            }
            else return rawNode;
        });

        return nodes.join('');
    };
    const transformContentObject = content => {
        const isEmpty = node => node.content.every(node => {
            const allBreak = node.openingTag && /br/.test(node.openingTag.tagName);
            const allSpace = node.type === 'text' && node.rawCollapsed.replace(/&nbsp;/g, '').length === 0;

            return allBreak || allSpace;
        });
        const parseAndTransform = (string, mapping) => new HTMLTree(string).map(mapping).filter(node => node);
        const transformImage = node => ({
            stretched: false,
            url: getAttrValue('src', node),
            withBackground: false,
            withBorder: false
        });

        if (content.text) content.text = parseAndTransform(content.text, node => {
            const nodeType = node.openingTag.tagName;

            if (nodeType === 'p') {
                return isEmpty(node) ? null : {
                    type: 'paragraph',
                    data: { text: node.rawContent }
                }
            }
            else if (nodeType === 'img') {
                return {
                    type: 'image',
                    data: transformImage(node)
                }
            }

            return;
        })
        else content.instructions = parseAndTransform(content.instructions, node => {
            const nodeType = node.openingTag.tagName;

            if (nodeType === 'p') {
                return isEmpty(node) ? null : {
                    type: 'paragraph',
                    data: { text: transformString(node.rawContent) }
                };
            }
            else if (nodeType === 'img') {
                return {
                    type: 'image',
                    data: transformImage(node)
                }
            }
            else if (nodeType === 'ul') {
                return {
                    type: 'list',
                    data: {
                        style: 'unordered',
                        items: node.content.map(item => transformString(item.content[0].rawContent || item.content[0].rawCollapsed))
                    }
                }
            }
            else if (nodeType === 'code') {
                console.log(node);
            }
        });

        return content;
    };
    const transformTests = tests => {
        const objectiveBlocks = tests
            .filter(test => test.orderNo >= 0)
            .sort((a, b) => a.orderNo - b.orderNo)
            .map(test => {
                const { title, testFunction } = test;
                const testTree = esprima.parseScript(testFunction);
                const passSyntax = testTree.body.reduce((acc, node) => {
                    const cutTail = () => {
                        const { type } = node;

                        if (type === 'ExpressionStatement') {
                            const expType = node.expression.type;

                            node = node.expression;
                            return { type, expType };
                        }
                        if (type === 'CallExpression') {
                            const { arguments: args } = node;

                            if (args.length === 1) {
                                const { callee } = node;

                                if (args[0].type === 'Literal') {
                                    node = callee.object;
                                    return {
                                        type,
                                        name: callee.property.name,
                                        arg: typeof args[0].value === 'string' ? args[0].raw : args[0].value
                                    };
                                }
                                else if (args[0].type === 'TemplateLiteral') {
                                    if (args[0].expressions.length === 0) {
                                        node = callee.object;
                                        return {
                                            type,
                                            name: callee.property.name,
                                            arg: args[0].quasis[0].value.raw
                                        };
                                    }
                                }
                            }
                        }
                        else if (type === 'MemberExpression') {
                            const { object, property } = node;

                            node = object;

                            return {
                                type,
                                name: property.name,
                            };
                        }
                        else if (type === 'Identifier') {
                            const details = { type, name: node.name };

                            node = null;

                            return details;
                        }
                        else return ({});
                    };
                    let chunk = cutTail();

                    if (chunk.type === 'ExpressionStatement' && chunk.expType === 'CallExpression') {
                        chunk = cutTail();

                        if (chunk.type === 'CallExpression') {
                            const checkLiveTest = () => {
                                if (chunk.name === 'on') {
                                    if (/^(pass|fail)$/.test(cutTail().name)) {
                                        acc.push({ live: true });
                                    }
                                }
                            };

                            if (chunk.name === 'equivalent') {
                                const answer = chunk.arg;
                                const findEditableIndex = () => {
                                    const { type, name, arg } = cutTail();
                                    return type === 'CallExpression' && name === 'editable' ? arg : findEditableIndex();
                                };
                                const editableIndex = findEditableIndex();

                                if (Number.isInteger(editableIndex)) {
                                    const validFile = string => {
                                        const re = new RegExp(`^(${missionFiles.map(name => name.split('.')[1]).join('|')})$`);
                                        return re.test(string);
                                    };

                                    chunk = cutTail();

                                    if (chunk.type === 'MemberExpression' && validFile(chunk.name)) {
                                        const file = chunk.name;
                                        acc.push({ file, editableIndex, answer });
                                    }
                                }
                            }
                            else if (chunk.name === 'var') {
                                chunk = cutTail();
                                checkLiveTest();
                            }
                            else checkLiveTest();
                        }
                    }

                    return acc;
                }, []);

                if (passSyntax.length) {
                    const { live, file, editableIndex, answer } = passSyntax[0];
                    const objective: any = {
                        type: 'objective',
                        data: { live, title: transformString(title), testFunction }
                    };

                    if (!live) {
                        objective.data.fileOption = missionFiles.filter(name => name.endsWith(file))[0];

                        //  avoid setting editable option to string containing BSD specific markup
                        if (Object.values(bsdMarkup).every(markup => !markup.test(answer))) {
                            objective.data.editableOption = `#${editableIndex}: ${answer}`;
                        }
                    }

                    return objective;
                }

                return;
            });

        return objectiveBlocks;
    };

    missionSteps.forEach((step, idx) => {
        const { title, type, stepId } = step;
        const content = transformContentObject(step.content);
        const hasCode = type === stepType.code || type === stepType.interactive;
        const orderNo = (idx + 1) * 1000;
        const stepObj: Step = { orderNo, hasCode, type, title, stepId, content };

        if (hasCode) {
            const stepFiles = Object.entries(step.files) as Array<[string, any]>;

            if (stepFiles.length > missionFiles.length) {
                missionFiles = stepFiles.map(entry => entry[0]);
            }
            else if (stepFiles.length < missionFiles.length) {
                const fileNames = stepFiles.map(fileData => fileData[0]);

                missionFiles.forEach(fileName => {
                    if (!fileNames.includes(fileName)) {
                        stepFiles.push([fileName, { mode: fileMode.noChange }]);
                    }
                });
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

            stepObj.tests = transformTests(Object.values(step.tests));
        }
        else if (type === stepType.text) {
            stepObj.text = step.content.text;
        }

        stepList.push(stepObj);
    });

    const transform = (name: string) => parseFileName(name).type.replace('html', 'a').replace('css', 'b').replace('js', 'c');

    missionFiles = missionFiles.sort((a, b) => transform(a) < transform(b) ? -1 : 1);
    missionJson.missionUuid = mission.missionUuid;
    missionJson.settings = mission.settings;

    loadStepData(1);
}

function goToStep(targetStepNo: number) {
    debugGroup('goToStep(', targetStepNo, ')');

    if (targetStepNo < 1 || targetStepNo > stepList.length) {
        warn('There is no step ', [targetStepNo, clr.code]);
    }
    else {
        //  write active step to step list
        if (activeStepNo) {
            if (codeEditor) {
                activeStep[activeTab.innerText].viewState = codeEditor.saveViewState();
            }

            storeInstructions().then(() => {
                stepList[activeStepNo - 1] = activeStep;
                log('Stored step ', [activeStepNo, clr.code], ' data');
            });
        }

        loadStepData(targetStepNo);
    }

    console.groupEnd();
}

function loadStepData(targetStepNo: number) {
    debugGroup('loadStepData(', targetStepNo, ')');

    const { tabContainer, btnStepType, btnFileMode, btnModelAnswers } = App.UI;

    //  sync tabs with step data
    if (tabContainer.children.length !== missionFiles.length) {
        removeTabs();
        missionFiles.forEach((fullName, idx) => addTab(fullName, !idx));
    }

    const targetStep = stepList[targetStepNo - 1];
    const tabName = activeTab.innerText;
    const addFileObject = () => stepList[targetStepNo - 1][tabName] = { mode: fileMode.noChange };

    //  load code editor content
    if (targetStep.hasCode) {
        const targetTab = targetStep[activeTab.innerText] || addFileObject();
        const noChange = targetTab.mode === fileMode.noChange;

        if (codeEditor) {
            updateAuthorContent(getAuthorModel(tabName, targetStepNo), targetStep[tabName].viewState, noChange);
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

    //  load instructions
    codexEditor.isReady.then(() => {
        const title = (targetStep.title && targetStep.title.trim().length) ? targetStep.title : `Title - Step ${targetStepNo}`
        const blocks = [{
            type: 'header',
            data: { text: title }
        }, ...(targetStep.content.instructions || targetStep.content.text)];

        (targetStep.tests || []).forEach(test => blocks.push(test));

        codexEditor.blocks.clear();
        codexEditor.blocks.render({ blocks });
    });

    activeStepNo = targetStepNo;
    activeStep = targetStep;

    refreshOutput();

    log('Loaded ', [activeTab.innerText, clr.string], ' tab');
    console.groupEnd();
}

function getAttrValue(attrName: string, node) {
    const targetAttr = node.openingTag.attrs.filter(attr => attr.name === attrName);

    if (targetAttr.length === 0) {
        return '';
    }
    else if (targetAttr.length > 1) {
        alert(`Multiple "${attrName}" attributes found in instruction source code, check console for details`);
        throw new Error(node.openingTag.raw);
    }

    return targetAttr[0].value;
}

function updateMissionJson(callback) {
    if (diffEditor) storeAnswers();

    const transformInstructionBlock = text => {
        const tree = new HTMLTree(text);

        if (tree.error) throw new Error(tree.error);

        return tree.map(node => {
            if (node.type === 'text') return node.raw;

            if (node.type === 'element') {
                const tagName = node.openingTag.tagName;
                const className = getAttrValue('class', node);
                const glossaryLookup = tagName === 'span' && className.match(/^glossary (html|css|javascript)-glossary$/);

                if (glossaryLookup) {
                    const type = glossaryLookup[1];
                    const accesskey = getAttrValue('accesskey', node);
                    return `<a href='#glossary/${type}/${accesskey}'>${node.rawContent}</a>`;
                }
                else if (tagName === 'code' && className.match(/^inline-code$/)) {
                    return `<code>${node.rawContent}</code>`;
                }
                else if (tagName === 'a') {
                    const target = getAttrValue('target', node);

                    if (!/^_blank$/.test(target)) {
                        const attrs = node.openingTag.attrs.filter(attr => attr.name !== 'target').map(attr => attr.raw).join('');
                        return `<a${attrs} target="_blank">${node.rawContent}</a>`;
                    }
                }
                else return `${node.openingTag.raw}${node.isVoid ? '' : `${node.rawContent}${node.closingTag.raw}`}`;
            }
        })
            .join('');
    };
    const updateStepList = () => {
        stepList[activeStepNo - 1] = activeStep;
        stepList.forEach((step, stepIndex) => {
            const stepObj = newStepJson({
                type: step.type as SingleType,
                orderNo: (stepIndex + 1) * 1000
            });

            if (step.stepId) {
                stepObj.stepId = step.stepId;
            }
            else {
                step.stepId = stepObj.stepId;
            }

            //  parse code data
            if (step.hasCode) {
                missionFiles.forEach(fileName => {
                    const model = getDiffModels(fileName, stepIndex + 1);
                    const { mode } = step[fileName];
                    const contents = model.original.getValue().trim();
                    const contentsWithAnswers = model.modified.getValue().trim();

                    stepObj.files[fileName] = { mode, contents };

                    if (step.type === stepType.code && contents !== contentsWithAnswers) {
                        const answers = contentsWithAnswers.match(editablePattern.excludingMarkup);
                        Object.assign(stepObj.files[fileName], { answers, contentsWithAnswers });
                    }
                });
            }

            //  parse instruction data
            const stepTitle = step.title;
            const stepInstructions = step.content.instructions.map(block => {
                if (block.type === 'paragraph') {
                    return `<p>${transformInstructionBlock(block.data.text)}</p>`;
                }
                else if (block.type === 'image') {
                    const getImageAttrs = url => `src="${url}" onclick="window.open('${url}', '_blank')" title="Click to open image in a new tab" style="display: block; margin: auto; width: auto; max-width: 100%25; max-height: 15vh; border-radius: 5px; cursor: pointer"`;
                    return `<img ${getImageAttrs(block.data.url)}/>`;
                }
                else if (block.type === 'list') {
                    return `<ul>${block.data.items.map((item: string) => `<li><p class="notes">${transformInstructionBlock(item)}</p></li>`).join('')}</ul>`;
                }
                else console.log(block);
            }).join('');

            stepObj.title = (stepTitle && stepTitle.length) ? stepTitle : `Step ${stepIndex + 1}`;
            stepObj.content[step.hasCode ? 'instructions' : 'text'] = stepInstructions;

            //  parse test data
            const getUniqueId = uniqueCheck => {
                const id = (Math.floor(Math.random() * (Number.MAX_SAFE_INTEGER - 1)) + 1).toString();
                return uniqueCheck(id) ? id : getUniqueId(uniqueCheck);
            };

            step.tests.forEach((test, testIndex) => {
                const testId = getUniqueId(id => !stepObj.tests.hasOwnProperty(id));

                stepObj.tests[testId] = {
                    title: test.data.title,
                    stepId: step.stepId,
                    testId,
                    orderNo: (testIndex + 1) * 1000,
                    testFunction: test.data.testFunction,
                    failureMessage: ""
                };
            });

            missionJson.steps[stepObj.stepId] = stepObj;
            missionJson.settings.lastModified = moment().format();
        });
    };

    storeInstructions().then(() => {
        updateStepList();
        callback();
    });
}

function saveProjectToDisk() {
    updateMissionJson(() => {
        const fileContent = JSON.stringify(missionJson);
        const blob = new Blob([fileContent]);
        const fileStream = streamSaver.createWriteStream(`${missionJson.settings.title}.json`, { size: blob.size });

        new Response(fileContent).body
            .pipeTo(fileStream)
            .then(null, err => {
                alert('Save failed');
                console.log(err);
            })
    });
}

function cacheProject() {
    updateMissionJson(() => {
        localStorage.setItem(cachePrefix + missionJson.missionUuid, JSON.stringify(missionJson));
    });
}

function loadFromCache() {
    const cachedMissions = [];
    
    Object.entries(localStorage).forEach(([key, val]) => {
        if (key.startsWith(cachePrefix)) {
            cachedMissions.push(JSON.parse(val));
        }
    });

    if (cachedMissions.length) {
        const continueDialogue = {
            container: el('div', { id: 'continue-dialogue-container' }),
            btnClose: el('button', { id:'btnCloseContinueDialogue', className: 'material-icons', innerText: 'close' })
        };
        const closeDialogue = () => {
            continueDialogue.container.remove();
            App.UI.pnlCode.classList.remove('dim');
        };
        const loadAndCloseDialogue = mission => {
            parseAndLoadJson(mission);
            closeDialogue();
        };
        const removeItem = (item, uuid) => {
            item.remove();
            localStorage.removeItem(cachePrefix + uuid);
        };

        cachedMissions.sort((a, b) => a.settings.lastModified > b.settings.lastModified ? -1 : 1).forEach(mission => {
            const missionItem = el('div', { className: 'mission-item' });
            const missionName = el('p', { innerText: mission.settings.title });
            const lastModified = el('p', { innerText: moment(mission.settings.lastModified).fromNow() });
            const btnLoad = el('button', { className: 'load-mission material-icons', innerText: 'check_circle' });
            const btnRemove = el('button', { className: 'remove-mission material-icons', innerText: 'remove_circle' });

            continueDialogue.container.append(missionItem);
            missionItem.append(missionName, lastModified, btnLoad, btnRemove);
            btnLoad.addEventListener('click', () => loadAndCloseDialogue(mission));
            btnRemove.addEventListener('click', () => removeItem(missionItem, mission.missionUuid));
        });

        continueDialogue.container.append(continueDialogue.btnClose);
        continueDialogue.btnClose.addEventListener('click', closeDialogue);

        App.root.append(continueDialogue.container);
        App.UI.pnlCode.classList.add('dim');
    }
}

function copyMissionJson() {
    updateMissionJson(() => {
        const json = JSON.stringify(missionJson);

        navigator.clipboard.writeText(json).then(
            () => {
                log('Async: Copying to clipboard was successful!');
            },
            err => {
                alert('Copy failed, please find mission JSON in the console.');
                log(json);
            });
    });
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

// function fetchAsanaTickets() {
//     if (!asanaClient) return warn('Asana API is not initialised');

//     let params = {
//         'projects.any': feedbackProjectId,
//         'sort_by': 'created_at',
//         // 'custom_fields.846373207670449.is_set': true,
//         'completed': false,
//         'limit': 100
//     };

//     let summaryList = [];

//     const searchWithParam = params => {
//         return asanaClient.tasks.findByWorkspace(asanaWorkspaceId, params).then(response => {
//             response.data.forEach(task => summaryList.push({
//                 gid: task.gid,
//                 // missionUuid: task.missionUuid,
//                 name: task.name
//             }));

//             if (response.data.length === 100) {
//                 const lastItemId = response.data[response.data.length - 1].gid;

//                 asanaClient.tasks.findById(lastItemId).then(taskDetail => {
//                     params['created_at.before'] = taskDetail.created_at;
//                     console.log(taskDetail.created_at);
//                     return searchWithParam(params);
//                 });
//             }
//             else {
//                 summaryList = summaryList.sort((a, b) => a.name > b.name ? 1 : -1);
//                 console.log('Successfully fetched ', summaryList.length, ' items');
//                 console.log(summaryList);
//                 return summaryList;
//             }
//         });
//     };

//     searchWithParam(params);
// }

function initAsanaAPI() {
    const deprecationHeaders = { "defaultHeaders": { "asana-enable": "new_sections,string_ids" } };
    const client = asana.Client.create(deprecationHeaders).useAccessToken('0/f2986549b0f0906a2bbe501dabc38a61');

    // client.webhooks.create(feedbackProjectId, );

    return client;
}

//===== STEP OPERATIONS =====//

function createStep(placement: number = activeStepNo - 1, newStepType: SingleType = stepType.code) {
    debugGroup('createStep(placement:', placement, ', type:', newStepType, ')');

    const newStep: Step = {
        type: newStepType,
        orderNo: (placement + 1) * 1000,
        content: {}
    };

    if (newStepType === stepType.code || newStepType === stepType.interactive) {
        //  step is requried to be consistent with missionFiles
        newStep.hasCode = true;
        newStep.content.instructions = [];
        //  initialise step files based on missionFiles
        missionFiles.forEach((fullName, idx) => {
            debugGroup('Iteration ', [idx, clr.code], ' on ', ['missionFiles', clr.code]);

            const { type: newFileType } = parseFileName(fullName);
            const content = codeTemplate[newFileType];//.replace(editablePattern.excludingMarkup, ` step ${placement + 1} ${newFileType} `);
            const model = monaco.editor.createModel(content, langType[newFileType]);

            newStep[fullName] = {
                author: model,
                mode: fileMode.newContents,
                answers: [],
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
        warn('Skipped deleting the only step');
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

            updateAuthorContent(activeStep[activeTab.innerText].author, activeStep[activeTab.innerText].viewState, false);
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

function storeInstructions(stepNo: number = activeStepNo) {
    return codexEditor.save().then(data => {
        if (data.blocks[0].type !== 'header') {
            stepList[stepNo - 1].title = `Step ${stepNo}`;
        }
        else {
            const firstBlock = data.blocks.shift();
            const title = firstBlock.data.text.trim();
            stepList[stepNo - 1].title = title.length ? title : `Step ${stepNo}`;
        }

        const { instructions, tests } = data.blocks.reduce((acc, block) => {
            if (block.type === 'objective') {
                acc.tests.push(block);
            }
            else acc.instructions.push(block);
            return acc;
        }, { instructions: [], tests: [] });

        stepList[stepNo - 1].content.instructions = instructions;
        stepList[stepNo - 1].tests = tests;

        return { then: callback => callback() }
    });
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
            activeStep[activeTab.innerText].viewState = codeEditor.saveViewState();
            updateAuthorContent(getAuthorModel(targetTabName), targetFile.viewState, targetFile.mode === fileMode.noChange);
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

    if (model) updateAuthorContent(model, activeStep[activeTab.innerText].viewState, readOnly);
}

function updateAuthorContent(model: monaco.editor.IModel, state: monaco.editor.IViewState, readOnly?: boolean) {
    codeEditor.setModel(model);
    codeEditor.restoreViewState(state);
    codeEditor.focus();
    if (readOnly !== undefined) codeEditor.updateOptions({ readOnly });
}

function disableCodeEditor() {
    removeTabs();
    addTab('Disabled', true);
    updateAuthorContent(monaco.editor.createModel('Code editor is disabled for text steps'), null, true);
}

function toggleOutput() {
    console.group('toggleOutput');

    if (activeStep.hasCode) {
        const { pnlPreview, btnToggleOutput, btnRefreshOutput, btnToggleOutputSize } = App.UI;

        if (pnlPreview.classList.contains('hidden')) {
            pnlPreview.classList.remove('hidden');
            pnlPreview.iframe = el(pnlPreview).addNew('iframe');

            refreshOutput();

            btnRefreshOutput.classList.remove('hidden');
            btnToggleOutputSize.classList.remove('hidden');
            btnToggleOutput.firstElementChild.classList.add('active-blue');

            if (App.output.large) {
                (codeEditor || diffEditor).layout();
            }
        }
        else hideOutput();
    }
    else {
        warn('The output panel is not available for ', [activeStep.type, clr.string], ' steps');
        alert(`The output panel is not available for "${activeStep.type}" steps`);
    }

    console.groupEnd();
}

function toggleOutputSize() {
    const { pnlPreview, pnlLeft, pnlCode, btnToggleOutputSize } = App.UI;

    App.output.large = !App.output.large;
    (App.output.large ? pnlCode : pnlLeft).appendChild(pnlPreview);
    (codeEditor || diffEditor).layout();

    btnToggleOutputSize.firstElementChild.innerText = `zoom_${App.output.large ? 'out' : 'in'}`;
}

function hideOutput() {
    const { pnlPreview, btnToggleOutput, btnRefreshOutput, btnToggleOutputSize } = App.UI;

    pnlPreview.iframe.remove();
    pnlPreview.classList.add('hidden');
    btnRefreshOutput.classList.add('hidden');
    btnToggleOutputSize.classList.add('hidden');
    btnToggleOutput.firstElementChild.classList.remove('active-blue');

    if (App.output.large) (codeEditor || diffEditor).layout();
}

function refreshOutput() {
    if (!App.UI.pnlPreview.iframe) return;

    debugGroup('refreshOutput()');

    let srcHtml = getAuthorOrLearnerContent('index.html');
    const linkAndScript = srcHtml.match(/<link\s+[\s\S]*?>|<script[\s\S]*?>[\s\S]*?<\/script\s*>/gi);

    linkAndScript.forEach((node: any) => {
        const tree = new HTMLTree(node);

        if (tree.error) {
            warn('Error: ', [tree.error, clr.string]);
            alert('Failed parsing code, please check console for details');
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

                    srcHtml = srcHtml.split(replaceTarget).join(`<${newTag}>\n${content}\n\t\t</${newTag}>`);
                }
            }
            else {
                log([nodeRaw, clr.string], ' points to external file');
            }
        }
    });

    srcHtml = srcHtml
        //  transform relative platform paths to absolute paths
        .replace(/(['"])\s*(\/resources\/)/g, '$1https://cors.siuling.workers.dev/?https://app.bsd.education$2')
        //  remove editable markup
        .replace(editablePattern.justMarkup, '');

    App.UI.pnlPreview.iframe.srcdoc = srcHtml;
    log('Output panel refreshed');

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
            alert(`"${targetMode}" mode can not be applied to files in the first step`);
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

            updateAuthorContent(model, null, noChange);
            App.UI.btnFileMode.firstElementChild.innerText = iconNames[targetMode];
        }
    }
    else {
        warn('File mode options are not available for ', [activeStep.type, clr.string], ' steps');
        alert(`File mode options are not available for "${activeStep.type}" steps`);
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
        alert(`Answers editor is not available for "${activeStep.type}" steps`);
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
    debugGroup('resolveTabContent(', [tabName, clr.string], ')');

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
            };
            const lockEverything = (code: string) => {
                return `${removeEditableMarkup(code)}#BEGIN_EDITABLE##END_EDITABLE#`;
            };

            result = {
                resolvedContent: staticContent.author.getValue(),
                answers: staticContent.answers
            }

            relevantSteps.some((step, idx) => {
                const stepNo = step.orderNo / 1000;
                const answers = step[tabName].answers;

                if (step[tabName].mode === fileMode.modify) {
                    const transitionLogic = step[tabName].author.getValue();
                    const applyTransition = new Function('codeWithoutMarkup', 'insertLine', 'lockEverything', transitionLogic);

                    debugGroup('Resolving ', [tabName, clr.string], ' tab in step ', [stepNo, clr.code]).end(transitionLogic);

                    try {
                        resolvedContent = applyTransition(removeEditableMarkup(resolvedContent), insertLine, lockEverything);

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
                        alert(`Failed resolving author content in the "${tabName}" tab, check console for details`);
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

function mirrorTabContent(targetStepNo: number) {
    if (activeStep.type === stepType.text) {
        return alert('Mirroring tab content is not available for text steps');
    }

    if (targetStepNo > stepList.length || targetStepNo < 1) {
        return alert(`There is no step ${targetStepNo}`);
    }

    const getCodeFrom = (stepNo: number, dir: number) => {
        if (stepList[stepNo - 1].type !== stepType.code && stepList[stepNo - 1].type !== stepType.interactive) {
            return getCodeFrom(stepNo + dir, dir);
        }

        return stepList[stepNo - 1][activeTab.innerText].author.getValue().trim();
    };

    activeStep[activeTab.innerText].author.setValue(getCodeFrom(targetStepNo, targetStepNo > activeStepNo ? 1 : -1));
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
