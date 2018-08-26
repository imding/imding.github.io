loading();

// let flo, gCss, gAttr;

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
        const checkers = [
            {
                pass: () => arguments.length == 1,
                message: 'the render method expects a single argument',
            },
            {
                pass: () => el && el.tagName == 'DIV',
                message: 'the render expects a <div> element',
            }
        ];

        checkers.forEach(check => { if (!check.pass()) throw new Error(check.message); });

        document.newSVG = type => document.createElementNS('http://www.w3.org/2000/svg', type);

        el.onmouseup = () => {
            this.ui.workspace.forEach(ws => {
                if (event.button) return;

                ws.activeNode = null;

                if (ws.activeLink) {
                    // const targetNode = ws.graph.nodes.filter(n => n.);
                    console.log(event.target);
                    // ws.svg.removeChild(ws.activeLink.svg);
                    ws.activeLink = null;
                }
            });
        };

        this.el = el;

        const ws = new Workspace(document.createElement('div'));

        this.addWorkspace(ws, { x: 100, y: 200, w: 800, h: 650 });
    }

    addWorkspace(ws, details) {
        if (!(ws instanceof Workspace)) throw new Error('the addWorkspace method expects an instance of Workspace');

        details = Object.assign({ x: 0, y: 0, w: 500, h: 350 }, details);

        sCss(ws.el, {
            position: 'absolute',
            left: `${details.x}px`,
            top: `${details.y}px`,
            width: `${details.w}px`,
            height: `${details.h}px`,
        });

        sAttr(ws.svg, {
            width: details.w,
            height: details.h,
            viewBox: `0 0 ${details.w} ${details.h}`,
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

        checkers.forEach(check => { if (!check.pass) throw new Error(check.message); });

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

            this.addNode(relCursor(this.el));
        };

        this.activeNode;
        this.activeLink;

        this.el.onmousemove = () => {
            // animate active node
            if (this.activeNode) sAttr(this.activeNode.svg, {
                // mouse.x + scroll.x - workspace.left - activeNode.offset.x
                x: Math.min(
                    gCss(this.el).width - gAttr(this.activeNode.svg).width - this.pad, // max dx
                    Math.max(
                        this.pad,   // min dx
                        relCursor(this.el).x - this.activeNode.offset.x
                    )
                ),
                y: Math.min(
                    gCss(this.el).height - gAttr(this.activeNode.svg).height - this.pad,   // max dy
                    Math.max(
                        this.pad,   // min dy
                        relCursor(this.el).y - this.activeNode.offset.y
                    )
                ),
            });

            // animate active link
            // else if (this.activeLink) sAttr(this.activeLink.path, {
            //     d: `M${this.start.x} ${this.start.y} C ` +
            //         `${this.start.cx} ${this.start.cy}, ` +
            //         `${this.end.cx} ${this.end.cy}, ` +
            //         `${this.end.x} ${this.end.y}`,
            //     stroke: 'black',
            // });
        };
    }

    addNode(pos) {
        pos = Object.assign({ x: 0, y: 0 }, pos || {});

        const nn = new Node(pos);

        nn.body.onmousedown = () => {
            if (event.button) return;
            nn.offset = {
                // mouse.x + scroll.x - node.svg.x - workspace.left
                x: relCursor(this.el).x - gAttr(nn.svg).x,
                y: relCursor(this.el).y - gAttr(nn.svg).y,
            };
            this.activeNode = nn;
        };

        nn.in.concat(nn.out).forEach(port => {
            port.svg.onmousedown = () => {
                if (event.button) return;

                console.log(port);

                const
                    portPos = {
                        x: 0,
                        y: 0,
                    },
                    start = dir == 'in' ? null : portPos,
                    end = dir == 'out' ? null : portPos,
                    nl = new Link(start, end);

                this.svg.appendChild(nl.svg);
                this.activeLink = nl;

                // Object.assign((port.dir == 'in' ? port.link.end : port.link.start), {
                //     node: nn,
                //     x: gAttr(port.svg).x + gAttr(port.svg).width / 2,
                //     y: gAttr(port.svg).y + gAttr(port.svg).height / 2,
                // });

            };

            port.svg.onmouseup = () => {
                if (!event.button && this.activeLink && event.target.dir == 'out') return;

            };
        });

        this.svg.appendChild(nn.svg);
        this.graph.nodes.push(nn);
    }
}

class Node {
    constructor(pos, scl) {
        pos = Object.assign({ x: 0, y: 0 }, pos || {});
        scl = Object.assign({ x: 150, y: 100 }, scl || {});

        const
            br = 10,    // body radius
            pr = 10;    // port radius

        this.svg = document.newSVG('svg');
        sAttr(this.svg, {
            cursor: 'pointer',
            x: pos.x - pr - scl.x / 2,
            y: pos.y - scl.y / 2,
        });

        // create and append node body
        this.body = document.newSVG('rect');
        sAttr(this.body, {
            x: pr,
            width: scl.x,
            height: scl.y,
            rx: br,
            ry: br,
            fill: 'rebeccapurple',
        });
        this.svg.appendChild(this.body);

        // create and append node input ports
        this.in = [{
            dir: 'in',
            parent: this,
            svg: document.newSVG('circle'),
            link: [],
        }];
        this.in.forEach(port => {
            sAttr(port.svg, {
                r: pr,
                cx: pr,
                cy: scl.y / 2,
                fill: 'lightgreen',
            });

            this.svg.appendChild(port.svg);
        });

        // create and append node output ports
        this.out = [{
            dir: 'out',
            parent: this,
            svg: document.newSVG('circle'),
            link: [],
        }];
        this.out.forEach(port => {
            sAttr(port.svg, {
                r: pr,
                cx: scl.x + pr,
                cy: scl.y / 2,
                fill: 'skyblue',
            });

            this.svg.appendChild(port.svg);
        });
    }
}

class Link {
    constructor(start, end) {
        this.start = start;
        this.end = end;
        this.nodes = { a: null, b: null };

        this.svg = document.newSVG('svg');
        this.path = document.newSVG('path');

        sAttr(this.path, { fill: 'black' });
        
        // this.render(start, end);

        this.svg.appendChild(this.path);

    }

    render(start, end) {
        // if (start) sAttr(this.path, {
        //     d: `M${start.x} ${start.y} C ` +
        //         `${start.x + } ${start.y}, ` +
        //         `${} ${}, ` +
        //         `${} ${}`,
        // });
        // else if (end) sAttr(this.path, {

        // });
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
        
    }
}