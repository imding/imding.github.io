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
        ['>> App Logic', [
            'Flow Chart',
            //  intro + unplugged: sample app analysis with vs. without flow chart
            //  hands-on: create flow chart for to-do list
            //  connect flow chart with interactivity which requires JS

            '>> JS Fundamentals',
            //  intro to JS + projects ( trivia game, etc... )
        ]],

        ['>> Dynamic Behaviour', [
            'Listener & Handler',
            //  intro to event handling
            //  guided project: onkeyup, onkeydown, keycode, onclick, preventDefault
            //  challenge: double click, etc...
            
            '>> The DOM',
            //  intro to DOM and working with it
            //  guided project: createElement, createTextNode, appendChild, removeChild, setAttribute

            '>> To-do List Behaviour',
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

            '>> To-do List Database',
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
        ]],
        ['>> Sensor API', [
            'Mobile Sensors',
            // a list of common mobile sensors
            // demo a few

            '>> Geolocation',
            //  the geolocation API
            //  start guided project
            //  converting lat long values to readable format

            '>> Review App User Location',
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
                    { type: 'p', html: 'Introduce [em::native] & [em::hybrid development] using this [slide::https://drive.google.com/open?id=1VJmaS-b3QBLPaPFPL-h1YoCpxIlOIf3XH8KoJEiQJ9o], how they differenciate and their pro/con.' },
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
                    { type: 'p', html: 'Follow the standard unit plan for HTML & CSS.' },
                    { type: 'p', html: 'Equip students with the knowledge and skills to bulid a simple web page with appropriate [em::content] & [em::styling].' },
                    { type: 'p', html: 'Use the provided [instructions::#][sup::wip] to lead the class [em::step-by-step] through creating the web page.' },
                ],
            }],
        }, {
            title: 'HTML - Content',
            sections: [{
                content: [
                    { type: 'p', html: 'Create the interface of a Google clone in [em::sandbox] mode with the [u::mobile view] enabled. Use [u::inspect element] on the real Google site as reference.' },
                    { type: 'p', html: 'Start by adding an [samp::<h1>] element. ' },
                    { type: 'p', html: 'Use the [samp::<img>] element to add a logo, introduce the [samp::src] attribute and explain the steps of getting an image address.' },
                    { type: 'p', html: 'Use [samp::<input>] elements to add text fields for user name and password.' },
                    { type: 'p', html: '[u::Challenge]: The real Google site uses [samp::<input>] elements for both the text field and buttons but they are clearly different, why is that?' },
                    { type: 'p', html: 'Demo [samp::type="text"] vs [samp::type="submit"].' },
                    { type: 'p', html: 'Use the [samp::<p>] element to add a short description of this sandbox.' },
                    { type: 'p', html: 'Use the [samp::<a>] element to add a link to the real Google site, go over the [samp::href] attribute.' },
                ],
            }],
        }, {
            title: 'CSS - Style',
            sections: [{
                content: [
                    { type: 'p', html: 'Resize images with the [samp::width] & [samp::height] properties, keep the aspect ratio by only using one.' },
                    { type: 'p', html: 'Modify text font using the [samp::font-family], [samp::font-size] & [samp::color] properties. Demostrate how [Google Font::https://app.bsd.education/sprint/html-and-css---google-fonts] works.' },
                    { type: 'p', html: 'Center inline elements using [samp::text-align].' },
                    { type: 'p', html: 'Center block elements on the page using [samp::margin].' },
                    { type: 'p', html: 'Use [samp::margin-top] for vertical alignment.' },
                    { type: 'p', html: 'Use [samp::background-color] & [samp::background-image] to change the background.' },
                    { type: 'p', html: 'Demo how background image can be further customised with [samp::-size], [samp::-position], etc...' },
                    { type: 'p', html: 'Introduce the [em::nesting] concept followed by [guided project::https://app.bsd.education/project/patterns-with-nested-div-elements].' },
                    { type: 'p', html: 'Demo using [w3schools::www.w3schools.com].' },
                    { type: 'p', html: '[u::Extension]: customise the sandbox using online resources.' },
                ],
            }],
        }],
    }, {
        deck: 'introToF7',
        cards: [{
            title: 'Lesson Outline',
            sections: [{
                content: [
                    { type: 'p', html: 'Revisit the concept of frameworks using previous [slide::https://drive.google.com/open?id=1VJmaS-b3QBLPaPFPL-h1YoCpxIlOIf3XH8KoJEiQJ9o].' },
                    { type: 'p', html: '[u::Unplugged][sup::wip]: interpreter.' },
                    { type: 'p', html: 'Walkthrough sandbox template for the class to [em::set up] Framework7 using this [slides::https://docs.google.com/presentation/d/1a7Qgs74Xl_e_hbwQ4PWPqwcAiU2VWr71oAsX9vCvd5k/edit#slide=id.g4078c7e29c_1_0].' },
                    { type: 'p', html: 'Create a basic interface using the [guided project::https://app.bsd.education/project/get-started-with-mobile-app-development-using-framework7] on the platform.' },
                ],
            }],
        }],
    }, {
        deck: 'todoList',
        cards: [{
            title: 'Lesson Outline',
            sections: [{
                content: [
                    { type: 'p', html: 'Start the to-do list UI [guided project::https://app.bsd.education/project/developing-a-todo-list-mobile-app---ui].' },
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
                    { type: 'p', html: 'Introduce the concept of [em::flow charts] using [resources::#][sup::wip].' },
                    { type: 'p', html: '[u::Unplugged][sup::wip]: contrast how difficult it is to understand a complex app without the flow chart and vice versa.' },
                    { type: 'p', html: 'Create flow chart for the to-do list.' },
                    { type: 'p', html: 'The flow chart is the visualisation of [em::interactivity] between the app and its user, which requires JavaScript to achieve.' },
                ],
            }],
        }],
    }, {
        deck: 'jsFundamentals',
        cards: [{
            title: 'Lesson Outline',
            sections: [{
                content: [
                    { type: 'p', html: 'Follow standard unit plan to teach basic JS.' },
                    { type: 'p', html: 'JS concepts: [em::variables] & [em::functions].' },
                ],
            }],
        }],
    }, {
        deck: 'listenerHandler',
        cards: [{
            title: 'Lesson Outline',
            sections: [{
                content: [
                    { type: 'p', html: 'Intro to event [em::listener] & [em::handler].' },
                    { type: 'p', html: 'Start [guided project::https://app.bsd.education/project/developing-a-todo-list-mobile-app---event-handling] to learn about [em::keyboard events], [em::pointer events] & [em::custom events] such as [u::long press].' },
                    { type: 'p', html: '[u::Challenge]: responding to the double click event.' },
                ],
            }],
        }],
    }, {
        deck: 'theDom',
        cards: [{
            title: 'Lesson Outline',
            sections: [{
                content: [
                    { type: 'p', html: 'Define static & [em::dynamic websites].' },
                    { type: 'p', html: 'Show how attributes and content of elements can also be modified at [em::runtime] in this [sandbox::https://app.bsd.education/sandbox/ifJayW74].' },
                    { type: 'p', html: 'Using [em::inspect element], show how elements can be added & removed from [this page::https://app.bsd.education/share/V8Wow2aT/].' },
                    { type: 'p', html: '[u::Unplugged]: Why are these things useful for a web app?' },
                    { type: 'p', html: 'Start [guided project::https://app.bsd.education/project/document-object-model-manipulation].' },
                ],
            }],
        }],
    }, {
        deck: 'todoListBehaviour',
        cards: [{
            title: 'Lesson Outline',
            sections: [{
                content: [
                    { type: 'p', html: 'Revise the process of adding elements to an F7 app using custom [em::attributes] & [em::class] names.' },
                    { type: 'p', html: 'Start the to-do list functionality [project::https://app.bsd.education/project/developing-a-todo-list-mobile-app---dynamic-content].' },
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
                    { type: 'p', html: 'Walkthrough the process of [em::setting up] Firebase using [slides::https://drive.google.com/open?id=1fc1flrJuhXBRHXDsAtd7SsCpe71Zr_Lm7TOLL9Po5Iw].' },
                    { type: 'p', html: 'Demo [em::pinging] the database using this [sandbox::https://app.bsd.education/sandbox/djBpqeMe].' },
                ],
            }],
        }],
    }, {
        deck: 'todoListDatabase',
        cards: [{
            title: 'Lesson Outline',
            sections: [{
                content: [
                    { type: 'p', html: 'Start [guided project::https://app.bsd.education/project/developing-a-todo-list-mobile-app---part-5---database] to add the database component to the to-do list.' },
                ],
            }],
        }],
    }, {
        deck: 'collectiveIntelligence',
        cards: [{
            title: 'Lesson Outline',
            sections: [{
                content: [
                    { type: 'p', html: 'Discuss how the to-do app handles information - to and from an individual.' },
                    { type: 'p', html: 'Discuss how a pencil is [em::made from scratch] and pose questions about the people involved in the process. Do they know the full [em::range of possibilities] of their knowledge and skills?' },
                    { type: 'p', html: '[u::Unplugged]: what is the potential improvement that can be achieved by harnessing the collective intelligence of everyone who uses the to-do list? [u::e.g. determine the number of visible items without scrolling based on the average active items of all users.]' },
                    { type: 'p', html: 'Discuss [em::privacy] practices' },
                ],
            }],
        }],
    }, {
        deck: 'reviewApp',
        cards: [{
            title: 'Lesson Outline',
            sections: [{
                content: [
                    { type: 'p', html: 'Start [guided project::#][sup::wip] to create the [em::offline version] of review app.' },
                    { type: 'p', html: '[Sandbox::https://app.bsd.education/sandbox/ydExsF28]' },
                ],
            }],
        }],
    }, {
        deck: 'mobileSensors',
        cards: [{
            title: 'Lesson Outline',
            sections: [{
                content: [
                    { type: 'p', html: 'Introduce mobile [em::sensor APIs] and draw similarities to frameworks.' },
                    { type: 'p', html: 'Walkthrough [sandbox templates::#][sup::wip] and view results on a phone.' },
                ],
            }],
        }],
    }, {
        deck: 'geolocation',
        cards: [{
            title: 'Lesson Outline',
            sections: [{
                content: [
                    { type: 'p', html: 'Discuss how the [geolocation::https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API] can improve the review app?' },
                    { type: 'p', html: 'Complete the [sandbox template::https://app.bsd.education/sandbox/ydExsF28] to learn & practice how to work with the geolocation API.' },
                    { type: 'p', html: 'Latitude & longtitude values do not mean very much to the average person so we should [em::convert it].' },
                    { type: 'p', html: 'Introduce the [Google Map::https://app.bsd.education/sandbox/SG3nzyvf] API.' },
                    { type: 'p', html: 'Continue with the [same sandbox::https://app.bsd.education/sandbox/ydExsF28] template to learn & practice using the Google Map API.' },
                ],
            }],
        }],
    }, {
        deck: 'reviewAppUserLocation',
        cards: [{
            title: 'Lesson App',
            sections: [{
                content: [
                    { type: 'p', html: 'Start [guided project::#][sup::wip] to include the geolocation feature.' },
                    { type: 'p', html: '.' },
                ],
            }],
        }],
    }, {
        deck: 'gonative',
        cards: [{
            title: 'Lesson Outline',
            sections: [{
                content: [
                    { type: 'p', html: 'Introduce the [GoNative::https://docs.google.com/presentation/d/182QE0dmkcqZPyze0yQ0T7zu0igoXl-efBlHG0ThPzm8/edit#slide=id.g23ea995a46_0_0] process.' },
                    { type: 'p', html: '[u::Hands-on]: convert the review app using GoNative.' }
                ]
            }],
        }],
    }, {
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