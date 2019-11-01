//  https://basarat.gitbooks.io/typescript/content/docs/project/globals.html

import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

// validation settings
monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false
});

// compiler options
monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES2016,
    allowNonTsExtensions: true
});

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

const codeContainer = document.createElement('div');

document.body.append(codeContainer);
codeContainer.style.height = '500px';

const codeEditor = monaco.editor.create(codeContainer, {
    theme: 'vs-dark',
    value: 'body { background-color: skyble }',
    language: "css"
});

// monaco.languages.registerDocumentFormattingEditProvider('css', {
//     async provideDocumentFormattingEdits(model, options, token) {
//         const prettier = await import('prettier/standalone');
//         const babylon = await import('prettier/parser-babylon');
//         const text = prettier.format(model.getValue(), {
//             parser: 'babel',
//             plugins: [babylon],
//             singleQuote: true,
//             tabWidth: 4
//         });

//         return [{
//             range: model.getFullModelRange(),
//             text,
//         }];
//     },
// });