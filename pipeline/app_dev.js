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
            //  native vs. hybrid
            //  frameworks - F7 needs HTML
            //  intro to web languages
            //  unplugged: inspect element

            '>> Web Fundamentals',
            //  standard HTML & CSS unit plan
            //  elements, attribues & nesting
            //  styling, id & class names
        ]],
        ['>> Frameworks', [
            'Intro to F7',
            //  recap framework concept
            //  unplugged: interpreter
            //  F7 setup & basic interface creation

            '>> To-do List'
            //  guided project for to-do list UI
            //  optional: customise
        ]],
        '>> Flow Chart',
        //  intro + unplugged: sample app analysis with vs. without flow chart
        //  hands-on: create flow chart for to-do list
        //  connect flow chart with interactivity which requires JS
        //  intro to JS + projects ( trivia game, etc... )

        '>> Handling Events',
        //  intro to event handling
        //  guided project: onkeyup, onkeydown, keycode, onclick, preventDefault
        //  challenge: double click, etc...
        ['>> DOM', [
            'Document Object Manager',
            //  intro to DOM and working with it
            //  guided project: createElement, createTextNode, appendChild, removeChild, setAttribute

            '>> App Functionality',
            //  recap: adding UI elements with F7
            //  guided project for to-do list functionality
        ]],
        ['>> Database', [
            'Firebase & Dataflow',
            //  local vs. cloud + unplugged: ???
            //  analyse & identify data to be sent to cloud
            //  modify flow chart
            //  Firebase setup + initialise
            //  demo: ping database

            '>> Enhance To-do List',
            //  start [guided project::#]
        ]],
        ['>> Community', [
            'Collective Intelligence',
            //  the whole is greater than the sum of its parts
            //  unplugged: 2 groups of students... ???
            //  privacy

            '>> Review App',
            //  introduce the review app and how it can serve the community
            //  how is it different from the to-do list
            //  create flow chart
            //  start guided project

            '>> Promoting An App',
            //  identifying unique selling point
            //  5 characteristics to attract target user
            //  3 for new users & 2 for users of a competitor app
        ]],
        ['>> Sensor API', [
            'Geolocation',
            //  the geolocation API
            //  start guided project

            '>> Lat Long Conversion',
            //  converting lat long values to readable format

            '>> Enhance Review App',
            //  add the geolocation feature
        ]],
        '>> GoNative',
        '>> Presentation',
    ];

    const cardsData = [{
        deck: 'introToAppDev',
        cards: [{
            title: 'Lesson Outline',
            sections: [{
                content: [
                    { type: 'p', html: '[em::Native vs. Hybrid Development] - Slides & multimedia focused on introducing app development and the different approaches, as well as the pro/con of each.' },
                    { type: 'p', html: 'Include the [em::frameworks] that will be used later on.' },
                    { type: 'p', html: 'Mention that [em::web languages] are requirements for hybrid development.' },
                    { type: 'p', html: '[u::Unplugged]: inspect element.' },
                ],
            }],
            }],
    }, {
        deck: 'webFundamentals',
        cards: [{
            title: 'Lesson Outline',
            sections: [{
                content: [
                    { type: 'p', html: 'Standard unit plan for HTML & CSS.' },
                ],
            }, {
                title: 'Part I - 60mins',
                content: [
                    { type: 'p', html: 'Cover [em::elements], [em::attributes] & [em::nesting].' },
                ],
            }, {
                title: 'Part II - 60mins',
                content: [
                    { type: 'p', html: 'Cover [em::styling], [em::id] & [em::class] names.' },
                ],
            }],
        }],
    }, {
        deck: 'introToF7',
        cards: [{
            title: 'Lesson Outline',
            sections: [{
                content: [
                    { type: 'p', html: 'Revisit the concept of frameworks using previous [slide::#].' },
                    { type: 'p', html: '[u::Unplugged]: interpreter.' },
                    { type: 'p', html: 'Walkthrough sandbox template for the class to [em::set up] Framework7. Add [slides::https://docs.google.com/presentation/d/1a7Qgs74Xl_e_hbwQ4PWPqwcAiU2VWr71oAsX9vCvd5k/edit#slide=id.g4078c7e29c_1_0] as supporting material for the teacher.' },
                    { type: 'p', html: 'Create a basic interface using the [guided project::#] on the platform.' },
                ],
            }],
        }],
    }, {
        deck: 'todoList',
        cards: [{
            title: 'Lesson Outline',
            sections: [{
                content: [
                    { type: 'p', html: 'Start the to-do list UI [guided porject::#].' },
                    { type: 'p', html: '[u::Extension]: [em::customise] the to-do list.' },
                ],
            }],
        }],
    }, {
        deck: 'flowChart',
        cards: [{
            title: 'Lesson Outline',
            sections: [{
                content: [
                    { type: 'p', html: 'Introduce the concept of [em::flow charts].' },
                    { type: 'p', html: '[u::Unplugged]: contrast how difficult it is to understand a complex app without the flow chart and vice versa.' },
                    { type: 'p', html: 'Create flow chart for the to-do list.' },
                    { type: 'p', html: 'The flow chart is the visualisation of [em::interactivity] between the app and its user, which requires JavaScript to achieve.' },
                    { type: 'p', html: 'Intro to JavaScript: [em::variables] & [em::functions].' },
                ],
            }],
        }],
    }, {
        deck: 'handlingEvents',
        cards: [{
            title: 'Lesson Outline',
            sections: [{
                content: [
                    { type: 'p', html: 'Intro to event [em::listener] & [em::handler].' },
                    { type: 'p', html: 'Start [guided project::#].' },
                    { type: 'p', html: '[u::Challenge]: responding to the double click event.' },
                ],
            }],
        }],
    }, {
        deck: 'documentObjectManager',
        cards: [{
            title: 'Lesson Outline',
            sections: [{
                content: [
                    { type: 'p', html: '...' },
                ],
            }],
        }],
    }, {
        deck: 'appFunctionality',
        cards: [{
            title: 'Lesson Outline',
            sections: [{
                content: [
                    { type: 'p', html: 'Introduce the concept of event handling in [em::JavaScript].' },
                    { type: 'p', html: 'Start the event handler [project::#].' },
                    { type: 'p', html: 'Revise the process of adding elements to a F7 app by using custom [em::attributes] & [em::class] names.' },
                    { type: 'p', html: 'Start the to-do list functionality [project::#].' },
                ],
            }],
        }],
    }, {
        deck: 'firebaseDataflow',
        cards: [{
            title: 'Lesson Outline',
            sections: [{
                content: [
                    { type: 'p', html: 'Local vs. [em::cloud computing].' },
                    { type: 'p', html: '[u::Unplugged]: activity involving two groups of students.' },
                    { type: 'p', html: 'Revisit the flow chart and [em::identify] which data point needs to be sent to the cloud.' },
                    { type: 'p', html: '[em::Modify] the flow chart to include the additional operations required for the app to become database enabled.' },
                    { type: 'p', html: 'Demo [em::pinging] the database.' },
                ],
            }],
        }],
    }, {
        deck: 'enhanceTodoList',
        cards: [{
            title: 'Lesson Outline',
            sections: [{
                content: [
                    { type: 'p', html: 'start [guided project::#] to add the database component to the to-do list.' },
                ],
            }],
        }],
    }, {
        deck: 'collectiveIntelligence',
        cards: [{
            title: 'Lesson Outline',
            sections: [{
                content: [
                    { type: 'p', html: '...' },
                ],
            }],
        }],
    }, {
        deck: 'reviewApp',
        cards: [{
            title: 'Lesson Outline',
            sections: [{
                content: [
                    { type: 'p', html: '[Sandbox::https://app.bsd.education/sandbox/bTprP2cz]' },
                ],
            }],
        }],
    }, {
        deck: 'promotingAnApp',
        cards: [{
            title: 'Lesson Outline',
            sections: [{
                content: [
                    { type: 'p', html: '...' },
                ],
            }],
        }],
    }, {
        deck: 'geolocation',
        cards: [{
            title: 'Lesson Outline',
            sections: [{
                content: [
                    { type: 'p', html: 'How does this sensor improve the review app?' },
                    { type: 'p', html: '[MDN::https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API]' },
                ],
            }],
        }],
    }, {
        deck: 'latLongConversion',
        cards: [{
            title: 'Lesson Outline',
            sections: [{
                content: [
                    { type: 'p', html: 'Latitude & longtitude values do not mean very much to the average person.' },
                    { type: 'p', html: '[Live Demo::https://www.w3schools.com/html/tryit.asp?filename=tryhtml5_geolocation_map_script]' },
                ],
            }],
        }],
    }, {
        deck: 'enhanceReviewApp',
        cards: [{
            title: 'Lesson App',
            sections: [{
                content: [
                    { type: 'p', html: '...' },
                ],
            }],
        }],
    }, {
        deck: 'gonative',
        cards: [{
            title: 'Lesson Outline',
            sections: [{
                content: [
                    { type: 'p', html: 'Introduce the [GoNative::https://docs.google.com/presentation/d/182QE0dmkcqZPyze0yQ0T7zu0igoXl-efBlHG0ThPzm8/edit#slide=id.g23ea995a46_0_0] process.' }
                ]
            }],
        }],
    }, {
        deck: 'presentation',
        cards: [{
            title: 'Lesson Outline',
            sections: [{
                content: [
                    { type: 'p', html: '...' },
                ],
            }],
        }],
    }];

    pl = new Pipeline(Root);
    pl.render(nodesData, cardsData);
}