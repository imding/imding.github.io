loading();

let flo, gCss, gAttr;

function loading() {
    if (document.body) init();
    else window.requestAnimationFrame(loading);
}

function init() {
    // gCss = new Utility().gCss;
    // gAttr = new Utility().gAttr;
    appContainer.style.visibility = 'visible';

    flo = new FloApp();
    flo.render(appContainer);

}

class FloApp {
    constructor() {
        this.ui = {
            workspace: [],
        };
    }

    render(el) {
        const
            checkers = [
                {
                    pass: () => arguments.length == 1,
                    message: 'the render method expects a single argument',
                },
                {
                    pass: () => el && el.tagName == 'DIV',
                    message: 'the render expects a <div> element',
                }
            ];

        checkers.forEach(check => { if (!check.pass()) console.error(check.message); });

        document.newSVG = type => document.createElementNS('http://www.w3.org/2000/svg', type);

        this.el = el;

        const ws = new Workspace(document.createElement('div'));

        this.addWorkspace(ws, { x: 100, y: 200, w: 800, h: 650 });
    }

    addWorkspace(ws, opts) {
        if (!(ws instanceof Workspace)) console.error('the addWorkspace method expects an instance of Workspace');

        opts = Object.assign({ x: 0, y: 0, w: 500, h: 350 }, opts);

        const
            sAttr = new Utility().sAttr,
            sCss = new Utility().sCss;

        sCss(ws.el, {
            position: 'absolute',
            left: `${opts.x}px`,
            top: `${opts.y}px`,
            width: `${opts.w}px`,
            height: `${opts.h}px`,
        });

        sAttr(ws.svg, {
            width: opts.w,
            height: opts.h,
            viewBox: `0 0 ${opts.w} ${opts.h}`,
        });

        this.ui.workspace.push(ws);
        this.el.appendChild(ws.el);
    }
}

class Workspace {
    constructor(el) {
        const checkers = [
            {
                pass: arguments.length < 2,
                message: 'the Workspace class constructor expects a single argument',
            },
            {
                pass: el.tagName == 'DIV',
                message: 'the Workspace class constructor expects a <div> element',
            }
        ];

        checkers.forEach(check => { if (!check.pass) console.error(check.message); });

        const
            gAttr = new Utility().gAttr,
            sAttr = new Utility().sAttr,
            gCss = new Utility().gCss;

        // padding inside the workspace
        this.pad = 10;

        this.el = el;
        this.el.id = this.el.id || new Utility().uid('WS');
        this.el.className = 'AppUI-WS';

        this.svg = document.newSVG('svg');
        this.svg.id = `${this.el.id}-SVG`;

        this.graph = {
            nodes: [],
        };

        this.el.appendChild(this.svg);
        this.el.oncontextmenu = () => {
            event.preventDefault();

            if (event.target != this.svg) return;

            this.addNode({
                // mouse.x + scroll.x - workspace.left
                x: event.clientX + window.scrollX - gCss(this.el).left,
                y: event.clientY + window.scrollY - gCss(this.el).top,
            });
        };

        this.activeNode;
        this.activeLink;

        this.el.onmousemove = () => {
            // animate active node
            if (this.activeNode) sAttr(this.activeNode.root, {
                // mouse.x + scroll.x - workspace.left - activeNode.offset.x
                x: Math.min(
                    gCss(this.el).width - gAttr(this.activeNode.root).width - this.pad, // max dx
                    Math.max(
                        this.pad,   // min dx
                        event.clientX + window.scrollX - gCss(this.el).left - this.activeNode.offset.x
                    )
                ),
                y: Math.min(
                    gCss(this.el).height - gAttr(this.activeNode.root).height - this.pad,   // max dy
                    Math.max(
                        this.pad,   // min dy
                        event.clientY + window.scrollY - gCss(this.el).top - this.activeNode.offset.y
                    )
                ),
            });

            // animate active link
            else if (this.activeLink) sAttr();
        };
    }

    addNode(coord) {
        coord = Object.assign({ x: 0, y: 0 }, coord || {});

        const
            gAttr = new Utility().gAttr,
            gCss = new Utility().gCss,
            nn = new Node(coord);

        nn.body.onmousedown = () => {
            if (event.button) return;
            nn.offset = {
                // mouse.x + scroll.x - node.root.x - workspace.left
                x: event.clientX + window.scrollX - gAttr(nn.root).x - gCss(this.el).left,
                y: event.clientY + window.scrollY - gAttr(nn.root).y - gCss(this.el).top,
            };
            this.activeNode = nn;
        };
        nn.body.onmouseup = () => {
            if (event.button) return;
            this.activeNode = null;
        };

        this.svg.appendChild(nn.root);
        this.graph.nodes.push(nn);
    }
}

class Node {
    constructor(geo) {
        geo = Object.assign({ x: 0, y: 0, w: 150, h: 100 }, geo || {});

        const
            pr = 10,    // port radius
            sAttr = new Utility().sAttr;

        this.root = document.newSVG('svg');
        sAttr(this.root, {
            cursor: 'pointer',
            x: geo.x - pr - geo.w / 2,
            y: geo.y - geo.h / 2,
        });

        // create and append node body
        this.body = document.newSVG('rect');
        sAttr(this.body, {
            x: pr,
            width: geo.w,
            height: geo.h,
        });
        this.root.appendChild(this.body);

        // create and append node input ports
        this.in = [{
            svg: document.newSVG('circle'),
        }];
        this.in.forEach(port => {
            port.dir = 'in';

            sAttr(port.svg, {
                r: pr,
                cx: pr,
                cy: geo.h / 2,
                fill: 'lightgreen',
            });

            port.onmousedown = () => {
                // create path
            };

            port.onmouseup = () => {
                if (event.target.hasOwnProperty('dir') && event.target.dir == 'in') {
                    // create link
                }
                else {
                    // remove path
                }
            };

            this.root.appendChild(port.svg);
        });

        // create and append node output ports
        this.out = [{
            svg: document.newSVG('circle'),
        }];
        this.out.forEach(port => {
            port.dir = 'out';

            sAttr(port.svg, {
                r: pr,
                cx: geo.w + pr,
                cy: geo.h / 2,
                fill: 'skyblue',
            });

            port.onmousedown = () => {
                port.link = new Link();
            };

            port.onmouseup = () => {
                if (event.target.hasOwnProperty('dir') && event.target.dir == 'in') {
                    // establish link
                }
                else port.link = null;
            };

            this.root.appendChild(port.svg);
        });
    }
}

class Link {
    constructor() {
        this.start = { x: 0, y: 0, cx: 0, cy: 0, node: null };
        this.end = { x: 0, y: 0, cx: 0, cy: 0, node: null };
        
        this.svg = document.newSVG('path');
        sAttr(this.svg, {
            d: `M${this.start.x} ${this.start.y} C ${this.start.cx} ${this.start.cy}, ${this.end.cx} ${this.end.cy}, ${this.end.x} ${this.end.y}`,
            stroke: 'black',
        });


    }

    render(ws) {
        if (!(ws instanceof Workspace)) console.error('the render method expects an instance of Workspace');

        ws.
    }

    establish() {

    }
}

class Utility {
    constructor() {
        // unique id
        this.uid = prefix => {
            // non-zero random number
            const nzrn = () => Math.random() || this.nzrn();

            // random string
            const rs = `${prefix}-${nzrn().toString(36).slice(-3)}`;

            if (Array.from(document.documentElement.getElementsByTagName('*')).some(el => el.id == rs)) return this.uid();
            return rs;
        };

        // get item from array
        this.gifa = (arr, i) => i < 0 ? arr[arr.length + i] : arr[i];

        // set & get attribute
        this.sAttr = (el, opts) => Object.entries(opts).forEach(kvp => el.setAttribute(kvp[0], kvp[1].toString()));
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
        this.sCss = (el, opts) => Object.entries(opts).forEach(kvp => el.style[kvp[0]] = kvp[1]);
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
    }
}