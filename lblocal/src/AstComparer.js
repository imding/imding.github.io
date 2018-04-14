import _ from 'lodash';
import cssColors from 'css-color-names';

// Base class for CssAstComparer, HtmlAst
export default class AstComparer {
  compare(t, l, options) {
    throw 'Not implemented in AstComparer base class';
  }
}

// To compare 2 string
export function equalsIgnoreWhitespace(a, b) {
  a = removeWhitespace(a);
  b = removeWhitespace(b);
  return a === b;
}

export function removeWhitespace(string) {
  if (string !== undefined) {
    return string.replace(/[\s]/gi, '');
  }
  return ;
}

export function removeComments(string) {
  if (string !== undefined) {
    return string.replace(/(?:\/\*(?:[\s\S]*?)\*\/)|(?:^\s*\/\/(?:.*)$)|(\<![\-\-\s\w\>\/]*\>)/gm, '');
  }
  return ;
}

export function collapseWhitespace(string) {
  if (string !== undefined) {
    return string.replace(/[\s\n]+/g, ' ');
  }
  return ;
}

export function defaultDeclarationMessage(expect, value) {
  return `${value} is incorrect. Please read the instructions again.`;
}

export function matchesOption(expect, value) {
  const options = parseOptions(expect);
  return options.indexOf(value) >= 0;
}

export function parseOptions(o) {
  const match = /##[\s\w]+\((.*)\)\s*##/.exec(o);
  if (match && match.length > 0) {
    return _.map(
      match[1].split(';'),
      o => o.trim()
    );
  }
  throw `Error parsing options '${o}'.`;
}

export function convertToLowerCase(string) {
  if (string !== undefined) {
    return string.toLowerCase();
  }
  return string;
}

// To compare 2 string
export function equalsCollapseWhitespace(a, b) {
  return collapseWhitespace(a) === collapseWhitespace(b);
}

export function findRegularExpression(string) {
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

export const comparisonMode = {
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
    comparer: (expt, val) => compareWithRegExp('url', '([\'"])?[^\'"\s]+\.(jpg|gif|jpeg|bmp|png|svg)[^\'"\s]*\\1', val),
    message: (expt, val) => {
      let wrap = /url[(].*[)]/, link = /^(['"])?[^'"\s]+\.(jpg|gif|jpeg|bmp|png|svg)[^'"\s]*\1$/;
      if (!wrap.test(val)) {
        return `${val} is incorrect. The syntax should be: url("link").`;
      }
      else if (!link.test(val.replace(/url[(](.*)[)]\s*;/, '$1').trim())) {
        return `${val.replace(/url[(](.*)[)]\s*;/, '$1').trim()} doesn't contain a valid image link. Please read the instructions again.`;
      } else {
        return defaultDeclarationMessage;
      }
    },
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

function matchColorOption(expt='##COLOR(HEX;NAMED;RGB;RGBA)##', val) {
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

export function grammafy(valArray, connector = 'or', quotes = '') {
  if (quotes.trim().length) valArray.forEach((v, i) => valArray[i] = `${quotes}${v}${quotes}`);
  
  valArray.some((v, i) => {
    if (valArray.length >= 3 ) {
      valArray[i] += (i === valArray.length - 2 ? ` ${connector}` : ',');
    } else {
      valArray[i] += (i === 0 ? (valArray.length > 1 ? ` ${connector}` : '') : '');
    }
    return i === valArray.length - 2;
  });
  
  return valArray.join(' ');
}

export function getTagString(tagType, tagName) {
  if (tagType == 'tagstart') {
    return `<${tagName}>`;
  } else {
    return `</${tagName}>`;
  }
}
// turns something like `var sentence = "hello there";` into `var sentence = .............;` without changing the string length
export function replaceStrings(str, replacement = '.') {
  let arr = str.match(/((`)[^`]*\2)|((')[^']*\4)|((")[^"]*\6)/g);
  arr ? arr.forEach((s) => {    
    str = str.replace(s, Array(s.length + 1).join(replacement));
  }) : null;
  return str;
}