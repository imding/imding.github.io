loading();

function loading() {
    if (document.body) init();
    else window.requestAnimationFrame(loading);
}

function init() {
    appContainer.style.visibility = 'visible';

    
}

class Node {
    constructor(x, y, w, h) {


        this.el = document.createElement('g');
        this.body = document.createElement('rect');
        
        this.el.appendChild(this.body);
    }
}