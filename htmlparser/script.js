const
    ti = `<div id="wrapper">
    <h1 id='title'>Test</h1>
    <h3></h3>
</div>
<img>`,
    li = `<div id="wrapper">
    <h1 id='title'>Test</h1>
    <h3></h3>
</div>
<img>`;

let ctrl;

// ===== HtmlAst.js ===== //
const
    pOpeningTag = /^\s*<(?!\s*\/)(\s+)?([^<>]+)?(>)?/i,
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
        isFoundIn: (a) => {
            return a.some(item => v === item);
        },
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

function flatten(srcArray, n = 0, end = srcArray.length) {
    if (n < 0 || end > srcArray.length) throw new Error(`${srcArray}[${n} to ${end}] can not be flattened due to invalid index range`);

    const addToSrcArray = (e, i) => srcArray.splice(n + i, 0, e);

    while (n < end) {
        if (Array.isArray(srcArray[n])) {
            const _arr = srcArray[n];
            srcArray.splice(n, 1);
            _arr.forEach(addToSrcArray);
        }
        n++;
    }
    return srcArray;
}

let verdict, inputClone, invalidElement = [], ambiguous = [];

function HtmlAst(strHTML, origin) {
    let tree = [];

    inputClone = strHTML;

    while (inputClone.trim().length) {
        // extract text node
        const t = inputClone.match(/^[^<]+/);
        if (t) {
            inputClone = inputClone.slice(t[0].length);
            // text node containing only white spaces are ignored
            if (t[0].trim().length) tree.push({ raw: t[0], type: 'text' });
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

    // this._tree = tree;
    // this._messages = verdict ? [{
    //     type: messageType.error,
    //     message: verdict,
    // }] : [];

    // ===== NESTED FUNCTIONS ===== //
    function checkElement() {
        // basic syntax check for a single tag
        const m = inputClone.match(pOpeningTag);

        if (m) {
            if (m[1]) {
                verdict = `${m[0].trim()} is incorrect. Make sure there is no space after the < symbol.`;
            }
            else if (!m[2]) {
                verdict = 'Please write a tag name after the < symbol.';
            }
            else if (!m[3]) {
                verdict = `${m[0].trim()} needs to be closed off using the > symbol.`;
            }
        }

        if (verdict) return;

        let tagRaw = '', attrsRaw;

        // extract tag name and attributes
        Array.from(m[2]).every((char, i) => {
            if (!/[\s/]/.test(char)) return (tagRaw += char);
            attrsRaw = m[2].slice(i);
            return;
        });

        // remove matched string from inputClone
        inputClone = inputClone.slice(m[0].length);

        if (!checkOpeningTag(tagRaw)) return;

        const element = {
            openingTag: {
                close: function () {
                    if (attrsRaw) {
                        const _m = attrsRaw.match(/\/\s*$/);
                        if (_m) attrsRaw = attrsRaw.replace(/\/\s*$/, '');
                        return _m ? _m[0] : null;
                    }
                    return null;
                }(),
                attrs: attrsRaw ? checkAttribute(attrsRaw, tagRaw.trim()) : [],
                raw: m[0],
                tagName: tagRaw.toLowerCase(),
                type: 'tagstart',
            },
            content: [],
            closingTag: {},
            isVoid: tags.void.some(t => tagRaw.toLowerCase() === t),
            type: 'element',
        };

        if (!element.openingTag.attrs) return;

        if (element.isVoid) {
            if (element.openingTag.close && element.openingTag.close.endsWith(' ')) {
                verdict = `In the ${element.openingTag.tagName} tag, please remove any space after the / symbol.`;
            }
        }
        else if (element.openingTag.close) {
            verdict = `${element.openingTag.tagName} is not a void element. Please remove the / symbol.`;
        }
        else {
            let
                textContent = inputClone.match(/^[^<]+/),
                nestedElement = inputClone.match(pOpeningTag);

            // extract content
            while (textContent || nestedElement) {
                if (textContent) {
                    inputClone = inputClone.slice(textContent[0].length);
                    // text node containing only white spaces are ignored
                    if (textContent[0].trim().length) element.content.push({ raw: textContent[0], type: 'text' });
                }
                else {
                    nestedElement = checkElement();
                    if (!nestedElement) return;
                    element.content.push(nestedElement);
                }

                textContent = inputClone.match(/^[^<]+/);
                nestedElement = inputClone.match(pOpeningTag);
            }

            // look for closing tag
            const closingTag = checkClosingTag(element.openingTag.raw.trim(), element.openingTag.tagName);

            if (!closingTag) {
                invalidElement.push(element);
                if (verdict === 'unclear') verdict = null;
                return verdict ? false : element;
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

            // overwrite verdict if tagRaw starts with valid tag name followed by a valid attribute  name with no space in between
            tags.all.forEach(t => {
                if (tag.startsWith(t) && attributes.all.some(a => tag.slice(t.length) === a)) {
                    verdict = `There should be a space between ${tagRaw.slice(0, t.length)} and ${tagRaw.slice(t.length)}.`;
                }
            });

            return;
        }

        return true;
    }

    function checkClosingTag(element, tag) {
        const m = inputClone.match(pClosingTag);

        if (!m) {
            verdict = `${element} needs a closing tag.`;
        }
        else if (m[1]) {
            verdict = `${m[0].trim()} is incorrect. Make sure there is no space after the < symbol.`;
        }
        else if (m[2].trimRight().toLowerCase() !== tag) {
            verdict = 'unclear';
        }
        else if (!m[3]) {
            verdict = `Please close off ${m[0].trim()} with a > symbol.`;
        }

        // if (verdict) return;

        if (verdict) {
            // look for valid closing tag in var:ambiguous
            if (ambiguous.length && lastOf(ambiguous).tag === tag) {
                verdict = null;
                return { raw: lastOf(ambiguous).raw, tagName: ambiguous.pop().tag, type: 'tagend' };
            }
            else {
                // store the current error in var:ambiguous if there is more code after the error
                if (m && m[0].trim().length <= inputClone.trim().length) {
                    ambiguous.push({
                        raw: m[0].trim(),
                        tag: m[2].trim().toLowerCase(),
                    });
                    inputClone = inputClone.slice(m[0].length);
                }
                return;
            }
        }

        inputClone = inputClone.slice(m[0].length);

        return { raw: m[0], tagName: m[2].trim(), type: 'tagend' };
    }

    function checkAttribute(attrsRaw, tag) {
        if (/['"]/.test(attrsRaw.replace(/'[^']*'|"[^"]*"/g, ''))) {
            verdict = `Please make sure quotation marks are properly paired in ${attrsRaw.trim()}.`;
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
                        m = attrsRaw.match(/^\s*=\s*(['"])?/);

                        if (!m) {
                            verdict = `${attrObj.name} is not a Boolean attribute. Please give it a value using the = sign.`;
                        }
                        else if (!m[1]) {
                            verdict = 'Remember to always use quotes after the = sign.';
                        }
                        else {
                            attrObj.quote = m[1];
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
                verdict = `In the ${tag} tag, ${attrsRaw.trim()} is incorrect. Please remove it.`;
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
    const model = HtmlAst(t, 'Teacher');

    if (!verdict) {
        const input = HtmlAst(l, 'Learner');
        if (!verdict) {
            model.every((e, i) => {
                if (input[i]) {
                    if (matchElements(e, input[i]) && i === model.length - 1 && input[i + 1]) {
                        verdict = `${input[i + 1].openingTag ? input[i + 1].openingTag.raw : input[i + 1].raw} is not required. Please remove it.`;
                    }
                }
                else {
                    verdict = `The ${e.openingTag.tagName} element is missing from your code. Please add it in.`;
                }
                return !verdict;
            });
        }
    }

    // compare elements using teacher node(tn) & learner node(ln)
    function matchElements(tn, ln) {
        if (tn.type === 'element') {
            if (ln.type === 'element') {
                if (ln.openingTag.tagName !== tn.openingTag.tagName) {
                    verdict = `${ln.openingTag.tagName} is not the right tag. Please read the instructions again.`;
                }
                else if (tn.openingTag.attrs.length < ln.openingTag.attrs.length) {
                    ln.openingTag.attrs.some(a => {
                        if (!val(a.name).isFoundIn(tn.openingTag.attrs.map(_a => _a.name))) {
                            verdict = `In the ${tn.openingTag.tagName} tag, ${a.name} attribute is not required. Please remove it.`;
                        }
                    });
                }
                else if (matchAttrs(tn.openingTag, ln.openingTag)) {
                    // compare content
                    if (tn.content.length) {
                        tn.content.every((e, j) => {
                            if (ln.content.hasOwnProperty(j)) {
                                return matchElements(e, ln.content[j]);
                            }
                            else {
                                verdict = `The ${e.openingTag.tagName} element is missing from your code. Please add it in.`;
                                return;
                            }
                        });
                    }
                }
            }
            else if (ln.type === 'text') {
                verdict = `${ln.raw} is not an element. You can create elements using tags.`;
            }
        }
        return !verdict;
    }

    // compare attributes and values using teacher tag(tt) & learner tag(lt)
    function matchAttrs(tt, lt) {
        return tt.attrs.every(a => {
            if (val(a.name).isFoundIn(lt.attrs.map(_a => _a.name))) {
                let
                    inputVal = lt.attrs.filter(_a => _a.name === a.name)[0].value,
                    missingVal;

                if (a.name === 'class') {
                    a.value.split(/\s+/).forEach(v => {
                        inputVal.includes(v) ? inputVal = inputVal.replace(v, '').trim() : missingVal = true;
                    });

                    if (inputVal.length) {
                        verdict = `In the ${tt.tagName} tag, "${inputVal}" is not the right value for the ${a.name} attribute.`;
                    }
                    else if (missingVal) {
                        verdict = `In the ${tt.tagName} tag, some value is missing from the ${a.name} attribute.`;
                    }
                }
                else if (a.value !== inputVal) {
                    verdict = `In the ${tt.tagName} tag, "${inputVal}" is not the right value for the ${a.name} attribute.`;
                }
            }
            else {
                verdict = `An attribute is missing in the ${lt.tagName} tag.`;
            }

            return !verdict;
        });
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