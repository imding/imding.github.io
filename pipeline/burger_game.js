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
            'Web Fundamentals',
            //  what are web applications & how to build one
            //  the browser & web languages
            //  inspect element

            '>> HTML Basics',
            //  build/clone a web page
            //  add text, links, images and shapes

            '>> CSS Basics',
            //  size: width, height, border, padding, box-sizing
            //  position: margin, absolute, relative, left, top
            //  appearance: color & images
            //  id & class selectors

            '>> Game UI',
            //  guided project: build the UI of the game without any functionality
        ]],
        ['>> Day 2', [
            'Logic Flow',
            //  unplugged: how to build it
            //  make flowchart for the burger game
            //  
            
            '>> JS Basics',
            //  variables & functions
            //  trivia game
            //  arithmetic operators
            

            '>> Handling Events',
            //  unplugged: reaction game
            //  sandbox: listener & handlers
            //  guided project: clicker game

            '>> JS Styling',
            //  sandbox: .style syntax
            //  guided project: pacman controller
        ]],
        ['>> Day 3', [
            '>> DOM',
            //  sandbox: the querySelector & querySelectorAll functions
            

            'Array Data Type',
            //  guide project: light bulb on & off - toggling light & adding more lights

            'Using Loops',
            //  for

            '>> Game Mechanics',
        ]],
        ['>> Day 4', [
            'Mobile Compatibility',
            // pointer events

            '>> CSS Animation',
            //  animation property in CSS
            //  animation events in JS

            '>> Customisation',
        ]],
        ['>> Day 5', [
            'Test & Debug',
            '>> Tournament',
            '>> Presentation',
        ]],
    ];

    const cardsData = [{
        deck: 'webFundamentals',
        cards: [{
            title: 'Lesson Outline',
            sections: [{
                content: [
                    { type: 'p', html: '.' },
                    { type: 'p', html: '[u::Unplugged]: inspect element.' },
                ],
            }],
        }],
    }];

    pl = new Pipeline(Root);
    pl.render(nodesData, cardsData);
}