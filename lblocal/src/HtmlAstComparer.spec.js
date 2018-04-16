import HtmlAst from './HtmlAst';
import HtmlAstComparer from './HtmlAstComparer';

describe('HtmlAstComparerTest', function () {
  it('pass identical code', () => {
    const t = '<body class="container"></body>';
    const l = '<body class="container"></body>';
    verify(t, l);
  });

  it('pass multiple root elements', () => {
    const l = '<h1>UUUU</h1> <h2>YYY</h2>';
    const t = '<h1>UUUU</h1> <h2>YYY</h2>';
    verify(t, l);
  });

  it('pass different letter case in attribute name', () => {
    const t = '<body class="container"></body>';
    const l = '<body Class="container"></body>';
    verify(t, l);
  });

  it('pass different case in tag names', () => {
    const t = '<span>test</span>';
    const l = '<sPaN>test</SpaN>';
    verify(t, l);
  });

  it('pass different attribute order', () => {
    const l = '<h1 class="A" id="A">test</h1>';
    const t = '<h1 id="A" class="A">test</h1>';
    verify(t, l);
  });

  it('fail different tag names', () => {
    const t = '<h1>test</h1>';
    const l = '<h2>test</h2>';
    const messages = [{
      type: 'fail',
      message: '<h2>...</h2> is not the right element. Please read the instructions again.',
    }];
    verify(t, l, messages);
  });

  it('fail different attribute names', () => {
    const t = '<body class="container"></body>';
    const l = '<body id="container"></body>';
    const messages = [{
      type: 'fail',
      message: 'In the body tag, id="container" is incorrect. Try changing the attribute name to class.',
    }];
    verify(t, l, messages);
  });

  it('fail different attribute values', () => {
    const t = '<h1 id="b" class="A">test</h1>';
    const l = '<h1 id="A" class="B">test</h1>';
    const messages = [{
      type: 'fail',
      message: 'In the h1 tag, "A" is not the right value for the id attribute.',
    }];
    verify(t, l, messages);
  });

  it('fail unexpected attribute', () => {
    const t = '<h1 class="A" id="A">test</h1>';
    const l = '<h1   class =  "A"    id =  "A"  nowrap  >test</h1  >';
    const message = [{
      type: 'fail',
      message: 'In the h1 tag, nowrap attribute is not required. Please remove it.',
    }];
    verify(t, l, message);
  });

  it('fail missing attribute', () => {
    const t = '<h1 class="A" id="A">test</h1>';
    const l = '<h1 id="A">test</h1  >';
    const message = [{
      type: 'fail',
      message: 'There should be 2 attributes in the h1 tag.',
    }];
    verify(t, l, message);
  });

  it('fail extra attributes', () => {
    const t = '<h1 class="B">test</h1>';
    const l = '<h1 id="A" class="B">test</h1  >';
    const message = [{
      type: 'fail',
      message: 'In the h1 tag, id attribute is not required. Please remove it.',
    }];
    verify(t, l, message);
  });

  it('fail same number of attributes with similar values but different attribute names', () => {
    const t = '<h1 class="title tilted" id = "bigTitle">title</h1>';
    const l = '<h1 title = "bigtitle" value="tile tilte">title</h1>';
    const message = [{
      type: 'fail',
      message: 'In the h1 tag, title = "bigtitle" is incorrect. Try changing the attribute name to id.',
    }];
    verify(t, l, message);
  });

  it("fail empty space rather than text with ##ANY##", () => {
    const t = '##ANY##';
    const l = '';
    const message = [{
      type: 'fail',
      message: 'There should be some text in your code.',
    }];
    verify(t, l, message);
  });

  it("fail nested empty space rather than text with ##ANY##", () => {
    const t = '<span>##ANY##</span>';
    const l = '<span> </span>';
    const message = [{
      type: 'fail',
      message: 'There should be some text in <span></span>.',
    }];
    verify(t, l, message);
  });

  it("fail empty space rather than text with ##ANY(...)##", () => {
    const t = '##ANY##';
    const l = '';
    const message = [{
      type: 'fail',
      message: 'There should be some text in your code.',
    }];
    verify(t, l, message);
  });

  it("fail nested empty space rather than text with ##ANY(...)##", () => {
    const t = '<textarea>##ANY(south; east)##</textarea>';
    const l = '<textarea> </textarea>';
    const message = [{
      type: 'fail',
      message: 'There should be some text in <textarea></textarea>.',
    }];
    verify(t, l, message);
  });

  it("fail empty space rather than text with ##NOT(...)##", () => {
    const t = '##NOT(bob)##';
    const l = '';
    const message = [{
      type: 'fail',
      message: 'There should be some text in your code.',
    }];
    verify(t, l, message);
  });

  it("fail nested empty space rather than text with ##NOT(...)##", () => {
    const t = '<h2>##NOT(sam)##</h2>';
    const l = '<h2> </h2>';
    const message = [{
      type: 'fail',
      message: 'There should be some text in <h2></h2>.',
    }];
    verify(t, l, message);
  });

  it("fail element rather than text with ##ANY##", () => {
    const t = '##ANY##';
    const l = '<img>';
    const message = [{
      type: 'fail',
      message: '<img> is not text content. Please replace it with plain text.',
    }];
    verify(t, l, message);
  });

  it("fail element rather than text with ##ANY(...)##", () => {
    const t = '##ANY(hello; world)##';
    const l = '<div>hello world</div>';
    const message = [{
      type: 'fail',
      message: '<div>...</div> is not text content. Please replace it with plain text.',
    }];
    verify(t, l, message);
  });

  it("fail element rather than text with ##NOT(...)##", () => {
    const t = '##NOT(bob; sam)##';
    const l = '<h1>bob and sam</h1>';
    const message = [{
      type: 'fail',
      message: '<h1>...</h1> is not text content. Please replace it with plain text.',
    }];
    verify(t, l, message);
  });

  it('pass text content matching ##ANY(...)##', () => {
    const t = '<h1>##ANY(Title; Subtitle)##</h1>';
    const l = '<h1>title</h1>';
    verify(t, l);
  });

  it('fail text content mismatching ##ANY(...)##', () => {
    const t = '<h1>##ANY(Title; subtitle; big Text)##</h1>';
    const l = '<h1>very big text</h1>';
    const message = [{
      type: 'fail',
      message: 'In the h1 element, text content "very big text" is incorrect. Try "Title", "subtitle" or "big Text".',
    }];
    verify(t, l, message);
  });

  it('pass text content matching ##NOT(...)##', () => {
    const t = "<h1>##NOT(Bob's First Website)##</h1>";
    const l = "<h1>Sam's First Website</h1>";
    verify(t, l);
  });

  it('fail text content mismatching ##NOT(...)##', () => {
    const t = "<h1>##NOT(Bob's First Website; Sam's First Website)##</h1>";
    const l = "<h1>Sam's  First website</h1>";
    const message = [{
      type: 'fail',
      message: `In the h1 element, text content "Sam's  First website" is incorrect. Try any other text.`,
    }];
    verify(t, l, message);
  });

  it('fail when mismatch content', () => {
    const t = '<h2>XXX</h2>';
    const l = '<h2>YYY</h2>';
    const messages = [{
      type: 'fail',
      message: 'In the h2 element, text content "YYY" is incorrect. Try "XXX".',
    }];
    verify(t, l, messages);
  });

  it('fail nested element rather than text node', () => {
    const t = '<h2>test</h2>';
    const l = '<h2><div>A</div></h2>';
    const messages = [{
      type: 'fail',
      message: '<div>...</div> is not text content. Please replace it with plain text.',
    }];
    verify(t, l, messages);
  });

  it('fail different element order', () => {
    const t = '<div><h1>y</h1><p>x</p></div>';
    const l = '<div><p>x</p><h1>y</h1></div>';
    const messages = [{
      type: 'fail',
      message: '<p>...</p> is not the right element. Please read the instructions again.',
    }];
    // this is less than ideal but a single expectation will very rarely ask for multiple nested elements
    verify(t, l, messages);
  });

  it('fail extra element', () => {
    const t = '<h1>XXX</h1>';
    const l = '<h1>XXX</h1><p>GGG</p>';
    const messages = [{
      type: 'fail',
      message: 'There should be only 1 element in your code.',
    }];
    verify(t, l, messages);
  });

  it("fail empty learner code", () => {
    const t = '<p id="TT">XXX</p>';
    const l = '';
    const messages = [{
      type: 'fail',
      message: "There should be an element in your code.",
    }];
    verify(t, l, messages);
  });

  it("fail different text content", () => {
    const t = 'XXX';
    const l = 'TTT';
    const messages = [{
      type: 'fail',
      message: 'Text content "TTT" is incorrect. Try "XXX".',
    }];
    verify(t, l, messages);
  });

  it("pass same text content", () => {
    const t = 'contain text only';
    const l = 'contain text only';
    verify(t, l);
  });

  it("fail text content rather than element", () => {
    const t = '<img>';
    const l = 'image';
    const messages = [{
      type: 'fail',
      message: '"image" is not an element. You can create elements using tags.',
    }];
    verify(t, l, messages);
  });
});

function verify(t, l, messages = []) {
  const teacher = new HtmlAst(t);
  if (teacher.messages.length) throw new Error(`Error in teacher code: ${teacher.messages[0].message}.`);

  const learner = new HtmlAst(l);
  if (learner.messages.length) throw new Error(`Error in learner code: ${learner.messages[0].message}.`);

  const comparer = new HtmlAstComparer();
  comparer.compare(teacher.tree, learner.tree);

  if (comparer.messages.length > messages.length) console.log(comparer.messages[0].message);
  expect(comparer.messages.length).toEqual(messages.length);

  comparer.messages.forEach((m, i) => {
    expect(m.type).toEqual(messages[i].type);
    expect(m.message).toEqual(messages[i].message);
  });
}