import _ from 'lodash';
import HtmlAst from './HtmlAst';
import HtmlAstComparer from './HtmlAstComparer';
import CssAst from './CssAst';
import CssAstComparer from './CssAstComparer';
import JsAst from './JsAst';
import JsAstComparer from './JsAstComparer';

const expectationType = {
  exists: 'exist',
  equals: 'be equal to',
  equivalent: 'be equivalent to',
  contains: 'contain',
  isDate: 'be a date',
  isNumber: 'be a number',
  isTrue: 'be true',
  greaterThan: 'be greater than',
  lessThan: 'be less than',
};

// Create a new function with predefined parameters then apply it with values in sequence
function evalInContext(context, expression) {
  // Store 'this' that is passed from functionEnd() to be able to call it inside the expression.
  // Then remove it from context because 'this' cannot be used as a parameter name.
  const that = context.this;
  delete context.this;

  const paramNames = _.keys(context);
  const paramValues = _.values(context);
  const func = new Function(paramNames, `return ${expression}`);
  return func.apply(that, paramValues);
}

function createExpectation(failure, onCreate, code, testMessageManager, failureMessage) {
  const expectation = new StepExpectation(
    code, failure, testMessageManager, failureMessage
  );
  onCreate(expectation);
  return expectation;
}

function getExpectationFunc(failure, onCreate, code, testMessageManager) {
  const expectation = createExpectation.bind(this, failure, onCreate, code, testMessageManager);

  const css = (v) => expectation().css(v);
  css.editable = (v) => expectation().when.css.editable(v);
  css.contains = (v) => expectation().when.css.contains(v);
  css.equivalent = (v) => expectation().when.css.equivalent(v);
  css.equivalent.to = (v) => expectation().when.css.equivalent.to(v);
  Object.defineProperties(css, {
    'is': {
      key: 'is',
      get: () => expectation().when.css.is(),
    },
    'not': {
      key: 'not',
      get: () => expectation().when.css.not(),
    },
    'does': {
      key: 'does',
      get: () => expectation().when.css.does(),
    },
  });

  const html = (v) => expectation().html(v);
  html.editable = (v) => expectation().when.html.editable(v);
  html.contains = (v) => expectation().when.html.contains(v);
  html.equivalent = (v) => expectation().when.html.equivalent(v);
  html.equivalent.to = (v) => expectation().when.html.equivalent.to(v);
  Object.defineProperties(html, {
    'is': {
      key: 'is',
      get: () => expectation().when.html.is(),
    },
    'not': {
      key: 'not',
      get: () => expectation().when.html.not(),
    },
    'does': {
      key: 'does',
      get: () => expectation().when.html.does(),
    },
  });

  const js = (v) => expectation().js(v);
  js.editable = (v) => expectation().when.js.editable(v);
  js.equivalent = (v) => expectation().when.js.equivalent(v);
  js.equivalent.to = (v) => expectation().when.js.equivalent.to(v);
  Object.defineProperties(js, {
    'is': {
      key: 'is',
      get: () => expectation().when.js.is(),
    },
    'not': {
      key: 'not',
      get: () => expectation().when.js.not(),
    },
    'does': {
      key: 'does',
      get: () => expectation().when.js.does(),
    },
  });

  expectation.if = (v) => expectation().if(v);
  expectation.if.css = css;
  expectation.if.html = html;
  expectation.if.js = js;
  expectation.when = (v) => expectation().when(v);
  expectation.when.css = css;
  expectation.when.html = html;
  expectation.when.js = js;
  expectation.on = (v) => expectation().on(v);
  expectation.on.js = expectation.on;

  return expectation;
}

/**
 * This class is used for defining expectations and fail messages.
 *
 * Please refer to the tutorial: {@tutorial step_tests}.
 */
class StepExpectation {
  static fail(onCreate, code, testMessageManager) {
    return getExpectationFunc(true, onCreate, code, testMessageManager);
  }

  static pass(onCreate, code, testMessageManager) {
    return getExpectationFunc(false, onCreate, code, testMessageManager);
  }

  constructor(code, failure, testMessageManager, failMessage) {
    this._code = code;
    this._testMessageManager = testMessageManager;
    this._failMessage = failMessage;
    this._expectationType = null;
    this._expectedValues = [];
    this._failure = failure;
    this._approxTolerance = null;
    this._value = null;
    this._onFuncString = null;
    this._evalString = null;

    this._called = {
      codeType: null,
      editableIndex: null,
      whenIf: false,
      on: false,
      expectation: false,
    };

    const wrapCss = (f) => {
      const that = this;
      f = f.bind(this);
      return function() {
        that._ensureCssCodeAvailable();
        that._called.codeType = 'css';
        that._called.whenIf = true;
        that._value = that._code.css.text;
        return f(...arguments);
      };
    };

    const wrapHtml = (f) => {
      const that = this;
      f = f.bind(this);
      return function() {
        that._ensureHtmlCodeAvailable();
        that._called.codeType = 'html';
        that._called.whenIf = true;
        that._value = that._code.html.text;
        return f(...arguments);
      };
    };

    const wrapJs = (f) => {
      const that = this;
      f = f.bind(this);
      return function() {
        that._ensureJsCodeAvailable();
        that._called.codeType = 'js';
        that._called.whenIf = true;
        that._value = that._code.js.text;
        return f(...arguments);
      };
    };

    this.css = this.css.bind(this);
    this.css.editable = this._editable.bind(this, 'css');
    this.css.is = wrapCss(this._is);
    this.css.does = wrapCss(this._does);
    this.css.not = wrapCss(this._not);
    this.css.contains = wrapCss(this.contains);
    this.css.equivalent = wrapCss(this.equivalent);
    this.css.equivalent.to = this.css.equivalent.bind(this);

    this.html = this.html.bind(this);
    this.html.editable = this._editable.bind(this, 'html');
    this.html.is = wrapHtml(this._is);
    this.html.does = wrapHtml(this._does);
    this.html.not = wrapHtml(this._not);
    this.html.contains = wrapHtml(this.contains);
    this.html.equivalent = wrapHtml(this.equivalent);
    this.html.equivalent.to = this.html.equivalent.bind(this);

    this.js = this.js.bind(this);
    this.js.editable = this._editable.bind(this, 'js');
    this.js.is = wrapJs(this._is);
    this.js.does = wrapJs(this._does);
    this.js.not = wrapJs(this._not);
    this.js.contains = wrapJs(this.contains);
    this.js.equivalent = wrapJs(this.equivalent);
    this.js.equivalent.to = this.js.equivalent.bind(this);
    this.if = this.if.bind(this);
    this.if.css = this.css;
    this.if.html = this.html;
    this.if.js = this.js;

    this.when = this.when.bind(this);
    this.when.css = this.css;
    this.when.html = this.html;
    this.when.js = this.js;

    this.on = this.on.bind(this);
    this.on.js = this.on;

    this.equal = this.equal.bind(this);
    this.equal.to = this.equal.bind(this);

    this.equivalent = this.equivalent.bind(this);
    this.equivalent.to = this.equivalent.bind(this);
  }

  get failure() {
    return this._failure;
  }

  get testMessageManager() {
    return this._testMessageManager;
  }

  get evalString() {
    return this._evalString;
  }

  get isLiveExpectation() {
    return this._called.on;
  }

  get editableIndex() {
    return this._called.editableIndex;
  }

  get codeType() {
    return this._called.codeType;
  }

  _ensure(expect, message) {
    if (!expect) {
      throw message;
    }
  }

  _ensureString(target, value) {
    this._ensure(
      typeof value === 'string' || value instanceof String,
      `'${target}' expects a string.`
    );
  }

  _ensureWhenIfCalled(target) {
    this._ensure(
      this._called.whenIf,
      `The 'when()' or 'if()' function must be called before '${target}'`
    );
  }

  _ensureExpectationNotDefined(target) {
    this._ensure(
      !this._called.expectation,
      `'${target}' must be called before the expectation e.g. fail.when(v).${target}.equals(x)`
    );
  }

  _ensureCssCodeAvailable() {
    this._ensure(
      this._code.css != null,
      '"code.css" is not available'
    );
    this._ensure(
      this._code.css.text != null,
      '"code.css.text" is not available'
    );
    this._ensure(
      this._code.css.editable != null,
      '"code.css.editable" is not available'
    );
  }

  _ensureHtmlCodeAvailable() {
    this._ensure(
      this._code.html != null,
      '"code.html" is not available'
    );
    this._ensure(
      this._code.html.text != null,
      '"code.html.text" is not available'
    );
    this._ensure(
      this._code.html.editable != null,
      '"code.html.editable" is not available'
    );
  }

  _ensureJsCodeAvailable() {
    this._ensure(
      this._code.js != null,
      "'code.js' is not available"
    );
    this._ensure(
      this._code.js.text != null,
      "'code.js.text' is not available"
    );
    this._ensure(
      this._code.js.editable != null,
      "'code.js.editable' is not available"
    );
  }

  _checkPreExpectation(target) {
    this._ensureWhenIfCalled(target);
    this._ensureExpectationNotDefined(target);
  }

  _whenIf(value) {
    this._ensure(
      !this._called.whenIf,
      "The 'when()' and 'if()' functions must only be called once."
    );
    this._value = value;
    this._called.whenIf = true;
    return this;
  }

  /**
   * This accepts the learner's value to be tested. Only one of 'when' and 'if'
   * can be called. The behaviour is identical to 'if'.
   * @example
   * pass.when(myval).a.number
   * fail.when(myval).not.a.number;
   */
  when(value) {
    return this._whenIf(value);
  }

  /**
   * This accepts the learner's value to be tested. Only one of 'when' and 'if'
   * can be called. The behaviour is identical to 'when'.
   * @example
   * pass.if(myval).a.number
   * fail.if(myval).not.a.number;
   */
  if(value) {
    return this._whenIf(value);
  }

  /**
   * This is live expectation and cannot be used with when/if expectation.
   * This function accepts a function name or index to be invoked.
   * Can also specify the script name if necessary.
   * The function name must contain all ancestor functions if expect a nested function to be invoked.
   * @example
   * pass.on('1')                 // passes when the function at index 1 is invoked (index starts at 0)
   * pass.on('f1')                // passes when f1() is invoked (regardless of what script is calling)
   * pass.on('myScript.js/f1')    // passes when f1() of file 'myScript.js' is invoked
   * pass.on('myScript.js/f1/f2') // passes when f2() inside f1() of file 'myScript.js' is invoked
   * fail('message').on('f1')     // fails when f1() is invoked (failure message is optional)
   */
  on(value) {
    this._ensure(
      !this._called.whenIf,
      "The 'when()' or 'if()' function must not be called when using 'on()'"
    );
    this._ensure(
      !this._called.on,
      "The 'on()' function must only be called once."
    );
    this._called.on = true;
    this._onFuncString = value;
    return this;
  }

  /**
   * This is available when using live expectations.
   * This function accepts a string to be evaluated.
   * When the string evaluates as 'true' then the expectation is automatically
   * flagged as passed (if using pass.on) or failed (if using fail.on),
   * and when the string evaluates as 'false' then the expectation is flagged as pending,
   * even if the expectation had already changed to the passed or failed state.
   * The evaluating string can access variables used in the function and all root-scope variables.
   * @example
   * pass.on('f1').var('hello === 1') // passes when f1() is invoked with variable 'hello' value is 1 before return
   * pass.on('f1').var('hello === 1 && world === 2')
   * pass.on('f1').var('str === "hello world"')
   */
  var(value) {
    this._ensure(
      this._called.on,
      "The 'on()' function must be called before 'var()'"
    );
    this._ensure(
      this._evalString === null,
      "The 'var()' function must only be called once."
    );
    this._evalString = value;
    return this;
  }

  /**
   * This accepts the learner's CSS to be tested.
   * The behaviour is similar to 'when' and 'if' except that it also
   * flags the value as being 'css' which adjusts the behaviour of
   * 'contains' and allows 'equivalent' to be used.
   * @example
   * pass.if.css(myval).equivalent.to("h2 {color:green}")
   * fail.when.css(myval).contains("border:1px");
   */
  css(value) {
    this._ensure(
      this._called.codeType == null,
      "The 'css()' function must only be called once."
    );

    this._called.codeType = 'css';
    // reformat teacher-defined learner code has one declaration per line
    return this._whenIf(value.replace(/;\s*/g, ';\n'));
  }

  html(value) {
    this._ensure(
      this._called.codeType == null,
      "The 'html()' function must only be called once."
    );

    this._called.codeType = 'html';
    return this._whenIf(value);
  }

  js(value) {
    this._ensure(
      this._called.codeType == null,
      "The 'js()' function must only be called once."
    );

    this._called.codeType = 'js';
    return this._whenIf(value);
  }

  /**
   * This is available when using 'css' in the pass/fail chain and
   *
   */
  _editable(codeType, index) {
    this._ensure(
      this._called.codeType == null,
      "Expected usage: 'when.css.editable(n)' or 'if.css.editable(n)'."
    );

    this._called.codeType = codeType;
    this._called.editableIndex = index;
    this._called.whenIf = true;

    let editableArray;
    if (codeType == 'css') {
      this._ensureCssCodeAvailable();
      editableArray = this._code.css.editable;
    } else if (codeType == 'html') {
      this._ensureHtmlCodeAvailable();
      editableArray = this._code.html.editable;
    } else if (codeType === 'js') {
      this._ensureJsCodeAvailable();
      editableArray = this._code.js.editable;
    } else {
      this._ensure(false, 'editable codeType invalid');
    }

    if (editableArray) {
      if (index < 0 || index > editableArray.length) {
        throw new Error(`Error - editable(${index}) is not valid.`);
      }
      this._value = editableArray[index];
    }

    return this;
  }

  /**
   * This doesn't affect behaviour but helps writing more fluent expectations.
   * @example
   * pass.if(myval).a.number;
   */
  get a() {
    this._checkPreExpectation('a');
    return this;
  }

  _is() {
    this._checkPreExpectation('is');
    return this;
  }

  /**
   * This doesn't affect behaviour but helps writing more fluent expectations.
   * @example
   * fail.when(myval).is.not.a.number;
   */
  get is() {
    return this._is();
  }

  _does() {
    this._checkPreExpectation('does');
    return this;
  }

  /**
   * This doesn't affect behaviour but helps writing more fluent expectations.
   * @example
   * fail.when(myval).does.not.equal(3);
   */
  get does() {
    return this._does();
  }

  _not() {
    this._checkPreExpectation('not');
    this._failure = !this._failure;
    return this;
  }

  /**
   * Changes the failure condition. This can only be used once in a pass/fail
   * expression.
   * @example
   * fail.when(3).does.not.equal(4);
   */
  get not() {
    return this._not();
  }

  /**
   * @example
   * fail.when("Hello World").lowerCase.equals("hello world");
   */
  get lowerCase() {
    this._checkPreExpectation('lowerCase');
    this._value = this._value.toLowerCase();
    return this;
  }

  /**
   * @example
   * fail.when("Hello World").lowerCase.equals("HELLO WORLD");
   */
  get upperCase() {
    this._checkPreExpectation('upperCase');
    this._value = this._value.toUpperCase();
    return this;
  }

  /**
   * @example
   * fail.when("Hello   World").withoutWhitespace.to.equal("HelloWorld");
   */
  get withoutWhitespace() {
    this._checkPreExpectation('withoutWhitespace');
    this._value = this._value.replace(/\s+/g, '');
    return this;
  }

  /**
   * @example
   * fail.when("Hello\nWorld\n").withoutNewLines.not.equal("HelloWorld");
   */
  get withoutNewLines() {
    this._checkPreExpectation('withoutNewLines');
    this._value = this._value.replace(/\n/g, '');
    return this;
  }

  /**
   * @example
   * fail.when(myval).does.not.equal(13);
   */
  equal(value) {
    return this._setExpectation('equal', expectationType.equals, value);
  }

  /**
   * @example
   * fail.when(myval).equals(13);
   */
  equals(value) {
    return this._setExpectation('equals', expectationType.equals, value);
  }

  /**
   * @example
   * fail.when(item).does.not.contain("hello");
   */
  contain(value) {
    this._ensureString('contain', value);
    return this._setExpectation('contain', expectationType.contains, value);
  }

  /**
   * @example
   * fail.when(item).does.not.contain("hello");
   */
  contains(value) {
    this._ensureString('contains', value);
    return this._setExpectation('contains', expectationType.contains, value);
  }

  /**
   * @example
   * fail.when.css.editable(0).not.equivalent("hello");
   */
  equivalent(value) {
    this._ensure(
      this._called.codeType != 'default',
      'The "equivalent" term in a pass/fail expression can only be used if the "css" term is used.'
    );
    return this._setExpectation('equivalent', expectationType.equivalent, value);
  }

  /**
   * @example
   * fail.when(item).does.not.exist;
   */
  get exist() {
    return this._setExpectation('exist', expectationType.exists);
  }

  /**
   * @example
   * fail.when(myval).is.a.number;
   */
  get number() {
    return this._setExpectation('number', expectationType.isNumber);
  }

  /**
   * @example
   * fail.when(myval).is.a.date;
   */
  get date() {
    return this._setExpectation('date', expectationType.isDate);
  }

  /**
   * @example
   * fail.when(mybool).is.true;
   */
  get true() {
    return this._setExpectation('true', expectationType.isTrue);
  }

  /**
   * @example
   * fail.when(3.141).is.approximately(3, 0.2);
   * fail.when(3.141).not.is.approximately(3, 0.2);
   */
  approximately(value, tolerance) {
    this._approxTolerance = tolerance;
    return this._setExpectation('approximately', expectationType.equals, value);
  }

  /**
   * @example
   * fail.when(3).is.moreThan(2);
   */
  moreThan(value) {
    return this._setExpectation('moreThan', expectationType.greaterThan, value);
  }

  /**
   * @example
   * fail.when(3).is.greaterThan(2);
   */
  greaterThan(value) {
    return this._setExpectation('greaterThan', expectationType.greaterThan, value);
  }

  /**
   * @example
   * fail.when(3).is.lessThan(4);
   */
  lessThan(value) {
    return this._setExpectation('lessThan', expectationType.lessThan, value);
  }

  /**
   * @deprecated
   * @example
   * fail.when(this.step1).does.not.pass;
   */
  get pass() {
    throw "Use of 'pass' (e.g. fail.when(this.step3).does.not.pass) is deprecated.";
  }

  /**
   * @example
   * fail.when(value).is.equal.to(4).or(6);
   */
  or(value) {
    this._ensureWhenIfCalled('or');
    this._ensure(
      this._called.expectation,
      "The 'or()' function should be called after the expectation e.g. fail.when(v).equals(3).or(5)"
    );
    this._ensure(
      this._expectationType === expectationType.equals ||
      this._expectationType === expectationType.equivalent ||
      this._expectationType === expectationType.contains,
      "The 'or()' function can only be used with 'equals', 'equivalent' and 'contains'"
    );
    this._expectedValues.push(value);
    return this;
  }

  _setExpectation(target, type, value) {
    this._ensureWhenIfCalled(target);
    this._ensure(
      !this._called.expectation,
      'Only one expectation (e.g. "equals", "contains", "lessThan") should be used in a single fail expression.'
    );
    this._expectationType = type;
    this._expectedValues.push(value);
    this._called.expectation = true;
    return this;
  }

  _compareCss(value, result, opts = {}) {
    const expectedCss = new CssAst(value);
    
    if (expectedCss.messages.length > 0) {
      _(expectedCss.messages).each((l) => console.log(JSON.stringify(l)));
      throw new Error('Found errors in expected CSS.');
    } else {
      const valueCss = new CssAst(this._value, expectedCss.options);
      result.ok = valueCss.messages.length === 0;
      if (!result.ok) {
        result.errors = valueCss.messages;
      } else {
        const compareCss = new CssAstComparer(expectedCss.options);
        compareCss.compare(expectedCss, valueCss, opts);
        result.ok = compareCss.messages.length === 0;
        if (!result.ok) {
          result.errors = compareCss.messages;
        }
      }
    }
  }

  _compareHtml(value, result, opts = {}) {
    const expectedHtml = new HtmlAst(value);
    const valueHtml = new HtmlAst(this._value);
    const compareHtml = new HtmlAstComparer();

    if (expectedHtml.messages.length > 0) {
      _(expectedHtml.messages).each((l) => console.log(JSON.stringify(l)));
      throw 'Found errors in expected HTML.';
    }

    result.ok = valueHtml.messages.length == 0;
    if (!result.ok) {
      result.errors = valueHtml.messages;
    }

    if (expectedHtml.tree !== undefined && valueHtml.tree !== undefined) {
      compareHtml.compare(expectedHtml.tree.blocks, valueHtml.tree.blocks, opts);
      result.ok = compareHtml.messages.length == 0;
      if (!result.ok) {
        result.errors = compareHtml.messages;
      }
    }
  }

  _compareJs(value, result) {
    const expectedJs = new JsAst(value);
    const compareJs = new JsAstComparer();

    if (expectedJs.messages.length > 0) {
      _(expectedJs.messages).each((l) => console.log(JSON.stringify(l)));
      throw new Error('Found errors in expected JavaScript.');
    } else {
      const valueJs = new JsAst(this._value, expectedJs.autoCompleteMethod);
      result.ok = valueJs.messages.length === 0;
      if (!result.ok) {
        result.errors = valueJs.messages;
      } else {
        compareJs.compare(expectedJs.tokens, valueJs.tokens);
        result.ok = compareJs.messages.length === 0;
        if (!result.ok) {
          result.errors = compareJs.messages;
        }
      }     
    }
  }

  _evaluate() {
    return _.map(this._expectedValues, (value) => {
      const result = {
        ok: true,
      };

      switch (this._expectationType) {
        case expectationType.exists: {
          result.ok = (this._value !== undefined);
          break;
        }

        case expectationType.equals: {
          if (this._approxTolerance == null) {
            result.ok = (this._value === value);
          } else {
            const delta = Math.abs(value - this._value);
            result.ok = (delta <= this._approxTolerance);
          }
          break;
        }

        case expectationType.equivalent: {
          if (this._called.codeType == 'css') {
            this._compareCss(value, result);
          } else if (this._called.codeType == 'html') {
            this._compareHtml(value,result);
          } else if (this._called.codeType == 'js') {    // test JS
            this._compareJs(value, result);
          }
          break;
        }

        case expectationType.contains: {
          if (this._called.codeType == 'css') {
            this._compareCss(
              value,
              result, {
                allowExtraDeclarations: true,
                allowExtraSelectors: true,
              }
            );
          } else if (this._called.codeType == 'html') {
            this._compareHtml(
              value,
              result, {
                allowExtraTags: true,
              }
            );
          } else {
            result.ok = (this._value.indexOf(value) >= 0);
          }
          break;
        }

        case expectationType.isDate: {
          const date = new Date(this._value);
          result.ok = (!isNaN(date.getTime()));
          break;
        }

        case expectationType.isNumber: {
          result.ok = (!isNaN(this._value));
          break;
        }

        case expectationType.isTrue: {
          result.ok = (this._value === true);
          break;
        }

        case expectationType.greaterThan: {
          result.ok = (this._value > value);
          break;
        }

        case expectationType.lessThan: {
          result.ok = (this._value < value);
          break;
        }
      }

      return result;
    });
  }

  _getValueString() {
    // Abbreviate the value if necessary.
    let v;
    if (this._value == null) {
      v = this._value;
    } else {
      v = this._value.toString();
      if (v.length > 50) {
        v = v.substr(0, 49) + '...';
      }
    }

    return v;
  }

  verifyExpectation() {
    let msg = null;

    if (this._expectationType == null) {
      const result = !!this._value;
      if (result == this._failure) {
        const v = this._getValueString();
        msg = `Expected '${v}' to be `;
        if (this._failure) {
          msg += 'true';
        } else {
          msg += 'false';
        }
        this._testMessageManager.debug(msg);
        this._testMessageManager.useDefault();
        return false;
      }
    } else {
      const results = this._evaluate();
      const orResult = _.reduce(results, (orResult, r) => orResult || r.ok, false);
      if (orResult == this._failure) {
        const v = this._getValueString();

        // Build the failure message.
        msg = `Expected '${v}' to`;
        if (this._failure) {
          msg += ' not';
        }
        msg += ' ' + this._expectationType;
        switch (this._expectationType) {
          case expectationType.equals:
          case expectationType.equivalent:
          case expectationType.contains:
          case expectationType.greaterThan:
          case expectationType.lessThan: {
            const values = _.map(this._expectedValues, v => `'${v}'`);
            msg += ' ' + _.join(values, ' or ');
            break;
          }
        }

        this._testMessageManager.debug(msg);

        if (this._failMessage != null) {
          this._testMessageManager.use(this._failMessage);
        } else {
          const errors = _(results) // start with results from all clauses
            .filter(r => r.errors)  // only take results with errors
            .map(r => r.errors)     // extract only the errors
            .flatten()              // flatten arrays down to a single array
            .map(r => r.message)    // extract only the message from each error
            .uniq()                 // remove duplicates
            .join('\n');            // join all messages together
          if (errors.length > 0) {
            this._testMessageManager.use(errors);
          } else {
            this._testMessageManager.useDefault();
          }
        }

        return false;
      }
    }

    return true;
  }

  _isFuncNameMatched(scriptName, funcIndex, funcName) {
    const regex = new RegExp(`^(${scriptName}\/|)(${funcIndex}|${funcName})$`);
    return regex.test(this._onFuncString);
  }

  // Verify live expectation everytime functionEnd() in learner's script is invoked.
  // If the script and function name is matched it will try to evaluate the evaluating string
  // and return the result of evaluation, otherwise it will be marked as skipped.
  verifyLiveExpectation(scriptName, funcIndex, funcName, variables) {
    const isInvoked = this._isFuncNameMatched(scriptName, funcIndex, funcName);

    let result, skipped, error;
    if (isInvoked) {
      try {
        result = (this._evalString === null) || evalInContext(variables, this._evalString);

        if (this._failMessage) {
          this._testMessageManager.use(this._failMessage);
        } else {
          this._testMessageManager.useDefault();
        }
      } catch (e) {
        const errorMessage = 'An error occured while evaluating live objective.';
        this._testMessageManager.use(errorMessage);
        error = e;
      }
    } else {
      skipped = true;
    }
    return {result, skipped, error};
  }
}

export default StepExpectation;
