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
            'The Result',
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
            '<> Final Review',
            '>> Curriculum Delivery',
        ]],
        '>> Feedback Handling',
        ['<> Maintenance', [
            'Version Control',
        ]],
    ];

    const cardsData = {
        schoolEngagement: [{
            title: 'Details',
            sections: [{
                content: [
                    { type: 'p', html: 'Ongoing conversation takes place between our sales team and the [em::decision makers] of a school with the aim to enter a partnership.' },
                    { type: 'p', html: '[em::School departments] and BSD education team may join the conversation, at which point we should start receiving curriculum relevant information such as [em::subject area], [em::age group] & [em::program duration].' },
                    { type: 'p', html: 'All curriculum relevant information must be [em::actively communicated] to the education team.' },
                ],
            }],
        }],
        deliverableDetails: [{
            title: 'Details',
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
        courseOutline: [{
            title: 'Details',
            sections: [{
                content: [
                    { type: 'p', html: 'A course outline is primarily created to [em::deliver learning outcomes] in which case will become part of school deliverables.' },
                    { type: 'p', html: 'It is a list of references to [em::existing units] or slight variations thereof.' },
                    { type: 'p', html: 'All course outlines should be created from this [template::https://docs.google.com/document/d/14A55Xb9RKwOan_dUl7MNdiphGIjrJ9V3YgPmjV-F4vM/edit?usp=sharing].' },
                ],
            }],
        }],
        unitOutline: [{
            title: 'Details',
            sections: [{
                content: [
                    { type: 'p', html: 'Unit outlines can be created for either [em::school deliverables] or BSD-initiated [em::content expansion].' },
                    { type: 'p', html: 'It is a list of references to [em::lesson plans] plus any [em::resources] required by those lessons.' },
                    { type: 'p', html: 'All unit outlines should be created from this [template::https://docs.google.com/document/d/1jyBubcZiuRMcvU15c4Dx__EkthAT8PkKI4DxPciyuWI/edit?usp=sharing].' },
                ],
            }],
        }],
        teacherInteraction: [{
            title: 'Details',
            sections: [{
                content: [
                    { type: 'p', html: 'Teacher interaction will take place before and after the final curriculum delivery.' },
                ],
            }],
        }, {
            title: 'Professional Development',
            sections: [{
                content: [
                    { type: 'p', html: '[em::PD] is the process where BSD staff provide training for school teachers.' },
                    { type: 'p', html: 'The objective of this process is to equip teachers with the knowledge and skill to deliver lessons using our curriculum.' },
                ],
            }],
        }],
        theResult: [{
            title: 'Details',
            sections: [{
                content: [
                    { type: 'p', html: 'Our curriculum should always offer [em::Project Based Learning] whenever possible.' },
                    { type: 'p', html: 'The [em::first step] in developing the curriculum is to produce the final result first - hereafter referred to as [samp::The Result].' },
                    { type: 'p', html: 'This is an iterative [em::R&D] process which aims to effectively deliver given learning objectives.' },
                ],
            }],
        }, {
            title: 'Coding Projects',
            sections: [{
                content: [
                    { type: 'p', html: '...' },
                ],
            }],
        }, {
            title: 'Hardware Projects',
            sections: [{
                content: [
                    { type: 'p', html: '...' },
                ],
            }],
        }, {
            title: 'Other Projects',
            sections: [{
                content: [
                    { type: 'p', html: '...' },
                ],
            }],
        }],
        technicalFlow: [{
            title: 'Details',
            sections: [{
                content: [
                    { type: 'p', html: 'This is a list of technical concepts closely related to the given [em::learning objectives].' },
                    { type: 'p', html: 'The [em::chronological sequence] or flow of these concepts should offer clear insight as to how [samp::The Result] can be achieved.' },
                    { type: 'p', html: 'Both [em::content & curriculum developers] should participate in finalising the technical flow.' },
                    { type: 'p', html: 'The development of [em::curriculum content] should begin once the technical flow is ready.' },
                ],
            }],
        }],
        staticSteps: [{
            title: 'Details',
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
            title: 'Step Context',
            sections: [{
                content: [
                    { type: 'p', html: 'The [u::content developer] should define the [em::context] of each step in the instruction panel, this can then be improved by the [u::curriculum developer].' },
                    { type: 'p', html: 'As a [u::soft rule], the definition should include [em::why] the learner must complete the step objectives and [em::how] to do it.' },
                    { type: 'img', src: 'img/staticStep01.png' },
                ],
            }],
        }, {
            title: 'Objective Description',
            sections: [{
                content: [
                    { type: 'p', html: 'The description for all objectives should be [em::action items].' },
                    { type: 'img', src: 'img/staticStep02.png' },
                ],
            }],
        }, {
            title: 'Editable Regions',
            sections: [{
                content: [{ type: 'p', html: 'Editable regions are spaces in the code panel where the learner can type, there are [em::two types] of editable regions:' }],
            }, {
                title: 'Editable Block',
                content: [
                    { type: 'p', html: 'Editable blocks [em::prevents] the learner from creating [em::new lines] in the code file.' },
                    { type: 'p', html: 'Use the following code to create an editable block. Empty editable blocks should always [em::contain 4 spaces].' },
                    { type: 'code', code: '#BEGIN_EDITABLE#    #END_EDITABLE#' },
                    { type: 'img', src: 'img/editable_block.png' },
                    { type: 'p', html: 'Occupied editable blocks should have a [em::1 space padding] on both ends.' },
                    { type: 'code', code: '#BEGIN_EDITABLE# var n = 42; #END_EDITABLE#' },
                ],
            }, {
                title: 'Editable Lines',
                content: [
                    { type: 'p', html: 'Editable lines provide [em::expandable spaces] in the code where the learner can type.' },
                    { type: 'p', html: 'When editable lines are included in the learner code, its length becomes unpreditable and thus all [em::static references] to line locations are [em::unreliable].' },
                    { type: 'p', html: 'Editable lines can be created by placing mark up keywords on [em::separate lines].' },
                    { type: 'code', code: '#BEGIN_EDITABLE#\n#END_EDITABLE#' },
                    { type: 'img', src: 'img/editable_lines.png' },
                ],
            }],
        }],
        stepExpectation: [{
            title: 'Details',
            sections: [{
                content: [
                    { type: 'p', html: 'Step expectaion (a.k.a. objective testing) is the platform mechanism to [em::capture learner input] and compare it with teacher expectations to [em::determine validity] of the former.' },
                    { type: 'p', html: 'The [em::robustness] of its implementation is critical to successful classroom deployment therefore requires [em::thorough testing].' },
                    { type: 'p', html: 'Testing step expectations can be [em::time consuming], any outcome that requries re-testing is not advised.' },
                ],
            }, {
                title: 'Objective Versioning',
                content: [
                    { type: 'p', html: 'The objective version must be set to [em::2 - (with HTML, and inline error messages)] on all projects.' },
                    { type: 'img', src: 'img/objective_version.png' },
                ],
            }, {
                title: 'Syntax',
                content: [
                    { type: 'p', html: 'Use the following syntax [em::exclusively] to test for HTML, CSS or JS code:' },
                    { type: 'code', code: 'pass.if.[html|css|js].editable(n).equivalent("");' },
                    { type: 'p', html: '[em::Multiple input] can be accepted by a single expectation:' },
                    { type: 'code', code: 'pass.if.[html|css|js].editable(n).equivalent("").or("").or("");' },
                    { type: 'p', html: 'Any markup syntax such as [samp::##ANY##] & [samp::##URL##] must be [em::capitalised].' },
                ],
            }],
        }, {
            title: 'Testing HTML',
            sections: [{
                content: [
                    { type: 'p', html: 'Given the expected input of the [em::1st editable] is [samp::<h1>Hello World</h1>], use the following step expectation:' },
                    { type: 'code', code: 'pass.if.html.editable(0).equivalent("<h1>Hello World</h1>");' },
                    { type: 'p', html: 'Given the expected input of the [em::3rd editable] is [samp::<p></p>] with [em::any text content], use the following step expectation:' },
                    { type: 'code', code: 'pass.if.html.editable(2).equivalent("<p>##ANY##</p>");' },
                    { type: 'p', html: 'The [samp::##ANY##] markup is allowed for [em::text content only]. The following is [em::invalid]:' },
                    { type: 'code', code: '.equivalent("<div class=##ANY##></div>");' },
                ],
            }, {
                title: 'Known Issues',
                content: [
                    { type: 'p', html: 'Given the expected learner input is an [samp::<img>] tag with flexible [samp::src] value, use the following workaround:' },
                    { type: 'code', code: 'const input = code.html.editable[0];\ncode.html.editable[0] = input.replace(/src\\s*=\\s*(\'|")[^\'"]+\\1/, "src=\'#\'");\npass.if.html.editable(0).equivalent("<img src=\'#\'>");' },
                ],
            }],
        }, {
            title: 'Testing CSS',
            sections: [{
                content: [
                    { type: 'p', html: 'Given the expected input of the [em::1st editable] is [samp::div {}], use the following step expectation:.' },
                    { type: 'code', code: 'pass.if.css.editable(0).equivalent("div {}");' },
                    { type: 'p', html: 'Given the expected input of the [em::2nd editable] is [samp::width: 100px;], use the following step expectation:.' },
                    { type: 'code', code: 'pass.if.css.editable(1).equivalent("width: 100px;");' },
                    { type: 'p', html: 'Given the expected input of the [em::3rd editable] is [samp::background-image] with a flexible [samp::url] value, use the following step expectation:.' },
                    { type: 'code', code: 'pass.if.css.editable(2).equivalent("background-image: ##URL##;");' },
                ],
            }],
        }, {
            title: 'Testing JavaScript',
            sections: [{
                content: [
                    { type: 'p', html: '.' },
                ],
            }],
        }, {
            title: 'Tips & Tricks',
            sections: [{
                content: [
                    { type: 'p', html: '.' },
                ],
            }],
        }, {
            title: 'Live Objective',
            sections: [{
                content: [
                    { type: 'p', html: '.' },
                ],
            }],
        }],
        transitionLogic: [{
            title: 'Details',
            sections: [{
                content: [
                    { type: 'p', html: '...' },
                ],
            }],
        }, {
            title: '...',
            sections: [{
                content: [{ type: 'p', html: '...' }],
            }, {
                title: '...',
                content: [
                    { type: 'p', html: '...' },
                ],
            }, {
                title: '...',
                content: [
                    { type: 'p', html: '...' },
                ],
            }],
        }],
        projectGuide: [{
            title: 'Details',
            sections: [{
                content: [
                    { type: 'p', html: '...' },
                ],
            }],
        }, {
            title: '...',
            sections: [{
                content: [{ type: 'p', html: '...' }],
            }, {
                title: '...',
                content: [
                    { type: 'p', html: '...' },
                ],
            }, {
                title: '...',
                content: [
                    { type: 'p', html: '...' },
                ],
            }],
        }],
        lessonPlan: [{
            title: 'Details',
            sections: [{
                content: [
                    { type: 'p', html: '...' },
                ],
            }],
        }, {
            title: '...',
            sections: [{
                content: [{ type: 'p', html: '...' }],
            }, {
                title: '...',
                content: [
                    { type: 'p', html: '...' },
                ],
            }, {
                title: '...',
                content: [
                    { type: 'p', html: '...' },
                ],
            }],
        }],
        supportMaterials: [{
            title: 'Details',
            sections: [{
                content: [
                    { type: 'p', html: '...' },
                ],
            }],
        }, {
            title: '...',
            sections: [{
                content: [{ type: 'p', html: '...' }],
            }, {
                title: '...',
                content: [
                    { type: 'p', html: '...' },
                ],
            }, {
                title: '...',
                content: [
                    { type: 'p', html: '...' },
                ],
            }],
        }],
        contentEditing: [{
            title: 'Details',
            sections: [{
                content: [
                    { type: 'p', html: 'This process is primarily carried out by the [em::Curriculum Developer].' },
                    { type: 'p', html: 'The [em::primary objective] is to ensure our content uses the most appropriate language and formatting.' },
                    { type: 'p', html: 'Content editing is required for all non-technical components of our content, including [em::lesson plans], [em::support materials] & [em::platform content].' },
                ],
            }],
        }, {
            title: 'Project Instruction',
            sections: [{
                content: [
                    { type: 'p', html: '[em::Reach out] to content developers for technical assistance when necessary.' },
                    { type: 'p', html: 'Project instructions should follow the [em::guidelines] listed below:' },
                ],
            }, {
                title: 'Linked Resources',
                content: [
                    { type: 'p', html: 'Links to other [em::platform content] should be limited to the last step of a project, otherwise only [em::sandbox output] links should be linked.' },
                    { type: 'p', html: 'Links to external resources must be accompanied by [em::clear instructions].' },
                ],
            }, {
                title: 'Line Location',
                content: [
                    { type: 'p', html: 'All [em::code references] must be accompanied by line locations.' },
                    { type: 'img', src: 'img/line_ref.png' },
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
                    { type: 'p', html: '[em::Objective description] in the instruction must be identical to the description in the objective panel.' },
                    { type: 'p', html: 'In most cases, a learner should write no more than [em::1-2 lines] of code for each objective.' },
                ],
            }],
        }],
        finalReview: [{
            title: 'Details',
            sections: [{
                content: [
                    { type: 'p', html: '...' },
                ],
            }],
        }, {
            title: '...',
            sections: [{
                content: [{ type: 'p', html: '...' }],
            }, {
                title: '...',
                content: [
                    { type: 'p', html: '...' },
                ],
            }, {
                title: '...',
                content: [
                    { type: 'p', html: '...' },
                ],
            }],
        }],
        curriculumDelivery: [{
            title: 'Details',
            sections: [{
                content: [
                    { type: 'p', html: '...' },
                ],
            }],
        }, {
            title: '...',
            sections: [{
                content: [{ type: 'p', html: '...' }],
            }, {
                title: '...',
                content: [
                    { type: 'p', html: '...' },
                ],
            }, {
                title: '...',
                content: [
                    { type: 'p', html: '...' },
                ],
            }],
        }],
        feedbackHandling: [{
            title: 'Details',
            sections: [{
                content: [
                    { type: 'p', html: '...' },
                ],
            }],
        }, {
            title: '...',
            sections: [{
                content: [{ type: 'p', html: '...' }],
            }, {
                title: '...',
                content: [
                    { type: 'p', html: '...' },
                ],
            }, {
                title: '...',
                content: [
                    { type: 'p', html: '...' },
                ],
            }],
        }],
        versionControl: [{
            title: 'Details',
            sections: [{
                content: [
                    { type: 'p', html: '...' },
                ],
            }],
        }, {
            title: '...',
            sections: [{
                content: [{ type: 'p', html: '...' }],
            }, {
                title: '...',
                content: [
                    { type: 'p', html: '...' },
                ],
            }, {
                title: '...',
                content: [
                    { type: 'p', html: '...' },
                ],
            }],
        }],
    };

    pl = new Pipeline(Root);
    pl.render(nodesData, cardsData);

    pl.creatorAccess();
}