class Pipeline {
    constructor(root) {
        this.default = {
            card: {},
        };

        this.self = root;
        this.chart = {
            self: newElement('div', { id: 'Chart' }),
            nodes: {},
            cards: [],
            scroll: 0,
        };

        this.self.appendChild(this.chart.self);

        window.onmousemove = () => this.autoScroll(event.clientX);
        window.onresize = () => this.autoScroll(window.innerWidth / 2);
    }

    autoScroll(ref) {
        const
            c = [],
            // focus = 
            chartCSS = gCss(this.chart.self),
            deckCSS = gCss(this.activeNode.deck.self),
            vw = window.innerWidth;

        /* conditions */
        c.push(chartCSS.width >= deckCSS.width);  // c[0] = flowchart wider than or same width as deck
        c.push(chartCSS.width > vw);                 // c[1] = flowchart clipped
        c.push(deckCSS.width > vw);                  // c[2] = deck clipped

        /* normalized scroll range */
        ref = (clamp(ref, vw * 0.2, vw * 0.8) - vw * 0.2) / (vw * 0.6);

        /* default scroll values */
        this.chart.scroll = ref * (vw - chartCSS.width);
        this.activeNode.deck.scroll = ref * (vw - deckCSS.width);

        /* calculate flow-chart transform */
        if (c[1]) {
            c[0] ? null : this.chart.scroll -= ((deckCSS.width - chartCSS.width) / 2);
        } else if (!c[0] && !c[1] && c[2]) {
            this.chart.scroll = (deckCSS.width - vw) / -2;
        } else {
            this.chart.scroll = 0;
        }

        /* calculate deck transform */
        if (c[2]) {
            c[0] ? this.activeNode.deck.scroll -= ((chartCSS.width - deckCSS.width) / 2) : null;
        } else if (c[0] && c[1] && !c[2]) {
            this.activeNode.deck.scroll = (chartCSS.width - vw) / -2;
        } else {
            this.activeNode.deck.scroll = 0;
        }

        /* animate stuff */
        window.requestAnimationFrame(() => {
            /* flow-chart & deck */
            (focus == this.chart.self || !focus) ? sCss(this.chart.self, { left: `${this.chart.scroll}px` }) : null;
            (focus == this.activeNode.deck.self || !focus) ? sCss(this.activeNode.deck.self, { self: `${this.activeNode.deck.scroll}px` }) : null;
            // if (!focus) {
            //     activeDeck.style.height = winHeight - activeDeck.offsetTop + 'px';
            // }
        });
    }

    newNode(name, parent, cards) {
        if (!(name || '').trim().length) throw new Error('the newNode() method expects a name');

        const node = {
            self: newElement('div', { className: `Node ${parent ? 'Inner' : ''} Active`, textContent: name.replace(/^[^\w]+|[^\w]+$/, '') }),
            deck: {
                self: newElement('div', { id: `${camelize(name)}`, className: 'Deck' }),
                scroll: 0,
            },
            cards: [],
            addCard: cf => {
                const card = {
                    self: newElement('div', { className: 'Card' }),
                    title: newElement('h4', { textContent: cf.title || 'Card Title' }),
                };

                card.self.appendChild(card.title);
                node.deck.self.appendChild(card.self);

                cf.sections.forEach(section => {
                    if (section.subtitle) card.self.appendChild(newElement('h5', { textContent: section.subtitle }));

                    section.content.forEach(cf => {
                        const item = newElement(cf.type);

                        if (cf.html) item.innerHTML = `${cf.bullet ? '<i class=\'fa fa-info-circle\'></i>' : ''} ${cf.html}`;

                        card.self.appendChild(item);
                    });
                });

                node.cards.push(card);
            },
        };

        if (!parent) this.newArrow();

        (parent || this.chart.self).appendChild(node.self);
        this.self.appendChild(node.deck.self);

        if (this.chart.nodes.hasOwnProperty(node.deck.self.id)) throw new Error(`the ${name} node already exists`);

        this.chart.nodes[node.deck.self.id] = node;

        node.self.onclick = () => {
            if (this.activeNode === node) return;

            if (this.activeNode) {
                sCss(this.activeNode.deck.self, { display: 'none' });
                sCss(this.activeNode.self, { borderColor: '#1D2533' });
            }

            sCss(node.deck.self, { display: 'grid' });
            sCss(node.self, { borderColor: '#B8D3FC' });

            this.activeNode = node;

            // snap adjust everything after new deck is displayed
            // sCss(this.chart.self, { transition: 'none' });
            // this.autoScroll(event.clientX);
            // setTimeout(() => sCss(this.chart.self, { transition: 'left 0.2s ease-out' }, 50));
        };

        if (!this.activeNode) {
            node.self.click();
            this.activeNode = node;
        }

        (cards || []).forEach(card => node.addCard(card));

        return node;
    }

    newShell(name) {
        const shell = {
            self: newElement('div', { className: 'Node Shell' }),
            title: newElement('b', { textContent: name }),
            newNode: (name, cards) => this.newNode(name, shell.self, cards),
        };

        this.newArrow();
        this.chart.self.appendChild(shell.self);
        shell.self.appendChild(shell.title);

        return shell;
    }

    newArrow(cf) {
        if (Object.keys(this.chart.nodes).length) {
            const arrow = newElement('i', { className: 'fa fa-caret-right fa-lg' });
            this.chart.self.appendChild(arrow);
        }
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

        // clamp number within range
        this.clamp = (val, min, max) => {
            return Math.min(Math.max(val, min), max);
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
            if (!el) throw new Error('the gCss method expects a valid HTML element');

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
            str = str.replace(/^[^\w]+|[^\w]+$/, '');
            if (!/\s/.test(str)) return str.toLowerCase();
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