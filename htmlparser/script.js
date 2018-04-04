const
    ti = `<input class='small key' disabled placeholder="Ain't no rest for the wicked.">
<div id="wrapper">
    <h1 id='title'>Test</h1>
    <h3></h3>
</div>`,
    li = `<input class = "small key " placeholder="Don't do this">
<div id="wrapper">
    <h1 id="title">Test</h1>
    <h3></h3>
</div>`;

let ctrl, result = { teacher: {}, learner: {} };

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
    };

function lastOf(arr) {
    if (!Array.isArray(arr)) arr = Array.from(arr);
    return arr[Math.max(arr.length - 1, 0)];
}

const val = (v) => {
    return {
        isUniqueIn: (a) => {
            let n = 0;
            a.some(item => {
                if (v === item) n++;
                return n > 1;
            });
            return n === 1;
        },
    };
};

let verdict, inputClone, invalidElement = [], ambiguous = [];

function HtmlAst(strHTML, origin) {
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
        verdict = `${lastOf(invalidElement).openingTag.raw.trim()} needs a closing tag.`;
        if (ambiguous.length) verdict = `${ambiguous[0].raw} is not a valid closing tag for ${invalidElement[0].openingTag.raw.trim()}.`;
    }

    console.log(`${origin}:`, tree);
    verdict = verdict ? `${origin}: ${verdict}` : verdict;
    return tree;

    // ===== NESTED FUNCTIONS ===== //
    function checkElement() {
        const match = inputClone.match(pOpeningTag);

        if (!match) return;

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
            verdict = `${match[0].trim()} needs to be closed off using the > symbol.`;
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
                attrs: attrsRaw ? checkAttribute(attrsRaw, tagRaw.trim()) : [],
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
                nestedElement = inputClone.match(pOpeningTag);

            // extract content
            while (textContent || nestedElement) {
                if (textContent) {
                    inputClone = inputClone.slice(textContent[0].length);
                    element.content.push({ raw: textContent[0], type: 'text' });
                }
                else {
                    nestedElement = checkElement();
                    if (!nestedElement) break;
                    element.content.push(nestedElement);
                }

                textContent = inputClone.match(/^[^<]+/);
                nestedElement = inputClone.match(pOpeningTag);
            }

            if (verdict && !invalidElement.length) return;

            // look for closing tag
            const closingTag = checkClosingTag(element.openingTag.raw.trim(), element.openingTag.tagName);

            if (!closingTag) {
                invalidElement.push(element);
                verdict = null;
                return element;
            }

            element.closingTag = closingTag;
        }
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
                verdict = '';
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

    function checkAttribute(attrsRaw, tag) {
        if (/['"]/.test(attrsRaw.replace(/'[^']*'|"[^"]*"/g, ''))) {
            verdict = `Please make sure the quotation marks are properly paired in ${attrsRaw.trim()}.`;
            return false;
        }

        let attrObj = {}, attrsArray = [];

        // basic syntax check-ups
        while (!verdict && attrsRaw.trim().length) {
            // start by looking for space(m[1]) followed by string(m[2])
            let m = attrsRaw.match(/^(\s+)?([A-Za-z-]+)/);

            if (m) {
                const
                    validAttrName = attributes.all.some(a => a === m[2].toLowerCase()) || /^data-/i.test(m[2]),
                    boolAttr = attributes.boolean.some(a => a === m[2].toLowerCase());

                if (validAttrName) {
                    if (!m[1]) {
                        verdict = `Please add a space before the ${m[2]} attribute.`;
                    }
                    else {
                        attrObj.name = m[2].toLowerCase();
                        attrObj.raw = m[0];
                        attrsRaw = attrsRaw.slice(m[0].length);

                        if (boolAttr) {
                            const _m = attrsRaw.match(/^\s*=('[^']*'|"[^"]*")?/);
                            _m ? verdict = `${attrObj.name} is a Boolean attribute. Please remove ${_m[0]}.` : pushAttr();
                            continue;
                        }

                        // look for equal sign(m[1]) followed by single or double quote(m[2])
                        m = attrsRaw.match(/^\s*(=)\s*(['"])?/);

                        if (!m[1]) {
                            verdict = `${attrObj.name} is not a Boolean attribute. Please give it a value.`;
                        }
                        else if (!m[2]) {
                            verdict = 'Remember to always use quotes after the = sign.';
                        }
                        else {
                            attrObj.quote = m[2];
                            attrObj.raw += m[0];
                            attrsRaw = attrsRaw.slice(m[0].length);

                            // expansive string search until closing quote then store as attribute value
                            Array.from(attrsRaw).some((char, i) => {
                                attrObj.raw += char;
                                if (char === attrObj.quote) {
                                    attrsRaw = attrsRaw.slice(i + 1);
                                    return true;
                                }
                                else {
                                    attrObj.value = (attrObj.value || '') + char;
                                    return;
                                }
                            });

                            if (attrObj.value && attrObj.value.trim()) {
                                attrObj.value = attrObj.value.trim().replace(/\s+/, ' ');
                                pushAttr();
                            }
                            else {
                                verdict = `Please provide a value for the ${attrObj.name} attribute.`;
                            }
                        }
                    }
                }
                else {
                    verdict = `${m[0].trim()} is not a valid attribute name.`;
                }
            }
            else {
                verdict = `In the ${tag} tag, ${attrsRaw} is incorrect. Please remove it.`;
            }

            if (verdict) break;
        }

        // check for duplicate attributes
        attrsArray.every(attr => {
            const uniqAttr = val(attr.name).isUniqueIn(attrsArray.map(_attr => _attr.name));
            if (!uniqAttr) verdict = `There should be only one ${attr.name} attribute in the ${tag} tag.`;
            return uniqAttr;
        });

        return verdict ? false : attrsArray;

        function pushAttr() {
            attrsArray.push({
                index: null,
                name: attrObj.name,
                quote: attrObj.quote || null,
                raw: attrObj.raw,
                value: attrObj.value || null,
            });

            attrObj = {};
        }
    }
}

// ===== HtmlAstComparer.js ===== //
function compare(t, l) {
    result.teacher = HtmlAst(t, 'Teacher');

    if (!verdict) {
        result.learner = HtmlAst(l, 'Learner');
    }
}

// ===== LB IRRELEVANT ===== //
function reset() {
    console.clear();
    result = { teacher: {}, learner: {} };
    verdict = null;
    invalidElement = [];
    ambiguous = [];
}

function initialize() {
    teacher.value = ti;
    learner.value = li;

    btnCompare.onclick = () => {
        reset();
        compare(teacher.value, learner.value);
        info.textContent = verdict || 'All good.';
    };
}

window.onload = () => initialize();

window.onkeydown = (evt) => {
    if (!ctrl) ctrl = evt.keyCode == 17;
};

window.onkeyup = (evt) => {
    if (ctrl && evt.keyCode == 17) ctrl = false;
    if (evt.keyCode == 13 && ctrl) btnCompare.click();
};