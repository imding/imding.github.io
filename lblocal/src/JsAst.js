import Ast, {messageType} from './Ast';
import {removeComments, replaceStrings} from './AstComparer';

var esprima = require('esprima'), markup = /(.*)##\s*([A-Z\s]+[(A-Z;\s)]*)\s*##(.*)/, teacherRawCode;

// verifies that the JS code is syntactically correct
export default class JsAst extends Ast {
  constructor(js, opts = null) {       // js is a string
    super();
    this._messages = [];

    js = removeComments(js);
    js = this._autoComplete(js.trim(), opts);
    
    if (this._initialCheck(js)) {
      try {
        this._parseResult = esprima.parseScript(js, {tolerant: true});
        if (this._parseResult.errors.length) {
          this._parseResult.errors.forEach((err) => {
            //console.log(`ParserError { type: ${messageType.error}, message: ${err.description}, index: ${err.index} }`);
            this._pushMessage(modifyLanguage(err.description, js, err.index), err.index);
          });
        } else {
          this._tokens = this._buildContext(esprima.tokenize(js), this._parseResult);
        }
      } catch (err) {
        //console.log(`Exception { type: ${messageType.error}, message: ${err.description}, index: ${err.index} }`);
        this._pushMessage(modifyLanguage(err.description, js, err.index), err.index);   // console.log(this._messages);
      }
    }
  }

  /* auto-completes partial syntax for teacher code, re-applies auto-completion to learner code */
  _autoComplete(input, opts) {
    let output, partialSyntax = [
      /*0*//^(if|while|for|switch|function\s+[a-zA-Z]([\w-]+)?)\s*\(.*\)$/,   // e.g if (condition == true) || function foo()
      /*1*//^else(\s+if\s*\([^{}]*\))?\s*\{.*\}$/,                            // e.g. else {} || else if (n == 2) {}
      /*2*//^else(\s+if\s*\([^{}]*\))?$/,                                     // e.g. else || else if (n == 2)
      /*3*//^(case\s+[^:\s]+|default)\s*:/,                                   // only checks for leading chars, e.g. case "John": || default:
      /*4*//^do\s*\{.*\}$/,                                                   // e.g. do {}
      /*5*//^try\s*\{.*\}$/,                                                  // e.g. try {}
      /*6*//^(finally|catch\s*\(\s*[a-zA-Z]([\w-]+)?\s*\))\s*\{.*\}$/,        // e.g. finally {} || catch (err) {}
      /*7*//^(finally|catch\s*\(\s*[a-zA-Z]([\w-]+)?\s*\))$/,                 // e.g. finally || catch (err)
      /*8*//(return\s*[^;]*|continue|break\s*[^;]*)\s*;/,                     // e.g. return true; || continue; || break labelName;
    ];

    function modify(str, i) {
      switch (i) {
        case 0: return `${str} {}`;
        case 1: return `if(true){} ${input}`;
        case 2: return `if(true){} ${input} {}`;
        case 3: return `switch(true){ ${input} }`;
        case 4: return `${input} while(true)`;
        case 5: return `${input} catch(err){}`;
        case 6: return `try{} ${input}`;
        case 7: return `try{} ${input} {}`;
        case 8: return `while(true) { ${input} }`;
      }
    }

    if (Number.isInteger(opts) /* input contains learner code */) {
      teacherRawCode = null;
      if (opts >= 0 /* teacher code was modified by autoComplete() */) {
        output = modify(input, opts);
      }
    } else /* input contains teacher code */ {
      teacherRawCode = input;
      input = convertMarkup(input);
      partialSyntax.some((syntax, i) => {
        if (syntax.test(input)) {
          this._acMethod = i;
          output = modify(input, i);
          return true;
        } else {
          this._acMethod = -1;
          return false;
        }
      });
    }
    // console.log(output ? output : input);
    return (output ? output : input);
  }

  // checks for errors that are difficult to identify with parser error messages
  _initialCheck(code) {
    const codeNoString = replaceStrings(code.replace(/(\\`)|(\\')|(\\")/g, '..')),
      codeNoBrackets = replaceBrackets(codeNoString),
      learnerErrors = [
        {
          pattern: /[`'"]/,
          searchTarget: codeNoString,
          message: () => 'Make sure the quotation marks in your code are properly paired.',
          position: () => codeNoString.search(/[`'"]/),
        },
        {
          pattern: /;\s*;/,
          searchTarget: codeNoString,
          message: () => 'Please remove repeated semi-colons in your code.',
          position: () => codeNoString.search(/;\s*;/),
        },
        {
          pattern: /^function\s+[^a-z]/i,
          searchTarget: codeNoString,
          message: () => 'Make sure your function has a name and it starts with a letter.',
          position: () => codeNoString.match(/\s*function\s+[^a-z]/i)[0].length - 1,
        },
        {
          pattern: /^function\s+[^()]+$/,
          searchTarget: codeNoString,
          message: () => "Don't forget the parentheses (round brackets) when declaring a new function.",
          position: () => codeNoString.match(/\s*function\s+[^\s]+/)[0].length,
        },
        {
          pattern: /^function\s+[^{}]+$/,
          searchTarget: codeNoString,
          message: () => "Don't forget the braces (curly brackets) when declaring a new function.",
          position: () => codeNoString.match(/\s*function\s+[^{}]+\)/)[0].length,
        },
        {
          pattern: /^(if|.*else\s+if|.*catch|switch|while|for)\s*[^{}]+$/,
          searchTarget: codeNoString,
          message: () => "Don't forget the braces (curly brackets).",
          position: () => codeNoString.match(/\s*(if|else\s+if|catch|switch|while|for)\s*[^{}]+/)[0].length,
        },
        {
          pattern: /[()\[\]{}]/g,
          searchTarget: codeNoBrackets,
          message: () => 'Make sure the brackets in your code are properly paired.',
          position: () => {
            let stack = [];
            Array.from(codeNoBrackets).some((char, i) => {
              if (/[(\[{]/.test(char)) {
                stack.unshift(char);
              }
              else if (/[)\]}]/.test(char)) {
                return char === stack[0] ? stack.shift() : i;
              }
            });
            return Array.from(codeNoBrackets).indexOf(stack[0]);
          },
        },
      ];

    learnerErrors.some((err) => {
      const match = err.pattern.test(err.searchTarget.trim());
      match ? this._pushMessage(err.message(), err.position()) : null;
      return (match);
    });

    return this._messages.length === 0;
  }

  _pushMessage(m, p = 0, t = messageType.error) {
    this._messages.push({
      type: t, 
      message: m,
      position: p,
    });
  }

  _buildContext(tokens, tree) {
    // identifier into: [variable name, function name, method name, object name, etc...]
    // not yet implemented

    if (teacherRawCode) {
      tokens.forEach((t, i, arr) => {
        if (teacherRawCode.startsWith(t.value)) {
          teacherRawCode = teacherRawCode.slice(t.value.length).trim();
        } else {
          tokens[i].type = `Markup${t.type}`;
          tokens[i].value = null;
          teacherRawCode = teacherRawCode.replace(/^##\s*([A-Z\s]+[(A-Z;\s)]*)\s*##\s*(.*)/, '$2');
        }
      });
    }
    
    return tokens;
  }

  get messages() {
    return this._messages;
  } 
    
  get tokens() {
    return this._tokens;
  }

  get autoCompleteMethod() {
    return this._acMethod;
  }
}

function modifyLanguage(errString, code, i, opt = '') {
  let newMessage, token = errString.match(/[^\s]+$/)[0];
  const parserErrors = [
    {
      pattern: /Unexpected token ILLEGAL/,
      message: () => {
        let target = code.slice(i, i + 1);
        return `${target} is only allowed as a string (e.g. "${target}").`;
      },
    },
    {
      pattern: /Unexpected token (var|let|const|function)/,
      message: () => {
        if (/^(var|let|const)\s+/.test(code.trim()) && token === 'function') {
          return `The keyword ${token} can not be used as a variable name.`;
        }
        else if (/^function\s+/.test(code.trim()) && (token === 'var' || token === 'let' || token === 'const')) {
          return `The keyword ${token} can not be used as a function name.`;
        } else {
          return `To create a new ${token == 'function' ? token : 'variable'}, the keyword ${token} must be at the beginning of a line.`;
        }
      },
    },
    {
      pattern: /Unexpected token \w+/,
      message: () => `The keyword "${token}" can not be used as a variable or function name.`,
    },
    {
      pattern: /Unexpected token ;/,
      message: () => {
        // when code ends with semi-colon AND error indicates invalid semi-colon, something is wrong immediately before the semi-colon
        if (/;$/.test(code.trim())) {
          // remove semi-colon from end-of-line and pass it to modifyLanguage() with artificial parser error "Unexpected end of input"
          return modifyLanguage('Unexpected end of input', code.replace(/\s*;\s*$/,'').trimRight(), i, code.trim().match(/\s*;$/)[0]);
        } else {
          return 'Semi-colon is in the wrong place. Did you mean to put it at the end of the line?';
        }
      },
    },
    {
      pattern: /Unexpected token .*/,
      message: () => {
        let proximity = [code.slice(0, i).match(/[^\s]+\s*$/)[0], code.slice(i).replace(token, '').match(/^\s*[^\s]+/)[0]];
        return `${proximity[0]}${token}${proximity[1]} is not the correct way to use the token ${token}`;
      },
    },
    {
      pattern: /Unexpected identifier/,
      message: () => {
        let typo = [code.slice(0, i).match(/[^\s]+\s*$/)[0], code.slice(i).match(/^\s*[^\s]+/)[0]];
        return `There is a typo in your code: ${typo[0]}${typo[1]}`;
      },
    },
    {
      pattern: /Unexpected number/,
      message: () => `The number ${code.slice(i).match(/\d+/)[0]} is in the wrong place.`,
    },
    {
      pattern: /Invalid regular expression/,
      message: () => {
        if (code.match(/\//g).length > 1) {
          return `${code.slice(code.indexOf('/'), code.lastIndexOf('/') + 1)} contains incorrect use of the token /`;
        } else {
          return 'Incorrect use of the token /';
        }
      },
    },
    {
      pattern: /Unexpected end of input/,
      message: () => `Your code shouldn't end with ${code.trim().slice(-1)}${opt.includes(';') ? opt : ''}`,
    },
    {
      pattern: /Invalid left-hand side in assignment/,
      message: () => `${code.split(/=/)[0].trim()} is incorrect. Please read the instructions again.`,
    },
    {
      pattern: /Unexpected string/,
      message: () => `The string ${code.match(/(['"])[^'"]*\1/g)[0]} is in the wrong place.`,
    },
  ];

  parserErrors.some((err) => {
    let match = err.pattern.test(errString);
    return (newMessage = match ? err.message() : '');
  });

  return newMessage;
}

// replace valid pairs of brackets in a string with dots (.) without changing the string length
function replaceBrackets(str) {
  let p = /(\([^()\[\]{}]*\))|(\[[^()\[\]{}]*\])|(\{[^()\[\]{}]*\})/;
  while (p.test(str)) {
    str = str.replace(p, Array(str.match(p)[0].length + 1).join('.'));
  }
  return str;
}

function convertMarkup(code) {
  while (markup.test(code)) {
    let type = code.replace(markup, '$2').toUpperCase().trim(), value;

    switch (true) {
      case /^STRING(\s*\(.*\))?$/.test(type): value = '""'; break;
      case /^NUMBER(\s*\(.*\))?$/.test(type): value = 0; break;
      default: throw new Error(`Missing convertMarkup() response for ##${type}##.`);
    }

    code = code.replace(markup, `$1${value}$3`);
  }

  return code;
}