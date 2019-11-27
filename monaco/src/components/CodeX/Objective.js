
export default class Objective {
    constructor({ api, config }) {
        this.api = api;
        this.config = config;
        this.getTabs = config.getTabs;
        this.getCode = config.getCode;
    }

    static get toolbox() {
        return {
            icon: '<svg width="15" height="15" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="m12.28608,3.1451l0.86236,0.86236l-7.84744,7.84744l-3.44943,-3.44943l0.86236,-0.86236l2.58707,2.58707l6.98509,-6.98509m0,-1.74319l-6.98509,6.98509l-2.58707,-2.58707l-2.60555,2.60555l5.19262,5.19262l9.59063,-9.59063l-2.60555,-2.60555z"/></svg>',
            title: 'Objective'
        };
    }

    render() {
        const wrapper = document.createElement('div');
        const fileSelect = document.createElement('select');
        const editableSelect = document.createElement('select');
        const autoFillButton = document.createElement('button');
        const descriptionInput = document.createElement('div');
        const testContainer = document.createElement('div');
        const checkButton = document.createElement('button');
        const deleteButton = document.createElement('button');

        wrapper.append(fileSelect, editableSelect, autoFillButton, descriptionInput, testContainer, checkButton, deleteButton);

        autoFillButton.className = 'material-icons';
        autoFillButton.innerText = 'memory';
        
        checkButton.classList.add('material-icons', 'md-18', 'check-button');
        checkButton.innerText = 'autorenew';
        
        deleteButton.classList.add('material-icons', 'md-18', 'delete-button');
        deleteButton.innerText = 'delete';

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

        fileSelect.title = 'Pick a file for this test';
        editableSelect.title = 'Pick the editable region for this test';

        wrapper.classList.add('ce-objective-wrapper', this.api.styles.block);
        fileSelect.classList.add(this.api.styles.input);
        editableSelect.classList.add(this.api.styles.input);
        autoFillButton.classList.add('auto-fill');
        descriptionInput.classList.add('description-input', this.api.styles.input);
        testContainer.classList.add('test-container');

        descriptionInput.contentEditable = true;

        setTimeout(() => {
            const testEditor = monaco.editor.create(testContainer, {
                value: `//  Expectations:\npass.if.${fileSelect.value.split('.')[1]}.editable(${0}).equivalent(\`\`);`,
                language: 'javascript',
                minimap: { enabled: false },
                scrollbar: {
                    verticalScrollbarSize: 5,
                    horizontalScrollbarSize: 5
                },
                lineNumbers: false,
                scrollBeyondLastLine: false,
                formatOnPaste: true
            });
            const resizeTestEditor = () => {
                const lines = testEditor.getValue().split('\n').length;

                if (lines !== testEditor.lines) {
                    testContainer.style.height = `${lines * 19 + 5}px`;
                    testEditor.layout();
                    testEditor.lines = lines;
                }
            };

            resizeTestEditor();

            testEditor.onDidChangeModelContent(resizeTestEditor);
        }, 100);

        return wrapper;
    }

    save() { }

    // sanitize() { }
}