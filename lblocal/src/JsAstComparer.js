import _ from 'lodash';
import AstComparer, {findRegularExpression} from './AstComparer';
import {messageType} from './Ast';

// verify that the learner code and teacher code match
export default class JsAstComparer extends AstComparer {
  constructor() {
    super();
    this._messages = [];
  }

  compare(tToken, lToken) {
    this._messages = [];

    if (tToken.length == lToken.length) {             /* matching token lengths */
      _.every(tToken, (token, i) => {                 /* iterate through teacher tokens */
        if (token.type == lToken[i].type) {           /* matching token type */
          if (token.value == lToken[i].value) {       /* matching token value */
            // console.log(`Found matching ${token.type.toLowerCase()} ${token.value}`);
            return true;
          } else {                                    /* mismatching token value */
            if (token.type === 'String' && matchString(token.value, lToken[i].value)) {
              return true;
            } else {
              this._pushMessage(`${lToken[i].value} is incorrect. Please read the instructions again.`);
            }
          }
        } else {                                      /* mismatching token type */
          if (token.type.startsWith('Markup') && token.type.replace(/^Markup/, '') === lToken[i].type) {
            return true;
          } else {
            this._pushMessage(`${lToken[i].value} is incorrect. Please read the instructions again.`);
          }
        }
      });
    } else {                                          /* mismatching token lengths */
      if (tToken[tToken.length - 1].value === ';' && lToken[lToken.length - 1].value !== ';') {
        // this error message will be misleading if the instructor asks learner to write more than one line of code per editable block
        this._pushMessage("Don't forget the semi-colon at the end of a line.");
      }
      else if (tToken.length > lToken.length) {
        this._pushMessage('Something is missing from your code. Please read the instructions again.');
        //this._deepCompare(tToken, lToken);
      }
      else {
        this._pushMessage('Your code is longer than required. Please read the instructions again.');
      }
    }
  }

  _pushMessage(m, t = messageType.fail,  p = 0) {
    this._messages.push({
      type: t,
      message: m,
      position: p,
    });
  }

  _deepCompare(tToken, lToken) {
    // not yet implemented
  }
  
  get messages() {
    return this._messages;
  }
}

function matchString(teacher, learner) {
  if (/['"]/.test(teacher.slice(1, -1))) {
    // if teacher code contains nested quotes, match quotes exactly. e.g. 'Anthony "Tony" Stark' == '  Anthony "Tony" Stark'
    return new RegExp(`(${teacher[0]})\\s*${teacher.slice(1, -1)}\\s*\\1`).test(learner);
  } else {
    // e.g. 'string without nested quotes' == "string without nested quotes"
    return new RegExp(`(['"])\\s*${teacher.slice(1, -1)}\\s*\\1`).test(learner);
  }
}