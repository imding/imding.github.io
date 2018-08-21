ide.value =
`@import url('http://google.com');

p{}

body {
    width: 100%;
    animation: anim 10s infinite;
    background: url('http://image.png');
}

@keyframes cool-anim {



0%
     { width  : 99% ;
        background-color : green;
     }
    100% {
        border: 90%;
        height: 100%;
    }
}

img {
    border: none;
}

@media (max-width: 12450px) {
    body > img, body > h1, h3 {
        height: 99%;
    }

    h1 {}
}

`;

let input;

function replaceStrings(str, replacement = '.') {
    let arr = str.match(/((`)[^`]*\2)|((')[^']*\4)|((")[^"]*\6)/g);
    arr ? arr.forEach((s) => {
        str = str.replace(s, Array(s.length + 1).join(replacement));
    }) : null;
    return str;
}

function log(s) {
    if (info.innerHTML) {
        info.innerHTML += (`\n==========\n${s}`);
    } else {
        info.innerHTML = s;
    }
}

//================================

const
    pNestedAtRule = /^\s*@(media|supports|document|page|font-face|keyframes|viewport|counter-style|font-feature-values)([^\S\n]+)?([^/;{}\n.#]+)?\s*/i,
    pAtRule = /^\s*@([^\s]+)?([^\S\n]+)?([^\n;]+)?(;)?/i,
    pRule = /^\s*([^@/;{}\s]+[^/;{}]*){\s*([^{}]*)}/i,
    pDeclaration = /([^:]+)?\s*(:)?\s*([^;]+)?\s*(;)?/i,
    tags = [
        'html', 'meta', 'head', 'link', 'body', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'b', 'u', 'i', 'a', 'div', 'img', 'ul', 'ol', 'li', 'span', 'strike',
        'sup', 'sub', 'small', 'tt', 'pre', 'blockquote', 'strong', 'em', 'hr', 'nobr',
        'dl', 'dt', 'dd', 'table', 'tr', 'th', 'td', 'frameset', 'frame', 'noframes',
        'form', 'input', 'select', 'option', 'textarea',
    ];

let verdict = '', pass = true, inputClone = input, ruleCount = 0, tree = {atRules: [], rules: []};

Number.prototype.rank = function() {
    return this + (/1$/.test(this) && this != 11 ? 'st' : /2$/.test(this) && this != 12 ? 'nd' : /3$/.test(this) && this != 13 ? 'rd' : 'th');
}

String.prototype.toSpace = function(target) {
    return target ?
        this.replace(target, target.replace(/[^\s]/g, ' ')) :
        this.replace(/[^\s]/g, ' ');
};

Array.prototype.last = function() {
    return this[this.length - 1];
};

Array.prototype.flatten = function(n = 0) {
    while (n < this.length) {
        if (Array.isArray(this[n])) {
            const arr = this[n];
            this.splice(n, 1);
            arr.forEach((e, i) => this.splice(n + i, 0, e));            
        }
        n++;
    }
    return this;
};

function latestNode() {
    return [tree.rules, tree.atRules].filter(arr => arr.some(r => r.nth == ruleCount))[0].last();
}

function buildInvalidCode(nextValid = [pRule, pNestedAtRule, pAtRule], invalidCode = '') {
    let ob, cb, ln, isNestedAtRule;

    // position of error can be retrieved before trim
    inputClone = inputClone.trim();

    while (inputClone.length && nextValid.every(p => !p.test(inputClone))) {
        invalidCode += inputClone[0];
        
        if (inputClone[0] == '}') break;

        inputClone = inputClone.slice(1);        
    }

    if (tree.rules.length + tree.atRules.length) {
        ln = latestNode();
        isNestedAtRule = ln.hasOwnProperty('rules') || ln.hasOwnProperty('keyframes');
    }

    const braces = invalidCode.match(/[{}]/g) || [];
        

    if (braces.length % 2) {
        verdict = `Make sure the curly brackets are properly paired in ${invalidCode}.`;
    }
    else if (/^{[^{}]+}/.test(invalidCode)) {
        verdict = isNestedAtRule ?
            `There is a missing selector in the @${ln.type} at-rule.` :
            `The ${(ln.nth + 1).rank()} rule in your CSS has no selector.`;
    }
    else {
        verdict = isNestedAtRule ?
            `The @${ln.type} at-rule contains invalid code. Please read the instructions again.` :
            `Your CSS is incorrect after the ${ln.nth.rank()} rule. Please read the instructions again.`;
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
                tree.atRules.push({type: 'media', media: data[3] ? data[3].trim() : '', rules: [], nth: ruleCount += 1});
                break;

            case 'keyframes':
                tree.atRules.push({type: 'keyframes', name: data[3] ? data[3].trim() : '', vendor: '', keyframes: [], nth: ruleCount += 1});
                break;
            
            default: throw new Error(`Expectation for the @${data[1]} at-rule is not yet implemented.`);
        }
    } else {
        tree.atRules.push({type: data[1], value: data[3], nth: ruleCount += 1});
    }
}

function pushNestedRule(type, data) {
    switch (type) {
        case 'media':
            if (checkRule(data, true)) {
                tree.atRules.last().rules.push({type: 'rule', selectors: data[1], declarations: data[2]});
            }
            break;

        case 'keyframes':
            if (/\s/.test(data[1])) {
                verdict = `${data[1]} is incorrect. No space is allowed.`;
            }
            else if (!/^[\d]+(\.[\d]+)?%$/.test(data[1])) {
                verdict = `${data[1]} is not a valid selector for the @keyframes at-rule. Use a number followed by the % symbol.`;
            } else {
                tree.atRules.last().keyframes.push({type: 'keyframe', values: data[1], declarations: data[2]});
            }
            break;
    }

    if (data[2] && !verdict) {
        const 
            r = tree.atRules.last().rules || tree.atRules.last().keyframes,
            d = checkDeclaration(r.last());

        if (d) checkProperty(d) && checkValue(d);
    }
    return !verdict;
}

function parse() {
    while (inputClone.trim().length && !verdict) {
        pass = [pRule, pNestedAtRule, pAtRule].some((p, i) => {
            let match = inputClone.match(p);

            if (match && pass) {
                match = match.map(m => m ? m.trim() || m : m);
                pass = i ? checkAtRule(match, !(i - 1)) : checkRule(match);
            }
            return match && pass;
        });

        if (verdict) break;

        if (!pass) buildInvalidCode();
        // console.log(braces);
        // if (tree.rules.length + tree.atRules.length) {
        //     if (!pass) buildInvalidCode();
        // }
        // else if (braces.length % 2) {
        //     buildInvalidCode();
        // }
        // else {
        //     const d = checkDeclaration({declarations: inputClone});
            
        //     if (pass) pass = checkProperty(d) && checkValue(d);
        //     break;
        // }
    }
}

function checkAtRule(match, nested) {
    // remove "@[type] [identifier]" from input string
    inputClone = inputClone.toSpace(match[0]);

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
            if (checker.every(c => {return !(verdict = c.error ? c.feedback : '')})) {
                pushAtRule(nested, match);
                inputClone = inputClone.toSpace(ob[0]);            

                // remove valid rules
                while (pRule.test(inputClone)) {
                    const m = inputClone.match(pRule).map(_m => _m.trim());

                    pushNestedRule(match[1], m);
                    inputClone = inputClone.toSpace(m[0]);

                    if (verdict) return null;
                }

                const cb = inputClone.match(/^\s*\}/);      // closing brace

                if (cb) {
                    inputClone = inputClone.toSpace(cb[0]);
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
            () => { return match[1] ? '' : 'Please write the type of at-rule after the @ symbol.' },
            () => {
                const _match = match[1].match(/^(charset|import|namespace)([^\s\n]*)/i);

                if (!_match) {
                    return `@${match[1]} is not a valid type of at-rule.`;
                }
                else if (_match[2]) {
                    return `There should be a space between @${_match[1]} and ${_match[2]}.`;
                }
            },
            () => { return /[A-Z]/.test(match[1]) ? `@${match[1]} is incorrect. Make sure all letters are lowercase.` : '' },
            () => {
                const word = match[1] == 'import' ? 'link' : match[1] == 'charset' ? 'character code' : 'name';
                return match[3] ? '' : `The @${match[1]} at-rule needs a ${word}.`;
            },            
            () => { return match[4] ? '' : `Don't forget the semi-colon(;) after ${match[3]}` },
        ];
        
        if (checker.every(check => { return !(verdict = check()) })) {
            pushAtRule(nested, match);
            // disguise as declaration
            checkValue([{property: '@import', value: match[3]}]);
        }
    }
    return !verdict;
}

function checkRule(match, nested) {
    const
        sel = match[1].split(/,|>|\+|~/).map(s => s.trim()).map(s => s.split(/\s+/)).flatten(),
        pTags = tags.map(t => new RegExp(`^${t}(::?[a-z-()]+)?$`, 'i')),
        checker = [
        {
            error: !sel.every(s => pTags.some(t => t.test(s)) || /^[.#*]/.test(s)),
            feedback: `${match[1]} is not a valid tag name.`,
        },
        {
            error: sel.some(s => /^[.#]/.test(s) && !/[a-z]/i.test(s[1])),
            feedback: `${match[1]} is incorrect. Selector must begin with a letter.`,
        }];

    if (checker.every(c => !(verdict = c.error ? c.feedback : '')) && !nested) {
        tree.rules.push({type: 'rule', selector: match[1], declarations: match[2], nth: ruleCount += 1});
        inputClone = inputClone.toSpace(match[0]);
        
        if (match[2]) {
            const d = checkDeclaration();
            
            if (d) checkProperty(d) && checkValue(d);
        }
    }
    return !verdict;
}

function checkDeclaration(target = tree.rules.last()) {
    const p = /[^:]+\s*:\s*[^;]+\s*;/i;     // fixed declaration pattern
    let da = [];        // declaration array    

    target.declarations.trim().split(/\s*\r?\n\s*/).every(line => {
        let s;      // temporary string
        const
            match = line.match(pDeclaration),
            checker = [
            {
                error: function(){
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
                error: function(){
                    s = line;
                    while (p.test(s)) {s = s.replace(p, '').trim()}
                    return s;
                }(),
                feedback: `${line} is incorrect. Please correct or remove ${s}.`,
            },
            {
                error: p.test(line.replace(p, '')),
                feedback: `${line} contains multiple declarations. Please write one declaration per line.`,
            },
            {
                error: line.includes(';') && line.match(/[;]/g).length > 1,
                feedback: `${line.match(/;[^;]+;/)} in ${line} is incorrect. Only one semi-colon(;) is allowed per declaration.`,
            }];

        checker.every(c => {return !(c.error ? verdict = c.feedback : false)});
        return !verdict ? da.push({type: 'declaration', property: match[1].trim(), value: match[3].trim()}) : false;
    });

    return !verdict ? target.declarations = da : false;    
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
                        console.log(`${d.property} is found in ${d.property} but message is missing. Go to checkProperty() in CssAst.`);
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
                        if (!/background(-image)?|content|@import/.test(d.property)) verdict = `${d.value} is incorrect. Please remove the colon(:).`;
                        break;
                }
            }
            return !verdict;
        });
    });
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

btnParse.onclick = function() {
    console.clear();

    ruleCount = 0;
    tree = {atRules: [], rules: []};
    verdict = '';
    pass = true;
    info.innerHTML = '';
    input = ide.value;
    inputClone = input;

    parse();    console.log(tree);

    if (pass) {        
        console.log(getTree());
        log('All good.');
    } else {
        log(verdict.replace(/\n/g, '&crarr;'));
    }
};