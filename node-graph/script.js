loading();

function loading() {
    if (document.body) init();
    else window.requestAnimationFrame(loading);
}

function init() {
    // add utility functions to window object
    Object.assign(window, new Utility());

    // display app container
    sCss(appContainer, { visibility: 'visible' });

    // create instance of Flo
    fl = new Flo();

    fl.init(appContainer);

    run.onclick = () => {
        const cf = config.showDebug;
        config.showDebug = cf || !cf;
        fl.evaluate();
        config.showDebug = cf;
    };
}

class Flo {
    constructor() {
        this.default = {
            workspace: {
                pos: { x: 0, y: 0 },
                scl: { x: 1280, y: 350 },
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
                inputMinWidth: 30,
                inputMaxWidth: 120,
                inputPadding: 4,
                editable: false,
                hidden: false,
            },
            link: {
                stroke: 'plum',
                strokeWidth: '4',
                strokeLinecap: 'round',
                strokeOpacity: '0.8'
            },
            error: {
                link: 'indianred',
            },
        };

        this.root;
        this.toolbox;
        this.workspace = [];

        this.activeWorkspace;
        this.activeNode;
        this.activePort;
        this.activeLink;
    }

    // ================================== //
    // class method for initiating the UI //
    // ================================== //

    init(root) {
        this.root = root;
        this.newWorkspace({ pos: { x: 0, y: 90 } });
        this.newToolbox();
    }

    // ======================================== //
    // class method for evaluating the networks //
    // ======================================== //

    evaluate() {
        console.clear();

        // returns user defined value of a given port
        const parseVal = port => {
            // set value depending on input element type
            const val = port.input.tagName === 'INPUT' ? port.input.value : Boolean(port.input.selectedIndex);

            // need better validation of user input value ***
            return (new Function(`return ${val};`)());
        };

        // iterate through all workspaces
        this.workspace.forEach(ws => {
            // ensure graph has only one scheduler
            let scheduler = ws.network.nodes.filter(n => n.name.startsWith('scheduler'));
            if (scheduler.length !== 1) throw new Error('make sure there is exactly one scheduler in the network.');
            else scheduler = scheduler[0];

            const
                openPorts = {},
                initValues = {},
                components = {},
                connections = [],
                upstreamLinks = [];

            do {
                const
                    link = upstreamLinks.shift(),
                    node = link ? link.start.owner : scheduler;

                // avoid duplication of components including open ports and their initial values
                if (!components.hasOwnProperty(node.name)) {
                    // describe each node as a FBP component
                    const c = {
                        name: node.name,
                        inPorts: node.ports.input.map(ip => ip.name),
                        outPorts: node.ports.output.map(op => op.name),
                        body: node.eval,
                    };

                    components[node.name] = c;

                    print(['new component:', c]);

                    // iterate through all input ports
                    node.ports.input.forEach(nip => {
                        // store existing links on each port
                        if (nip.links.length) nip.links.forEach(ipl => {
                            upstreamLinks.push(ipl);
                            print(['new link:', ipl]);
                        });

                        else if (!nip.editable && !nip.hidden && nip.owner !== scheduler) throw new Error(`the ${nip.owner.name} node failed to evaluate: input port ${nip.label.textContent} requires an input`);

                        else {
                            // store open ports and the owner node names
                            openPorts.hasOwnProperty(node.name) ? openPorts[node.name].push(nip.name) : openPorts[node.name] = [nip.name];
                            print(['new open port:', nip]);

                            // store initial values for open ports
                            initValues[`${node.name}.${nip.name}`] = nip.input ? parseVal(nip) : null;
                            print(['new initial value:', initValues[`${node.name}.${nip.name}`]]);
                        }
                    });
                }

                // define connection info for each link
                if (link) {
                    const c = {
                        fromNode: node.name,
                        fromPort: link.start.name,
                        toNode: link.end.owner.name,
                        toPort: link.end.name,
                    };

                    connections.push(c);
                    print(['new connection:', c]);
                }
            }
            while (upstreamLinks.length);

            // add all components to FBP
            Object.values(components).forEach(c => FBP.component(c));

            // define network
            FBP.define(`NW-${ws.root.id.split(/-/)[1]}`, function (F) {
                // indicate nodes and their open input ports
                // e.g. F.init('add', 'B') tells the network a node called 'add' has an open input port called 'B'
                Object.entries(openPorts).forEach(entry => entry[1].forEach(port => F.init(entry[0], port)));

                // describe connections between nodes to FBP
                connections.forEach(c => F.connect(c.fromNode, c.fromPort, c.toNode, c.toPort));

                // always end with the scheduler node
                F.end(scheduler.name, 'result');

            }).go(initValues, function (err, result) {
                if (err) print(err, 'warn');
                else print(`!! evaluation took ${Math.round(result.interval)}ms, it returned ${result.output == undefined ? 'nothing' : result.output}`);
            });

        });
    }

    // ====================================== //
    // class method for creating the tool box //
    // ====================================== //

    newToolbox() {
        const tb = {
            root: newElement('div', { id: 'UI-TB' }),
            nodes: [],
            nodeData: [
                {
                    name: 'scheduler',
                    ports: {
                        in: [
                            { name: 'ip1', label: 'A', type: 'Execute' },
                            { name: 'ip2', label: 'B', type: 'Execute' },
                            { name: 'ip3', label: 'C', type: 'Execute' },
                            { name: 'ip4', label: 'D', type: 'Execute' },
                            { name: 'ip5', label: 'E', type: 'Execute' },
                        ],
                        out: [{ name: 'result', hidden: true }],
                    },
                    eval: (ip1, ip2, ip3, ip4, ip5, result) => result(null, () => {
                        setTimeout(ip1, 0);
                        setTimeout(ip2, 0);
                        setTimeout(ip3, 0);
                        setTimeout(ip4, 0);
                        setTimeout(ip5, 0);
                    }),
                },
                {
                    name: 'new variable',
                    ports: {
                        in: [
                            { name: 'ip1', label: 'name', type: 'string', editable: true },
                            { name: 'ip2', label: 'value', editable: true },
                        ],
                        out: [{ name: 'op1', label: 'Run', type: 'execute' }],
                    },
                    eval: (ip1, ip2, op1) => op1(null, () => { eval(`var ${ip1};`);  }),
                },
                {
                    name: 'number',
                    ports: {
                        in: [{ name: 'ip1', label: 'A', type: 'number', editable: true }],
                        out: [{ name: 'op1', label: 'A', type: 'number' }],
                    },
                    eval: (ip1, op1) => op1(null, Number(ip1)),
                },
                {
                    name: 'string',
                    ports: {
                        in: [{ name: 'ip1', label: 'A', type: 'string', editable: true }],
                        out: [{ name: 'op1', label: 'A', type: 'string' }],
                    },
                    eval: (ip1, op1) => op1(null, String(ip1)),
                },
                {
                    name: 'boolean',
                    ports: {
                        in: [{ name: 'ip1', label: 'A', type: 'boolean', editable: true }],
                        out: [{ name: 'op1', label: 'A', type: 'boolean' }],
                    },
                    eval: (ip1, op1) => op1(null, Boolean(ip1)),
                },
                {
                    name: 'add',
                    ports: {
                        in: [
                            { name: 'ip1', label: 'A', editable: true },
                            { name: 'ip2', label: 'B', editable: true },
                        ],
                        out: [{ name: 'op1', label: 'A + B', }]
                    },
                    eval: (ip1, ip2, op1) => op1(null, ip1 + ip2),
                },
                {
                    name: 'subtract',
                    ports: {
                        in: [
                            { name: 'ip1', label: 'A', editable: true },
                            { name: 'ip2', label: 'B', editable: true },
                        ],
                        out: [{ name: 'op1', label: 'A - B', }]
                    },
                    eval: (ip1, ip2, op1) => op1(null, ip1 - ip2),
                },
                {
                    name: 'multiply',
                    ports: {
                        in: [
                            { name: 'ip1', label: 'A', editable: true },
                            { name: 'ip2', label: 'B', editable: true },
                        ],
                        out: [{ name: 'op1', label: 'A * B', }]
                    },
                    eval: (ip1, ip2, op1) => op1(null, ip1 * ip2),
                },
                {
                    name: 'divide',
                    ports: {
                        in: [
                            { name: 'ip1', label: 'A', editable: true },
                            { name: 'ip2', label: 'B', editable: true },
                        ],
                        out: [{ name: 'op1', label: 'A / B', }]
                    },
                    eval: (ip1, ip2, op1) => op1(null, ip1 / ip2),
                },
                {
                    name: 'greater than',
                    ports: {
                        in: [
                            { name: 'ip1', label: 'A', editable: true },
                            { name: 'ip2', label: 'B', editable: true },
                        ],
                        out: [{ name: 'op1', label: 'A > B', }],
                    },
                    eval: (ip1, ip2, op1) => op1(null, ip1 > ip2),
                },
                {
                    name: 'less than',
                    ports: {
                        in: [
                            { name: 'ip1', label: 'A', editable: true },
                            { name: 'ip2', label: 'B', editable: true },
                        ],
                        out: [{ name: 'op1', label: 'A < B', }],
                    },
                    eval: (ip1, ip2, op1) => op1(null, ip1 < ip2),
                },
                {
                    name: 'equal to',
                    ports: {
                        in: [
                            { name: 'ip1', label: 'A', editable: true },
                            { name: 'ip2', label: 'B', editable: true },
                        ],
                        out: [{ name: 'op1', label: 'A == B', }],
                    },
                    eval: (ip1, ip2, op1) => op1(null, ip1 == ip2),
                },
                {
                    name: 'and',
                    ports: {
                        in: [
                            { name: 'ip1', label: 'A', type: 'boolean', editable: true },
                            { name: 'ip2', label: 'B', type: 'boolean', editable: true },
                        ],
                        out: [{ name: 'op1', label: 'A && B', }],
                    },
                    eval: (ip1, ip2, op1) => op1(null, ip1 && ip2),
                },
                {
                    name: 'or',
                    ports: {
                        in: [
                            { name: 'ip1', label: 'A', type: 'bolean', editable: true },
                            { name: 'ip2', label: 'B', type: 'bolean', editable: true },
                        ],
                        out: [{ name: 'op1', label: 'A || B', }],
                    },
                    eval: (ip1, ip2, op1) => op1(null, ip1 || ip2),
                },
                {
                    name: 'not',
                    ports: {
                        in: [
                            { name: 'ip1', label: 'A', type: 'boolean', editable: true },
                        ],
                        out: [{ name: 'op1', label: '!A', }],
                    },
                    eval: (ip1, ip2, op1) => op1(null, !ip1),
                },
                {
                    name: 'if',
                    ports: {
                        in: [
                            { name: 'ip1', label: 'condition', type: 'boolean', editable: true },
                            { name: 'ip2', label: 'true' },
                            { name: 'ip3', label: 'false' },
                        ],
                        out: [{ name: 'op1', label: 'Result' }],
                    },
                    eval: (ip1, ip2, ip3, op1) => op1(null, ip1 ? ip2 : ip3),
                },
                {
                    name: 'document',
                    ports: {
                        in: [{ name: 'ip1', hidden: true }],
                        out: [{ name: 'op1', label: 'document', type: 'HTMLElement' }],
                    },
                    eval: (ip1, op1) => op1(null, document),
                },
                {
                    name: 'getElementById',
                    ports: {
                        in: [
                            { name: 'ip1', label: 'Parent', type: 'HTMLElement' },
                            { name: 'ip2', label: 'ID', type: 'string', editable: true },
                        ],
                        out: [{ name: 'op1', label: 'HTML Element', type: 'HTMLElement' }],
                    },
                    eval: (ip1, ip2, op1) => op1(null, ip1.getElementById(ip2)),
                },
                {
                    name: 'innerHTML',
                    ports: {
                        in: [{ name: 'ip1', label: 'Target', type: 'HTMLElement' }],
                        out: [{ name: 'op1', label: 'HTML String', type: 'string' }],
                    },
                    eval: (ip1, op1) => op1(null, ip1.innerHTML),
                },
                {
                    name: 'create element',
                    ports: {
                        in: [{ name: 'ip1', label: 'tag name', type: 'string', editable: true }],
                        out: [{ name: 'op1', label: 'Element', type: 'HTMLElement' }],
                    },
                    eval: (ip1, op1) => op1(null, document.createElement(ip1)),
                },
                {
                    name: 'log',
                    ports: {
                        in: [{ name: 'ip1', label: 'Message', type: 'string', editable: true }],
                        out: [{ name: 'op1', label: 'Run', type: 'execute' }],
                    },
                    eval: (ip1, op1) => op1(null, console.log(ip1)),
                    // eval: new Function(['ip1', 'op1', 'op2'], 'op1(null, console.log(ip1)); op2(null, console.log(ip1));'),
                },
                {
                    name: 'alert',
                    ports: {
                        in: [{ name: 'ip1', label: 'Message', type: 'string', editable: true }],
                        out: [{ name: 'op1', label: 'Run', type: 'execute' }],
                    },
                    eval: (ip1, op1) => op1(null, alert(ip1)),
                },
                {
                    name: 'random number',
                    ports: {
                        in: [{ name: 'random', hidden: true }],
                        out: [{ name: 'op1', label: 'number', type: 'number' }],
                    },
                    eval: (ip1, op1) => op1(null, Math.random()),
                }],

            // ================================= //
            // toolbox method for showing itself //
            // ================================= //

            show: () => {
                this.activeWorkspace.root.appendChild(tb.root);
                
                sCss(tb.root, {
                    visibility: 'visible',
                    left: `${relCursor(this.activeWorkspace.root).x - gCss(tb.root).width / 2}px`,
                    top: `${relCursor(this.activeWorkspace.root).y - gCss(tb.root).height / 2}px`,
                });

                tb.visible = true;

                print(`showing toolbox in ${this.activeWorkspace.root.id}`);
            },

            // ================================ //
            // toolbox method for hiding itself //
            // ================================ //

            hide: () => {
                this.root.appendChild(tb.root);
                sCss(tb.root, { visibility: 'hidden' });
                tb.visible = false;
            },
        };

        this.root.appendChild(tb.root);

        tb.hide();

        tb.root.onmouseleave = () => tb.hide();

        tb.nodeData.forEach(nd => {
            const node = {
                resident: newElement('div', { className: 'UI-TBN', textContent: nd.name }),
                addToWorkspace: () => this.activeWorkspace.newNode(Object.assign({ pos: relCursor(this.activeWorkspace.root) }, nd)),
            };

            node.resident.onclick = () => {
                tb.hide();
                node.addToWorkspace();
            };

            tb.root.appendChild(node.resident);
            tb.nodes.push(node);
        });

        this.toolbox = tb;
    }

    // ========================================= //
    // class method for creating a new workspace //
    // ========================================= //

    newWorkspace(cf) {
        cf = Object.assign(Object.assign({}, this.default.workspace), cf || {});

        const
            id = uid(),
            ws = {
                root: newElement('div', { id: `WS-${id}`, className: 'UI-WS', textContent: `WS-${id}` }),
                links: newSVG('svg'),
                network: { nodes: [], links: [], },

                // ======================================== //
                // workspace method for createing new nodes //
                // ======================================== //

                newNode: cf => {
                    cf = Object.assign(Object.assign({}, this.default.node), cf || {});

                    const
                        id = uid(),
                        node = {
                            root: newElement('div', { id: `NR-${id}`, className: 'nodeRoot' }),
                            head: newElement('div', { id: `NH-${id}`, className: 'nodeHead', textContent: cf.name || `node-${id}` }),
                            body: newElement('div', { id: `NB-${id}`, className: 'nodeBody' }),
                            input: newElement('div', { className: 'nodeInput' }),
                            output: newElement('div', { className: 'nodeOutput' }),
                            ports: { input: [], output: [] },
                            links: [],
                            name: `${camelize(cf.name)}-${id}`,
                            eval: cf.eval,

                            // ================================== //
                            // node method for creating new ports //
                            // ================================== //

                            newPort: cf => {
                                cf = Object.assign(Object.assign({}, this.default.port), cf || {});

                                const port = {
                                    owner: node,
                                    name: cf.name,
                                    dir: cf.dir,
                                    type: cf.type,
                                    editable: cf.editable,
                                    hidden: cf.hidden,
                                    clone: cf.clone || false,
                                    links: [],
                                    root: newElement('div', Object.assign({ className: 'portRoot' }, cf.hidden ? { hidden: true } : {})),
                                    socket: newElement('div', { className: 'portSocket' }),
                                    label: newElement('div', { className: 'portName', textContent: cf.label || cf.name || cf.dir }),
                                    resize: () => {
                                        const portWidth = gCss(port.socket).width + gCss(port.label).width + cf.r * 2 + (cf.editable ? gCss(port.input).width : 0) + cf.r * 4;
                                        let nodeWidth = gCss(node.body).width;

                                        sCss(port.root, { width: `${port.dir === 'input' ? portWidth : portWidth < nodeWidth ? nodeWidth : portWidth}px` });

                                        // determine new width for the node
                                        nodeWidth = Math.max(node.minWidth, elarr(node.root.querySelectorAll('.portRoot')).maxWidth);
                                        sCss(node.root, { width: `${nodeWidth}px` });

                                        // push output ports to the right side
                                        node.ports.output.forEach(p => sCss(p.root, { marginLeft: `${nodeWidth - gCss(p.root).width}px` }));
                                        // redraw all attached link
                                        node.links.forEach(l => l.update());
                                    },
                                };


                                // append port root to input or output section depending on port direction
                                node[port.dir].appendChild(port.root);
                                port.root.appendChild(port.socket);

                                // append socket and name in different order depending on port direction
                                if (port.dir === 'output') port.root.insertBefore(port.label, port.socket);
                                else port.root.appendChild(port.label);

                                // store the port on the parent node object
                                node.ports[port.dir].push(port);

                                sCss(port.socket, {
                                    margin: `0 ${port.dir === 'output' ? cf.r : 0}px 0 ${port.dir === 'input' ? cf.r : 0}px`,
                                    width: `${cf.r * 2}px`,
                                    height: `${cf.r * 2}px`,
                                    backgroundColor: this.default.workspace.fill,
                                });

                                sCss(port.label, { margin: `0 ${port.dir === 'output' ? cf.r : 0}px 0 ${port.dir === 'input' ? cf.r : 0}px` });

                                // create and append input field if the port is editable
                                if (cf.editable) {
                                    const isBool = /boolean/.test(cf.type);

                                    port.input = newElement(isBool ? 'select' : 'input', { className: 'portInput' });
                                    port.root.appendChild(port.input);

                                    port.input.resize = () => {
                                        // create new ruler element
                                        const ruler = newElement('span', { textContent: isBool ? port.input.selectedOptions[0].textContent : port.input.value.replace(/\s/g, '_') });

                                        // make sure ruler element has the same font family ans size as the input field
                                        sCss(ruler, {
                                            fontFamily: gCss(port.input).fontFamily,
                                            fontSize: gCss(port.input).fontSize,
                                            padding: gCss(port.input).padding,
                                        });

                                        this.root.appendChild(ruler);       // add ruler element to page to get measurement

                                        // set the size of the input field with upper & lower boundaries
                                        sCss(port.input, { width: `${Math.min(cf.inputMaxWidth, Math.max(cf.inputMinWidth, gCss(ruler).width + 2))}px` });

                                        this.root.removeChild(ruler);       // remove ruler
                                    };

                                    port.input.oninput = () => {
                                        // resize the input field
                                        port.input.resize();
                                        // resize the root element that contains the socket, name & input field
                                        port.resize();
                                    };

                                    if (isBool) {
                                        port.input.add(newElement('option', { value: 0, text: 'false' }));
                                        port.input.add(newElement('option', { value: 1, text: 'true' }));
                                        port.input.resize();
                                    }

                                    sCss(port.input, {
                                        margin: `0 0 0 ${cf.r}px`,
                                        width: `${isBool ? 'initial' : `${cf.inputMinWidth}px`}`,
                                        padding: `0 ${cf.inputPadding}px`,
                                    });
                                }

                                port.resize();

                                // when a port is clicked
                                port.socket.onclick = () => {
                                    // clicking on a port while a link is active
                                    if (this.activeLink) {
                                        const
                                            targetPort = port,
                                            // store the port at the other end of the active link
                                            linkedPort = this.activeLink.start || this.activeLink.end,
                                            // check if the port belongs to the same node
                                            sameNode = linkedPort.owner === targetPort.owner,
                                            // check if the clicked port is of the same direction ( out -> out or in -> in)
                                            sameDir = linkedPort.dir === targetPort.dir,
                                            // check for attempt to establish multiple connections to an input port
                                            multipleInputs = port.dir === 'input' && port.links.length;

                                        // invalid attempt to establish connection
                                        if (sameNode || sameDir || port.links.length) {
                                            sAttr(this.activeLink.svg, { stroke: this.default.error.link });
                                            setTimeout(() => sAttr(this.activeLink.svg, { stroke: this.default.link.stroke }), 250);
                                            print(`connection can only be established ${sameNode ? 'between 2 nodes' : sameDir ? 'between input & output ports' : 'to an open port'}`, 'warn');
                                        }

                                        // valid attempt to establish connection
                                        else {
                                            let np;

                                            // attempt to connect to occupied port
                                            if (port.links.length) {
                                                const cf = {
                                                    name: `op${port.links.length + 1}`,
                                                    dir: port.dir,
                                                    shadow: port,
                                                    hidden: true,
                                                };

                                                np = port.owner.newPort(cf);



                                                // console.log(cf);
                                                console.log(port.owner);
                                                console.log(port.owner.eval);

                                            }

                                            // establish connection
                                            node.links.push(this.activeLink);
                                            this.activeLink.connect(np || port);

                                        }
                                    }

                                    // clicking on open port with no active link
                                    else if (!port.links.length) {
                                        this.activePort = port;

                                        // create a new link
                                        ws.newLink();
                                        port.links.push(this.activeLink);
                                        node.links.push(this.activeLink);
                                    }

                                    // clicking on an occupied port with no active link
                                    else {
                                        // define pluck function
                                        const pluck = link => {
                                            // remove start/end reference from the link
                                            link[port.dir === 'input' ? 'end' : 'start'] = null;

                                            if (port.editable) {
                                                port.input.disabled = false;
                                                sCss(port.input, { opacity: 1 });
                                            }

                                            rifa(link, port.links);
                                            rifa(link, port.owner.links);

                                            this.activeLink = link;

                                            print(`plucked a link from ${port.owner.head.textContent}.${port.label.textContent}`);
                                        };

                                        // clicking on an output port with no active link
                                        if (port.dir === 'output') {
                                            const linkList = newElement('div', { id: 'linkList' });

                                            ws.root.appendChild(linkList);

                                            sCss(linkList, {
                                                left: `${relPos(port.socket, ws.root, 'cog').x + cf.r * 3}px`,
                                                top: `${relPos(port.socket, ws.root).y}px`,
                                            });

                                            port.links.forEach(pl => {
                                                // define link reference
                                                const lr = newElement('div', {
                                                    className: 'linkRef',
                                                    textContent: `-> ${camelize(pl.end.owner.head.textContent)}.${pl.end.label.textContent}`,
                                                });

                                                linkList.appendChild(lr);

                                                lr.onclick = () => {
                                                    ws.root.removeChild(linkList);
                                                    pluck(pl);
                                                    pl.update();
                                                };
                                            });

                                        }

                                        // clicking on an input port with no active link
                                        else pluck(port.links[0]);
                                    }
                                };

                                return port;
                            },
                        };

                    // assemble node & append to workspace so...
                    // it has computed CSS values for further calculation
                    node.root.appendChild(node.head);
                    node.root.appendChild(node.body);
                    node.body.appendChild(node.input);
                    node.body.appendChild(newElement('hr'));
                    node.body.appendChild(node.output);
                    ws.root.appendChild(node.root);

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
                    cf.ports.in.forEach(pcf => node.newPort(Object.assign({ dir: 'input' }, pcf)));
                    cf.ports.out.forEach(pcf => node.newPort(Object.assign({ dir: 'output' }, pcf)));

                    // trim the x & y scale of the following elements
                    // order of arguments is important
                    // trimScale(node.input, node.output, node.body, node.head);

                    // calculate scale of the node root element
                    node.minWidth = gCss(node.head).width;
                    const fixedHeight = gCss(node.head).height + gCss(node.body).height;

                    sCss(node.root, {
                        // width is omitted because it will be set by adding a new port
                        // and every node has at least one port
                        height: `${fixedHeight}px`,
                        left: `${cf.pos.x - node.minWidth / 2}px`,
                        top: `${cf.pos.y - fixedHeight / 2}px`,
                    });

                    node.head.onmouseup = () => {
                        sCss(node.root, {
                            zIndex: 'initial',
                            opacity: 'initial',
                        });
                        this.activeNode = null;
                    };
                    node.head.onmousedown = () => {
                        sCss(node.root, {
                            zIndex: 1,
                            opacity: 0.8,
                        });
                        this.activeNode = node;
                        this.activeNode.offset = relCursor(node.root);
                    };

                    ws.network.nodes.push(node);

                    print(`created ${node.name} in ${ws.root.id}`);
                },

                // ======================================= //
                // workspace method for creating new links //
                // ======================================= //

                newLink: cf => {
                    cf = Object.assign(Object.assign({}, this.default.link), cf || {});

                    const link = {
                        svg: newSVG('path', { id: uid('L') }),
                        start: this.activePort.dir === 'output' ? this.activePort : null,
                        end: this.activePort.dir === 'input' ? this.activePort : null,
                        update: () => {
                            const
                                p1 = link.start ? relPos(link.start.socket, ws.root, 'cog') : relCursor(ws.root),
                                p2 = link.end ? relPos(link.end.socket, ws.root, 'cog') : relCursor(ws.root),
                                // add control points ***
                                c1 = p1,
                                c2 = p2;

                            sAttr(link.svg, { d: `M${p1.x},${p1.y} C${c1.x},${c1.y} ${c2.x},${c2.y} ${p2.x},${p2.y}` });
                        },
                        connect: port => {
                            port.links.push(link);

                            if (port.editable) {
                                port.input.disabled = true;
                                sCss(port.input, { opacity: 0 });
                            }

                            link[link.start ? 'end' : 'start'] = port;
                            link.update();

                            this.activeLink = null;

                            print(`-> contection established: ${camelize(link.start.owner.head.textContent)}.${link.start.label.textContent} -> ${camelize(link.end.owner.head.textContent)}.${link.end.label.textContent}`);
                        },
                    };

                    sAttr(link.svg, cf);

                    ws.links.appendChild(link.svg);
                    this.activeLink = link;

                    print(`created a link on ${this.activePort.owner.head.textContent}`);
                },
            };

        ws.root.appendChild(ws.links);
        this.root.appendChild(ws.root);
        this.workspace.push(ws);

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

        ws.root.onmouseenter = () => {
            this.activeWorkspace = ws;
            print(`${ws.root.id} became the active workspace`);
        };
        ws.root.onmouseleave = () => {
            print(`${ws.root.id} is no longer the active workspace`);
            this.activeWorkspace = this.activeNode = null;
        };

        ws.root.oncontextmenu = () => {
            event.preventDefault();

            if (this.activeLink) {
                const port = (this.activeLink.start || this.activeLink.end);

                rifa(this.activeLink, port.links);
                rifa(this.activeLink, port.owner.links);

                ws.links.removeChild(this.activeLink.svg);

                this.activeLink = null;

                print(`-> discarded link from ${port.owner.head.textContent}`);
            }
            else if (!this.toolbox.visible && event.target === ws.root) this.toolbox.show();
        };

        ws.root.onmousemove = () => {
            // animate active node with cursor
            if (this.activeNode) {
                sCss(this.activeNode.root, {
                    left: `${Math.round(Math.min(
                        gCss(ws.root).width - gCss(this.activeNode.root).width - cf.pad,    // max dx
                        Math.max(cf.pad /* min dx */, relCursor(ws.root).x - this.activeNode.offset.x)
                    ))}px`,
                    top: `${Math.round(Math.min(
                        gCss(ws.root).height - gCss(this.activeNode.root).height - cf.pad,  // max dy
                        Math.max(cf.pad /* min dy */, relCursor(ws.root).y - this.activeNode.offset.y)
                    ))}px`,
                });

                this.activeNode.links.forEach(link => link.update());
            }

            else if (this.activeLink) this.activeLink.update();
        };
    }
}

class Utility {
    constructor() {
        this.config = {
            showDebug: false,
        };

        // unique id
        this.uid = prefix => {
            // non-zero random scalar
            const nzrs = () => Math.random() || this.nzrs();

            // random string
            const rs = `${prefix ? `${prefix}-` : ''}${nzrs().toString(36).slice(-3)}`;

            if (Array.from(document.documentElement.getElementsByTagName('*')).some(el => prefix ? el.id == rs : el.id.endsWith(`-${rs}`))) return this.uid(prefix);
            return rs;
        };

        // element array queries
        this.elarr = arr => {
            arr = Array.from(arr);
            if (!Array.isArray(arr)) throw new Error('the elarr method expects and array like object');

            return {
                get maxWidth() {
                    return Math.max(...arr.map(el => gCss(el).width));
                },
            };
        };

        // flatten array
        this.flarr = arr => {
            return {
                get shallow() { return arr.reduce((acc, val) => acc.concat(val), []); },
                get deep() { return arr.reduce((acc, val) => Array.isArray(val) ? acc.concat(this.flarr(val)) : acc.concat(val), []); },
            };
        };

        // get item from array
        this.gifa = (arr, i) => i < 0 ? arr[arr.length + i] : arr[i];

        // remove item from array
        this.rifa = (item, arr) => arr.splice(arr.indexOf(item), 1);

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

        // convert string to camel case
        this.camelize = str => {
            if (!/\s/.test(str.trim())) return str;
            return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (letter, index) {
                return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
            }).replace(/\s+/g, '');
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

        this.print = (msg, opt) => {
            if (!this.config.showDebug) return;
            if (!opt) { opt = 'log'; }

            const
                time = new Date(),
                tStamp = `[${this.pad(time.getHours())}:${this.pad(time.getMinutes())}:${this.pad(time.getSeconds())}]`;

            if (Array.isArray(msg)) console[opt](tStamp, ...msg);
            else console[opt](tStamp, msg);
        };

        this.pad = n => {
            return n.toString().length == 2 ? n : '0' + n.toString();
        };
    }
}