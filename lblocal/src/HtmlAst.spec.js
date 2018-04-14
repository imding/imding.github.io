import HtmlAst from './HtmlAst';

describe('HtmlAstTest', function () {
  it('pass valid code', () => {
    const code = '<body class="container"></body>';
    verify(code);
  });

  it('pass uppercase attribute name', () => {
    const code = '<body Class="container"></body>';
    verify(code);
  });

  it('pass different case in tag names', () => {
    const code = '<sPaN>test</SpaN>';
    verify(code);
  });

  it('pass unclosed meta', () => {
    const code = '<meta name="viewport" content="width=device-width, initial-scale=1">';
    verify(code);
  });

  it('pass unclosed link', () => {
    const code = '<link rel="stylesheet" href="https://code.jquery.com/mobile/1.4.5/jquery.mobile-1.4.5.min.css">';
    verify(code);
  });

  it('fail empty tag name', () => {
    const code = '<';
    const messages = [{
      type: 'error',
      message: 'Please write a tag name after the < symbol.',
    }];
    verify(code, messages);
  });

  it('fail missing > in opening tag', () => {
    const code = '<ing';
    const messages = [{
      type: 'error',
      message: '<ing needs to be closed off using the > symbol.',
    }];
    verify(code, messages);
  });

  it('fail invalid tag name', () => {
    const code = '<ing>';
    const messages = [{
      type: 'error',
      message: 'ing is not a valid tag name.',
    }];
    verify(code, messages);
  });

  it('fail when missing space between valid tag name and attribute name', () => {
    const code = '<inputdisabled/>';
    const messages = [{
      type: 'error',
      message: 'There should be a space between input and disabled.',
    }];
    verify(code, messages);
  });

  it('fail invalid attribute name', () => {
    const code = '<div clas="wrapper"></div>';
    const messages = [{
      type: 'error',
      message: 'clas is not a valid attribute name.',
    }];
    verify(code, messages);
  });

  it('fail unclosed element', () => {
    const code = '<body class="container">';
    const messages = [{
      type: 'error',
      message: 'body is not a void element. Please add a closing tag for <body class=\"container\"> or remove it.',
    }];
    verify(code, messages);
  });

  it('fail unclosed element - followed by valid opening tag', () => {
    const code = '<body class="container"><img>';
    const messages = [{
      type: 'error',
      message: 'body is not a void element. Please add a closing tag for <body class=\"container\"> or remove it.',
    }];
    verify(code, messages);
  });

  it('fail unclosed element - followed by incorrect end tag', () => {
    const code = '<body class="container"></div>';
    const messages = [{
      type: 'error',
      message: '</div> is not a valid closing tag for <body class="container">.',
    }];
    verify(code, messages);
  });

  it('fail unclosed element - followed by empty end tag', () => {
    const code = '<body class="container"></>';
    const messages = [{
      type: 'error',
      message: 'Please add a tag name after </.',
    }];
    verify(code, messages);
  });

  it('fail when missing > in end tag', () => {
    const code = '<body class="container"></body';
    const messages = [{
      type: 'error',
      message: 'Please close off </body with a > symbol.',
    }];
    verify(code, messages);
  });

  it('fail valid extra end tag', () => {
    const code = '<div></div></h3>';
    const messages = [{
      type: 'error',
      message: '</h3> is not paired with anything. Please add an opening tag or remove it.',
    }];
    verify(code, messages);
  });

  it('fail nested valid extra end tag', () => {
    const code = '<div><h1></h1></h3></div>';
    const messages = [{
      type: 'error',
      message: '</h3> is not paired with anything. Please add an opening tag or remove it.',
    }];
    verify(code, messages);
  });

  it('fail leading valid end tag', () => {
    const code = '</h2>';
    const messages = [{
      type: 'error',
      message: '</h2> is not paired with anything. Please add an opening tag or remove it.',
    }];
    verify(code, messages);
  });

  it('fail nested leading invalid end tag', () => {
    const code = '<div></h2></div>';
    const messages = [{
      type: 'error',
      message: '</h2> is not paired with anything. Please add an opening tag or remove it.',
    }];
    verify(code, messages);
  });

  it('fail invalid extra end tag', () => {
    const code = '<div></div></p3>';
    const messages = [{
      type: 'error',
      message: 'p3 is not a valid tag name.',
    }];
    verify(code, messages);
  });

  it('fail leading invalid end tag', () => {
    const code = '</h9>';
    const messages = [{
      type: 'error',
      message: 'h9 is not a valid tag name.',
    }];
    verify(code, messages);
  });

  it('fail nested leading invalid end tag', () => {
    const code = '<div></h9></div>';
    const messages = [{
      type: 'error',
      message: 'h9 is not a valid tag name.',
    }];
    verify(code, messages);
  });

  it('fail when duplicated attribute', () => {
    const code = '<body class="container" class="container"></body>';
    const messages = [{
      type: 'error',
      message: 'There should be only one class attribute in the body tag.',
    }];
    verify(code, messages);
  });

  it('fail when there is no space between 2 attributes', () => {
    const code = `<input type='text'placeholder='your name here'>`;
    const messages = [{
      type: 'error',
      message: `Please add a space before the placeholder attribute.`,
    }];
    verify(code, messages);
  });

  it('fail invalid quotes', () => {
    const code = `<input type='text placeholder="Ain't no rest for the wicked.">`;
    const messages = [{
      type: 'error',
      message: `Please make sure quotation marks are properly paired in type='text placeholder="Ain't no rest for the wicked.".`,
    }];
    verify(code, messages);
  });

  it('fail boolean attribute with value', () => {
    const code = `<input disabled='true'>`;
    const messages = [{
      type: 'error',
      message: `disabled is a Boolean attribute. Please remove ='true'.`,
    }];
    verify(code, messages);
  });

  it('fail when attribute value is missing', () => {
    const code = `<input class>`;
    const messages = [{
      type: 'error',
      message: `class is not a Boolean attribute. Please give it a value using the = sign.`,
    }];
    verify(code, messages);
  });

  it('fail when attribute value has no quote', () => {
    const code = `<input id=username>`;
    const messages = [{
      type: 'error',
      message: `Remember to always use quotes after the = sign.`,
    }];
    verify(code, messages);
  });

  it('fail empty src in img tag', () => {
    const code = '<img src=""/>';
    const messages = [{
      type: 'error',
      message: 'Please provide a value for the src attribute.',
    }];
    verify(code, messages);
  });

  it('fail white space after < in open tag', () => {
    const code = '< h2>test</h2>';
    const messages = [{
      type: 'error',
      message: '< h2> is incorrect. Make sure there is no space after the < symbol.',
    }];
    verify(code, messages);
  });

  it('fail non-void element self-close', () => {
    const code = '<p>JJKK</p><div/>';
    const messages = [{
      type: 'error',
      message: 'div is not a void element. Please remove the / symbol.',
    }];
    verify(code, messages);
  });

  it('fail invalid self-close on void element', () => {
    const code = '<input / >';
    const messages = [{
      type: 'error',
      message: 'In the input tag, please remove any space after the / symbol.',
    }];
    verify(code, messages);
  });

  it('fail illegal letters for attribute names', () => {
    const code = `<input 123>`;
    const messages = [{
      type: 'error',
      message: `In the input tag, 123 is incorrect. Please remove it.`,
    }];
    verify(code, messages);
  });

  it('fail white space after < in end tag', () => {
    const code = `<div>< /div>`;
    const messages = [{
      type: 'error',
      message: `< /div> is incorrect. Make sure there is no space after <.`,
    }];
    verify(code, messages);
  });
});

function verify(code, messages = [], opts = null) {
  const results = new HtmlAst(code);

  if (results._messages.length != messages.length) {
    console.log(results._messages);
  }

  expect(results._messages.length).toEqual(messages.length);

  for (let i in results._messages) {
    expect(results._messages[i].type).toEqual(messages[i].type);
    expect(results._messages[i].message).toEqual(messages[i].message);
  }
}