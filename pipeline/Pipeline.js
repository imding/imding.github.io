class Pipeline {
    constructor(root) {
        this.self = root;
        this.chart = {
            self: newElement('div', { id: 'Chart' }),
            nodes: {},
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

        this.nodesData = [];
        this.cardsData = [];

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

    render(nodesData, decksData) {
        this.nodesData = nodesData;
        this.decksData = decksData;

        nodesData.forEach(nd => {
            if (Array.isArray(nd)) {
                const shell = this.newShell(nd[0]);
                nd[1].forEach(title => shell.newNode(title));
            }
            else pl.newNode(nd);
        });

        decksData.forEach(dd => dd.cards.forEach(card => this.chart.nodes[dd.deck].addCard(card)));
    }

    newNode(name, parent) {
        if (!(name || '').trim().length) throw new Error('the newNode() method expects a name');

        const node = {
            // index: Object.keys(this.chart.nodes).length,
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
                            content.html = htmlEscape(content.html);

                            if (!content.hasOwnProperty('bullet')) content.bullet = true;

                            const p = /\[([^:\[\]]+)::([^\]]+)\]/;

                            while (p.test(content.html)) {
                                const
                                    m = content.html.match(p),
                                    // patterns to turn into tags
                                    _p = /^(b|i|u|em|del|sub|sup|samp)$/g.test(m[1]);

                                content.html = content.html.replace(m[0], _p ? `<${m[1]}>${m[2]}</${m[1]}>` : `<a href='${m[2]}' target='_blank'>${m[1]}</a>`);
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
            newNode: name => this.newNode(name, shell.self),
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

    adminAccess() {
        const
            admin = newElement('div', { id: 'admin' }),
            editIcon = newElement('i', { id: 'editIcon', className: 'fa fa-pencil fa-lg' });

        document.body.appendChild(admin);
        admin.appendChild(editIcon);

        admin.onclick = () => this.showEditPanel();
    }

    showEditPanel() {
        admin.onclick = null;

        sCss(editIcon, { display: 'none' });
        sCss(admin, {
            cursor: 'default',
            width: '450px',
            height: 'calc(100vh - 100px)',
            top: '50px',
        });

        const
            nodesContainer = newElement('div', { id: 'nodesContainer' }),
            deckContainer = newElement('div', { id: 'deckContainer' }),
            addNodeInput = (val, arrow, indent, isNode) => {
                const
                    nodeInputContainer = newElement('div', { className: 'nodeInputContainer' }),
                    nodeNameInput = newElement('input', { className: 'adminInput' }),
                    deckIcon = newElement('i', { className: 'fa fa-edit' }),
                    shellIcon = newElement('i', { className: 'fa fa-object-group' }),
                    indentIcon = newElement('i', { className: 'fa fa-indent' }),
                    removeIcon = newElement('i', { className: 'fa fa-remove' }),
                    dragIcon = newElement('i', { className: 'fa fa-reorder' });

                nodesContainer.appendChild(nodeInputContainer);

                if (arrow) {
                    const dir = newElement('div', { className: 'dirToggle', textContent: val.match(/^[<>]+/) || '' });
                    nodeInputContainer.appendChild(dir);
                    dir.onclick = () => dir.textContent = (dir.textContent == '>>' ? '<>' : '>>');
                }

                nodeNameInput.value = val.replace(/^[<>]+\s*/, '');

                nodeInputContainer.appendChild(nodeNameInput);
                nodeInputContainer.appendChild(deckIcon);
                nodeInputContainer.appendChild(shellIcon);
                nodeInputContainer.appendChild(indentIcon);
                nodeInputContainer.appendChild(removeIcon);
                nodeInputContainer.appendChild(dragIcon);

                shellIcon.onclick = () => {
                    if (gCss(shellIcon).opacity > 0.1) {
                        if (nodeInputContainer.className.includes('shellInput')) {
                            nodeInputContainer.classList.remove('shellInput');
                            nodeInputContainer.classList.add('nodeInput');
                        }
                        else {
                            nodeInputContainer.classList.remove('nodeInput');
                            nodeInputContainer.classList.add('shellInput');
                        }
                    }
                };

                indentIcon.onclick = () => {
                    if (gCss(indentIcon).opacity > 0.1) {
                        if (nodeInputContainer.className.includes('indented')) {
                            nodeInputContainer.classList.remove('indented');
                        }
                        else nodeInputContainer.classList.add('indented');
                    }
                };

                dragIcon.onmousedown = () => nodesContainer.active = dragIcon.parentNode;

                if (indent) nodeInputContainer.classList.add('indented');
                if (isNode) {
                    nodeInputContainer.classList.add('nodeInput');
                    deckIcon.onclick = () => this.editDeck(camelize(val.replace(/^[<>]+\s*/, '')));
                }
                else nodeInputContainer.classList.add('shellInput');
            };

        //  attach the 'done' button
        const doneButton = newElement('i', { id: 'doneButton', className: 'fa fa-check-square-o fa-3x' });

        admin.appendChild(doneButton);
        
        doneButton.onclick = () => {
            const nodes = Array.from(document.querySelectorAll('.nodeInputContainer'));

            nodes.forEach(node => {

            });
        };

        //  attach container for node editor
        admin.appendChild(nodesContainer);

        admin.onmousemove = () => {
            const et = event.target, an = nodesContainer.active;

            if (an) {
                //  valid target
                const vt = et.className.includes('nodeInputContainer') ? et : et.parentNode.className.includes('nodeInputContainer') ? et.parentNode : null;

                if (!vt) return;

                vt.restorePadding = () => {
                    sCss(vt, { paddingTop: '10px' });
                    vt.removeEventListener('mouseout', vt.restorePadding);
                };

                if (vt != an && vt != an.nextElementSibling) {
                    sCss(vt, { paddingTop: '20px' });
                    nodesContainer.target = vt;
                }
                else nodesContainer.target = null;

                vt.addEventListener('mouseout', vt.restorePadding);
            }
        };

        admin.onmouseup = () => {
            const an = nodesContainer.active, target = nodesContainer.target;

            if (an) {
                if (target) {
                    nodesContainer.insertBefore(an, target);
                    target.restorePadding();
                }
                nodesContainer.active = null;
            }
        }

        //  add all data found in chart to the edit panel
        this.nodesData.forEach((nd, i) => {
            if (Array.isArray(nd)) {
                const shell = nd[0];
                addNodeInput(shell, i, false, false);
                nd[1].forEach((node, j) => addNodeInput(node, j, true, true));
            }
            else addNodeInput(nd, i, false, true);
        });

        //  attach the 'new node' button
        const newNodeButton = newElement('i', { id: 'newNodeButton', className: 'fa fa-plus-square fa-2x' });

        nodesContainer.appendChild(newNodeButton);

        newNodeButton.onclick = () => {
            addNodeInput('New Node', true, false, true);
            nodesContainer.appendChild(newNodeButton);
        };
    }

    editDeck(name) {
        // this.decksData.some(dd => {
        //     if (dd.deck != name) return;

        //     dd.cards.forEach(card => {
        //         console.log(card);
        //         const
        //             cardContainer = newElement('div', { className: 'cardContainer' }),
        //             cardTitleInput = newElement('input', { className: 'cardTitleInput' });

        //         deckContainer.appendChild(cardContainer);
        //         cardContainer.appendChild(cardTitleInput);

        //         card.sections.forEach(sec => {
        //             if (sec.hasOwnProperty('title')) {
        //                 // cardContainer.appendChild();
        //             }
        //         });
        //     });
        // });
    }
}