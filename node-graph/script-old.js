loading();

function loading() {
    if (document.body) init();
    else window.requestAnimationFrame(loading);
}

function init() {
    // add utility functions to window object
    Object.assign(window, new Utility());

    // display app container
    appContainer.style.visibility = 'visible';

    // create instance of FloApp
    fl = new Flo();
    fl.render(appContainer);
}

class Flo {
    constructor() {
        this.default = {
            workspace: {
                pos: { x: 0, y: 0 },
                scl: { x: 500, y: 350 },
                pad: 10,
            },
            node: {
                pos: { x: 0, y: 0 },
                scl: { x: 120, y: 80 },
                br: 10,
                fill: 'rebeccapurple',
            },
            port: {
                type: 'in',
                pos: { x: 0, y: 0 },
                r: 8,
            },
            link: {},
        };

        this.root;
        this.workspace = [];
        this.activeNode;
    }

    render(root) {
        this.root = root;
        this.newWorkspace({ pos: { x: 100, y: 120 } });
    }

    newWorkspace(cf) {
        cf = Object.assign(this.default.workspace, cf || {});

        const ws = newSVG('svg');

        // use css for position
        sCss(ws, {
            position: 'absolute',
            left: `${cf.pos.x}px`,
            top: `${cf.pos.y}px`,
            backgroundColor: 'tomato',
        });

        // use attribute for scale
        sAttr(ws, {
            width: cf.scl.x,
            height: cf.scl.y,
            vewBox: `0 0 ${cf.scl.x} ${cf.scl.y}`,
        });

        ws.oncontextmenu = () => this.newNode({ pos: relCursor(ws) });
        ws.onmousemove = () => {
            // animate active node with cursor
            if (this.activeNode) sAttr(this.activeNode.root, {
                x: Math.min(
                    gAttr(ws).width - gAttr(this.activeNode.root).width - cf.pad,   // max dx
                    Math.max(cf.pad /* min dx */, relCursor(ws).x - this.activeNode.offset.x)
                ),
                y: Math.min(
                    gCss(ws).height - gAttr(this.activeNode.root).height - cf.pad,  // max dy
                    Math.max(cf.pad /* min dy */, relCursor(ws).y - this.activeNode.offset.y)
                ),
            });
        };

        this.root.appendChild(ws);
        this.workspace.push(ws);
    }

    newNode(cf) {
        event.preventDefault();

        cf = Object.assign(this.default.node, cf || {});

        const node = {
            parent: event.target,
            root: newSVG('svg'),
            body: newSVG('rect'),
            ports: { in: [], out: [] },
        };

        node.newPort = cf => {
            cf = Object.assign(this.default.port, cf || {});

            const port = newSVG('circle');

            sAttr(port, {
                r: cf.r,
                cx: cf.type == 'in' ? cf.r * 1.5 : gAttr(node.body).width - cf.r * 1.5,
                cy: gAttr(node.body).height / 2 ,
                fill: 'white',
            });

            node.root.appendChild(port);
            node.ports[cf.type].push(port);
        };

        sAttr(node.root, {
            cursor: 'pointer',
            x: cf.pos.x - cf.scl.x / 2,
            y: cf.pos.y - cf.scl.y / 2,
        });

        sAttr(node.body, {
            width: cf.scl.x,
            height: cf.scl.y,
            // rx: cf.br,
            ry: cf.br,
            fill: cf.fill,
        });

        node.body.onmouseup = () => this.activeNode = null;
        node.body.onmousedown = () => {
            this.activeNode = node;
            this.activeNode.offset = {
                // cursor distance to node origin
                x: relCursor(node.parent).x - gAttr(node.root).x,
                y: relCursor(node.parent).y - gAttr(node.root).y,
            };
        };

        node.root.appendChild(node.body);
        node.newPort({ type: 'out' });
        event.target.appendChild(node.root);
    }

    // newPort(cf) {


    //     const port = {

    //     }
    // }
}

class Utility {
    constructor() {
        // unique id
        this.uid = prefix => {
            // non-zero random scalar
            const nzrs = () => Math.random() || this.nzrs();

            // random string
            const rs = `${prefix}-${nzrs().toString(36).slice(-3)}`;

            if (Array.from(document.documentElement.getElementsByTagName('*')).some(el => el.id == rs)) return this.uid();
            return rs;
        };

        // get item from array
        this.gifa = (arr, i) => i < 0 ? arr[arr.length + i] : arr[i];

        // set & get attribute
        this.sAttr = (el, details) => Object.entries(details).forEach(entry => el.setAttribute(entry[0], entry[1].toString()));
        this.gAttr = el => {
            return new Proxy(
                {
                    get x() { return parseFloat(el.getAttribute('x')); },
                    get y() { return parseFloat(el.getAttribute('y')); },
                    get width() { return parseFloat(el.getAttribute('width')) || el.getBBox().width; },
                    get height() { return parseFloat(el.getAttribute('height')) || el.getBBox().height; },
                }, {
                    get: (o, attr) => attr in o ? o[attr] : el.getAttribute(attr),
                }
            );
        };

        // set & get css style
        this.sCss = (el, details) => Object.entries(details).forEach(entry => el.style[entry[0]] = entry[1]);
        this.gCss = el => {
            const
                cs = window.getComputedStyle(el),
                val = p => cs.getPropertyValue(p);

            return new Proxy(
                {
                    get width() { return parseFloat(val('width')); },
                    get height() { return parseFloat(val('height')); },
                    get left() { return parseFloat(val('left')); },
                    get top() { return parseFloat(val('top')); },
                }, {
                    get: (o, p) => p in o ? o[p] : val(p.replace(/([A-Z])/g, '-$1'.toLowerCase())),
                }
            );
        };

        // relative cursor position
        this.relCursor = ref => {
            ref = ref || document.body;
            if (ref.nodeType != 1) throw new Error('the relCursor method expects an HTML element as argument');
            return {
                x: event.clientX + window.scrollX - (this.gCss(ref).left || 0),
                y: event.clientY + window.scrollY - (this.gCss(ref).top || 0),
            };
        };

        // new svg element
        this.newSVG = type => document.createElementNS('http://www.w3.org/2000/svg', type);
    }
}