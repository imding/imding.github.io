class Pipeline {
    constructor(root) {
        this.self = root;
        this.chart = {
            self: newElement('div', { id: 'Chart' }),
            nodes: {},
            cards: [],
            offset: 0,
            scroll: 0,
            updateOffset: () => {
                // the offset value is necessary for the chart when
                //  1) the active deck is wider than the window & the chart is not
                //  2) the chart is wider than the window & the active deck is wider than both

                if (!this.activeNode) throw new Error('the updateOffset method expects an active node');

                const
                    vw = window.innerWidth,
                    chartClipped = this.chart.self.offsetWidth > vw,
                    deckClipped = this.activeNode.deck.self.offsetWidth > vw,
                    chartIsWider = this.chart.self.offsetWidth >= this.activeNode.deck.self.offsetWidth;

                this.chart.offset = deckClipped && !chartIsWider ? (this.activeNode.deck.self.offsetWidth - (chartClipped ? this.chart.self.offsetWidth : vw)) / 2 : 0;
                this.activeNode.deck.offset = chartClipped && chartIsWider ? (this.chart.self.offsetWidth - (deckClipped ? this.activeNode.deck.self.offsetWidth : vw)) / 2 : 0;

                print(`offset: chart(${this.chart.offset}), deck(${this.activeNode.deck.offset})`);
            },
        };

        this.self.appendChild(this.chart.self);

        this.chart.self.onmousemove = () => this.autoScroll(event.clientX, this.chart);

        window.onresize = () => {
            if (this.activeNode) {
                this.chart.updateOffset();
                this.autoScroll(this.activeNode.deck.scroll, this.activeNode.deck);
            }
            this.autoScroll(this.chart.scroll, this.chart);
        };
    }

    autoScroll(ref, focus) {
        const
            vw = window.innerWidth,
            clipSize = Math.max(0, focus.self.offsetWidth - vw);

        focus.scroll = ref;

        // normalised scroll range
        ref = (clamp(ref, vw * 0.2, vw * 0.8) - vw * 0.2) / (vw * 0.6);

        sCss(focus.self, { left: `-${ref * clipSize + focus.offset}px` });
    }

    render(nodesData, cardsData) {
        nodesData.forEach(nd => {
            if (Array.isArray(nd)) {
                const shell = this.newShell(nd[0]);
                nd[1].forEach(title => shell.newNode(title));
            }
            else pl.newNode(nd);
        });

        cardsData.forEach(cd => cd.cards.forEach(card => this.chart.nodes[cd.deck].addCard(card)));
    }

    newNode(name, parent) {
        if (!(name || '').trim().length) throw new Error('the newNode() method expects a name');

        const node = {
            self: newElement('div', { className: `Node ${parent ? 'Inner' : ''} Active`, textContent: name.replace(/^[^\w]+|[^\w]+$/, '') }),
            deck: {
                self: newElement('div', { id: `${camelize(name)}`, className: 'Deck' }),
                offset: 0,
                scroll: 0,
            },
            addCard: cf => {
                const card = {
                    self: newElement('div', { className: 'Card' }),
                    title: newElement('h4', { textContent: cf.title || 'Card Title' }),
                    shade: newElement('div', { className: 'Shade' }),
                    sections: [],
                };

                card.self.appendChild(card.title);
                node.deck.self.appendChild(card.self);

                cf.sections.forEach(section => {
                    const _section = { title: null, content: [] };

                    if (section.title) {
                        _section.title = newElement('h5', { textContent: section.title });
                        card.self.appendChild(_section.title);
                    }

                    section.content.forEach(content => {
                        let item;

                        if (content.type === 'p') {
                            item = newElement('p');

                            if (!content.hasOwnProperty('bullet')) content.bullet = true;

                            const p = /\[([^:\[\]]+)::([^\]]+)\]/;

                            while (p.test(content.html)) {
                                const
                                    m = content.html.match(p),
                                    // patterns to turn into tags
                                    _p = /^(b|i|u|em|del|sub|sup|samp)$/g.test(m[1]);

                                content.html = content.html.replace(m[0], _p ? `<${m[1]}>${htmlEscape(m[2])}</${m[1]}>` : `<a href='${m[2]}' target='_blank'>${m[1]}</a>`);
                            }

                            item.innerHTML = `${content.bullet ? '<i class=\'fa fa-info-circle\'></i>' : ''} ${content.html}`;
                        }

                        else if (content.type === 'img') {
                            item = newElement('a', { href: content.src, target: '_blank' });
                            item.appendChild(newElement('img', { src: content.src }));
                        }

                        else if (content.type === 'code') {
                            item = newElement('code');
                            item.textContent = content.code;
                            item.onclick = () => {
                                const selection = window.getSelection(), rangeObj = document.createRange();

                                rangeObj.selectNodeContents(item);

                                selection.removeAllRanges();
                                selection.addRange(rangeObj);

                                document.execCommand('copy') ? item.style.borderLeft = 'solid 5px palegreen' : item.style.borderLeft = 'solid 5px indianred';

                                setTimeout(() => {
                                    item.style.borderLeft = 'solid 5px #1D2533';
                                    selection.removeAllRanges();
                                }, 500);
                            };
                        }

                        card.self.appendChild(item);
                        _section.content.push(item);
                    });

                    card.sections.push(_section);

                    if (!_section.title) return;

                    _section.title.onclick = () => _section.content.forEach(content => {
                        sCss(content, { display: gCss(content).display == 'none' ? 'inherit' : 'none' });
                    });

                    _section.title.click();
                });

                card.self.appendChild(card.shade);
                card.self.onscroll = () => sCss(card.shade, { top: `${card.self.scrollTop}px` });
            },
        };

        this.newArrow({ flow: name.match(/[<>]+/), parent: parent });

        (parent || this.chart.self).appendChild(node.self);
        this.self.appendChild(node.deck.self);

        if (this.chart.nodes.hasOwnProperty(node.deck.self.id)) throw new Error(`the ${name} node already exists`);

        this.chart.nodes[node.deck.self.id] = node;

        node.deck.self.onmousemove = () => this.autoScroll(event.clientX, node.deck);

        node.self.onclick = () => {
            if (this.activeNode === node) return;

            if (this.activeNode) {
                sCss(this.activeNode.self, { borderColor: '#1D2533' });
                sCss(this.activeNode.deck.self, { display: 'none' });
            }

            sCss(node.self, { borderColor: '#B8D3FC' });
            sCss(node.deck.self, {
                display: 'grid',
                height: `${window.innerHeight - gCss(this.self).rowGap - this.chart.self.offsetHeight}px`,
            });

            this.activeNode = node;
            this.chart.updateOffset();

            // snap adjust everything after new deck is displayed
            sCss(this.chart.self, { transition: 'none' });
            sCss(this.activeNode.deck.self, { transition: 'none' });
            this.autoScroll(event.clientX, this.chart);
            this.autoScroll(this.activeNode.deck.scroll, this.activeNode.deck);
            setTimeout(() => sCss(this.chart.self, { transition: 'left 0.2s ease-out' }, 0));
            setTimeout(() => sCss(this.activeNode.deck.self, { transition: 'left 0.2s ease-out' }, 0));
        };

        return node;
    }

    newShell(name) {
        const shell = {
            self: newElement('div', { className: 'Node Shell' }),
            title: newElement('b', { textContent: name.replace(/^[^\w]+|[^\w]+$/, '') }),
            newNode: (name, cards) => this.newNode(name, shell.self, cards),
        };

        this.newArrow({ flow: name.match(/[<>]+/), inner: false });
        this.chart.self.appendChild(shell.self);
        shell.self.appendChild(shell.title);

        return shell;
    }

    newArrow(cf) {
        if (!cf.flow) return;

        cf.flow = cf.flow[0];

        if (cf.flow.endsWith('>')) {
            const arrowContainer = newElement('div');

            if (cf.flow.startsWith('<')) {
                const arrow = newElement('i', { className: `fa fa-caret-${cf.parent ? 'up' : 'left'}` });
                sCss(arrow, {
                    display: 'initial',
                    marginRight: `${cf.parent ? 10 : 2}px`,
                });
                arrowContainer.appendChild(arrow);
            }

            const arrow = newElement('i', { className: `fa fa-caret-${cf.parent ? 'down' : 'right'}` });
            arrowContainer.appendChild(arrow);

            (cf.parent || this.chart.self).appendChild(arrowContainer);
        }
    }
}

// class Utility {
//     constructor() {
//         this.config = {
//             showDebug: true,
//         };

//         // unique id
//         this.uid = prefix => {
//             // non-zero random scalar
//             const nzrs = () => Math.random() || this.nzrs();

//             // random string
//             const rs = `${prefix ? `${prefix}-` : ''}${nzrs().toString(36).slice(-3)}`;

//             if (Array.from(document.documentElement.getElementsByTagName('*')).some(el => prefix ? el.id == rs : el.id.endsWith(`-${rs}`))) return this.uid(prefix);
//             return rs;
//         };

//         // clamp number within range
//         this.clamp = (val, min, max) => {
//             return Math.min(Math.max(val, min), max);
//         };

//         // element array queries
//         this.elarr = arr => {
//             arr = Array.from(arr);
//             if (!Array.isArray(arr)) throw new Error('the elarr method expects and array like object');

//             return {
//                 get maxWidth() {
//                     return Math.max(...arr.map(el => gCss(el).width));
//                 },
//             };
//         };

//         // flatten array
//         this.flarr = arr => {
//             return {
//                 get shallow() { return arr.reduce((acc, val) => acc.concat(val), []); },
//                 get deep() { return arr.reduce((acc, val) => Array.isArray(val) ? acc.concat(this.flarr(val)) : acc.concat(val), []); },
//             };
//         };

//         // get item from array
//         this.gifa = (arr, i) => i < 0 ? arr[arr.length + i] : arr[i];

//         // remove item from array
//         this.rifa = (item, arr) => arr.splice(arr.indexOf(item), 1);

//         // set & get attribute
//         this.sAttr = (el, details) => Object.entries(details).forEach(entry => el.setAttribute(entry[0].replace(/([A-Z])/g, '-$1').toLowerCase(), entry[1].toString()));
//         this.gAttr = el => {
//             return new Proxy(
//                 {
//                     get x() { return parseFloat(el.getAttribute('x')); },
//                     get y() { return parseFloat(el.getAttribute('y')); },
//                     get width() { return parseFloat(el.getAttribute('width')) || el.getBBox().width; },
//                     get height() { return parseFloat(el.getAttribute('height')) || el.getBBox().height; },
//                 }, {
//                     get: (o, attr) => attr in o ? o[attr] : el.getAttribute(attr),
//                 }
//             );
//         };

//         // set & get css style
//         this.sCss = (el, details) => Object.entries(details).forEach(entry => el.style[entry[0]] = entry[1]);
//         this.gCss = el => {
//             if (!el) throw new Error('the gCss method expects a valid HTML element');

//             const
//                 cs = window.getComputedStyle(el),
//                 val = p => cs.getPropertyValue(p),
//                 box = el => el.getBoundingClientRect();

//             return new Proxy(
//                 {
//                     get width() { return (parseFloat(val('width')) || box(el).width); },
//                     get height() { return (parseFloat(val('height')) || box(el).height); },
//                     get left() { return (parseFloat(val('left')) || box(el).left); },
//                     get top() { return (parseFloat(val('top')) || box(el).top); },
//                 }, {
//                     get: (o, p) => {
//                         if (p in o) {
//                             return o[p];
//                         }
//                         else {
//                             const v = val(p.replace(/([A-Z])/g, '-$1'.toLowerCase()));
//                             return parseFloat(v) || v;
//                         }
//                     },
//                 }
//             );
//         };

//         // relative cursor position
//         this.relCursor = (ref, cf) => {
//             if (ref && ref.nodeType != 1) throw new Error('the relCursor method expects an HTML element as argument');

//             const refBox = (ref || document.body).getBoundingClientRect();

//             let pos = {
//                 x: event.clientX - refBox.left + window.scrollX,
//                 y: event.clientY - refBox.top + window.scrollY,
//             };

//             return this.applyConfig(pos, cf, refBox);
//         };

//         // relative element position
//         this.relPos = (el, ref, cf) => {
//             const
//                 elBox = el.getBoundingClientRect(),
//                 refBox = ref.getBoundingClientRect();

//             let pos = {
//                 x: elBox.left - refBox.left + window.scrollX,
//                 y: elBox.top - refBox.top + window.scrollY,
//             };

//             return this.applyConfig(pos, cf, elBox);
//         };

//         // apply general configurations for 2D vector
//         this.applyConfig = (v2, cf, ref) => {
//             if (/cog/.test(cf)) {
//                 if (!ref) throw new Error('a reference bounding box is required to calculate centre of gravity.');
//                 v2.x += ref.width / 2;
//                 v2.y += ref.height / 2;
//             }

//             if (/round/.test(cf)) {
//                 v2.x = Math.round(v2.x);
//                 v2.y = Math.round(v2.y);
//             }

//             if (/abs/.test(cf)) {
//                 v2.x = Math.abs(v2.x);
//                 v2.y = Math.abs(v2.y);
//             }

//             return v2;
//         };

//         // new svg element
//         this.newSVG = type => document.createElementNS('http://www.w3.org/2000/svg', type);

//         // new element
//         this.newElement = (type, attr) => {
//             const el = document.createElement(type);
//             Object.assign(el, attr);
//             return el;
//         };

//         // convert string to camel case
//         this.camelize = str => {
//             str = str.replace(/^[^\w]+|[^\w]+$/, '');
//             if (!/\s/.test(str)) return str.toLowerCase();
//             return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (letter, index) {
//                 return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
//             }).replace(/\s+/g, '');
//         };

//         // make width & height integer
//         this.trimScale = (...o) => {
//             if (o.length === 1) o = o[0];
//             Object.values(o).forEach(el => {
//                 if (el.nodeType === 1) this.sCss(el, {
//                     width: `${Math.ceil(this.gCss(el).width)}px`,
//                     height: `${Math.ceil(this.gCss(el).height)}px`,
//                 });
//             });
//         };

//         this.print = (msg, opt) => {
//             if (!this.config.showDebug) return;
//             if (!opt) { opt = 'log'; }

//             const
//                 time = new Date(),
//                 tStamp = `[${this.pad(time.getHours())}:${this.pad(time.getMinutes())}:${this.pad(time.getSeconds())}]`;

//             if (Array.isArray(msg)) console[opt](tStamp, ...msg);
//             else console[opt](tStamp, msg);
//         };

//         this.pad = n => {
//             return n.toString().length == 2 ? n : '0' + n.toString();
//         };
//     }
// }