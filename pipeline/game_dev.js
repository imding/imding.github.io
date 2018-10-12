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
        ['Introduction', [
            'Web Basics',
            //  HTML, CSS revision
            //  challenge: make a page
            //  challenge: debug a page
            //  JS revision

            'Game Dev 101',
            //  introduce asset & mechanics using classic games
            //  typical workflow of game development
            //  activity: define the workflow of a hypothetical game

            '>> Game Asset',
            //  focus on revising HTML & CSS
            //  create various game assets using HTML & CSS
            //  guided project: add various game elements to a web page

            '>> Game Mechanic',
            //  focus on revising JS
            //  describing game logic using flowchart
            //  implementing the flow logic using JS
            //  guided project: use conditionals and loops to create narrative ( choose your adventure ) 
        ]],

        ['>> '],
        
        'Collision Detection',
        //  

        'Canvas',
        //  

        
        ['>> Rendering System', [
            
        ]],
        //  

        '>> Presentation',
    ];

    const cardsData = [{
        deck: 'presentation',
        cards: [{
            title: 'Lesson Outline',
            sections: [{
                content: [
                    { type: 'p', html: '.' },
                ],
            }],
        }],
    }];

    pl = new Pipeline(Root);
    pl.render(nodesData, cardsData);
}
