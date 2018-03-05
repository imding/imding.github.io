const input = `<input class = 'small key ' placeholder="Don't do this">
<div id='wrapper'>
    <h1 id='title'>Test</h1>
    <h3></h3>
</div>`;
let counter = 0, ctrl, log = '';

// ===== LB CODE ===== //
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
    };

let verdict, inputClone, invalidElement = [], ambiguous = [];

function checkElement() {
    const match = inputClone.match(pOpeningTag);

    if (!match) return;                                                     match.forEach((m, i) => log += `${i}: ${m ? m.trim() : m} | `);

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
        verdict = `${match[0].trim()} is incorrect. Please add the > symbol.`;
        return;
    }

    let tagRaw = '', attrsRaw;

    // extract tag name and attributes
    Array.from(match[2]).every((char, i) => {
        if (char !== ' ') {
            tagRaw += char;
            return true;
        }
        attrsRaw = match[2].slice(i);
        return;
    });

    // remove matched string from inputClone
    inputClone = inputClone.slice(match[0].length);
    
    if (!checkOpeningTag(tagRaw)) return;

    const element = {
        openingTag: {
            attrs: attrsRaw ? checkAttributes(attrsRaw) : [],
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
            nestedElement = inputClone.match(pOpeningTag);                              log += 'Content: [';
        
        // extract content
        while (textContent || nestedElement) {
            if (textContent) {
                inputClone = inputClone.slice(textContent[0].length);
                element.content.push({raw: textContent[0], type: 'text'});              log += `'${textContent[0]}', `;
            }
            else {
                nestedElement = checkElement();
                if (!nestedElement) break;
                element.content.push(nestedElement);
            }

            textContent = inputClone.match(/^[^<]+/);
            nestedElement = inputClone.match(pOpeningTag)
        }                                                                               log += '] | ';
        
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
    }                                                                                   log += `isVoid: ${element.isVoid} | Remains: [${inputClone}]`;
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
            return {raw: lastOf(ambiguous).raw, tagName: ambiguous.pop().tag, type: 'tagend'};
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
    
    return {raw: match[0], tagName: match[2].trim(), type: 'tagend'};
}

function checkAttributes(attrsRaw) {
    const 
        lot = {sq: [], dq: [], fq: null, name: '', quote: null, raw: '', value: null},
        attrsStrArray = [],
        attrsObjArray = [];
    
    // remove space around = symbol and quotes. e.g. id = ' box ' class='red ' >>> id='box' class='red'
    let attrsCompact = attrsRaw.replace(/\s*=\s*/g, '=').replace(/=(['"])\s*/g, '=$1').replace(/\s*(['"])/g, '$1');
    
    function removeValidAttr(s) {
        return s;
    }

    while (attrsCompact.length) {
        console.log(attrsCompact);
        if (!lot.name) {
            // look for attribute name
            if (/^[^\s+]/.test(attrsCompact)) {
                verdict = `Please add a space after ${lastOf(attrsObjArray.raw)}.`;
            }
            else if (/^\s+[^a-z]/.test(attrsCompact)) {
                verdict = `${removeValidAttr(attrsCompact)} is incorrect. Attribute name must begin with a letter(a-z).`;
            }
            else if (/[^a-z-]/.test(attrsCompact.trim().split(/[\s+=]/))[0]) {
                verdict = `${removeValidAttr(attrsCompact)} is incorrect. Attribute name can only contain letters(a-z) and the dash(-).`;
            }
            else {
                // get leading string containing letters(a-z) and dash(-)
                const m = attrsCompact.match(/^\s+[a-z-]+/);
    
                if (attributes.all.some(a => a === m[0]) || /^data-/i.test(m[0])) {
                    attrsCompact = attrsCompact.slice(lot.raw.length);
                    lot.name = m ? m[0].trim() : '';
                    lot.raw = m[0];
                }
                else {
                    verdict = `${m[0].trim()} is not a valid attribute. Please read the instructions again.`;
                }
            }
        }
        else if (attributes.boolean.every(a => a != lot.name)) {
            // look for attribute value
            const m = attrsCompact.match(/^(\s*=)(.+)?/);
            if (!m) {
                verdict = `The ${lot.name} attribute a value by adding the = sign after it.`;
            }
            else if (!m[2]) {
                verdict = `Please give the ${lot.name} attribute a value after the = sign.`;
            }
            else {
                attrsCompact = m[2];
                lot.raw += m[1];

                Array.from(m[2]).some((char, i) => {
                    // if first quote is not yet found
                    if (!lot.fq) {
                        // if current character is anything other than space or single/double quote
                        if (/[^\s'"]/.test(char)) {
                            verdict = "It's good practice to always use quotes for attribute values. Please add a quotation mark after the = sign.";
                        }
                        else if (/['"]/.test(char)) {
                            attrsCompact = attrsCompact.slice(i + 1);
                            lot.fq = char;
                            char === '"' ? lot.dq.push(char) : lot.sq.push(char);
                        }
                    }
                    else if (char === lot.fq) {
                        lot.quote = char;
                        lot.value = 
                    }
                    lot.raw += char;
                    return verdict || lot.value;
                });
            }
        }

        if (verdict) break;
        
        attrsObjArray.push({
            name: lot.name,
            quote: lot.quote,
            raw: lot.raw,
            value: lot.value,
        });
    } 
        

//     if (verdict) return;

//     attrsCompact.trim().split(/\s+/).every(a => {
//         a = a.split(/=/);
        
//         if (/^[^a-z]/.test(a[0])) verdict = `${a[0]} is incorrect. Attribute name must begin with a letter.`
//         else if (/[^a-z-]/.test(a[0])) verdict = `${a[0]} is incorrect. Attribute name can only contain letters(a-z) and the dash(-).`
//         else if (!(attributes.all.some(_a => _a === a[0]) || /^data-/i.test(a[0]))) verdict = `${a[0]} is not a valid attribute. Please read the instructions again.`
//         else if (a.length > 1) {
//             if (!a[1].length) verdict = `Please add a value for the ${a[0]} attribute after the = symbol.`
//             else if (!/^['"].*['"]$/.test(a[1])) verdict = `Please add quotation marks around ${a[1].replace(/['"]/g, '')}.`
//             else if (a[1][0] !== lastOf(Array.from(a[1]))) verdict = `${a[1]} is incorrect. Make sure quotation marks are properly paired.`;
//         }
//         else if (!attributes.boolean.some(_a => _a === a[0])) verdict = `${a[0]} is not a Boolean attribute. Please give it a value.`;
        
//         if (verdict) return;

//         const p = a.length > 1 ?
//             new RegExp(`\\s*${a[0]}\\s*=\\s*${a[1].replace(/(['"])(?=.)/g, '\\s*$1\\s*').replace(/(['"])$/, '\\s*$1')}`) :
//             new RegExp(`\\s*${a[0]}`);

//         const attrObj = {
//             name: a[0],
//             quote: a[1] ? a[1][0] : null,
//             raw: attrsRaw.match(p)[0],
//             value: a[1] ? a[1].slice(1, -1) : null,
//         };
// console.log(attrObj);
//         attrsRaw = attrsRaw.slice(attrObj.raw.length);
//         attrsObjArray.push(attrObj);
//         return true;
//     });

    return verdict ? false : attrsObjArray;
}

function checkValue() {
    return true;
}

function parse() {
    let tree = [];

    while (inputClone.trim().length) {
        // extract text node
        const t = inputClone.match(/^[^<]+/);
        if (t) {
            inputClone = inputClone.slice(t[0].length);
            tree.push({raw: t[0], type: 'text'});
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
    
    console.log(tree);
}

// ===== LB IRRELEVANT ===== //
function initialize() {
    ide.value = input;
    btnParse.onclick = () => {
        console.clear();
        inputClone = ide.value;
        verdict = null;
        log = '';
        invalidElement = [];
        ambiguous = [];
        parse(ide.value);
        info.textContent = verdict || 'All good.';
    }
}

function lastOf(arr) {
    return arr[Math.max(arr.length - 1, 0)];
}

function replaceStrings(str, replacement = '.') {
    let arr = str.match(/((')[^']*\2)|((")[^"]*\4)/g);
    arr ? arr.forEach((s) => {    
        str = str.replace(s, Array(s.length + 1).join(replacement));
    }) : null;
    return str;
}
  
window.onload = () => initialize();

window.onkeydown = (evt) => {
    if (!ctrl) ctrl = evt.keyCode == 17;
};

window.onkeyup = (evt) => {
    if (ctrl && evt.keyCode == 17) ctrl = false;
    if (evt.keyCode == 13 && ctrl) btnParse.click();
};