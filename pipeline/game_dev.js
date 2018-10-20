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

                '>> Game Asset',

                '>> Game Mechanic',
            ]],

            ['>> Actors', [
                'Describing Actors',

                '>> Controlling Actors',

                '>> Actor Interactions',
            ]],

            '>> Videogame History',

            ['>> Spritesheet', [
                'The Workflow',

                '>> CSS Techniques',

                '>> Dino Jump',
            ]],

            ['>> Collision', [

                'Collision Detection',

                '>> Pong',

                '>> Playability',

                '>> Two Players',
            ]],

            ['>> Frame Update', [
                'Recursive Function',

                '>> Keyframes',

                '>> Animation'
            ]],

            ['>> Physics', [
                'The Real Physics',

                '>> Simulation',

                '>> Angry Bird'

            ]],

            ['>> Conclusion', [
                'Design Your Own Game',

                '>> Presentation'
            ]],
        ],
        decksData = {
            actorInteractions: [{
                title: 'Outline',
                sections: [{
                    title: '',
                    content: [
                        { type: 'p', html: 'Students guide the teacher, step by step, to win/lose the game.' },
                        { type: 'p', html: 'Summarise the steps using a [em::flow chart].' },
                        { type: 'p', html: 'Follow the [guided project::#][sup::wip] to add winning/losing conditions for the football game.' },
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
                        { type: 'p', html: '[u::Extension]: customisation' },
                    ],
                }, {
                    title: 'Internal',
                    content: [
                        { type: 'p', html: 'Just an idea, we can do other games.' },
                        { type: 'p', html: 'Could potentially do [u::Phaser] here but it will be super focused on just the physics component.' },
                    ],
                }],
            }],
            controllingActors: [{
                title: 'Outline',
                sections: [{
                    title: '',
                    content: [
                        { type: 'p', html: 'In [sandbox::#][sup::wip] with [guide::#][sup::wip], learn and apply the CSS [samp::position] property & JS [samp::.style] syntax to move an HTML element.' },
                        { type: 'p', html: 'Follow the [guided project::#][sup::wip] to build the UI and controlling mechanism for the football game.' },
                    ],
                }],
            }],
            describingActors: [{
                title: 'Outline',
                sections: [{
                    title: '',
                    content: [
                        { type: 'p', html: 'Provide [em::definition] of an actor in videogames and identify them in case studies.' },
                        { type: 'p', html: 'Learn to [em::describe] actors using variables & functions.' },
                        { type: 'p', html: 'Demo & play the [football game::https://app.bsd.education/sandbox/35Y4HYmt], identify the variables & functions required to fully describe them in [worksheet::#][sup::wip].' },
                    ],
                }],
            }],
            dinoJump: [{
                title: 'Card Title',
                sections: [{
                    title: '',
                    content: [
                        { type: 'p', html: 'Follow the [guided project::#][sup::wip] to build the "Dino Jump" game.' },
                    ],
                }, {
                    title: 'Internal',
                    content: [
                        { type: 'p', html: 'We need to strip canvas from the game.' },
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
            gameDev101: [{
                title: 'Outline',
                sections: [{
                    title: '',
                    content: [
                        { type: 'p', html: 'Introduction to the program.' },
                        { type: 'p', html: 'Get a deeper understanding of video games and how they are built using this [slide::#][sup::wip].' },
                        { type: 'p', html: 'Analyse classic games and break them down into 2 components: [em::assets] & [em::mechanics].' },
                        { type: 'p', html: '[u::Activity]: identify game genres with [worksheet::#][sup::wip].' },
                    ],
                }],
            }],
            gameMechanic: [{
                title: 'Outline',
                sections: [{
                    title: '',
                    content: [
                        { type: 'p', html: 'Introduce and/or revise JS using the [part 1::https://drive.google.com/open?id=1A1rw5PJHd1YqtWfsCeuxSF2H4m3rJDc7OiTTVOPTpSw] & [part 2::https://drive.google.com/open?id=1v3T4rwSqCf8atT7GTuiUB-b2-Fo9Uc4JNfRjlKT9xHk] of the [b::Intro to JavaScript] slides.' },
                        { type: 'p', html: 'Follow [guided project::#][sup::wip] to make the previous character selection project include aspects of [em::character creation].' },
                        { type: 'p', html: '[u::Extension]: customisation.' },
                    ],
                }],
            }],
            theWorkflow: [{
                title: 'Outline',
                sections: [{
                    title: '',
                    content: [
                        { type: 'p', html: 'Dissect an animated character into [em::individual frames], explain the advantages of putting all the frames into one image.' },
                        { type: 'p', html: 'Use the [interactive project::#][sup::wip] to get a deeper understanding of how the spritesheet system works.' },
                    ],
                }, {
                    title: 'Internal',
                    content: [
                        { type: 'p', html: 'The interactive project should have a spritesheet on the left and an animated character on the right.' },
                        { type: 'p', html: 'The visible frame in the animation is highlighted in the spritesheet.' },
                        { type: 'p', html: 'Students are able to define the order in which the frames are displayed, thus changing the resulting animation.' },
                        { type: 'p', html: 'Challenge students to discover the correct sequence so that the character is correctly animated.' },
                    ],
                }],
            }],
            videogameHistory: [{
                title: 'Card Title',
                sections: [{
                    title: '',
                    content: [
                        { type: 'p', html: 'Use [slides::#][sup::wip] and [quizes::#][sup::wip] to teach the history of videogames.' },
                    ],
                }, {
                    title: 'Internal',
                    content: [
                        { type: 'p', html: 'Perhaps we can play parts of a documentary in class?' },
                    ],
                }],
            }],
        };

    pl = new Pipeline(Root);
    pl.render(nodesData, decksData);
}
