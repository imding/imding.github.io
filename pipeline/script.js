loading();

function loading() {
    if (document.body) init();
    else setTimeout(loading, 500);
}

function init() {
    // add utility functions to window object
    Object.assign(window, new Utility());

    // display app container
    sCss(document.body, { visibility: 'visible' });

    const nodesData = [
        'Node 1',
    ];

    const cardsData = {
        node1: [{
            title: 'Card Title',
            sections: [{
                content: [
                    { type: 'p', html: '' },
                ],
            }],
        }],
    };

    pl = new Pipeline(Root);
    pl.render(nodesData, cardsData);

    pl.creatorAccess();
}