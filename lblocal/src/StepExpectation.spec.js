import StepExpectation from './StepExpectation';
import {AUTO_ADDED_SELECTOR} from './CssAst';

const code = {
  css: {
    text: 'h1 { color: red;\n border: 1px; }',
    editable: [
      'h1 { color: red; }',
      'h1 { color: red;\n border: 1px; }',
      'border: 1px solid red;\n margin: 2px;',
      'h1 {color: blue;} h2 {color: green;}',
      'text-align: center;',
    ],
  },
  html: {
    text: '<div><p class="A">DDD</p></div>',
    editable: [
      '<h1>LLL</h1>',
      '<h1 id="Y">LLL</h1>',
      '<div><p class="A">text</p></div>',
    ],
  },
  js: {
    text: 'var button = document.getELementById("btnPlay");',
    editable: [
      'var health = 99;',
      'switch (element.value)',
      'function sayHello() {}',
    ],
  },
};
let debugMessage = null;
const testMessageManager = {
  use: () => {},
  debug: (msg) => { debugMessage = msg; },
  setDefault: () => {},
  useDefault: () => {},
};

let activeExpectation = null;
function verify(ignore, expectOK) {
  if (activeExpectation) {
    const ok = activeExpectation.verifyExpectation();
    if (ok != expectOK) {
      console.log(debugMessage);
    }
    if (debugMessage) {
      expect(debugMessage).not.toContain(AUTO_ADDED_SELECTOR);
    }
    expect(ok).toEqual(expectOK);
    activeExpectation = null;
  }
}

let consoleError;
function disableConsoleError() {
  consoleError = console.error;
  console.error = () => {};
}

function restoreConsoleError() {
  console.error = consoleError;
}

function verifyLiveExpectation(params, expectOK, expectSkipped, expectError = false) {
  if (activeExpectation) {
    const {result, error, skipped} = activeExpectation.verifyLiveExpectation(...params);
    let ok = result;
    if (activeExpectation.failure) {
      ok = !ok;
    }
    expect(ok).toEqual(expectOK);
    expect(skipped).toEqual(expectSkipped);
    if (expectError) {
      expect(error).toBeTruthy();
    } else {
      expect(error).toBeFalsy();
    }
    activeExpectation = null;
  }
}

function expectationCreated(expectation) {
  if (activeExpectation) {
    throw 'Expected only one StepExpectation to be created per test.';
  }
  activeExpectation = expectation;
}

describe('StepExpectation', function() {
  let fail = StepExpectation.fail(expectationCreated, code, testMessageManager);
  let pass = StepExpectation.pass(expectationCreated, code, testMessageManager);

  beforeEach(function() {
    debugMessage = null;
    activeExpectation = null;
  });

  it('fail().when() PASS', () => {
    fail('oops').when(false);
    verify(fail, true);
  });

  it('fail().when() FAIL', () => {
    fail('oops').when(true);
    verify(fail, false);
  });

  it('pass().when() PASS', () => {
    pass('oops').when(true);
    verify(pass, true);
  });

  it('pass().when() FAIL', () => {
    pass('oops').when(false);
    verify(pass, false);
  });

  it('fail.when() PASS', () => {
    fail.when(false);
    verify(fail, true);
  });

  it('fail.when(true) FAIL', () => {
    fail.when(true);
    verify(fail, false);
  });

  it('pass.when(true) PASS', () => {
    pass.when(true);
    verify(pass, true);
  });

  it('pass.when(false) FAIL', () => {
    pass.when(false);
    verify(pass, false);
  });

  it('fail.when().equals() PASS', () => {
    fail.when(3).equals(4);
    verify(fail, true);
  });

  it('fail.when().equal() FAIL', () => {
    fail.when(4).equal(4);
    verify(fail, false);
  });

  it('fail.when().not.equal() PASS', () => {
    fail.when(4).not.equal(4);
    verify(fail, true);
  });

  it('fail.when().not.equal() FAIL', () => {
    fail.when(3).not.equal(4);
    verify(fail, false);
  });

  it('fail.when().equal.to() PASS', () => {
    fail.when(3).equal.to(4);
    verify(fail, true);
  });

  it('fail.when().equal.to() FAIL', () => {
    fail.when(3).equal.to(3);
    verify(fail, false);
  });

  it('fail.if().equals() PASS', () => {
    fail.if(3).equals(4);
    verify(fail, true);
  });

  it('fail.if().equal() FAIL', () => {
    fail.if(4).equal(4);
    verify(fail, false);
  });

  it('fail.when().exist PASS', () => {
    fail.when(undefined).exist;
    verify(fail, true);
  });

  it('fail.when().exist FAIL', () => {
    fail.when(3).exist;
    verify(fail, false);
  });

  it('fail.when().not.exist PASS', () => {
    fail.when('s').not.exist;
    verify(fail, true);
  });

  it('fail.when().not.exist FAIL', () => {
    fail.when(undefined).not.exist;
    verify(fail, false);
  });

  it('fail.when(2).is.not.a.number PASS', () => {
    fail.when(2).is.not.a.number;
    verify(fail, true);
  });

  it('fail.when("2").is.not.a.number PASS', () => {
    fail.when('2').is.not.a.number;
    verify(fail, true);
  });

  it('fail.when("2x").is.not.a.number FAIL', () => {
    fail.when('2x').is.not.a.number;
    verify(fail, false);
  });

  it('fail.when(d).is.not.a.date PASS for valid date instance', () => {
    const d = new Date('2014-10-12');
    fail.when(d).is.not.a.date;
    verify(fail, true);
  });

  it('fail.when().is.not.a.date FAIL for non-date instance', () => {
    const d = new Date("Natasha's birthday");
    fail.when(d).is.not.a.date;
    verify(fail, false);
  });

  it('fail.when(false).is.true PASS', () => {
    fail.when(false).is.true;
    verify(fail, true);
  });

  it('fail.when(12).is.not.true FAIL', () => {
    fail.when(12).is.not.true;
    verify(fail, false);
  });

  it('fail.when("yes").is.not.true FAIL', () => {
    fail.when('yes').is.not.true;
    verify(fail, false);
  });

  it('fail.when().contains() PASS', () => {
    fail.when('hello world').contains('Hello');
    verify(fail, true);
  });

  it('fail.when().lowerCase.contains() PASS', () => {
    fail.when('Hello World').lowerCase.contains('Hello');
    verify(fail, true);
  });

  it('fail.when().lowerCase.contains() FAIL', () => {
    fail.when('Hello World').lowerCase.contains('world');
    verify(fail, false);
  });

  it('fail.when().upperCase.contains() PASS', () => {
    fail.when('Hello World').upperCase.contains('Hello');
    verify(fail, true);
  });

  it('fail.when().upperCase.contains() FAIL', () => {
    fail.when('Hello World').upperCase.contains('WORLD');
    verify(fail, false);
  });

  it('fail.when().withoutWhitespace.contains() FAIL', () => {
    fail.when('hello \n \t world').withoutWhitespace.contains('helloworld');
    verify(fail, false);
  });

  it('fail.when().withoutWhitespace.contains() FAIL', () => {
    fail.when('hello world').withoutWhitespace.contains('helloworld');
    verify(fail, false);
  });

  it('fail.when().withoutNewLines.equals() PASS', () => {
    fail.when('\nhello  \n world\n\n').withoutNewLines.equals('helloworld');
    verify(fail, true);
  });

  it('fail.when().withoutNewLines.equals() FAIL', () => {
    fail.when('\nhello  \n world\n\n').withoutNewLines.equals('hello   world');
    verify(fail, false);
  });

  it('fail.when().is.approximately() PASS', () => {
    fail.when(3.14).is.approximately(3, 0.1);
    verify(fail, true);
  });

  it('fail.when().is.approximately() FAIL', () => {
    fail.when(3.14).is.approximately(3, 0.2);
    verify(fail, false);
  });

  it('fail.when().is.greaterThan() PASS', () => {
    fail.when(3.14).is.greaterThan(4);
    verify(fail, true);
  });

  it('fail.when().is.greaterThan() FAIL', () => {
    fail.when(3.14).is.greaterThan(3);
    verify(fail, false);
  });

  it('fail.when().is.not.greaterThan() PASS', () => {
    fail.when(3.14).is.not.greaterThan(3);
    verify(fail, true);
  });

  it('fail.when().is.lessThan() PASS', () => {
    fail.when(3.14).is.lessThan(3);
    verify(fail, true);
  });

  it('fail.when().is.lessThan() FAIL', () => {
    fail.when(3.14).is.lessThan(4);
    verify(fail, false);
  });

  it('fail.when().is.not.lessThan() PASS', () => {
    fail.when(3.14).is.not.lessThan(4);
    verify(fail, true);
  });

  it('fail.when().equals().or() PASS', () => {
    fail.when(3).equals(4).or(5);
    verify(fail, true);
  });

  it('fail.when().equals().or() FAIL', () => {
    fail.when(3).equals(3).or(5);
    verify(fail, false);
  });

  it('fail.when().equals().or().or().or() FAIL', () => {
    fail.when(3).equals(4).or(6).or(3).or(4);
    verify(fail, false);
  });

  it('fail.when().equals().or().or().or() FAIL', () => {
    fail.when(3).equals(4).or(6).or(3).or(4);
    verify(fail, false);
  });

  it('fail.when().contains().or() PASS', () => {
    fail.when('hello world').contains('foo').or('bar');
    verify(fail, true);
  });

  it('fail.when().contains().or() FAIL', () => {
    fail.when('hello world').contains('foo').or('lo w');
    verify(fail, false);
  });

  it('fail.when.css().is.equivalent() PASS', () => {
    fail.when.css('h1 { color: red; }').is.equivalent('h1{color: blue} ');
    verify(fail, true);
  });

  it('fail.when.css().is.not.equivalent() PASS', () => {
    fail.when.css('h1 { color: red; }').is.not.equivalent('h1{color:   red} ');
    verify(fail, true);
  });

  it('fail.when.css().is.equivalent() FAIL', () => {
    fail.when.css('h1 { color: red; }').is.equivalent('h1{color:   red} ');
    verify(fail, false);
  });

  it('fail.when.css().is.equivalent.to() FAIL', () => {
    fail.when.css('h1 { color: red; }').is.equivalent.to('h1{color:   red} ');
    verify(fail, false);
  });

  it('fail.if.css().is.not.equivalent() FAIL', () => {
    fail.if.css('h1 { color: red; }').is.not.equivalent('h1{color: green} ');
    verify(fail, false);
  });

  it('fail.if.css().is.not.equivalent.to() FAIL', () => {
    fail.if.css('h1 { color: red; }').is.not.equivalent.to('h1{color: green} ');
    verify(fail, false);
  });

  it('fail.when.css().is.not.equivalent.to() PASS', () => {
    fail.when.css('h1 { color: red; }').is.not.equivalent.to('h1{color:   red} ');
    verify(fail, true);
  });

  it('fail.when.css().is.not.equivalent.to().or() PASS', () => {
    fail.when.css('div { border: 1px solid red; }').is.not.equivalent
      .to('div{border: 1px  solid red}')
      .or('div{border-width: 1px; border-style: solid; border-color: red}');
    verify(fail, true);
  });

  it('pass.if.css().contains("selectors") PASS', () => {
    pass.if.css('h1 {color: red;} h3 {color: green;}').contains('h1 {}');
    verify(pass, true);
  });

  it('pass.if.css().contains("selectors") FAIL', () => {
    pass.if.css('h1 {color: red;} h3 {color: green;}').contains('h2 {}');
    verify(pass, false);
  });

  it('pass.if.css().contains("declarations") PASS', () => {
    pass.if.css('h1 {color: red; border: 1px;}').contains('h1{border:1px}');
    verify(pass, true);
  });

  it('pass.if.css().contains("declarations") FAIL', () => {
    pass.if.css('h1 {color: red; border: 1px}').contains('h1{border:none}');
    verify(pass, false);
  });

  it('fail.when.css.editable().is.not.equivalent.to() PASS', () => {
    fail.when.css.editable(0).is.not.equivalent.to('h1{color:  red} ');
    verify(fail, true);
  });

  it('fail.when.css.editable().is.not.equivalent.to() FAIL', () => {
    fail.when.css.editable(0).is.not.equivalent.to('h1{color: purple} ');
    verify(fail, false);
  });

  it('fail.when.css.editable().contains() PASS', () => {
    fail.when.css.editable(1).contains('h1{border: 3px} ');
    verify(fail, true);
  });

  it('fail.when.css.editable().contains() FAIL', () => {
    fail.when.css.editable(1).contains('h1{border: 1px} ');
    verify(fail, false);
  });

  it('fail.when.css.editable().contains("declarations") PASS', () => {
    fail.when.css.editable(2).not.contains('margin:2px;');
    verify(fail, true);
  });

  it('fail.when.css.editable().contains("declarations") FAIL', () => {
    fail.when.css.editable(2).contains('margin:2px;');
    verify(fail, false);
  });

  it('pass.if.css.contains() PASS', () => {
    pass.if.css.contains('h1{border:1px}');
    verify(pass, true);
  });

  it('pass.if.css.contains() FAIL', () => {
    pass.if.css.contains('h1{border:2px}');
    verify(pass, false);
  });

  it('pass.if.css.equivalent.to() PASS', () => {
    pass.if.css.equivalent.to('h1{color:red; border:1px}');
    verify(pass, true);
  });

  it('pass.if.css.equivalent.to() FAIL', () => {
    pass.if.css.equivalent.to('h1{color:green; border:1px}');
    verify(pass, false);
  });

  it('pass.if.css.is.equivalent.to() PASS', () => {
    pass.if.css.is.equivalent.to('h1{color:red; border:1px}');
    verify(pass, true);
  });

  it('pass.if.css.is.equivalent.to() FAIL', () => {
    pass.if.css.is.equivalent.to('h1{color:green; border:1px}');
    verify(pass, false);
  });

  it('fail.if.css.is.not.equivalent.to() PASS', () => {
    fail.if.css.is.not.equivalent.to('h1{color:red; border:1px}');
    verify(fail, true);
  });

  it('fail.if.css.is.not.equivalent.to() FAIL', () => {
    fail.if.css.is.not.equivalent.to('h1{color:green; border:1px}');
    verify(fail, false);
  });
  
  it('fail.when.css.editable(2).is.equivalent.to(\'\') PASS', () => {
    fail.when.css.editable(2).is.equivalent.to(' ');
    verify(fail, true);
  });
  
  it('pass.if.css.editable(0).is.not.equivalent.to(\'\') PASS', () => {
    pass.if.css.editable(0).is.not.equivalent.to('');
    verify(pass, true);
  });
    
  it("fail.when.css('h1 { color:red; } }').is.equivalent.to('h1 { color:red; }') PASS", () => {
    fail.when.css('h1 { color:red; } }').is.equivalent.to('h1 { color:red; }');
    verify(fail, true);
  });
  
  it("pass.if.css('h1 { color:red; } }').is.equivalent.to('h1 { color:red; }') FAIL", () => {
    pass.if.css('h1 { color:red; } }').is.equivalent.to('h1 { color:red; }');
    verify(pass, false);
  });

  it('pass.if.html().is.equivalent() PASS', () => {
    pass.if.html('<div>PPP</div>').is.equivalent('<div>##ANY##</div>');
    verify(pass, true);
  });

  it('pass.if.html().is.equivalent() FAIL', () => {
    pass.if.html('<div>QQQ</div>').is.equivalent('<div>##ANY(PPP; LLL)##</div>');
    verify(pass, false);
  });

  it('pass.if.html().is.equivalent() FAIL', () => {
    pass.if.html('<div>PPP</div>').is.equivalent('<div>##NOT(PPP)##</div>');
    verify(pass, false);
  });

  it('pass.if.html().is.equivalent() PASS', () => {
    pass.if.html('<div>XXX</div>').is.equivalent('<div>##NOT(PPP)##</div>');
    verify(pass, true);
  });

  it('pass.if.html().is.equivalent() PASS', () => {
    pass.if.html('<div class="A">XXX</div>').is.equivalent('<div class="A">XXX</div>');
    verify(pass, true);
  });

  it('pass.if.html().is.equivalent() FAIL', () => {
    pass.if.html('<div class="A">XXX</div>').is.equivalent('<div class="B">XXX</div>');
    verify(pass, false);
  });

  it('pass.if.html().is.equivalent() FAIL', () => {
    pass.if.html('<div class="A" id="D">XXX</div>').is.equivalent('<div class="C" id="Q">XXX</div>');
    verify(pass, false);
  });

  it('pass.if.html().is.equivalent() PASS', () => {
    pass.if.html('<div class="OOO">XXX</div>').is.equivalent('<div class="##ANY(MMM; OOO)##">XXX</div>');
    verify(pass, true);
  });

  it('fail.if.html().is.not.equivalent() FAIL', () => {
    fail.if.html('<div>DDD</div>').is.not.equivalent('<p>PPP</p>');
    verify(fail, false);
  });

  it('fail.if.html().is.not.equivalent() FAIL', () => {
    fail.if.html('<div>PPP</div>').is.not.equivalent('<div>##NOT(PPP)##</div>');
    verify(fail, false);
  });

  it('fail.when.html().is.equivalent() PASS', () => {
    fail.when.html('<div>DDDD</div>').is.equivalent('<p>DDDD</p>');
    verify(fail, true);
  });

  it('fail.when.html().is.not.equivalent() PASS', () => {
    fail.when.html('<p>PPP</p>').is.not.equivalent('<p>PPP      </p>');
    verify(fail, true);
  });

  it('fail.when.html().is.equivalent() FAIL', () => {
    fail.when.html('<p>PPP</p>').is.equivalent('<p>      PPP</p>');
    verify(fail, false);
  });

  it('fail.when.html().is.not.equivalent.to().or() PASS', () => {
    fail.when.html('<div>DDD</div>').is.not.equivalent
      .to('<div>DDD</div>')
      .or('<div>DDD<p>PPP </P></div>');
    verify(fail, true);
  });

  it('pass.if.html.is.equivalent.to() FAIL', () => {
    pass.if.html.is.equivalent.to('<div><p class="D">YYY</p></div>');
    verify(pass, false);
  });

  it('fail.if.html.is.not.equivalent.to() PASS', () => {
    fail.if.html.is.not.equivalent.to('<div><p class="A">DDD</p></div>');
    verify(pass, true);
  });

  it('fail.when.html.editable().is.not.equivalent.to() PASS', () => {
    fail.when.html.editable(0).is.not.equivalent.to('<h1>LLL</h1>');
    verify(fail, true);
  });

  it('fail.when.html.editable().is.not.equivalent.to() FAIL', () => {
    fail.when.html.editable(0).is.not.equivalent.to('<h1 id="T">LLL</h1>');
    verify(fail, false);
  });

  it('fail.when.html.editable().contains() PASS', () => {
    fail.when.html.editable(1).contains(' <h1 >LLL</h1> ');
    verify(fail, true);
  });

  it('fail.when.html.editable().contains() FAIL', () => {
    fail.when.html.editable(1).contains(' <h1 id="Y">LLL</h1> ');
    verify(fail, false);
  });

  it('fail.when.html.editable().contains("text") PASS', () => {
    fail.when.html.editable(2).not.contains('text');
    verify(fail, true);
  });
  // ======================================================================================= start of JavaScript tests
  it('PASS pass.if.js.editable().equivalent()', () => {
    pass.if.js.editable(0).equivalent('var health = 99;');
    verify(pass, true);
  });

  it('PASS pass.if.js.editable().equivalent.to()', () => {
    pass.if.js.editable(0).equivalent.to('var health = 99;');
    verify(pass, true);
  });

  it('PASS pass.if.js.editable().is.equivalent()', () => {
    pass.if.js.editable(0).is.equivalent('var health = 99;');
    verify(pass, true);
  });

  it('PASS pass.if.js.editable().is.equivalent.to()', () => {
    pass.if.js.editable(0).is.equivalent.to('var health = 99;');
    verify(pass, true);
  });

  it('PASS pass.if.js.editable().is.not.equivalent()', () => {
    pass.if.js.editable(0).is.not.equivalent('var health = 0;');
    verify(pass, true);
  });

  it('PASS pass.if.js.editable().not.equivalent.to()', () => {
    pass.if.js.editable(0).not.equivalent.to('var health = 0;');
    verify(pass, true);
  });

  it('PASS fail.if.js.editable().equivalent()', () => {
    fail.if.js.editable(2).equivalent('box.style.backgroundColor = "red";');
    verify(fail, true);
  });

  it('PASS pass.if.js.editable().equivalent()', () => {
    pass.if.js.editable(1).equivalent('switch(element.value)');
    verify(pass, true);
  });

  it('PASS pass.if.js().equivalent()', () => {
    pass.if.js('console.log("hello world");').equivalent("console.log('hello world');");
    verify(pass, true);
  });
  
  it('PASS pass.if.js.editable(n).equivalent("Partial Syntax");', () => {
    code.js.editable[3] = 'if(true)';
    pass.if.js.editable(3).equivalent('if (true)');
    verify(pass, true);
  });

  it('PASS pass.if.js.editable(n).equivalent("web link in string");', () => {
    code.js.editable[3] = "game.load.image('player','https://static.comicvine.com/uploads/original/4/46646/3412398-0163325335-Megam.gif');";
    pass.if.js.editable(3).equivalent("game.load.image('player','https://static.comicvine.com/uploads/original/4/46646/3412398-0163325335-Megam.gif');");
    verify(pass, true);
  });

  it('PASS pass.if.js.editable(n).equivalent("MarkupString");', () => {
    code.js.editable[3] = 'var greeting = "hello there";';
    pass.if.js.editable(3).equivalent('var greeting = ##STRING##;');
    verify(pass, true);
  });

  it('PASS pass.if.js.editable(n).equivalent("MarkupNumeric");', () => {
    code.js.editable[3] = 'var num = 3 + 10;';
    pass.if.js.editable(3).equivalent('var num = ##NUMBER## + ##NUMBER##;');
    verify(pass, true);
  });
  
  // === end of passes

  it('FAIL pass.if.js.editable(n).equivalent("MarkupString");', () => {
    code.js.editable[3] = 'var greeting = hello;';
    pass.if.js.editable(3).equivalent('var greeting = ##STRING##;');
    verify(pass, false);
  });

  it('FAIL pass.if.js.editable(n).equivalent("MarkupNumeric");', () => {
    code.js.editable[3] = 'var num = 3 + ten;';
    pass.if.js.editable(3).equivalent('var num = ##NUMBER## + ##NUMBER##;');
    verify(pass, false);
  });

  it('FAIL pass.if.js.editable().equivalent()', () => {
    pass.if.js.editable(0).equivalent('var health = 100;');
    verify(pass, false);
  });

  it('FAIL pass.if.js.editable().equivalent.to()', () => {
    pass.if.js.editable(0).equivalent.to('var health = 100;');
    verify(pass, false);
  });

  it('FAIL pass.if.js.editable().is.equivalent()', () => {
    pass.if.js.editable(0).is.equivalent('var health = 100;');
    verify(pass, false);
  });

  it('FAIL pass.if.js.editable().is.equivalent.to()', () => {
    pass.if.js.editable(0).is.equivalent.to('var health = 100;');
    verify(pass, false);
  });

  it('FAIL pass.if.js.editable().is.not.equivalent()', () => {
    pass.if.js.editable(0).is.not.equivalent('var health = 99;');
    verify(pass, false);
  });

  it('FAIL pass.if.js.editable().not.equivalent.to()', () => {
    pass.if.js.editable(0).not.equivalent.to('var health = 99;');
    verify(pass, false);
  });

  it('FAIL fail.if.js.editable().equivalent()', () => {
    fail.if.js.editable(2).equivalent('function sayHello() {}');
    verify(fail, false);
  });

  it('FAIL pass.if.js.editable().equivalent()', () => {
    pass.if.js.editable(1).equivalent('switch(element.value.trim())');
    verify(pass, false);
  });  

  it('FAIL pass.if.js().equivalent()', () => {
    pass.if.js('console.log(str);').equivalent("console.log('hello world');");
    verify(pass, false);
  });
  
  it('FAIL pass.if.js.editable(n).equivalent("Partial Syntax");', () => {
    code.js.editable[3] = 'if(true) {}';
    pass.if.js.editable(3).equivalent('if (true)');
    verify(pass, false);
  });

  describe('Live expectations', () => {
    it("PASS pass.on.js('foo')", () => {
      pass.on.js('foo');
      verifyLiveExpectation(['script.js', '0', 'foo'], true);
    });

    it("FAIL fail.on.js('foo')", () => {
      fail.on.js('foo');
      verifyLiveExpectation(['script.js', '0', 'foo'], false);
    });

    it("SKIP pass.on.js('foo') when function name does not match", () => {
      pass.on.js('foo');
      verifyLiveExpectation(['script.js', '0', 'bar'], undefined, true);
    });

    it("SKIP pass.on.js('script.js/foo') when script name does not match", () => {
      pass.on.js('script.js/foo');
      verifyLiveExpectation(['hello.js', '0', 'foo'], undefined, true);
    });

    it("PASS pass.on.js('foo') when invoked from another script", () => {
      pass.on.js('foo');
      verifyLiveExpectation(['hello.js', '0', 'foo'], true);
    });

    it("PASS pass.on.js('0')", () => {
      pass.on.js('0');
      verifyLiveExpectation(['script.js', '0', 'f1'], true);
    });

    it("PASS pass.on.js('script.js/0')", () => {
      pass.on.js('script.js/0');
      verifyLiveExpectation(['script.js', '0', 'f1'], true);
    });

    it("PASS pass.on.js('foo').var('count === 1')", () => {
      pass.on.js('foo').var('count === 1');
      verifyLiveExpectation(['script.js', '0', 'foo', {count: 1}], true);
    });

    it("FAIL fail.on.js('foo').var('count === 1')", () => {
      fail.on.js('foo').var('count === 1');
      verifyLiveExpectation(['script.js', '0', 'foo', {count: 1}], false);
    });

    it("FAIL pass.on.js('foo').var('count === 1') when value is not correct", () => {
      pass.on.js('foo').var('count === 1');
      verifyLiveExpectation(['script.js', '0', 'foo', {count: 2}], false);
    });

    it("PASS fail.on.js('foo').var('count === 1') when value is not correct", () => {
      fail.on.js('foo').var('count === 1');
      verifyLiveExpectation(['script.js', '0', 'foo', {count: 2}], true);
    });

    it("SKIP pass.on.js('foo').var('count === 1') when function name does not match", () => {
      pass.on.js('foo').var('count === 1');
      verifyLiveExpectation(['script.js', '0', 'bar', {count: 1}], undefined, true);
    });

    it("ERROR pass.on.js('foo').var('count === 1') when count is not defined", () => {
      pass.on.js('foo').var('count === 1');
      disableConsoleError();
      verifyLiveExpectation(['script.js', '0', 'foo', {}], undefined, undefined, true);
      restoreConsoleError();
    });

    it(`PASS pass.on.js('foo').var('str === "hello world"')`, () => {
      pass.on.js('foo').var('str === "hello world"');
      verifyLiveExpectation(['script.js', '0', 'foo', {str: 'hello world'}], true);
    });

    it(`FAIL pass.on.js('foo').var('str === "hello world"') when value is not correct`, () => {
      pass.on.js('foo').var('str === "hello world"');
      verifyLiveExpectation(['script.js', '0', 'foo', {str: 'hello world 2'}], false);
    });

    it(`PASS pass.on.js('foo').var('count === 1 && str === "hello world"')`, () => {
      pass.on.js('foo').var('count === 1 && str === "hello world"');
      verifyLiveExpectation(['script.js', '0', 'foo', {count: 1, str: 'hello world'}], true);
    });
  });
});