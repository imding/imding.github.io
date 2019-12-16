import { inputHandler, deleteHandler } from './keyboardHandler';
import HTMLTree from '../HTMLTree';

export default class Objective {
    constructor({ api, config, data }) {
        this.api = api;
        this.config = config;
        this.data = data;
    }

    static get toolbox() {
        return {
            icon: '<svg width="15" height="15" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="m12.28608,3.1451l0.86236,0.86236l-7.84744,7.84744l-3.44943,-3.44943l0.86236,-0.86236l2.58707,2.58707l6.98509,-6.98509m0,-1.74319l-6.98509,6.98509l-2.58707,-2.58707l-2.60555,2.60555l5.19262,5.19262l9.59063,-9.59063l-2.60555,-2.60555z"/></svg>',
            title: 'Objective'
        };
    }

    render() {
        const { getActiveStep, getTabs, getActiveTab, getDiffModels, editablePattern, stepType, fileMode } = this.config;
        const activeStep = getActiveStep();

        if (activeStep.type !== stepType.code && activeStep.type !== stepType.interactive) {
            return alert(`Objectives can't be added to ${activeStep.type} steps`);
        }

        let testEditor;

        const wrapper = document.createElement('div');
        const fileSelect = document.createElement('select');
        const editableSelect = document.createElement('select');
        const refreshButton = document.createElement('button');
        const descriptionInput = document.createElement('div');
        const testContainer = document.createElement('div');
        const getTest = () => {
            const index = editableSelect.selectedIndex;
            
            if (index < 0) return '//\tNo editable selected';

            const type = fileSelect.value.split('.').pop();
            const answer = editableSelect.value.replace(/^#\d+:\s*/, '');

            return `//\tExpectations:\npass.if.${type}.editable(${index}).equivalent(\`${answer}\`);`;
        };
        const fillDescription = () => {
            const file = fileSelect.value;
            const type = file.split('.').pop();
            const answer = editableSelect.value.replace(/^#\d+:\s*/, '');
            const description = `On <strong>${type.toUpperCase()} line ##("${file}","key")+0##</strong>, enter <code class="syntax">${answer}</code>.`;

            descriptionInput.innerHTML = '';

            new HTMLTree(description).forEach(node => {
                if (node.type === 'text') {
                    descriptionInput.append(node.raw);
                }
                else if (node.type === 'element') {
                    const el = document.createElement(node.openingTag.tagName);
                    const content = node.content[0];

                    if (content.type === 'element') {
                        el.innerText = `${content.openingTag.raw}${content.rawContent}${content.closingTag.raw}`;
                    }
                    else {
                        el.innerText = node.content[0].rawCollapsed;
                    }

                    node.openingTag.attrs.forEach(attr => el.setAttribute(attr.name, attr.value));
                    descriptionInput.append(el);
                }
            });
        };
        const updateEditableOptions = (tabName = fileSelect.value, menuOnly) => {
            editableSelect.innerHTML = '';

            if (this.data.live) {
                descriptionInput.innerHTML = this.data.title;
                return;
            }

            const selectedTabEditables = getDiffModels(tabName).modified.getValue().match(editablePattern.excludingMarkup);

            if (selectedTabEditables) {
                selectedTabEditables
                    .forEach((editableContent, index) => {
                        const editableOption = document.createElement('option');

                        editableOption.innerText = `#${index}: ${editableContent.trim()}`;
                        editableOption.value = editableOption.innerText;
                        editableSelect.append(editableOption);
                    });

                if (menuOnly) return;

                editableSelect.value = this.data.editableOption || `#0: ${selectedTabEditables[0].trim()}`;
                this.data.editableOption = editableSelect.value;

                this.data.title ? descriptionInput.innerHTML = this.data.title : fillDescription();
                this.data.title = descriptionInput.innerHTML;

                testEditor && testEditor.setValue(this.data.testFunction || getTest());
                //  this.data.testFunction update handled by onDidChangeModelContent
            }
            else if (!menuOnly) clearContent();
        };
        const updateFileOptions = () => {
            getTabs()
                .concat(({ innerText: 'Live' }))
                .forEach(tab => {
                    const fileOption = document.createElement('option');
                    const tabName = tab.innerText;

                    fileOption.value = tabName;
                    fileOption.innerText = tabName;
                    fileSelect.append(fileOption);
                });

            fileSelect.value = (this.data.live ? 'Live' : this.data.fileOption) || getActiveTab();
            this.data.fileOption = fileSelect.value;
        };
        const clearContent = () => {
            descriptionInput.innerText = 'No editable selected';
            testEditor && testEditor.setValue(getTest());

            this.data.editableOption = null;
            this.data.title = null;
            this.data.testFunction = null;
        };
        const attachMonacoEditor = () => {
            const resizeTestEditor = () => {
                const lines = testEditor.getValue().split('\n').length;

                if (lines !== testEditor.lines) {
                    testContainer.style.height = `${lines * 19 + 2}px`;
                    testEditor.layout();
                    testEditor.lines = lines;
                }

                this.data.testFunction = testEditor.getValue();
            };

            testEditor = monaco.editor.create(testContainer, {
                value: this.data.testFunction || getTest(),
                language: 'javascript',
                minimap: { enabled: false },
                scrollbar: {
                    verticalScrollbarSize: 4,
                    horizontalScrollbarSize: 2
                },
                lineNumbers: false,
                scrollBeyondLastLine: false,
                formatOnPaste: true
            });

            resizeTestEditor();

            testEditor.onDidChangeModelContent(resizeTestEditor);
        };

        wrapper.append(fileSelect, editableSelect, refreshButton, descriptionInput, testContainer);

        wrapper.classList.add('ce-objective-wrapper', this.api.styles.block);

        fileSelect.classList.add(this.api.styles.input);
        fileSelect.title = 'Pick a file for this test';

        editableSelect.classList.add(this.api.styles.input);
        editableSelect.title = 'Pick the editable region for this test';

        refreshButton.classList.add('material-icons', 'md-18', 'refresh-button');
        refreshButton.title = 'Refresh the file & editable dropdown list';
        refreshButton.innerText = 'autorenew';

        descriptionInput.classList.add('description-input', this.api.styles.input);
        descriptionInput.contentEditable = true;

        testContainer.classList.add('test-container');

        fileSelect.addEventListener('change', () => {
            const fileOption = event.target.selectedOptions[0].innerText;

            updateEditableOptions(fileOption);
            this.data.fileOption = fileOption;
        });

        editableSelect.addEventListener('change', () => {
            fillDescription();
            this.data.title = descriptionInput.innerHTML;
            this.data.editableOption = editableSelect.value;
            
            testEditor.setValue(getTest());
            //  this.data.testFunction update handled by onDidChangeModelContent
        });

        refreshButton.addEventListener('click', () => {
            updateEditableOptions(undefined, true);
            editableSelect.value = null;
            // clearContent();
        });

        descriptionInput.addEventListener('input', () => {
            this.data.title = descriptionInput.innerHTML;
            inputHandler(event);
        });
        descriptionInput.addEventListener('keydown', deleteHandler);

        updateFileOptions();
        updateEditableOptions();

        // if (this.data.title) console.log(this.data);

        setTimeout(attachMonacoEditor, 100);

        return wrapper;
    }

    save() {
        return this.data;
    }

    static get sanitize() {
        return {
            editableOption: true,
            title: true,
            testFunction: true
        };
    }
}