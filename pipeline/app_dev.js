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
            '>> Web Fundamentals',
        ]],
        ['>> Frameworks', [
            'Intro to F7',
            '>> To-do List'
        ]],
        '>> Flow Chart',
        '>> App Functionality',
        ['>> Database', [
            'API & JavaScript',
            '>> Firebase & Dataflow',
            '>> Enhance To-do List',
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
                ],
            }],
        }, {
            title: 'Slide',
            sections: [{
                content: [
                    { type: 'p', html: '[link::#]' },
                ],
            }],
        }],
    }, {
        deck: 'webFundamentals',
        cards: [{
            title: 'Lesson Plan',
            sections: [{
                content: [
                    { type: 'p', html: 'Standard unit plan for HTML & CSS.' },
                    { type: 'p', html: 'Cover [em::nesting], [em::id & class names], [em::CSS styling].' },
                ],
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
                ],
            }],
        }],
    }, {
        deck: 'todoList',
        cards: [{
            title: 'Lesson Plan',
            sections: [{
                content: [
                    { type: 'p', html: 'Start the to-do list UI [guided porject::#].' },
                    { type: 'p', html: 'Extension: [em::customise] the to-do list.' },
                ],
            }],
        }],
    }, {
        deck: 'flowChart',
        cards: [{
            title: 'Lesson Plan',
            sections: [{
                content: [
                    { type: 'p', html: 'Introduce the concept of [em::flow charts].' },
                    { type: 'p', html: 'Unplugged: contrast how difficult it is to understand a complex app without the flow chart and vice versa.' },
                    { type: 'p', html: 'Hands-on: create the flow chart.' },
                    { type: 'p', html: 'Start the to-do list functionality [guided project::#] if there is extra time.' },
                ],
            }],
        }],
    }, {
        deck: 'apiJavascript',
        cards: [{
            title: 'Lesson Plan',
            sections: [{
                content: [
                    { type: 'p', html: 'Introduce the [em::concpet of API] using slides.' },
                    { type: 'p', html: 'Unplugged: interpreter.' },
                    { type: 'p', html: '[em::JS fundamentals]: variables, datatypes, functions.' },
                ],
            }],
        }],
    }, {
        deck: 'firebaseDataflow',
        cards: [{
            title: 'Lesson Plan',
            sections: [{
                content: [
                    { type: 'p', html: 'Local vs. [em::cloud computing].' },
                    { type: 'p', html: 'Unplugged: activity involving two groups of students.' },
                    { type: 'p', html: 'Revisit the flow chart and [em::identify] which data point needs to be sent to the cloud.' },
                    { type: 'p', html: '[em::Modify] the flow chart to include the additional operations required for the app to become database enabled.' },
                ],
            }],
        }],
    }, {
        deck: 'enhanceTodoList',
        cards: [{
            title: 'Lesson Plan',
            sections: [{
                content: [{ type: 'p', html: '.' }],
            }],
        }],
    }];

    pl = new Pipeline(Root);
    pl.render(nodesData, cardsData);
}