import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

const editor = monaco.editor.create(document.getElementById('container'), {
    value: 'console.log("Hello, world");',
    language: 'javascript',
    theme: 'vs-dark'
});

editor.onKeyDown(() => {
    console.log(editor.getValue());
});
