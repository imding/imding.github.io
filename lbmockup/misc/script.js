ide.value =
`@import url();

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
    pNestedAtRule = /@(media|supports|document|page|font-face|keyframes|viewport|counter-style|font-feature-values)([^\S\n]+)?([^/;{}\n.#]+)?\s*/i,
    pAtRule = /@(charset|import|namespace)?([^\S\n]+)?([^\n;]+)?(;)?/i,
    // pRule = /\s*([^/;{}\s\n]+(?:\s*(?:,|>)\s*[^/;{}\s\n]+)*)\s*{([^{}]*)}/i,
    pRule = /\s*([^/;{}\s]+[^/;{}]*){\s*([^{}]*)}/i,
    pDeclaration = /([^:]+)?\s*(:)?\s*([^;]+)?\s*(;)?/i,
    tags = [
        'html', 'meta', 'head', 'link', 'body', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'b', 'u', 'i', 'a', 'div', 'img', 'ul', 'ol', 'li', 'span', 'strike',
        'sup', 'sub', 'small', 'tt', 'pre', 'blockquote', 'strong', 'em', 'hr', 'nobr',
        'dl', 'dt', 'dd', 'table', 'tr', 'th', 'td', 'frameset', 'frame', 'noframes',
        'form', 'input', 'select', 'option', 'textarea'
    ];

let verdict, pass = false, inputClone = input, tree = {atRules: [], rules: []}, allChecks = [
    function checkAtRule() {
        let n = 0;
        const nestedRule = /^(\s*([^/;{}\s]+[^/;{}]*){\s*([^{}]*)})*/i;
        // const nestedRule = /^(?:\s*[^/;{}\s\n]+(?:\s*(?:,|>)\s*[^/;{}\s\n]+)*[\s\n]*{[^{}]*})*/;

        // loop to find multi-line at-rules
        while (pNestedAtRule.test(inputClone) && !verdict) {
            let invalidCode = {index: -1, code: ''};
            const match = inputClone.match(pNestedAtRule);

            switch (match[1]) {
                case 'media':
                    // further analyze what comes after @media
                    if (match[3]) {
                        for (let i = 0; i < tags.length; i++) {
                            const p = new RegExp(`\\s*${tags[i]}(\\[[^\\[\\]]*\\])?\\s*$`, 'i');

                            // if match[3] ends with one of the tag names
                            if (p.test(match[3])) {
                                match[0] = match[0].replace(p, '');
                                match[3] = match[3].replace(p, '');
                                i = -1;
                            }
                        }
                    }
                    tree.atRules.push({type: 'media', media: match[3] ? match[3].trim() : '', rules: []});
                    break;
                case 'keyframes': tree.atRules.push({type: 'keyframes', name: match[3] ? match[3].trim() : '', vendor: '', keyframes: []}); break;
                default: throw new Error(`Expectation for the @${match[1]} at-rule is not yet implemented.`);
            }

            const afterMatch = inputClone.slice(match.index + match[0].length);   // all code after matched string

            // if at-rule type contains upper case letter(s)
            if (/[A-Z]/.test(match[1])) {
                verdict = `The @${match[1]} at-rule should contain only lower case letters.`;
            }
            // if there is no at-rule identifer
            else if (!match[3]) {
                verdict = `The @${match[1]} at-rule needs a${match[1] == 'media' ? 'n identifier' : ' name'}.`;
            }
            else if (match[1] == 'keyframes' && /\s/.test(match[3].trim())) {
                verdict = `${match[3].trim()} is incorrect. Spaces are not allowed in the name of the @keyframes at-rule.`;
            }
            // if there is no space between at-rule type & identifier
            else if (!match[2]) {
                verdict = `There should be a space between @${match[1]} and ${match[3].trim()}.`;
            }
            // if empty block is found
            else if (/^{[\s\n]*}/.test(afterMatch)) {
                const str = `${match[0]}${afterMatch.match(/^{[\s\n]*}/)[0]}`;
                inputClone = inputClone.replace(str, str.replace(/[^\s\n]/g, ' '));     // replace at-rule with white space
            // if block has content
            } else {
                for (let i = 0; i < afterMatch.length; i++) {
                    if (!i && afterMatch[i] != '{') {
                        verdict = `The ${match[0].trim()} at-rule should be followed by the "{" symbol.`;
                        break;
                    }
                    else if (i) {
                        match.nRules = afterMatch.slice(i).match(nestedRule)[0];    // store valid rule immediately following afterMatch[i], if any

                        if (match.nRules) {
                            if (invalidCode.code) break;

                            i += match.nRules.length;
                            const
                                endAtRule = afterMatch.slice(i).match(/^[\s\n]*}/),
                                s = `${match[0]}{${match.nRules}${endAtRule||''}`;

                            inputClone = inputClone.replace(s, s.replace(/[^\s\n]/g, ' '));

                            do {        // generate nested rule array
                                const m = match.nRules.match(pRule);

                                m[1] = !m[1] || m[1].trim();

                                switch (match[1]) {
                                    case 'media': tree.atRules[n].rules.push({type: 'rule', selectors: m[1], declarations: m[2]}); break;
                                    case 'keyframes':
                                        if (/\s/.test(m[1])) verdict = `${m[1]} is incorrect. No space is allowed.`;
                                        else if (!/^[\d]+(\.[\d]+)?%$/.test(m[1])) verdict = `${m[1]} is incorrect. Use an number(integer or decimal) followed by the "%" symbol.`;
                                        else tree.atRules[n].keyframes.push({type: 'keyframe', values: m[1], declarations: m[2]});
                                        break;
                                }
                                match.nRules = match.nRules.replace(pRule, '').trim();
                            } while (pRule.test(match.nRules));

                            const t = tree.atRules[n].rules || tree.atRules[n].keyframes;
                            
                            // check nested declarations, properties & values
                            allChecks[2](t) ? allChecks[3](t) ? allChecks[4](t) : null : null;

                            if (i == afterMatch.length) {
                                verdict = `Please close the ${match[0].trim()} at-rule using the "}" symbol.`;
                                break;
                            }
                            else if (endAtRule) {
                                break;
                            } else {
                                i--;        // for loop continues
                            }
                        } else {
                            // if current invalid letter is next to the previous one
                            if (i - invalidCode.index == 1 || invalidCode.index < 0) {
                                // append letter to invalidCode if no immediate valid rule is found
                                invalidCode = {index: i, code: invalidCode.code + afterMatch[i]};
                            } else {
                                break;
                            }
                        }
                    }
                }
                if (invalidCode.code) allChecks[1](invalidCode.code, `the @${match[1]} ${match[3].trim()} at-rule`);
            }
            n++;
        }

        // loop to find single-line at-rules
        while (pAtRule.test(inputClone) && !verdict) {
            const match = inputClone.match(pAtRule);

            if (!match[1]) {
                verdict = 'Please write the type of at-rule after the @ symbol.';
            }
            else if (/[A-Z]/.test(match[1])) {
                verdict = `The @${match[1]} at-rule should contain only lower case letters.`;
            }
            else if (!match[3]) {
                const word = match[1] == 'import' ? 'link' : match[1] == 'charset' ? 'character code' : 'name';
                verdict = `Please add a ${word} after @${match[1]}.`;
            }
            else if (!match[2]) {
                verdict = `There should be a space between @${match[1]} and ${match[3]}.`;
            }
            else if (!match[4]) {
                verdict = `Don't forget the semi-colon(;) after ${match[3]}`;
            }
            else {
                tree.atRules.push({type: match[1], value: match[3]});
            }

            inputClone = inputClone.replace(match[0], match[0].replace(/[^\s\n]/g, ' '));
        }
        return !verdict;
    },
    // allchecks[1]
    function checkRule(explicit, location = 'your CSS') {      // explicit = called by checkAtRule() function
        let target = explicit || inputClone, invalidCode = '';

        while (target.length) {
            const match = target.match(pRule);

            if (match && match[1]) {
                if (!explicit) tree.rules.push({type: 'rule', selector: match[1].trim(), declarations: match[2]});
                target = target.replace(pRule, '').trim();
            }
            else {
                invalidCode += target[0];
                target = target.slice(1);
            }
        }

        if (invalidCode) {
            if (/* closed block *//{[^{}]+}/.test(invalidCode)) {
                let n, ar = tree.atRules.reverse()[0];

                ar = ar.rules || ar.keyframes;
                n = (explicit ? ar.length + 1 : tree.rules.length);                
                n += String(n).endsWith('1') && n != 11 ? 'st' : String(n).endsWith('2') && n != 12 ? 'nd' : String(n).endsWith('3') && n != 13 ? 'rd' : 'th';
                verdict = `The ${n} rule in ${location} has no selector.`;
            }
            else if (/* open block *//[{}]/.test(invalidCode)) {
                verdict = `Make sure the braces (curly brackets) are properly paired in ${location}.`;
            } else {
                verdict = `${location[0].toUpperCase()}${location.slice(1)} contains invalid code: ${invalidCode.trim()}.`;
            }
        }
        return !verdict;
    },
    // allchecks[2]
    function checkDeclaration(explicit) {
        let target = explicit || tree.rules;

        return target.every((r, ri, ra) => {    // r = rule, ri = rule index, ra = rule array
            let da = [];        // declaration array

            if (r.declarations) {
                const p = /[^:]+\s*:\s*[^;]+\s*;/i;     // fixed declaration pattern

                r.declarations.trim().split(/\s*\r?\n\s*/).every(line => {
                    let s;      // temporary string
                    const
                        match = line.match(pDeclaration),
                        checker = [
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
                                    s = line.match(/(?:[:;]\s*){2,}/);
                                    return (s = s ? s[0].trim() : s);
                                }(),
                                feedback: `${s} in ${line} is incorrect.`,
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
            }
            return !verdict ? ra[ri].declarations = da : false;
        });
    },
    // allchecks[3]
    function checkProperty(target = tree.rules) {
        // each item, when found, should have a response message defined in the switch case below
        const pInvalid = [
            /*0*//[A-Z]/,
            /*1*//\s+/g,
            /*2*//[^a-z-]/,
        ];

        return target.every(r => {
            return r.declarations.every(d => {
                return pInvalid.every((err, i) => {
                    if (err.test(d.property)) {
                        switch (i) {
                            case 0: verdict = `${d.property} should be all lowercase.`; break;
                            case 1: verdict = `${d.property} is incorrect. Spaces are not allowed in CSS property names.`; break;
                            case 2: verdict = `${d.property.match(err)} from ${d.property} is incorrect. Please read the instructions again.`; break;
                            default:
                                verdict = `${d.property} is incorrect. Please read the instructions again.`;
                                console.log(`${d.property} is found in ${d.property} but message is missing. Go to checkProperty() in CssAst.`);
                        }
                    }
                    return !verdict;
                });
            });
        });
    },
    // allchecks[4]
    function checkValue(target = tree.rules) {
        const pInvalid = [
            /*0*//^url([^\S\n]+)?(\(\s*)?(['"])?([^'"()]+)?(['"])?(\s*\))?/i,
            /*1*//[^:]+:/,
        ];
        return target.every(r => {
            return r.declarations.every(d => {
                return pInvalid.every((err, i) => {
                    const match = d.value.match(err);

                    if (match) {
                        switch (i) {
                            case 0:
                                if (match[1]) verdict = 'No space is allowed after url.';
                                else if (!match[2]) verdict = 'url must be followed by an opening bracket. e.g. url()';
                                else if (!match[4]) verdict = 'url() requires a link between the brackets. e.g. url("http://image.png")';
                                else if (!(match[3] && match[5])) verdict = `Add a pair of quotation marks around ${match[4]}.`;
                                else if (match[3] != match[5]) verdict = `${match[3]}${match[4]}${match[5]} contains mismatching quotation marks.`;
                                else if (!match[6]) verdict = `Add closing bracket at the end of ${match[0]}.`;
                                break;
                            case 1:
                                if (!/background(-image)?|content/.test(d.property)) verdict = `${d.value} is incorrect. Please remove the colon(:).`;
                                break;
                        }
                    }
                    return !verdict;
                });
            });
        });
    },
];

parse.onclick = function() {
    tree = {atRules: [], rules: []};
    verdict = '';
    pass = false;
    info.innerHTML = '';
    input = ide.value;
    inputClone = input;

    console.clear();

    allChecks.every(check => {return pass = check();});

    console.log(JSON.stringify(tree).replace(/\]}/g, ']}\n').replace(/\[/g, '\n[').replace(/},{/g, '\n').replace(/}\],/, '}]\n\n'));
    // console.log(tree);
    log(verdict || 'All good.');
};