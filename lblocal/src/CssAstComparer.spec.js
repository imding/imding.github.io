import CssAst, {AUTO_ADDED_SELECTOR} from './CssAst';
import CssAstComparer from './CssAstComparer';

describe('CssAstComparerTest', function() {
  it('ok when identical', () => {
    const l = `div { font-family:arial;
              }`;
    const t = `div {
              font-family: arial;}`;
    verify(l, t);
  });

  it('error when one declaration value differs', () => {
    const l = `h1 {
                font-family: sans-serif;
                padding-top: 60px;
                color: red;
              }`;
    const t = `h1 {
                font-family: arial;
                padding-top: 60px;
                color: red;
              }`;
    const msg = [
      {fail: 'In the h1 {} rule, font-family: sans-serif is incorrect. Please read the instructions again.'},
    ];
    verify(l, t, msg);
  });

  it('warning messages when different selector', () => {
    const l = `h2 {
                font-family: sans-serif;
              }`;
    const t = `h1 {
                font-family: sans-serif;
              }`;
    const msg = [
      {fail: 'The h2 selector is not required. Please remove or correct it.'},
      {fail: "Don't forget to add the selector for h1."},
    ];
    verify(l, t, msg);
  });

  it('waring messages when different selector and comments', () => {
    const l = `h2 {
                font-family: sans-serif;
              }
              /*
              *  comment
              *  comment
              */`;
    const t = `h1 {
                font-family: sans-serif;
              } /* comment */`;
    const msg = [
      {fail: 'The h2 selector is not required. Please remove or correct it.'},
      {fail: "Don't forget to add the selector for h1."},
    ];
    verify(l, t, msg);
  });

  it('error when the teacher declaration is different from learner', () => {
    const l = `div {
                color: red;
                margin: 0px;
              }`;
    const t = `div {
                margin-top: 5 px;
              }`;
    const msg = [
      {fail: "Don't forget to create the margin top style inside the div {} rule."},
      {fail: 'In the div {} rule, color property is not required. Please remove or correct it.'},
      {fail: 'In the div {} rule, margin property is not required. Please remove or correct it.'},
    ];
    verify(l, t, msg);
  });

  it('ok when the learner code has an extra declaration', () => {
    const l = `div {
                color: red;
                margin-top: 5 px;
              }`;
    const t = `div {
                margin-top: 5 px;
              }`;
    const msg = [];
    verify(l, t, msg, {allowExtraDeclarations: true});
  });

  it('ok when the learner code has an extra selector', () => {
    const l = 'div {color: red; } h1 { color: blue; }';
    const t =  'div {color: red; }';
    const msg = [];
    verify(l, t, msg, {allowExtraSelectors: true});
  });

  it('ok when the learner code has an extra selector and declaration', () => {
    const l = 'div {color: red;\n margin-top: 20px; } h1 { color: blue; }';
    const t =  'div {color: red; }';
    const msg = [];
    verify(l, t, msg, {allowExtraSelectors: true, allowExtraDeclarations: true});
  });

  it('error when all declarations are different from each other', () => {
    const l = `div {
                margin-top: 5 px;
              }
              p {
                color: red;
              }`;
    const t = `div {
                padding: 0 px;
              }
              p {
                padding: 0 px;
              }`;
    const msg = [
      {fail: "Don't forget to create the padding style inside the div {} rule."},
      {fail: 'In the div {} rule, margin-top property is not required. Please remove or correct it.'},
      {fail: "Don't forget to create the padding style inside the p {} rule."},
      {fail: 'In the p {} rule, color property is not required. Please remove or correct it.'},
    ];
    verify(l, t, msg);
  });

  it('ok when there is white space in selector', () => {
    const l = `div > p {
                color: red;
              }
              h1 > h2 { margin:10px; }`;
    const t = `div> p {
                color: red;
              }
              h1 >h2 { margin:10px; }`;
    const msg = [];
    verify(l, t, msg);
  });

  it('warning message for duplicated selectors', () => {
    const l = `div {
                color: red;
              }
              div {
                color: red;
              }`;
    const t = `div {
                color: red;
              }`;
    const msg = [
      {warn: 'There are more than one div selector in your code. Please remove or correct it.'},
    ];
    verify(l, t, msg);
  });

  it('warning message for duplicated declarations', () => {
    const l = `div {
                color: red;
                color: red;
              }`;
    const t = `div {
                color: red;
              }`;
    const msg = [
      {warn: "The color property shouldn't appear more than once in the div {} rule. Please correct it."},
    ];
    verify(l, t, msg);
  });

  it('warning message for duplicated declarations and comments', () => {
    const l = `div {  /* comment */
                color: red;
                color: red;/* comment */
              }`;
    const t = `div {/* comment */
                color: red;
              }/* comment
              * coment */`;
    const msg = [
      {warn: "The color property shouldn't appear more than once in the div {} rule. Please correct it."},
    ];
    verify(l, t, msg);
  });

  it('ok when CSS contains only declarations', () => {
    const l = `color: red;
              margin: 1px;
              padding: 100px;`;
    const t = `color: red;
              margin: 1px; padding: 100px;`;
    verify(l, t);
  });

  it('warning message when CSS contains only declarations and different values', () => {
    const l = `color: red;
              margin: 20px;`;
    const t = `padding: red;
              margin: 1px;`;
    const msg = [
      {fail: "Don't forget to create the padding style."},
      {fail: 'margin: 20px is incorrect. Please read the instructions again.'},
      {fail: 'The color property is not required. Please remove or correct it.'},
    ];
    verify(l, t, msg);
  });

  it('warning message when CSS contains only declarations and duplicated', () => {
    const l = `color: red;
              color: red;`;
    const t = 'color: red;';
    const msg = [
      {warn: "The color property shouldn't appear more than once. Please correct it."},
    ];
    verify(l, t, msg);
  });

  it('warning message when CSS contains only declarations, duplicated declarations and comments', () => {
    const l = `color: red; /* comment */
              color: red;`;
    const t = `color: red;
              /*comment*/ `;
    const msg = [
      {warn: "The color property shouldn't appear more than once. Please correct it."},
    ];
    verify(l, t, msg);
  });

  it('failure when CSS contains only declarations and invalid value', () => {
    const l = 'border: 5pxsolidblack;';
    const t = 'border: 5px solid black;';
    const msg = [
      {fail: 'border: 5pxsolidblack is incorrect. Please read the instructions again.'},
    ];
    verify(l, t, msg);
  });

  it('ok when CSS contains only declarations and different white space', () => {
    const l = 'border  :  5px          solid        black;';
    const t = 'border: 5px solid black;';
    const msg = [];
    verify(l, t, msg);
  });

  it('ok when CSS contains only declarations and different rgb', () => {
    const l = 'color: rgb(123,234,100);';
    const t = 'color: rgb(123, 234, 100);';
    const msg = [];
    verify(l, t, msg);
  });

  it('ok when CSS contains only declarations and rgb', () => {
    const l = 'color: rgb(123,234,100,21);';
    const t = 'color: rgb(123,   234,      100     , 21);';
    const msg = [];
    verify(l, t, msg);
  });

  it('ok when CSS contains only declarations and rgba', () => {
    const l = 'color: rgba(0,0,0, 0.3);';
    const t = 'color: rgba(0, 0, 0, 0.3);';
    const msg = [];
    verify(l, t, msg);
  });

  it('failure when CSS contains only declarations and different rgba', () => {
    const l = 'color: rgba(123,234,100,21);';
    const t = 'color: rgba(123,   234,      100     , 251);';
    const msg = [
      {fail: 'color: rgba(123,234,100,21) is incorrect. Please read the instructions again.'},
    ];
    verify(l, t, msg);
  });

  it('ok with ##ANY()##', () => {
    const l = 'h1 { color: green; }';
    const t = 'h1 { color: ## ANY( blue; green; red ) ## }';
    verify(l, t);
  });

  it('failure with ##ANY()##', () => {
    const l = 'h1 { color: green; }';
    const t = 'h1 { color: ##ANY(blue; red)## }';
    const msg = [
      {fail: 'In the h1 {} rule, color: green is incorrect. Try using blue or red.'},
    ];
    verify(l, t, msg);
  });

  it('failure with ##ANY()## containing 3 optional values', () => {
    const l = 'h1 { color: green; }';
    const t = 'h1 { color: ##ANY(blue; red; yellow)## }';
    const msg = [
      {fail: 'In the h1 {} rule, color: green is incorrect. Try using blue, red or yellow.'},
    ];
    verify(l, t, msg);
  });

  it('failure with ##ANY()## containing 3 or more optional values', () => {
    const l = 'h1 { color: green; }';
    const t = 'h1 { color: ##ANY(blue; red; yellow; skyblue; firebrick)## }';
    const msg = [
      {fail: 'In the h1 {} rule, color: green is incorrect. Try using blue, red, yellow, skyblue or firebrick.'},
    ];
    verify(l, t, msg);
  });

  it('ok with ##ANY##', () => {
    const l = 'h1 { color: green; }';
    const t = 'h1 { color: ##ANY## }';
    verify(l, t);
  });

  it('ok with ##NOT()##', () => {
    const l = 'h1 { color: green; }';
    const t = 'h1 { color: ##  NOT(  blue;  red ) ## }';
    verify(l, t);
  });

  it('failure with ##NOT()##', () => {
    const l = 'h1 { color:   green;  }';
    const t = 'h1 { color: ##  NOT(  blue; green; red) ## }';
    const msg = [
      {fail: 'In the h1 {} rule, color: green is incorrect. Try using a different value.'},
    ];
    verify(l, t, msg);
  });

  it('ok with ##COLOR## (hex color)', () => {
    const l = 'h1 { color:   #f1A5F2; }';
    const t = 'h1 { color: ##  COLOR ## }';
    verify(l, t);
  });

  it('ok with ##COLOR## (color name)', () => {
    const l = 'h1 { color:   green; }';
    const t = 'h1 { color: ##  COLOR ## }';
    verify(l, t);
  });

  it('ok with ##COLOR## (rgb color)', () => {
    const l = 'h1 { color:   rgb( 255, 0 ,100 ); }';
    const t = 'h1 { color: ##  COLOR ## }';
    verify(l, t);
  });

  it('ok with ##COLOR## (rgba color)', () => {
    const l = 'h1 { color:   rgba( 255, 0 ,100 , 0.5); }';
    const t = 'h1 { color: ##  COLOR ## }';
    verify(l, t);
  });

  it('failure with ##COLOR##', () => {
    const l = 'h1 { color:  notcolor;  }';
    const t = 'h1 { color: ##  COLOR ## }';
    const msg = [
      {fail: 'In the h1 {} rule, color: notcolor is incorrect. Try using any color value.'},
    ];
    verify(l, t, msg);
  });

  it('ok with ##COLOR(HEX)##', () => {
    const l = 'h1 { color:   #f1A5F2; }';
    const t = 'h1 { color: ##  COLOR(HEX) ## }';
    verify(l, t);
  });

  it('fail with ##COLOR(HEX)## (1 chars)', () => {
    const l = 'h1 { color:   #f; }';
    const t = 'h1 { color: ##  COLOR(HEX) ## }';
    const msg = [
      {fail: 'In the h1 {} rule, color: #f is incorrect. Please read the instructions again.'},
    ];
    verify(l, t, msg);
  });

  it('fail with ##COLOR(HEX)## (2 chars)', () => {
    const l = 'h1 { color:   #f1; }';
    const t = 'h1 { color: ##  COLOR(HEX) ## }';
    const msg = [
      {fail: 'In the h1 {} rule, color: #f1 is incorrect. Please read the instructions again.'},
    ];
    verify(l, t, msg);
  });

  it('ok with ##COLOR(HEX)## (3 chars)', () => {
    const l = 'h1 { color:   #f1A; }';
    const t = 'h1 { color: ##  COLOR(HEX) ## }';
    verify(l, t);
  });

  it('fail with ##COLOR(HEX)## (4 chars)', () => {
    const l = 'h1 { color:   #f1Aa; }';
    const t = 'h1 { color: ##  COLOR(HEX) ## }';
    const msg = [
      {fail: 'In the h1 {} rule, color: #f1Aa is incorrect. Please read the instructions again.'},
    ];
    verify(l, t, msg);
  });

  it('fail with ##COLOR(HEX)## (5 chars)', () => {
    const l = 'h1 { color:   #f1Aad; }';
    const t = 'h1 { color: ##  COLOR(HEX) ## }';
    const msg = [
      {fail: 'In the h1 {} rule, color: #f1Aad is incorrect. Please read the instructions again.'},
    ];
    verify(l, t, msg);
  });

  it('fail with ##COLOR(HEX)## (green)', () => {
    const l = 'h1 { color: green;  }';
    const t = 'h1 { color: ##  COLOR(HEX) ## }';
    const msg = [
      {fail: 'In the h1 {} rule, color: green is incorrect. Please read the instructions again.'},
    ];
    verify(l, t, msg);
  });

  it('fail with ##COLOR(HEX)## (not all hex chars)', () => {
    const l = 'h1 { color: #fg2831;  }';
    const t = 'h1 { color: ##  COLOR(HEX) ## }';
    const msg = [
      {fail: 'In the h1 {} rule, color: #fg2831 is incorrect. Please read the instructions again.'},
    ];
    verify(l, t, msg);
  });

  it('ok with ##COLOR(RGB)##', () => {
    const l = 'h1 { color:   rgb(  255  ,255 , 255  ); }';
    const t = 'h1 { color: ##  COLOR(RGB) ## }';
    verify(l, t);
  });

  it('failure with ##COLOR(RGB)##', () => {
    const l = 'h1 { color:   #f1A5F2;  }';
    const t = 'h1 { color: ##  COLOR(RGB) ## }';
    const msg = [
      {fail: 'In the h1 {} rule, color: #f1A5F2 is incorrect. Please read the instructions again.'},
    ];
    verify(l, t, msg);
  });

  it('failure with ##COLOR(RGB)## when more than 3 parameters', () => {
    const l = 'h1 { color:   rgb(255, 255, 255, 1);  }';
    const t = 'h1 { color: ##  COLOR(RGB) ## }';
    const msg = [
      {fail: 'In the h1 {} rule, color: rgb(255, 255, 255, 1) is incorrect. Please read the instructions again.'},
    ];
    verify(l, t, msg);
  });

  it('failure with ##COLOR(RGB)## with spaces between values', () => {
    const l = 'h1 { color:   rgb(255 255 255);  }';
    const t = 'h1 { color: ##  COLOR(RGB) ## }';
    const msg = [
      {fail: 'In the h1 {} rule, color: rgb(255 255 255) is incorrect. Please read the instructions again.'},
    ];
    verify(l, t, msg);
  });

  it('failure ##COLOR(RGB)## with whitespace after rgb', () => {
    const l = 'h1 { color:   rgb ( 255,  255,  255 );  }';
    const t = 'h1 { color: ##  COLOR(RGB) ## }';
    const msg = [
      {fail: 'In the h1 {} rule, color: rgb ( 255, 255, 255 ) is incorrect. Please read the instructions again.'},
    ];
    verify(l, t, msg);
  });

  it('ok with ##COLOR(RGBA)##', () => {
    const l = 'h1 { color:   rgba(  255  ,255 , 255  , 0.5); }';
    const t = 'h1 { color: ##  COLOR(RGBA) ## }';
    verify(l, t);
  });

  it('failure with ##COLOR(RGBA)## when using rgb', () => {
    const l = 'h1 { color:   rgb( 255,255,255, 1);  }';
    const t = 'h1 { color: ##  COLOR(RGBA) ## }';
    const msg = [
      {fail: 'In the h1 {} rule, color: rgb( 255,255,255, 1) is incorrect. Please read the instructions again.'},
    ];
    verify(l, t, msg);
  });

  it('failure with ##COLOR(RGBA)## with fewer than 4 parameters', () => {
    const l = 'h1 { color:   rgba(255, 255, 255);  }';
    const t = 'h1 { color: ##  COLOR(RGBA) ## }';
    const msg = [
      {fail: 'In the h1 {} rule, color: rgba(255, 255, 255) is incorrect. Please read the instructions again.'},
    ];
    verify(l, t, msg);
  });

  it('failure with ##COLOR(RGBA)## with spaces between values', () => {
    const l = 'h1 { color:   rgba(25 5 255 255);  }';
    const t = 'h1 { color: ##  COLOR(RGBA) ## }';
    const msg = [
      {fail: 'In the h1 {} rule, color: rgba(25 5 255 255) is incorrect. Please read the instructions again.'},
    ];
    verify(l, t, msg);
  });

  it('failure ##COLOR(RGBA)## with whitespace after rgba', () => {
    const l = 'h1 { color:   rgba ( 255,  255,  255 , 1);  }';
    const t = 'h1 { color: ##  COLOR(RGBA) ## }';
    const msg = [
      {fail: 'In the h1 {} rule, color: rgba ( 255, 255, 255 , 1) is incorrect. Please read the instructions again.'},
    ];
    verify(l, t, msg);
  });

  it('ok ##COLOR(RGBA; NAMED)## (rgba)', () => {
    const l = 'h1 { color: rgba(  255  ,255 , 255  , 0.5)  }';
    const t = 'h1 { color: ##  COLOR(RGBA; NAMED) ## }';
    verify(l, t);
  });

  it('ok ##COLOR(RGBA; NAMED)## (named color)', () => {
    const l = 'h1 { color:  purple  }';
    const t = 'h1 { color: ##  COLOR(RGBA; NAMED) ## }';
    verify(l, t);
  });

  it('fail ##COLOR(RGBA; NAMED)## (rgb)', () => {
    const l = 'h1 { color:   rgb(255,  255,  255);  }';
    const t = 'h1 { color: ##  COLOR(RGBA; NAMED) ## }';
    const msg = [
      {fail: 'In the h1 {} rule, color: rgb(255, 255, 255) is incorrect. Try using an rgba color or a color name.'},
    ];
    verify(l, t, msg);
  });

  it('fail ##COLOR(RGBA; NAMED)## (hex)', () => {
    const l = 'h1 { color:  #123456;  }';
    const t = 'h1 { color: ##  COLOR(RGBA; NAMED) ## }';
    const msg = [
      {fail: 'In the h1 {} rule, color: #123456 is incorrect. Try using an rgba color or a color name.'},
    ];
    verify(l, t, msg);
  });

  it('fail ##COLOR(RGB; RGBA; NAMED)## (hex)', () => {
    const l = 'h1 { color:  #123456;  }';
    const t = 'h1 { color: ##  COLOR(RGB; RGBA; NAMED) ## }';
    const msg = [
      {fail: 'In the h1 {} rule, color: #123456 is incorrect. Try using an rgb color, an rgba color or a color name.'},
    ];
    verify(l, t, msg);
  });

  it('ok with ##URL## with quotes', () => {
    const l = 'h1 { background-image:  url("www.pic.com/pic.jpg"); }';
    const t = 'h1 { background-image: ##  URL ## }';
    verify(l, t);
  });

  it('ok with ##URL## without quotes', () => {
    const l = 'h1 { background-image:  url("www.pic.com/pic.jpg"); }';
    const t = 'h1 { background-image: ##  URL ## }';
    verify(l, t);
  });

  it('failure with ##URL## missing url()', () => {
    const l = "h1 { background-image: 'pic.jpg';  }";
    const t = 'h1 { background-image: ##  URL ## }';
    const msg = [
      {fail: "In the h1 {} rule, background-image: 'pic.jpg' is incorrect. The syntax should be: url(\"link\")."},
    ];
    verify(l, t, msg);
  });

  it('failure with ##URL## specifying none', () => {
    const l = 'h1 { background-image: url("awesome_pic"); }';
    const t = 'h1 { background-image: ##  URL ## }';
    const msg = [
      {fail: "In the h1 {} rule, background-image: url(\"awesome_pic\") doesn't contain a valid image link. Please read the instructions again."},
    ];
    verify(l, t, msg);
  });

  it.skip('ok with ##URL(JPG)##', () => {
    // TODO: we should check the file extension AND ensure that the
    // mime type of the image is valid and no 404 etc.
    const l = 'h1 { background-image:  url("www.pic.com/pic.jpg"); }';
    const t = 'h1 { background-image: ##  URL ## }';
    verify(l, t);
  });

  it.only('error messages when compare declarations to selector', () => {
    const l = `h1 {
                color: red;
              }`;
    const t = 'color: royalblue';
    const msg = [
      {fail: 'The h1 selector is not required. Please remove or correct it.'},
    ];
    verify(l, t, msg);
  });

  it('error message when learner css empty', () => {
    const l = '  ';
    const t = 'h1 { color: red }';
    const msg = [
      {fail: "Make sure you haven't left the editor block empty."},
    ];
    verify(l, t, msg);
  });

  it('error when declarationOnly with learner css empty', () => {
    const l = ' ';
    const t = 'color: red;';
    const msg = [
      {fail: "Make sure you haven't left the editor block empty."},
    ];
    verify(l, t, msg);
  });

  it('fail @import URL link mismatach', () => {
    const l = '@import url("http://font.googleapis.com/css?family=Arial");';
    const t = '@import URL("http://font.googleapis.com/css?family=Roboto");';
    const msg = [{fail: 'Arial is incorrect. Please read the instructions again.'}];
    verify(l, t, msg);
  });

  it('fail nested at-rule identifier mismatch', () => {
    const l = '@media scren {  }';
    const t = '@media screen {    }';
    const msg = [{fail: 'scren is incorrect. Please read the instructions again.'}];
    verify(l, t, msg);
  });

  it('fail missing at-rule (no at-rule at all)', () => {
    const l = 'div {}';
    const t = '@keyframes anim {  }';
    const msg = [{fail: "Your code doesn't contain any at-rule."}];
    verify(l, t, msg);
  });

  it('fail missing at-rule (mismatching at-rule)', () => {
    const l = '@media print {}';
    const t = '@keyframes anim {  }';
    const msg = [{fail: "We didn't find the @keyframes at-rule in your code."}];
    verify(l, t, msg);
  });

  it('fail extra at-rule', () => {
    const l = '@keyframes anim {  } @media print {}';
    const t = '@keyframes anim {  }';
    const msg = [{fail: 'The @media print at-rule is not required. Please remove it.'}];
    verify(l, t, msg);
  });

  it('nested rule - fail selector mismatch', () => {
    const l = '@keyframes anim { 0% {} 90% {} }';
    const t = '@keyframes anim { 0% {} 100% {} }';
    const msg = [{fail: "We didn't find the 100% keyframe in your code."}];
    verify(l, t, msg);
  });

  it('nested rule - fail single extra selector', () => {
    const l = '@keyframes anim { 0% {} 90% {} 100% {} }';
    const t = '@keyframes anim { 0% {} 100% {} }';
    const msg = [{fail: 'The 90% keyframe is not required. Please remove it.'}];
    verify(l, t, msg);
  });

  it('nested rule - fail multiple extra selectors', () => {
    const l = '@keyframes anim { 0% {} 50% {} 75% {} 90% {} 100% {} }';
    const t = '@keyframes anim { 0% {} 75% {} }';
    const msg = [{fail: 'The 50%, 90% and 100% keyframes are not required. Please remove them.'}];
    verify(l, t, msg);
  });

  it('nested rule - fail declaration mismatch', () => {
    const l = '@keyframes anim { 0% { margin: 10px; } }';
    const t = '@keyframes anim { 0% { margin: auto } }';
    const msg = [{fail: 'In the 0% {} rule, margin: 10px is incorrect. Please read the instructions again.'}];
    verify(l, t, msg);
  });

  it('nested rule - fail duplicated declaration', () => {
    const l = '@keyframes anim { 0% { margin: 0;\n margin: 0; } }';
    const t = '@keyframes anim { 0% { margin: 0; } }';
    const msg = [{warn: "The margin property shouldn't appear more than once in the 0% {} rule. Please correct it."}];
    verify(l, t, msg);
  });

  it('nested rule - fail media rules content', () => {
    const l = '@media print { div { margin: 0; } }';
    const t = '@media print { div { margin: auto } }';
    const msg = [{fail: 'In the div {} rule, margin: 0 is incorrect. Please read the instructions again.'}];
    verify(l, t, msg);
  });

  it('nested rule - fail duplicated declaration', () => {
    const l = '@media print { div { margin: 0;\n margin: 0; } }';
    const t = '@media print { div { margin: 0 } }';
    const msg = [{warn: "The margin property shouldn't appear more than once in the div {} rule. Please correct it."}];
    verify(l, t, msg);
  });

  it('nested rule - fail when teacher code is empty', () => {
    const l = '@media print { div { margin: 0;\n margin: 0; } }';
    const t = ' ';
    const msg = [{fail: 'Your code is incorrect. Please read the instructions again.'}];
    verify(l, t, msg);
  });
});

function verify(l, t, expectedMessages = [], opts = null) {
  const teacherAst = new CssAst(t);

  if (teacherAst.messages.length === 0) {
    const learnerAst = new CssAst(l, teacherAst.options);

    if (learnerAst.messages.length === 0) {
      const comparer = new CssAstComparer(teacherAst.options);
      comparer.compare(teacherAst, learnerAst, opts);

      if (comparer.messages.length > 0 && expectedMessages.length == 0) {
        console.log('Received failures:', comparer);
      }

      for (let m of comparer.messages) {
        expect(m.message).not.toContain(AUTO_ADDED_SELECTOR);
      }

      expect(comparer.messages.length).toEqual(expectedMessages.length);

      for (let em in expectedMessages) {
        const msgType = Object.keys(expectedMessages[em]);
        const expectedMsg = expectedMessages[em][msgType];
        const actualMsg = comparer.messages[em];

        expect(actualMsg.type).toEqual(msgType[0]);
        expect(actualMsg.message).toEqual(expectedMsg);
      }
    } else {
      console.warn('WARNING: parsing the learner CSS has produced error messages which skips the comparison test:');
      console.log('learnerAst.messages:', learnerAst.messages);
      console.log('learner code:', l);
      console.log('teacher code:', t);
    }
  }
}
