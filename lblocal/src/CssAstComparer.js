import AstComparer, {collapseWhitespace, equalsIgnoreWhitespace, convertToLowerCase, findRegularExpression, removeWhitespace, grammafy} from './AstComparer';
import {messageType} from './Ast';
import {AUTO_ADDED_SELECTOR} from './CssAst';
import _ from 'lodash';

export default class CssAstComparer extends AstComparer {
  constructor(opts) {
    super();
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
      this._pushError("Make sure you haven't left the editor block empty.");
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
      this._pushError("Your code doesn't contain any at-rule.");
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
    this._messages.push({type: t, message: m});
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

  // To find duplicated selectors and generate warning messages
  _findDuplicatedSelectors(rules) {
    const selectors = [];
    rules.forEach((r, i) => {
      if (rules.hasOwnProperty(i)) selectors.push(r.selectors);
    });
    const selectorsGroup = _.groupBy(selectors, (n) => n);
    const uniqSelectors = _.uniq(_.flattenDeep(_.filter(selectorsGroup, (n) => n.length > 1 )));
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
    return {teacherSels, messages, matchedSelectors};
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

    const equivalent = comparison.comparer(teacherDecl.value, learnerDecl.value);

    if (!equivalent) {
      let errorMsg;
      const teacherDeclValue = collapseWhitespace(teacherDecl.value);
      const learnerDeclValue = collapseWhitespace(learnerDecl.value);
      const message = comparison.message(teacherDeclValue, learnerDeclValue);

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
    const uniqDeclarations = _.uniq(_.flattenDeep(_.filter(declarationsGroup, (n) => n.length > 1 )));

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