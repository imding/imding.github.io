loading();

function loading() {
    if (document.body) init();
    else window.requestAnimationFrame(loading);
}

function init() {
    // add utility functions to window object
    Object.assign(window, new Utility());

    // display app container
    sCss(document.body, {
        visibility: 'visible'
    });

    const pf = new Pipeflow(Root);
}

