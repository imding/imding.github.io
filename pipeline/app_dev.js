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
        'Fundamentals',
    ];

    const cardsData = [{
        deck: 'fundamentals',
        cards: [{
            title: 'Intro to App Dev',
            sections: [{
                content: [
                    { type: 'p', html: '[em::Native vs. Hybrid Development] - Slides & multimedia focused on introducing app development and the different approaches, as well as the pro/con of each. Include the frameworks that will be used later on. Mention that HTML will be one of the requirements for hybrid development.' },
                ]
            }],
        }],
    }];

    pl = new Pipeline(Root);
    pl.render(nodesData, cardsData);
}