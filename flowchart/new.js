loading();

function loading() {
    if (document.body) init();
    else window.requestAnimationFrame(loading);
}

function init() {
    // add utility functions to window object
    Object.assign(window, new Utility());

    // display app container
    sCss(document.body, { visibility: 'visible' });

    pl = new Pipeline(Root);

    const nodesData = [
        'Source Code',
        '< Learning Objective',
        'Priority Check',
        'Technical Flow',
        'Approval',
        ['Content Creation', [
            'Instruction',
            'Static Code',
            'Flow Assessment',
            'Objective Test',
            'Transition Logic',
            'Author Review',
        ]],
        'Full Review',
        'Publish',
        'Teaching Test',
    ];

    nodesData.forEach(data => {
        if (Array.isArray(data)) {
            const shell = pl.newShell(data[0]);
            data[1].forEach(title => shell.newNode(title));
        }
        else {
            pl.newNode(data);
        }
    });

    pl.chart.nodes['sourceCode'].addCard({
        title: 'Formatting',
        sections: [{
            subtitle: 'Using Template',
            content: [{
                type: 'p',
                bullet: true,
                html: 'Click to select & copy everything under <em>Template</em>, paste into the instruction panel',
            }],
        }],
    });
}