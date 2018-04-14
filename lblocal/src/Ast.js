export const messageType = {
  error: 'error',
  fail: 'fail',
  warn: 'warn',
};

// Base class for CssAst, HtmlAst etc
export default class Ast {
  get errors() {
    throw 'Not implemented in Ast base class';
  }
}
