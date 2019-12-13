/* eslint-disable quotes */
class Utility {
    constructor() {
        this.config = {
            showDebug: true,
        };

        //  generate uuidv4
        this.uuidv4 = () => {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
                let
                    r = Math.random() * 16 | 0,
                    v = c == 'x' ? r : (r & 0x3 | 0x8);

                return v.toString(16);
            });
        };

        //  unique id with or without a prefix
        this.uid = (prefix, connector = '-') => {
            // non-zero random scalar
            const nzrs = () => Math.random() || this.nzrs();

            // random string
            const rs = `${prefix ? `${prefix}${connector}` : ''}${nzrs().toString(36).slice(-3)}`;

            if (Array.from(document.documentElement.getElementsByTagName('*')).some(el => prefix ? el.id == rs : el.id.endsWith(`${connector}${rs}`))) return this.uid(prefix);
            return rs;
        };

        //  clamp number within range
        this.clamp = (val, min, max) => {
            return Math.min(Math.max(val, min), max);
        };

        //  element array queries
        this.elarr = arr => {
            arr = Array.from(arr);
            if (!Array.isArray(arr)) throw new Error('the elarr method expects and array like object');

            return {
                get maxWidth() {
                    return Math.max(...arr.map(el => gCss(el).width));
                },
            };
        };

        //  flatten array
        this.flarr = arr => {
            return {
                get shallow() { return arr.reduce((acc, val) => acc.concat(val), []); },
                get deep() { return arr.reduce((acc, val) => Array.isArray(val) ? acc.concat(this.flarr(val)) : acc.concat(val), []); },
            };
        };

        //  get item from array
        this.gifa = (arr, i) => i < 0 ? arr[arr.length + i] : arr[i];

        //  remove item from array
        this.rifa = (item, arr) => arr.splice(arr.indexOf(item), 1);

        //  turn array into object
        this.ato = (array, dimension = 2) => {
            const obj = {};

            if (dimension == 2) {
                array.forEach((n, i) => {
                    if (Array.isArray(n)) {
                        obj[i] = { 0: n[0], 1: [] };
                        n[1].forEach(_n => obj[i][1].push(_n));
                    }
                    else obj[i] = n;
                });
            }
            else return alert('only 2D arrays are supported');

            return obj;
        };

        //  deep clone an object
        this.cloneObject = obj => JSON.parse(JSON.stringify(obj));

        //  set & get attribute
        this.sAttr = (el, details) => Object.entries(details).forEach(entry => el.setAttribute(entry[0].replace(/([A-Z])/g, '-$1').toLowerCase(), entry[1].toString()));
        this.gAttr = el => {
            return new Proxy(
                {
                    get x() { return parseFloat(el.getAttribute('x')); },
                    get y() { return parseFloat(el.getAttribute('y')); },
                    get width() { return parseFloat(el.getAttribute('width')) || el.getBBox().width; },
                    get height() { return parseFloat(el.getAttribute('height')) || el.getBBox().height; },
                }, {
                    get: (o, attr) => attr in o ? o[attr] : el.getAttribute(attr),
                }
            );
        };

        //  set & get css style
        this.sCss = (el, details) => Object.entries(details).forEach(entry => el.style[entry[0]] = entry[1]);
        this.gCss = el => {
            if (!el) throw new Error('the gCss method expects a valid HTML element');

            const
                cs = window.getComputedStyle(el),
                val = p => cs.getPropertyValue(p),
                box = el => el.getBoundingClientRect();

            return new Proxy(
                {
                    get width() { return (parseFloat(val('width')) || box(el).width); },
                    get height() { return (parseFloat(val('height')) || box(el).height); },
                    get left() { return (parseFloat(val('left')) || box(el).left); },
                    get top() { return (parseFloat(val('top')) || box(el).top); },
                }, {
                    get: (o, p) => {
                        if (p in o) {
                            return o[p];
                        }
                        else {
                            const v = val(p.replace(/([A-Z])/g, '-$1'.toLowerCase()));
                            return parseFloat(v) || v;
                        }
                    },
                }
            );
        };

        //  relative cursor position
        this.relCursor = (ref, cf) => {
            if (ref && ref.nodeType != 1) throw new Error('the relCursor method expects an HTML element as argument');

            const refBox = (ref || document.body).getBoundingClientRect();

            let pos = {
                x: event.clientX - refBox.left + window.scrollX,
                y: event.clientY - refBox.top + window.scrollY,
            };

            return this.applyConfig(pos, cf, refBox);
        };

        //  relative element position
        this.relPos = (el, ref, cf) => {
            const
                elBox = el.getBoundingClientRect(),
                refBox = ref.getBoundingClientRect();

            let pos = {
                x: elBox.left - refBox.left + window.scrollX,
                y: elBox.top - refBox.top + window.scrollY,
            };

            return this.applyConfig(pos, cf, elBox);
        };

        //  apply general configurations for 2D vector
        this.applyConfig = (v2, cf, ref) => {
            if (/cog/.test(cf)) {
                if (!ref) throw new Error('a reference bounding box is required to calculate centre of gravity.');
                v2.x += ref.width / 2;
                v2.y += ref.height / 2;
            }

            if (/round/.test(cf)) {
                v2.x = Math.round(v2.x);
                v2.y = Math.round(v2.y);
            }

            if (/abs/.test(cf)) {
                v2.x = Math.abs(v2.x);
                v2.y = Math.abs(v2.y);
            }

            return v2;
        };

        //  new svg element
        this.newSVG = type => document.createElementNS('http://www.w3.org/2000/svg', type);

        //  new element
        this.newElement = (type, attr) => {
            const el = document.createElement(type);
            Object.assign(el, attr);
            return el;
        };

        //  convert string to camel case
        this.camelise = str => {
            str = str.replace(/^[^\w]+|[^\w]+$/, '').replace(/[^\w\s]/g, '').toLowerCase();
            if (!/\s/.test(str)) return str;
            return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (letter, index) {
                return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
            }).replace(/\s+/g, '');
        };

        this.kababCase = str => {
            return str.trim().replace(/\s+/g, '-').toLowerCase();
        };

        this.decamelise = str => str.replace(/^[a-z]|([A-Z]|\d+)/g, (v, i) => i ? ' ' + v.toUpperCase() : v.toUpperCase());

        //  make width & height integer
        this.trimScale = (...o) => {
            if (o.length === 1) o = o[0];
            Object.values(o).forEach(el => {
                if (el.nodeType === 1) this.sCss(el, {
                    width: `${Math.ceil(this.gCss(el).width)}px`,
                    height: `${Math.ceil(this.gCss(el).height)}px`,
                });
            });
        };

        //  convert string to be HTML safe
        this.htmlEscape = unsafe => {
            return unsafe
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        };

        this.htmlDecode = input => {
            var e = document.createElement('div');
            e.innerHTML = input;
            return e.childNodes.length === 0 ? '' : e.childNodes[0].nodeValue;
        };

        this.print = (msg, opt) => {
            if (!this.config.showDebug) return;
            if (!opt) { opt = 'log'; }

            const
                time = new Date(),
                tStamp = `[${this.pad(time.getHours())}:${this.pad(time.getMinutes())}:${this.pad(time.getSeconds())}]`;

            if (Array.isArray(msg)) console[opt](tStamp, ...msg);
            else console[opt](tStamp, msg);
        };

        this.halt = (message, cb = () => {}) => {
            if (typeof(cb) == 'function') {
                cb.call();
            }
            else {
                alert('Type mismatch: 2nd argument of halt() must be a function.');
            }
        
            if (confirm(`${message} Ignore?`)) {
                return;
            }

            throw new Error(message);
        };

        this.pad = n => {
            return n.toString().length == 2 ? n : '0' + n.toString();
        };

        this.jsWithoutComments = input => {
            //LEXER
            function Lexer() {
                this.setIndex = false;
                this.useNew = false;
                Array.from(arguments).forEach((arg) => {
                    if (arg === Lexer.USE_NEW) {
                        this.useNew = true;
                    }
                    else if (arg === Lexer.SET_INDEX) {
                        this.setIndex = Lexer.DEFAULT_INDEX;
                    }
                    else if (arg instanceof Lexer.SET_INDEX) {
                        this.setIndex = arg.indexProp;
                    }
                });
                this.rules = [];
                this.errorLexeme = null;
            }

            Lexer.USE_NEW = {};
            Lexer.NULL_LEXEME = {};
            Lexer.DEFAULT_INDEX = "index";
            Lexer.ERROR_LEXEME = {
                toString: function () {
                    return "[object Lexer.ERROR_LEXEME]";
                }
            };
            Lexer.SET_INDEX = function (indexProp) {
                if (!(this instanceof arguments.callee)) {
                    return new arguments.callee.apply(this, arguments);
                }
                if (indexProp === undefined) {
                    indexProp = Lexer.DEFAULT_INDEX;
                }
                this.indexProp = indexProp;
            };

            (function () {
                var New = (function () {
                    var fs = [];

                    return function () {
                        var f = fs[arguments.length];

                        if (f) {
                            return f.apply(this, arguments);
                        }

                        var argStrs = [];
                        for (var i = 0; i < arguments.length; ++i) {
                            argStrs.push("a[" + i + "]");
                        }

                        f = new Function("var a=arguments;return new this(" + argStrs.join() + ");");

                        if (arguments.length < 100) {
                            fs[arguments.length] = f;
                        }

                        return f.apply(this, arguments);
                    };
                })();

                const flagMap = [
                    ["global", "g"],
                    ["ignoreCase", "i"],
                    ["multiline", "m"],
                    ["sticky", "y"]
                ];

                function getFlags(regex) {
                    let flags = "";
                    flagMap.forEach(flag => {
                        if (regex[flag[0]]) {
                            flags += flag[1];
                        }
                    });
                    return flags;
                }

                function not(x) {
                    return function (y) {
                        return x !== y;
                    };
                }

                class Rule {
                    constructor(regex, lexeme) {
                        if (!regex.global) {
                            var flags = "g" + getFlags(regex);
                            regex = new RegExp(regex.source, flags);
                        }
                        this.regex = regex;
                        this.lexeme = lexeme;
                    }
                }

                Lexer.prototype = {
                    constructor: Lexer,
                    addRule: function (regex, lexeme) {
                        var rule = new Rule(regex, lexeme);
                        this.rules.push(rule);
                    },
                    setErrorLexeme: function (lexeme) {
                        this.errorLexeme = lexeme;
                    },
                    runLexeme: function (lexeme, exec) {
                        if (typeof lexeme !== "function") {
                            return lexeme;
                        }
                        var args = exec.concat(exec.index, exec.input);
                        if (this.useNew) {
                            return New.apply(lexeme, args);
                        }
                        return lexeme.apply(null, args);
                    },
                    lex: function (str) {
                        var index = 0;
                        var lexemes = [];
                        if (this.setIndex) {
                            lexemes.push = function () {
                                for (var i = 0; i < arguments.length; ++i) {
                                    if (arguments[i]) {
                                        arguments[i][this.setIndex] = index;
                                    }
                                }
                                return Array.prototype.push.apply(this, arguments);
                            };
                        }
                        while (index < str.length) {
                            var bestExec = null;
                            var bestRule = null;
                            for (var i = 0; i < this.rules.length; ++i) {
                                var rule = this.rules[i];
                                rule.regex.lastIndex = index;
                                const exec = rule.regex.exec(str);

                                if (exec) {
                                    const doUpdate = !bestExec
                                        || (exec.index < bestExec.index)
                                        || (exec.index === bestExec.index && exec[0].length > bestExec[0].length);

                                    if (doUpdate) {
                                        bestExec = exec;
                                        bestRule = rule;
                                    }
                                }
                            }
                            if (!bestExec) {
                                if (this.errorLexeme) {
                                    lexemes.push(this.errorLexeme);
                                    return lexemes.filter(not(Lexer.NULL_LEXEME));
                                }
                                ++index;
                            }
                            else {
                                if (this.errorLexeme && index !== bestExec.index) {
                                    lexemes.push(this.errorLexeme);
                                }
                                var lexeme = this.runLexeme(bestRule.lexeme, bestExec);
                                lexemes.push(lexeme);
                                index = bestRule.regex.lastIndex;
                            }
                        }
                        return lexemes.filter(not(Lexer.NULL_LEXEME));
                    }
                };
            })();

            if (!Array.prototype.filter) {
                Array.prototype.filter = function (fun) {
                    var len = this.length >>> 0;
                    var res = [];
                    var thisp = arguments[1];
                    for (var i = 0; i < len; ++i) {
                        if (i in this) {
                            var val = this[i];
                            if (fun.call(thisp, val, i, this)) {
                                res.push(val);
                            }
                        }
                    }
                    return res;
                };
            }

            Array.prototype.last = function () {
                return this[this.length - 1];
            };

            RegExp.prototype.getFlags = (function () {
                const flagMap = [
                    ["global", "g"],
                    ["ignoreCase", "i"],
                    ["multiline", "m"],
                    ["sticky", "y"]
                ];

                return function () {
                    let flags = "";
                    flagMap.forEach(flag => {
                        if (this[flag[0]]) {
                            flags += flag[1];
                        }
                    });
                    return flags;
                };
            })();

            RegExp.concat = function (/*r1, r2, ..., rN [, flagMerger] */) {
                var regexes = Array.prototype.slice.call(arguments);
                var regexStr = "";
                var flags = (regexes[0].getFlags && regexes[0].getFlags()) || "";
                var flagMerger = RegExp.concat.INTERSECT_FLAGS;
                if (typeof regexes.last() === "function") {
                    flagMerger = regexes.pop();
                }
                regexes.forEach(regex => {
                    if (typeof regex === "string") {
                        flags = flagMerger(flags, "");
                        regexStr += regex;
                    }
                    else {
                        flags = flagMerger(flags, regex.getFlags());
                        regexStr += regex.source;
                    }
                });
                return new RegExp(regexStr, flags);
            };

            (function () {
                function setToString(set) {
                    var str = "";
                    for (var prop in set) {
                        if (set.hasOwnProperty(prop) && set[prop]) {
                            str += prop;
                        }
                    }
                    return str;
                }

                function toSet(str) {
                    var set = {};
                    for (var i = 0; i < str.length; ++i) {
                        set[str.charAt(i)] = true;
                    }
                    return set;
                }

                function union(set1, set2) {
                    for (var prop in set2) {
                        if (set2.hasOwnProperty(prop)) {
                            set1[prop] = true;
                        }
                    }
                    return set1;
                }

                function intersect(set1, set2) {
                    for (var prop in set2) {
                        if (set2.hasOwnProperty(prop) && !set2[prop]) {
                            delete set1[prop];
                        }
                    }
                    return set1;
                }
                
                RegExp.concat.UNION_FLAGS = (flags1, flags2) => setToString(union(toSet(flags1), toSet(flags2)));
                RegExp.concat.INTERSECT_FLAGS = (flags1, flags2) => setToString(intersect(toSet(flags1), toSet(flags2)));

            })();

            RegExp.prototype.group = function () {
                return RegExp.concat("(?:", this, ")", RegExp.concat.UNION_FLAGS);
            };

            RegExp.prototype.optional = function () {
                return RegExp.concat(this.group(), "?", RegExp.concat.UNION_FLAGS);
            };

            RegExp.prototype.or = function (regex) {
                return RegExp.concat(this, "|", regex, RegExp.concat.UNION_FLAGS).group();
            };

            RegExp.prototype.many = function () {
                return RegExp.concat(this.group(), "*", RegExp.concat.UNION_FLAGS);
            };

            RegExp.prototype.many1 = function () {
                return RegExp.concat(this.group(), "+", RegExp.concat.UNION_FLAGS);
            };

            function id(x) {
                return x;
            }

            /*************************************************************************************/

            var eof = /(?![\S\s])/m;
            var newline = /\r?\n/m;
            var spaces = /[\t ]*/m;
            var leadingSpaces = RegExp.concat(/^/m, spaces);
            var trailingSpaces = RegExp.concat(spaces, /$/m);

            var lineComment = /\/\/(?!@).*/m;
            var blockComment = /\/\*(?!@)(?:[^*]|\*[^/])*\*\//m;
            var comment = lineComment.or(blockComment);
            var comments = RegExp.concat(comment, RegExp.concat(spaces, comment).many());
            var eofComments = RegExp.concat(leadingSpaces, comments, trailingSpaces, eof);
            var entireLineComments = RegExp.concat(leadingSpaces, comments, trailingSpaces, newline);

            var lineCondComp = /\/\/@.*/;
            var blockCondComp = /\/\*@(?:[^*]|\*[^@]|\*@[^/])*@*\*\//;

            var doubleQuotedString = /"(?:[^\\"]|\\.)*"/;
            var singleQuotedString = /'(?:[^\\']|\\.)*'/;

            var regexLiteral = /\/(?![/*])(?:[^/\\[]|\\.|\[(?:[^\]\\]|\\.)*\])*\//;

            var anyChar = /[\S\s]/;

            /*************************************************************************************/


            var stripper = new Lexer();

            stripper.addRule(entireLineComments, Lexer.NULL_LEXEME);

            stripper.addRule(
                RegExp.concat(newline, entireLineComments.many(), eofComments),
                Lexer.NULL_LEXEME
            );

            stripper.addRule(
                RegExp.concat(comment, RegExp.concat(trailingSpaces, newline, eofComments).optional()),
                Lexer.NULL_LEXEME
            );

            stripper.addRule(lineCondComp, id);
            stripper.addRule(blockCondComp, id);

            stripper.addRule(doubleQuotedString, id);
            stripper.addRule(singleQuotedString, id);

            stripper.addRule(regexLiteral, id);

            stripper.addRule(anyChar, id);

            /*************************************************************************************/

            return stripper.lex(input).join('');
        };
    }
}