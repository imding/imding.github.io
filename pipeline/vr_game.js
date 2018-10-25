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

    const
        nodesData = [
            ['Day 1', [
                'Introduction',
                //  introduction & set expectations
                //  show the final game ( without score, without timer, without enemies )
                //  

                '>> Web Fundamentals',
                //  HTML - elements, tags, attribute, content
                //  CSS - selectors, properties
                //  HTML & CSS - id, class

                '>> JS Basics',
                //  variables & function - calculator
                //  onclick - mole clicker

                '>> ThreeJS',
                //  visit https://threejs.org/ and see what others have built
                //  what caught you attention the most
                //  what do you think was saved in a vairable
                //  what was a function
                //  was there any events & how were they handled
            ]],

            ['>> Day 2', [
                'Virutal Environment',
                //  setup threejs using cdn
                //  code: camera, controls, scene

                '>> Vectors',
                //  2d vectors
                //  3d vectors
                //  arrays
                //  postions & rotation
                //  code: build the cube object

                '>> Loops'
                //  for loop, while loops
                //  code: add each side to sky box
            ]],

            ['>> Day 3', [
                'Design Direction',
                //  pick between a game or an info app and design it
                //  game - 2 types of floating sprites
                //  app - 
                //  use google map to find locations (we define a list) where you want pictures

                '>> Pano2VR',
                //  demo taking images in the office
                //  demo pano2vr workflow
                //  distribute checklist for afternoon session
                //      
                
                '>> Custom Cubemap',
                //  visit locations and take photos
            ]],

            ['>> Day 4', [
                

                'Workshop',
                //  
            ]],

            ['>> Day 5', [
                'Test & Debug',

                '>> Presentation',
            ]],
        ],
        decksData = {
            introduction: [{
                title: 'Outline',
                sections: [{
                    content: [
                        { type: 'p', html: '.' },
                    ],
                }],
            }],
        };

    pl = new Pipeline(Root);
    pl.render(nodesData, decksData);

    pl.creatorAccess();
}
