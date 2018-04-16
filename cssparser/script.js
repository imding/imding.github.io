ide.value = 'color: red;';

let input, AUTO_ADDED_SELECTOR = 'LAUNCHBOX_auto_added_selector';

//================================

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

// ===========================================

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

// =======================================

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

        if (!i && !match /* && opts.declarationOnly */) {
            // simulate matched behaviour for learner code under the condition that declarationOnly is true
            match = [`${AUTO_ADDED_SELECTOR} {\n\t${inputClone}\n}`, AUTO_ADDED_SELECTOR, inputClone];
        }

        if (match && pass) {
            // invalidate matched string containing white spaces only
            match = match.map(m => m ? m.trim() || m : m);
            pass = i ? checkAtRule(match, i == 1) : checkRule(match);
        }

        return match && pass;
    };

    let ccc = 0;

    while (inputClone.trim().length && !verdict) {
        pass = [pRule, pNestedAtRule, pAtRule].some(foundAndMatched);

        if (verdict) break;

        if (!pass) buildInvalidCode();
        
        ccc++;
        if (ccc > 100) break;
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
                    s = s.replace(/(\[[^\[\]]+\])$/, '');
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
        inputClone = toSpace(inputClone, match[1] === AUTO_ADDED_SELECTOR ? match[2] : match[0]);

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
      /*0*//[A-Z]/,
      /*1*//\s+/g,
      /*2*//[^a-z-]/,
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
      /*0*//^url([^\S\n]+)?(\(\s*)?(['"])?([^'"()]+)?(['"])?(\s*\))?/i,
      /*1*//[^:]+:/,
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

// ===== IRRELEVANT FOR LB =====

function log(s) {
    if (info.innerHTML) {
        info.innerHTML += (`\n==========\n${s}`);
    } else {
        info.innerHTML = s;
    }
}

function getTree() {
    let t = 'at-rules:';

    tree.atRules.forEach(r => {
        t += `\n\t[${r.nth}]${r.type}`;
        if (r.value) t += `, ${r.value}`;
        else if (r.media) {
            t += `, ${r.media}, rules: `;

            r.rules ? r.rules.forEach(ns => {
                t += `\n\t\t${ns.selectors}, declarations: `;
                Array.isArray(ns.declarations) ? ns.declarations.forEach(nd => {
                    t += `\n\t\t\t${nd.property}, ${nd.value}`;
                }) : t += `"${ns.declarations.replace(/\n/g, '')}"`;
            }) : t += ']';
        }
        else if (r.keyframes) {
            t += `, ${r.name}, "", keyframes: `;

            r.keyframes ? r.keyframes.forEach(kf => {
                t += `\n\t\t${kf.values}, declarations: `;
                Array.isArray(kf.declarations) ? kf.declarations.forEach(nd => {
                    t += `\n\t\t\t${nd.property}, ${nd.value}`;
                }) : t += `"${kf.declarations.replace(/\n/g, '')}"`;
            }) : t += ']';
        }
        t += '\n';
    });

    t += `\nrules:`;
    tree.rules.forEach(r => {
        t += `\n\t[${r.nth}]${r.selector}, declarations: `;
        Array.isArray(r.declarations) ? r.declarations.forEach(d => {
            t += `\n\t\t${d.property}, ${d.value}`;
        }) : t += `"${r.declarations.replace(/\n/g, '')}"`;
        t += '\n';
    });

    return t;
}

btnParse.onclick = function () {
    console.clear();

    ruleCount = 0;
    tree = { atRules: [], rules: [] };
    verdict = '';
    pass = true;
    info.innerHTML = '';
    input = ide.value;
    inputClone = input;

    parse(); console.log(tree);

    if (pass) {
        console.log(getTree());
        log('All good.');
    } else {
        log(verdict.replace(/\n/g, '&crarr;'));
    }
};

let ctrl;

window.onkeydown = function (evt) {
    if (!ctrl) ctrl = evt.keyCode == 17;
};

window.onkeyup = function (evt) {
    if (ctrl && evt.keyCode == 17) ctrl = false;
    if (evt.keyCode == 13 && ctrl) btnParse.click();
};