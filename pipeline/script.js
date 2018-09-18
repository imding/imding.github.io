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
        'School Engagement',
        '<> Deliverable Details',
        ['>> Curriculum Content', [
            'Course Outline',
            '>> Unit Outline',
        ]],
        '<> Teacher Interaction',
        ['>> Technical Content', [
            'Source Code',
            '<> Technical Flow',
            '>> Static Steps',
            '>> Step Expectation',
            '>> Transition Logic',
            '>> Project Guide',
        ]],
        ['<> Curriculum Content', [
            'Lesson Plan',
            '<> Support Materials',
            '>> Content Editing',
            '<> Review',
            '>> Delivery',
        ]],
        '>> Feedback',
        ['<> Technical Conent', [
            'Version Control',
        ]],
    ];

    const cardsData = [{
        deck: 'schoolEngagement',
        cards: [{
            title: 'School Engagement',
            sections: [{
                content: [
                    { type: 'p', html: 'Ongoing conversation between BSD sales team and the [em::decision makers] of a school with the aim to enter a partnership.' },
                    { type: 'p', html: '[em::School departments] and BSD education team may join the conversation, at which point we should start receiving curriculum relevant information such as [em::subject area], [em::age group] & [em::program duration].' },
                    { type: 'p', html: 'All curriculum relevant information must be [em::actively communicated] to the education team.' },
                ],
            }],
        }],
    }, {
        deck: 'deliverableDetails',
        cards: [{
            title: 'Deliverable Details',
            sections: [{
                content: [
                    { type: 'p', html: 'Evaluate the resource requirements of the proposed deliverables and [em::manage expectations] accordingly.' },
                    { type: 'p', html: 'Check the [deliverables calendar::https://goo.gl/7eotZT] for the latest information.' },
                ],
            }],
        }, {
            title: 'Critical Information',
            sections: [{
                content: [
                    { type: 'p', html: '[em::Age group] - age groups at which our curriculum is targeted.' },
                    { type: 'p', html: '[em::Learning objectives] - what does the school hope to teach using our curriculum.' },
                    { type: 'p', html: '[em::Course duration] - total hours covered by the promised deliverable.' },
                    { type: 'p', html: '[em::Lesson duration & frequency] - how often lessons are taught using our curriculum and the duration of each lesson.' },
                ],
            }],
        }],
    }, {
        deck: 'courseOutline',
        cards: [{
            title: 'Course Outline',
            sections: [{
                content: [
                    { type: 'p', html: 'A course outline is primarily created to [em::deliver learning outcomes] in which case will become part of school deliverables.' },
                    { type: 'p', html: 'It is a sequenced reference to [em::existing units] or slight variations thereof.' },
                    { type: 'p', html: 'All course outlines should be created from this [template::https://docs.google.com/document/d/14A55Xb9RKwOan_dUl7MNdiphGIjrJ9V3YgPmjV-F4vM/edit?usp=sharing].' },
                ],
            }],
        }],
    }, {
        deck: 'unitOutline',
        cards: [{
            title: 'Unit Outline',
            sections: [{
                content: [
                    { type: 'p', html: 'Unit outlines can be created for either [em::school deliverables] or BSD-initiated [em::content expansion].' },
                    { type: 'p', html: 'It is a sequenced reference to [em::lesson plans] plus any [em::resources] required by those lessons.' },
                    { type: 'p', html: 'All unit outlines should be created from this [template::https://docs.google.com/document/d/1jyBubcZiuRMcvU15c4Dx__EkthAT8PkKI4DxPciyuWI/edit?usp=sharing].' },
                ],
            }],
        }],
    }, {
        deck: 'teacherInteraction',
        cards: [{
            title: 'Teacher Interaction',
            sections: [{
                content: [
                    { type: 'p', html: 'Unit outlines can be created for either [em::school deliverables] or BSD-initiated [em::content expansion].' },
                    { type: 'p', html: 'It is a sequenced reference to [em::lesson plans] plus any [em::resources] required by those lessons.' },
                    { type: 'p', html: 'All unit outlines should be created from this [template::https://docs.google.com/document/d/1jyBubcZiuRMcvU15c4Dx__EkthAT8PkKI4DxPciyuWI/edit?usp=sharing].' },
                ],
            }],
        }],
    }, {
        deck: 'staticSteps',
        cards: [{
            title: 'Static Steps',
            sections: [{
                content: [
                    { type: 'p', html: 'The [em::primary objective] of this process is to define the code in each step such the technical flow is best reflected.' },
                    { type: 'p', html: '[em::Do not include] editable regions, simply define the final state of each step.' },
                    { type: 'p', html: '[em::Do not use] modify content, focus on progression and flow.' },
                    { type: 'p', html: 'Set unused code files to [em::hidden].' },
                    { type: 'p', html: 'Make sure the [samp::<script>] element is at the end of the [samp::<body>] and not in the [samp::<head>].' },
                    { type: 'p', html: 'Make sure to remove the [samp::<script>] element if no script file is present.' },
                ],
            }],
        }, {
            title: 'Editable Regions',
            sections: [{
                content: [{ type: 'p', html: 'Editable regions are spaces in the code panel where the learner can type, below are guidelines for using it:' }],
            }, {
                title: 'Editable Block',
                content: [
                    { type: 'p', html: 'Editable blocks [em::prevents] the learner from creating [em::new lines] in the code file.' },
                    { type: 'p', html: 'Use the following code to create an editable block. Empty editable blocks should always [em::contain 4 spaces].' },
                    { type: 'code', code: '#BEGIN_EDITABLE#    #END_EDITABLE#' },
                    { type: 'p', html: 'Occupied editable blocks should have a [em::1 space padding] on both ends.' },
                    { type: 'code', code: '#BEGIN_EDITABLE# var n = 42; #END_EDITABLE#' },
                ],
            }],
        }],
    }, {
        deck: 'contentEditing',
        cards: [{
            title: 'Content Editing',
            sections: [{
                content: [
                    { type: 'p', html: 'This process is carried out by the [em::Curriculum Developer].' },
                    { type: 'p', html: 'The [em::primary objective] is to ensure our content uses the most appropriate language and formatting.' },
                    { type: 'p', html: 'Content editing is required for all non-technical components of our content, including [em::lesson plans], [em::support materials] & [em::platform content].' },
                ],
            }],
        }, {
            title: 'Project Instruction',
            sections: [{
                content: [{ type: 'p', html: 'Below are guidelines for project instructions on the platform.' }],
            }, {
                title: 'Line Location',
                content: [
                    { type: 'p', html: 'Given a particular line in [samp::index.html] contains the string [samp::catpaw] and it occurs [em::exactly once] in the entire HTML file, the number of that line can be dynamically retrieved using the following code:' },
                    { type: 'code', code: '##LINE("index.html", "catpaw")##' },
                    { type: 'p', bullet: false, html: 'The resulting location can also be [em::offset]:' },
                    { type: 'code', code: '##LINE("index.html", "catpaw")+2##' },
                ],
            }, {
                title: 'Syntax Highlighting',
                content: [
                    { type: 'p', html: '[em::Always] highlight code references, [em::only] code references.' },
                    { type: 'img', src: 'img/format_code.png' },
                ],
            }, {
                title: 'Code Snippet',
                content: [
                    { type: 'p', html: 'Code examples should primarily be provided via [em::glossaries], however in case there is clear benefit in showing code example that does not belong to any glossary, use the code snippet.' },
                    { type: 'img', src: 'img/new_snippet.png' },
                    { type: 'p', html: 'Clearly indicate the code example.' },
                    { type: 'img', src: 'img/snippet_header.png' },
                ],
            }, {
                title: 'Images',
                content: [
                    { type: 'p', html: 'All images, especially high resolution images, must themselves be hyperlinks that open [em::in a new tab].' },
                    { type: 'p', html: 'Clearly indicate the image being a link.' },
                    { type: 'img', src: 'img/image.png' },
                ],
            }, {
                title: 'Objectives',
                content: [
                    { type: 'p', html: 'No more than [em::3 objectives] per step.' },
                    { type: 'p', html: 'In most cases, a learner should write no more than [em::1-2 lines] of code for each objective.' },
                ],
            }],
        }],
    }];

    pl = new Pipeline(Root);
    pl.render(nodesData, cardsData);
}