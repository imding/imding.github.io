const
    app = document.getElementById('app'),
    taInstruction = document.getElementById('instruction'),
    btnRecover = document.getElementById('recover'),
    btnLoad = document.getElementById('load'),
    btnConvert = document.getElementById('convert'),
    btnSave = document.getElementById('save'),
    btnTips = document.getElementById('tips'),
    btnPrev = document.getElementById('prev'),
    btnNext = document.getElementById('next'),
    btnAdd = document.getElementById('add'),
    btnDel = document.getElementById('delete'),
    btnDupPrev = document.getElementById('dupPrev'),
    btnHTML = document.getElementById('html'),
    btnCSS = document.getElementById('css'),
    btnJS = document.getElementById('js'),
    btnRun = document.getElementById('run'),
    btnDupNext = document.getElementById('dupNext'),
    srcCode = document.getElementById('srcCode'),
    stepLogic = document.getElementById('stepLogic'),
    info = document.getElementById('info'),

    htmlToken = ['##HTML##', '##HTML_E##', /##HTML##.*##HTML_E##/],
    cssToken = ['##CSS##', '##CSS_E##', /##CSS##.*##CSS_E##/],
    jsToken = ['##JS##', '##JS_E##', /##JS##.*##JS_E##/],
    markup = ['#BEGIN_EDITABLE#', '#END_EDITABLE#'],

    vDiv = document.createElement('div'),
    hDiv = document.createElement('div'),

    vDivMin = 420,
    hDivMin = 260,

    pagePadding = 20,
    margin = 10,

    divWidth = '10px',

    aceOptions = {
        printMargin: false,
        fixedWidthGutter: true,
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true,
    },

    beautyOpts = {
        html: {
            indent_size: 4,
            wrap_line_length: 0,
            max_preserve_newlines: 1,
            extra_liners: [],
            inline: [
                // https://www.w3.org/TR/html5/dom.html#phrasing-content
                'a', 'abbr', 'area', 'audio', 'b', 'bdi', 'bdo', 'br', 'button', 'canvas', 'cite',
                'code', 'data', 'datalist', 'del', 'dfn', 'em', 'embed', 'i', 'iframe', 'img',
                'input', 'ins', 'kbd', 'keygen', 'label', 'map', 'mark', 'math', 'meter', 'noscript',
                'object', 'output', 'progress', 'q', 'ruby', 's', 'samp', 'script', 'select', 'small',
                'span', 'strong', 'sub', 'sup', 'svg', 'template', 'textarea', 'time', 'u', 'var',
                'video', 'wbr', 'text',
                // prexisting - not sure of full effect of removing, leaving in
                'acronym', 'address', 'big', 'dt', 'ins', 'strike', 'tt'
            ],
        },
        css: {},
        js: {},
    },

    template = [
        'Formatting\n\n`code`\n\n*bold text*\n\n(html)<!-- code snippet -->(#)\n\n[link::URL]\n\n[glossary#html#<div>]\n\n[img::https://app.bsd.education/resources/bsdlogo.png]\n\n(---)\n\n[-\n\tunordered\n\tlist\n-]\n\n[=\n\t(*)ordered\n\t(*)list\n=]\n\n(*)note highlight\n\n(**)centred note highlight\n\n(***)\n\n(!)On +html#<body>#+1, objective description\n\n(>>style.css)',
        'Generic step\n\nStep context.\n\n(---)\n\n[-\n\t(*)\n\t(*)\n-]\n\n(***)\n\n(!)On +type#key#, \n(!)On +type#key#, \n(!)On +type#key#, ',
        'Summary\n\nGreat job!\n\nYou have completed this project, here is a recap:\n\n[-\n\t(*)item 1\n\t(*)item 2\n-]',
    ],

    tipsData = [
        'divider',
        {
            entry: 'alt + 0',
            description: 'Instruction formatting glossary',
        },
        {
            entry: 'alt + 1',
            description: 'insert generic instruction',
        },
        {
            entry: 'alt + 2',
            description: 'insert summary step instruction',
        },
        {
            entry: 'alt + i',
            description: 'preview & copy instruction',
        },
        {
            entry: 'alt + o',
            description: 'generate and append objective description ( HTML only )',
        },
        'divider',
        {
            entry: 'alt + n',
            description: 'create a new step',
        },
        {
            entry: 'alt + [',
            description: 'go to prev step',
        },
        {
            entry: 'alt + ]',
            description: 'go to next step',
        },
        'divider',
        {
            entry: 'alt + -',
            description: 'go to prev code type',
        },
        {
            entry: 'alt + =',
            description: 'go to next code type',
        },
        {
            entry: 'alt + .',
            description: 'get code from prev step',
        },
        {
            entry: 'alt + ,',
            description: 'get code from next step',
        },
        {
            entry: 'alt + p',
            description: 'show/refresh preview',
        },
        {
            entry: 'alt + backspace',
            description: 'close preview',
        },
        'divider',
        {
            entry: 'shift + alt + f',
            description: 'tidy code ( only valid for left shift and alt keys )',
        },
        {
            entry: 'alt + /',
            description: 'add/remove editable',
        },
        'divider',
        {
            entry: 'alt + k',
            description: 'generate expectation code',
        },
        {
            entry: 'alt + l',
            description: 'apply step logic & update code file',
        },
        'divider',
        {
            entry: 'generateJSON()',
            description: 'call in console to obtain project JSON object',
        },
        `<ul>
            <li>Transition code must be preceded by exactly "// Transition:".</li>
            <li>Expectation code must be preceded by exactly "// Expectation:".</li>
            <li>Code inside an editable region will be replaced by 4 empty spaces if it matches with the corresponding equivalent() argument.</li>
            <li>The argument for the equivalent() method will be stored as model answer.</li>
            <li>Objective descriptoin and test functions must agree on the number of editable regions in a step.</li>
            <li>Editable region must be found as indicated by the objective descriptions.</li>
            <li>Objective description for live expectations must be found in the instruction.</li>
            <li>All steps are "code step" by default.</li>
            <li>Steps that contain only "pass.on()" expectation will be set to "interactive step" automatically.</li>
            <li>Code files that are identical ( minus trailing editable markups ) in the previous step will be set to "leave unchanged" automatically.</li>
            <li>Code files that contain transition logic will be set to "modify content" automatically.</li>
        </ul>`,
    ],

    //  A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
    //  a b c d e f g h i j k l m n o p q r s t u v w x y z

    glossaryLink = {
        html: {
            'HTML': '53fa2693-c653-411c-9a7d-f1df47d36432',
            '<a>': 'de2005f1-d7e4-424b-8f4a-624783079e7c',
            '<b>': '31bdb056-c63b-4a71-bf50-ba798aaec9f4',
            '<body>': 'd694e726-ee2b-4b81-9ca4-21302387ef43',
            '<br>': 'beef4a5f-f32f-4266-baf2-f297ce1e7ca3',
            '<button>': 'aef3c0f8-e182-41f8-9f56-5df2f7f0c814',
            '<canvas>': '35dc2e11-8f4b-49a5-942c-7b10d1561de3',
            '<div>': '6f45e8ff-64d2-4528-827a-9d2722b8449d',
            '<h1>': '2b80319b-5dc3-4f5d-89f8-1f38b5969f6e',
            '<h2>': '2b80319b-5dc3-4f5d-89f8-1f38b5969f6e',
            '<h3>': '2b80319b-5dc3-4f5d-89f8-1f38b5969f6e',
            '<h4>': '2b80319b-5dc3-4f5d-89f8-1f38b5969f6e',
            '<h5>': '2b80319b-5dc3-4f5d-89f8-1f38b5969f6e',
            '<h6>': '2b80319b-5dc3-4f5d-89f8-1f38b5969f6e',
            '<head>': '35287bae-ead4-4b8e-b2ca-1d990ea555ca',
            '<iframe>': 'c7d8cbbd-b5e4-4212-baaa-7ee5253c86ed',
            '<img>': '1eff844a-cc1d-4e36-b5dc-8b29d9b7ce7d',
            '<script>': '72e6a24d-eb8d-4000-bee8-859baffda976',
            'id': '05c870d4-8500-4dbd-98ef-92fd1f6d84a1',
            'onclick': 'c8b0c517-cdbb-44b4-a79f-0e9ee70d9a87',
        },
        css: {
            'CSS': 'da14e3f5-4197-46ee-9006-b858b1214b67',
            'animation': '18055ae9-47d6-47b9-9146-4fecac4c0c8b',
            'background-color': 'c0ed8259-70af-4c0c-abdc-56be713f6cdf',
            'border': '927c1e89-ccfb-47d4-b25f-85238c30e1f7',
            'border-radius': 'b10d6311-78b5-4604-b30e-6d6ce2fbe2e9',
            'cursor': '65c42136-afe9-492d-9569-4a57639dc5e4',
            'font-size': 'd81da100-c237-4606-8687-9eabf717e1e6',
            'height': '7fe3e114-0f5f-4851-b3aa-97232d4d4b6c',
            'margin': '3a2f0a2d-1c4c-4882-ab43-37386ef16a67',
            'max-width': '0709c8c8-da93-4b63-8bea-bd5154babee1',
            'outline': '56565ef1-8786-4aa2-b959-1cf066dd8cd1',
            'selector': '010c68a7-e6cc-46e9-b9af-99c6708110e8',
            'text-align': 'e8f7c7af-74e5-4bd2-b322-7e3a40594ece',
            'width': 'a1ca4408-3396-4d15-878e-dc003503fe0f',
        },
        javascript: {
            'JavaScript': '051f20b9-73df-49fd-905f-7e438e0c7a61',
            'alert': 'f840417f-4006-4436-9cc1-f8d40da50808',
            'array': 'f6b7d0fc-700b-4202-861a-b5900a6fd922',
            'arithmetic operator': '6bc23e90-67a4-4ba5-a27c-35d5f3add4a1',
            'charCodeAt': '537e811a-4aba-4702-9484-7080b3dc6eb4',
            'else if': '2ed56671-86c8-4799-a423-5d7f549ec659',
            'else': '2ed56671-86c8-4799-a423-5d7f549ec659',
            'forEach': 'f17d20df-0558-4e71-9453-241850c24347',
            'fromCharCode': 'f98f0fe0-53b6-47b9-8f80-f5c439acacdb',
            'function': '37322df6-fd28-4a7e-992f-05f0e06ecfe1',
            'if': '2ed56671-86c8-4799-a423-5d7f549ec659',
            'prompt': 'f5359b15-9a4d-48d3-acb5-3d1a60db49a2',
            'variable': 'ba0d9cd6-b0c1-4087-8760-a9f09b0d8d52',
        },
    };

let gutter,
    activeCodeBtn,                  // CURRENT CODE BUTTON
    codeEditor,                     // CODE EDITOR
    logicEditor,                    // LOGIC EDITOR
    preview,                        // PREVIEW IFRAME
    styledInstruction,              // STYLED INSTRUCTION IFRAME
    pkey,                           // PREVIOUS KEY PRESSED
    cProj = 'Untitled',             // CURRENT PROJECT NAME
    cStep = 1,                      // CURRENT STEP
    tSteps = 1,                     // TOTAL STEPS

    inst = [''],                                    // INSTRUCTION FOR ALL STEPS
    html = '', css = '', js = '',                   // CODE CONTENT OF EACH TYPE
    code = [''],                                    // CODE FOR ALL STEPS
    htmlLogic = '', cssLogic = '', jsLogic = '',    // STEP LOGIC OF EACH CODE TYPE
    logic = [''],                                   // TRANITION FOR ALL STEPS
    step = [''],                                    // COMBINATION OF THE ABOVE
    master,                                         // SINGLE STRING FOR ENTIRE PROJECT

    liveGlossaryLink = { html: {}, css: {}, javascript: {} },

    instToken, instTokenEnd, instBlock, instExp,
    codeToken, codeTokenEnd, codeBlock, codeExp,
    logicToken, logicTokenEnd, logicBlock, logicExp,
    stepToken, stepTokenEnd,

    shiftAlt, altKey, returnFocus,

    tipContainer,

    xOffset, yOffset;

// ======================================================== //
// ==================== ASYNC FUNCTION ==================== //
// ======================================================== //

async function pullGLossaryList() {
    const res = await fetch('https://glossary-api-r1.bsd.education/api/glossary/');
    const json = await res.json();

    json.data.forEach(g => liveGlossaryLink[g.category][g.term] = g.glossaryUuid);
}

// ======================================================== //
// ==================== EVENT LISTENER ==================== //
// ======================================================== //

window.onbeforeunload = () => {
    // Cancel the event as stated by the standard.
    event.preventDefault();
    // Chrome requires returnValue to be set.
    event.returnValue = '';
};

window.onload = () => {
    Object.assign(window, new Utility());

    taInstruction.onblur = () => info.value = `${cProj} - ${cStep} / ${tSteps} - ${getStepName()}`;
    info.onfocus = () => editProjectInfo();
    info.onblur = () => updateProjectInfo();
    info.onkeydown = evt => { if (evt.code == 'Enter') { info.blur(); } };
    btnRecover.onclick = () => recoverFromLocal();
    btnLoad.ondblclick = () => loadTextFile();
    btnConvert.onclick = () => convertInstruction();
    btnSave.onclick = () => { commitToMaster(); saveTextFile(master); };
    btnTips.onclick = showTips;
    btnPrev.onclick = () => { prevStep(); updateStepLogic(); };
    btnAdd.onclick = () => { addStep(); updateStepLogic(); };
    btnDel.onclick = () => confirmDel();
    btnNext.onclick = () => { nextStep(); updateStepLogic(); };
    btnDupPrev.onclick = () => copyCode(cStep - 1);
    btnHTML.onclick = evt => { toggleCodePanel(evt.target); codeEditor.getSession().setMode('ace/mode/html'); };
    btnCSS.onclick = evt => { toggleCodePanel(evt.target); codeEditor.getSession().setMode('ace/mode/css'); };
    btnJS.onclick = evt => { toggleCodePanel(evt.target); codeEditor.getSession().setMode('ace/mode/javascript'); };
    btnRun.onclick = () => updatePreview();
    btnRun.ondblclick = () => closePreview();
    btnDupNext.onclick = () => copyCode(cStep + 1);
    btnHTML.disabled = true;
    btnHTML.style.background = 'indianred';
    activeCodeBtn = btnHTML;
    btnCSS.style.background = 'darkseagreen';
    btnJS.style.background = 'darkseagreen';

    initializeUI();

    ace.require('ace/ext/language_tools');
    codeEditor = ace.edit('codeEditor');
    codeEditor.setTheme('ace/theme/monokai');
    codeEditor.session.setMode('ace/mode/html');
    logicEditor = ace.edit('logicEditor');
    logicEditor.setTheme('ace/theme/tomorrow');
    logicEditor.setHighlightGutterLine(false);
    logicEditor.session.setMode('ace/mode/javascript');
    logicEditor.on('blur', highlightButton);

    gutter = Array.from(document.getElementsByClassName('ace_gutter'))[1];

    codeEditor.setOptions(aceOptions);
    logicEditor.setOptions(aceOptions);

    // FIX FOR UNKNOWN ACE EDITOR ISSUE
    codeEditor.$blockScrolling = Infinity; logicEditor.$blockScrolling = Infinity;

    setValue(codeEditor, [
        '<!DOCTYPE html>',
        '<html>',
        '<head>',
        '\t<link rel="stylesheet" href="style.css">',
        '\t<script src="script.js"></script>',
        '</head>',
        '<body>\n\t',
        '</body>',
        '</html>',
    ].join('\n'));

    taInstruction.value = 'Introduction\n\n[Scenario] Why is this useful?\n\n[Learning Outcome] Exactly what the learner will do.\n\n[Result]';
    updateStepLogic();

    setInterval(saveToLocal, 100000);

    pullGLossaryList();
};

window.onmouseup = () => window.removeEventListener('mousemove', moveDivider, true);

window.onkeyup = () => {
    if (event.code == 'AltRight') {
        altKey = false;
        returnFocus.focus();
    }
};

window.onkeydown = keyHandler;

window.onresize = updateUI;

// ====================================================== //
// ==================== PROJECT INFO ==================== //
// ====================================================== //

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

// ===================================================== //
// ==================== INSTRUCTION ==================== //
// ===================================================== //

function autoObjectiveText() {
    const editables = codeEditor.getValue().match(/#BEGIN_EDITABLE#.+#END_EDITABLE#/g);

    if (editables) {
        if (activeCodeBtn === btnHTML) editables.forEach(editable => {
            const tree = new HTMLTree(editable.replace(/#BEGIN_EDITABLE#(.+)#END_EDITABLE#/, '$1'));
            let ot;

            if (tree.length === 1) {
                const el = tree[0];

                ot = '\n(!)On +html#key#, create a';

                if (/^([aeiou]|h[1-6]|html)/.test(el.openingTag.tagName)) ot += 'n';

                ot += ` \`<${el.openingTag.tagName}>\` element`;

                const attrs = el.openingTag.attrs;

                attrs.forEach((attr, i) => {
                    ot += ((i === attrs.length - 1 || attrs.length === 1) && !el.content.length) ? ' and ' : ', ';
                    ot += i === 0 ? 'set ' : '';
                    ot += `the \`${attr.name}\` attribute to *${attr.value}*`;
                });

                el.content.forEach(content => {
                    if (content.type === 'text') {
                        ot += `, and add the text *${content.raw}* between the tags`;
                    }
                });
            }

            taInstruction.value += `${ot}.`;
        });
    }
}

function convertInstruction() {
    if (!styledInstruction) {
        inst[cStep] = taInstruction.value;
        btnConvert.className = 'fa fa-clipboard';
        styledInstruction = newElement('div', { id: 'styledInstruction' });
        app.appendChild(styledInstruction);
        updateStyledInstruction();
    }
    else {
        btnConvert.className = 'fa fa-pencil';
        taInstruction.value = inst[cStep];
        app.removeChild(styledInstruction);
        styledInstruction = null;

        const selNode = window.getSelection().baseNode;

        if (!altKey && selNode && selNode.id && selNode.id.endsWith('Editor')) selNode.focus();
    }
}

function updateStyledInstruction() {
    styledInstruction.innerHTML = instructionHTML(inst[cStep]);
    selectAndCopy(styledInstruction);
    alignWithInstruction(styledInstruction);
    convertLineNumber();
}

function instructionHTML(source, n = cStep) {
    const
        highlight = /^(\t?)\(!\)\s*(.+[^\s]).*/,
        notes = /^(\t?)\(\*\*?\)\s*(.+[^\s]).*/,
        tab = /^\(>>(.+)\)/,
        loc = /(?:(\w+)\.)?(html|css|js)#([^#\n]+)#([-+]\d+)?/,
        image = /\[IMG::(https?:\/\/[^'"\s]+\.(jpg|gif|jpeg|bmp|png|svg))\]/gi,
        link = /\[([^\]:]+)::([^\s]+)\]/g,
        bold = /\*([^\s*]+|[^\s][^*]+[^\s])\*/g,
        code = /`([^\s`]+|[^\s][^`]+[^\s])`/g,
        glossary = /\[([^#]*)#(html|css|js)#([^\]]+)\]/;
    // glossary = /gls#([^#\n]+)#(html|css|js|javascript)#([-a-z0-9]+)/;

    let
        isList = false,
        isPre = false,
        objNum = 0;

    source = source.
        //  replace opening bracket
        replace(/</g, '&lt;').
        //  replace percentage symbol
        replace(/%/g, '%25').
        //  encode escaped character
        replace(/\\(.)/g, (m, p1) => encodeURIComponent(p1)).
        //  split into array
        split(/\r?\n/).
        //  remove first two items ( step title and empty new line )
        slice(2);

    source.forEach((e, i) => {
        // replace markup for glossary link
        while (glossary.test(e)) {
            const
                query = e.match(glossary),
                match = query[0].replace(/&lt;/g, '<'),
                type = query[2].replace(/^js$/, 'javascript'),
                key = query[3].replace(/&lt;/g, '<'),
                text = query[1].trim().length ? query[1] : query[3];

            if (glossaryLink.hasOwnProperty(type)) {
                if (glossaryLink[type].hasOwnProperty(key)) {
                    e = e.replace(glossary, `<a href='#glossary/${type}/${glossaryLink[type][key]}'>${text}</a>`);
                }
                else if (liveGlossaryLink[type].hasOwnProperty(key)) {
                    e = e.replace(glossary, `<a href='#glossary/${type}/${liveGlossaryLink[type][key]}'>${text}</a>`);
                }
                else {
                    const error = `"${key}" is not found in glossaryLink["${type}"], please fix ${match} or use link markup [string::link] insteand in step ${n}.`;
                    alert(error);
                    throw new Error(error);
                }
            }
            else {
                const error = `"${type}" is not found in glossaryLink object, please fix ${match} in step ${n}.`;
                alert(error);
                throw new Error(error);
            }
        }

        // replace markup for code location link
        while (loc.test(e)) {
            const
                query = e.match(loc),
                name = query[1] || (query[2] == 'html' ? 'index' : query[2] == 'css' ? 'style' : 'script');

            e = e.replace(loc, `<strong>##LINE('${name}.${query[2]}','${query[3]}')${query[4] || ''}##</strong>`);

            if (query.input[query.index - 1] == '+') {
                e = e.splice(query.index - 1, 1, `<strong>${query[2].toUpperCase()} line</strong> `);
            }
        }

        // BEGINNING OF A LIST
        isList = /^\[(-|=)/.test(e) ? true : isList;
        // BEGINNING OF SNIPPET
        isPre = /^\((html|css|js)\)/.test(e) ? true : isPre;

        // List of glossaries
        if (/^\(-{3}\)/.test(e)) {
            source[i] = '<p><strong>Required Syntax:</strong></p>';
        }
        // - OBJECTIVES -
        else if (/^\(\*{3}\)/.test(e)) {
            source[i] = '<center><p><strong>- OBJECTIVES -</strong></p></center>';
        }
        //  Switch tab
        else if (tab.test(e)) {
            source[i] = `<center><p class="notes">Switch over to the <strong>${e.replace(tab, '$1')}</strong> tab</p></center>`;
        }
        // OBJECTIVE HIGHLIGHT
        else if (highlight.test(e)) {
            source[i] = e.replace(highlight, '$1<p class="highlight">##' + (++objNum) + '##. $2</p>');
        }
        // NOTES HIGHLIGHT
        else if (notes.test(e)) {
            const center = /^\t?\(\*\*\)/.test(e);
            source[i] = `${center ? '<center>' : ''}${e.replace(notes, '$1<p class="notes">$2</p>')}${center ? '</center>' : ''}`;
        }
        else if (image.test(e)) {
            source[i] = e.replace(image, '<center><p class="notes"><a href="$1" target="_blank"><img src="$1"></a><br>Click the image to open it in a new tab</p></center>');
        }
        else {
            source[i] = (e.trim().length && !isPre && !isList) ? `<p>${e}</p>` : e;
        }

        source[i] = isList ? source[i].replace(/^\t(.+)/, '\t<li>$1</li>') : source[i];
        // END OF A LIST
        isList = /(-|=)\]$/.test(e) ? false : isList;
        // END OF SNIPPET
        isPre = /\(#\)/.test(e) ? false : isPre;
    });

    source = decodeURIComponent(source.join('\n'))
        // LISTS
        .replace(/\[-/g, '<ul>').replace(/-\]/g, '</ul>').replace(/\[=/g, '<ol>').replace(/=\]/g, '</ol>')
        // OBJECTIVE NUMBERS
        .replace(/##(\d+)##\.\s/g, objNum > 1 ? '$1. ' : '')
        // CODE SNIPPETS
        .replace(/\((html|css|js)\)/g, '<pre class="language-$1"><code class="snippet">').replace(/-js/g, '-javascript').replace(/\(#\)/g, '</code></pre>')
        // BOLD STYLE
        .replace(bold, '<strong>$1</strong>')
        // CODE STYLE
        .replace(code, '<code class="syntax">$1</code>')
        // LINK STYLE
        .replace(link, '<a href="$2" target="_blank">$1</a>');

    source += (n > 1 && n < tSteps ? '\n<hr>\n<p class="highlight">Click on <strong>Check all objectives</strong> to continue</p>' :
        n == 1 ? '\n<hr>\n<p class="highlight">Click on <strong>Next step</strong> to get started</p>' :
            '\n<hr>\n<p class="highlight"><strong>Export to Sandbox</strong> is now available for this project</p>');

    return source;
}

function convertLineNumber() {
    let siClone = styledInstruction.innerHTML;
    const markupReg = /##LINE\('([^']+)','([^']+)'\)([+-]\d+)*##/;

    storeActiveCode();

    while (markupReg.test(siClone)) {
        const markup = siClone.match(markupReg);
        let n, target = noMarkup(eval(markup[1].split(/\./)[1])).split(/\r?\n/);

        markup[2] = markup[2].replace(/&lt;/g, '<').replace(/&gt;/g, '>');

        target.forEach((line, i) => {
            if (line.includes(markup[2])) {
                if (!n) {
                    line = line.replace(markup[2], '');
                    n = line.includes(markup[2]) ? `<span class='warning'>'${markup[2]}' NOT UNIQUE</span>` : i + 1;
                }
                else n = `<span class='warning'>'${markup[2]}' NOT UNIQUE</span>`;
            }
        });
        // markup[3] is offset
        n = markup[3] && Number.isFinite(n) ? eval(`n${markup[3]}`) : n;
        siClone = siClone.replace(markup[0], n ? n : `<span class='warning'>'${markup[2].replace(/</g, '&lt;')}' NOT FOUND</span>`);
    }

    styledInstruction.innerHTML = siClone;
}

function selectAndCopy(elem) {
    const
        selection = window.getSelection(),
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
    (currentFocus && !altKey) ? currentFocus.focus() : null;
}

// =============================================================== //
// ==================== SOURCE CODE OPERATION ==================== //
// =============================================================== //

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
    // COLOUR CODING BUTTONS
    [btnHTML, btnCSS, btnJS].forEach((btn, i) => {
        btn.style.background = btn != activeCodeBtn ? ([html, css, js][i].trim().length > 0 ? 'forestgreen' : 'darkseagreen') : 'indianred';
    });
}

function copyCode(n) {
    if (n > 0 && n <= tSteps) {
        setValue(codeEditor, noMarkup(
            activeCodeBtn == btnHTML ? decodeURI(encodeURI(code[n]).match(htmlToken[2])[0].replace(htmlToken[0], '').replace(htmlToken[1], '')) :
                activeCodeBtn == btnCSS ? decodeURI(encodeURI(code[n]).match(cssToken[2])[0].replace(cssToken[0], '').replace(cssToken[1], '')) :
                    decodeURI(encodeURI(code[n]).match(jsToken[2])[0].replace(jsToken[0], '').replace(jsToken[1], ''))
        ));
    }
}

function updatePreview() {
    storeActiveCode();

    const
        redundant = [
            /<link\s+[^>]*href\s*=\s*('|")\s*style.css\s*\1(\s*|\s+[^>]+)>/,
            /<script\s+[^>]*src\s*=\s*('|")\s*script.js\s*\1(\s*|\s+[^>]+)>\s*<\/script\s*>/,
        ],
        mHead = noMarkup(html).match(/<head\s*>([\s\S]*)<\/head\s*>/),
        mBody = noMarkup(html).match(/<body\s*>([\s\S]*)<\/body\s*>/);

    let headContent = mHead ? (mHead[1].trim().length ? mHead[1] : '') : '',
        bodyContent = mBody ? (mBody[1].trim().length ? mBody[1] : '') : '<!-- NO HTML -->';

    headContent = headContent
        .split('\n')
        .filter(l => l.trim().length)
        .map(l => {
            redundant.forEach(r => { if (r.test(l)) l = l.replace(r, ''); });
            return `\t${l}`;
        });

    headContent.unshift(
        '\t<meta charset="UTF-8">',
        '\t<title>' + cProj + '</title>',
        '\t<link rel="stylesheet" href="../font-awesome-4.7.0/css/font-awesome.min.css">'
    );

    headContent.push(
        '\t<style>\n',
        noMarkup(css).trim().length > 0 ? noMarkup(css) : '/* NO STYLE */',
        '\n</style>'
    );

    bodyContent = bodyContent
        .split('\n')
        .filter(l => l.length)
        .map(l => { if (!redundant[1].test(l)) return `\t${l}`; });

    const pCode = [
        '<!DOCTYPE html>',
        '<html>',
        '<head>',
        headContent.join('\n'),
        '</head>\n',
        '<body>',
        bodyContent.join('\n'),
        '\n\n<script type="text/javascript">\n',
        noMarkup(js).trim().length > 0 ? noMarkup(js) : '// NO SCRIPT',
        '\n</script>\n',
        '</body>',
        '</html>',
    ].join('\n');

    if (!document.getElementById('preview')) {
        storeActiveCode();
        preview = newElement('iframe', { id: 'preview' });
        alignWithInstruction(preview);
        app.appendChild(preview);
    }
    preview.srcdoc = pCode;
}

function noMarkup(str) {
    return str.replace(new RegExp(`(${markup[0]}\\s*)|(\\s*${markup[1]})`, 'g'), '');
}

function convertEditable() {
    let sel = codeEditor.getSelectedText();

    if (sel.includes(markup[0]) || sel.includes(markup[1])) {
        while (sel.includes(markup[0]) || sel.includes(markup[1])) {
            sel = sel.replace(markup[0], '').replace(markup[1], '');
        }
        codeEditor.insert(sel);
    }
    else codeEditor.insert(`${markup[0]}${sel}${markup[1]}`);
}

function closePreview() {
    if (preview) {
        app.removeChild(preview);
        preview = null;
    }
}

// ====================================================== //
// ==================== STEP EDITING ==================== //
// ====================================================== //

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

    step.splice(cStep, 0, '');
    inst.splice(cStep, 0, '');
    logic.splice(cStep, 0, '');
    code.splice(cStep, 0, htmlToken[0] + htmlToken[1] + cssToken[0] + cssToken[1] + jsToken[0] + jsToken[1]);

    updateCodeButtons();

    taInstruction.value = template[1];
    preview ? updatePreview() : null;
    styledInstruction ? btnConvert.click() : null;
    if (logicEditor.getReadOnly) logicEditor.setReadOnly(false);
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
    step.splice(cStep, 1);
    inst.splice(cStep, 1);
    code.splice(cStep, 1);
    logic.splice(cStep, 1);

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

// ======================================================== //
// ==================== DATA OPERATION ==================== //
// ======================================================== //

function setValue(editor, value, cursor = {}) {
    if (!cursor.hasOwnProperty('row', 'column')) cursor = editor.selection.getCursor();
    editor.setValue(value);
    editor.gotoLine(cursor.row + 1, cursor.column, false);
}

// STORE CURRENT CONTENT AND DISPLAY NEW CONTENT
function updateContent(i) {
    inst[cStep] = taInstruction.value;
    taInstruction.value = inst[i];
    storeActiveCode();
    loadCodeInStep(i);
    setValue(codeEditor, i == cStep ? codeEditor.getValue() : getActiveCode('code', i));
    setValue(logicEditor, i == cStep ? logicEditor.getValue() : getActiveCode('logic', i));
}

function storeActiveCode(step = cStep) {
    // STORE CONTENT OF ACTIVE CODE PANEL
    btnHTML.disabled ? html = codeEditor.getValue() : (btnCSS.disabled ? css = codeEditor.getValue() : js = codeEditor.getValue());
    // STORE CODE FOR CURRENT STEP
    code[step] = htmlToken[0] + html + htmlToken[1] + cssToken[0] + css + cssToken[1] + jsToken[0] + js + jsToken[1];
    // STORE CONTENT OF ACTIVE LOGIC PANEL
    btnHTML.disabled ? htmlLogic = logicEditor.getValue() : (btnCSS.disabled ? cssLogic = logicEditor.getValue() : jsLogic = logicEditor.getValue());
    // STORE CODE FOR CURRENT STEP
    logic[step] = htmlToken[0] + htmlLogic + htmlToken[1] + cssToken[0] + cssLogic + cssToken[1] + jsToken[0] + jsLogic + jsToken[1];
}

// RETURN LOGIC OR SOURCE CODE CURRENTLY VISIBLE
function getActiveCode(type, step = cStep) {
    const token = activeCodeBtn == btnHTML ? htmlToken : (activeCodeBtn == btnCSS ? cssToken : jsToken);
    if (encodeURI(eval(type)[step]).match(token[2])) {
        const activeCode = decodeURI(encodeURI(eval(type)[step]).match(token[2])[0].replace(token[0], '').replace(token[1], ''));
        if (type == 'code') return btnHTML.disabled ? html = activeCode : (btnCSS.disabled ? css = activeCode : js = activeCode);
        else return btnHTML.disabled ? htmlLogic = activeCode : (btnCSS.disabled ? cssLogic = activeCode : jsLogic = activeCode);
    }
    else return '';
}

function loadToMemory(str) {
    // RESET ARRAYS
    inst = [''];
    code = [''];
    logic = [''];
    step = [''];

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
    }
    else {
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

// ================================================== //
// ==================== FILE I/O ==================== //
// ================================================== //

function generateJSON() {
    commitToMaster();

    const
        codeObjectivePattern = /equivalent(?:\.to)?\s*\(/,
        liveObjectivePattern = /^\s*pass\.on\s*\(/,
        mission = {
            missionUuid: '',
            settings: {
                revision: '(1,0)',
                level: 1,
                title: cProj,
                description: '',
                duration: null,
                type: 'project',
                status: 'private',
                core: 'web',
                resources: [],
                searchable: true,
                recommended: false,
                tags: [],
                missionName: kababCase(cProj),
                majorRevision: 1,
                minorRevision: 0,
                changeInfo: '',
                objectivesVersion: 2,
                authorName: 'Siuling Ding',
                contentType: 'code',
                authorId: '1315b022-3715-4e54-aa31-e917c53fb0be',
                ownerId: '1315b022-3715-4e54-aa31-e917c53fb0be',
                ownerName: 'Siuling Ding',
                ownerEmail: 'sd@bsd.education',
                mediaPdf: '',
                cardImage: '',
                cardLinks: [],
                jsConsole: false,
                webOutput: true,
                mobileView: {
                    mobileViewEnabled: false
                },
                totalPages: null,
                bodyLocking: false,
                codeUnlocked: false,
                missionVideo: '',
                sandboxDefault: false,
                serialControls: false,
                finalProductImage: '',
                imageUploadOnHtml: false
            },
            steps: {},
        },
        stepIds = [];

    //  collect project settings
    const
        mid = prompt('Please provide mission uuid. Leave blank to generate a new one.'),
        version = prompt('Please provide a revision ( e.g. 2.13 ).', '1.0'),
        status = prompt('Please choose a publish status:\n1. author only\n2. internal', 1),
        core = prompt('Please choose a core for this project:\n1. Web Development\n2. App Development\n3. Robotics and Hardware\n4. Video Game Development', 1),
        dsp = prompt('Project description:');

    mission.missionUuid = (mid && mid.trim().length) ? mid.trim() : uuidv4();

    if (/^\d+\.\d+$/.test(version)) {
        const v = version.split(/\./);
        mission.settings.revision = `(${v[0]},${v[1]})`;
        mission.settings.majorRevision = v[0].toString();
        mission.settings.minorRevision = v[1].toString();
    }
    else alert('Invalid revision format, the default will be used.');

    if (status == 2) mission.settings.status = 'internal';

    if (core && core > 1) mission.settings.core = core == 2 ? 'app' : core == 3 ? 'robo' : 'game';

    if (dsp.trim().length) mission.settings.description = dsp.trim();

    //  generate data structure for each step
    step.forEach((stepString, i) => {
        if (!i) return;

        let
            stepCode = {},
            stepExpectations = {
                live: []
            },
            hasCodeObjective = false;

        const
            stepObj = {
                stepId: '',
                type: 'code',
                orderNo: 0,
                title: '',
                content: {
                    instructions: ''
                },
                files: {},
                tests: {},
                stepNo: 0
            },
            editables = {
                html: [],
                css: [],
                js: []
            },
            testIds = [];

        stepObj.title = inst[i].split(/(\r+)?\n+/)[0];
        stepObj.content.instructions = instructionHTML(inst[i], i);
        stepObj.stepNo = i;
        stepObj.orderNo = i * 1000;

        //  generate 16-digit unique step id numbers
        do {
            stepObj.stepId = (Math.floor(Math.random() * (Number.MAX_SAFE_INTEGER - 1)) + 1).toString();
        } while (stepIds.includes(stepObj.stepId));

        stepIds.push(stepObj.stepId);

        //  extract answers for each file type
        ['index.html', 'style.css', 'script.js'].forEach((file, j) => {
            const
                type = file.split('.')[1],
                token = j ? j === 1 ? /##CSS##([\s\S]*)##CSS_E##/ : /##JS##([\s\S]*)##JS_E##/ : /##HTML##([\s\S]*)##HTML_E##/,
                codeString = code[i].match(token)[1],
                editableContents = codeString.match(/#BEGIN_EDITABLE#.+?#END_EDITABLE#/g),
                prevCodeString = i > 1 ? code[i - 1].match(token)[1] : null,
                logicString = logic[i].match(token)[1],
                hasTransition = logicString.includes('// Transition:'),
                codeObjectives = [],
                liveObjectives = [];

            stepCode[type] = codeString;

            //  set leave unchanged and skip this forEach iteration
            if (codeString === prevCodeString || `${codeString}${markup[0]}${markup[1]}` === prevCodeString) {
                stepObj.files[file] = { contentsWithAnswers: prevCodeString };
                return;
            }

            //  define standard step file object
            stepObj.files[file] = {
                contents: codeString,
                mode: 'new_contents'
            };

            //  build objectives arrays
            jsWithoutComments(logicString).split(/\n/).forEach(line => {
                if (codeObjectivePattern.test(line)) {
                    codeObjectives.push(line);
                    hasCodeObjective = true;
                }
                else if (liveObjectivePattern.test(line)) {
                    liveObjectives.push(line);
                }
            });

            //  handle mismatch between number of expectations and editables
            if (codeObjectives.length !== (editableContents || []).length) {
                const error = `Expectation code refers to ${codeObjectives.length} editable region${codeObjectives.length > 1 ? 's' : ''} while ${editableContents.length} ${editableContents.length > 1 ? 'are' : 'is'} found in step ${stepObj.stepNo}.`;
                alert(error);
                throw new Error(error);
            }

            //  populate answers array
            codeObjectives.sort().forEach((test, q) => {
                const answer = test.split('.or(')[0].match(/equivalent(?:\.to)?\s*\(\s*('|"|`)(.*)\1\s*\)/);

                if (answer) {
                    if (stepObj.files[file].answers) stepObj.files[file].answers.push(answer[2]);
                    else stepObj.files[file].answers = [answer[2]];

                    if (editableContents[q].replace(markup[0], '').replace(markup[1], '').trim() == answer[2]) {
                        stepObj.files[file].contents = stepObj.files[file].contents.replace(editableContents[q], '#BEGIN_EDITABLE#    #END_EDITABLE#');
                    }
                }
                else {
                    alert(`Failed to generate the answers array for step ${stepObj.stepNo}.`);
                    throw new Error(`Check expectation function: ${test}`);
                }
            });

            //  handle transition step
            if (hasTransition) {
                stepObj.files[file].contents = logicString.split('// Expectation:')[0].trim();
                stepObj.files[file].mode = 'modify';
                stepObj.files[file].contentsWithAnswers = '';

                if (stepObj.files[file].answers) {
                    stepObj.files[file].answers.forEach((answer, idx) => {
                        stepObj.files[file].contentsWithAnswers += `${codeString.split(/#BEGIN_EDITABLE#.+?#END_EDITABLE#/)[idx]}#BEGIN_EDITABLE#${answer}#END_EDITABLE#`;
                    });

                    stepObj.files[file].contentsWithAnswers += gifa(codeString.split(/#BEGIN_EDITABLE#.+?#END_EDITABLE#/), -1);
                }
            }

            //  store editable locations for each file (not optimised for editable lines)
            codeString.split(/\n/).forEach((line, k) => {
                if (line.includes(markup[0])) {
                    editables[type].push(k + 1);
                }
            });

            //  store expectation code
            liveObjectives.forEach(lo => stepExpectations.live.push(lo));
            stepExpectations[type] = logicString.split('// Expectation:');

            if (stepExpectations[type].length > 1) {
                //  mutate 2nd item from string to array
                stepExpectations[type] =
                    stepExpectations[type][1]
                        //  concatenate comments
                        .replace(/\n\s*(\/\/.*)/g, '//$1')
                        .split(/\n/)
                        .filter(line => line.trim().length)
                        .filter(line => !liveObjectivePattern.test(line));

                //  reduce expectation code to test function blocks
                stepExpectations[type] = stepExpectations[type].reduce((acc, cur, idx) => {
                    acc[acc.length - 1] += cur;

                    if (/equivalent(?:\.to)?\s*\(/.test(cur) && idx < stepExpectations[type].length - 1) {
                        acc.push('');
                    }

                    return acc;
                }, ['']);
            }
        });

        //  set step type to 'interactive' if only live expectation is found
        if (!hasCodeObjective && stepExpectations.live.length) {
            stepObj.type = 'interactive';
            stepObj.content.instructions = stepObj.content.instructions.split('\n').slice(0, -2).join('\n');
        }

        //  create stepObj.tests array
        let objectives = inst[i].split('(***)');
        const locationToken = /(?:(\w+)\.)?(html|css|js)#([^#\n]+)#([-+]\d+)?/g;

        objectives = objectives.length > 1 ? objectives.pop().trim().split(/(\r?\n)+/).filter(line => /^\(!\)/.test(line)) : [];

        objectives.forEach((objective, k) => {
            //  encode escaped characters
            objective = objective.replace(/\\(.)/g, (m, p1) => encodeURIComponent(p1));

            //  generate 16-digit unique test id
            let testId;

            do {
                testId = (Math.floor(Math.random() * (Number.MAX_SAFE_INTEGER - 1)) + 1).toString();
            } while (testIds.includes(testId));

            testIds.push(testId);

            //  formulate description for each objective
            const objectiveDescription =
                //  remove type#key#offset and any preceding string before passing to instructionHTML()
                //  instructionHTML() converts markup such as *bold* or `code` to HTML code
                instructionHTML(`\n\n${objective.replace(/^(.*(html|css|js)#[^#]+#([+-]\d+)?,|\(!\))\s*/, '')
                    //  capitalise first letter
                    .replace(/\b\w/, l => l.toUpperCase())}`)
                    //  remove <hr> and following string
                    .split('<hr>')[0]
                    .trim()
                    //  remove parent <p> element
                    .replace(/^<p>/, '').replace(/<\/p>$/, '')
                    //  convert phrases such as "following image" or "following link" to "provided image" or "provided link"
                    .replace(/following\s+(image|link)/, 'provided $1')
                    //  convert trailing ":" to "."
                    .replace(/:\s*$/, '.');

            //  define default test object
            stepObj.tests[testId] = {
                orderNo: (k + 1) * 1000,
                title: objectiveDescription,
                testFunction: '// Expectation:',
                testId: testId,
                failureMessage: ''
            };

            //  find line locations markups per objective
            const locationMarkup = objective.match(locationToken);

            if (locationMarkup) {
                locationMarkup.forEach(markup => {
                    markup = markup.split('#');
                    markup[1] = decodeURIComponent(markup[1]);

                    const
                        //  find the editable location defined by the instruction markup
                        editableLocation = stepCode[markup[0]].split(/\n/).findIndex(line => line.includes(markup[1])) + 1 + Number(markup[2]),
                        //  find the location in the list of editables and return its index
                        editableIndex = editables[markup[0]].findIndex(_editableLocation => _editableLocation === editableLocation);

                    //  handle line location error
                    if (editableIndex < 0) {
                        const error = `No editable region is found at line ${editableLocation}, please fix "${markup.join('#')}" in step ${stepObj.stepNo}.`;
                        alert(error);
                        throw new Error(error);
                    }

                    //  use the index to access the corresponding test function for that editable
                    stepObj.tests[testId].testFunction += `\n${stepExpectations[markup[0]][editableIndex].replace(/\/\/\/\//g, '\n//')}`;

                    //  set start tab
                    if (stepObj.content.startTab) return;
                    stepObj.content.startTab = `${markup[0] === 'html' ? 'index' : markup[0] === 'css' ? 'style' : 'script'}.${markup[0]}`;
                });
            }
            else if (stepExpectations.live.length) {
                stepObj.tests[testId].testFunction += `\n${stepExpectations.live.shift()}`;
            }
        });

        //  handle error when objective has no description
        if (stepExpectations.live.length) {
            const error = `Live objective "${stepExpectations.live[0]}" has no instructional description in step ${i}.`;
            alert(error);
            throw new Error(error);
        }

        //  handle error when last step contains objective
        if (i == tSteps && Object.keys(stepObj.tests).length) {
            const error = 'The last step of a project can not contain objectives.';
            alert(error);
            throw new Error(error);
        }

        mission.steps[stepObj.stepId] = stepObj;
    });

    console.clear();
    console.log(JSON.stringify(mission));
    return 'Mission JSON generated successfully';
}

function saveTextFile(txt) {
    let downloadLink = newElement('a');
    const
        textToSaveBlob = new Blob([txt], { type: 'text/plain' }),
        textToSaveURL = window.URL.createObjectURL(textToSaveBlob),
        fileNameToSave = `${cProj}.txt`;

    downloadLink.download = fileNameToSave;
    downloadLink.href = textToSaveURL;
    downloadLink.style.display = 'none';
    downloadLink.click();
}

function loadTextFile() {
    let fileToLoad = newElement('input', { type: 'file', accept: '.txt' });
    fileToLoad.style.display = 'none';
    fileToLoad.click();
    fileToLoad.onchange = () => {
        const fileReader = new FileReader();
        fileReader.onload = fileLoadedEvent => readValue(fileLoadedEvent.target.result, fileToLoad.value.split('\\').pop().replace(/\.txt/, ''));
        fileReader.readAsText(fileToLoad.files[0], 'UTF-8');
    };
}

function readValue(value, title) {
    loadToMemory(value);
    cProj = title;
    getStepName(cStep);
    info.value = `${cProj} - ${cStep} / ${tSteps} - ${getStepName()}`;
}

function saveToLocal() {
    if (document.visibilityState === 'visible' && tSteps > 1) {
        try {
            const codeScrollTop = codeEditor.session.getScrollTop();
            const logicScroolTop = logicEditor.session.getScrollTop();

            commitToMaster();
            localStorage.lbcontent = master;
            codeEditor.session.setScrollTop(codeScrollTop);
            logicEditor.session.setScrollTop(logicScroolTop);
            console.clear();
            print('file saved to local');

            return true;
        }
        catch (err) {
            return false;
        }
    }
}

function recoverFromLocal() {
    if (!localStorage.lbcontent) return alert('There is nothing stored locally.');
    if (confirm('You\'re about to load data from local storage, this may overwrite your current data and cause you to lose work. Are you sure?')) {
        if (confirm('This action can not be undone. Please confirm.')) readValue(localStorage.lbcontent);
    }
}

// ================================================= //
// ==================== HANDLER ==================== //
// ================================================= //

function keyHandler() {
    // disable F5 key
    if (/F5|ControlLeft/.test(event.code)) {
        event.preventDefault();
        return;
    }

    // handle tab key inside instruction editor
    else if (event.code == 'Tab' && event.target == taInstruction) {
        const
            t = taInstruction,
            bc = t.value.slice(0, t.selectionStart),
            ac = t.value.slice(t.selectionStart, t.value.length);
        t.value = `${bc}\t${ac}`;
        t.setSelectionRange(t.value.length - ac.length, t.value.length - ac.length);
        event.preventDefault();
        return;
    }

    // handle right alt key
    else if (event.code == 'AltRight' && !altKey) {
        // console.log(event.code);
        altKey = true;
        returnFocus = document.activeElement;
        returnFocus.blur();
    }

    // F1 key toggles tips
    else if (event.code == 'F1') {
        event.preventDefault();
        if (tipContainer) closeTips();
        else showTips();
    }

    // Esc key closes tips
    else if (event.code == 'Escape' && tipContainer) {
        event.preventDefault();
        closeTips();
    }

    // handles shortcut combos
    if (altKey && event.code != pkey) {
        event.preventDefault();

        switch (event.code) {
            case 'Digit0': confirm('Overwrite existing instructions?') ? taInstruction.value = template[0] : null; break;
            case 'Digit1': confirm('Overwrite existing instructions?') ? taInstruction.value = template[1] : null; break;
            case 'Digit2': confirm('Overwrite existing instructions?') ? taInstruction.value = template[2] : null; break;
            // case 'Digit3': taInstruction.value = template[3]; break;
            case 'Slash': convertEditable(); break;
            case 'KeyN': btnAdd.click(); break;
            case 'KeyP': btnRun.click(); break;
            case 'KeyL': if (cStep > 1) { testLogic(); break; } else { break; }
            case 'KeyK': generateTest(); break;
            case 'KeyI': btnConvert.click(); break;
            case 'KeyO': autoObjectiveText(); break;
            case 'Backspace': closePreview(); break;
            case 'BracketLeft': btnPrev.click(); break;
            case 'BracketRight': btnNext.click(); break;
            case 'Minus': activeCodeBtn == btnHTML ? btnHTML.click() : (activeCodeBtn == btnCSS ? btnHTML.click() : btnCSS.click()); break;
            case 'Equal': activeCodeBtn == btnJS ? btnJS.click() : (activeCodeBtn == btnCSS ? btnJS.click() : btnCSS.click()); break;
            case 'Period': btnDupPrev.click(); break;
            case 'Comma': btnDupNext.click(); break;
            case 'Backslash':
                if (/Windows/.test(window.navigator.userAgent)) {
                    if (returnFocus == taInstruction) {
                        const
                            t = taInstruction,
                            bc = t.value.slice(0, t.selectionStart),
                            ac = t.value.slice(t.selectionStart, t.value.length);
                        t.value = `${bc}\\${ac}`;
                        t.setSelectionRange(t.value.length - ac.length, t.value.length - ac.length);
                    }
                    else if (returnFocus.className == 'ace_text-input') {
                        eval(returnFocus.parentNode.id).insert('\\');
                    }
                }
                break;
        }

        // LIST OF KEYS TO ALLOW REPEATED PRESS
        pkey = event.code.replace(/KeyP|KeyL|KeyI|BracketLeft|BracketRight|Minus|Equal|Backslash/, '');
    }

    // shift + alt + f auto formats the code in the code editor
    if (shiftAlt) {
        event.preventDefault();
        const beautify = activeCodeBtn.id == 'html' ? html_beautify : activeCodeBtn.id == 'css' ? css_beautify : js_beautify;
        if (event.code == 'KeyF') setValue(codeEditor, beautify(codeEditor.getValue(), beautyOpts[activeCodeBtn.id]));
    }

    shiftAlt = event.shiftKey && event.altKey && (event.code == 'AltLeft' || event.code == 'ShiftLeft');
}

function showTips() {
    if (tipContainer) return;

    tipContainer = newElement('div', {
        id: 'tipContainer',
        style: `max-height: ${gCss(srcCode).height * 0.9}px`,
    });

    tipContainer.appendChild(newElement('p', {
        innerHTML: '<b>Tip</b>: "alt" refers to the <u>right</u> alt key unless specified otherwise',
        style: `
            text-align: right;
            color: dimgrey;
            width: 50%;
            margin: 5px 0 10px 50%;
        `,
    }));

    tipsData.forEach(data => {
        if (data == 'divider') {
            const hr = newElement('hr', { noShade: true, size: 1, color: 'silver' });
            tipContainer.appendChild(hr);
        }
        else {
            const tip = newElement('p', { style: 'margin: 10px 0' });

            if (typeof (data) == 'string') {
                tip.innerHTML = data;
            }
            else {
                const
                    entry = newElement('span', { className: 'hotkey', textContent: data.entry }),
                    description = document.createTextNode(` ${data.description}`);

                tip.appendChild(entry);
                tip.appendChild(description);
            }
            tipContainer.appendChild(tip);
        }
    });

    document.body.appendChild(tipContainer);
    alignTipContainer();

    app.style.filter = 'blur(2px) grayscale(80%)';

    setTimeout(() => app.onclick = closeTips, 250);
}

function closeTips() {
    if (!tipContainer) return;
    document.body.removeChild(tipContainer);
    app.style.filter = 'initial';
    tipContainer = null;
    app.onclick = null;
}

// ============================================ //
// ==================== UI ==================== //
// ============================================ //

function updateUI() {
    // elements to be aligned to the top of the page
    [btnRecover, btnLoad, btnConvert, btnSave, btnTips, btnDupPrev, btnHTML, btnCSS, btnJS, btnRun, btnDupNext].forEach(e => { e.style.top = `${pagePadding}px`; });
    // elememts to be aligned to the bottom of the page
    [btnPrev, btnAdd, btnDel, btnNext, info].forEach(e => { e.style.bottom = `${pagePadding}px`; });
    flexDivider();
    adaptToView();
}

function adaptToView() {
    // ===== LEFT SIDE ===== //   
    btnRecover.style.left = pagePadding + 'px';
    btnLoad.style.left = pagePadding * 3 + 'px';
    btnSave.style.left = get(vDiv, 'left') - get(btnSave, 'width') - pagePadding * 2 + 'px';
    btnTips.style.left = get(vDiv, 'left') - get(btnTips, 'width') + 'px';
    [btnPrev, btnAdd, btnDel, btnNext].forEach((e, i, arr) => {
        // POSITION EACH BUTTON
        e.style.left = i * (get(e, 'width') + margin) +
            // OFFSET TO CENTRE
            (get(vDiv, 'left') - pagePadding - arr.length * get(e, 'width') - margin * (arr.length - 1)) / 2 + pagePadding + 'px';
    });
    taInstruction.style.left = pagePadding + 'px';
    taInstruction.style.top = get(btnLoad, 'top') + get(btnLoad, 'height') + margin + 'px';
    taInstruction.style.width = get(vDiv, 'left') - pagePadding + 'px';
    taInstruction.style.height = get(btnPrev, 'top') - margin - get(taInstruction, 'top') + 'px';
    btnConvert.style.left = get(taInstruction, 'width') / 2 - get(btnConvert, 'width') / 2 + pagePadding + 'px';

    preview ? alignWithInstruction(preview) : null;
    styledInstruction ? alignWithInstruction(styledInstruction) : null;

    // ===== RIGHT SIDE ===== //
    btnDupPrev.style.left = get(vDiv, 'left') + get(vDiv, 'width') + pagePadding + 'px';
    btnDupNext.style.right = pagePadding * 2 + 'px';
    [btnHTML, btnCSS, btnJS, btnRun].forEach((e, i, arr) => {
        // POSITION EACH BUTTON
        e.style.left = i * (get(e, 'width') + margin / 2) + get(vDiv, 'left') + get(vDiv, 'width') +
            // OFFSET TO CENTRE
            (get(hDiv, 'width') - get(vDiv, 'width') - arr.length * get(e, 'width') - margin / 2 * (arr.length - 1) - pagePadding) / 2 + 'px';
    });
    srcCode.style.top = get(btnRun, 'top') + get(btnRun, 'height') + margin + 'px';
    srcCode.style.height = get(hDiv, 'top') - get(srcCode, 'top') + 'px';
    stepLogic.style.top = get(hDiv, 'top') + get(hDiv, 'height') + 'px';
    stepLogic.style.height = get(info, 'top') - get(stepLogic, 'top') - margin + 'px';
    [srcCode, stepLogic, info].forEach(e => {
        e.style.left = get(vDiv, 'left') + get(vDiv, 'width') + 'px';
        e.style.width = get(hDiv, 'width') - get(vDiv, 'width') - pagePadding + 'px';
    });
    codeEditor ? codeEditor.resize(codeEditor) : null;
    logicEditor ? logicEditor.resize(logicEditor) : null;

    // ===== TIPS ===== //
    if (tipContainer) alignTipContainer();
}

function alignTipContainer() {
    // vDiv.left + (view.width - vDiv.left - tip.width) / 2 
    const hOffset = get(vDiv, 'left'), vOffset = get(srcCode, 'top');
    tipContainer.style.left = hOffset + (window.innerWidth - hOffset - get(tipContainer, 'width')) / 2 + 'px';
    tipContainer.style.top = vOffset + (get(srcCode, 'height') - get(tipContainer, 'height')) / 2 + 'px';
}

function moveDivider(evt) {
    vDiv.style.left = clamp(evt.clientX - xOffset, vDivMin, window.innerWidth - vDivMin) + 'px';
    hDiv.style.top = clamp(evt.clientY - yOffset, hDivMin, window.innerHeight - (hDivMin - 100)) + 'px';
    hDiv.style.width = window.innerWidth - get(vDiv, 'left') + 'px';
    adaptToView();
}

function flexDivider() {
    vDiv.style.left = vDivMin + 'px';
    hDiv.style.top = window.innerHeight - (hDivMin - 100) + 'px';
    vDiv.style.height = window.innerHeight + 'px';
    hDiv.style.width = window.innerWidth - vDivMin + 'px';
}

function alignWithInstruction(e, target = taInstruction) {
    e.style.left = get(target, 'left') + 'px';
    e.style.top = get(target, 'top') + 'px';
    e.style.width = get(target, 'width') + 'px';
    e.style.height = get(target, 'height') + 'px';

    if (e == styledInstruction) e.style.padding = `0 ${(target.offsetWidth - 380) / 2}px`;
}

function initializeUI() {
    app.appendChild(hDiv);
    app.appendChild(vDiv);
    vDiv.id = 'vDiv'; hDiv.id = 'hDiv';
    vDiv.style.width = divWidth; hDiv.style.height = divWidth;
    vDiv.style.top = '0'; hDiv.style.right = '0';
    [vDiv, hDiv].forEach(e => {
        e.style.cursor = 'cell';
        e.style.userSelect = 'none';
    });

    vDiv.onmousedown = evt => {
        // if (preview) closePreview();
        xOffset = evt.clientX - get(vDiv, 'left'); yOffset = evt.clientY - get(hDiv, 'top');
        window.addEventListener('mousemove', moveDivider, true);
    };
    hDiv.onmousedown = evt => {
        // if (preview) closePreview();
        xOffset = evt.clientX - get(vDiv, 'left'); yOffset = evt.clientY - get(hDiv, 'top');
        window.addEventListener('mousemove', moveDivider, true);
    };

    const elem = Array.from(app.getElementsByTagName('*'));
    elem.forEach(e => { if (e.tagName != 'LI' && e.tagName != 'SCRIPT' && e.id != 'editor') e.style.position = 'absolute'; });
    updateUI();

    app.style.visibility = 'visible';
}

function highlightButton() {
    const c1 = logicEditor.getValue().trim().length > 0;
    btnHTML.style.borderWidth = (htmlLogic.trim().length > 0 || (c1 && activeCodeBtn == btnHTML)) ? '5px 0' : '0';
    btnCSS.style.borderWidth = (cssLogic.trim().length > 0 || (c1 && activeCodeBtn == btnCSS)) ? '5px 0' : '0';
    btnJS.style.borderWidth = (jsLogic.trim().length > 0 || (c1 && activeCodeBtn == btnJS)) ? '5px 0' : '0';
}

// ==================================================== //
// ==================== STEP LOGIC ==================== //
// ==================================================== //

function testLogic() {
    // ===== HELPER FUNCTIONS ===== //
    const
        // c = CODE; k = KEY; options = { str, int }
        insertLine = (c, k, options) => {
            const m = c.match(new RegExp(k, 'g'));

            if (!m) log(`step logic failed: '${k}' can not be found.`);
            else if (m.length > 1) log(`step logic failed: '${k}' is not unique.`);
            else {
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
        },
        makeEditableBlock = (c, k) => {
            const m = c.match(new RegExp(k, 'g'));

            if (!m) log(`step logic failed: '${k}' can not be found.`);
            else if (m.length > 1) log(`step logic failed: '${k}' is not unique.`);
            else return c.replace(k, `${markup[0]}${k}${markup[1]}`);
        };

    if (cStep > 1 && get(gutter, 'background') == '246, 246, 246') {
        let logic = logicEditor.getValue().split('// Expectation:')[0].trim();

        if (!logic.length) {
            logic =
                'return `${codeWithoutMarkup}#BEGIN_EDITABLE##END_EDITABLE#`;' +
                '\n// let output = codeWithoutMarkup; //.replace(/' +
                (activeCodeBtn == btnHTML ? '\\s*<!--.*-->/g,\'' : activeCodeBtn == btnCSS ? '\\s*\\/\\*.*\\*\\//g,\'' : ';\\s*\\/\\/.*/g,\';') +
                '\');\n// output = insertLine(output, \'key\', { line: \'\', offset: 0 });' +
                '\n// output = makeEditableBlock(output, \'key\');' +
                '\n// return output;';

            setValue(logicEditor, `// Transition:\n${logic}\n\n${logicEditor.getValue()}`.trim());
        }

        logic = jsWithoutComments(logic);

        const type = activeCodeBtn == btnHTML ? 'html' : activeCodeBtn == btnCSS ? 'css' : 'js';
        const token = activeCodeBtn == btnHTML ? htmlToken : activeCodeBtn == btnCSS ? cssToken : jsToken;
        let input = decodeURI(encodeURI(code[cStep - 1]).match(token[2])[0].replace(token[0], '').replace(token[1], '')),
            output = [];

        if (/^\s*return/m.test(logic)) {
            /codeWithoutMarkup/.test(logic) ? input = noMarkup(input) : null;
            // APPLY CODE IN LOGIC EDITOR TO INPUT
            output = eval(`(function(){ ${decodeURI(logic).replace(/codeWithoutMarkup/g, 'input').replace(/let\s+output/, 'output')} }())`);
            
            if (typeof (output) == 'string') {
                setValue(codeEditor, output);
                gutter.style.background = 'lightgreen';
            }
            else {
                log(`Output type is "${typeof (output)}", should be a string.`, 'warn');
                gutter.style.background = 'lightcoral';
            }
        }
        else {
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
    }

    // generateTest();
}

// ===================================================== //
// ==================== Expectation ==================== //
// ===================================================== //

function generateTest() {
    const src = codeEditor.getValue(), cursor = codeEditor.selection.getCursor();
    let
        // editable(n)
        n = 0,
        testFunctions = '';

    logicEditor.setValue(`${logicEditor.getValue().split('// Expectation:')[0]}`.trim());
    codeEditor.gotoLine(0, 0, false);

    while (/#(BEGIN|END)_EDITABLE#/.test(codeEditor.getValue())) {
        const r1 = codeEditor.find(markup[0], { caseSensitive: true });
        if (r1) {
            codeEditor.insert('');
            const r2 = codeEditor.find(markup[1], { caseSensitive: true });
            if (r2) {
                codeEditor.insert('');
                codeEditor.selection.setRange({
                    'start': {
                        'row': r1.start.row,
                        'column': r1.start.column,
                    },
                    'end': {
                        'row': r2.start.row,
                        'column': r2.start.column,
                    }
                });

                if (codeEditor.getSelectedText().trim().length) {
                    testFunctions += `\npass.if.${activeCodeBtn.innerHTML.toLowerCase()}.editable(${n++}).equivalent(\`${codeEditor.getSelectedText().trim().replace(/[\s\n\r]+/g, ' ')}\`);`;
                }
            }
            else {
                const warning = 'Missing #END_EDITABLE#.';
                alert(warning);
                log(warning, 'warn');
                break;
            }
        }
        else {
            const warning = 'Missing #BEGIN_EDITABLE#.';
            alert(warning);
            log(warning, 'warn');
            break;
        }
    }



    if (testFunctions.length) {
        testFunctions = `// Expectation:${testFunctions}`;

        if (logicEditor.getValue().trim().length) {
            testFunctions = `\n\n${testFunctions}`;
        }
    }

    setValue(codeEditor, src, cursor);
    setValue(logicEditor, `${logicEditor.getValue().split('// Expectation:')[0].trim()}${testFunctions}`);
}

// ============================================== //
// ==================== MISC ==================== //
// ============================================== //

function get(e, p) {
    const v = window.getComputedStyle(e).getPropertyValue(p);
    switch (p) {
        case 'background': return v.match(/\d+, \d+, \d+/)[0];
        default: return parseFloat(v);
    }
}

// axis: 0 is horizontal, 1 is vertical
function spaceBetween(e1, e2, axis = 0) {
    const pos1 = [get(e1, 'left'), get(e1, 'top')],
        pos2 = [get(e2, 'left'), get(e2, 'top')],
        size1 = [get(e1, 'width'), get(e1, 'height')],
        size2 = [get(e2, 'width'), get(e2, 'height')];
    return Math.max(Math.max(pos1[axis], pos2[axis]) - Math.min(pos1[axis], pos2[axis]) - (pos1[axis] <= pos2[axis] ? size1[axis] : size2[axis]), 0);
}

function log(msg, opt) {
    if (!opt) { opt = 'log'; }
    const time = new Date();
    console[opt](`[${this.pad(time.getHours())}:${this.pad(time.getMinutes())}:${this.pad(time.getSeconds())}] ${msg}`);
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
    }
    else return op(v);
}

String.prototype.splice = function (idx, rem, str) {
    return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
};