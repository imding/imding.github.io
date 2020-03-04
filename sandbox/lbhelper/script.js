const
    dot = document.createElement('div'),
    menu = document.createElement('div'),
    detail = document.createElement('div'),
    btnClose = document.createElement('div'),
    btnBack = document.createElement('button'),
    htmlKeys = ['Element', 'Tag', 'Attribute', 'Value', 'Void Element'],
    cssKeys = ['Selector', 'Target', 'Rule', 'Property', 'Value'],
    jsKeys = ['Variable', 'Function', 'Argument', 'Array'];

const html =
{
    Attribute: {
        key: 'Attribute',
        content: `${esc('<h1 id="title" class="clickable"></h1>')} has two attributes: id & class`,
    }
};

let cards = '',
    debug = true;

Object.prototype.childElementsByClass = function(name) {
    return Array.from(this.getElementsByClassName(name));
};

dot.style.position = 'fixed';
dot.style.width = '50px';
dot.style.height = '50px';
dot.style.left = 'calc(50% - 25px)';
dot.style.top = '-25px';
dot.style.padding = '0 20px 30px 20px';
dot.style.borderRadius = '50%';
dot.style.boxShadow = '2px 2px 5px 1px rgba(0, 0, 0, 0.5)';
dot.style.background = 'rgba(40, 40, 38, 0.9)';
dot.style.fontFamily = 'arial';
dot.style.userSelect = 'none';
dot.style.cursor = 'pointer';
dot.style.boxSizing = 'border-box';
dot.style.overflow = 'hidden';
dot.style.transitionProperty = 'width, height, top, left, borderRadius';
dot.style.transitionDuration = '0.25s';

detail.style.position = 'absolute';
detail.style.width = 'calc(100% - 40px)';
// detail.style.backgroundColor = 'silver';
detail.style.top = '0';

[menu, btnClose].forEach(e => e.style.transition = 'opacity 0.25s');

btnClose.style.position = 'absolute';
btnClose.style.top = '5px';
btnClose.style.right = '10px';
btnClose.style.width = '20px';
btnClose.style.height = '20px';
btnClose.style.fontSize = '1.5em';
btnClose.style.borderRadius = '50%';
btnClose.style.color = 'ghostwhite';
btnClose.style.cursor = 'pointer';
btnClose.innerHTML = '&#10539;';

['color', 'cursor', 'backgroundColor'].forEach(p => btnBack.style[p] = btnClose.style[p]);
btnBack.style.backgroundColor = 'indianred';
btnBack.style.border = 'none';
btnBack.style.outline = 'none';
btnBack.style.height = '28px';
btnBack.style.padding = '6px 15px 4px 15px';
btnBack.style.borderRadius = '0 0 5px 5px';
btnBack.style.fontSize = '1.1em';
btnBack.innerHTML = 'Back to menu';

// ======================================== KEY ARRAYS ========== //
[htmlKeys, cssKeys, jsKeys].forEach((ka, i) => {
    const type = i ? (i > 1 ? 'js' : 'css') : 'html';
    ka.sort().forEach((k, j) => {
        !j ? cards += `<h2 class="cardHeadings">${type.toUpperCase().replace('JS', 'JavaScript')}</h2>` : null;
        cards += (`\n<button class="${type} btnCards">${k}</button>`);
    });
});

menu.innerHTML = cards;

// ======================================== EVENTS ========== //
window.onload = function() {
    document.body.appendChild(dot);
    dot.appendChild(menu);
    dot.appendChild(btnClose);

    dot.childElementsByClass('btnCards').forEach(e => {
        e.style.marginBottom = '5px';
        e.style.padding = '4px 6px 3px 5px';
        e.style.borderRadius = '4px';
        e.style.border = 'none';
        e.style.outline = 'none';
        e.style.cursor = 'pointer';
        e.style.color = 'white';
        e.onclick = () => showDetail(e, eval(e.classList[0])[e.innerHTML].content);
    });
    dot.childElementsByClass('html').forEach(e => e.style.background = '#39f');
    dot.childElementsByClass('css').forEach(e => e.style.background = '#f90');
    dot.childElementsByClass('js').forEach(e => e.style.background = '#96f');
    dot.childElementsByClass('cardHeadings').forEach(e => {
        e.style.color = 'ghostwhite';
        e.style.margin = '30px 0 10px 0';
    });

    [menu, btnClose].forEach(e => e.style.opacity = '0');
    menu.style.width = window.outerWidth - 60 + 'px';
};

window.onresize = function() {
    menu.style.width = window.outerWidth - 60 + 'px';

    if (menu.style.opacity == '0') {
        console.log(detail.offsetHeight);
    }
};

window.onkeydown = function(evt) {
    if (evt.keyCode == 27 && menu.style.opacity == '0') btnBack.click();

    if (evt.keyCode == 112) {
        dot.innerHTML ? btnClose.click() : dot.click();
        evt.preventDefault();
        return false;
    }
};

dot.onclick = function(){
    if (this.offsetWidth <= 50) {     debug ? log('dot.onclick') : null;
        [menu, btnClose].forEach(e => e.style.opacity = '1');
        this.style.cursor = 'default';
        this.style.width = 'calc(100% - 20px)';
        this.style.height = menu.clientHeight + 60 + 'px';
        this.style.top = '10px';
        this.style.left = '10px';
        this.style.borderRadius = '10px';
    }
};

btnClose.onclick = function() {
    if (dot.offsetWidth > 50) {   debug ? log('btnClose.onclick') : null;
        if (menu.style.opacity == '0') btnBack.click();
        dot.style.cursor = 'pointer';
        dot.style.width = '50px';
        dot.style.height = '50px';
        dot.style.top = '-25px';
        dot.style.left = 'calc(50% - 25px)';
        dot.style.borderRadius = '25px';
        [menu, btnClose].forEach(e => e.style.opacity = '0');
    }
};

btnBack.onclick = function() {
    detail.innerHTML = '';
    dot.removeChild(detail);
    dot.style.height = menu.clientHeight + 60 + 'px';
    [menu, btnClose].forEach(e => e.style.opacity = '1');
};

// ======================================== FUNCTIONS ========== //
function showDetail(e, c){     debug ? log('showDetail(e): e is [' + (e.classList[0] + e.innerHTML).replace(/\s/g, '') + '.gif]') : null;
    const 
        link = `${(e.classList[0] + e.innerHTML).replace(/\s/g, '')}.gif`,
        title = document.createElement('button'),
        content = document.createElement('div');

    detail.appendChild(btnBack);
    detail.appendChild(title);
    detail.appendChild(content);
    
    dot.appendChild(detail);

    title.innerHTML = `${e.classList[0].toUpperCase()} - ${e.innerHTML}`;
    content.innerHTML = c;

    ['color', 'backgroundColor'].forEach(p => title.style[p] = e.style[p]);
    ['height', 'outline', 'border', 'fontSize', 'borderRadius', 'padding'].forEach(p => title.style[p] = btnBack.style[p]);

    title.style.position = 'absolute';
    title.style.top = '0';
    title.style.left = btnBack.offsetLeft + btnBack.offsetWidth + 10 + 'px';
    title.style.overflow = 'hidden';    

    content.style.marginTop = '10px';
    content.style.width = 'calc(100% - 40px)';
    content.style.borderRadius = '10px';

    menu.style.opacity = '0';

    dot.style.height = detail.offsetHeight + 'px';
}

function esc(s) {
    return s.replace(/</g, '&lt;');
}

function log(msg, opt) {
    if (!opt) opt = 'log';
    let time = new Date();
    eval('console.' + opt)('[' + pad(time.getHours()) + ':' + pad(time.getMinutes()) + ':' + pad(time.getSeconds()) + '] ' + msg);
}

function pad(n) {
    return n.toString().length == 2 ? n : '0' + n.toString();
}