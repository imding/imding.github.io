import Ast from './Ast';
import { messageType } from './Ast';

const
  pOpeningTag = /^\s*<(?!\s*\/)(\s+)?([^<>]+)?(>)?/i,
  pClosingTag = /^\s*<(\s*)?\/(\s*)?([^<>]+)?(>)?/i,
  tags = {
    all: [
      // IMPORTANT: ascending tag name lengths
      'p', 'b', 'u', 'i', 'a',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'em', 'hr', 'tt', 'dl', 'dt', 'dd', 'tr', 'th', 'td',
      'div', 'img', 'sup', 'sub', 'pre',
      'code', 'html', 'meta', 'head', 'link', 'body', 'span', 'nobr', 'form',
      'input', 'small', 'table', 'frame',
      'button', 'strong', 'select', 'option', 'script', 'strike',
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
      'accept', 'action', 'coords', 'height', 'hidden', 'method', 'nowrap', 'poster', 'scoped', 'srcdoc', 'srcset', 'target', 'usemap',
      'charset', 'checked', 'colspan', 'compact', 'content', 'declare', 'default', 'dirname', 'enctype', 'headers', 'keytype', 'noshade', 'optimum', 'pattern', 'preload', 'rowspan', 'sandbox', 'srclang', 'summary',
      'autoplay', 'buffered', 'codebase', 'controls', 'datetime', 'disabled', 'download', 'dropzone', 'hreflang', 'itemprop', 'language', 'manifest', 'multiple', 'readonly', 'required', 'reversed', 'seamless', 'selected', 'tabindex',
      'accesskey', 'autofocus', 'challenge', 'draggable', 'integrity', 'maxlength', 'minlength', 'noresize', 'translate',
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

export default class HtmlAst extends Ast {
  constructor(strHTML) {
    super();

    let
      verdict = '',
      inputClone = strHTML,
      ambiguous = { elem: [], closingTag: [] },
      tree = [];

    // parse html and build tree until no more valid opening tag
    while (inputClone.trim().length) {
      // extract text node
      const t = inputClone.match(/^[^<]+/);
      if (t) {
        inputClone = inputClone.slice(t[0].length);
        // text node containing only white spaces are ignored
        if (t[0].trim().length) tree.push({ raw: t[0], rawCollapsed: t[0].replace(/\s+/g, ' '), type: 'text' });
      }

      // extract element node
      const e = checkElement();
      if (!e) break;
      if (!inputClone.trim().length && !e.isVoid && !e.closingTag.raw) ambiguous.elem.push(e);
      tree.push(e);
    }

    if (!verdict) {
      // deal with ambiguous code
      if (ambiguous.elem.length + ambiguous.closingTag.length) {
        if (ambiguous.elem.length < ambiguous.closingTag.length) {
          verdict = `${lastOf(ambiguous.closingTag).raw} is not paired with anything. Please add an opening tag or remove it.`;
        }
        else if (ambiguous.elem.length > ambiguous.closingTag.length) {
          verdict = `${lastOf(ambiguous.elem).openingTag.tagName} is not a void element. Please add a closing tag for ${lastOf(ambiguous.elem).openingTag.raw} or remove it.`;
        }
        else {
          verdict = `${lastOf(ambiguous.closingTag).raw} is not a valid closing tag for ${lastOf(ambiguous.elem).openingTag.raw}.`;
        }
      }
      // if input string has content
      else if (inputClone.length) {
        const ct = checkClosingTag();
        if (ct && !ambiguous.closingTag.length) {
          if (tags.all.some(t => t === ct.tagName)) ambiguous.closingTag.push(ct);
          else verdict = `${ct.raw.trim()} is not a valid closing tag. Pleae read the instructions again.`;
        }

        if (!verdict) verdict = `${ambiguous.closingTag[0].raw} is not paired with anything. Please add an opening tag or remove it.`;
      }
    }

    this._tree = tree;
    this._messages = verdict ? [{
      type: messageType.error,
      message: verdict,
    }] : [];

    // ===== NESTED FUNCTIONS ===== //
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
        verdict = `${m[0].trim()} needs to be closed off using the > symbol.`;
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
            if (textContent[0].trim().length) element.content.push({ raw: textContent[0], rawCollapsed: textContent[0].replace(/\s+/g, ' '), type: 'text', parent: element });
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
        verdict = `Please close off ${m[0].trim()} with a > symbol.`;
      }
      else if (!m[3]) {
        verdict = 'Please add a tag name after </.';
      }
      else if (!tags.all.some(t => t === m[3].trim().toLowerCase())) {
        verdict = `${m[3].trim()} is not a valid tag name.`;
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
              attrObj.name = m[2].toLowerCase();
              attrObj.raw = m[0];
              attrsRaw = attrsRaw.slice(m[0].length);

              const
                boolAttr = attributes.boolean.some(a => a === m[2].toLowerCase()),
                pushAttr = () => {
                  attrsArray.push({
                    index: null,
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

              // look for equal sign(m) followed by single or double quote(m[1])
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

  get messages() {
    return this._messages;
  }

  get tree() {
    return this._tree;
  }
}