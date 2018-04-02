const
    ti = `<input class='small key' placeholder="Ain't no rest for the wicked.">
<div id='wrapper'>
    <h1 id='title'>Test</h1>
    <h3></h3>
</div>`,
    li = `<input class = 'small key ' placeholder="Don't do this">
<div id='wrapper'>
    <h1 id='title'>Test</h1>
    <h3></h3>
</div>`;

let counter = 0, ctrl, log = '', result = { teacher: {}, learner: {} }, context;

// ===== HtmlAst.js ===== //
const
    pOpeningTag = /^\s*<(?!\s*\/)(\s+)?([^/<>]+)?(>)?/i,
    pClosingTag = /^\s*<(\s*)?\/([^<>]+)?(>)?/i,
    tags = {
        all: [
            // IMPORTANT: ascending tag name lengths
            'p', 'b', 'u', 'i', 'a',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'em', 'hr', 'tt', 'dl', 'dt', 'dd', 'tr', 'th', 'td',
            'div', 'img', 'sup', 'sub', 'pre',
            'html', 'meta', 'head', 'link', 'body', 'span', 'nobr', 'form',
            'input', 'small', 'table', 'frame',
            'button', 'strong', 'select', 'option', 'strike',
            'textarea', 'frameset', 'noframes',
            'blockquote',
        ],
        void: ['area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'],
    },
    attributes = {
        all: [
            'id',
            'alt', 'dir', 'for', 'low', 'max', 'min', 'rel', 'src',
            'cite', 'code', 'cols', 'data', 'form', 'high', 'href', 'icon', 'kind', 'lang', 'list', 'loop', 'name', 'open', 'ping', 'rows', 'size', 'slot', 'span', 'step', 'type', 'wrap',
            'align', 'async', 'class', 'defer', 'ismap', 'label', 'media', 'muted', 'scope', 'shape', 'sizes', 'start', 'style', 'title', 'value', 'width',
            'accept', 'action', 'coords', 'height', 'hidden', 'method', 'poster', 'scoped', 'srcdoc', 'srcset', 'target', 'usemap',
            'charset', 'checked', 'colspan', 'content', 'default', 'dirname', 'enctype', 'headers', 'keytype', 'optimum', 'pattern', 'preload', 'rowspan', 'sandbox', 'srclang', 'summary',
            'autoplay', 'buffered', 'codebase', 'controls', 'datetime', 'disabled', 'download', 'dropzone', 'hreflang', 'itemprop', 'language', 'manifest', 'multiple', 'readonly', 'required', 'reversed', 'seamless', 'selected', 'tabindex',
            'accesskey', 'autofocus', 'challenge', 'draggable', 'integrity', 'maxlength', 'minlength', 'translate',
            'formaction', 'http-equiv', 'novalidate', 'radiogroup', 'spellcheck',
            'contextmenu', 'crossorigin', 'placeholder',
            'autocomplete',
            'accept-charset', 'autocapitalize',
            'contenteditable',
        ],
        boolean: ['checked', 'disabled', 'selected', 'readonly', 'multiple', 'ismap', 'defer', 'declare', 'noresize', 'nowrap', 'noshade', 'compact'],
        // strict: ['id', 'class'],
        // allowQuotes: ['title', 'value', 'placeholder'],
    };

let verdict, inputClone, invalidElement = [], ambiguous = [];

function HtmlAst(strHTML, ctx) {
    if (!ctx) {
        const err = HTMLHint.verify(strHTML, {
            'spec-char-escape': true,
            'id-unique': true,
            'src-not-empty': true,
            'attr-no-duplication': true,
        });

        if (err.length) throw new Error('Error in teacher code.');
    }

    let tree = [];

    inputClone = strHTML;

    while (inputClone.trim().length) {
        // extract text node
        const t = inputClone.match(/^[^<]+/);
        if (t) {
            inputClone = inputClone.slice(t[0].length);
            tree.push({ raw: t[0], type: 'text' });
        }

        // extract element node
        const e = checkElement();
        if (!e) break;
        tree.push(e);
    }

    // deal with ambiguous code
    if (!verdict && invalidElement.length) {
        verdict = `${invalidElement[0].openingTag.raw.trim()} needs a closing tag.`;
        if (ambiguous.length) verdict = `${ambiguous[0].raw} is not a valid closing tag for ${invalidElement[0].openingTag.raw.trim()}.`;
    }

    console.log(`${ctx ? 'Teach' : 'Learn'}er:`, tree);
    return tree;
    // console.log(inputClone);

    function checkElement() {
        const match = inputClone.match(pOpeningTag);

        if (!match) return; match.forEach((m, i) => log += `${i}: ${m ? m.trim() : m} | `);

        // empty space is found after the < symbol
        if (match[1] !== undefined) {
            verdict = `${match[0].trim()} is incorrect. Make sure there is no space after the < symbol.`;
            return;
        }

        // nothing is found inside the tag
        if (match[2] === undefined) {
            verdict = 'Please write a tag name after the < symbol.';
            return;
        }

        if (match[3] === undefined) {
            verdict = `Please make sure opening tags are closed off using theh > symbol.`;
            return;
        }

        let tagRaw = '', attrsRaw;

        // extract tag name and attributes
        Array.from(match[2]).every((char, i) => {
            if (!/\s/.test(char)) return (tagRaw += char);
            attrsRaw = match[2].slice(i);
            return;
        });

        // remove matched string from inputClone
        inputClone = inputClone.slice(match[0].length);

        if (!checkOpeningTag(tagRaw)) return;

        const element = {
            openingTag: {
                attrs: attrsRaw ? checkAttribute(attrsRaw) : [],
                raw: match[0],
                tagName: tagRaw.toLowerCase(),
                type: 'tagstart',
            },
            content: [],
            closingTag: {},
            isVoid: tags.void.some(t => tagRaw.toLowerCase() === t),
            type: 'element',
        };

        if (!element.openingTag.attrs) return;

        // in case of non-void element
        if (!element.isVoid) {
            let
                textContent = inputClone.match(/^[^<]+/),
                nestedElement = inputClone.match(pOpeningTag); log += 'Content: [';

            // extract content
            while (textContent || nestedElement) {
                if (textContent) {
                    inputClone = inputClone.slice(textContent[0].length);
                    element.content.push({ raw: textContent[0], type: 'text' }); log += `'${textContent[0]}', `;
                }
                else {
                    nestedElement = checkElement();
                    if (!nestedElement) break;
                    element.content.push(nestedElement);
                }

                textContent = inputClone.match(/^[^<]+/);
                nestedElement = inputClone.match(pOpeningTag)
            } log += '] | ';

            if (verdict && !invalidElement.length) return;

            // look for closing tag
            const closingTag = checkClosingTag(element.openingTag.raw.trim(), element.openingTag.tagName);

            if (!closingTag) {
                // element.error = verdict;
                invalidElement.push(element);
                verdict = null;
                return element;
            }

            element.closingTag = closingTag;
        } log += `isVoid: ${element.isVoid} | Remains: [${inputClone}]`;
        return element;
    }

    function checkOpeningTag(tagRaw, tag = tagRaw.trim().toLowerCase()) {
        if (!tags.all.some(t => tag === t)) {
            // invalid tag name followed by = or ' or "
            if (/[='"]/.test(tagRaw)) {
                verdict = `There should be a space in ${tagRaw.split(/[='"]/)[0]}.`;
            }
            else {
                verdict = `${tagRaw} is not a valid tag name.`;
            }

            // overwrite verdict if tagRaw starts with valid tag name
            tags.all.forEach(t => {
                if (tag.startsWith(t)) {
                    verdict = `There should be a space between ${tagRaw.slice(0, t.length)} and ${tagRaw.slice(t.length)}.`;
                }
            });

            return;
        }

        return true;
    }

    function checkClosingTag(element, tag) {
        const match = inputClone.match(pClosingTag);

        if (!match) {
            verdict = `${element} needs a closing tag.`;
        }
        else if (match[1]) {
            verdict = `${match[0].trim()} is incorrect. Make sure there is no space after the < symbol.`;
        }
        else if (match[2] !== tag) {
            verdict = `${match[0].trim()}`;
        }
        else if (!match[3]) {
            verdict = `Make sure to write the > symbol after ${match[0].trim()}.`;
        }

        if (verdict) {
            // look for valid closing tag in var:ambiguous
            if (ambiguous.length && lastOf(ambiguous).tag === tag) {
                return { raw: lastOf(ambiguous).raw, tagName: ambiguous.pop().tag, type: 'tagend' };
            }
            else {
                // store the current error in var:ambiguous if there is more code after the error
                if (match && match[0].trim().length <= inputClone.trim().length) {
                    ambiguous.push({
                        raw: match[0].trim(),
                        tag: match[2].trim().toLowerCase(),
                    });
                    inputClone = inputClone.slice(match[0].length);
                }
                return;
            }
        }

        inputClone = inputClone.slice(match[0].length);

        return { raw: match[0], tagName: match[2].trim(), type: 'tagend' };
    }

    function checkAttribute(attrsRaw) {
        // unable to reliably parse attributes and provide useful syntax error feedback
        // for teacher code, having reached this function means correct syntax
        // for learner code, this function checks for error agaisnt teacher code

        if (!attrsRaw.trim().length) return [];

        let attrsObj = {}, attrsArray = [],
            lot = {index: null, name: '', quotes: '', raw: '', value: ''};

        while (attrsRaw.length) {
            if (!lot.name) {
                const m = attrsRaw.match(/^\s+([a-z-]+)/);

                if (attributes.all.some(a => a === m[1].toLowerCase()) || /^data-/i.test(m[1])) {
                    lot.name = m ? m[1].toLowerCase() : '';
                    lot.raw = m[0];
                    attrsRaw = attrsRaw.slice(lot.raw.length);
                    console.log(m);
                    continue;
                }
            }
            // attribute requries a value
            else if (attributes.boolean.every(a => a != lot.name)) {
                
            }

            lot = {index: null, name: '', quotes: '', raw: '', value: ''};
            break;
        }

        return verdict ? false : attrsArray;

        // const attrsObjArray = [];

        // remove space around = symbol and quotes. e.g. id = ' box ' class='red ' >>> id='box' class='red'
        // let attrsCompact = attrsRaw.replace(/\s*=\s*/g, '=').replace(/=(['"])\s*/g, '=$1').replace(/\s*(['"])/g, '$1'),
        //     lot = { sq: [], dq: [], fq: null, name: '', quote: null, raw: '', value: null };

        // function removeValidAttr(s) {
        //     return s;
        // }

        // console.log(attrsCompact);
        // while (attrsRaw.trim().length) {
        //     console.log(attrsRaw);
        //     // look for attribute name if lot.name is empty
        //     if (!lot.name) {
        //         // if attrsRaw doesn't begin with space
        //         if (/^[^\s+]/.test(attrsRaw)) {
        //             verdict = `Please add a space after ${lastOf(attrsObjArray).raw}.`;
        //         }
        //         // if first non-space character isn't a letter(a-z)
        //         else if (/^\s+[^a-z]/.test(attrsRaw)) {
        //             verdict = `${removeValidAttr(attrsRaw)} is incorrect. Attribute name must begin with a letter(a-z).`;
        //         }
        //         // if string up to the first space or = sign contains anything other than letters(a-z) and dash(-)
        //         else if (/[^a-z-]/.test(attrsRaw.trim().split(/[\s+=]/))[0]) {
        //             verdict = `${removeValidAttr(attrsRaw)} is incorrect. Attribute name can only contain letters(a-z) and dash(-).`;
        //         }
        //         else {
        //             // get leading string containing letters(a-z) and dash(-)
        //             const m = attrsRaw.match(/^\s+([a-z-]+)/);

        //             if (attributes.all.some(a => a === m[1].toLowerCase()) || /^data-/i.test(m[1])) {
        //                 lot.name = m ? m[1].toLowerCase() : '';
        //                 lot.raw = m[0];
        //                 attrsRaw = attrsRaw.slice(lot.raw.length);
        //                 continue;
        //             }
        //             else {
        //                 verdict = `${m[1]} is not a valid attribute. Please read the instructions again.`;
        //             }
        //         }
        //     }
        //     // look for attribute value if lot.name is not a Boolean attribute
        //     else if (attributes.boolean.every(a => a != lot.name)) {
        //         const m = attrsRaw.match(/^(\s*=)(.+)?/);
        //         if (!m) {
        //             verdict = `The ${lot.name} attribute a value by adding the = sign after it.`;
        //         }
        //         else if (!m[2]) {
        //             verdict = `Please give the ${lot.name} attribute a value after the = sign.`;
        //         }
        //         else {
        //             attrsRaw = m[2];
        //             lot.raw += m[1];

        //             const validAttr = Array.from(m[2]).some((char, i) => {
        //                 lot.raw += char;

        //                 // if first quote is not yet found
        //                 if (!lot.fq) {
        //                     // if current character is anything other than space or single/double quote
        //                     if (/[^\s'"]/.test(char)) {
        //                         verdict = "Please add a quotation mark after the = sign.";
        //                     }
        //                     else if (/['"]/.test(char)) {
        //                         lot.fq = char;
        //                     }
        //                 }
        //                 else if (char === lot.fq) {
        //                     lot.quote = char;
        //                     lot.value = attrsRaw.slice(0, i).trim().slice(1);
        //                     attrsRaw = attrsRaw.slice(i + 1);
        //                 }
        //                 else if (/[^0-9a-z-_\s]/.test(char) && attributes.strict.some(a => a === lot.name)) {
        //                     verdict = `${attrsRaw.slice(0, i + 1)}.`;
        //                 }

        //                 return verdict || lot.value;
        //             });

        //             if (!validAttr && !verdict) {
        //                 if (!lot.quote) {
        //                     verdict = `Make sure quotes are properly paired in ${attrsRaw}.`;
        //                 }
        //                 else if (!lot.value) {
        //                     verdict = `Make sure the value isn't empty for the ${lot.name} attribute.`;
        //                 }
        //                 else {
        //                     verdict = `${attrsRaw.split(/[a-z][0-9a-z-_]*\s*=\s*('[^']*'|"[^"]*")/)[0]} is incorrect. Please read the instructions again.`;
        //                 }
        //             }
        //         }
        //     }

        //     if (verdict) break;

        //     attrsObjArray.push({
        //         name: lot.name,
        //         quote: lot.quote,
        //         raw: lot.raw,
        //         value: lot.value,
        //     });

        //     lot = { sq: [], dq: [], fq: null, name: '', quote: null, raw: '', value: null };
        // }
    }

    // function checkValue(attr, inputRaw) {
    //     if (inputRaw.trim().startsWith('=')) {
    //         inputRaw = inputRaw.replace(/^\s*=\s*/, '');

    //     }
    //     verdict = `Please add an equal sign after the ${attr} attribute.`;
    //     return false;
    // }
}


// ===== HtmlAstComparer.js ===== //
function compare(t, l) {
    result.teacher = HtmlAst(t);
    result.learner = HtmlAst(l, result.teacher);


}

// ===== LB IRRELEVANT ===== //

function reset() {
    console.clear();
    result = { teacher: {}, learner: {} };
    verdict = null;
    log = '';
    invalidElement = [];
    ambiguous = [];
}

function initialize() {
    teacher.value = ti;
    learner.value = li;

    btnParse.onclick = () => {
        reset();
        HtmlAst(learner.value, result.teacher.context);
        info.textContent = verdict || 'All good.';
    }

    btnCompare.onclick = () => {
        reset();
        compare(teacher.value, learner.value);
    };
}

function lastOf(arr) {
    if (!Array.isArray(arr)) arr = Array.from(arr);
    return arr[Math.max(arr.length - 1, 0)];
}

window.onload = () => initialize();

window.onkeydown = (evt) => {
    if (!ctrl) ctrl = evt.keyCode == 17;
};

window.onkeyup = (evt) => {
    if (ctrl && evt.keyCode == 17) ctrl = false;
    if (evt.keyCode == 13 && ctrl) btnParse.click();
};