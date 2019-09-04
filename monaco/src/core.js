
//===== SECTION: NOTES =====//

/*
syntax highlight
https://github.com/codesandbox/codesandbox-client/blob/196301c919dd032dccc08cbeb48cf8722eadd36b/packages/app/src/app/components/CodeEditor/Monaco/workers/syntax-highlighter.js
https://github.com/atomiks/moonlight-vscode-theme
*/

//===== SECTION: IMPORTS =====//

import './styles/main.scss';
import favicon from './images/favicon.png';

import moment from 'moment';

import EditorJS from '@editorjs/editorjs';
import Header from './components/Header';
import Paragraph from './components/Paragraph';
import SimpleImage from './components/SimpleImage';
import List from './components/List';
import Code from './components/Code';
import InlineCode from './components/InlineCode';

import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

// import strip from 'strip-comments';
// import stripHtmlComments from 'strip-html-comments';

import { el, newEl, obj } from './utils/Handy';
import HTMLTree from './modules/HTMLTree';

import { newStepJson, newMissionJson } from './modules/JsonTemplates';
import tooltip from './modules/Tooltip';
import subMenu from './modules/SubMenu';

//===== SECTION: ASSIGN FAVICON =====//

el(document.querySelector('head')).new('link', {
    type: 'image/x-icon',
    rel: 'shortcut icon',
    href: favicon,
});

//===== SECTION: INIT VARIABLES =====//

let missionJson;
let stepList = [];
let testList = [];
let activeStep = 1;

let refreshTimer;
const refreshDelay = 800;

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

window.onload = initApp;

function initApp() {

    //===== SECTION: COLLECT DOM ELEMENTS =====//

    Object.assign(window, {
        codexContainer: el('#codex-editor'),
        codexEditor: new EditorJS({
            holder: 'codex-editor',
            tools: {
                header: Header,
                paragraph: Paragraph,
                simpleImage: SimpleImage,
                list: List,
                code: Code,
                inlineCode: InlineCode,
            },
        }),
        //  project buttons
        btnProjectSettings: el('#btn-project-settings'),
        btnOpenProject: el('#btn-open-project'),
        btnSaveProject: el('#btn-save-project'),
        btnCopyJson: el('#btn-copy-json'),
        btnContinue: el('#btn-continue'),

        //  step buttons
        btnNewStep: el('#btn-new-step'),
        btnDelStep: el('#btn-del-step'),
        btnNextStep: el('#btn-next-step'),
        btnPrevStep: el('#btn-prev-step'),
        btnStepType: el('#btn-step-type'),
        btnStepOrder: el('#btn-step-order'),

        // instruction buttons
        btnTemplate1: el('#btn-template-1'),
        btnTemplate2: el('#btn-template-2'),
        btnTemplate3: el('#btn-template-3'),

        //  code buttons
        btnCodeMode: el('#btn-code-mode'),
        btnModelAnswers: el('#btn-model-answers'),
        btnToggleOutput: el('#btn-toggle-output'),

        //  panels
        pnlActions: el('#actions-panel'),
        pnlPreview: el('#preview-panel'),

        //  code panel
        codeTabs: el('#code-tabs'),
        codeEditor: monaco.editor.create(el('#code-editor'), { theme: 'vs-dark' }),
        diffEditor: null,
    });

    //===== SECTION: INITIALISE PROJECT CONTENT =====//

    createMissionJson();

    createNewStep({
        title: 'Introduction',
        orderNo: 1000,
    });

    codexEditor.isReady.then(() => {
        loadStepContents(1);
    });


    //===== SECTION: UI EVENTS =====//

    window.onresize = () => (codeEditor || diffEditor).layout();

    btnOpenProject.onclick = () => {
        const fileToLoad = newEl('input', { type: 'file', accept: '.json' });
        fileToLoad.click();
        fileToLoad.onchange = () => {
            const fileReader = new FileReader();
            fileReader.readAsText(fileToLoad.files[0], 'UTF-8');
            fileReader.onload = fileLoadedEvent => {
                createMissionJson(fileLoadedEvent.target.result);
                loadStepContents(1);
            };
        };
    };

    btnSaveProject.onclick = () => saveToLocal();

    btnContinue.onclick = () => loadFromLocal();

    btnNewStep.onclick = () => {
        createNewStep();
        btnNextStep.click();
    };

    btnDelStep.onclick = () => {
        if (stepList.length === 1) return alert('Failed to delete step, a project must have at least 1 step.');

        stepList.splice(activeStep - 1, 1);
        loadStepContents(Math.min(activeStep, stepList.length));
    };

    btnNextStep.onclick = () => goToStep(activeStep + 1);

    btnPrevStep.onclick = () => goToStep(activeStep - 1);

    btnTemplate1.onclick = () => {
        console.log(codexEditor.save());
        console.log(stepList);
    };

    btnModelAnswers.onclick = () => {
        //  this handler assumes the code content includes at least one valid editable markup
        //  this button should be disabled otherwise
        const { stepJson } = parseStepJson(activeStep);

        if (stepJson.type === 'code') {
            const { fileType } = codeTabs.active;

            btnModelAnswers.firstElementChild.classList.toggle('active-green');

            storeTabData();

            if (codeEditor) {
                //  must dispose editor before creating another
                const originalModel = codeEditor.getModel();

                codeEditor.dispose();
                codeEditor = null;

                const codeWithAnswers = getModelCode(codeTabs.active);

                diffEditor = monaco.editor.createDiffEditor(el('#code-editor'));
                diffEditor.setModel({
                    original: originalModel,
                    modified: monaco.editor.createModel(codeWithAnswers, getTypeString(fileType)),
                });
            }
            else {
                //  must dispose editor before creating another
                const diffModel = diffEditor.getModel();

                diffEditor.dispose();
                diffEditor = null;

                codeEditor = monaco.editor.create(el('#code-editor'), { theme: 'vs-dark' });
                codeEditor.setModel(diffModel.original);
            }
        }
        else console.warn('The current step type does not support model answers.');
    };

    btnToggleOutput.onclick = () => {
        if (/code|interactive/.test(stepList[activeStep - 1].type)) {
            pnlPreview.classList.toggle('hidden');
            btnToggleOutput.firstElementChild.classList.toggle('active-blue');

            if (pnlPreview.classList.contains('hidden')) {
                el(pnlPreview).remove(pnlPreview.iframe);
            }
            else {
                el(pnlPreview).addChild(pnlPreview.iframe = newEl('iframe'));
                refreshOutput();
            }
        }
    };

    codeEditor.onDidChangeModelContent(() => refreshOutput(false));

    //===== SECTION: TOOLTIPS =====//

    tooltip([{
        tool: btnProjectSettings,
        heading: 'settings',
        tip: 'view and edit project level settings'
    }, {
        tool: btnOpenProject,
        heading: 'open',
        tip: 'open project from a JSON file containing a valid mission data structure'
    }, {
        tool: btnSaveProject,
        heading: 'save',
        tip: 'save the current project to disk as a JSON file'
    }, {
        tool: btnCopyJson,
        heading: 'copy json',
        tip: 'can be used with the "Import JSON" feature on the BSD Online'
    }, {
        tool: btnContinue,
        heading: 'continue',
        tip: 'load a project from local storage, doing so will overwite the current project'
    }, {
        tool: btnNewStep,
        heading: 'new',
        tip: 'create a new step after the current step and display it'
    }, {
        tool: btnDelStep,
        heading: 'delete',
        tip: 'delete the current step and display the next step'
    }, {
        tool: btnNextStep,
        heading: 'next',
        tip: 'move to the next step'
    }, {
        tool: btnPrevStep,
        heading: 'previous',
        tip: 'move to the previous step'
    }, {
        tool: btnStepType,
        heading: 'type',
        tip: 'click to change the type of the current step'
    }, {
        tool: btnStepOrder,
        heading: 'order',
        tip: 'click to view and rearrange the order of steps'
    }], {
            dim: codexContainer
        });

    //===== SECTION: SUBMENU =====//

    subMenu([{
        host: btnStepType,
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
        host: btnCodeMode,
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
}

//===== SECTION: PROJECT OPERATIONS =====//

function createMissionJson(fromString, override) {
    missionJson = fromString ? JSON.parse(fromString) : newMissionJson(override);
    stepList = obj(missionJson.steps).filter('values', step => step.title !== 'Deleted by merging process');
    stepList = obj(stepList).sort('values', (a, b) => a.orderNo - b.orderNo);
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

    const userChoice = prompt(options);

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
                model: monaco.editor.createModel(contents, getTypeString(type)),
                state: null,
            };
        });

        codeEditor.setModel(modelStateSchema.html['index'].model);

        refreshOutput();
    }
    else return;
}

//===== SECTION: STEP OPERATIONS =====//

function createNewStep(override = {}) {
    //  conver schema to json
    const filesJson = {};
    const testsJson = {};

    obj(modelStateSchema).forEachEntry((type, files) => {
        obj(files).forEachKey(name => {
            const contents = codeTemplate[type];
            const fileFullName = `${name}.${type}`;
            const { answers, tests } = answerAndTestFrom(contents, name, type);

            filesJson[fileFullName] = {
                answers,
                contents,
                mode: 'new_content',
            };

            testsJson[fileFullName] = tests;

            modelStateSchema[type][name] = {
                model: monaco.editor.createModel(contents, getTypeString(type)),
                state: null,
            };
        });
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

function storeStepContents(n) {
    const { stepIndex, stepHasCode } = parseStepJson(n);

    //  store instructions in current step
    return codexEditor.save().then(contents => {
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
                const { name, type } = parseFileName(fullName);
                const contents = modelStateSchema[type][name].model.getValue();
    
                stepList[stepIndex].files[fullName].contents = contents;
            });
        }
    
        return {
            then: callback => callback()
        };
    });
}

function loadStepContents(n) {
    const { stepIndex, stepHasCode, stepJson } = parseStepJson(n);

    loadStepInstructions(stepJson, stepHasCode);

    if (stepHasCode) {
        loadStepCode(stepJson, stepIndex);
        refreshOutput();
    }
    else {
        disableCodeEditor(`The code editor is disabled for ${stepJson.type} steps.`);

        if (pnlPreview.iframe) {
            pnlPreview.classList.toggle('hidden');
            btnToggleOutput.firstElementChild.classList.toggle('active-blue');
            el(pnlPreview).remove(pnlPreview.iframe);
        }
    }

    activeStep = n;
}

function goToStep(n) {
    if (n < 1 || n > stepList.length) {
        return console.warn(`There is no step ${n}`);
    }

    storeStepContents(activeStep).then(() => loadStepContents(n));
}

function parseStepJson(n) {
    const stepInfo = { stepIndex: n - 1 };

    stepInfo.stepJson = stepList[stepInfo.stepIndex];
    stepInfo.stepHasCode = /code|interactive/.test(stepInfo.stepJson.type);

    return stepInfo;
}

//===== SECTION: INSTRUCTION OPERATIONS =====//

function loadStepInstructions(stepJson, withCode = true) {
    codexEditor.blocks.clear();
    codexEditor.blocks.insert('header', { text: stepJson.title }, {}, 0);

    const stepContent = stepJson.content[['instructions', 'text'][withCode ? 0 : 1]];
    const stepContentTree = new HTMLTree(stepContent);

    stepContentTree.forEach(node => {
        const { tagName } = node.openingTag;

        //  prevent inserting empty blocks into the codex editor
        node.rawContent = node.rawContent.replace(/(^&nbsp;)|(&nbsp;$)|(^<br\s*\/?>$)/g, '');
        if (node.rawContent.length === 0) return;

        let blockType = 'paragraph';
        let blockContent = { text: node.rawContent };

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
}

//===== SECTION: IFRAME OPERATIONS =====//

function refreshOutput(now = true) {
    if (!pnlPreview.iframe) return;

    const refresh = () => {
        let srcHtml = Object.values(modelStateSchema.html)[0].model.getValue();
        const linkAndScript = srcHtml.match(/<link\s+[\s\S]*?>|<script[\s\S]*?>[\s\S]*?<\/script\s*>/gi);

        linkAndScript.forEach(node => {
            const tree = new HTMLTree(node);

            if (tree.error) return;

            node = tree[0];

            const tagType = node.openingTag.tagName;
            const attrType = tagType === 'link' ? 'href' : tagType === 'script' ? 'src' : '';
            const attrValue = node.openingTag.attrs.filter(attr => attr.name === attrType)[0].value;
            const [_, name, type] = attrValue.match(fileNamePattern);
            // const { name, type } = parseFileName(attrValue);

            if (!modelStateSchema[type]) return;
            if (!modelStateSchema[type][name]) return;

            const replacement =
                type === 'css' ?
                    [node.openingTag.raw,
                    `<style>${modelStateSchema[type][name].model.getValue()}</style>`]
                    :
                    type === 'js' ?
                        [`${node.openingTag.raw}${node.rawContent}${node.closingTag.raw}`,
                        `<script>${modelStateSchema[type][name].model.getValue()}</script>`]
                        :
                        [];

            srcHtml = srcHtml.replace(...replacement);
        });

        pnlPreview.iframe.srcdoc =
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

//===== SECTION: CODE OPERATIONS =====//

function populateTabs(active) {
    el(codeTabs).remove(...codeTabs.children);

    //  unpack the models & states in the current step
    obj(modelStateSchema).forEachEntry((fileType, filesData) => {
        //  unpack the model & state for each file
        obj(filesData).forEachKey(fileName => {
            const fileFullName = `${fileName}.${fileType}`;
            const isActive = active === `active:${fileFullName}`;
            const tab = el(codeTabs).new('span', { className: `tab${isActive ? ' active' : ''}`, innerText: fileFullName });

            tab.fileType = fileType;
            tab.fileName = fileName;
            tab.fileFullName = `${fileName}.${fileType}`;
            tab.onclick = changeTab;

            if (isActive) loadTabData(tab);
        });
    });

    return { then: callback => callback() };
}

function changeTab() {
    const targetTab = event.target;

    storeTabData();

    //  toggle the "active" class name on current and target tabs
    codeTabs.active.classList.remove('active');
    targetTab.classList.add('active');

    loadTabData(targetTab);

    (codeEditor || diffEditor).focus();
}

function loadStepCode(stepJson, stepIndex) {
    //  unpack all types of files in model & state schema
    obj(modelStateSchema).forEachEntry((type, files) => {
        obj(files).forEachKey(name => {
            const fileFullName = `${name}.${type}`;
            const fileUnchanged = !stepJson.files.hasOwnProperty(fileFullName);
            let contents;

            if (fileUnchanged) {
                let idx = stepIndex - 1;

                do {
                    //  loop through earlier steps to find user defined code contents
                    //  i.e. unchanged or modify
                    if (stepList[idx].files.hasOwnProperty(fileFullName)) {
                        contents = stepList[idx].files[fileFullName].contents;
                    }
                }
                while (!contents && idx-- >= 1);
            }
            else contents = stepJson.files[fileFullName].contents;

            modelStateSchema[type][name] = {
                model: monaco.editor.createModel(contents, getTypeString(type)),
                state: null
            };
        });
    });

    //  update code editor tabs
    populateTabs(`active:${stepJson.content.startTab || 'index.html'}`);
}

function answerAndTestFrom(code, name, type) {
    const answers = code.match(editablePattern.excludingMarkup);
    const tests = answers.map((answer, idx) => {
        return { answer, name, type, editableIndex: idx };
    });

    return { answers, tests };
}

function getModelCode(tab) {
    const stepIndex = activeStep - 1;
    const { fileName, fileType, fileFullName } = tab;
    const authorCode = modelStateSchema[fileType][fileName].model.getValue();

    return authorCode.split(editablePattern.excludingMarkup).map((chunk, idx) => {
        const answer = stepList[stepIndex].files[fileFullName].answers[idx];
        return answer ? `${chunk}${answer}` : chunk;
    }).join('');
}

function storeTabData() {
    const { fileName, fileType, fileFullName } = codeTabs.active;

    if (codeEditor) {
        modelStateSchema[fileType][fileName] = {
            model: codeEditor.getModel(),
            state: codeEditor.saveViewState(),
        };
    }
    else {
        const stepIndex = activeStep - 1;
        const codeWithAnswers = diffEditor.getModel().modified.getValue();
        const { answers, tests } = answerAndTestFrom(codeWithAnswers, fileName, fileType);

        stepList[stepIndex].files[fileFullName].answers = answers;
        testList[stepIndex][fileFullName] = tests;
    }
}

function loadTabData(tab) {
    const targetTabData = modelStateSchema[tab.fileType][tab.fileName];

    if (codeEditor) {
        codeEditor.setModel(targetTabData.model);
        codeEditor.restoreViewState(targetTabData.state);
    }
    else {
        const codeWithAnswers = getModelCode(tab);

        diffEditor.setModel({
            original: targetTabData.model,
            modified: monaco.editor.createModel(codeWithAnswers, getTypeString(tab.fileType))
        });
    }

    codeTabs.active = tab;
}

function disableCodeEditor(msg) {
    el(codeTabs).forEachChild(tab => {
        if (tab.classList.contains('active')) {
            tab.innerText = '...';
        }
        else el(codeTabs).remove(tab);
    });

    codeEditor.setModel(monaco.editor.createModel(msg));
    codeEditor.updateOptions({ readOnly: true });
}

function getTypeString(string) {
    return string.replace(/^js$/, 'javascript');
}


// const btnEditAnswers = el('#editAnswers');

// let editables = [];
// let editAnswers = false;



// btnEditAnswers.onclick = () => {
//     let editorValueArray = codeEditor.getValue().split('\n');

//     //  remove editable markup from editor code
//     if (editAnswers) {
//         //  insert editables array
//         let markupType = 'end';

//         editables = editables.flatMap(editable => [{
//             line: editable.start.line,
//             column: editable.start.column,
//         }, {
//             line: editable.end.line,
//             column: editable.end.column,
//         }]);

//         while (editables.length) {
//             const markup = editables.pop();
//             const lineIndex = markup.line - 1;
//             const columnIndex = markup.column - 1;

//             editorValueArray[lineIndex] = str(editorValueArray[lineIndex]).splice(`#${markupType === 'end' ? 'END' : 'BEGIN'}_EDITABLE#`, columnIndex);
//             markupType = markupType === 'end' ? 'start' : 'end';
//         }

//         codeEditor.setValue(editorValueArray.join('\n'));
//         codeEditor.updateOptions({ readOnly: false });
//     }
//     //  add editable markup back into the code
//     else {
//         //  build editables array
//         let editableMarkup = { start: /#BEGIN_EDITABLE#/, end: /#END_EDITABLE#/ };
//         let editableRegion = { start: {}, end: {}, content: '' };
//         let markupType = 'start';

//         const determineEditability = () => {
//             if (!editAnswers) return;

//             const selections = codeEditor.getSelections();

//             codeEditor.updateOptions({
//                 readOnly: !selections.every(selection => {
//                     return editables.some(region => {
//                         const onEditableLine = selection.startLineNumber >= region.start.line && selection.endLineNumber <= region.end.line;
//                         const inEditableRegion = onEditableLine && selection.startColumn >= region.start.column && selection.endColumn <= region.end.column;

//                         return inEditableRegion;
//                     });
//                 })
//             });
//         };

//         editorValueArray.forEach((line, idx) => {
//             let markupMatch;

//             do {
//                 markupMatch = line.match(editableMarkup[markupType]);

//                 if (markupMatch) {
//                     editableRegion[markupType].line = idx + 1;
//                     editableRegion[markupType].column = markupMatch.index + 1;

//                     if (markupType === 'end') {
//                         editableRegion.content = line.slice(editableRegion.start.column - 1, markupMatch.index);
//                         editables.push(editableRegion);
//                         editableRegion = { start: {}, end: {}, content: '' };
//                     }

//                     line = line.replace(markupMatch[0], '');
//                     markupType = markupType === 'end' ? 'start' : 'end';
//                 }
//             }
//             while (markupMatch);
//         });

//         codeEditor.setValue(editorValueArray.join('\n').replace(/#(BEGIN|END)_EDITABLE#/g, ''));
//         codeEditor.updateOptions({ readOnly: true });

//         //  add editable regions
//         codeEditor.deltaDecorations([], editables.map(editable => {
//             return {
//                 range: new monaco.Range(editable.start.line, editable.start.column, editable.end.line, editable.end.column),
//                 options: { inlineClassName: 'editableRegion' }
//             };
//         }));

//         codeEditor.onDidChangeCursorSelection(determineEditability);
//         codeEditor.onDidChangeModelContent(evt => {
//             console.log(evt.changes);

//             // evt.changes.forEach(change => {
//             //     editables.some((region, idx) => {
//             //         if (change.startLineNumber >= region.start.line && change.endLineNumber <= region.end.line) {
//             //             if (change.startColumn >= region.start.column && change.endColumn <= region.end.column) {
//             //                 editables[idx].end.column += change.text.length;
//             //             }
//             //         }
//             //     });
//             // });

//             // endColumn: 8
//             // endLineNumber: 3
//             // startColumn: 8
//             // startLineNumber: 3
//         });

//     }

//     editAnswers = !editAnswers;
// };
