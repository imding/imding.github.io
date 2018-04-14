import expect from 'expect';
import JsAst from './JsAst';

describe('JsAstTest', function(){
  it('pass when program is valid', () => {
    const code = 'var answer = 42;';
    verify(code);
  });

  it('pass when program contains abnormal but valid spaces', () => {
    const code = 'var   answer=   42 ;';
    verify(code);
  });

  it('pass when program contains function', () => {
    const code = 'function f() {}';
    verify(code);
  });

  it('pass when program contains ##STRING##', () => {
    const code = 'console.log(##STRING##);';
    verify(code);
  });

  it('pass when program contains ##STRING(COLOR)##', () => {
    const code = 'console.log(##STRING(COLOR)##);';
    verify(code);
  });

  it('pass when program contains ##STRING(RGB;HEX)##', () => {
    const code = 'console.log(##STRING(RGB;HEX)##);';
    verify(code);
  });

  it('fail when program contains invalid letter cases', () => {
    const code = 'Var answer = 42;';
    verify(code, [{
      type: 'error',
      message: 'There is a typo in your code: Var answer',
      position: 4,
    }]);
  });

  it('fail when program contains illegal symbols', () => {
    const code = 'var an&wer = 42;';
    verify(code, [{
      type: 'error',
      message: 'an&wer is not the correct way to use the token &',
      position: 6,
    }]);
  });

  it('fail when program contains illegal spaces', () => {
    const code = 'var an swer = 42;';
    verify(code, [{
      type: 'error',
      message: 'There is a typo in your code: an swer',
      position: 7,
    }]);
  });

  it('fail when program contains invalid operators', () => {
    const code = 'var answer ?= 42';
    verify(code, [{
      type: 'error',
      message: 'answer ?= is not the correct way to use the token ?',
      position: 11,
    }]);
  });

  it('fail when program lacks parens', () => {
    const code = 'function funcName {}';
    verify(code, [{
      type: 'error',
      message: "Don't forget the parentheses (round brackets) when declaring a new function.",
      position: 17,
    }]);
  });

  it('fail when program lacks braces', () => {
    const code = 'function funcName() num++;';
    verify(code, [{
      type: 'error',
      message: "Don't forget the braces (curly brackets) when declaring a new function.",
      position: 19,
    }]);
  });

  it('fail when program contains invalid function name', () => {
    const code = 'function do() {}';
    verify(code, [{
      type: 'error',
      message: 'The keyword "do" can not be used as a variable or function name.',
      position: 9,
    }]);
  });

  it('fail when program contains invalid number placement', () => {
    const code = 'function f(2) {}';
    verify(code, [{
      type: 'error',
      message: 'The number 2 is in the wrong place.',
      position: 11,
    }]);
  });

  it('fail when program ends with invalid character', () => {
    const code = 'function f() {}-';
    verify(code, [{
      type: 'error',
      message: "Your code shouldn't end with -",
      position: 16,
    }]);
  });

  it('fail when program ends with invalid character followed by semi-colon', () => {
    const code = 'var num = 42 +  ;';
    verify(code, [{
      type: 'error',
      message: "Your code shouldn't end with +  ;",
      position: 16,
    }]);
  });

  it('fail when program contains invalid regular expression', () => {
    const code = 'button.style.width = /12px;';
    verify(code, [{
      type: 'error',
      message: 'Incorrect use of the token /',
      position: code.length,
    }]);
  });

  it('fail when program contains invalid regular expression ( multiple forward slahses )', () => {
    const code = 'match = /\w+/.test("string") ? /true : false;';
    verify(code, [{
      type: 'error',
      message: '/w+/.test("string") ? / contains incorrect use of the token /',
      position: code.length,
    }]);
  });

  it('fail when program contains invalid assignment expression', () => {
    const code = 'newPlayer() = "John";';
    verify(code, [{
      type: 'error',
      message: 'newPlayer() is incorrect. Please read the instructions again.',
      position: 11,   // this position points to the end of the issue. i.e. after newPlayer()
    }]);
  });

  it('fail when program contains invalid semi-colon placement', () => {
    const code = 'iniProgram(;)';
    verify(code, [{
      type: 'error',
      message: 'Semi-colon is in the wrong place. Did you mean to put it at the end of the line?',
      position: 11,
    }]);
  });

  it('fail when program contains invalid string placement', () => {
    const code = 'var "Hello" = "World";';
    verify(code, [{
      type: 'error',
      message: 'The string "Hello" is in the wrong place.',
      position: 4,
    }]);
  });

  it('fail when program contains invalid bracket placement', () => {
    const code = 'function name([) { return Math.random({)]) }';
    verify(code, [{
      type: 'error',
      message: 'Make sure the brackets in your code are properly paired.',
      position: 14,
    }]);
  });

  it('fail when program contains invalid variable name', () => {
    const code = 'var for = 4';
    verify(code, [{
      type: 'error',
      message: 'The keyword "for" can not be used as a variable or function name.',
      position: 4,
    }]);
  });

  it('fail when keyword is used incorrectly', () => {
    const code = 'var function = 4';
    verify(code, [{
      type: 'error',
      message: 'The keyword function can not be used as a variable name.',
      position: 4,
    }]);
  });

  it('pass when program contains string with different but valid quotes', () => {
    const code = `var player = ["player1", 'player2'];`;   // eslint-disable-line quotes
    verify(code);
  });

  it('pass when program contains multiple statements', () => {
    const code = `var num = 42; num++; elem.style.width = num * 2 + 'px';`;   // eslint-disable-line quotes
    verify(code);
  });

  it('pass when program contains partial syntax', () => {
    const code = 'for (i=0; i<3; i++)';
    verify(code, [], 'addBraces');
  });

  it('fail when program contains string of semi-colons', () => {
    const code = 'i++;;;';
    verify(code, [{
      type: 'error',
      message: 'Please remove repeated semi-colons in your code.',
      // the position points to the first semi-colon rather than the first of the unecessary ones
      position: 3,
    }]);
  });
});

function verify(code, messages = [], opts) {
  const results = new JsAst(code, opts);  //console.log(results.messages);
  expect(results.messages.length).toEqual(messages.length);
  const actualMsg = results.messages;
  for (let msg in actualMsg) {
    expect(actualMsg[msg].type).toEqual(messages[msg].type);
    expect(actualMsg[msg].message).toEqual(messages[msg].message);
    expect(actualMsg[msg].position).toEqual(messages[msg].position);
  }  
}