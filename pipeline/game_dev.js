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

    // Initialize Firebase
    const config = {
        apiKey: 'AIzaSyBsuGNus_E4va5nZbPQ5ITlvaFHhI99XpA',
        authDomain: 'd-pipeline.firebaseapp.com',
        databaseURL: 'https://d-pipeline.firebaseio.com',
        projectId: 'd-pipeline',
        storageBucket: 'd-pipeline.appspot.com',
        messagingSenderId: '821024383895',
    };

    // firebase.initializeApp(config);

    // let fire = firebase.firestore();

    // fire.settings({ timestampsInSnapshots: true });

    // // initialise pipeline data
    // let nodesData = [], decksData = [];

    // // read data from firebase
    // fire.collection('game_dev').doc('nodesData').get().then(doc => {
    //     if (!doc.exists) return;

    //     Object.values(doc.data()).forEach(field => {
    //         const addCard = deckName => decksData.push({
    //             deck: camelize(deckName),
    //             cards: [{
    //                 title: '',
    //                 sections: [{ content: [{ type: 'p', html: '...' }] }],
    //             }],
    //         });

    //         if (typeof (field) == 'object') {
    //             field = Object.values(field);
    //             field[0] = nodesData.length ? `>> ${field[0]}` : field[0];
    //             field[1] = field[1].map((val, i) => {
    //                 addCard(val);
    //                 return i ? `>> ${val}` : val;
    //             });
    //         }
    //         else {
    //             field = nodesData.length ? `>> ${field}` : field;
    //             addCard(field);
    //         }

    //         nodesData.push(field);
    //     });

    //     console.log(nodesData);

    //     pl = new Pipeline(Root);
    //     pl.render(nodesData, decksData);

    //     pl.adminAccess();
    // });

    // real-time update
    // fire.collection('game_dev').doc('nodesData').onSnapshot(() => {
    //     console.log('Updates available.');
    // });

    const nodesData = [
        ['Introduction', [
            'Game Dev 101',
            //  analyse classic games and break them down into 2 components: assets & mechanics
            //  typical workflow of game development using case studies
            //  activity: define the workflow of an existing/hypothetical game

            '>> Game Asset',
            //  focus on revising HTML & CSS
            //  create various game assets using HTML & CSS
            //  <img> vs <div> + background-image
            //  guided project: add various game elements to a web page ( generic )

            '>> Game Mechanic',
            //  focus on revising JS
            //  describing game logic using flowchart
            //  implementing the flow logic using JS
            //  guided project: use conditionals and loops to create narrative ( point & click adventure )
        ]],

        ['>> Actors', [
            'Describing Actors',
            //  demo the football game and identify the actors
            //  learn how to describe an actor using variables
            //  activity: change the variable values and see how it affects the game
            //  challenge: watch video clip of a given game, describe the actor in terms of variables ( worksheet )

            '>> Controlling Actors'
            //  learn how the .style syntax works
            //  
        ]],

        ['>> Rules', [
            'Collision Detection',
            //  
        ]],

        ['>> Rendering System', [
            'Frame Rate'
        ]],

        '>> Canvas',
        //  
    ],
        decksData = [{
            deck: 'gameDev101',
            cards: [{
                title: '',
                sections: [{
                    content: [
                        { type: 'p', html: 'Analyse classic games and break them down into 2 components: [em::assets] & [em::mechanics].' },
                    ],
                }],
            }],
        }, {
            deck: 'gameAsset',
            cards: [{
                title: '',
                sections: [{
                    content: [
                        { type: 'p', html: 'Focus on revising HTML & CSS.' },
                        { type: 'p', html: 'create various game assets using HTML & CSS.' },
                        { type: 'p', html: '<img> vs <div> + background-image.' },
                        { type: 'p', html: 'Guided project: add various game elements to a web page ( generic ).' },
                    ],
                }],
            }],
        }, {
            deck: 'gameMechanic',
            cards: [{
                title: '',
                sections: [{
                    content: [
                        { type: 'p', html: 'focus on revising JS.' },
                        { type: 'p', html: 'describing game logic using flowchart.' },
                        { type: 'p', html: 'implementing the flow logic using JS.' },
                        { type: 'p', html: 'guided project: use conditionals and loops to create narrative ( point & click adventure ).' },
                    ],
                }],
            }],
        }];

    pl = new Pipeline(Root);
    pl.render(nodesData, decksData);

    // pl.adminAccess();
}
