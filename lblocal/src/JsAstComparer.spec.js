import expect from 'expect';
import JsAst from './JsAst';
import JsAstComparer from './JsAstComparer';

describe('JsAstComparerTest', function() {
  it('pass when tokens match', () => {
    const t = 'var num = 42;';
    const l = '  var   num=42; ';
    verify(t, l);
  });

  it('pass when program contains string with different but valid quotes', () => {
    const t = "var player = ['player1', 'player2'];";
    const l = `var player = ["player1", 'player2'];`;   // eslint-disable-line quotes
    verify(t, l);
  });
  
  it('pass when program contains specified partial syntax', () => {
    const t = 'if (condition === true)';
    const l = 'if(condition===true)';
    verify(t, l);
  });
  
  it('pass when program contains specified partial syntax', () => {
    const t = 'else if (health > 0)';
    const l = 'else if(health>0)';
    verify(t, l);
  });
  
  it('pass when program contains specified partial syntax', () => {
    const t = 'else {}';
    const l = 'else{  }  ';
    verify(t, l);
  });
  
  it('pass when program contains specified partial syntax', () => {
    const t = 'case "John": gender = "Male"; break;';
    const l = 'case "John":\
                    gender = "Male";\
                    break;';
    verify(t, l);
  });

  it('pass when program contains specified partial syntax', () => {
    const t = 'do {}';
    const l = 'do {  }  ';
    verify(t, l);
  });

  it('pass when program contains web link in string', () => {
    const t = 'game.load.image("tank", "http://www.freeimg.com/tank.png");';
    const l = 'game.load.image("tank", "http://www.freeimg.com/tank.png");';
    verify(t, l);
  });
  
  it('pass when learner code contains matching value type (numeric)', () => {
    const t = 'console.log(-##  NUMBER##);';
    const l = 'console.log(-3.14);';
    verify(t, l);
  });

  it('pass when learner code contains matching value type (string)', () => {
    const t = 'console.log(##STRING ##);';
    const l = "console.log('hello');";
    verify(t, l);
  });

  // this should pass, improve later
  it('fail when program contains string and substring with different quotes', () => {
    const t = `song = "I don't wanna lose a thing"`;   // eslint-disable-line quotes
    const l = `song = 'I don\\'t wanna lose a thing'`;   // eslint-disable-line quotes
    verify(t, l, [{
      type: 'fail',
      message: "'I don\\'t wanna lose a thing' is incorrect. Please read the instructions again.",
      position: 0,
    }]);
  });

  // ========================================================= END OF PASSES =============== //

  it('fail when learner code contains mismatching token type (numeric)', () => {
    const t = 'console.log(##STRING ##, ##  NUMBER##);';
    const l = 'console.log(0, 3.14);';
    verify(t, l, [{
      type: 'fail',
      message: '0 is incorrect. Please read the instructions again.',
      position: 0,
    }]);
  });

  it('fail when learner code contains mismatching token type (string)', () => {
    const t = 'console.log(##STRING ##, ##  NUMBER##);';
    const l = 'console.log("1874", "14");';
    verify(t, l, [{
      type: 'fail',
      message: '"14" is incorrect. Please read the instructions again.',
      position: 0,
    }]);
  });

  it("fail when values don't match", () => {
    const t = 'var num = 42';
    const l = 'var num = 4';
    verify(t, l, [{
      type: 'fail',
      message: '4 is incorrect. Please read the instructions again.',
      position: 0,
    }]);
  });

  it("fail when keywords don't match", () => {
    const t = 'var num = 42;';
    const l = 'let num = 42;';
    verify(t, l, [{
      type: 'fail',
      message: 'let is incorrect. Please read the instructions again.',
      position: 0,
    }]);
  });

  it("fail when identifiers don't match", () => {
    const t = 'var num = 42;';
    const l = 'var nom = 42;';
    verify(t, l, [{
      type: 'fail',
      message: 'nom is incorrect. Please read the instructions again.',
      position: 0,
    }]);
  });

  it('fail when semi-colon is missing in learner input', () => {
    const t = 'var num = 42;';
    const l = 'var num = 42';
    verify(t, l, [{
      type: 'fail',
      message: "Don't forget the semi-colon at the end of a line.",
      position: 0,
    }]);
  });

  it('fail when parts of program is missing', () => {
    const t = 'button = document.getElementById("button");';
    const l = 'button = getElementById("button");';
    verify(t, l, [{
      type: 'fail',
      message: 'Something is missing from your code. Please read the instructions again.',
      position: 0,
    }]);
  });

  it('fail when program is too long', () => {
    const t = 'button = document.getElementById("button");';
    const l = 'button = document.body.getElementById("button");';
    verify(t, l, [{
      type: 'fail',
      message: 'Your code is longer than required. Please read the instructions again.',
      position: 0,
    }]);
  });

  it('fail when program doesn\'t match specified partial syntax', () => {
    const t = 'if (true)';
    const l = 'if(true) {}';
    verify(t, l, [{
      type: 'fail',
      message: 'Your code is longer than required. Please read the instructions again.',
      position: 0,
    }]);
  });

  it('fail when program contains invalid partial syntax ', () => {
    const t = 'catch (err) {}';
    const l = ' catch(err)  ';
    verify(t, l, [{
      type: 'error',
      message: "Don't forget the braces (curly brackets).",
      position: 11,
    }]);
  });
});

function verify(t, l, messages = []) {
  const teacher = new JsAst(t);                                         //let msg = teacher.messages.length ? JSON.stringify(teacher.messages) : `TEACHER SYNTAX CHECK PASS: ${t}\n`;

  if (teacher.messages.length === 0) {
    const learner = new JsAst(l, teacher.autoCompleteMethod);           //msg += (learner.messages.length ? JSON.stringify(learner.messages) : `LEARNER SYNTAX CHECK PASS: ${l}\n`);
    const compareJs = new JsAstComparer();

    if (learner.messages.length !== 0) {
      expect(learner.messages.length).toEqual(messages.length);
      const result = learner.messages;
      for (let ms in messages) {
        expect(result[ms].type).toEqual(messages[ms].type);
        expect(result[ms].message).toEqual(messages[ms].message);
        expect(result[ms].position).toEqual(messages[ms].position);
      }
    } else {
      compareJs.compare(teacher.tokens, learner.tokens);                //console.log(`${msg}${compareJs.messages.length ? JSON.stringify(compareJs.messages) : 'COMPARISON CHECK PASS'}`);
      const result = compareJs.messages;
      expect(compareJs.messages.length).toEqual(messages.length);
      for (let ms in messages) {
        expect(result[ms].type).toEqual(messages[ms].type);
        expect(result[ms].message).toEqual(messages[ms].message);
        expect(result[ms].position).toEqual(messages[ms].position);
      }
    }
  } else {
    throw new Error("Error in teacher's code");
  }
}