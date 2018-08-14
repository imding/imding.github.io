const
    app = {
        ui: {}
    },



    data = {
        name: 'A',
        children: [
            { name: 'B' },
            { name: 'K' },
        ],
    };

let
    graph,
    root,
    activeNode,
    quickMenu,
    nodes = [];

window.onload = () => {
    // init document
    initDoc();

    // create svg element
    graph = SVG(document.body).size('100%', '100%').style({
        position: 'absolute',
        top: '0',
    });

    // add root node to graph
    root = newNode({
        id: 'rootNode',
        fill: 'mediumspringgreen',
        x: 100,
        y: 100,
        w: 150,
        h: 100,
    });

    graph.mousemove(e => moveNode(e.clientX, e.clientY));
    graph.touchmove(e => {
        if (e.touches.length > 1) return;
        moveNode(e.touches[0].clientX, e.touches[0].clientY);
    });

    // add new node
    graph.node.oncontextmenu = e => {
        e.preventDefault();

        if (Object.is(e.target, graph.node)) {
            nodes.push(newNode({
                id: `node${nodes.length + 1}`,
                x: e.clientX - 75,
                y: e.clientY - 50,
                w: 150,
                h: 100,
            }));
        }
    };
};

function newNode(p) {
    const
        node = graph.nested(),

        nodeBody = node.rect(p.w, p.h).attr({
            id: p.id,
            x: p.x, y: p.y,
            rx: 10, ry: 10,
            fill: p.fill || 'azure',
            stroke: 'rgba(0, 0, 0, 0.3)',
            'stroke-width': 5,
        }).style({
            cursor: 'grabbing',
        }),

        dropNode = e => {
            if (e.button === 2) return;
            activeNode = null;
            console.log(`dropped ${e.target.id}`);
        };

    // dnd events
    node.mousedown(e => {
        if (e.button === 2) return;
        grabNode(node, e.clientX, e.clientY);
    });

    node.touchstart(e => {
        if (e.touches.length > 1) return;
        grabNode(node, e.touches[0].clientX, e.touches[0].clientY);
    });

    node.mouseup(dropNode);
    node.touchend(dropNode);

    return node;
}

function moveNode(x, y) {
    if (!activeNode) return;

    const coord = {
        x: Math.min(Math.max(10, x - activeNode.grabOffset.x), graph.node.width.animVal.value - activeNode.node.width.animVal.value - 10),
        y: Math.min(Math.max(10, y - activeNode.grabOffset.y), graph.node.height.animVal.value - activeNode.node.height.animVal.value - 10),
    };

    activeNode.move(coord.x, coord.y);

    console.clear();
    console.log(`moving ${activeNode.node.id} to ${coord.x}, ${coord.y}`);
}

function grabNode(el, x, y) {
    el.grabOffset = {
        x: x - graph.node.x.animVal.value - el.node.x.animVal.value,
        y: y - graph.node.y.animVal.value - el.node.y.animVal.value,
    };

    activeNode = el;

    console.clear();
    console.log(`picked up ${el.node.id} with offset ${el.grabOffset.x}, ${el.grabOffset.y}`);
}

function initDoc() {
    document.children[0].style.height = '100%';
    document.body.style.height = '100%';
    document.body.style.margin = '0';
}