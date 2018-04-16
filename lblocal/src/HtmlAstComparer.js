import AstComparer, { findRegularExpression, parseOptions, grammafy } from './AstComparer';
import { messageType } from './Ast';

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

export default class HtmlAstComparer extends AstComparer {
  constructor() {
    super();
  }

  compare(model, input) {
    let verdict;
    // compare elements using teacher node(tn) & learner node(ln)
    const matchElement = (tn, ln) => {
      const flexExpt = findRegularExpression(tn.raw);
      if (!(flexExpt.hasOwnProperty('compatible') && flexExpt.compatible.includes('html'))) throw new Error(`Match option "${flexExpt.type}" is incompatible with HTML.`);

      if (tn.type === 'element') {
        if (ln.type === 'element') {
          if (ln.openingTag.tagName !== tn.openingTag.tagName) {
            verdict = `${ln.openingTag.raw}${ln.isVoid ? '' : `${ln.content.length ? '...' : ''}${ln.closingTag.raw}`} is not the right element. Please read the instructions again.`;
          }
          else if (tn.openingTag.attrs.length < ln.openingTag.attrs.length) {
            ln.openingTag.attrs.some(a => {
              if (!val(a.name).isFoundIn(tn.openingTag.attrs.map(_a => _a.name))) {
                verdict = `In the ${tn.openingTag.tagName} tag, ${a.name} attribute is not required. Please remove it.`;
              }
            });
          }
          else if (matchAttrs(tn.openingTag, ln.openingTag)) {
            // check for equal content length if combined length of teacher & leaner nodes is non-zero
            if (tn.content.length + ln.content.length && tn.content.length !== ln.content.length) {
              const
                someText = tn.content.length === 1 && tn.content[0].type === 'text' && !ln.content.length ? 'some text' : '',
                elements = `element${tn.content.length ? tn.content.length > 1 ? 's' : '' : ''}`,
                only = tn.content.length < ln.content.length ? 'only' : '',
                n = `${tn.content.length ? (tn.content.length === 1 && !ln.content.length ? 'an' : '1') : 'no'}`;

              verdict = `There should be ${someText || `${only ? `${only} ${n}` : n} ${elements}`} in ${tn.openingTag.raw}${tn.closingTag.raw}.`;
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
          verdict = `Text content "${tn.raw.trim()}" is missing from ${tn.parent ? `the ${tn.parent.openingTag.tagName} element` : 'your code'}. Please add it in.`;
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
            if (flexExpt.type === 'not') err.solution += 'any other text';
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

    // compare attributes and values between teacher tag(tt) & learner tag(lt)
    const matchAttrs = (tt, lt) => {
      if (!(tt.attrs.length + lt.attrs.length)) {
        return true;
      }
      else if (tt.attrs.length === lt.attrs.length) {
        // copy of learner attributes(weak) that will be trimmed down to identify incorrect attributes
        const weak = lt.attrs, due = [];

        tt.attrs.every(a => {
          if (val(a.name).isFoundIn(weak.map(_a => _a.name))) {
            let
              // it's safe to use the first occurence of an attribute with matching name because duplicate attribute name is an error HtmlAst.js would've caught
              inputVal = weak.filter(_a => _a.name === a.name)[0].value,
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
          if (due.length !== weak.length) throw new Error('The number of unmatched attribute should equal to the number of weak attribute.');

          // estimate association between due and weak attributes
          let s, suggest;
          due.some(da => {
            const _s = similarity(weak[0].value.trim().toLowerCase().split(/\s+/).sort().join(), da.value.trim().toLowerCase().split(/\s+/).sort().join());
            if (_s > (s || 0)) {
              s = _s;
              suggest = da;
            }
            return s === 1;
          });

          if (suggest) verdict = `In the ${tt.tagName} tag, ${weak[0].raw.trim()} is incorrect. Try changing the attribute name to ${suggest.name}.`;
          else verdict = `In the ${tt.tagName} tag, ${weak[0].raw.trim()} is incorrect. Please read the instructions again.`;
        }

        return !verdict;
      }
      else {
        verdict = `There should be ${tt.attrs.length ? `${tt.attrs.length > lt.attrs.length ? '' : 'only '}` : 'no'}${tt.attrs.length || ''} attribute${tt.attrs.length > 1 ? 's' : ''} in the ${tt.tagName} tag.`;
      }

      return;
    };

    // compare tree lengths
    if (model.length !== input.length) {
      const
        someText = model.length === 1 && model[0].type === 'text' && !input.length ? 'some text' : '',
        elements = `element${model.length ? model.length > 1 ? 's' : '' : ''}`,
        only = model.length < input.length ? 'only' : '',
        n = `${model.length ? (model.length === 1 && !input.length ? 'an' : '1') : 'no'}`;

      verdict = `There should be ${someText || `${only ? `${only} ${n}` : n} ${elements}`} in your code.`;
    }
    else {
      // loop through every teacher node and find equivalent node in learner code
      model.every((e, i) => matchElement(e, input[i]));
    }

    this._messages = verdict ? [{
      type: messageType.fail,
      message: verdict,
    }] : [];

    return !verdict;
  }

  get messages() {
    return this._messages;
  }
}