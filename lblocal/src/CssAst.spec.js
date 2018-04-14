import CssAst from './CssAst';

describe('CssAstTest', function() {
  it('ok when empty rule', () => {
    const css = 'h1 {}';
    verify(css);
  });
  
  it('ok when valid css', () => {
    const css = 'div { font-family:arial; }';
    verify(css);
  });

  it('ok when contain only declaration', () => {
    const css = 'margin: 0px;';
    verify(css);
  });
  
  it('ok when contain : in "#", \'#\'', () => {
    const css = 'content: url("http://et-38d7.kxcdn.com/emojione-3.0/2755.png")';
    verify(css);
  });
  
  it('okay when code contains comments', () => {
    const css = 'h1 { background-color: red; } /* comment */';
    verify(css);
  });

  it('fail when contain only declarations but missing ;', () => {
    const css = 'color:red;\n padding: 0px';
    const message = [
      {error: 'padding: 0px is incorrect. There should be a semi-colon(;) at the end.'},
    ];
    verify(css, message, {declarationsOnly: true});
  });

  it('fail when contain only declarationsOnly, comments and missing ;', () => {
    const css = 'color:red /* Comment */';
    const message = [
      {error: 'color:red is incorrect. There should be a semi-colon(;) at the end.'},
    ];
    verify(css, message, {declarationsOnly: true});
  });

  it('fail when missing colon', () => {
    const css = 'div { color red;\n font-family: arial; }';
    const message = [
      {error: 'color red; is incorrect. Remove it or add a colon(:).'},
    ];
    verify(css, message, {declarationsOnly: false});
  });

  it('fail when missing semi-colon before end-of-rule', () => {
    const css = 'div { color: red \nfont-family: arial; }';
    const message = [
      {error: 'color: red is incorrect. There should be a semi-colon(;) at the end.'},
    ];
    verify(css, message, {declarationsOnly: false});
  });

  it('fail when missing semi-colon at end-of-rule', () => {
    const css = 'div { color: red;\n font-family: arial;\n background: none }';
    const message = [
      {error: 'background: none is incorrect. There should be a semi-colon(;) at the end.'},
    ];
    verify(css, message, {declarationsOnly: false});
  });

  it("fail when contain extra closing '}'", () => {
    const css = 'h1 {color: red;} }';
    const message = [
      {error: 'Make sure the curly brackets are properly paired in }.'},
    ];
    verify(css, message);
  });

  it('fail when property name contains spaces', () => {
    const css = 'background color: red;';
    const message = [
      {error: 'background color is incorrect. Spaces are not allowed in CSS property names.'},
    ];
    verify(css, message, {declarationsOnly: true});
  });

  it('fail when property name contains capital letters', () => {
    const css = 'Background-Color: red;';
    const message = [
      {error: 'Background-Color should be all lowercase.'},
    ];
    verify(css, message, {declarationsOnly: true});
  });

  it('fail when property name contains illegal letters', () => {
    const css = 'backgr0und-color: red;';
    const message = [
      {error: '0 in backgr0und-color is incorrect. Please read the instructions again.'},
    ];
    verify(css, message, {declarationsOnly: true});
  });

  it('fail invalid selector 1', () => {
    const css = 'dov { }';
    const message = [{error: 'dov is not a valid tag name.'}];
    verify(css, message);
  });

  it('fail invalid selector 2', () => {
    const css = 'div, h9 { }';
    const message = [{error: 'h9 in div, h9 is not a valid tag name.'}];
    verify(css, message);
  });

  it('fail invalid selector 3', () => {
    const css = '#1stimage { }';
    const message = [{error: '#1stimage is incorrect. Selector must begin with a letter.'}];
    verify(css, message);
  });

  it('fail invalid rule content', () => {
    const css = 'div { margin: auto; dd }';
    const message = [{error: 'margin: auto; dd is incorrect. Please correct or remove dd.'}];
    verify(css, message, {declarationsOnly: false});
  });

  it('fail missing colon', () => {
    const css = 'div { margin auto; }';
    const message = [{error: 'margin auto; is incorrect. Remove it or add a colon(:).'}];
    verify(css, message, {declarationsOnly: false});
  });

  it('fail missing property name', () => {
    const css = 'div { : auto; }';
    const message = [{error: ': auto; is incorrect. Property name is missing.'}];
    verify(css, message, {declarationsOnly: false});
  });

  it('fail missing value', () => {
    const css = 'div { margin:  }';
    const message = [{error: 'margin: is incorrect. The margin property needs a value.'}];
    verify(css, message, {declarationsOnly: false});
  });

  it('fail multiple declarations', () => {
    const css = ' margin: auto; padding: 10px;  ';
    const message = [{error: 'margin: auto; padding: 10px; contains multiple declarations. Please write one declaration per line.'}];
    verify(css, message, {declarationsOnly: true});
  });

  it('fail multiple semi-colons', () => {
    const css = '; margin: auto; ';
    const message = [{error: '; margin: auto; in ; margin: auto; is incorrect. Only one semi-colon(;) is allowed per declaration.'}];
    verify(css, message, {declarationsOnly: true});
  });

  it('fail consecutive valid symbols', () => {
    const css = 'margin:: auto; ';
    const message = [{error: ':: in margin:: auto; is incorrect.'}];
    verify(css, message, {declarationsOnly: true});
  });

  it('@import pass', () => {
    const css = '@import url("http://font.googleapis.com/css?family=Roboto");';
    verify(css);
  });

  it('@import fail when missing semi-colon', () => {
    const css = '@import url("http://font.googleapis.com/css?family=Roboto")';
    const message = [{error: 'Don\'t forget the semi-colon(;) after url("http://font.googleapis.com/css?family=Roboto")'}];
    verify(css, message);
  });

  it('@import fail when at-rule type contains upper case letters', () => {
    const css = '@IMPORT url();';
    const message = [{error: '@IMPORT is incorrect. Make sure all letters are lowercase.'}];
    verify(css, message);
  });

  it('@import fail there is no link', () => {
    const css = '@import ';
    const message = [{error: 'The @import at-rule needs a link.'}];
    verify(css, message);
  });

  it('@import fail when no space between at-rule type and value', () => {
    const css = '@importurl("http://font.googleapis.com/css?family=Roboto");';
    const message = [{error: 'There should be a space between @import and url("http://font.googleapis.com/css?family=Roboto");.'}];
    verify(css, message);
  });

  it('@import fail when quotes do not match', () => {
    const css = '@import url("http://font.googleapis.com/css?family=Roboto\');';
    const message = [{error: '"http://font.googleapis.com/css?family=Roboto\' contains mismatching quotation marks.'}];
    verify(css, message);
  });

  it('@keyframes pass', () => {
    const css = '@keyframes anim{ 0% { width: 100%;}} @media print { body { width: 90%; }}';
    verify(css);
  });

  it('@keyframes fail when missing identifier', () => {
    const css = '@keyframes {}';
    const message = [{error: 'The @keyframes at-rule needs a name.'}];
    verify(css, message);
  });
  
  it('@keyframes fail when upper case', () => {
    const css = '@KEYFRAMES anim {}';
    const message = [{error: '@KEYFRAMES is incorrect. Make sure all letters are lowercase.'}];
    verify(css, message);
  });

  it('@keyframes fail when no space between type and identifier', () => {
    const css = '@keyframesanim { 0% {} }';
    const message = [{error: 'There should be a space between @keyframes and anim.'}];
    verify(css, message);
  });

  it('@keyframes fail invalid keyframe selector', () => {
    const css = '@keyframes anim { 90 {} }';
    const message = [{error: '90 is not a valid selector for the @keyframes at-rule. Use a number followed by the % symbol.'}];
    verify(css, message);
  });

  it('@media fail when no identifier', () => {
    const css = '@media {}';
    const message = [{error: 'The @media at-rule needs an identifier.'}];
    verify(css, message);
  });

  it('@media fail when contains invalid nested code', () => {
    const css = '@media screen { body  width: 100%; } img { border: none; } }';
    const message = [{error: 'Make sure the curly brackets are properly paired in body width: 100%; }.'}];
    verify(css, message);
  });

  it('@media fail when at-rule not properly closed', () => {
    const css = '@media screen \n body { width: 100%; } img { border: none; }';
    const message = [{error: 'The @media screen at-rule should be followed by the "{" symbol.'}];
    verify(css, message);
  });

  it('@media fail when at-rule not properly closed', () => {
    const css = '@media screen { body { width: 100%; } img { border: none; }';
    const message = [{error: 'Make sure curly brackets are properly paired for the @media screen at-rule.'}];
    verify(css, message);
  });

  it('tests work on nested rules', () => {
    const css = '@media screen { body { HEIGHT: 100%; }}';
    const message = [{error: 'HEIGHT should be all lowercase.'}];
    verify(css, message);
  });

  it('fail when @ symbol without at-rule type', () => {
    const css = '@  ';
    const message = [{error: 'Please write the type of at-rule after the @ symbol.'}];
    verify(css, message);
  });

  it('fail when type of at-rule is invalid', () => {
    const css = '@hello  ';
    const message = [{error: '@hello is not a valid type of at-rule.'}];
    verify(css, message);
  });
});

function verify(css, expectedMessages = [], context = null) {
  const result = new CssAst(css, context); //console.log(result.rules[0].keyframes);
  expect(result.messages.length).toEqual(expectedMessages.length);
  
  for (let em in expectedMessages) {
    const msgType = Object.keys(expectedMessages[em]);
    const expectedMsg = expectedMessages[em][msgType];
    const actualMsg = result.messages[em];
    
    expect(actualMsg.type).toEqual(msgType[0]);
    expect(actualMsg.message).toEqual(expectedMsg);
  }
}
