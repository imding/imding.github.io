//  fix dash symbol in ##LINK##

const
    ti = ' <span class="red">hello</span> ',
    li = ' <a href="google.com"> Click</a> ';

let ctrl;

// ===== HtmlAst.js ===== //
const
    pOpeningTag = /^\s*<(?!\s*\/)(\s+)?([^<>]+)?(>)?/i,
    pClosingTag = /^\s*<(\s*)?\/(\s*)?([^<>]+)?(>)?/i,
    tags = {
        all: [
            // IMPORTANT: ascending tag name lengths
            'p', 'b', 'u', 'i', 'a',
            'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'em', 'hr', 'tt', 'dl', 'dt', 'dd', 'tr', 'th', 'td',
            'col', 'div', 'img', 'nav', 'sup', 'sub', 'pre', 'wbr',
            'area', 'base', 'code', 'html', 'meta', 'head', 'link', 'body', 'span', 'nobr', 'form',
            'embed', 'label', 'input', 'param', 'small', 'style', 'table', 'title', 'frame', 'track',
            'button', 'canvas', 'footer', 'header', 'keygen', 'iframe', 'strong', 'select', 'option', 'script', 'source', 'strike',
            'command', 'article', 'section',
            'noscript', 'textarea', 'frameset', 'noframes', 'progress',
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
            'accept', 'action', 'coords', 'height', 'hidden', 'method', 'nowrap', 'poster', 'scoped', 'srcdoc', 'srcset', 'target', 'usemap',
            'charset', 'checked', 'colspan', 'compact', 'content', 'declare', 'default', 'dirname', 'enctype', 'headers', 'keytype', 'noshade', 'optimum', 'pattern', 'preload', 'rowspan', 'sandbox', 'srclang', 'summary',
            'autoplay', 'buffered', 'codebase', 'controls', 'datetime', 'disabled', 'download', 'dropzone', 'hreflang', 'itemprop', 'language', 'manifest', 'multiple', 'readonly', 'required', 'reversed', 'seamless', 'selected', 'tabindex',
            'accesskey', 'autofocus', 'challenge', 'draggable', 'integrity', 'maxlength', 'minlength', 'noresize', 'translate',
            'formaction', 'http-equiv', 'novalidate', 'radiogroup', 'spellcheck',
            'contextmenu', 'crossorigin', 'placeholder',
            'autocomplete',
            'accept-charset', 'autocapitalize',
            'contenteditable',

            // window events
            'onafterprint', 'onbeforeprint', 'onbeforeunload', 'onerror', 'onhashchange', 'onload', 'onmessage', 'onoffline', 'ononline', 'onpageshow', 'onpopstate', 'onresize', 'onstorage',
            // form events
            'onblur', 'onchange', 'oncontextmenu', 'onfocus', 'oninput', 'oninvalid', 'onreset', 'onsearch', 'onselect', 'onsubmit',
            // keyboard events
            'onkeydown', 'onkeypress', 'onkeyup',
            // mouse events
            'onclick', 'ondblclick', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'onmousewheel', 'onwheel',
            // drag events
            'ondrag', 'ondragend', 'ondragenter', 'ondragleave', 'ondragover', 'ondragstart', 'ondrop', 'onscroll',
            // clipboard events
            'oncopy', 'oncut', 'onpaste',
            // media events
            'onabort', 'oncanplaythrough', 'oncuechange', 'ondurationchange', 'onemptied', 'onended', 'onerror', 'onloadeddata', 'onloadedmetadata', 'onloadstart', 'onpaush', 'onplay', 'onplaying', 'onprogress', 'onratechange', 'onseeked', 'onseeking', 'onstalled', 'onsuspend', 'ontimeupdate', 'onvalumechange', 'onwaiting',
            // misc events
            'onshow', 'ontoggle',

            'role' /* jQuery mobile specific */,
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

let verdict;

function HtmlAst(strHTML, origin, exception = null) {
    let inputClone = strHTML.replace(/<!--.*?(?=-->)-->/g, ''),
        ambiguous = { elem: [], closingTag: [] },
        tree = [];

    verdict = '';

    // parse html and build tree until no more valid opening tag
    while (inputClone.trim().length) {
        // extract text node
        const t = inputClone.match(/^[^<]+/);
        if (t) {
            inputClone = inputClone.slice(t[0].length);
            // text node containing only white spaces are ignored
            if (t[0].trim().length) {
                // detect lone attribute arrays(aa)
                const aa = checkAttribute(` ${t[0].trim()}`);

                // attribute array returned
                if (aa) {
                    // set exception for teacher result
                    if (exception === null) tree.exception = 'attributes only';
                    tree.push({ attrs: aa, raw: t[0].trim(), type: 'attributes' });
                }
                // no attribute array returned
                else {
                    // break loop if attribute only is expected
                    if (exception === 'attributes only') break;
                    else {
                        // no attributes found && no attribute expected
                        // clear error message and store string as plain text
                        verdict = '';
                        tree.push({ raw: t[0], rawCollapsed: t[0].trim().replace(/\s+/g, ' '), type: 'text' });
                    }
                }
            }
        }

        // extract element node
        const e = checkElement();
        if (!e) break;
        if (!inputClone.trim().length && !e.isVoid && !e.closingTag.raw) ambiguous.elem.push(e);
        tree.push(e);
    }

    /* at this point inputClone contains either nothing or closing tags ( i.e. </...> ) */

    const loneAttrs = tree.filter(e => e.type === 'attributes');
    if (loneAttrs.length && loneAttrs.length < tree.length) verdict = `${loneAttrs[0].raw} is in the wrong place. Attributes must be inside opening tags.`;

    if (!verdict) {
        //=====================================================================================//
        // deal with ambiguous code, if any                                                    //
        // any opening tag that is followed by another opening tag is stored in ambiguous.elem //
        // it is redeemed when the correct closing tag is found                                //
        // all unexpected closing tags are stored in ambiguous.closingTag                      //
        //=====================================================================================//
        if (ambiguous.elem.length + ambiguous.closingTag.length) {
            if (ambiguous.elem.length < ambiguous.closingTag.length) {
                verdict = `${lastOf(ambiguous.closingTag).raw} is not paired with anything. Please add an opening tag or remove it.`;
            }
            else if (ambiguous.elem.length > ambiguous.closingTag.length) {
                const err = {
                    type: 'opening tag only',
                    indication: `${lastOf(ambiguous.elem).openingTag.tagName} is not a void element.`,
                    solution: `Please add a closing tag for ${lastOf(ambiguous.elem).openingTag.raw} or remove it.`,
                };
                validatePartial(err);
            }
            else {
                verdict = `${lastOf(ambiguous.closingTag).raw} is not a valid closing tag for ${lastOf(ambiguous.elem).openingTag.raw}.`;
            }
        }
        // if input string has content
        else if (inputClone.trim().length) {
            // find valid closing tag
            const ct = checkClosingTag();
            // only evaluate the closing tag if there is not already ambiguous closing tags
            if (ct) {
                // check if closing tag is valid
                if (tags.all.some(t => t === ct.tagName)) {
                    ambiguous.closingTag.push(ct);
                    tree.push({ type: 'element', openingTag: { attrs: [], raw: '', tagName: '', type: 'tagstart' }, closingTag: ct, content: [], isVoid: false });
                }
                else verdict = `${ct.raw.trim()} is not a valid closing tag. Please read the instructions again.`;
            }

            if (!verdict) {
                const err = {
                    type: 'closing tag only',
                    indication: `${ambiguous.closingTag[0].raw} is not paired with anything.`,
                    solution: 'Please add an opening tag or remove it.'
                };
                validatePartial(err);
            }
        }
    }

    // console.log(`${origin}:`, tree);
    verdict = verdict ? `${origin}: ${verdict}` : verdict;
    return tree;

    // this._tree = tree;
    // this._messages = verdict ? [{
    //     type: messageType.error,
    //     message: verdict,
    // }] : [];

    // ===== NESTED FUNCTIONS ===== //
    function validatePartial(err) {
        // teacher code contains a single opening tag
        if (exception === null && tree.length === 1) tree.exception = err.type;
        // clear error message if learner code produces same error as teacher code
        else if (exception !== null && exception === err.type) verdict = '';
        // teacher code contains more than one element or learner code produces different error than teacher code
        else verdict = `${err.indication} ${err.solution}`;
    }

    function checkElement() {
        // basic syntax check for a single tag
        const m = inputClone.match(pOpeningTag);

        if (!m) {
            return;
        }
        else if (m[1]) {
            verdict = `${m[0].trim()} is incorrect. Make sure there is no space after the < symbol.`;
        }
        else if (!m[2]) {
            verdict = 'Please write a tag name after the < symbol.';
        }
        else if (!m[3]) {
            verdict = `The ${m[0].trim()} tag needs to be closed using the > symbol.`;
        }

        if (verdict) return;

        let tagRaw = '', attrsRaw;

        // extract tag name and attributes
        Array.from(m[2]).every((char, i) => {
            if (!/[\s/]/.test(char)) return (tagRaw += char);
            attrsRaw = m[2].slice(i);
            return;
        });

        inputClone = inputClone.slice(m[0].length);

        if (!checkOpeningTag(tagRaw)) return;

        // create empty element object
        const element = { openingTag: {} };

        if (attrsRaw) {
            // find a slash symbol at the end of the attrsRaw string
            const _m = attrsRaw.match(/\/\s*$/);
            if (_m) {
                // remove it from the attrsRaw string if found
                attrsRaw = attrsRaw.replace(/\/\s*$/, '');
                element.openingTag.close = _m[0];
            }
            else {
                element.openingTag.close = null;
            }
        }
        else {
            element.openingTag.close = null;
        }

        // assign other parametres for opening tag
        Object.assign(element.openingTag, {
            attrs: attrsRaw ? checkAttribute(attrsRaw, tagRaw.trim()) : [],
            // replace markup with ... so it doesn't appear in feedback messages
            raw: m[0].replace(/##\s*[A-Z]+\s*##/, '...'),
            tagName: tagRaw.toLowerCase(),
            type: 'tagstart',
        });

        // assign other parametres for element
        Object.assign(element, {
            content: [],
            closingTag: {},
            isVoid: tags.void.some(t => tagRaw.toLowerCase() === t),
            type: 'element',
        });

        if (!element.openingTag.attrs) return;

        if (element.isVoid) {
            if (element.openingTag.close && element.openingTag.close.endsWith(' ')) {
                verdict = `In the ${element.openingTag.tagName} tag, please remove any space after the / symbol.`;
            }
        }
        else if (element.openingTag.close) {
            verdict = `${element.openingTag.tagName} is not a void element. Please remove the / symbol.`;
        }
        // check for content & closing tag for non-void elements
        else {
            let
                textContent = inputClone.match(/^[^<]+/),
                nestedElement = inputClone.match(pOpeningTag);

            // extract content
            while (textContent || nestedElement) {
                if (textContent) {
                    inputClone = inputClone.slice(textContent[0].length);
                    // text node containing only white spaces are ignored
                    if (textContent[0].trim().length) element.content.push({ raw: textContent[0], rawCollapsed: textContent[0].trim().replace(/\s+/g, ' '), type: 'text', parent: element });
                }
                else {
                    nestedElement = checkElement();
                    if (!nestedElement) return;
                    nestedElement.parent = element;
                    if (!nestedElement.isVoid && !nestedElement.closingTag.raw) ambiguous.elem.push(nestedElement);
                    element.content.push(nestedElement);
                }

                textContent = inputClone.match(/^[^<]+/);
                nestedElement = inputClone.match(pOpeningTag);
            }

            // look for closing tag
            if (ambiguous.closingTag.length && ambiguous.closingTag[0].tagName === element.openingTag.tagName) {
                element.closingTag = ambiguous.closingTag.shift();
            }
            else {
                const closingTag = checkClosingTag();

                if (closingTag) {
                    if (closingTag.tagName === element.openingTag.tagName) {
                        element.closingTag = closingTag;
                    }
                    else {
                        ambiguous.closingTag.push(closingTag);
                    }
                }
            }
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

    function checkClosingTag() {
        const m = inputClone.match(pClosingTag);

        if (!m) {
            return;
            // verdict = `${element} needs a closing tag.`;
        }
        else if (m[1] || m[2]) {
            verdict = `${m[0].trim()} is incorrect. Make sure there is no space after <${m[2] ? '/' : ''}.`;
        }
        else if (!m[4]) {
            verdict = `The ${m[0].trim()} tag needs to be closed using the > symbol.`;
        }
        else if (!m[3]) {
            verdict = 'Please add a tag name after </.';
        }
        else if (!tags.all.some(t => t === m[3].trim().toLowerCase())) {
            verdict = `${m[3].trim()} is not a valid tag name.`;
        }
        else if (tags.void.some(t => t === m[3].trim().toLowerCase())) {
            verdict = `${m[3].trim()} is a void element and doesn't require a closing tag. Please remove the / symbol or the tag completely.`;
        }

        if (verdict) return;

        inputClone = inputClone.slice(m[0].length);

        return { raw: m[0], tagName: m[3].trimRight().toLowerCase(), type: 'tagend' };
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
                const validAttrName = attributes.all.some(a => a === m[2].toLowerCase()) || /^data-/i.test(m[2]);

                if (validAttrName) {
                    if (!m[1]) {
                        verdict = `Please add a space before the ${m[2]} attribute.`;
                    }
                    else {
                        // store attribute name
                        attrObj.name = m[2].toLowerCase();
                        // store raw attribute string, more will be added to this string later
                        attrObj.raw = m[0];
                        // remove attribute name from attrsRaw
                        attrsRaw = attrsRaw.slice(m[0].length);

                        const
                            boolAttr = attributes.boolean.some(a => a === m[2].toLowerCase()),
                            pushAttr = () => {
                                attrsArray.push({
                                    // index: null,
                                    name: attrObj.name,
                                    quote: attrObj.quote || null,
                                    raw: attrObj.raw,
                                    value: attrObj.value || null,
                                });

                                attrObj = {};
                            };

                        if (boolAttr) {
                            const _m = attrsRaw.match(/^\s*=('[^']*'|"[^"]*")?/);
                            _m ? verdict = `${attrObj.name} is a Boolean attribute. Please remove ${_m[0]}.` : pushAttr();
                            continue;
                        }

                        // find leading string in attrsRaw
                        // e.g (=)(")?(##LINK##)?
                        m = attrsRaw.match(/^(\s*=\s*)(['"])?(##\s*[A-Z]+\s*##)?/);

                        // m[1] - equal sign
                        // m[2] - single or double quote
                        // m[3] - markup e.g ##LINK##
                        if (m && !m[2] && m[3]) {
                            // wrap the markup in quotes
                            // e.g. src=##LINK## becomes src="##LINK##"
                            attrsRaw = attrsRaw.replace(m[3], `"${m[3]}"`);
                            // manually assign matched values
                            m[2] = '"';
                        }

                        if (!m) {
                            verdict = `${attrObj.name} is not a Boolean attribute. Please give it a value using the = sign.`;
                        }
                        else if (!m[2]) {
                            verdict = 'Remember to always use quotes after the = sign.';
                        }
                        else {
                            // store quote
                            attrObj.quote = m[2];
                            // store raw attribute string
                            attrObj.raw += `${m[1]}${m[2]}`;
                            // remove equal sign & opening quote from attrsRaw
                            attrsRaw = attrsRaw.slice(`${m[1]}${m[2]}`.length);

                            // expansive string search until closing quote
                            // store as raw string (attrObj.raw) & attribute value(attrObj.value)
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

        if (verdict) return;

        // check for duplicate attributes
        attrsArray.every(attr => {
            const uniqAttr = val(attr.name).isUniqueIn(attrsArray.map(_attr => _attr.name));
            if (!uniqAttr) verdict = `There should be only one ${attr.name} attribute in the ${tag} tag.`;
            return uniqAttr;
        });

        return verdict ? false : attrsArray;
    }
}

// ===== HtmlAstComparer.js ===== //
function similarity(s1, s2) {
    let longer = s1;
    let shorter = s2;
    if (s1.length < s2.length) {
        longer = s2;
        shorter = s1;
    }
    let longerLength = longer.length;
    if (longerLength == 0) return 1.0;
    return (longerLength - levenshtein_distance(longer, shorter)) / parseFloat(longerLength);
}

function levenshtein_distance(a, b) {
    if (a.length == 0) return b.length;
    if (b.length == 0) return a.length;

    let matrix = [];

    // increment along the first column of each row
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];

    // increment each column in the first row
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    // Fill in the rest of the matrix
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) == a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1,   // substitution
                    Math.min(matrix[i][j - 1] + 1,  // insertion
                        matrix[i - 1][j] + 1));     // deletion
            }
        }
    }

    return matrix[b.length][a.length];
}

function compare(model, input) {
    //============================================================//
    // compare elements using teacher node(tn) & learner node(ln) //
    // a node can be                                              //
    //    1) any HTML element with or without content             //
    //    2) any text that is not part of an opening tag          //
    //    3) [BSD ONLY] any opening or closing tag                //
    //============================================================//
    const matchElement = (tn, ln) => {
        const flexExpt = findRegularExpression(tn.raw);
        if (!(flexExpt.hasOwnProperty('compatible') && flexExpt.compatible.includes('html'))) throw new Error(`Match option "${flexExpt.type}" is incompatible with HTML.`);

        if (tn.type === 'element') {
            if (ln.type === 'element') {
                if (ln.openingTag.tagName && !tn.openingTag.tagName) {
                    verdict = `${ln.openingTag.raw} is not required. Please remove it.`;
                }
                else if (ln.openingTag.tagName !== tn.openingTag.tagName) {
                    verdict = `${ln.openingTag.raw}${ln.isVoid ? '' : `${ln.content.length ? '...' : ''}${ln.closingTag.raw || ''}`} is not the right ${ln.closingTag.raw ? 'element' : 'tag'}. The tag name should be ${tn.openingTag.tagName}.`;
                }
                else if (ln.closingTag.tagName && !tn.closingTag.tagName) {
                    verdict = `${ln.closingTag.raw} is not required. Please remove it.`;
                }
                else if (ln.closingTag.tagName !== tn.closingTag.tagName) {
                    verdict = `${ln.closingTag.raw} is not the right tag. The tag name should be ${tn.closingTag.tagName}.`;
                }
                else if (tn.openingTag.attrs.length < ln.openingTag.attrs.length) {
                    ln.openingTag.attrs.some(a => {
                        if (!val(a.name).isFoundIn(tn.openingTag.attrs.map(_a => _a.name))) {
                            verdict = `In the ${tn.openingTag.tagName} tag, the ${a.name} attribute is not required. Please remove it.`;
                        }
                    });
                }
                else if (matchAttrs(tn.openingTag, ln.openingTag)) {
                    // check for equal content length if combined length of teacher & learner nodes is non-zero
                    if (tn.content.length + ln.content.length && tn.content.length !== ln.content.length) {
                        const
                            someText = tn.content.length === 1 && tn.content[0].type === 'text' && !ln.content.length ? 'some text' : '',
                            noText = !tn.content.length && ln.content[0].type === 'text' ? 'no text' : '',
                            elements = `element${tn.content.length ? tn.content.length > 1 ? 's' : '' : ''}`,
                            only = (tn.content.length && tn.content.length < ln.content.length) ? 'only' : '',
                            n = tn.content.length ? (tn.content.length > 1 ? tn.content.length : (!ln.content.length ? 'an' : 'one')) : 'no',
                            prepo = tn.closingTag.raw ? 'inside the element' : 'after';

                        verdict = `There should be ${someText || noText || `${only ? `${only} ${n}` : n} ${elements}`} ${prepo} ${tn.openingTag.raw}${tn.closingTag.raw || ''}.`;
                    }
                    // compare content
                    else if (tn.content.length) {
                        tn.content.every((e, j) => {
                            if (ln.content[j]) {
                                if (j === tn.content.length - 1 && ln.content[j + 1]) {
                                    verdict = `In the ${ln.content[j + 1].parent.openingTag.tagName} element, ${ln.content[j + 1].openingTag ? `${ln.content[j + 1].openingTag.raw.trim()}${ln.content[j + 1].content.length ? '...' : ''}${ln.content[j + 1].isVoid ? '' : ln.content[j + 1].closingTag.raw.trim()}` : `"${ln.content[j + 1].raw.trim()}"`} is not required. Please remove it.`;
                                    return;
                                }
                                return matchElement(e, ln.content[j]);
                            }
                            else if (e.type) {
                                verdict = `${e.type === 'text' ? `Text content "${e.raw.trim()}"` : `The ${e.openingTag.tagName} element`} is missing from the ${tn.openingTag.tagName} element. Please add it in.`;
                            }
                            return;
                        });
                    }
                }
            }
            else if (ln.type === 'text') {
                verdict = `"${ln.raw.trim()}" is not an element. You can create elements using tags.`;
            }
        }
        else if (tn.type === 'text') {
            if (ln.type === 'element') {
                verdict = `${ln.openingTag.raw}${ln.isVoid ? '' : `${ln.content.length ? '...' : ''}${ln.closingTag.raw}`} is not text content. Please replace it with plain text.`;
            }
            else if (!ln.raw) {
                verdict = `Some text content is missing from ${tn.parent ? `the ${tn.parent.openingTag.tagName} element` : 'your code'}. Please add "${tn.raw.trim()}".`;
            }
            else if (!flexExpt.comparer(tn.rawCollapsed.toLowerCase(), ln.rawCollapsed.toLowerCase())) {
                const err = {
                    indication: `${tn.parent ? `In the ${tn.parent.openingTag.tagName} element, t` : 'T'}ext content "${ln.raw.trim()}" is incorrect`,
                    solution: 'Try ',
                };

                // if match options defined by teacher code
                if (flexExpt.type !== 'default') {
                    // determine error based on match type
                    if (flexExpt.type === 'any') err.indication = `Text content is empty${tn.parent ? ` in the ${tn.parent.openingTag.tagName} element` : ''}`;
                    // define solution based on match type
                    if (flexExpt.type === 'not') err.solution += 'something else';
                    else if (flexExpt.type === 'any') err.solution += 'adding any text';
                    else if (flexExpt.type === 'anyOf') err.solution += grammafy(parseOptions(tn.raw), 'or', '"');
                }
                // explicit expectation by teacher
                else {
                    err.solution += `"${tn.raw.trim()}"`;
                }

                verdict = `${err.indication}. ${err.solution}.`;
            }
        }
        return !verdict;
    };

    //========================================================================//
    // compare attributes and values inside teacher tag(tt) & learner tag(lt) //
    // the tag passed in here is always an opening tag                        //
    // an opening tag object looks like this:                                 //
    //    {                                                                   //
    //      close: string,                                                    //
    //      attrs: [{                                                         //
    //        name: string,                                                   //
    //        quote: string,                                                  //
    //        raw: string,                                                    //
    //        value: string,                                                  //
    //      }, {...}],                                                        //
    //      raw: string,                                                      //
    //      tagName: string,                                                  //
    //      type: string,                                                     //
    //    }                                                                   //
    //========================================================================//
    const matchAttrs = (tt, lt) => {
        const prepo = tt.tagName ? `In the ${tt.tagName} tag, ` : '';

        if (!(tt.attrs.length + lt.attrs.length)) {
            return true;
        }
        else if (tt.attrs.length === lt.attrs.length) {
            // copy of learner attributes(weak) that will be trimmed down to identify incorrect attributes
            const weak = lt.attrs, due = [];

            tt.attrs.every(a => {
                const flexExpt = findRegularExpression(a.value);
                if (!(flexExpt.hasOwnProperty('compatible') && flexExpt.compatible.includes('html'))) throw new Error(`Match option "${flexExpt.type}" is incompatible with HTML.`);

                if (val(a.name).isFoundIn(weak.map(_a => _a.name))) {
                    let
                        // it's safe to use the first occurence of an attribute with matching name because duplicate attribute name is an error HtmlAst.js would've caught
                        inputVal = weak.filter(_a => _a.name === a.name)[0].value,
                        missingVal;

                    if (a.name === 'class') {
                        a.value.split(/\s+/).forEach(v => {
                            val(v).isFoundIn(inputVal.split(/\s+/)) ? inputVal = inputVal.replace(v, '').trim() : missingVal = true;
                        });

                        if (inputVal.length) {
                            verdict = `${prepo}"${inputVal}" is not the right value for the ${a.name} attribute.`;
                        }
                        else if (missingVal) {
                            verdict = `${prepo}${prepo ? 's' : 'S'}ome value is missing from the ${a.name} attribute.`;
                        }
                    }
                    else if (flexExpt.type !== 'default') {
                        if (!flexExpt.comparer(inputVal)) {
                            verdict = flexExpt.message(null, `"${inputVal}"`);
                        }
                    }
                    else if (a.value !== inputVal) {
                        verdict = `${prepo}"${inputVal}" is not the right value for the ${a.name} attribute.`;
                    }

                    // remove matched attribute from the list of weak attributes
                    if (!verdict) {
                        weak.splice(weak.map(_a => _a.name).indexOf(a.name), 1);
                    }
                    else due.push(a);
                }
                else due.push(a);

                return !verdict;
            });

            // if any teacher defined attribute is not found in learner code
            if (!verdict && due.length) {
                if (due.length !== weak.length) throw new Error('The number of unmatched attribute should be equal to the number of weak attribute.');

                // estimate association between due and weak attributes
                let s, suggest;
                due.some(da => {
                    const
                        normaliseWordSequence = (words) => words ? words.trim().toLowerCase().split(/\s+/).sort().join() : '',
                        _s = similarity(normaliseWordSequence(weak[0].value), normaliseWordSequence(da.value));

                    if (_s > (s || 0)) {
                        s = _s;
                        suggest = da;
                    }
                    return s === 1;
                });

                if (suggest) verdict = `${prepo}${weak[0].raw.trim()} is incorrect. Try changing the attribute name to ${suggest.name}.`;
                else verdict = `${prepo}${weak[0].raw.trim()} is incorrect. Please read the instructions again.`;
            }

            return !verdict;
        }
        else {
            const
                only = tt.attrs.length < lt.attrs.length ? 'only' : '',
                n = tt.attrs.length ? (tt.attrs.length > 1 ? tt.attrs.length : 'one') : 'no';

            verdict = `There should be ${only ? `${only} ${n}` : n} attribute${n > 1 ? 's' : ''}${prepo ? ` in the ${tt.tagName} tag` : ''}.`;
        }

        return;
    };

    //========================================================================//
    // top level logic to compare teacher tree(model) and learner tree(input) //
    // the tree is an array of objects (element or text)                      //
    //    element = {                      text = {                           //
    //      openingTag: {...},               raw: string,                     //
    //      content: [...],                  rawCollapsed: string,            //
    //      closingTag: {...},               type: "text",                    //
    //      isVoid: Boolean,               }                                  //
    //      type: "element",                                                  //
    //    }                                                                   //
    // element.content follows the same structure                             //
    //========================================================================//
    if (model.length !== input.length) {
        const
            modelElements = model.filter(e => e.type === 'element'),
            modelTexts = model.filter(e => e.type === 'text'),
            inputElements = input.filter(e => e.type === 'element'),
            inputTexts = input.filter(e => e.type === 'text');

        // different element lengths
        if (modelElements.length !== inputElements.length) {
            if (!modelElements.length) {
                const it = `${inputElements[0].openingTag.raw}${inputElements[0].content.length ? '...' : ''}${inputElements[0].closingTag.raw || ''}`;
                verdict = `${it} is not required. Please remove it.`;
            }
            else {
                const
                    only = modelElements.length && modelElements.length < inputElements.length ? 'only' : '',
                    n = `${modelElements.length ? (modelElements.length > 1 ? modelElements.length : (!inputElements.length ? 'an' : 'one')) : 'no'}`,
                    elements = `element${modelElements.length ? modelElements.length > 1 ? 's' : '' : ''}`;

                if (n === 'an') verdict = 'Your code shouldn\'t be empty.';
                else verdict = `There should be ${only ? `${only} ${n}` : n} ${elements} in your code.`;
            }
        }
        // different text node lengths
        else if (modelTexts.length !== inputTexts.length) {
            if (!modelTexts.length) {
                verdict = `${inputTexts[0].raw.trim()} is not required. Please remove it.`;
            }
            else {
                const
                    only = modelTexts.length && modelTexts.length < inputTexts.length ? 'only' : '',
                    n = `${modelTexts.length ? (modelTexts.length > 1 ? modelTexts.length : (!inputTexts.length ? 'an' : 'one')) : 'no'}`,
                    textNodes = `text node${modelTexts.length ? modelTexts.length > 1 ? 's' : '' : ''}`;

                if (n === 'an') verdict = 'Your code shouldn\'t be empty.';
                else verdict = `There should be ${only ? `${only} ${n}` : n} ${textNodes} in your code.`;
            }
        }
        else if (!input.length) {
            verdict = 'Your code shouldn\'t be empty.';
        }
    }
    else {
        if (model[0].type === 'attributes') {
            if (input[0].type !== 'attributes') {
                const it = input[0].type === 'text' ? `"${input[0].raw.trim()}"` : `${input[0].openingTag.raw}${input[0].content.length ? '...' : ''}${input[0].closingTag.raw || ''}`;
                verdict = `${it} is not an attribute. Please read the instructions again.`;
            }
            else matchAttrs(model[0], input[0]);
        }
        else {
            // loop through every teacher node and find equivalent node in learner code
            model.every((e, i) => matchElement(e, input[i]));
        }
    }

    // this._messages = verdict ? [{
    //     type: messageType.fail,
    //     message: verdict,
    // }] : [];

    return !verdict;
}

// ===== AstComparer.js ===== //
function equalsIgnoreWhitespace(a, b) {
    a = removeWhitespace(a);
    b = removeWhitespace(b);
    return a === b;
}

function removeWhitespace(string) {
    if (string !== undefined) {
        return string.replace(/[\s]/gi, '');
    }
    return;
}

function removeComments(string) {
    if (string !== undefined) {
        return string.replace(/(?:\/\*(?:[\s\S]*?)\*\/)|(?:^\s*\/\/(?:.*)$)|(\<![\-\-\s\w\>\/]*\>)/gm, '');
    }
    return;
}

function collapseWhitespace(string) {
    if (string !== undefined) {
        return string.replace(/[\s\n]+/g, ' ');
    }
    return;
}

function defaultDeclarationMessage(expect, value) {
    return `${value} is incorrect. Please read the instructions again.`;
}

function matchesOption(expect, value) {
    const options = parseOptions(expect);
    return options.indexOf(value) >= 0;
}

function parseOptions(o) {
    const match = /##[\s\w]+\((.*)\)\s*##/.exec(o);
    if (match && match.length > 0) {
        return _.map(
            match[1].split(';'),
            o => o.trim()
        );
    }
    throw `Error parsing options '${o}'.`;
}

function convertToLowerCase(string) {
    if (string !== undefined) {
        return string.toLowerCase();
    }
    return string;
}

// To compare 2 string
function equalsCollapseWhitespace(a, b) {
    return collapseWhitespace(a) === collapseWhitespace(b);
}

function findRegularExpression(string) {
    if (/##\s*[a-zA-Z]+\s*\(\s*\)\s*##/.test(string)) throw new Error(`Please provide at least 1 match option for ${string}.`);

    const comparison = _.find(comparisonMode, (c) => {
        if (c.match) {
            return !!(c.match.exec(string));
        }
        else if (c.type === 'default') {
            return true;
        }
    });
    return comparison;
}

const comparisonMode = {
    rgb: {
        name: 'rgb',
        compatible: ['css', 'js'],
        match: /rgba?\([\.\d,\s]+\)/,
        comparer: (expt, val) => equalsIgnoreWhitespace(convertToLowerCase(expt), convertToLowerCase(val)),
        message: defaultDeclarationMessage,
    },
    anyOf: {
        type: 'anyOf',
        compatible: ['html', 'css', 'js'],
        match: /##\s*ANY\s*\(.*\)\s*##/,
        comparer: (expt, val) => matchesOption(expt, val),
        message: (expt, val) => `${val} is incorrect. Try using ${grammafy(parseOptions(expt))}.`,
    },
    not: {
        type: 'not',
        compatible: ['html', 'css', 'js'],
        match: /##\s*NOT\s*\(.*\)\s*##/,
        comparer: (expt, val) => !matchesOption(expt, val),
        message: (expt, val) => `${val} is incorrect. Try using a different value.`,
    },
    any: {
        type: 'any',
        compatible: ['html', 'css', 'js'],
        match: /##\s*ANY\s*##/,
        comparer: () => true,
        message: () => '',
    },
    color: {
        type: 'color',
        compatible: ['css', 'js'],
        match: /##\s*COLOR\s*##/,
        comparer: (expt, val) => matchColorOption('##COLOR(HEX;NAMED;RGB;RGBA)##', val),
        message: (expt, val) => `${val} is incorrect. Try using any color value.`,
    },
    colorWithOptions: {
        type: 'colorWithOptions',
        compatible: ['css', 'js'],
        match: /##\s*COLOR\s*\(.*\)\s*##/,
        comparer: (expt, val) => matchColorOption(expt, val),
        message: (expt, val) => {
            const options = parseOptions(expt);
            if (options.length === 1) {
                const opt = options[0];
                return defaultDeclarationMessage(expt, val);
            } else {
                return `${val} is incorrect. Try using ${grammafy(options.map((opt) => colorText[opt]))}.`;
            }
        },
    },
    url: {
        type: 'url',
        compatible: ['css', 'js'],
        match: /##\s*URL\s*##/,
        comparer: (expt, val) => compareWithRegExp('url', '([\'"])?[^\'"\\s]+\.(jpg|gif|jpeg|bmp|png|svg)\\s*[\'"]?', val),
        message: (expt, val, lang) => {
            let url = val;
            if (lang === 'css') {
                const wrap = /url[(].*[)]/;
                if (!wrap.test(val)) {
                    return `${val} is incorrect. The syntax should be: url("link").`;
                }
                url = val.replace(/url[(](.*)[)]/, '$1').trim();
            }
            const link = /^(['"])?[^'"\s]+\.(jpg|gif|jpeg|bmp|png|svg)[^'"\s]*\1$/;
            if (link.test(url)) {
                return '';
            } else {
                return `${val} doesn't contain a valid image link. Please read the instructions again.`;
            }
        },
    },
    link: {
        type: 'link',
        compatible: ['html', 'js'],
        match: /##\s*LINK\s*##/,
        comparer: val => /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/.test(val),
        message: (expt, val) => `${val} is not a valid link. Please read the instructions again.`,
    },
    default: {
        type: 'default',
        compatible: ['html', 'css', 'js'],
        comparer: (expt, val) => equalsCollapseWhitespace(convertToLowerCase(expt), convertToLowerCase(val)),
        message: defaultDeclarationMessage,
    },
};

function compareWithRegExp(type, valueReg, string) {
    const match = (new RegExp(`^${type}[(](.+)[)]$`, 'i')).exec(string.trim());
    if (valueReg === undefined) {
        return !!match;
    }

    if (match && match.length > 1) {
        return !!(new RegExp(`^${valueReg}$`, 'i')).exec(match[1].trim());
    }
    return false;
}

const colorText = {
    NAMED: 'a color name',
    HEX: 'a hex color',
    RGB: 'an rgb color',
    RGBA: 'an rgba color',
};

function matchColorOption(expt = '##COLOR(HEX;NAMED;RGB;RGBA)##', val) {
    const options = parseOptions(expt);
    let isMatch = false;
    for (let i = 0; i < options.length; i++) {
        switch (options[i]) {
            case 'NAMED':
                isMatch = cssColors[val] !== undefined;
                break;
            case 'HEX':
                isMatch = verifyHexColor(val);
                break;
            case 'RGB':
                isMatch = verifyRGBColor(val);
                break;
            case 'RGBA':
                isMatch = verifyRGBAColor(val);
                break;
        }
        if (isMatch) {
            return true;
        }
    }
    return false;
}

function verifyHexColor(color) {
    return !!/^#[a-fA-F0-9]{3,6}$/.exec(color) && (color.length === 4 || color.length === 7);
}

function verifyRGBColor(color) {
    return compareWithRegExp('rgb', addSpaceRegExp('[\\d]+,[\\d]+,[\\d]+'), color);
}

function verifyRGBAColor(color) {
    return compareWithRegExp('rgba', addSpaceRegExp('[\\d]+,[\\d]+,[\\d]+,[.\\d]+'), color);
}

function addSpaceRegExp(string) {
    string = string.replace(/,/g, '[\\s\\n]*,[\\s\\n]*');
    return string;
}

function grammafy(valArray, connector = 'or', quotes = '') {
    if (quotes.trim().length) valArray.forEach((v, i) => valArray[i] = `${quotes}${v}${quotes}`);

    valArray.some((v, i) => {
        if (valArray.length >= 3) {
            valArray[i] += (i === valArray.length - 2 ? ` ${connector}` : ',');
        } else {
            valArray[i] += (i === 0 ? (valArray.length > 1 ? ` ${connector}` : '') : '');
        }
        return i === valArray.length - 2;
    });

    return valArray.join(' ');
}

function getTagString(tagType, tagName) {
    if (tagType == 'tagstart') {
        return `<${tagName}>`;
    } else {
        return `</${tagName}>`;
    }
}
// turns something like `var sentence = "hello there";` into `var sentence = .............;` without changing the string length
function replaceStrings(str, replacement = '.') {
    let arr = str.match(/((`)[^`]*\2)|((')[^']*\4)|((")[^"]*\6)/g);
    arr ? arr.forEach((s) => {
        str = str.replace(s, Array(s.length + 1).join(replacement));
    }) : null;
    return str;
}

// ===== LOCAL ONLY ===== //
// function reset() {
//     console.clear();
//     result = { teacher: {}, learner: {} };
//     verdict = null;
//     ambiguous = { elem: [], closingTag: [] };
// }

function initialize() {
    teacher.value = ti;
    learner.value = li;

    btnCompare.onclick = () => {
        console.clear();
        const tt = HtmlAst(teacher.value, 'Teacher');

        if (!verdict) {
            const lt = HtmlAst(learner.value, 'Learner', tt.exception || '');

            if (!verdict) {
                compare(tt, lt);
            }
        }
        info.textContent = verdict || 'All good.';
    };

    teacher.addEventListener('keydown', tabHandler, false);
    learner.addEventListener('keydown', tabHandler, false);
}

function tabHandler(e) {
    const TABKEY = 9;
    if (e.keyCode == TABKEY) {
        const bc = this.value.slice(0, this.selectionStart),
            ac = this.value.slice(this.selectionStart, this.value.length);
        this.value = `${bc}    ${ac}`;
        this.setSelectionRange(this.value.length - ac.length, this.value.length - ac.length);
        if (e.preventDefault) {
            e.preventDefault();
        }
        return false;
    }
}

window.onload = () => initialize();

window.onkeydown = (evt) => {
    if (!ctrl) ctrl = evt.keyCode == 17;
};

window.onkeyup = (evt) => {
    if (ctrl && evt.keyCode == 17) ctrl = false;
    if (evt.keyCode == 13 && ctrl) btnCompare.click();
};

btnObjectiveText.onclick = () => {
    const tree = HtmlAst(teacher.value);

    if (tree.length === 1) {
        const el = tree[0];
        let ot = 'Create a';

        if (/^[aeiou]/.test(el.openingTag.tagName)) ot += 'n';

        ot += ` <${el.openingTag.tagName}> element`;

        if ()

        console.log(el);
        info.textContent = ot;
    }
};