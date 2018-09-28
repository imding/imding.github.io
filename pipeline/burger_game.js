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
        ['Day 1', [
            'Web & Game Fundamentals',
            //  what are web applications & how to build one
            //  the browser & web languages
            //  inspect element

            '>> Game UI',
            //  guided project
        ]],
        ['>> Day 2', [
            'JS Intro',
            //  variables & functions
            //  conditionals

            '>> Handling Events',
            //  guided project
        ]],
        ['>> Day 3', [
            'Intermediate JS',
            //  scope
            //  loops

            '>> Game Mechanics',
        ]],
        ['>> Day 4', [
            'Mobile Compatibility',
            '>> Customisation',
        ]],
        ['>> Day 5', [
            'Test & Debug',
            '>> Tournament',
            '>> Presentation',
        ]],
    ];

    const cardsData = [{
        deck: 'webGameFundamentals',
        cards: [{
            title: 'Lesson Outline',
            sections: [{
                content: [
                    { type: 'p', html: '[u::Unplugged]: inspect element.' },
                ],
            }],
        }],
    }];

    pl = new Pipeline(Root);
    pl.render(nodesData, cardsData);
}