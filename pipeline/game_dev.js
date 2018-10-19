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
            ['Introduction', [
                'Game Dev 101',
                //  analyse classic games and break them down into 2 components: assets & mechanics
                //  typical workflow of game development using case studies
                //  activity: define the workflow of an existing/hypothetical game

                '>> Game Asset',
                //  revise HTML & CSS
                //  sandbox & guide: create various game assets using HTML & CSS
                //  guided project: character selection

                '>> Game Mechanic',
                //  focus on revising JS
                //  guided project: enhance the character selection project into character creation
                //  extension: customisation
            ]],

            ['>> Actors', [
                'Describing Actors',
                //  demo the football game and identify the actors
                //  activity: describe an actor using variables
                //  challenge: describe the actor in terms of variables ( worksheet with 3 column: actors, variables, functions )

                '>> Controlling Actors',
                //  sandbox & guide: learn how the .style syntax works
                //  guided project: create the football game UI & add the controlling mechanism

                '>> Actor Interactions',
                //  activity: 
            ]],

            '>> Videogame History',
            //  slides and quizes

            ['>> Spritesheet', [
                'Using Spritesheets',
                //  
                
                '>> Dino Jump',
            ]],

            ['>> Collision', [

                'Collision Detection',
                //  

                '>> Pong',
                //  

                '>> Playability'
            ]],

            ['>> Frame Update', [
                'Recursive Function',
                //  

                '>> Keyframes',
                //  create a bouncing ball using CSS animation

                '>> Animation'
            ]],

            ['>> Physics', [
                'The Real Physics',
                //   

                '>> Simulation',

                '>> Angry Bird'

            ]],

            ['>> Conclusion', [
                'Design Your Own Game',
                //  apply everything 

                '>> Presentation'
                //  
            ]],
            //  
        ],
        decksData = {
            gameDev101: [{
                title: 'Outline',
                sections: [{
                    title: '',
                    content: [
                        { type: 'p', html: 'Introduction to the program. Get a deeper understanding of video games and how they are built using this [slide::#][sup::wip].' },
                        { type: 'p', html: 'Analyse classic games and break them down into 2 components: [em::assets] & [em::mechanics].' },
                        { type: 'p', html: '[u::Activity]: identify game genres with [worksheet::#][sup::wip].' },
                    ],
                }],
            }],
            gameAsset: [{
                title: 'Outline',
                sections: [{
                    title: '',
                    content: [
                        { type: 'p', html: 'Focus on revising HTML & CSS.' },
                        { type: 'p', html: 'Follow [guided project::#][sup::wip] to create a character selection screen (as in this [sandbox::https://app.bsd.education/sandbox/Remtq4TL]) using HTML & CSS [i::without] JS.' },
                    ],
                }],
            }],
            gameMechanic: [{
                title: 'Outline',
                sections: [{
                    title: '',
                    content: [
                        { type: 'p', html: 'Introduce and/or revise JS using [slide 1::https://drive.google.com/open?id=1A1rw5PJHd1YqtWfsCeuxSF2H4m3rJDc7OiTTVOPTpSw] & [slide 2::https://drive.google.com/open?id=1v3T4rwSqCf8atT7GTuiUB-b2-Fo9Uc4JNfRjlKT9xHk].' },
                        { type: 'p', html: 'Follow [guided project::#][sup::wip] to turn the previous character selection project include aspects of [em::character creation].' },
                        { type: 'p', html: '[u::Extension]: customisation.' },
                    ],
                }],
            }],
            describingActors: [{
                title: 'Outline',
                sections: [{
                    title: '',
                    content: [
                        { type: 'p', html: 'Provide definition of an actor in videogames and identify them in case studies.' },
                        { type: 'p', html: 'Learn to describe actors using variables & functions.' },
                        { type: 'p', html: 'Demo & play the [football game::https://app.bsd.education/sandbox/35Y4HYmt], identify the variables & functions required to fully describe them in [worksheet::#][sup::wip].' },
                    ],
                }],
            }],
            controllingActors: [{
                title: 'Outline',
                sections: [{
                    title: '',
                    content: [
                        { type: 'p', html: 'In [sandbox::#][sup::wip] with [guide::#][sup::wip], learn and apply the [samp::position] & [samp::.style] syntax to move an HTML element.' },
                        { type: 'p', html: 'Follow the [guided project::#][sup::wip] to build the UI and controlling mechanism for the football game.' },
                    ],
                }],
            }],
            actorInteractions: [{
                title: 'Outline',
                sections: [{
                    title: '',
                    content: [
                        { type: 'p', html: 'Guide the teacher, step by step, to win/lose the game.' },
                        { type: 'p', html: 'Summarise the steps using a [em::flow chart].' },
                        { type: 'p', html: 'Follow the [guided project::#][sup::wip] to add winning/losing conditions to the football game.' },
                        { type: 'p', html: '[u::Extension]: add a score system to the football game.' },
                    ],
                }],
            }],
            angryBird: [{
                title: 'Outline',
                sections: [{
                    title: '',
                    content: [
                        { type: 'p', html: 'Follow [guided project::#][sup::wip] to build a physics based game.' },
                        { type: 'p', html: '[u:Extension]: customisation' },
                    ],
                }, {
                    title: 'Internal',
                    content: [
                        { type: 'p', html: 'Just an idea, we can do other games.' },
                        { type: 'p', html: 'Could potentially do [u::Phaser] here but it will be super focused on just the physics component.' },
                    ],
                }],
            }],
        };

    pl = new Pipeline(Root, 'game_dev');
    pl.render(nodesData, decksData);
    
    pl.adminAccess();
}
