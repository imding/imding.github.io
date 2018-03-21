const taInstruction = document.getElementById('instruction');
const btnLoad = document.getElementById('load');
const btnConvert = document.getElementById('convert');
const btnSave = document.getElementById('save');
const btnPrev = document.getElementById('prev');
const btnNext = document.getElementById('next');
const btnAdd = document.getElementById('add');
const btnDel = document.getElementById('delete');
const btnDupPrev = document.getElementById('dupPrev');
const btnHTML = document.getElementById('html');
const btnCSS = document.getElementById('css');
const btnJS = document.getElementById('js');
const btnRun = document.getElementById('run');
const btnDupNext = document.getElementById('dupNext');
const srcCode = document.getElementById('srcCode');
const stepLogic = document.getElementById('stepLogic');
const info = document.getElementById('info');

let gutter;
let activeCodeBtn;                  // CURRENT CODE BUTTON
let codeEditor;                     // CODE EDITOR
let logicEditor;                    // LOGIC EDITOR
let preview;                        // PREVIEW IFRAME
let styledInstruction;              // STYLED INSTRUCTION IFRAME
let pkey;                           // PREVIOUS KEY PRESSED
let cProj = 'Untitled';             // CURRENT PROJECT NAME
let cStep = 1;                      // CURRENT STEP
let tSteps = 1;                     // TOTAL STEPS

let inst = [''];                    // INSTRUCTION FOR ALL STEPS
let html = '', css = '', js = '';
let code = [''];                    // CODE FOR ALL STEPS
let htmlLogic = ''; cssLogic = ''; jsLogic = '';
let logic = [''];                   // TRANITION FOR ALL STEPS
let step = [''];                    // COMBINATION OF THE ABOVE
let master;                         // SINGLE STRING FOR ENTIRE PROJECT

let instToken, instTokenEnd, instBlock, instExp;
let codeToken, codeTokenEnd, codeBlock, codeExp;
let logicToken, logicTokenEnd, logicBlock, logicExp;
let stepToken, stepTokenEnd, stepBlock;

const htmlToken = ['##HTML##', '##HTML_E##', /##HTML##.*##HTML_E##/];
const cssToken = ['##CSS##', '##CSS_E##', /##CSS##.*##CSS_E##/];
const jsToken = ['##JS##', '##JS_E##', /##JS##.*##JS_E##/];   
const markup = ['#BEGIN_EDITABLE#', '#END_EDITABLE#'];

const vDiv = document.createElement('div');
const hDiv = document.createElement('div');
const vDivMin = 450, hDivMin = 250;
let vDivPos = 0.3, hDivPos = 0.8;     // INITIAL DIVIDER POSIITIONS
let xOffset, yOffset;

const pagePadding = 20, margin = 10;
const divWidth = '10px';

const aceOptions = {
    printMargin: false,
    fixedWidthGutter: true,
    enableBasicAutocompletion: true,
    enableSnippets: true,
    enableLiveAutocompletion: true,
};

const template = [
    'Generic\n\nParagraph\n\nParagraph\n\n(***)\n\n(!)On +type#key#, objective',
    'Syntax\n\nDescribe the purpose of the syntax\n\n(type)(#)\n\n[-\n\t(*)`syntax`\n\t(*)`syntax`\n\t(*)*Example:* \n-]\n\n(***)\n\n(!)On +type#key#, focus on reproducing the syntax\n(!)On +type#key#, focus on reproducing the syntax',
    'Exercise\n\n[The Problem] Help to understand the problem\n\n[The Question] No answer giveaway\n\n(***)\n\n(!)On +type#key#, focus on applying the syntax',
    'Summary\n\nGreat job!\n\nYou have completed this sprint, here is a recap:\n[-\n\t(*)item 1\n\t(*)item 2\n-]'
];

// ==================== EVENT LISTENER ==================== //
window.onload = () => {
    taInstruction.addEventListener('keydown', keyHandler, false);
    taInstruction.onblur = () => { info.value = `${cProj} - ${cStep} / ${tSteps} - ${getStepName()}`; };
    info.onfocus = () => { editProjectInfo(); };
    info.onblur = () => { updateProjectInfo(); };
    info.onkeydown = (evt) => { if (evt.code == 'Enter') { info.blur(); }};
    btnLoad.ondblclick = () => { loadTextFile(); };
    btnConvert.onclick = () => { convertInstruction(); };
    btnSave.onclick = () => { commitToMaster(); saveTextFile(master); };
    btnPrev.onclick = () => { prevStep(); updateStepLogic(); };
    btnAdd.onclick = () => { addStep(); updateStepLogic(); };
    btnDel.onclick = () => { confirmDel(); };
    btnNext.onclick = () => { nextStep(); updateStepLogic(); };
    btnDupPrev.onclick = () => { copyCode(cStep - 1); };
    btnHTML.onclick = (evt) => { toggleCodePanel(evt.target); codeEditor.getSession().setMode('ace/mode/html'); };
    btnCSS.onclick = (evt) => { toggleCodePanel(evt.target); codeEditor.getSession().setMode('ace/mode/css'); };
    btnJS.onclick = (evt) => { toggleCodePanel(evt.target); codeEditor.getSession().setMode('ace/mode/javascript'); };
    btnRun.onclick = () => { updatePreview(); };
    btnRun.ondblclick = () => { closePreview(); };
    btnDupNext.onclick = () => { copyCode(cStep + 1); };
    btnHTML.disabled = true; btnHTML.style.background = 'indianred'; activeCodeBtn = btnHTML;
    btnCSS.style.background = 'darkseagreen'; btnJS.style.background = 'darkseagreen';

    initializeUI();

    ace.require('ace/ext/language_tools');
    codeEditor = ace.edit('codeEditor');
    codeEditor.setTheme('ace/theme/monokai');
    codeEditor.session.setMode('ace/mode/html');
    logicEditor = ace.edit('logicEditor');
    logicEditor.setTheme('ace/theme/tomorrow');
    logicEditor.setHighlightGutterLine(false);
    logicEditor.session.setMode('ace/mode/javascript');
    logicEditor.on('focus', () => { logicEditor.setReadOnly(cStep < 2); });
    logicEditor.on('blur', () => { highlightButton(); });
    gutter = Array.from(document.getElementsByClassName('ace_gutter'))[1];

    codeEditor.setOptions(aceOptions);
    logicEditor.setOptions(aceOptions);

    codeEditor.$blockScrolling = Infinity; logicEditor.$blockScrolling = Infinity;              // FIX FOR UNKNOWN ACE EDITOR ISSUE

    setValue(codeEditor, [
        '<!DOCTYPE html>',
        '<html>',
        '<head>',
        '\t<link rel="stylesheet" type="text/css" href="style.css"/>',
        '\t<script type="text/javascript" src="script.js"></script>',
        '</head>',
        '<body>\n\t',
        '</body>',
        `</html>`,
    ].join('\n'));
    
    taInstruction.value = `Introduction\n\n[Scenario] Why is this useful?\n\n[Learning Outcome] Exactly what the learner will do.\n\n[Result]`;
    // taInstruction.value = `Adding the onclick attribute\n\nThe player needs to click on one of the 3 images to play this game, so they each needs to respond to the *mouse click event*.\n\nWe can do this with the #GLS(HTML-onclick)# attribute.\n\nThe \`onclick\` attribute must have a value that is the name of a JavaScript #GLS(JS-function)#.\n\nYou can even change the #GLS(CSS-background-color)# of the element.\n\n(***)\n\n(!) create the \`onclick\` attribute`;

    updateStepLogic();
};

window.onkeydown = (evt) => {//   console.log(evt.keyCode);
    const c1 = evt.keyCode == 116;                    // DISABLE F5
    const c2 = evt.location == 1 && evt.ctrlKey;      // EXTRA 'CTRL' KEY PRODUCED BY 'LEFT ALT'

    if (c1 || c2) return false;
    
    if (evt.altKey && evt.code != pkey) {           // 'ALT' KEY *AND* NON-REPEATED KEY
        evt.preventDefault();
        switch (evt.code) {
            case 'Digit0': taInstruction.value = template[0]; break;
            case 'Digit1': taInstruction.value = template[1]; break;
            case 'Digit2': taInstruction.value = template[2]; break;
            case 'Digit3': taInstruction.value = template[3]; break;
            case 'Slash': codeEditor.insert(`${markup[0]}${codeEditor.getSelectedText()}${markup[1]}`); break;
            case 'KeyN': btnAdd.click(); break;
            case 'KeyP': btnRun.click(); break;
            case 'KeyL': if (cStep > 1) { testLogic(); break; } else { break; };
            case 'KeyK': generateTest(); break;
            case 'KeyI': btnConvert.click(); break;
            case 'Backspace': closePreview(); break;
            case 'BracketLeft': btnPrev.click(); break;
            case 'BracketRight': btnNext.click(); break;
            case 'Minus': activeCodeBtn == btnHTML ? btnHTML.click() : (activeCodeBtn == btnCSS ? btnHTML.click() : btnCSS.click()); break;
            case 'Equal': activeCodeBtn == btnJS ? btnJS.click() : (activeCodeBtn == btnCSS ? btnJS.click() : btnCSS.click()); break;
            case 'Period': btnDupPrev.click(); break;
            case 'Comma': btnDupNext.click(); break;
            default: break;
        }
        pkey = evt.code.replace(/KeyP|KeyL|KeyI|BracketLeft|BracketRight|Minus|Equal/, '');       // LIST OF KEYS TO ALLOW REPEATED PRESS
    }

    if (evt.code == 'Escape') {
        const b = document.getElementById('glsClose');
        if (b) {
            evt.preventDefault();
            b.click();
        }
    }
};

window.onresize = updateUI;

window.onmouseup = () => {
    window.removeEventListener('mousemove', moveDivider, true);
    vDivPos = get(vDiv, 'left') / window.innerWidth;
    hDivPos = get(hDiv, 'top') / window.innerHeight;
};

// ==================== PROJECT INFO ==================== //
function editProjectInfo() {
    info.style.background = 'rgba(248, 248, 255, .1)';
    info.value = cProj;
    info.select();
}

function updateProjectInfo() {
    info.style.background = 'none';
    cProj = info.value;
    info.value = `${cProj} - ${cStep} / ${tSteps} - ${getStepName()}`;
}

// ==================== INSTRUCTION ==================== //
function convertInstruction() {
    if (!styledInstruction) {
        inst[cStep] = taInstruction.value;
        btnConvert.className = 'fa fa-clipboard';
        styledInstruction = document.createElement('div');
        styledInstruction.id = 'styledInstruction';
        alignElement(styledInstruction);
        document.body.appendChild(styledInstruction);
        updateStyledInstruction();
    } else {
        btnConvert.className = 'fa fa-pencil';
        taInstruction.value = inst[cStep];
        document.body.removeChild(styledInstruction);
        styledInstruction = null;
    }
}

function updateStyledInstruction() {
    const highlight = /^(\t?)\(!\)\s*(.+[^\s]).*/,
        notes = /^(\t?)\(\*\*?\)\s*(.+[^\s]).*/,
        loc = /(?:(\w+)\.)?(html|css|js)#([^#\n]+)#([-+]\d+)?/,
        image = /\[IMG::(https?:\/\/[^\'"\s]+\.(jpg|gif|jpeg|bmp|png|svg))\]/gi,
        link = /\[([^\]:]+)::([^\s]+)\]/g,
        bold = /\*([^\s*]+|[^\s][^*]+[^\s])\*/g,
        code = /`([^\s`]+|[^\s][^`]+[^\s])`/g,
        glossary = /#GLS\(([a-zA-Z]+)-([a-zA-Z0-9-]+)\)#/g;
    let source = inst[cStep].replace(/</g, '&lt;').split(/\r?\n/).slice(2),
        isList = false,
        isPre = false;

    source.forEach((e, i) => {
        while (loc.test(e)) {
            const query = e.match(loc),
                name = query[1] || (query[2] == 'html' ? 'index' : query[2] == 'css' ? 'style' : 'script');
            
            e = e.replace(loc, `<b>##LINE('${name}.${query[2]}','${query[3]}')${query[4] || ''}##</b>`);
            if (query.input[query.index - 1] == '+') {
                e = e.splice(query.index - 1, 1, `<b>${query[2].toUpperCase().replace(/JS/, 'JavaScript')} line</b> `);
            }
        }

        isList = /^\[(-|=)/.test(e) ? true : isList;            // BEGINNING OF A LIST
        isPre = /^\((html|css|js)\)/.test(e) ? true : isPre;    // BEGINNING OF SNIPPET

        if (/^\(\-{3}\)/.test(e)) {                 // - EXAMPLE -
            source[i] = '<center><p><b>- EXAMPLE -</b></p></center>';
        } else if (/^\(\*{3}\)/.test(e)) {                 // - OBJECTIVES -
            source[i] = '<center><p><b>- OBJECTIVES -</b></p></center>';
        } else if (highlight.test(e)) {             // OBJECTIVE HIGHLIGHT
            source[i] = e.replace(highlight, '$1<p class="highlight">$2</p>');
        } else if (notes.test(e)) {                 // NOTES HIGHLIGHT
            const center = /^\t?\(\*\*\)/.test(e);
            source[i] = `${center ? '<center>' : ''}${e.replace(notes, '$1<p class="notes">$2</p>')}${center ? '</center>' : ''}`;
        } else if (image.test(e)) {
            source[i] = e.replace(image, '<center><p class="notes"><a href="$1" target="_blank"><img src="$1"></a>Click the image to open it in a new tab</p></center>');
        } else {
            source[i] = (e.trim().length && !isPre && !isList) ? `<p>${e}</p>` : e;
        }

        source[i] = isList ? source[i].replace(/^\t(.+)/, '\t<li>$1</li>') : source[i];
        isList = /(-|=)\]$/.test(e) ? false : isList;   // END OF A LIST
        isPre = /\(#\)/.test(e) ? false : isPre;        // END OF SNIPPET
    });

    source = source.join('\n').replace(/\[-/g, '<ul>').replace(/-\]/g, '</ul>').replace(/\[=/g, '<ol>').replace(/=\]/g, '</ol>');                           // LISTS
    source = source.replace(/\((html|css|js)\)/g, '<pre class="language-$1"><code class="snippet">').replace(/-js/g, '-javascript').replace(/\(#\)/g, '</code></pre>');     // CODE SNIPPETS
    source = source.replace(bold, '<b>$1</b>').replace(code, '<code class="syntax">$1</code>').replace(link, '<a href="$2" target="_blank">$1</a>');
    source = source.replace(glossary, '<code class="glossary gls$1"><i class="fa fa-rocket glsIcon"></i><span class="glossary-link gls$1">$2</span></code>');
    source += (cStep > 1 && cStep < tSteps ? '\n<hr>\n<p class="highlight">Click on <b>Check all objectives</b> to continue</p>' :
        cStep == 1 ? '\n<hr>\n<p class="highlight">Click on <b>Next step</b> to get started</p>' :
        cStep > 10 ? '\n<hr>\n<p class="highlight"><b>Export to Sandbox</b> to continue working on it</p>' : '');

    // taInstruction.value = source;
    styledInstruction.innerHTML = source + '<link rel="stylesheet" href="css/instructions.css">';
    selectAndCopy(styledInstruction);
    convertLineNumber();

    const btnGlossary = Array.from(document.getElementsByClassName('glossary'));
    btnGlossary.forEach(b => {
        b.onclick = function() {
            const glsBackdrop = document.createElement('div');
            const glsWrapper = document.createElement('div');
            const glsClose = document.createElement('div');
            
            document.body.appendChild(glsBackdrop);
            document.body.appendChild(glsWrapper);
            glsWrapper.appendChild(glsClose);
            
            glsBackdrop.id = 'glsBackdrop';

            glsWrapper.id = 'glsWrapper';
            glsWrapper.style.left = `${styledInstruction.offsetLeft + b.offsetLeft + (b.offsetWidth / 2)}px`;
            glsWrapper.style.top = `${styledInstruction.offsetTop + b.offsetTop + (b.offsetHeight / 2)}px`;

            setTimeout(() => {
                glsBackdrop.style.opacity = '0.6';
                glsWrapper.style.opacity = '1';
                glsWrapper.style.width = '500px';
                glsWrapper.style.height = '350px';
                glsWrapper.style.left = 'calc(50% - 250px)';
                glsWrapper.style.top = 'calc(50% - 175px)';
            }, 0);

            glsWrapper.addEventListener('transitionend', function(evt) {
                if (glsClose.id) {
                    if (evt.propertyName == 'width') {
                        document.body.removeChild(this);
                    }
                }
                else {
                    if (evt.propertyName == 'width') {
                        glsClose.id = 'glsClose';
                        glsClose.innerHTML = '&#10539;';
                        glsClose.style.left = `${glsWrapper.offsetWidth - glsClose.offsetWidth - 10}px`;
                    }
                }
            }, false);

            glsClose.onclick = function() {
                glsBackdrop.style.opacity = '0';
                glsWrapper.style.opacity = '0';
                glsWrapper.style.width = '0';
                glsWrapper.style.height = '0';
                glsWrapper.style.left = `${styledInstruction.offsetLeft + b.offsetLeft + (b.offsetWidth / 2)}px`;
                glsWrapper.style.top = `${styledInstruction.offsetTop + b.offsetTop + (b.offsetHeight / 2)}px`;

                glsBackdrop.addEventListener('transitionend', function() {
                    document.body.removeChild(this);
                }, false);
            };
        };
    });
}

function convertLineNumber() {
    let siClone = styledInstruction.innerHTML;
    const markupReg = /##LINE\('([^']+)','([^']+)'\)([+-]\d)*##/;

    storeActiveCode();
    
    while (markupReg.test(siClone)) {
        const markup = siClone.match(markupReg);
        let n, target = noMarkup(eval(markup[1].split(/\./)[1])).split(/\r?\n/);

        target.forEach((line, i) => {
            if (line.includes(markup[2])) {
                if (!n) {
                    line = line.replace(markup[2], '');
                    n = line.includes(markup[2]) ? `'${markup[2]}' NOT UNIQUE` : i + 1;
                } else {
                    n = `'${markup[2]}' NOT UNIQUE`;
                }
            }
        });
        n = markup[3] ? eval(`n${markup[3]}`) : n;      // markup[3] is offset
        siClone = siClone.replace(markup[0], n ? n : `'${markup[2]}' NOT FOUND`);
    }
    styledInstruction.innerHTML = siClone;
}

function selectAndCopy(elem) {
    const selection = window.getSelection(),
        rangeObj = document.createRange();
    let currentFocus;

    if (selection.baseNode && selection.baseNode.id && selection.baseNode.id.endsWith('Editor')) {
        currentFocus = eval(selection.baseNode.id);
        currentFocus.blur();
    }
    rangeObj.selectNodeContents(elem);
    selection.empty();
    selection.addRange(rangeObj);
    document.execCommand('copy');
    currentFocus ? currentFocus.focus() : null;
}

// ==================== SOURCE CODE OPERATION ==================== //
function toggleCodePanel(targetBtn) {
    storeActiveCode();
    activeCodeBtn.disabled = false;
    targetBtn.disabled = true;
    activeCodeBtn = targetBtn;
    setValue(codeEditor, getActiveCode('code', cStep));
    setValue(logicEditor, getActiveCode('logic', cStep));
    updateCodeButtons();
    highlightButton();
}

function updateCodeButtons() {
    [btnHTML, btnCSS, btnJS].forEach((btn, i) => {    // COLOUR CODING BUTTONS
        btn.style.background = btn != activeCodeBtn ? ([html, css, js][i].trim().length > 0 ? 'forestgreen' : 'darkseagreen') : 'indianred';
    });
}

function copyCode(n) {
    if (n > 0 && n <= tSteps) {
        setValue(codeEditor,
            activeCodeBtn == btnHTML ? decodeURI(encodeURI(code[n]).match(htmlToken[2])[0].replace(htmlToken[0], '').replace(htmlToken[1], '')) :
            activeCodeBtn == btnCSS ? decodeURI(encodeURI(code[n]).match(cssToken[2])[0].replace(cssToken[0], '').replace(cssToken[1], '')) :
            decodeURI(encodeURI(code[n]).match(jsToken[2])[0].replace(jsToken[0], '').replace(jsToken[1], ''))
        );
    }
}

function updatePreview() {
    storeActiveCode();
    
    const pCode = [
        '<!DOCTYPE html>',
        '<html>',
        '<head>',
        '\t<meta charset="UTF-8">',
        '\t<title>' + cProj + '</title>',
        '\t<link rel="stylesheet" href="font-awesome-4.7.0/css/font-awesome.min.css">',
        '\t<style>\n',
        '\t' + (noMarkup(css).trim().length > 0 ? noMarkup(css).split(/\r?\n/).join('\n\t') : '/* NO STYLE */'),
        '\n\t</style>',
        '</head>\n',
        '<body>',
        noMarkup(html).trim().length > 0 ? noMarkup(html).replace(/[\s\S]+<body>/, '').replace(/<\/body>[\s\S]+/, '') : '<!-- NO HTML -->',
        '<script type="text/javascript">\n',
        noMarkup(js).trim().length > 0 ? noMarkup(js) : '// NO SCRIPT',
        '\n</script>\n',
        '</body>',
        '</html>',
    ].join('\n');

	if (!document.getElementById('preview')) {
	    storeActiveCode();
	    preview = document.createElement('iframe');
	    preview.id = 'preview';
	    alignElement(preview);
	    document.body.appendChild(preview);
    }
    preview.srcdoc = pCode;
}

function noMarkup(str) {
    return str.replace(new RegExp(`(${markup[0]}\\s*)|(\\s*${markup[1]})`, 'g'), '');
}

function closePreview() {
    if (preview) {
        document.body.removeChild(preview);
        preview = null;
    }
}

// ==================== STEP EDITING ==================== //
function updateStepLogic() {
    btnDel.disabled = tSteps < 2; btnDel.style.background = tSteps < 2 ? 'indianred' : 'forestgreen';
    btnPrev.disabled = cStep < 2; btnPrev.style.background = cStep < 2 ? 'indianred' : 'forestgreen';
    btnNext.disabled = cStep == tSteps; btnNext.style.background = cStep == tSteps ? 'indianred' : 'forestgreen';
    btnDupPrev.style.background = btnPrev.style.background;
    btnDupNext.style.background = btnNext.style.background;
    info.value = `${cProj} - ${cStep} / ${tSteps} - ${getStepName()}`;
    highlightButton();
}

function addStep() {
    updateContent(0);
    tSteps++;
    cStep++;
    inst.splice(cStep, 0, ''); logic.splice(cStep, 0, ''); code.splice(cStep, 0, htmlToken[0] + htmlToken[1] + cssToken[0] + cssToken[1] + jsToken[0] + jsToken[1]);
    updateCodeButtons();
    preview ? updatePreview() : null;
    styledInstruction ? btnConvert.click() : null;
    if (logicEditor.getReadOnly) {
        logicEditor.setReadOnly(false);
    }
}

function confirmDel() {
    switch (get(btnDel, 'background')) {
        case '34, 139, 34':
            btnDel.style.background = 'firebrick';
            setTimeout(() => { btnDel.style.background = tSteps < 2 ? 'indianred' : 'forestgreen'; }, 1000);
            break;
        case '178, 34, 34':
            btnDel.style.background = 'darkred';
            break;
        default:
            delStep();
            updateStepLogic();
    }
}

function delStep() {
    inst.splice(cStep, 1); code.splice(cStep, 1); logic.splice(cStep, 1);
    tSteps--;
    cStep = cStep > tSteps ? tSteps : cStep;
    taInstruction.value = inst[cStep];
    loadCodeInStep(cStep);
    setValue(codeEditor, getActiveCode('code', cStep));
    setValue(logicEditor, getActiveCode('logic', cStep));
    updateCodeButtons();
    preview ? updatePreview() : null;
    styledInstruction ? updateStyledInstruction() : null;
}

function prevStep() {
    updateContent(cStep - 1);
    updateCodeButtons();
    cStep--;
    preview ? updatePreview() : null;
    styledInstruction ? updateStyledInstruction() : null;
}

function nextStep() {
    updateContent(cStep + 1);
    updateCodeButtons();
    cStep++;
    preview ? updatePreview() : null;
    styledInstruction ? updateStyledInstruction() : null;
}

function getStepName() {
    return (btnConvert.className == 'fa fa-pencil' ? (taInstruction.value.trim().length > 0 ? taInstruction.value : `Step ${cStep}`) : inst[cStep]).split(/\r?\n/)[0].trim();
}

// ==================== DATA OPERATION ==================== //
function setValue(editor, value, cursor = {}) {
    if (!cursor.hasOwnProperty('row', 'column')) {
        cursor = editor.selection.getCursor();
    }
    editor.setValue(value);
    editor.gotoLine(cursor.row + 1, cursor.column, false);
}

function updateContent(i) {                                                  // STORE CURRENT CONTENT AND DISPLAY NEW CONTENT
    inst[cStep] = taInstruction.value;
    taInstruction.value = inst[i];
    storeActiveCode();
    loadCodeInStep(i);
    setValue(codeEditor, i == cStep ? codeEditor.getValue() : getActiveCode('code', i));
    setValue(logicEditor, i == cStep ? logicEditor.getValue() : getActiveCode('logic', i));
}

function storeActiveCode(step = cStep) {
    btnHTML.disabled ? html = codeEditor.getValue() : (btnCSS.disabled ? css = codeEditor.getValue() : js = codeEditor.getValue());                     // STORE CONTENT OF ACTIVE CODE PANEL
    code[cStep] = htmlToken[0] + html + htmlToken[1] + cssToken[0] + css + cssToken[1] + jsToken[0] + js + jsToken[1];                                  // STORE CODE FOR CURRENT STEP
    btnHTML.disabled ? htmlLogic = logicEditor.getValue() : (btnCSS.disabled ? cssLogic = logicEditor.getValue() : jsLogic = logicEditor.getValue());   // STORE CONTENT OF ACTIVE LOGIC PANEL
    logic[cStep] = htmlToken[0] + htmlLogic + htmlToken[1] + cssToken[0] + cssLogic + cssToken[1] + jsToken[0] + jsLogic + jsToken[1];                  // STORE CODE FOR CURRENT STEP
}

function getActiveCode(type, step = cStep) {     // RETURN LOGIC OR SOURCE CODE CURRENTLY VISIBLE
    const token = activeCodeBtn == btnHTML ? htmlToken : (activeCodeBtn == btnCSS ? cssToken : jsToken);
    if (encodeURI(eval(type)[step]).match(token[2])) {
        const activeCode = decodeURI(encodeURI(eval(type)[step]).match(token[2])[0].replace(token[0], '').replace(token[1], ''));
        if (type == 'code') {
            return btnHTML.disabled ? html = activeCode : (btnCSS.disabled ? css = activeCode : js = activeCode);
        } else {
            return btnHTML.disabled ? htmlLogic = activeCode : (btnCSS.disabled ? cssLogic = activeCode : jsLogic = activeCode);
        }        
    } else {
        return '';
    }
}

function loadToMemory(str) {
    inst = ['']; code = ['']; logic = ['']; step = [''];         // RESET ARRAYS
    tSteps = str.match(/^\d+/)[0]; cStep = 1;
    for (i = 1; i <= tSteps; i++) {
        instBlock = `##INST_${i}##.*##INST_${i}E##`; instExp = new RegExp(instBlock, 'g');
        codeBlock = `##CODE_${i}##.*##CODE_${i}E##`; codeExp = new RegExp(codeBlock, 'g');
        logicBlock = `##LOGIC_${i}##.*##LOGIC_${i}E##`; logicExp = new RegExp(logicBlock, 'g');
        inst[i] = decodeURI(str.match(instExp)[0].replace(`##INST_${i}##`, '').replace(`##INST_${i}E##`, ''));
        code[i] = decodeURI(str.match(codeExp)[0].replace(`##CODE_${i}##`, '').replace(`##CODE_${i}E##`, ''));
        logic[i] = decodeURI(str.match(logicExp)[0].replace(`##LOGIC_${i}##`, '').replace(`##LOGIC_${i}E##`, ''));
    }
    taInstruction.value = inst[cStep];
    loadCodeInStep(cStep);
    setValue(codeEditor, getActiveCode('code', cStep));
    setValue(logicEditor, getActiveCode('logic', cStep));
    updateStepLogic();
    updateCodeButtons();
}

function loadCodeInStep(step) {
    if (step == 0) {
        html = ''; css = ''; js = '';
        htmlLogic = ''; cssLogic = ''; jsLogic = '';
    } else {
        html = decodeURI(encodeURI(code[step]).match(htmlToken[2])[0].replace(htmlToken[0], '').replace(htmlToken[1], ''));
        css = decodeURI(encodeURI(code[step]).match(cssToken[2])[0].replace(cssToken[0], '').replace(cssToken[1], ''));
        js = decodeURI(encodeURI(code[step]).match(jsToken[2])[0].replace(jsToken[0], '').replace(jsToken[1], ''));
        htmlLogic = decodeURI(encodeURI(logic[step]).match(htmlToken[2])[0].replace(htmlToken[0], '').replace(htmlToken[1], ''));
        cssLogic = decodeURI(encodeURI(logic[step]).match(cssToken[2])[0].replace(cssToken[0], '').replace(cssToken[1], ''));
        jsLogic = decodeURI(encodeURI(logic[step]).match(jsToken[2])[0].replace(jsToken[0], '').replace(jsToken[1], ''));
    }
}

function commitToMaster() {
    updateContent(cStep);
    for (i = 1; i <= tSteps; i++) {
        instToken = `##INST_${i}##`, instTokenEnd = `##INST_${i}E##`;
        codeToken = `##CODE_${i}##`, codeTokenEnd = `##CODE_${i}E##`;
        logicToken = `##LOGIC_${i}##`, logicTokenEnd = `##LOGIC_${i}E##`;
        stepToken = `##STEP_${i}##`, stepTokenEnd = `##STEP_${i}E##`;
        step[i] = stepToken + instToken + encodeURI(inst[i]) + instTokenEnd + codeToken + encodeURI(code[i]) + codeTokenEnd + logicToken + encodeURI(logic[i]) + logicTokenEnd + stepTokenEnd;
    }
    master = tSteps + step.join('');
}

// ==================== FILE I/O ==================== //
function saveTextFile(txt) {
    const textToSaveBlob = new Blob([txt], { type: 'text/plain' }),
        textToSaveURL = window.URL.createObjectURL(textToSaveBlob),
        fileNameToSave = `${cProj}.txt`;
    let downloadLink = document.createElement('a');
    downloadLink.download = fileNameToSave;
    downloadLink.href = textToSaveURL;
    downloadLink.style.display = 'none';
    downloadLink.click();
}

function loadTextFile() {
    let fileToLoad = document.createElement('input');
    fileToLoad.type = 'file';
    fileToLoad.accept = '.txt';
    fileToLoad.style.display = 'none';
    fileToLoad.click();
    fileToLoad.onchange = () => {
        const fileReader = new FileReader();
        fileReader.onload = (fileLoadedEvent) => {
            loadToMemory(fileLoadedEvent.target.result);
            cProj = fileToLoad.value.split('\\').pop().replace(/\.txt/, '');
            getStepName(cStep);
            info.value = `${cProj} - ${cStep} / ${tSteps} - ${getStepName()}`;
        };
        fileReader.readAsText(fileToLoad.files[0], 'UTF-8');
    };
}

// ==================== HANDLER ==================== //
function keyHandler(e) {
    const TABKEY = 9;
    if (e.keyCode == TABKEY) {
        const bc = this.value.slice(0, this.selectionStart),
            ac = this.value.slice(this.selectionStart, this.value.length);
        this.value = `${bc}\t${ac}`;
        this.setSelectionRange(this.value.length - ac.length, this.value.length - ac.length);
        if (e.preventDefault) {
            e.preventDefault();
        }
        return false;
    }
}

// ==================== UI ==================== //
function updateUI() {
    [btnLoad, btnConvert, btnSave, btnDupPrev, btnHTML, btnCSS, btnJS, btnRun, btnDupNext].forEach((e) => { e.style.top = `${pagePadding}px`; });
    [btnPrev, btnAdd, btnDel, btnNext, info].forEach((e) => { e.style.bottom = `${pagePadding}px`; });
    flexDivider();
    scaleContent();    
}

function scaleContent() {
    // ===== LEFT SIDE ===== //   
    btnLoad.style.left = pagePadding * 3 + 'px';
    btnSave.style.left = get(vDiv, 'left') - get(btnSave, 'width') - pagePadding * 2 + 'px';
    [btnPrev, btnAdd, btnDel, btnNext].forEach((e, i, arr) => {
        e.style.left = i * (get(e, 'width') + margin) +                                                                                     // POSITION EACH BUTTON
                (get(vDiv, 'left') - pagePadding - arr.length * get(e, 'width') - margin * (arr.length - 1)) / 2 + pagePadding + 'px';      // OFFSET TO CENTRE
    });
    taInstruction.style.left = pagePadding + 'px';
    taInstruction.style.top = get(btnLoad, 'top') + get(btnLoad, 'height') + margin + 'px';
    taInstruction.style.width = get(vDiv, 'left') - pagePadding + 'px';
    taInstruction.style.height = get(btnPrev, 'top') - margin - get(taInstruction, 'top') + 'px';
    btnConvert.style.left = get(taInstruction, 'width') / 2 - get(btnConvert, 'width') / 2 + pagePadding + 'px';

    preview ? alignElement(preview) : null;
    styledInstruction ? alignElement(styledInstruction) : null;

    // ===== RIGHT SIDE ===== //
    btnDupPrev.style.left = get(vDiv, 'left') + get(vDiv, 'width') + pagePadding + 'px';
    btnDupNext.style.right = pagePadding * 2 + 'px';
    [btnHTML, btnCSS, btnJS, btnRun].forEach((e, i, arr) => {
        e.style.left = i * (get(e, 'width') + margin / 2) + get(vDiv, 'left') + get(vDiv, 'width') +                                                // POSITION EACH BUTTON
            (get(hDiv, 'width') - get(vDiv, 'width') - arr.length * get(e, 'width') - margin / 2 * (arr.length - 1) - pagePadding) / 2 + 'px';      // OFFSET TO CENTRE
    });
    srcCode.style.top = get(btnRun, 'top') + get(btnRun, 'height') + margin + 'px';
    srcCode.style.height = get(hDiv, 'top') - get(srcCode, 'top') + 'px';
    stepLogic.style.top = get(hDiv, 'top') + get(hDiv, 'height') + 'px';
    stepLogic.style.height = get(info, 'top') - get(stepLogic, 'top') - margin + 'px';
    [srcCode, stepLogic, info].forEach((e) => {
        e.style.left = get(vDiv, 'left') + get(vDiv, 'width') + 'px';
        e.style.width = get(hDiv, 'width') - get(vDiv, 'width') - pagePadding + 'px';
    });    
    codeEditor ? codeEditor.resize(codeEditor) : null;
    logicEditor ? logicEditor.resize(logicEditor) : null;
}

function moveDivider(evt) {
    vDiv.style.left = clamp(evt.clientX - xOffset, vDivMin, window.innerWidth - vDivMin) + 'px';
    hDiv.style.top = clamp(evt.clientY - yOffset, hDivMin, window.innerHeight - (hDivMin - 100)) + 'px';
    hDiv.style.width = window.innerWidth - get(vDiv, 'left') + 'px';
    scaleContent();
}

function flexDivider() {
    vDiv.style.left = vDivMin + 'px';
    hDiv.style.top = window.innerHeight - (hDivMin - 100) + 'px';
    vDiv.style.height = window.innerHeight + 'px';
    hDiv.style.width = window.innerWidth - vDivMin + 'px';
}

function alignElement(e, target = taInstruction) {
    e.style.left = get(target, 'left') + 'px';
    e.style.top = get(target, 'top') + 'px';
    e.style.width = get(target, 'width') + 'px';
    e.style.height = get(target, 'height') + 'px';

    if (e == styledInstruction) {        
        e.style.padding = `0 ${(target.offsetWidth - 380) / 2}px`;
    }
}

function initializeUI() {
    document.body.appendChild(hDiv);
    document.body.appendChild(vDiv);
    vDiv.id = 'vDiv'; hDiv.id = 'hDiv';
    vDiv.style.width = divWidth; hDiv.style.height = divWidth;
    vDiv.style.top = '0'; hDiv.style.right = '0';
    [vDiv, hDiv].forEach((e) => {
        e.style.cursor = 'cell';
        e.style.userSelect = 'none';
    });

    vDiv.onmousedown = (evt) => {
        xOffset = evt.clientX - get(vDiv, 'left'); yOffset = evt.clientY - get(hDiv, 'top');
        window.addEventListener('mousemove', moveDivider, true);
    };
    hDiv.onmousedown = (evt) => {
        xOffset = evt.clientX - get(vDiv, 'left'); yOffset = evt.clientY - get(hDiv, 'top');
        window.addEventListener('mousemove', moveDivider, true);
    };

    const elem = Array.from(document.body.getElementsByTagName('*'));
    elem.forEach((e) => {
        if (e.tagName != 'LI' && e.tagName != 'SCRIPT' && e.id != 'editor') {
            e.style.position = 'absolute';
        }
    });
    updateUI();
}

function highlightButton() {
    const c1 = logicEditor.getValue().trim().length > 0;
    btnHTML.style.borderWidth = (htmlLogic.trim().length > 0 || (c1 && activeCodeBtn == btnHTML)) ? '5px 0' : '0';
    btnCSS.style.borderWidth = (cssLogic.trim().length > 0 || (c1 && activeCodeBtn == btnCSS)) ? '5px 0' : '0';
    btnJS.style.borderWidth = (jsLogic.trim().length > 0 || (c1 && activeCodeBtn == btnJS)) ? '5px 0' : '0';
}

// ==================== STEP LOGIC ==================== //
function testLogic() {
    if (cStep > 1 && get(gutter, 'background') == '246, 246, 246') {
        let logic = logicEditor.getValue().replace(/[\s\n\r]*\/\/ Expectation:[\s\S]*/, '').trim();
        
        if (!logic.length) {
            logic = 'let output = codeWithoutMarkup.replace(/';
            logic += (activeCodeBtn == btnHTML ? '\\s\*<!--.*-->/g,\'' : activeCodeBtn == btnCSS ? '\\s\*\\/\\*.*\\*\\//g,\'' : ';\\s\*\\/\\/.*/g,\';');
            logic += '\');\n// output = insertLine(output, \'key\', {line: \'\', offset: 0});\nreturn output;';
            setValue(logicEditor, `${logic}${logicEditor.getValue()}`);
        }

        const type = activeCodeBtn == btnHTML ? 'html' : activeCodeBtn == btnCSS ? 'css' : 'js';
        let input = decodeURI(encodeURI(code[cStep - 1]).match(eval(type + 'Token')[2])[0].replace(eval(type + 'Token')[0], '').replace(eval(type + 'Token')[1], '')),
            output = [];

        if (/return/.test(logic)) {
            /codeWithoutMarkup/.test(logic) ? input = noMarkup(input) : null;
            // APPLY CODE IN LOGIC EDITOR TO INPUT
            output = eval(`(function(){ ${decodeURI(logic).replace(/codeWithoutMarkup/g, 'input').replace(/let\s+output/, 'output').replace(/(;[^;]+)$/, '')} }())`);
                
            if (typeof(output) == 'string') {
                setValue(codeEditor, output);
                gutter.style.background = 'lightgreen';
            } else {
                log(`Output type is "${typeof(output)}", should be a string.`, 'warn');
                gutter.style.background = 'lightcoral';
            }
        } else {
            log('Transition logic must return a value.', 'warn');
            gutter.style.background = 'lightcoral';
        }

        // INDICATE TRANSITION LOGIC VALIDITY
        gutter.style.transition = 'background .3s';

        setTimeout(() => {
            gutter.style.background = '#f6f6f6';
            setTimeout(() => { gutter.style.transition = 'none'; }, 300);
        }, 600);
        
        highlightButton();

        // ===== HELPER FUNCTIONS ===== //
        function insertLine(c, k, options) {        // c = CODE; k = KEY; options = { str, int }
            c = c.split(/\r?\n/);

            c.some((e, i) => {
                const query = new RegExp(k).test(e);                

                if (query) {
                    const defaultOptions = { line: '', offset: 0 };
                    const opt = Object.assign({}, defaultOptions, options);

                    c.splice(i + 1 + opt.offset, 0, opt.line);      // log(`Adding [${opt.line}] after line ${i + 1}`);
                    return query;
                }
            });
            return c.join('\n');
        }
    }
    generateTest();
}

// ==================== Expectation ==================== //
function generateTest() {
    const src = codeEditor.getValue(), cursor = codeEditor.selection.getCursor();
    let n = 0 /* editable(n) */;

    logicEditor.setValue(`${logicEditor.getValue().replace(/[\s\n\r]*\/\/ Expectation:[\s\S]*/, '')}\n\n\/\/ Expectation:`);
    codeEditor.gotoLine(0, 0, false);

    while (/#(BEGIN|END)_EDITABLE#/.test(codeEditor.getValue())) {
        const r1 = codeEditor.find(markup[0], {caseSensitive: true});
        if (r1) {
            codeEditor.insert('');
            const r2 = codeEditor.find(markup[1], {caseSensitive: true});
            if (r2) {
                codeEditor.insert('');
                codeEditor.selection.setRange({"start": {"row": r1.start.row, "column": r1.start.column}, "end": {"row": r2.start.row, "column": r2.start.column}});
                
                if (codeEditor.getSelectedText().trim().length) {
                    logicEditor.setValue(`${logicEditor.getValue()}\npass.if.${activeCodeBtn.innerHTML.toLowerCase()}.editable(${n}).equivalent(\`${codeEditor.getSelectedText().trim().replace(/[\s\n\r]+/g, ' ')}\`);`);
                }
            } else {
                log('Missing #END_EDITABLE#.', 'warn');
                break;
            }
        } else {
            log('Missing #BEGIN_EDITABLE#.', 'warn');
            break;
        }
        n++;
    }
    setValue(codeEditor, src, cursor);
    setValue(logicEditor, logicEditor.getValue().trim());   
}

// ==================== MISC ==================== //
function get(e, p) {
    const v = window.getComputedStyle(e).getPropertyValue(p);
    switch (p) {
        case 'background': return v.match(/\d+, \d+, \d+/)[0];
        default: return parseFloat(v);
    }
}

function spaceBetween(e1, e2, axis = 0) {       // axis: 0 is horizontal, 1 is vertical
    const pos1 = [get(e1, 'left'), get(e1, 'top')],
        pos2 = [get(e2, 'left'), get(e2, 'top')],
        size1 = [get(e1, 'width'), get(e1, 'height')],
        size2 = [get(e2, 'width'), get(e2, 'height')];
    return Math.max(Math.max(pos1[axis], pos2[axis]) - Math.min(pos1[axis], pos2[axis]) - (pos1[axis] <= pos2[axis] ? size1[axis] : size2[axis]), 0);
}

function log(msg, opt) {
    if (!opt) { opt = 'log'; }
    const time = new Date();
    eval(`console.${opt}`)(`[${pad(time.getHours())}:${pad(time.getMinutes())}:${pad(time.getSeconds())}] ${msg}`);
}

function pad(n) {
    return n.toString().length == 2 ? n : '0' + n.toString();
}

function clamp(v, min, max) {
    return Math.max(min, Math.min(v, max));
}

function range(min, max, int = false) {
    const r = Math.random() * (max - min) + min;
    return int ? Math.round(r) : r;
}

function remap(v, iMin, iMax, oMin, oMax) {
    return oMin + (v - iMin) * (oMax - oMin) / (iMax - iMin);
}

function round(v, decimal = 0, op = Math.round) {
    if (op !== Math.round && op !== Math.ceil && op !== Math.floor) {
        throw new Error(`Invalid operation parametre: ${op}.`);
    }
    else if (!Number.isInteger(decimal) || decimal < 0) {
        throw new Error(`Invalid decimal parametre: ${decimal}.`);
    }

    if (decimal) {
        const mod = Math.pow(10, decimal);
        return op(v * mod) / mod;
    } else {
        return op(v);
    }
}

String.prototype.splice = function(idx, rem, str) {
    return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
};