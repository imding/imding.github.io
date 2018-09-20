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
        ['Fundamentals', [
            'Intro to App Dev',
            '>> Web Fundamental',
        ]],
        ['>> Frameworks', [
            'Intro to F7',
            '>> UI Flow',
        ]],
        ['>> Database', [
            'Lesson 5',
            '>> Lesson 6'
        ]],
    ];

    const cardsData = [{
        deck: 'introToAppDev',
        cards: [{
            title: 'Lesson Plan',
            sections: [{
                content: [
                    { type: 'p', html: '[em::Native vs. Hybrid Development] - Slides & multimedia focused on introducing app development and the different approaches, as well as the pro/con of each.' },
                    { type: 'p', html: 'Include the [em::frameworks] that will be used later on.' },
                    { type: 'p', html: 'Mention that [em::HTML] is one of the requirements for hybrid development.' },
                    { type: 'p', html: 'Intro to web languages and start with the basics.' },
                ]
            }],
        }, {
            title: 'Slide',
            sections: [{
                content: [
                    { type: 'p', html: '[link::#]' },
                ]
            }],
        }],
    }, {
        deck: 'webFundamental',
        cards: [{
            title: 'Lesson Plan',
            sections: [{
                content: [
                    { type: 'p', html: 'Standard unit plan for HTML & CSS.' },
                    { type: 'p', html: 'Cover [em::nesting], [em::id & class names], [em::CSS styling].' },
                ]
            }],
        }],
    }, {
        deck: 'introToF7',
        cards: [{
            title: 'Lesson Plan',
            sections: [{
                content: [
                    { type: 'p', html: 'Revisit the concept of frameworks using previous slide.' },
                    { type: 'p', html: '[em::Setting up] Framekwork7 - sandbox template for the class to set up Framework7. Add [slides::#] as supporting material for the teacher.' },
                    { type: 'p', html: 'Create a basic interface using the [guided project::#] on the platform.' },
                ]
            }],
        }],
    }];

    pl = new Pipeline(Root);
    pl.render(nodesData, cardsData);
}