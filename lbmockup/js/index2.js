var taInstruction = document.getElementById('instruction');
var btnLoad = document.getElementById('load');
var btnConvert = document.getElementById('convert');
var btnSave = document.getElementById('save');
var btnPrev = document.getElementById('prev');
var btnNext = document.getElementById('next');
var btnAdd = document.getElementById('add');
var btnDel = document.getElementById('delete');
var btnDupPrev = document.getElementById('dupPrev');
var btnHTML = document.getElementById('html');
var btnCSS = document.getElementById('css');
var btnJS = document.getElementById('js');
var btnRun = document.getElementById('run');
var btnDupNext = document.getElementById('dupNext');
var srcCode = document.getElementById('srcCode');
var stepLogic = document.getElementById('stepLogic');
var info = document.getElementById('info');
var gutter;
var activeCodeBtn;                  // CURRENT CODE BUTTON
var codeEditor;                     // CODE EDITOR
var logicEditor;                    // LOGIC EDITOR
var preview;                        // PREVIEW IFRAME
var pkey;                           // PREVIOUS KEY PRESSED
var cProj = 'Untitled';             // CURRENT PROJECT NAME
var cStep = 1;                      // CURRENT STEP
var tSteps = 1;                     // TOTAL STEPS

var inst = [''];                    // INSTRUCTION FOR ALL STEPS
var html = '', css = '', js = '';
var code = [''];                    // CODE FOR ALL STEPS
var htmlLogic = ''; cssLogic = ''; jsLogic = '';
var logic = [''];                   // TRANITION FOR ALL STEPS
var step = [''];                    // COMBINATION OF THE ABOVE
var master;                         // SINGLE STRING FOR ENTIRE PROJECT

var instToken, instTokenEnd, instBlock, instExp;
var codeToken, codeTokenEnd, codeBlock, codeExp;
var logicToken, logicTokenEnd, logicBlock, logicExp;
var stepToken, stepTokenEnd, stepBlock, stepExp;
var htmlToken = ['##HTML##', '##HTML_E##', /##HTML##.*##HTML_E##/];
var cssToken = ['##CSS##', '##CSS_E##', /##CSS##.*##CSS_E##/];
var jsToken = ['##JS##', '##JS_E##', /##JS##.*##JS_E##/];   
var markup = ['#BEGIN_EDITABLE#', '#END_EDITABLE#'];

var template = [
    'Generic\n\nParagraph\n---\nParagraph\n\n(***)\n\n(!)type#key#, objective',
    'Syntax\n\nDescribe the purpose of the syntax\n\n(type)(#)\n\n[-\n\t(*)[{syntax}]\n\t(*)[{syntax}]\n\t(*)//Example://\n-]\n\n(***)\n\n(!)type#key#, focus on reproducing the syntax',
    'Exercise\n\n[The Problem] Help to understand the problem\n---\n[The Question] No answer giveaway\n\n(***)\n\n(!)type#key#, focus on applying the syntax',
    'Summary\n\nGreat job!\n---\nYou have completed this sprint, here is a recap:\n[-\n\t(*)item 1\n\t(*)item 2\n-]'
];

var pagePadding = 20, margin = 10;

var vDiv = document.createElement('div');
var hDiv = document.createElement('div');

var divWidth = '10px';
var vDivPos = 0.55, hDivPos = 0.75;     // INITIAL DIVIDER POSIITIONS
var xOffset, yOffset;

// ==================== EVENT LISTENER ==================== //
window.onload = () => {
    taInstruction.addEventListener('keydown', tabHandler, false);
    taInstruction.onblur = () => { info.value = `${cProj} - ${cStep} / ${tSteps} - ${getStepName()}`; };
    info.onfocus = () => { editProjectInfo(); };
    info.onblur = () => { updateProjectInfo(); };
    info.onkeydown = (evt) => { if (evt.code == 'Enter') { info.blur(); }};
    btnLoad.ondblclick = () => { restoreInst(); loadTextFile(); };
    btnConvert.onclick = () => { convertInstruction(); };
    btnSave.onclick = () => { restoreInst(); commitToMaster(); saveTextFile(master); };
    btnPrev.onclick = () => { restoreInst(); prevStep(); updateStepLogic(); };
    btnAdd.onclick = () => { restoreInst(); addStep(); updateStepLogic(); };
    btnDel.onclick = () => { restoreInst(); confirmDel(); };
    btnNext.onclick = () => { restoreInst(); nextStep(); updateStepLogic(); };
    btnDupPrev.onclick = () => { copyCode(cStep - 1); };
    btnHTML.onclick = (evt) => { toggleCodePanel(evt.target); codeEditor.getSession().setMode('ace/mode/html'); };
    btnCSS.onclick = (evt) => { toggleCodePanel(evt.target); codeEditor.getSession().setMode('ace/mode/css'); };
    btnJS.onclick = (evt) => { toggleCodePanel(evt.target); codeEditor.getSession().setMode('ace/mode/javascript'); };
    btnRun.onclick = (evt) => { updatePreview(); };
    btnRun.ondblclick = (evt) => { closePreview(); };
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

    codeEditor.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true,
    });
    logicEditor.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true,
    });

    codeEditor.$blockScrolling = Infinity; logicEditor.$blockScrolling = Infinity;              // TEMP FIX FOR UNKNOWN EDITOR ISSUE

    codeEditor.setValue(`<!DOCTYPE html>\n<html>\n<head>\n\t<link rel="stylesheet" type="text/css" href="style.css"/>\n\t<script type="text/javascript" src="script.js"></script>\n</head>\n<body>\n\t\n</body>\n</html>${markup.join('')}`);
    codeEditor.selection.clearSelection();

    taInstruction.value = `Introduction\n\n[Scenario] Why is this useful?\n---\n[Learning Outcome] Exactly what the learner will do\n---\n[Result]`;

    updateStepLogic();
};

window.onkeydown = (evt) => {
    let c1 = evt.keyCode == 116;                    // DISABLE F5
    let c2 = evt.location == 1 && evt.ctrlKey;       // EXTRA 'CTRL' KEY PRODUCED BY 'LEFT ALT'

    if (c1 || c2) return false;
    
    if (evt.altKey && evt.code != pkey) {           // 'ALT' KEY *AND* NON-REPEATED KEY
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
            case 'KeyI': btnConvert.click();
            case 'Backspace': if (preview) { closePreview(); } break;
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
};

window.onresize = () => { updateUI();};

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

// ==================== INSTRUCTION ==================== //
function updateProjectInfo() {
    info.style.background = 'none';
    cProj = info.value;
    info.value = `${cProj} - ${cStep} / ${tSteps} - ${getStepName()}`;
}

function convertInstruction() {
    const auth = btnConvert.className == 'fa fa-pencil';
    btnConvert.className = auth ? 'fa fa-code' : 'fa fa-pencil';
    
    if (auth) {
        inst[cStep] = taInstruction.value;

        const highlight = /^(\t?)\(!\)\s*(.+[^\s]).*/,
            notes = /^(\t?)\(\*\*?\)\s*(.+[^\s]).*/,
            line = /(\w+\.)?(html|css|js)#([^#\n]+)#((\+|-)\d+)?/g,
            image = /\[img\](https?:\/\/[^\'"\s]+\.(jpg|gif|jpeg|bmp|png|svg))/,
            link = /[^\s]+::[^\s]+/g,
            bold = /\/\/[^\/]+\/\//g;
        let body = taInstruction.value.split(/\r?\n/).slice(2),
            isList = false;

        body.forEach((e, i) => {
            e = e.replace(/</g, '&lt;').replace(/\[\{/g, '<code>').replace(/\}\]/g, '</code>');       // ESCAPE < AND > ... <code></code>
            link.test(e) ? e.match(link).forEach((ce) => { e = e.replace(ce, `<a href='${ce.split(/::/)[1]}' target='_blank'>${ce.split(/::/)[0]}</a>`); }) : null;       // <a href=#></a>
            bold.test(e) ? e.match(bold).forEach((ce) => { e = e.replace(ce, `<b>${ce.replace(/\/\//g, '')}</b>`); }) : null;        // <b></b>
            line.test(e) ? e.match(line).forEach((ce) => {        // FIND PATTER: [HTML|CSS|JS]#[WORDS]#
                const ca = ce.split(/#/),     // SPLIT EACH MARKUP INTO 3 COMPONENTS - TYPE, KEY AND OFFSET
                    type = /\./.test(ca[0]) ? ca[0].split(/\./)[1] : ca[0],     // DETERMINE TYPE OF FILE
                    name = (/\./.test(ca[0]) ? ca[0].split(/\./)[0] : type.replace(/html/i, 'index.').replace(/css/i, 'style.').replace(/js/i, 'script.')) + type;      // DETERMINE NAME OF FILE
                e.replace(/\([^\w]+\)\s*/g, '').startsWith(ce) ?         // LINE NUM MARKUP PRECEDED BY (.) ?
                    e = e.replace(ce, `On <b>${type.toUpperCase().replace(/JS/, 'JavaScript')} line ##LINE('${name}','${ca[1]}')${(ca[2] ? ca[2] : '')}##</b>`) :
                e.includes(`-${ce}`) ?      // 
                    e = e.replace(`-${ce}`, `<b>##LINE('${name}','${ca[1]}')${(ca[2] ? ca[2] : '')}##</b>`) :
                    e = e.replace(ce, `<b>${type.toUpperCase()} line ##LINE('${name}','${ca[1]}')${(ca[2] ? ca[2] : '')}##</b>`);
            }) : null;

            isList = /^\[(-|=)/.test(e) ? true : isList;        // BEGINNING OF A LIST

            if (e.trim() == '---') {
                body[i] = '<br><br>';
            } else if (/^\(\*{3}\)/.test(e)) {     // - OBJECTIVES -
                body[i] = '<p style=\'text-align:center\'><b>- OBJECTIVES -</b></p>';
            } else if (highlight.test(e)) {         // <p class='highlight></p>
                body[i] = e.replace(highlight, '$1<p class=\'highlight\'>$2</p>');
            } else if (notes.test(e)) {             // <p class='notes'></p> OR <p class='notes' style='text-align:center'></p>
                body[i] = e.replace(notes, `$1<p class='notes'${(/^\t?\(\*\*\)/.test(e) ? ' style=\'text-align:center\'>' : '>')}$2</p>`);
            } else {
                body[i] = e;
            }
            body[i] = isList ? body[i].replace(/^\t(.+)/, '\t<li>$1</li>') : body[i];
            isList = /(-|=)\]$/.test(e) ? false : isList;       // END OF A LIST
        });

        body = body.join('\n').replace(/\[-/g, '<ul>').replace(/-\]/g, '</ul>').replace(/\[=/g, '<ol>').replace(/=\]/g, '</ol>');                   // <ul></ul> OR <ol></ol>
        body = body.replace(/\((html|css|js)\)/g, '<pre class=\'language-$1\'><code>').replace(/-js/g, '-javascript').replace(/\(#\)/g, '</code></pre>');   // SNIPPETS
        body = body.replace(image, "<br><br><p class='notes' style='text-align:center'><a href='$1' target='_blank'><img src='$1'></a>Click the image to open it in a new tab</p>");
        taInstruction.value = body + (cStep > 1 && cStep < tSteps ? '\n<hr>\n<p class=\'highlight\'>Click on <b>Check all objectives</b> to continue</p>' :
            cStep == 1 ? '\n<hr>\n<p class=\'highlight\'>Click on <b>Next step</b> to get started</p>' :
            cStep > 10 ? '\n<hr>\n<p class=\'highlight\'><b>Export to Sandbox</b> to continue working on it</p>' :
            '\n<hr>\n<p class=\'highlight\'>Don\'t forget to try things out in <b>Sandbox Mode</b></p>');

        taInstruction.select();
        document.execCommand('copy');
        taInstruction.disabled = true;
    } else {
        taInstruction.disabled = false;
        taInstruction.value = inst[cStep];
    }
}

function restoreInst() {
    btnConvert.className == 'fa fa-code' ? btnConvert.click() : null;
}

// ==================== SOURCE CODE OPERATION ==================== //
function toggleCodePanel(targetBtn) {
    storeActiveCode(cStep);
    activeCodeBtn.disabled = false;
    targetBtn.disabled = true;
    activeCodeBtn = targetBtn;
    codeEditor.setValue(getActiveCode('code', cStep)); codeEditor.selection.clearSelection();
    logicEditor.setValue(getActiveCode('logic', cStep)); logicEditor.selection.clearSelection();
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
        codeEditor.setValue(activeCodeBtn == btnHTML ? decodeURI(encodeURI(code[n]).match(htmlToken[2])[0].replace(htmlToken[0], '').replace(htmlToken[1], '')) :
            activeCodeBtn == btnCSS ? decodeURI(encodeURI(code[n]).match(cssToken[2])[0].replace(cssToken[0], '').replace(cssToken[1], '')) :
            decodeURI(encodeURI(code[n]).match(jsToken[2])[0].replace(jsToken[0], '').replace(jsToken[1], '')));
        codeEditor.selection.clearSelection();
    }
}

function updatePreview() {
    storeActiveCode(cStep); let pCode = [
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
        '</html>'
    ].join('\n');

	if (document.getElementById('preview')) {
	    preview.srcdoc = pCode;
	} else {
	    storeActiveCode(cStep);
	    preview = document.createElement('iframe');
	    preview.id = 'preview';
	    preview.srcdoc = pCode;
	    preview.style.background = 'white';
	    alignPreview();
	    document.body.appendChild(preview);
	}
}

function noMarkup(str) {
    return str.replace(new RegExp(`(${markup[0]}\\s*)|(\\s*${markup[1]})`, 'g'), '');
}

function closePreview() {
    if (document.getElementById('preview')) {
		document.body.removeChild(preview);
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
    if (document.getElementById('preview')) {
        updatePreview();
    }
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
    codeEditor.setValue(getActiveCode('code', cStep));
    logicEditor.setValue(getActiveCode('logic', cStep));
    updateCodeButtons();
    if (document.getElementById('preview')) {
        updatePreview();
    }
}

function prevStep() {
    updateContent(cStep - 1);
    updateCodeButtons();
    cStep--;
    if (document.getElementById('preview')) {
        updatePreview();
    }
}

function nextStep() {
    updateContent(cStep + 1);
    updateCodeButtons();
    cStep++;
    if (document.getElementById('preview')) {
        updatePreview();
    }
}

function getStepName() {
    return (btnConvert.className == 'fa fa-pencil' ? (taInstruction.value.trim().length > 0 ? taInstruction.value : `Step ${cStep}`) : inst[cStep]).split(/\r?\n/)[0].trim();
}

// ==================== DATA OPERATION ==================== //
function updateContent(i) {                                                  // STORE CURRENT CONTENT AND DISPLAY NEW CONTENT
    inst[cStep] = taInstruction.value;
    taInstruction.value = inst[i];
    storeActiveCode(cStep);
    loadCodeInStep(i);
    codeEditor.setValue(i == cStep ? codeEditor.getValue() : getActiveCode('code', i));
    logicEditor.setValue(i == cStep ? logicEditor.getValue() : getActiveCode('logic', i));
    codeEditor.selection.clearSelection();
    logicEditor.selection.clearSelection();
}

function storeActiveCode(step) {
    btnHTML.disabled ? html = codeEditor.getValue() : (btnCSS.disabled ? css = codeEditor.getValue() : js = codeEditor.getValue());                     // STORE CONTENT OF ACTIVE CODE PANEL
    code[cStep] = htmlToken[0] + html + htmlToken[1] + cssToken[0] + css + cssToken[1] + jsToken[0] + js + jsToken[1];                                  // STORE CODE FOR CURRENT STEP
    btnHTML.disabled ? htmlLogic = logicEditor.getValue() : (btnCSS.disabled ? cssLogic = logicEditor.getValue() : jsLogic = logicEditor.getValue());   // STORE CONTENT OF ACTIVE LOGIC PANEL
    logic[cStep] = htmlToken[0] + htmlLogic + htmlToken[1] + cssToken[0] + cssLogic + cssToken[1] + jsToken[0] + jsLogic + jsToken[1];                  // STORE CODE FOR CURRENT STEP
}

function getActiveCode(type, step) {     // RETURN HTML OR CSS OR JS CODE ACCORDING TO ACTIVE CODE PANEL
    var token = activeCodeBtn == btnHTML ? htmlToken : (activeCodeBtn == btnCSS ? cssToken : jsToken);
    if (encodeURI(eval(type)[step]).match(token[2])) {
        var activeCode = decodeURI(encodeURI(eval(type)[step]).match(token[2])[0].replace(token[0], '').replace(token[1], ''));
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
    codeEditor.setValue(getActiveCode('code', cStep));
    logicEditor.setValue(getActiveCode('logic', cStep));
    codeEditor.selection.clearSelection();
    logicEditor.selection.clearSelection();
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
    var textToSaveBlob = new Blob([txt], { type: 'text/plain' });
    var textToSaveURL = window.URL.createObjectURL(textToSaveBlob);
    var fileNameToSave = `${cProj}.txt`;
    var downloadLink = document.createElement('a');
    downloadLink.download = fileNameToSave;
    downloadLink.href = textToSaveURL;
    downloadLink.style.display = 'none';
    downloadLink.click();
}

function loadTextFile() {
    var fileToLoad = document.createElement('input');
    fileToLoad.type = 'file';
    fileToLoad.accept = '.txt';
    fileToLoad.style.display = 'none';
    fileToLoad.click();
    fileToLoad.onchange = () => {
        var fileReader = new FileReader();
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
function tabHandler(e) {
    var TABKEY = 9;
    if (e.keyCode == TABKEY) {
        var bc = this.value.slice(0, this.selectionStart);
        var ac = this.value.slice(this.selectionStart, this.value.length);
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

    if (document.getElementById('preview')) {
        alignPreview();
    }

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
    codeEditor ? codeEditor.resize(true) : null;
    logicEditor ? logicEditor.resize(true) : null;
}

function moveDivider(evt) {
    vDiv.style.left = clamp(evt.clientX - xOffset, 450, window.innerWidth - 450) + 'px';
    hDiv.style.top = clamp(evt.clientY - yOffset, 250, window.innerHeight - 150) + 'px';
    hDiv.style.width = window.innerWidth - get(vDiv, 'left') + 'px';
    scaleContent();
}

function flexDivider() {
    vDiv.style.left = window.innerWidth * vDivPos + 'px';
    hDiv.style.top = window.innerHeight * hDivPos + 'px';
    vDiv.style.height = window.innerHeight + 'px';
    hDiv.style.width = window.innerWidth * (1 - vDivPos) + 'px';
}

function alignPreview() {
    preview.style.left = get(taInstruction, 'left') + 'px';
    preview.style.top = get(taInstruction, 'top') + 'px';
    preview.style.width = get(taInstruction, 'width') + 'px';
    preview.style.height = get(taInstruction, 'height') + 'px';
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

    let elem = Array.from(document.body.getElementsByTagName('*'));
    elem.forEach((e) => {
        if (e.tagName != 'LI' && e.tagName != 'SCRIPT' && e.id != 'editor') {
            e.style.position = 'absolute';
        }
    });
    updateUI();
}

function highlightButton() {
    let c1 = logicEditor.getValue().trim().length > 0;
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
            logicEditor.setValue(`${logic}${logicEditor.getValue()}`);
            logicEditor.selection.clearSelection();
        }

        let type = activeCodeBtn == btnHTML ? 'html' : activeCodeBtn == btnCSS ? 'css' : 'js',
            input = decodeURI(encodeURI(code[cStep - 1]).match(eval(type + 'Token')[2])[0].replace(eval(type + 'Token')[0], '').replace(eval(type + 'Token')[1], '')),
            output = [];

        if (/return/.test(logic)) {
            /codeWithoutMarkup/.test(logic) ? input = noMarkup(input) : null;
            // APPLY CODE IN LOGIC EDITOR TO INPUT
            output = eval(`(function(){ ${decodeURI(logic).replace(/codeWithoutMarkup/g, 'input').replace(/let\s+output/, 'output').replace(/(;[^;]+)$/, '')} }())`);
                
            if (typeof(output) == 'string') {
                codeEditor.setValue(output);
                codeEditor.clearSelection();
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
                let query = new RegExp(k).test(e);                

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
    let src = codeEditor.getValue(), n = 0;
    logicEditor.setValue(`${logicEditor.getValue().replace(/[\s\n\r]*\/\/ Expectation:[\s\S]*/, '')}\n\n\/\/ Expectation:`);
    codeEditor.selection.moveCursorToPosition({row: 0, column: 0});

    while (/#(BEGIN|END)_EDITABLE#/.test(codeEditor.getValue())) {
        let r1 = codeEditor.find(markup[0], {caseSensitive: true});
        if (r1) {
            codeEditor.insert('');
            let r2 = codeEditor.find(markup[1], {caseSensitive: true});
            if (r2) {
                codeEditor.insert('');
                codeEditor.selection.setRange({"start":{"row":r1.start.row,"column":r1.start.column},"end":{"row":r2.start.row,"column":r2.start.column}});
                
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
    codeEditor.setValue(src);
    logicEditor.setValue(logicEditor.getValue().trim());
    codeEditor.clearSelection();
    logicEditor.clearSelection();
}

// ==================== MISC ==================== //
function get(e, p) {
    let v = window.getComputedStyle(e).getPropertyValue(p);
    switch (p) {
        case 'background': return v.match(/\d+, \d+, \d+/)[0];
        default: return parseFloat(v);
    }
}

function spaceBetween(e1, e2, axis = 0) {       // axis: 0 is horizontal, 1 is vertical
    let pos1 = [get(e1, 'left'), get(e1, 'top')],
        pos2 = [get(e2, 'left'), get(e2, 'top')],
        size1 = [get(e1, 'width'), get(e1, 'height')],
        size2 = [get(e2, 'width'), get(e2, 'height')];
    return Math.max(Math.max(pos1[axis], pos2[axis]) - Math.min(pos1[axis], pos2[axis]) - (pos1[axis] <= pos2[axis] ? size1[axis] : size2[axis]), 0);
}

function showDebug() {
    debug = document.createElement('p');
    debug.id = 'debug';
    debug.innerHTML = 'debug';
    document.body.appendChild(debug);

    window.onmousemove = (e) => {
        log(e.target.id);
    };
}

function log(msg, opt) {
    if (!opt) { opt = 'log'; }
    let time = new Date();
    eval(`console.${opt}`)(`[${pad(time.getHours())}:${pad(time.getMinutes())}:${pad(time.getSeconds())}] ${msg}`);
}

function pad(n) {
    return n.toString().length == 2 ? n : '0' + n.toString();
}

function clamp(v, min, max) {
    return Math.max(min, Math.min(v, max));
}