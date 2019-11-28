
export default class Objective {
    constructor({ api, config }) {
        this.api = api;
        this.config = config;
    }

    static get toolbox() {
        return {
            icon: '<svg width="15" height="15" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="m12.28608,3.1451l0.86236,0.86236l-7.84744,7.84744l-3.44943,-3.44943l0.86236,-0.86236l2.58707,2.58707l6.98509,-6.98509m0,-1.74319l-6.98509,6.98509l-2.58707,-2.58707l-2.60555,2.60555l5.19262,5.19262l9.59063,-9.59063l-2.60555,-2.60555z"/></svg>',
            title: 'Objective'
        };
    }

    render() {
        const { getActiveStep, getTabs, editablePattern } = this.config;
        const activeStep = getActiveStep();

        if (!/code|interactive/.test(activeStep.type)) {
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
            return `pass.if.${fileSelect.value.split('.')[1]}.editable(${editableSelect.selectedIndex}).equivalent(\`${editableSelect.selectedOptions[0].value.trim()}\`);`;
        };
        const getDescription = () => {
            return `On ${fileSelect.value.split('.')[1].toUpperCase()} line ##("${fileSelect.value}","key")+0##, type "${editableSelect.selectedOptions[0].value.trim()}".`;
        };
        const getSelectedTabContent = tabName => {
            return activeStep[tabName].author.getValue();
        };
        const extractEditables = () => getTabs().forEach(tab => {
            const fileOption = document.createElement('option');
            const tabName = tab.innerText;

            fileOption.value = tabName;
            fileOption.innerText = tabName;
            fileSelect.append(fileOption);

            if (tab.classList.contains('active')) {
                fileSelect.value = tabName;

                const fileType = tabName.split('.').pop();
                const selectedTabEditables = getSelectedTabContent(tabName).match(editablePattern.excludingMarkup);


                if (selectedTabEditables) {
                    selectedTabEditables
                        .forEach((editableContent, index) => {
                            const editableOption = document.createElement('option');

                            editableOption.value = editableContent;
                            editableOption.innerText = `#${index}: ${editableContent}`;
                            editableSelect.append(editableOption);
                        });

                    descriptionInput.innerText = getDescription(tabName, fileType, selectedTabEditables[0]);
                }    

                console.log(selectedTabEditables);
            }
        });
        const attachMonacoEditor = () => {
            const resizeTestEditor = () => {
                const lines = testEditor.getValue().split('\n').length;

                if (lines !== testEditor.lines) {
                    testContainer.style.height = `${lines * 19 + 2}px`;
                    testEditor.layout();
                    testEditor.lines = lines;
                }
            };

            testEditor = monaco.editor.create(testContainer, {
                value: `//  Expectations:\n${getTest()}`,
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

        editableSelect.addEventListener('change', () => {
            descriptionInput.innerText = getDescription();
            testEditor.setValue(`//  Expectations:\n${getTest()}`);
        });
        
        refreshButton.addEventListener('click', () => {
            fileSelect.innerHTML = '';
            editableSelect.innerHTML = '';
            extractEditables();
        });

        extractEditables();
        setTimeout(attachMonacoEditor, 100);

        return wrapper;
    }

    save() { }

    // sanitize() { }
}