import AstComparer, {collapseWhitespace, equalsIgnoreWhitespace, convertToLowerCase, findRegularExpression, removeWhitespace} from './AstComparer';
import {messageType} from './Ast';
import {AUTO_ADDED_SELECTOR} from './CssAst';
import _ from 'lodash';

function matchURL(model, input) {
  
}

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
      const failedMsg = {
        type: messageType.fail,
        message: "Make sure you haven't left the editor block empty.",
      };
      this._messages.push(failedMsg);
      return;
    }

    let teacherRules = t.rules.filter(tr => tr.type === 'rule');
    let teacherAtRules = t.atRules;
    let learnerRules = l.rules.filter(lr => lr.type === 'rule');
    let learnerAtRules = l.atRules;

    // loop through at-rules
    // teacherAtRules.forEach((tar) => {//console.log(tar);
    //   let typeMatch;

    //   learnerAtRules.some((lar, i) => {
    //     if (!lar.matched && tar.type === lar.type) {
    //       switch (lar.type) {
    //         case 'import':
    //           if (matchURL(tar.import, lar.import)) {
    //             learnerAtRules[i].matched = true;
    //           }
    //       }
    //     }
    //   });

    //   console.log(typeMatch);
    // });

    // loop to check each selector of teacher
    teacherRules.forEach((tr) => {
      const failedMsg = this._matchingCSS(learnerRules, tr.selectors, tr.declarations, options);
      failedMsg.teacherSels.map((ts) => this._teacherSelectors.push(ts));
      failedMsg.matchedSelectors.map((ms) => this._matchedSelectors.push(ms));
      failedMsg.messages.map((m) => this._messages.push(m));
    });

    // for (let key in t.rules) {
    //   if (!t.rules.hasOwnProperty(key)) {
    //     continue;
    //   }

    //   const rule = t.rules[key];
    //   const t_type = rule.type;
    //   const t_sel = rule.selectors;
    //   const t_dec = rule.declarations;

    //   if (t_type === 'rule') {
    //     const failedMsg = this._matchingCSS(l.rules, t_sel, t_dec, options);
    //     failedMsg.teacherSels.map((ts) => this._teacherSelectors.push(ts));
    //     failedMsg.matchedSelectors.map((ms) => this._matchedSelectors.push(ms));
    //     failedMsg.messages.map((m) => this._messages.push(m));
    //   }
    // }

    const learnerDuplicatedSelectors = this._findDuplicatedSelectors(l.rules);
    learnerDuplicatedSelectors.map((e) => this._messages.push(e));

    if (!options.allowExtraSelectors) {
      const unexpectedSelectors = this._findUnexpectedSelectors(this._matchedSelectors, l.rules);
      if (unexpectedSelectors != null) {
        unexpectedSelectors.map((us) => {
          us = collapseWhitespace(us);
          const failedMsg = {
            type: messageType.fail,
            message: `The ${us} selector is not required. Please remove or correct it.`,
          };
          this._messages.unshift(failedMsg);
        });
      }
    }

    const missingSelectors = this._findMissingSelectors(this._matchedSelectors, this._teacherSelectors);
    if (missingSelectors != null) {
      missingSelectors.map((ne) => {
        ne = collapseWhitespace(ne);
        const failedMsg = {
          type: messageType.fail,
          message: `Don't forget to add the selector for ${ne}.`,
        };
        this._messages.unshift(failedMsg);
      });
    }
    if (l.messages.length > 0) {
      l.messages.reverse().map((m) => this._messages.unshift(m));
    }
  }

  // To find duplicated selectors and generate warning messages
  _findDuplicatedSelectors(rules) {
    const selectors = [];
    for (let e in rules) {
      if (rules.hasOwnProperty(e)) {
        selectors.push(rules[e].selectors);
      }
    }
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
    
    teacherSelectors.forEach(ts => {
      const teacherSelector = ts.trim();
      teacherSels.push(teacherSelector);

      // loop through learner AST
      // break this loop if found selector
      learnerRules.forEach((lr, i) => {
        if (!learnerRules.hasOwnProperty(i)) return;

        const learnerRule = lr;

        if (learnerRule.selector == null) return;

        const learnerSelectors = learnerRule.selectors;

        // loop through learner's selector
        // break this loop if found selector
        learnerSelectors.forEach((ls, j) => {
          if (!learnerSelectors.hasOwnProperty(j)) return;

          // found matched selector
          if (equalsIgnoreWhitespace(teacherSelector, learnerSelectors[ls])) {
            matchedSelectors.push(teacherSelector);

            const learnerDec = learnerRule.declarations;
            const tempTeacherDecl = this._matchingDeclarations(teacherSelector, teacherDecls, learnerDec, messages, opts.declarationsOnly);

            // find unexpected declarations
            if (!opts.allowExtraDeclarations) {
              this._findUnexpectedDecl(teacherSelector, learnerDec, tempTeacherDecl, messages, opts.declarationsOnly);
            }

            // Matching selector was found. Exit now.
            messages = messages.filter(Boolean);
            return {teacherSels, messages, matchedSelectors};
          }
        });
      });
    });

    // // Loop through teacher's selectors.
    // for (let ts in teacherSelectors) {
    //   const teacherSelector = teacherSelectors[ts].trim();
    //   teacherSels.push(teacherSelector);

    //   // loop through learner AST
    //   // break this loop if found selector
    //   for (let lr in learnerRules) {
    //     if (!learnerRules.hasOwnProperty(lr)) {
    //       continue;
    //     }
    //     const learnerRule = learnerRules[lr];

    //     if (learnerRule.selectors == null) {
    //       continue;
    //     }
    //     const learnerSelectors = learnerRule.selectors;

    //     // loop through learner's selector
    //     // break this loop if found selector
    //     for (let ls in learnerSelectors) {
    //       if (!learnerSelectors.hasOwnProperty(ls)) {
    //         continue;
    //       }

    //       // found matched selector
    //       if (equalsIgnoreWhitespace(teacherSelector, learnerSelectors[ls])) {
    //         matchedSelectors.push(teacherSelector);

    //         const learnerDec = learnerRule.declarations;
    //         const tempTeacherDecl = this._matchingDeclarations(teacherSelector, teacherDecls, learnerDec, messages, opts.declarationsOnly);

    //         // find unexpected declarations
    //         if (!opts.allowExtraDeclarations) {
    //           this._findUnexpectedDecl(teacherSelector, learnerDec, tempTeacherDecl, messages, opts.declarationsOnly);
    //         }

    //         // Matching selector was found. Exit now.
    //         messages = messages.filter(Boolean);
    //         return {teacherSels, messages, matchedSelectors};
    //       }
    //     }
    //   }
    // }

    messages = messages.filter(Boolean);
    return {teacherSels, messages, matchedSelectors};
  }

  // To find unexpected declarations in learner CSS code
  _findUnexpectedDecl(teacherSelector, learnerDec, tempTeacherDecl, messages, declarationsOnly) {
    const tempLearnerDecl = [];

    learnerDec.forEach((ld, i) => {
      if (learnerDec.hasOwnProperty(i)) tempLearnerDecl.push(ld.property);
    });
    // for (let ld in learnerDec) {
    //   if (learnerDec.hasOwnProperty(ld)) {
    //     tempLearnerDecl.push(learnerDec[ld].property);
    //   }
    // }

    const unexpectedDecl = tempLearnerDecl.filter(val => !tempTeacherDecl.includes(val));
    
    if (unexpectedDecl == null) return;

    unexpectedDecl.forEach(ud => {
      let msg;
      ud = collapseWhitespace(ud);

      if (ud == undefined) return;

      if (declarationsOnly) {
        msg = {
          type: messageType.fail,
          message: `The ${ud} property is not required. Please remove or correct it.`,
        };
      } else {
        msg = {
          type: messageType.fail,
          message: `In the ${teacherSelector} {} rule, ${ud} property is not required. Please remove or correct it.`,
        };
      }
      messages.push(msg);
    });
    // for (let ud of unexpectedDecl) {
    //   let msg;
    //   ud = collapseWhitespace(ud);
    //   if (ud !== undefined) {
    //     if (declarationsOnly) {
    //       msg = {
    //         type: messageType.fail,
    //         message: `The ${ud} property is not required. Please remove or correct it.`,
    //       };
    //     } else {
    //       msg = {
    //         type: messageType.fail,
    //         message: `In the ${teacherSelector} {} rule, ${ud} property is not required. Please remove or correct it.`,
    //       };
    //     }
    //     messages.push(msg);
    //   }
    // }
  }

  _equalsIgnoreCase(str1, str2) {
    return convertToLowerCase(str1) === convertToLowerCase(str2);
  }

  // To find matched declarations then compare "property" and "value"
  _matchingDeclarations(teacherSelector, teacherDecls, learnerDec, messages, declarationsOnly) {
    const tempTeacherDecl = [];
    const duplicatedDeclList = this._findDuplicatedDeclarations(teacherSelector, learnerDec, declarationsOnly);
    duplicatedDeclList.map((dl) => messages.push(dl));

    teacherDecls.forEach((td, i) => {
      if (!teacherDecls.hasOwnProperty(i)) return;

      const teacherDecl = teacherDecls[td];
      
      if (teacherDecl.type !== 'declaration') return;

      const matchedLearnerDecl = _.find(
        learnerDec,
        (o) => this._equalsIgnoreCase(o.property, teacherDecl.property)
      );

      if (matchedLearnerDecl != null) {
        tempTeacherDecl.push(convertToLowerCase(teacherDecl.property));

        this._compareDeclarations(matchedLearnerDecl, teacherDecl, messages, declarationsOnly, teacherSelector);
      } else {
        let errorMsg;
        if (declarationsOnly) {
          errorMsg = {
            type: messageType.fail,
            message: `Don't forget to create the ${teacherDecl.property.replace(/-/, ' ')} style.`,
          };
        } else {
          errorMsg = {
            type: messageType.fail,
            message: `Don't forget to create the ${teacherDecl.property.replace(/-/, ' ')} style inside the ${teacherSelector} {} rule.`,
          };
        }

        messages.push(errorMsg);
      }
    });

    // for (let td in teacherDecls) {
    //   if (!teacherDecls.hasOwnProperty(td)) {
    //     continue;
    //   }

    //   const teacherDecl = teacherDecls[td];
    //   if (teacherDecl.type !== 'declaration') {
    //     continue;
    //   }

    //   const matchedLearnerDecl = _.find(
    //     learnerDec,
    //     (o) => this._equalsIgnoreCase(o.property, teacherDecl.property)
    //   );

    //   if (matchedLearnerDecl != null) {
    //     tempTeacherDecl.push(convertToLowerCase(teacherDecl.property));

    //     this._compareDeclarations(matchedLearnerDecl, teacherDecl, messages, declarationsOnly, teacherSelector);
    //   } else {
    //     let errorMsg;
    //     if (declarationsOnly) {
    //       errorMsg = {
    //         type: messageType.fail,
    //         message: `Don't forget to create the ${teacherDecl.property.replace(/-/, ' ')} style.`,
    //       };
    //     } else {
    //       errorMsg = {
    //         type: messageType.fail,
    //         message: `Don't forget to create the ${teacherDecl.property.replace(/-/, ' ')} style inside the ${teacherSelector} {} rule.`,
    //       };
    //     }

    //     messages.push(errorMsg);
    //   }
    // }
    return tempTeacherDecl;
  }

  _compareDeclarations(learnerDecl, teacherDecl, messages, declarationsOnly, teacherSelector) {
    const comparison = findRegularExpression(teacherDecl.value);
    if (comparison == null) {
      throw 'No comparer selected in compareDeclarations';
    }

    const equivalent = comparison.comparer(teacherDecl.value, learnerDecl.value);

    if (!equivalent) {
      let errorMsg;
      const teacherDeclValue = collapseWhitespace(teacherDecl.value);
      const learnerDeclValue = collapseWhitespace(learnerDecl.value);
      const message = comparison.message(teacherDeclValue, learnerDeclValue);
      if (declarationsOnly) {
        errorMsg = {
          type: messageType.fail,
          message: `${teacherDecl.property}: ${message}`,
        };
      } else {
        errorMsg = {
          type: messageType.fail,
          message: `In the ${teacherSelector} {} rule, ${teacherDecl.property}: ${message}`,
        };
      }
      messages.push(errorMsg);
    }
  }

  // find duplicated declarations
  _findDuplicatedDeclarations(teacherSelector, declList, declarationsOnly) {
    const declarations = [];
    declList.forEach((dl, i) => {
      if (declList.hasOwnProperty(i)) declarations.push(dl.property);
    });
    // for (let decl in declList) {
    //   if (declList.hasOwnProperty(decl)) {
    //     declarations.push(declList[decl].property);
    //   }
    // }
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

      const selector = lr.selecotrs;
      const type = lr.type;

      if (type == 'rule') selectors.map(e => selectors.push(e));
    });
    // for (let index in learnerRules) {
    //   if (!learnerRules.hasOwnProperty(index)) continue;

    //   const selector = learnerRules[index].selectors;
    //   const type = learnerRules[index].type;
    //   if (type == 'rule') {
    //     selector.map((e) => selectors.push(e));
    //   }
    // }

    const nonWhiteSpace = matchedSelectors.map((e) => removeWhitespace(e));
    selectors = selectors.filter(val => !nonWhiteSpace.includes(removeWhitespace(val)));
    return selectors;
  }

  get messages() {
    return this._messages;
  }
}