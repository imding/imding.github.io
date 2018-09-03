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
                fill: '#303030',
            },
            node: {
                pos: { x: 0, y: 0 },
                br: 8,      // border radius
                hs: 30,     // head size
                hp: 6,      // head padding
                hfill: 'skyblue',
                bfill: 'lightcyan',
            },
            port: {
                r: 4,
            },
            link: {
                stroke: 'skyblue',
                strokeWidth: '4',
                strokeLinecap: 'round',
                strokeOpacity: '0.8'
            },
        };

        this.root;
        this.workspace = [];

        this.activeWorkspace;
        this.activeNode;
        this.activePort;
        this.activeLink;
    }

    render(root) {
        this.root = root;
        this.newWorkspace({ pos: { x: 100, y: 120 } });
    }

    newWorkspace(cf) {
        cf = Object.assign(this.default.workspace, cf || {});

        const
            id = uid(),
            ws = {
                root: newElement('div', { id: `WS-${id}`, className: 'UI-WS', textContent: `WS-${id}` }),
                links: newSVG('svg'),
                graph: { nodes: [], links: [], }
            };

        sCss(ws.root, {
            width: `${cf.scl.x}px`,
            height: `${cf.scl.y}px`,
            left: `${cf.pos.x}px`,
            top: `${cf.pos.y}px`,
            backgroundColor: cf.fill,
        });

        sAttr(ws.links, {
            id: `LNK-${id}`,
            class: 'UI-LINKS',
            width: cf.scl.x,
            height: cf.scl.y,
            viewBox: `0 0 ${cf.scl.x} ${cf.scl.y}`,
        });

        sCss(ws.links, {
            left: `${cf.pos.x}px`,
            top: `${cf.pos.y}px`,
        });

        ws.root.onmouseenter = () => this.activeWorkspace = ws;
        ws.root.onmouseleave = () => this.activeWorkspace = this.activeNode = null;

        ws.root.oncontextmenu = () => this.newNode({ pos: relCursor(ws.root) });
        ws.root.onmousemove = () => {
            // animate active node with cursor
            if (this.activeNode) sCss(this.activeNode.root, {
                left: `${Math.min(
                    gCss(ws.root).width - gCss(this.activeNode.root).width - cf.pad,    // max dx
                    Math.max(cf.pad /* min dx */, relCursor(ws.root).x - this.activeNode.offset.x)
                )}px`,
                top: `${Math.min(
                    gCss(ws.root).height - gCss(this.activeNode.root).height - cf.pad,  // max dy
                    Math.max(cf.pad /* min dy */, relCursor(ws.root).y - this.activeNode.offset.y)
                )}px`,
            });

            else if (this.activeLink) this.activeLink.update();
        };

        this.root.appendChild(ws.root);
        this.root.appendChild(ws.links);
        this.workspace.push(ws);
    }

    newNode(cf) {
        event.preventDefault();

        cf = Object.assign(this.default.node, cf || {});

        const
            id = uid(),
            node = {
                root: newElement('div', { id: `NR-${id}`, className: 'nodeRoot' }),
                head: newElement('div', { id: `NH-${id}`, className: 'nodeHead', textContent: `node-${id}` }),
                body: newElement('div', { id: `NB-${id}`, className: 'nodeBody' }),
                input: newElement('div', { className: 'nodeInput' }),
                output: newElement('div', { className: 'nodeOutput' }),
                ports: { input: [], output: [] },
                newPort: cf => {
                    cf = Object.assign(this.default.port, cf || {});

                    const port = {
                        dir: cf.dir,
                        root: newElement('div', { className: 'portRoot' }),
                        socket: newElement('div', { className: 'portSocket' }),
                        type: newElement('div', { className: 'portType', textContent: cf.type || 'any' }),
                        name: newElement('div', { className: 'portName', textContent: cf.name || cf.dir }),
                    };

                    node[port.dir].appendChild(port.root);

                    port.root.appendChild(port.socket);
                    if (port.dir === 'output') port.root.insertBefore(port.name, port.socket);
                    else port.root.appendChild(port.name);

                    sCss(port.socket, {
                        margin: `0 ${port.dir === 'output' ? cf.r : 0}px 0 ${port.dir === 'input' ? cf.r : 0}px`,
                        width: `${cf.r * 2}px`,
                        height: `${cf.r * 2}px`,
                        backgroundColor: this.default.workspace.fill,
                    });

                    sCss(port.name, {
                        margin: `0 ${port.dir === 'output' ? cf.r : 0}px 0 ${port.dir === 'input' ? cf.r : 0}px`,
                    });

                    const
                        portWidth = gCss(port.socket).width + gCss(port.name).width + cf.r * 2 + cf.r * 4,
                        nodeWidth = gCss(node.body).width;

                    sCss(port.root, {
                        width: `${port.dir === 'input' ? portWidth : portWidth < nodeWidth ? nodeWidth : portWidth}px`,
                    });

                    port.socket.onclick = () => {
                        if (this.activeLink) return;
                        this.newLink(port.dir === 'input' ? { end: port } : { start: port });
                    };

                    // node.ports[port.dir].push(port);
                },
            };

        // append elements to document so they have computed CSS values for further calculation
        node.root.appendChild(node.head);
        node.root.appendChild(node.body);
        node.body.appendChild(node.input);
        node.body.appendChild(newElement('hr'));
        node.body.appendChild(node.output);

        if (!this.activeWorkspace.root) throw new Error('adding a new node requires an active workspace.');

        this.activeWorkspace.root.appendChild(node.root);

        sCss(node.head, {
            padding: `${cf.hp}px ${cf.hp * 2}px ${cf.hp / 2}px ${cf.hp * 2}px`,
            borderRadius: `${cf.br}px ${cf.br}px 0 0`,
            backgroundColor: cf.hfill,
        });

        sCss(node.body, {
            padding: `${cf.br / 2}px 0 ${cf.br}px 0`,
            borderRadius: `0 0 ${cf.br}px ${cf.br}px`,
            backgroundColor: cf.bfill,
        });

        // attach ports only after styling the body
        node.newPort({ dir: 'input', type: 'Boolean', name: 'condition' });
        node.newPort({ dir: 'input', type: 'Boolean', name: 'true' });
        node.newPort({ dir: 'input', type: 'Boolean', name: 'false' });
        node.newPort({ dir: 'output', type: 'function', name: 'else if' });
        node.newPort({ dir: 'output', type: 'function', name: 'else' });

        // trim the x & y scale of the following elements
        // order of arguments is important
        trimScale(node.input, node.output, node.body, node.head);

        // calculate x & y scale of the node root element
        const
            fixedWidth = gCss(node.head).width,
            fixedHeight = gCss(node.head).height + gCss(node.body).height;

        sCss(node.root, {
            width: `${fixedWidth}px`,
            height: `${fixedHeight}px`,
            left: `${cf.pos.x - fixedWidth / 2}px`,
            top: `${cf.pos.y - fixedHeight / 2}px`,
        });

        node.head.onmouseup = () => this.activeNode = null;
        node.head.onmousedown = () => {
            this.activeNode = node;
            this.activeNode.offset = relCursor(node.root);
        };

        this.activeWorkspace.graph.nodes.push(node);
    }

    newLink(cf) {
        cf = Object.assign(this.default.link, cf || {});

        log('created new link...');

        const link = {
            svg: newSVG('path', { id: uid('L') }),
            start: cf.start,
            end: cf.end,
            update: () => {
                const
                    p1 = link.start ? relPos(link.start.socket, this.activeWorkspace.root, 'cog') : relCursor(this.activeWorkspace.root),
                    p2 = link.end ? relPos(link.end.socket, this.activeWorkspace.root, 'cog') : relCursor(this.activeWorkspace.root),
                    c1 = p1,
                    c2 = p2;

                sAttr(link.svg, { d: `M${p1.x},${p1.y} C${c1.x},${c1.y} ${c2.x},${c2.y} ${p2.x},${p2.y}` });


            },
        };

        sAttr(link.svg, cf);

        this.activeWorkspace.links.appendChild(link.svg);

        this.activeLink = link;
    }
}

function log(msg) {
    if (!msg) return debug.innerHTML = '';
    debug.innerHTML += `${debug.textContent.trim().length ? '\n' : ''}${msg}`;
}

class Utility {
    constructor() {
        // unique id
        this.uid = prefix => {
            // non-zero random scalar
            const nzrs = () => Math.random() || this.nzrs();

            // random string
            const rs = `${prefix ? `${prefix}-` : ''}${nzrs().toString(36).slice(-3)}`;

            if (Array.from(document.documentElement.getElementsByTagName('*')).some(el => el.id == rs)) return this.uid(prefix);
            return rs;
        };

        // get item from array
        this.gifa = (arr, i) => i < 0 ? arr[arr.length + i] : arr[i];

        // set & get attribute
        this.sAttr = (el, details) => Object.entries(details).forEach(entry => el.setAttribute(entry[0].replace(/([A-Z])/g, '-$1').toLowerCase(), entry[1].toString()));
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
                val = p => cs.getPropertyValue(p),
                box = el => el.getBoundingClientRect();

            return new Proxy(
                {
                    get width() { return (parseFloat(val('width')) || box(el).width); },
                    get height() { return (parseFloat(val('height')) || box(el).height); },
                    get left() { return (parseFloat(val('left')) || box(el).left); },
                    get top() { return (parseFloat(val('top')) || box(el).top); },
                }, {
                    get: (o, p) => p in o ? o[p] : val(p.replace(/([A-Z])/g, '-$1'.toLowerCase())),
                }
            );
        };

        // relative cursor position
        this.relCursor = (ref, cf) => {
            if (ref && ref.nodeType != 1) throw new Error('the relCursor method expects an HTML element as argument');

            const refBox = (ref || document.body).getBoundingClientRect();

            let pos = {
                x: event.clientX - refBox.left + window.scrollX,
                y: event.clientY - refBox.top + window.scrollY,
            };

            return this.applyConfig(pos, cf, refBox);
        };

        // relative element position
        this.relPos = (el, ref, cf) => {
            const
                elBox = el.getBoundingClientRect(),
                refBox = ref.getBoundingClientRect();

            let pos = {
                x: elBox.left - refBox.left + window.scrollX,
                y: elBox.top - refBox.top + window.scrollY,
            };

            return this.applyConfig(pos, cf, elBox);
        };

        // apply general configurations for 2D vector
        this.applyConfig = (v2, cf, ref) => {
            if (/cog/.test(cf)) {
                if (!ref) throw new Error('a reference bounding box is required to calculate centre of gravity.');
                v2.x += ref.width / 2;
                v2.y += ref.height / 2;
            }

            if (/round/.test(cf)) {
                v2.x = Math.round(v2.x);
                v2.y = Math.round(v2.y);
            }

            if (/abs/.test(cf)) {
                v2.x = Math.abs(v2.x);
                v2.y = Math.abs(v2.y);
            }

            return v2;
        };

        // new svg element
        this.newSVG = type => document.createElementNS('http://www.w3.org/2000/svg', type);

        // new element
        this.newElement = (type, attr) => {
            const el = document.createElement(type);
            Object.assign(el, attr);
            return el;
        };

        // make width & height integer
        this.trimScale = (...o) => {
            if (o.length === 1) o = o[0];
            Object.values(o).forEach(el => {
                if (el.nodeType === 1) this.sCss(el, {
                    width: `${Math.ceil(this.gCss(el).width)}px`,
                    height: `${Math.ceil(this.gCss(el).height)}px`,
                });
            });
        };
    }
}