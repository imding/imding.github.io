// ========== LOCAL ONLY ========== //

const ti = '@import URL("http://font.googleapis.com/css?family=Roboto");';
const li = '@import url("http://font.googleapis.com/css?family=Arial");';

window.onload = initialize;

function initialize() {
    teacher.value = ti;
    learner.value = li;

    btnCompare.onclick = () => {
        console.clear();

        const t = teacher.value;
        const l = learner.value;
        const opts = null;              //  LOCAL ONLY
        const expectedMessages = [];    //  LOCAL ONLY

        const teacherAst = new CssAst(t);

        if (teacherAst.messages.length === 0) {
            const learnerAst = new CssAst(l, teacherAst.options);

            if (learnerAst.messages.length === 0) {
                const comparer = new CssAstComparer(teacherAst.options);
                comparer.compare(teacherAst, learnerAst, opts);

                if (comparer.messages.length !== expectedMessages.length) {
                    console.log('Received failures:', comparer.messages);
                    info.textContent = comparer.messages[0].message;    //  LOCAL ONLY
                }
                else info.textContent = 'All good.';                    //  LOCAL ONLY



                // for (let m of comparer.messages) {
                //     expect(m.message).not.toContain(AUTO_ADDED_SELECTOR);
                // }

                // expect(comparer.messages.length).toEqual(expectedMessages.length);

                // for (let em in expectedMessages) {
                //     const msgType = Object.keys(expectedMessages[em]);
                //     const expectedMsg = expectedMessages[em][msgType];
                //     const actualMsg = comparer.messages[em];

                //     expect(actualMsg.type).toEqual(msgType[0]);
                //     expect(actualMsg.message).toEqual(expectedMsg);
                // }
            } else {
                console.warn('WARNING: parsing the learner CSS has produced error messages which skips the comparison test:');
                console.log('learnerAst.messages:', learnerAst.messages);
                console.log('learner code:', l);
                console.log('teacher code:', t);
            }
        }
    };

    // teacher.addEventListener('keydown', tabHandler, false);
    // learner.addEventListener('keydown', tabHandler, false);
}

// ========== Ast.js ========== //

const messageType = {
    error: 'error',
    fail: 'fail',
    warn: 'warn',
};

// ========== AstComparer.js ========== //

function defaultDeclarationMessage(expect, value) {
    return `${value} is incorrect. Please read the instructions again.`;
}

function removeWhitespace(string) {
    if (string !== undefined) {
        return string.replace(/[\s]/gi, '');
    }
    return;
}

function equalsIgnoreWhitespace(a, b) {
    a = removeWhitespace(a);
    b = removeWhitespace(b);
    return a === b;
}

function equalsCollapseWhitespace(a, b) {
    return collapseWhitespace(a) === collapseWhitespace(b);
}

function convertToLowerCase(string) {
    if (string !== undefined) {
        return string.toLowerCase();
    }
    return string;
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

const urlRegEx = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;

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
        comparer: (expt, val) => true,
        message: (expt, val) => '',
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
        comparer: (expt, val) => compareWithRegExp('url', `(['"])${urlRegEx.source}\\1`, val),
        message: (expt, val, lang) => {
            let url = val;
            if (lang === 'css') {
                const wrap = /url[(].*[)]/;
                if (!wrap.test(val)) {
                    return `${val} is incorrect. The syntax should be: url("link").`;
                }
                url = val.replace(/url[(](.*)[)]/, '$1').trim();
            }

            if (urlRegEx.test(url)) {
                return '';
            } else {
                return `${val} doesn't contain a valid link. Please read the instructions again.`;
            }
        },
    },
    link: {
        type: 'link',
        compatible: ['html', 'js'],
        match: /##\s*LINK\s*##/,
        comparer: val => urlRegEx.test(val),
        message: (expt, val) => `${val} is not a valid link. Please read the instructions again.`,
    },
    default: {
        type: 'default',
        compatible: ['html', 'css', 'js'],
        comparer: (expt, val) => equalsCollapseWhitespace(convertToLowerCase(expt), convertToLowerCase(val)),
        message: defaultDeclarationMessage,
    },
};

// ========== CssAst.js ========== //

// import { collapseWhitespace, removeComments } from './AstComparer';
// import Ast, { messageType } from './Ast';
// import css from 'css';

// export const AUTO_ADDED_SELECTOR = 'LAUNCHBOX_auto_added_selector';
const AUTO_ADDED_SELECTOR = 'LAUNCHBOX_auto_added_selector';

/* Location information can be added later by traversing the tree object. */

const
    pNestedAtRule = /^\s*@(media|supports|document|page|font-face|keyframes|viewport|counter-style|font-feature-values)([^\S\n]+)?([^/;{}\n.#]+)?\s*/i,
    pAtRule = /^\s*@([^\s]+)?([^\S\n]+)?([^\n;]+)?(;)?/i,
    pRule = /^\s*([^@/;{}\s]+[^/;{}]*){\s*([^{}]*)}/i,
    pDeclaration = /([^:]+)?\s*(:)?\s*([^;]+)?\s*(;)?/i,
    tags = [
        'p', 'b', 'u', 'i', 'a',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'em', 'hr', 'tt', 'dl', 'dt', 'dd', 'tr', 'th', 'td',
        'div', 'img', 'sup', 'sub', 'pre',
        'code', 'html', 'meta', 'head', 'link', 'body', 'span', 'nobr', 'form',
        'input', 'small', 'table', 'frame',
        'button', 'strong', 'select', 'option', 'script', 'strike',
        'textarea', 'frameset', 'noframes',
        'blockquote',
        AUTO_ADDED_SELECTOR,
    ];

function rank(n) {
    return n > 0 ?
        n + (/1$/.test(n) && n != 11 ? 'st' : /2$/.test(n) && n != 12 ? 'nd' : /3$/.test(n) && n != 13 ? 'rd' : 'th') :
        n;
}

function toSpace(srcString, target) {
    return target ?
        srcString.replace(target, target.replace(/[^\s]/g, ' ')) :
        srcString.replace(/[^\s]/g, ' ');
}

function lastOf(arr) {
    return arr[Math.max(arr.length - 1, 0)];
}

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

class CssAst {
    constructor(css, opts = null) {
        // super();
        this._messages = [];
        this._options = {};

        if (css === 'undefined') {
            throw 'CSS parameter is required.';
        } else {
            let cssClone = removeComments(css).trim();
            if (cssClone === '') {
                this._ast = this._parseAst(cssClone);
                this._tree = { atRules: [], rules: [] };
            } else {
                cssClone = this._autoComplete(cssClone, opts);
                if (this._initialCheck(cssClone, opts)) {
                    this._ast = this._parseAst(cssClone);
                }
            }
        }
    }

    /* auto-completes partial syntax for teacher code, applies same auto-completion to learner code */
    _autoComplete(input, opts) {
        let output;

        if (opts === null) {   // opts === null for teacher code, learner code otherwise
            // input = collapseWhitespace(input);
            this._options.declarationsOnly = !pRule.test(input) && !input.trim().startsWith('@');

            if (this._options.declarationsOnly) {
                output = this._wrapWithSelector(input.endsWith(';') ? input : `${input};`);   // selector wrap and attach semi-colon
            } else {
                output = input.replace(/([^\s{};])(\s*)}/g, '$1;$2}');    // insert semi-colon before } that isn't preceded by ; or { or }
            }
        }
        else if (opts.declarationsOnly) {
            if (!pRule.test(input)) output = this._wrapWithSelector(input);
        }

        return (output ? output : input);
    }

    /* checks for errors that are difficult to identify with parser error messages */
    _initialCheck(input /* space-collapsed for teacher code, untouched for learner code */, opts) {
        let verdict = '', pass = true, inputClone = input, ruleCount = 0, tree = { atRules: [], rules: [] };

        function latestNode() {
            return lastOf([tree.rules, tree.atRules].filter(arr => arr.some(r => r.nth == ruleCount))[0]);
        }

        function buildInvalidCode(invalidCode = '') {
            let ln, isNestedAtRule;

            // error position can be retrieved before trim
            inputClone = inputClone.trim();

            // build invalid code
            while (inputClone.length) {
                invalidCode += inputClone[0];

                if (inputClone[0] == '}') break;

                inputClone = inputClone.slice(1);
            }

            // if tree is partially built
            if (tree.rules.length + tree.atRules.length) {
                ln = latestNode();
                isNestedAtRule = ln.hasOwnProperty('rules') || ln.hasOwnProperty('keyframes');
            }

            const braces = invalidCode.match(/[{}]/g) || [];

            if (braces.length % 2) {
                // pattern to remove valid rules from invalid code
                const p = /\s*([^@/;{}\s]+[^/;{}]*){\s*([^{}]*)}/g;
                verdict = `Make sure the curly brackets are properly paired in ${invalidCode.replace(p, '').replace(/\s+/g, ' ')}.`;
            }
            else if (/^{[^{}]+}/.test(invalidCode)) {
                verdict = isNestedAtRule ?
                    `There is a missing selector in the @${ln.type} at-rule.` :
                    `The ${rank(ln.nth + 1)} rule in your CSS has no selector.`;
            }
            else {
                verdict = isNestedAtRule ?
                    `The @${ln.type} at-rule contains invalid code. Please read the instructions again.` :
                    ln ?
                        `Your CSS is incorrect after the ${rank(ln.nth)} rule. Please read the instructions again.` :
                        `${invalidCode} is incorrect. Please read the instructions again.`;
            }
        }

        function pushAtRule(nested, data) {
            if (nested) {
                switch (data[1]) {
                    case 'media':
                        // further analyze identifiers
                        if (data[3]) {
                            // loop to find & remove trailing tag names
                            for (let i = 0; i < tags.length; i++) {
                                const p = new RegExp(`\\s*${tags[i]}(\\[[^\\[\\]]*\\])?\\s*$`, 'i');

                                if (p.test(data[3])) {
                                    data[0] = data[0].replace(p, '');
                                    data[3] = data[3].replace(p, '');
                                    i = -1;
                                }
                            }
                        }
                        tree.atRules.push({ type: 'media', media: data[3] ? data[3].trim() : '', rules: [], nth: ruleCount += 1 });
                        break;

                    case 'keyframes':
                        tree.atRules.push({ type: 'keyframes', name: data[3] ? data[3].trim() : '', vendor: '', keyframes: [], nth: ruleCount += 1 });
                        break;

                    default: throw new Error(`Expectation for the @${data[1]} at-rule is not yet implemented.`);
                }
            } else {
                tree.atRules.push({ type: data[1], value: data[3], nth: ruleCount += 1 });
            }
        }

        function pushNestedRule(type, data) {
            switch (type) {
                case 'media':
                    if (checkRule(data, true)) {
                        lastOf(tree.atRules).rules.push({ type: 'rule', selectors: data[1], declarations: data[2] });
                    }
                    break;

                case 'keyframes':
                    if (/\s/.test(data[1])) {
                        verdict = `${data[1]} is incorrect. No space is allowed.`;
                    }
                    else if (!/^[\d]+(\.[\d]+)?%$/.test(data[1])) {
                        verdict = `${data[1]} is not a valid selector for the @keyframes at-rule. Use a number followed by the % symbol.`;
                    } else {
                        lastOf(tree.atRules).keyframes.push({ type: 'keyframe', values: data[1], declarations: data[2] });
                    }
                    break;
            }

            if (data[2] && !verdict) {
                const
                    r = lastOf(tree.atRules).rules || lastOf(tree.atRules).keyframes,
                    d = checkDeclaration(lastOf(r));

                if (d) checkProperty(d) && checkValue(d);
            }
            return !verdict;
        }

        function parse() {
            const foundAndMatched = (p, i) => {
                let match = inputClone.match(p);

                if (match && pass) {
                    // invalidate matched string containing white spaces only
                    match = match.map(m => m ? m.trim() || m : m);
                    pass = i ? checkAtRule(match, i == 1) : checkRule(match);
                }

                return match && pass;
            };

            while (inputClone.trim().length && !verdict) {
                pass = [pRule, pNestedAtRule, pAtRule].some(foundAndMatched);

                if (verdict) break;

                if (!pass) buildInvalidCode();
            }
        }

        function checkAtRule(match, nested) {
            // remove "@[type] [identifier]" from input string
            inputClone = toSpace(inputClone, match[0]);

            // @media or @keyframes etc...
            if (nested) {
                const
                    ob = inputClone.match(/^\s*\{/),      // opening brace
                    checker = [
                        {
                            error: /[A-Z]/.test(match[1]),
                            feedback: `@${match[1]} is incorrect. Make sure all letters are lowercase.`,
                        },
                        {
                            error: !match[3],
                            feedback: `The @${match[1]} at-rule needs a${match[1] == 'media' ? 'n identifier' : ' name'}.`,
                        },
                        {
                            error: match[1] == 'keyframes' && /\s/.test(match[3]),
                            feedback: `${match[3]} is incorrect. Spaces are not allowed in the name of the @keyframes at-rule.`,
                        },
                        {
                            error: !match[2],
                            feedback: `There should be a space between @${match[1]} and ${String(match[3]).trim()}.`,
                        }];

                if (ob) {
                    if (checker.every(c => { return !(verdict = c.error ? c.feedback : ''); })) {
                        pushAtRule(nested, match);
                        inputClone = toSpace(inputClone, ob[0]);

                        // remove valid rules
                        while (pRule.test(inputClone)) {
                            const m = inputClone.match(pRule).map(_m => _m.trim());

                            pushNestedRule(match[1], m);
                            inputClone = toSpace(inputClone, m[0]);

                            if (verdict) return null;
                        }

                        const cb = inputClone.match(/^\s*\}/);      // closing brace

                        if (cb) {
                            inputClone = toSpace(inputClone, cb[0]);
                        }
                        else if (!inputClone.trim().length || pAtRule.test(inputClone)) {
                            verdict = `Make sure curly brackets are properly paired for the ${match[0].trim()} at-rule.`;
                        } else {
                            buildInvalidCode();
                        }
                    }
                } else {
                    verdict = `The ${match[0].trim()} at-rule should be followed by the "{" symbol.`;
                }
            }
            // @import, @charset or @namespace
            else {
                const checker = [
                    () => { return match[1] ? '' : 'Please write the type of at-rule after the @ symbol.'; },
                    () => {
                        const _match = match[1].match(/^(charset|import|namespace)([^\s\n]*)/i);

                        if (!_match) {
                            return `@${match[1]} is not a valid type of at-rule.`;
                        }
                        else if (_match[2]) {
                            return `There should be a space between @${_match[1]} and ${_match[2]}.`;
                        }
                    },
                    () => { return /[A-Z]/.test(match[1]) ? `@${match[1]} is incorrect. Make sure all letters are lowercase.` : ''; },
                    () => {
                        const word = match[1] == 'import' ? 'link' : match[1] == 'charset' ? 'character code' : 'name';
                        return match[3] ? '' : `The @${match[1]} at-rule needs a ${word}.`;
                    },
                    () => { return match[4] ? '' : `Don't forget the semi-colon(;) after ${match[3]}`; },
                ];

                if (checker.every(check => !(verdict = check()))) {
                    pushAtRule(nested, match);
                    // disguise as declaration
                    checkValue([{ property: '@import', value: match[3] }]);
                }
            }
            return !verdict;
        }

        function checkRule(match, nested) {
            const
                sel = flatten(match[1].split(/,|>|\+|~/).map(s => s.trim()).map(s => s.split(/\s+/))),
                pTags = tags.map(t => new RegExp(`^${t}(::?[a-z-()]+)?$`, 'i')),
                checker = [
                    () => {
                        let feedback = '';
                        // every selector must be a valid HTML tag or begin with . # or *
                        sel.every(s => {
                            s = s.replace(/(\[[^[\]]+\])$/, '');
                            if (pTags.some(t => t.test(s)) || /^[.#*]/.test(s)) {
                                return true;
                            } else {
                                // remove 2nd ${...} after in-line error message is implemented
                                feedback = `${s} ${sel.length > 1 ? `in ${match[1]} ` : ''}is not a valid tag name.`;
                                return;
                            }
                        });
                        return feedback;
                    },
                    () => {
                        let feedback = '';
                        // any selector begins with . or # followed by a non-alphabet character
                        sel.some(s => {
                            if (/^[.#]/.test(s) && !/[a-z]/i.test(s[1])) {
                                // remove 2nd ${...} after in-line error message is implemented
                                feedback = `${s} ${sel.length > 1 ? `in ${match[1]} ` : ''}is incorrect. Selector must begin with a letter.`;
                                return true;
                            }
                            return;
                        });
                        return feedback;
                    },
                ];

            if (checker.every(check => !(verdict = check())) && !nested) {
                tree.rules.push({ type: 'rule', selector: match[1], declarations: match[2], nth: ruleCount += 1 });
                inputClone = toSpace(inputClone, match[0]);

                if (match[2]) {
                    const d = checkDeclaration();

                    if (d) checkProperty(d) && checkValue(d);
                }
            }
            return !verdict;
        }

        function checkDeclaration(target = lastOf(tree.rules)) {
            const p = /[^:]+\s*:\s*[^;]+\s*;/i;     // fixed declaration pattern
            let da = [];        // declaration array

            target.declarations.trim().split(/\s*\r?\n\s*/).every(line => {
                let s;      // temporary string
                const
                    match = line.match(pDeclaration),
                    checker = [
                        {
                            error: function () {
                                s = line.match(/(?:[:;]\s*){2,}/);
                                return (s = s ? s[0].trim() : s);
                            }(),
                            feedback: `${s} in ${line} is incorrect.`,
                        },
                        {
                            error: !match[2],
                            feedback: `${line} is incorrect. Remove it or add a colon(:).`,
                        },
                        {
                            error: !match[1],
                            feedback: `${line} is incorrect. Property name is missing.`,
                        },
                        {
                            error: !match[3],
                            feedback: `${line} is incorrect. The ${match[1] ? match[1].trim() : ''} property needs a value.`,
                        },
                        {
                            error: !match[4],
                            feedback: `${line} is incorrect. There should be a semi-colon(;) at the end.`,
                        },
                        {
                            error: function () {
                                s = line;
                                while (p.test(s)) { s = s.replace(p, '').trim(); }
                                return s;
                            }(),
                            feedback: `${line} is incorrect. Please correct or remove ${s}.`,
                        },
                        {
                            // skip this test for teacher code (opts === null)
                            error: (p.test(line.replace(p, '')) && opts !== null),
                            feedback: `${line} contains multiple declarations. Please write one declaration per line.`,
                        },
                        {
                            // skip this test for teacher code (opts === null)
                            error: line.includes(';') && line.match(/[;]/g).length > 1 && opts !== null,
                            feedback: `${line.match(/;[^;]+;/)} in ${line} is incorrect. Only one semi-colon(;) is allowed per declaration.`,
                        }];

                checker.every(c => { return !(c.error ? verdict = c.feedback : false); });
                return !verdict ? da.push({ type: 'declaration', property: match[1].trim(), value: match[3].trim() }) : false;
            });

            return verdict ? false : target.declarations = da;
        }

        function checkProperty(target) {
            //each item, when found, should have a response message defined in the switch case below
            const pInvalid = [
                /*0*/ /[A-Z]/,
                /*1*/ /\s+/g,
                /*2*/ /[^a-z-]/,
            ];

            return target.every(d => {
                return pInvalid.every((err, i) => {
                    if (err.test(d.property)) {
                        switch (i) {
                            case 0: verdict = `${d.property} should be all lowercase.`; break;
                            case 1: verdict = `${d.property} is incorrect. Spaces are not allowed in CSS property names.`; break;
                            case 2: verdict = `${d.property.match(err)} in ${d.property} is incorrect. Please read the instructions again.`; break;
                            default:
                                verdict = `${d.property} is incorrect. Please read the instructions again.`;
                                console.log(`Error is found in ${d.property} but message is missing. Go to checkProperty() in CssAst.`);
                        }
                    }
                    return !verdict;
                });
            });
        }

        function checkValue(target) {
            const pInvalid = [
                /*0*/ /^url([^\S\n]+)?(\(\s*)?(['"])?([^'"()]+)?(['"])?(\s*\))?/i,
                /*1*/ /[^:]+:/,
            ];

            return target.every(d => {
                return pInvalid.every((err, i) => {
                    const match = d.value.match(err);

                    if (match) {
                        switch (i) {
                            case 0:
                                if (match[1]) verdict = 'No space is allowed after url.';
                                else if (!match[2]) verdict = 'url must be followed by a pair of brackets. e.g. url()';
                                else if (!match[4]) verdict = 'url() requires a link between the brackets. e.g. url("http://...")';
                                else if (!(match[3] && match[5])) verdict = `${match[3] || ''}${match[4]}${match[5] || ''} is incorrect. Make sure to write both quotation marks.`;
                                else if (match[3] != match[5]) verdict = `${match[3]}${match[4]}${match[5]} contains mismatching quotation marks.`;
                                else if (!match[6]) verdict = `Add closing bracket at the end of ${match[0]}.`;
                                break;
                            case 1:
                                if (/:/.test(d.value.replace(/https?:/, ''))) verdict = `${d.value} is incorrect. Please remove extra colons(:).`;
                                break;
                            default:
                                verdict = `${d.value} is incorrect. Please read the instructions again.`;
                                console.log(`Error is found in ${d.value} but message is missing. Go to checkValue() in CssAst.`);
                        }
                    }
                    return !verdict;
                });
            });
        }

        parse(); //console.log(pass, verdict);

        if (pass) {
            this._tree = tree;
        } else {
            this._messages.push({
                type: messageType.error,
                message: verdict.replace(/\s*\/\*[\s\S]*?\*\/\s*/, ''),
                position: 0,
            });
        }
        // console.log(pass ? `Passed syntax check on ${opts ? 'learner' : 'teacher'} code` : [`Failed syntax check on ${opts ? 'learner' : 'teacher'} code`, verdict]);
        return pass;
    }

    // It will parse CSS code to AST object
    _parseAst(source) {
        const ast = css.parse(source, { silent: 'source.css' });
        const rules = ast.stylesheet.rules;
        return { rules };
    }

    // It will wrap CSS code into {} in case of comparing only declarations
    _wrapWithSelector(v) {
        return `${AUTO_ADDED_SELECTOR} { ${v} }`;
    }

    get messages() {
        return this._messages;
    }

    get rules() {
        return this._ast.rules;
    }

    get atRules() {
        return this._tree.atRules;
    }

    get options() {
        return this._options;
    }
}

// ========== CssAstComparer.js ========== //

class CssAstComparer {
    constructor(opts) {
        // super();
        this._teacherSelectors = [];
        this._matchedSelectors = [];
        this._messages = [];

        this._defaultOpts = {
            allowExtraDeclarations: false,
            allowExtraSelectors: false,
            declarationsOnly: false,
        };

        this._defaultOpts = Object.assign({}, this._defaultOpts, opts);
    }

    compare(t, l, opts) {
        const options = Object.assign({}, this._defaultOpts, opts);

        if (t._ast === 'undefined') {
            throw 'First parameter is required.';
        }
        if (l._ast === 'undefined') {
            throw 'Second parameter is required.';
        }
        if (_.isEmpty(l.rules) && !_.isEmpty(t.rules)) {
            this._pushError('Make sure you haven\'t left the editor block empty.');
            return;
        }
        if (!_.isEmpty(l.rules) && _.isEmpty(t.rules)) {
            this._pushError('Your code is incorrect. Please read the instructions again.');
            return;
        }

        // split tree into two categories: rules and at-rules
        let teacherRules = t.rules.filter(tr => tr.type === 'rule');
        let teacherAtRules = t.atRules;
        let learnerRules = l.rules.filter(lr => lr.type === 'rule');
        let learnerAtRules = l.atRules;

        // syntax error found by CssAst.js
        if (this._messages.length) {
            return;
        }

        // teacher code contains at-rule but learner code does not
        if (!learnerAtRules.length && teacherAtRules.length) {
            this._pushError('Your code doesn\'t contain any at-rule.');
            return;
        }

        // loop to through each teacher at-rule
        teacherAtRules.every(tar => {
            let invalidCode = null;

            // loop to find a match in learner at-rules
            const match = learnerAtRules.some((lar, i) => {
                if (tar.type !== lar.type) {
                    if (i == learnerAtRules.length - 1) {
                        this._pushError(`We didn't find the @${tar.type} at-rule in your code.`);
                    }
                    return;
                }

                switch (tar.type) {
                    // add case for namespace and charset here
                    case 'import':
                        invalidCode = this._matchURL(tar.value, lar.value);
                        break;
                    case 'media':
                        invalidCode = tar.media === lar.media ? this._matchMediaRules(tar.rules, lar.rules, options) : lar.media;
                        break;
                    case 'keyframes':
                        invalidCode = tar.name === lar.name ? this._matchKeyframes(tar.keyframes, lar.keyframes) : lar.name;
                        break;
                    default:
                        if (!this._equalsIgnoreCase(tar.value, lar.value)) {
                            invalidCode = lar.value;
                        }
                }

                if (invalidCode) {
                    this._pushError(`${invalidCode} is incorrect. Please read the instructions again.`);
                    return;
                }

                learnerAtRules.splice(i, 1);
                return true;
            });

            return match;
        });

        if (!this._messages.length && learnerAtRules.length) {
            const extra = [];
            learnerAtRules.forEach(lar => extra.push(`@${lar.type} ${lar.media || lar.name || lar.value}`));
            this._pushError(`The ${grammafy(extra, 'and')} at-rule${extra.length > 1 ? 's are' : ' is'} not required. Please remove ${extra.length > 1 ? 'them' : 'it'}.`);
            return;
        }

        this._matchRules(teacherRules, learnerRules, options);
    }

    _pushError(m, t = messageType.fail) {
        this._messages.push({ type: t, message: m });
    }

    _matchMediaRules(teacherRules, learnerRules) {
        teacherRules.every(tr => {
            const match = learnerRules.some((lr, j) => {
                if (tr.declarations.length) {
                    this._matchingDeclarations(tr.selectors, tr.declarations, lr.declarations, this._messages, false);
                    if (this.messages.length) return;
                }

                learnerRules.splice(j, 1);
                return true;
            });
            return match;
        });

        if (!this._messages.length && learnerRules.length) {
            const extra = [];
            learnerRules.forEach(lr => extra.push(lr.selectors));
            this._pushError(`The ${grammafy(extra, 'and')} rules${extra.length > 1 ? 's are' : ' is'} not required. Please remove ${extra.length > 1 ? 'them' : 'it'}.`);
        }
        return null;
    }

    _matchKeyframes(teacherKeyframes, learnerKeyframes) {
        teacherKeyframes.every(tkf => {
            const match = learnerKeyframes.some((lkf, j) => {
                if (tkf.values !== lkf.values) {
                    if (j == learnerKeyframes.length - 1) {
                        this._pushError(`We didn't find the ${tkf.values} keyframe in your code.`);
                    }
                    return;
                }

                if (tkf.declarations.length) {
                    this._matchingDeclarations(tkf.values, tkf.declarations, lkf.declarations, this._messages, false);
                    if (this._messages.length) return;
                }

                learnerKeyframes.splice(j, 1);
                return true;
            });
            return match;
        });

        // learner code contains extra keyframes
        if (!this._messages.length && learnerKeyframes.length) {
            const extra = [];
            learnerKeyframes.forEach(lkf => extra.push(lkf.values));
            this._pushError(`The ${grammafy(extra, 'and')} keyframe${extra.length > 1 ? 's are' : ' is'} not required. Please remove ${extra.length > 1 ? 'them' : 'it'}.`);
        }
        return null;
    }

    _matchRules(teacherRules, learnerRules, options) {
        // loop to check each selector of teacher
        teacherRules.forEach((tr) => {
            const matchResult = this._matchingCSS(learnerRules, tr.selectors || [tr.values], tr.declarations, options);
            matchResult.teacherSels.forEach((ts) => this._teacherSelectors.push(ts));
            matchResult.matchedSelectors.forEach((ms) => this._matchedSelectors.push(ms));
            matchResult.messages.forEach((m) => this._messages.push(m));
        });

        const learnerDuplicatedSelectors = this._findDuplicatedSelectors(learnerRules);
        learnerDuplicatedSelectors.forEach((e) => this._messages.push(e));

        if (!options.allowExtraSelectors) {
            const unexpectedSelectors = this._findUnexpectedSelectors(this._matchedSelectors, learnerRules);
            if (unexpectedSelectors != null) {
                unexpectedSelectors.forEach((us) => {
                    this._pushError(`The ${collapseWhitespace(us)} selector is not required. Please remove or correct it.`);
                });
            }
        }

        const missingSelectors = this._findMissingSelectors(this._matchedSelectors, this._teacherSelectors);
        if (missingSelectors != null) {
            missingSelectors.forEach((ne) => {
                if (ne !== AUTO_ADDED_SELECTOR) this._pushError(`Don't forget to add the selector for ${collapseWhitespace(ne)}.`);
            });
        }

        return this._messages.length;
    }

    _matchURL(t, l) {
        const comparison = findRegularExpression(t);

        if (comparison.type === 'default') {
            if (!/^\s*url/i.test(t)) throw new Error(`Error in expectation: ${t}.`);

            const
                url = /url\(\s*['"]\s*([^'"]+)\s*['"]\s*\)/i,
                tURL = t.match(url)[1],
                lURL = l.match(url)[1];

            // pure string comparison for now
            if (tURL !== lURL) {
                let invalidCode;
                Array.from(tURL).every((char, i) => {
                    if (char == lURL[i]) return true;
                    invalidCode = lURL.slice(i);
                    return false;
                });
                return invalidCode;
            }
        }
        else {
            const equivalent = comparison.comparer(t, l, 'css');

            if (!equivalent) {
                const message = comparison.message(t, l, 'css');
                this._pushError(message);
            }
        }
    }

    // To find duplicated selectors and generate warning messages
    _findDuplicatedSelectors(rules) {
        const selectors = [];
        rules.forEach((r, i) => {
            if (rules.hasOwnProperty(i)) selectors.push(r.selectors);
        });
        const selectorsGroup = _.groupBy(selectors, (n) => n);
        const uniqSelectors = _.uniq(_.flattenDeep(_.filter(selectorsGroup, (n) => n.length > 1)));
        return uniqSelectors.map((e) => {
            return {
                type: messageType.warn,
                message: `There are more than one ${e} selector in your code. Please remove or correct it.`,
            };
        });
    }

    // To find matched selectors between teacher's selectors and learner's selectors
    // If found matched selector, it will compare declarations
    _matchingCSS(learnerRules, teacherSelectors, teacherDecls, opts) {
        const teacherSels = [];
        let messages = [];
        const matchedSelectors = [];

        // loop through learner AST
        // break this loop if found selector
        teacherSelectors.some(ts => {
            ts = ts.trim();
            teacherSels.push(ts);

            return learnerRules.some((lr, i) => {
                if (!learnerRules.hasOwnProperty(i)) return;
                if (lr.selectors == null) return;

                // loop through learner's selector
                // break this loop if found selector
                return lr.selectors.some((ls, j) => {
                    if (!lr.selectors.hasOwnProperty(j)) return;

                    // found matched selector
                    if (equalsIgnoreWhitespace(ts, ls)) {
                        matchedSelectors.push(ts);

                        const learnerDec = lr.declarations;
                        const tempTeacherDecl = this._matchingDeclarations(ts, teacherDecls, learnerDec, messages, opts.declarationsOnly);

                        // find unexpected declarations
                        if (!opts.allowExtraDeclarations) {
                            this._findUnexpectedDecl(ts, learnerDec, tempTeacherDecl, messages, opts.declarationsOnly);
                        }

                        // Matching selector was found. Exit now.
                        messages = messages.filter(Boolean);
                        return true;
                    }
                });
            });
        });

        messages = messages.filter(Boolean);
        return { teacherSels, messages, matchedSelectors };
    }

    // To find unexpected declarations in learner CSS code
    _findUnexpectedDecl(teacherSelector, learnerDec, tempTeacherDecl, messages, declarationsOnly) {
        const tempLearnerDecl = [];

        learnerDec.forEach((ld, i) => {
            if (learnerDec.hasOwnProperty(i)) tempLearnerDecl.push(ld.property);
        });

        const unexpectedDecl = tempLearnerDecl.filter(val => !tempTeacherDecl.includes(val));

        if (unexpectedDecl == null) return;

        unexpectedDecl.forEach(ud => {
            let msg;

            ud = collapseWhitespace(ud);

            if (ud !== undefined) {
                if (declarationsOnly) {
                    this._pushError(`The ${ud} property is not required. Please remove or correct it.`);
                } else {
                    this._pushError(`In the ${teacherSelector} {} rule, ${ud} property is not required. Please remove or correct it.`);
                }
            }
        });
    }

    _equalsIgnoreCase(str1, str2) {
        return convertToLowerCase(str1) === convertToLowerCase(str2);
    }

    // To find matched declarations then compare "property" and "value"
    _matchingDeclarations(teacherSelector, teacherDecls, learnerDec, messages, declarationsOnly) {
        const tempTeacherDecl = [];
        const duplicatedDeclList = this._findDuplicatedDeclarations(teacherSelector, learnerDec, declarationsOnly);

        duplicatedDeclList.forEach((dl) => messages.push(dl));

        teacherDecls.forEach((td, i) => {
            if (!teacherDecls.hasOwnProperty(i)) return;
            if (td.type !== 'declaration') return;

            const matchedLearnerDecl = _.find(
                learnerDec,
                (o) => this._equalsIgnoreCase(o.property, td.property)
            );

            if (matchedLearnerDecl != null) {
                tempTeacherDecl.push(convertToLowerCase(td.property));

                this._compareDeclarations(matchedLearnerDecl, td, messages, declarationsOnly, teacherSelector);
            } else {
                let errorMsg;
                if (declarationsOnly) {
                    this._pushError(`Don't forget to create the ${td.property.replace(/-/, ' ')} style.`);
                } else {
                    this._pushError(`Don't forget to create the ${td.property.replace(/-/, ' ')} style inside the ${teacherSelector} {} rule.`);
                }
            }
        });

        return tempTeacherDecl;
    }

    _compareDeclarations(learnerDecl, teacherDecl, messages, declarationsOnly, teacherSelector) {
        const comparison = findRegularExpression(teacherDecl.value);

        if (comparison == null) throw 'No comparer selected in compareDeclarations';

        const equivalent = comparison.comparer(teacherDecl.value, learnerDecl.value, 'css');

        if (!equivalent) {
            const teacherDeclValue = collapseWhitespace(teacherDecl.value);
            const learnerDeclValue = collapseWhitespace(learnerDecl.value);
            const message = comparison.message(teacherDeclValue, learnerDeclValue, 'css');

            if (declarationsOnly) {
                this._pushError(`${teacherDecl.property}: ${message}`);
            } else {
                this._pushError(`In the ${teacherSelector} {} rule, ${teacherDecl.property}: ${message}`);
            }
        }
    }

    // find duplicated declarations
    _findDuplicatedDeclarations(teacherSelector, declList, declarationsOnly) {
        const declarations = [];

        declList.forEach((dl, i) => {
            if (declList.hasOwnProperty(i)) declarations.push(dl.property);
        });

        const declarationsGroup = _.groupBy(declarations, (n) => n);
        const uniqDeclarations = _.uniq(_.flattenDeep(_.filter(declarationsGroup, (n) => n.length > 1)));

        return uniqDeclarations.map((d) => {
            let msg;
            d = collapseWhitespace(d);
            if (d !== undefined) {
                if (declarationsOnly) {
                    msg = {
                        type: messageType.warn,
                        message: `The ${d} property shouldn't appear more than once. Please correct it.`,
                    };
                } else {
                    msg = {
                        type: messageType.warn,
                        message: `The ${d} property shouldn't appear more than once in the ${teacherSelector} {} rule. Please correct it.`,
                    };
                }
            }
            return msg;
        });
    }

    // To find expected selectors that was not found in learner's selectors
    _findMissingSelectors(matchedSelectors, teacherSelectors) {
        return teacherSelectors.filter(val => !matchedSelectors.includes(val));
    }

    // To find unexpected selectors in learner CSS code
    _findUnexpectedSelectors(matchedSelectors, learnerRules) {
        let selectors = [];

        learnerRules.forEach((lr, i) => {
            if (!learnerRules.hasOwnProperty(i)) return;
            if (lr.type == 'rule') lr.selectors.forEach(e => selectors.push(e));
        });

        const nonWhiteSpace = matchedSelectors.map((e) => removeWhitespace(e));
        selectors = selectors.filter(val => !nonWhiteSpace.includes(removeWhitespace(val)));
        return selectors;
    }

    get messages() {
        return this._messages;
    }
}

// ========== css.js ========== //

// http://www.w3.org/TR/CSS21/grammar.html
// https://github.com/visionmedia/css-parse/pull/49#issuecomment-30088027

var commentre = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g;

/**
 * Trim `str`.
 */

function trim(str) {
    return str ? str.replace(/^\s+|\s+$/g, '') : '';
}

/**
 * Adds non-enumerable parent node reference to each node.
 */

function addParent(obj, parent) {
    var isNode = obj && typeof obj.type === 'string';
    var childParent = isNode ? obj : parent;

    for (var k in obj) {
        var value = obj[k];
        if (Array.isArray(value)) {
            value.forEach(function (v) { addParent(v, childParent); });
        } else if (value && typeof value === 'object') {
            addParent(value, childParent);
        }
    }

    if (isNode) {
        Object.defineProperty(obj, 'parent', {
            configurable: true,
            writable: true,
            enumerable: false,
            value: parent || null
        });
    }

    return obj;
}

const css = {
    parse: (css, options) => {
        options = options || {};

        /**
         * Positional.
         */

        var lineno = 1;
        var column = 1;

        /**
         * Update lineno and column based on `str`.
         */

        function updatePosition(str) {
            var lines = str.match(/\n/g);
            if (lines) lineno += lines.length;
            var i = str.lastIndexOf('\n');
            column = ~i ? str.length - i : column + str.length;
        }

        /**
         * Mark position and patch `node.position`.
         */

        function position() {
            var start = { line: lineno, column: column };
            return function (node) {
                node.position = new Position(start);
                whitespace();
                return node;
            };
        }

        /**
         * Store position information for a node
         */

        function Position(start) {
            this.start = start;
            this.end = { line: lineno, column: column };
            this.source = options.source;
        }

        /**
         * Non-enumerable source string
         */

        Position.prototype.content = css;

        /**
         * Error `msg`.
         */

        var errorsList = [];

        function error(msg) {
            var err = new Error(options.source + ':' + lineno + ':' + column + ': ' + msg);
            err.reason = msg;
            err.filename = options.source;
            err.line = lineno;
            err.column = column;
            err.source = css;

            if (options.silent) {
                errorsList.push(err);
            } else {
                throw err;
            }
        }

        /**
         * Parse stylesheet.
         */

        function stylesheet() {
            var rulesList = rules();

            return {
                type: 'stylesheet',
                stylesheet: {
                    rules: rulesList,
                    parsingErrors: errorsList
                }
            };
        }

        /**
         * Opening brace.
         */

        function open() {
            return match(/^{\s*/);
        }

        /**
         * Closing brace.
         */

        function close() {
            return match(/^}/);
        }

        /**
         * Parse ruleset.
         */

        function rules() {
            var node;
            var rules = [];
            whitespace();
            comments(rules);
            while (css.length && css.charAt(0) != '}' && (node = atrule() || rule())) {
                if (node !== false) {
                    rules.push(node);
                    comments(rules);
                }
            }
            return rules;
        }

        /**
         * Match `re` and return captures.
         */

        function match(re) {
            var m = re.exec(css);
            if (!m) return;
            var str = m[0];
            updatePosition(str);
            css = css.slice(str.length);
            return m;
        }

        /**
         * Parse whitespace.
         */

        function whitespace() {
            match(/^\s*/);
        }

        /**
         * Parse comments;
         */

        function comments(rules) {
            var c;
            rules = rules || [];
            while (c = comment()) {
                if (c !== false) {
                    rules.push(c);
                }
            }
            return rules;
        }

        /**
         * Parse comment.
         */

        function comment() {
            var pos = position();
            if ('/' != css.charAt(0) || '*' != css.charAt(1)) return;

            var i = 2;
            while ("" != css.charAt(i) && ('*' != css.charAt(i) || '/' != css.charAt(i + 1)))++i;
            i += 2;

            if ("" === css.charAt(i - 1)) {
                return error('End of comment missing');
            }

            var str = css.slice(2, i - 2);
            column += 2;
            updatePosition(str);
            css = css.slice(i);
            column += 2;

            return pos({
                type: 'comment',
                comment: str
            });
        }

        /**
         * Parse selector.
         */

        function selector() {
            var m = match(/^([^{]+)/);
            if (!m) return;
            /* @fix Remove all comments from selectors
             * http://ostermiller.org/findcomment.html */
            return trim(m[0])
                .replace(/\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*\/+/g, '')
                .replace(/"(?:\\"|[^"])*"|'(?:\\'|[^'])*'/g, function (m) {
                    return m.replace(/,/g, '\u200C');
                })
                .split(/\s*(?![^(]*\)),\s*/)
                .map(function (s) {
                    return s.replace(/\u200C/g, ',');
                });
        }

        /**
         * Parse declaration.
         */

        function declaration() {
            var pos = position();

            // prop
            var prop = match(/^(\*?[-#\/\*\\\w]+(\[[0-9a-z_-]+\])?)\s*/);
            if (!prop) return;
            prop = trim(prop[0]);

            // :
            if (!match(/^:\s*/)) return error("property missing ':'");

            // val
            var val = match(/^((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^\)]*?\)|[^};])+)/);

            var ret = pos({
                type: 'declaration',
                property: prop.replace(commentre, ''),
                value: val ? trim(val[0]).replace(commentre, '') : ''
            });

            // ;
            match(/^[;\s]*/);

            return ret;
        }

        /**
         * Parse declarations.
         */

        function declarations() {
            var decls = [];

            if (!open()) return error("missing '{'");
            comments(decls);

            // declarations
            var decl;
            while (decl = declaration()) {
                if (decl !== false) {
                    decls.push(decl);
                    comments(decls);
                }
            }

            if (!close()) return error("missing '}'");
            return decls;
        }

        /**
         * Parse keyframe.
         */

        function keyframe() {
            var m;
            var vals = [];
            var pos = position();

            while (m = match(/^((\d+\.\d+|\.\d+|\d+)%?|[a-z]+)\s*/)) {
                vals.push(m[1]);
                match(/^,\s*/);
            }

            if (!vals.length) return;

            return pos({
                type: 'keyframe',
                values: vals,
                declarations: declarations()
            });
        }

        /**
         * Parse keyframes.
         */

        function atkeyframes() {
            var pos = position();
            var m = match(/^@([-\w]+)?keyframes\s*/);

            if (!m) return;
            var vendor = m[1];

            // identifier
            var m = match(/^([-\w]+)\s*/);
            if (!m) return error("@keyframes missing name");
            var name = m[1];

            if (!open()) return error("@keyframes missing '{'");

            var frame;
            var frames = comments();
            while (frame = keyframe()) {
                frames.push(frame);
                frames = frames.concat(comments());
            }

            if (!close()) return error("@keyframes missing '}'");

            return pos({
                type: 'keyframes',
                name: name,
                vendor: vendor,
                keyframes: frames
            });
        }

        /**
         * Parse supports.
         */

        function atsupports() {
            var pos = position();
            var m = match(/^@supports *([^{]+)/);

            if (!m) return;
            var supports = trim(m[1]);

            if (!open()) return error("@supports missing '{'");

            var style = comments().concat(rules());

            if (!close()) return error("@supports missing '}'");

            return pos({
                type: 'supports',
                supports: supports,
                rules: style
            });
        }

        /**
         * Parse host.
         */

        function athost() {
            var pos = position();
            var m = match(/^@host\s*/);

            if (!m) return;

            if (!open()) return error("@host missing '{'");

            var style = comments().concat(rules());

            if (!close()) return error("@host missing '}'");

            return pos({
                type: 'host',
                rules: style
            });
        }

        /**
         * Parse media.
         */

        function atmedia() {
            var pos = position();
            var m = match(/^@media *([^{]+)/);

            if (!m) return;
            var media = trim(m[1]);

            if (!open()) return error("@media missing '{'");

            var style = comments().concat(rules());

            if (!close()) return error("@media missing '}'");

            return pos({
                type: 'media',
                media: media,
                rules: style
            });
        }


        /**
         * Parse custom-media.
         */

        function atcustommedia() {
            var pos = position();
            var m = match(/^@custom-media\s+(--[^\s]+)\s*([^{;]+);/);
            if (!m) return;

            return pos({
                type: 'custom-media',
                name: trim(m[1]),
                media: trim(m[2])
            });
        }

        /**
         * Parse paged media.
         */

        function atpage() {
            var pos = position();
            var m = match(/^@page */);
            if (!m) return;

            var sel = selector() || [];

            if (!open()) return error("@page missing '{'");
            var decls = comments();

            // declarations
            var decl;
            while (decl = declaration()) {
                decls.push(decl);
                decls = decls.concat(comments());
            }

            if (!close()) return error("@page missing '}'");

            return pos({
                type: 'page',
                selectors: sel,
                declarations: decls
            });
        }

        /**
         * Parse document.
         */

        function atdocument() {
            var pos = position();
            var m = match(/^@([-\w]+)?document *([^{]+)/);
            if (!m) return;

            var vendor = trim(m[1]);
            var doc = trim(m[2]);

            if (!open()) return error("@document missing '{'");

            var style = comments().concat(rules());

            if (!close()) return error("@document missing '}'");

            return pos({
                type: 'document',
                document: doc,
                vendor: vendor,
                rules: style
            });
        }

        /**
         * Parse font-face.
         */

        function atfontface() {
            var pos = position();
            var m = match(/^@font-face\s*/);
            if (!m) return;

            if (!open()) return error("@font-face missing '{'");
            var decls = comments();

            // declarations
            var decl;
            while (decl = declaration()) {
                decls.push(decl);
                decls = decls.concat(comments());
            }

            if (!close()) return error("@font-face missing '}'");

            return pos({
                type: 'font-face',
                declarations: decls
            });
        }

        /**
         * Parse import
         */

        var atimport = _compileAtrule('import');

        /**
         * Parse charset
         */

        var atcharset = _compileAtrule('charset');

        /**
         * Parse namespace
         */

        var atnamespace = _compileAtrule('namespace');

        /**
         * Parse non-block at-rules
         */


        function _compileAtrule(name) {
            var re = new RegExp('^@' + name + '\\s*([^;]+);');
            return function () {
                var pos = position();
                var m = match(re);
                if (!m) return;
                var ret = { type: name };
                ret[name] = m[1].trim();
                return pos(ret);
            }
        }

        /**
         * Parse at rule.
         */

        function atrule() {
            if (css[0] != '@') return;

            return atkeyframes()
                || atmedia()
                || atcustommedia()
                || atsupports()
                || atimport()
                || atcharset()
                || atnamespace()
                || atdocument()
                || atpage()
                || athost()
                || atfontface();
        }

        /**
         * Parse rule.
         */

        function rule() {
            var pos = position();
            var sel = selector();

            if (!sel) return error('selector missing');
            comments();

            return pos({
                type: 'rule',
                selectors: sel,
                declarations: declarations()
            });
        }

        return addParent(stylesheet());
    }
};
