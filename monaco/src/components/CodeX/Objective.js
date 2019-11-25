import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

export default class Objective {
    constructor({ api, config }) {
        this.api = api;
        this.getTabs = config.getTabs;
    }

    static get toolbox() {
        return {
            icon: '<svg width="11" height="14" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M7.6 8.15H2.25v4.525a1.125 1.125 0 0 1-2.25 0V1.125a1.125 1.125 0 1 1 2.25 0V5.9H7.6V1.125a1.125 1.125 0 0 1 2.25 0v11.55a1.125 1.125 0 0 1-2.25 0V8.15z"/></svg>',
            title: 'Header'
        };
    }

    render() {
        console.log(this.api.styles);
        const wrapper = document.createElement('div');
        const fileSelect = document.createElement('select');
        const keywordInput = document.createElement('input');
        const offsetInput = document.createElement('input');
        const descriptionInput = document.createElement('div');
        const testContainer = document.createElement('div');
        const checkButton = document.createElement('button');

        wrapper.append(fileSelect, keywordInput, offsetInput, descriptionInput, testContainer, checkButton);

        this.getTabs().forEach(tab => {
            const option = document.createElement('option');
            const tabName = tab.innerText;

            option.value = tabName;
            option.innerText = tabName;
            fileSelect.append(option);

            if (tab.classList.contains('active')) {
                fileSelect.value = tabName;
            }
        });



        const testEditor = monaco.editor.create(testContainer, { theme: 'vs-dark', scrollBeyondLastLine: false, formatOnPaste: true });


        fileSelect.title = 'Pick a file for this test';
        keywordInput.title = 'Specify a unique string in the target file';
        offsetInput.title = 'Specify an offset from the location of the unique string';

        wrapper.classList.add(this.api.styles.block);
        fileSelect.classList.add('ce-code__select', this.api.styles.input);
        keywordInput.classList.add('ce-code__input');
        offsetInput.classList.add('ce-code__input');
        descriptionInput.classList.add('ce-code__input');

        return wrapper;
    }

    save() { }

    sanitize() { }
}