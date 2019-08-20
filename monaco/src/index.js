
import './main.scss';

import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Code from '@editorjs/code';
import InlineCode from '@editorjs/inline-code';
import Image from '@editorjs/simple-image';

import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

import { el, newEl } from './utils/handy';
import HTMLTree from './utils/HTMLTree';

let missionJSON = {};
let stepsJSON = [];
let activeStep = 1;

const codeData = [{
    html: { 'index': { model: null, state: null } },
    css: { 'style': { model: null, state: null } },
    js: { 'script': { model: null, state: null } },
}];

const boilerplate = {
    html: '<!DOCTYPE html>\n<html>\n\t<head>\n\t\t<link rel="stylesheet" href="style.css"/>\n\t</head>\n\t<body>\n\n\t\tWelcome to HTML\n\n\t\t<script src="script.js"></script>\n\t</body>\n</html>',
    css: '/* CSS */',
    js: '// JavaScript',
};

window.onload = initApp;

function initApp() {

    //===== COLLECT DOM ELEMENTS =====//
    
    Object.assign(window, {
        codexEditor: new EditorJS({
            holder: 'codex-editor',
            tools: {
                header: Header,
                list: List,
                code: Code,
                inlineCode: InlineCode,
                image: Image,
            },
            // initialBlock: 'header',
        }),
        //  buttons
        btnOpenProject: document.querySelector('#btn-open-project'),
        btnCopyJson: document.querySelector('#btn-copy-json'),
        btnNextStep: document.querySelector('#btn-next-step'),
        btnPrevStep: document.querySelector('#btn-prev-step'),
        btnToggleOutput: document.querySelector('#btn-toggle-output'),

        //  panels
        pnlPreview: document.querySelector('#preview-panel'),

        codeTabs: document.querySelector('#code-tabs'),

        codeContainer: document.querySelector('#code-editor'),
        codeEditor: monaco.editor.create(document.querySelector('#code-editor'), {
            model: monaco.editor.createModel(boilerplate.html, 'html'),
            theme: 'vs-dark',
        }),
    });

    //===== UI EVENTS =====//

    window.onresize = () => codeEditor.layout();

    btnOpenProject.onclick = () => {
        const fileToLoad = newEl('input', { type: 'file', accept: '.json' });
        fileToLoad.click();
        fileToLoad.onchange = () => {
            const fileReader = new FileReader();
            fileReader.readAsText(fileToLoad.files[0], 'UTF-8');
            fileReader.onload = fileLoadedEvent => {
                missionJSON = JSON.parse(fileLoadedEvent.target.result);
                openProject(missionJSON);
            };
        };
    };



    btnNextStep.onclick = () => {
        goToStep(++activeStep);
    };

    btnPrevStep.onclick = () => {
        goToStep(--activeStep);
    };

    btnToggleOutput.onclick = () => {
        pnlPreview.classList.toggle('hidden');
        el(btnToggleOutput).toggle({ innerText: ['Show', 'Hide'] });
    };

    //===== INITIALISE VALUES =====//

    populateTabs().then(() => {
        codeTabs.firstElementChild.classList.add('active');
    });
}

function populateTabs(active) {
    el(codeTabs).remove(...codeTabs.children);
    
    Object.entries(codeData[activeStep - 1]).forEach(stepData => {
        const [fileType, filesData] = stepData;
        Object.keys(filesData).forEach(fileName => {
            const fileFullName = `${fileName}.${fileType}`;
            const isActive = active === `active:${fileFullName}`;
            const tab = el(codeTabs).new('span', { className: `tab${isActive ? ' active' : ''}`, innerText: fileFullName });
            tab.fileType = fileType;
            tab.fileName = fileName;
            tab.onclick = changeTab;

            if (isActive) loadTabModelState(tab);
        });
    });

    return { then: callback => callback() };
}

function changeTab() {
    const currentTab = codeTabs.querySelector('.tab.active');
    const targetTab = event.target;

    //  toggle the "active" class name on current and target tabs
    currentTab.classList.remove('active');
    targetTab.classList.add('active');

    //  store current tab model & state
    storeTabModelState(currentTab);
    //  load target tab model & state
    loadTabModelState(targetTab);
    codeEditor.focus();
}

function storeTabModelState(tab) {
    codeData[activeStep - 1][tab.fileType][tab.fileName] = {
        model: codeEditor.getModel(),
        state: codeEditor.saveViewState(),
    };
}

function loadTabModelState(tab) {
    const targetTabData = codeData[activeStep - 1][tab.fileType][tab.fileName];
    codeEditor.setModel(targetTabData.model || monaco.editor.createModel(
        boilerplate[tab.fileType],
        tab.fileType.replace(/^js$/, 'javascript')
    ));
    codeEditor.restoreViewState(targetTabData.state);
}

function openProject(json) {
    stepsJSON = Object.values(json.steps).sort((a, b) => a.orderNo - b.orderNo);
    goToStep(1);
}

function goToStep(n) {
    const stepIndex = n - 1;
    const stepJSON = stepsJSON[stepIndex];
    const hasCode = /code|interactive/.test(stepJSON.type);

    //===== UPDATE STEP INSTRUCTIONS =====//
    
    codexEditor.blocks.clear();
    codexEditor.blocks.insert('header', { text: stepJSON.title }, {}, 0);

    const stepContent = stepJSON.content[['instructions', 'text'][hasCode ? 0 : 1]];
    const stepContentTree = new HTMLTree(stepContent);

    stepContentTree.forEach(el => {
        const { tagName } = el.openingTag;

        //  prevent inserting empty blocks into the codex editor
        el.rawContent = el.rawContent.replace(/(^&nbsp;)|(&nbsp;$)|(^<br\s*\/?>$)/g, '');
        if (el.rawContent.length === 0) return;

        let blockType = 'paragraph';
        let blockContent = { text: el.rawContent };

        if (/^pre$/.test(tagName)) {
            blockType = 'code';
            blockContent = { code: el.content[0].rawContent };
        }
        else if (/^[u|o]l$/.test(tagName)) {
            blockType = 'list';
            blockContent = {
                style: `${tagName === 'ul' ? 'un' : ''}ordered`,
                //  assumes each <li> has only one child
                items: el.content.map(child => child.content[0].rawContent)
            };
        }
        else if (/^center$/.test(tagName)) {
            blockContent = { text: el.content[0].rawContent };
        }

        codexEditor.blocks.insert(blockType, blockContent);
    });

    //===== UPDATE STEP CODE =====//

    if (hasCode) {
        const stepCodeData = codeData[stepIndex];

        //  build stepData if none exists
        if (!stepCodeData) {
            Object.entries(stepJSON.files).forEach(file => {
                const [fileName, fileData] = file;
                const [name, type] = fileName.split('.');
                const { answers, contents, mode } = fileData;

                codeData[stepIndex] = Object.assign(codeData[stepIndex] || {}, {
                    [type]: Object.assign((codeData[stepIndex] && codeData[stepIndex][type]) || {}, {
                        [name]: {
                            model: monaco.editor.createModel(contents, type.replace(/^js$/, 'javascript')),
                            state: null,
                        }
                    })
                });
            });
        }

        //  update tab buttons using stepData
        populateTabs(`active:${stepJSON.content.startTab || 'index.html'}`);
    }
    else {
        disableCodeEditor(`The editor is disabled for ${stepJSON.type} steps.`);
    }

    //===== UPDATE STEP CODE =====//



    // content: { text: "<p>In the&nbsp;<strong>Navigation Algorithm</stron…ts and talk back about topics of your choice.</p>" }
    // deleted: false
    // files:
    // index.html:
    // answers: []
    // contents: "<!DOCTYPE html>↵<html>↵<head>↵    <link href="https://fonts.googleapis.com/css?family=VT323" rel="stylesheet">↵    <link href="/resources/css/font-awesome.min.css" rel="stylesheet">↵	<link rel="stylesheet" type="text/css" href="style.css"/>↵</head>↵<body>↵	<div id='content'>↵		<p id='title'>Auto Navigation</p>↵↵		<div id='grid'>↵			<div id='car'></div>↵        </div>↵    </div>↵↵    <div id='chatbot'>↵        <div id='messages'></div>↵↵        <div id='inputContainer'>↵            <input id='userInput' placeholder='Type message here' autocomplete='off'>↵            <button id='btnSend'><i class='fa fa-paper-plane fa-fw'></i></button>↵        </div>↵    </div>↵    ↵    <script src="https://cdnjs.cloudflare.com/ajax/libs/seedrandom/3.0.1/seedrandom.min.js"></script>↵	<script src="script.js"></script>↵</body>↵</html>↵#BEGIN_EDITABLE##END_EDITABLE#"
    // mode: "new_contents"
    // __proto__: Object
    // script.js: { contents: "var content = document.querySelector('#content');↵…om: arr => arr.splice(arr.indexOf(item), 1) };↵}↵", mode: "new_contents", answers: Array(2) }
    // style.css: { contents: "/* font converted using font-converter.net. thank …   margin: 10px;↵}↵#BEGIN_EDITABLE##END_EDITABLE#", mode: "new_contents", answers: Array(0) }
    // __proto__: Object
    // majorRevision: 5
    // minorRevision: 2
    // orderNo: 500
    // refMissionUuid: null
    // stepId: "2755670874491644"
    // tests: { }
    // title: "Introduction"
    // type: "text"
}

function disableCodeEditor(msg) {
    codeTabs.querySelectorAll('.tab').forEach(tab => tab.onclick = null);
    codeEditor.setModel(monaco.editor.createModel(msg));
    codeEditor.updateOptions({ readOnly: true });
}


// const btnEditAnswers = document.querySelector('#editAnswers');

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
