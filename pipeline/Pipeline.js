class Pipeline {
    constructor(root) {
        this.name = '';
        this.self = root;
        this.creatorMode = false;
        this.chart = {
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

                // print(`offset: chart(${this.chart.offset}), deck(${this.activeNode.deck.offset})`);
            },
        };

        this.initData = {
            nodesData: { 0: 'Pipeline' },
            decksData: {
                pipeline: [{
                    title: 'Card Title',
                    sections: [{ content: [{ type: 'p', html: '', bullet: true }] }],
                }],
            }
        };

        this.markup = {
            deco: /\[([^:[\]]+)::([^\]]+)\]/,
            // b|i|u|em|del|sub|sup|samp
            tags: /<(b|i|u|em|del|sub|sup|samp)>([^<>]+)<\/\1>/g,
        };

        this.templates = {
            lesson_plan: [
                {
                    title: 'Overview',
                    sections: [
                        { title: 'Activities', content: [{ type: 'p', html: '' }] },
                        { title: 'Learning Objectives', content: [{ type: 'p', html: '' }] },
                    ],
                }, {
                    title: 'Review',
                    sections: [
                        { content: [{ type: 'p', html: '' }] },
                        { title: 'Notes', content: [{ type: 'p', html: 'Recommended duration: [em::5 minutes]' }] },
                    ],
                }, {
                    title: 'Engage',
                    sections: [
                        { content: [{ type: 'p', html: '' }] },
                        { title: 'Notes', content: [{ type: 'p', html: 'Recommended duration: [em::5 minutes]' }] },
                    ],
                }, {
                    title: 'Explain',
                    sections: [
                        { content: [{ type: 'p', html: '' }] },
                        { title: 'Notes', content: [{ type: 'p', html: 'Recommended duration: [em::15 minutes]' }] },
                    ],
                }, {
                    title: 'Activity',
                    sections: [{
                        content: [
                            { type: 'p', html: 'Goal: Students will ' },
                            { type: 'p', html: 'Duration: [em::30 minutes]' },
                            { type: 'p', html: 'Mode: Individual work' },
                        ]
                    }, {
                        title: 'Notes',
                        content: [{ type: 'p', html: '' }],
                    }],
                }, {
                    title: 'Wrap Up',
                    sections: [
                        { content: [{ type: 'p', html: '' }] },
                        { title: 'Notes', content: [{ type: 'p', html: 'Recommended duration: [em::5 minutes]' }] },
                    ],
                }
            ],
        };

        if (window.firebase.firestore) {
            const config = {
                apiKey: 'AIzaSyBsuGNus_E4va5nZbPQ5ITlvaFHhI99XpA',
                authDomain: 'd-pipeline.firebaseapp.com',
                databaseURL: 'https://d-pipeline.firebaseio.com',
                projectId: 'd-pipeline',
                storageBucket: 'd-pipeline.appspot.com',
                messagingSenderId: '821024383895',
            };

            firebase.initializeApp(config);

            this.fire = firebase.firestore();
            this.fire.settings({ timestampsInSnapshots: true });
        }

        this.ruler = newElement('div', { id: 'ruler' });
        this.ruler.matchStyle = target => {
            const targetStyle = gCss(target);

            sCss(this.ruler, {
                boxSizing: targetStyle.boxSizing,
                whiteSpace: targetStyle.whiteSpace,
                fontFamily: targetStyle.fontFamily,
                fontSize: `${targetStyle.fontSize}px`,
                width: `${targetStyle.width}px`,
                padding: `${targetStyle.paddingTop}px ${targetStyle.paddingRight}px ${targetStyle.paddingBottom}px ${targetStyle.paddingLeft}px`,
            });
        };

        sCss(this.ruler, { wordBreak: 'break-word' });
        
        document.body.appendChild(this.ruler);

        window.onresize = () => {
            if (this.activeNode) {
                this.chart.updateOffset();
                this.autoScroll(this.activeNode.deck.scroll, this.activeNode.deck);
                sCss(this.activeNode.deck.self, { height: `${window.innerHeight - gCss(this.self).rowGap - this.chart.self.offsetHeight}px` });
            }
            this.autoScroll(this.chart.scroll, this.chart);

            if (this.creatorMode && !cPanel.classList.contains('expanded')) {
                sCss(cPanel, { top: `${gCss(Chart).height}px` });
            }
        };

        window.onkeydown = () => {
            if (event.code == 'Escape') {
                event.preventDefault();
                if (document.querySelector('#doneButton')) {
                    document.activeElement.blur();
                    doneButton.click();
                }
            }
        };
    }

    init() {
        this.clear();

        this.chart.self = newElement('div', { id: 'Chart' });
        this.chart.nodes = {};
        this.chart.offset = 0;
        this.chart.scroll = 0;

        this.self.appendChild(this.chart.self);
        this.chart.self.onmousemove = () => this.autoScroll(event.clientX, this.chart);
    }

    autoScroll(targetPosition, focusElement) {
        if (this.creatorMode && cPanel.expanded) return;

        const
            vw = window.innerWidth,
            lowerLimit = 200,
            upperLimit = vw - 200,
            scrollSpace = upperLimit - lowerLimit,
            //  number of pixels the focus element is wider than the window width
            clipSize = Math.max(0, focusElement.self.offsetWidth - vw);

        focusElement.scroll = targetPosition;

        //  normalised scroll range ( from pixel to percentage value )
        targetPosition = (clamp(targetPosition, lowerLimit, upperLimit) - lowerLimit) / scrollSpace;

        sCss(focusElement.self, { left: `-${Math.round(targetPosition * clipSize + focusElement.offset)}px` });
    }

    render(nodesData = this.initData.nodesData, decksData = this.initData.decksData) {
        const autofillDeck = name => this.decksData[camelise(name)] = decksData[camelise(name)] || [{
            title: '',
            sections: [{ title: '', content: [{ type: 'p', html: '' }] }],
        }];

        this.init();
        this.nodesData = [];
        this.decksData = cloneObject(decksData);

        //  build nodes array from incoming nodesData object
        Object.values(nodesData).forEach(field => this.nodesData.push(typeof (field) == 'object' ? Object.values(field) : field));

        const validNodes = this.nodesData.every(nd => {
            if (Array.isArray(nd)) {
                const shell = this.newShell(nd[0]);
                return nd[1].every(title => {
                    autofillDeck(title);
                    return shell.newNode(title);
                });
            }
            else {
                autofillDeck(nd);
                return this.newNode(nd);
            }
        });

        if (validNodes) {
            Object.entries(this.decksData).forEach(entry => {
                const deckName = entry[0], cards = entry[1];
                cards.forEach(card => this.chart.nodes[deckName].addCard(card));
            });

            this.chart.self.querySelectorAll('.Active').forEach((e, i) => {
                const label = newElement('div', { textContent: i + 1 });
                e.appendChild(label);

                sCss(label, {
                    position: 'absolute',
                    width: '15px',
                    left: '-2px',
                    top: '-5px',
                    opacity: '0.25',
                    transform: 'scale(0.5)',
                });
            });
        }

        return validNodes;
    }

    newNode(name, parent) {
        if (!(name || '').trim().length) throw new Error('the newNode() method expects a name');

        const node = {
            //  index: Object.keys(this.chart.nodes).length,
            self: newElement('div', { className: `Node ${parent ? 'Inner ' : ''}Active`, textContent: name.replace(/^[^\w]+|[^\w]+$/, '') }),
            deck: {
                self: newElement('div', { id: `${camelise(name)}`, className: 'Deck' }),
                offset: 0,
                scroll: 0,
            },
            addCard: cf => {
                const card = {
                    self: newElement('div', { className: 'Card' }),
                    title: newElement('h4', { textContent: cf.title || 'Card Title' }),
                    sections: [],
                };

                card.self.appendChild(card.title);
                node.deck.self.appendChild(card.self);

                cf.sections.forEach(section => {
                    const _section = { title: null, content: [] };
                    let sectionContainer;

                    if (section.title) {
                        const clickIndicator = newElement('i', { className: 'fa fa-window-maximize' });

                        _section.title = newElement('h5', { textContent: section.title });
                        _section.title.appendChild(clickIndicator);
                        card.self.appendChild(_section.title);

                        _section.title.onmouseenter = () => sCss(clickIndicator, { opacity: 0.4 });
                        _section.title.onmouseleave = () => sCss(clickIndicator, { opacity: 0.2 });
                        _section.title.onclick = () => {
                            if (clickIndicator.classList.contains('fa-window-maximize')) {
                                clickIndicator.className = 'fa fa-window-minimize';
                                sCss(sectionContainer, { height: sectionContainer.fullHeight });
                            }
                            else {
                                clickIndicator.className = 'fa fa-window-maximize';
                                sCss(sectionContainer, { height: 0 });
                            }
                        };

                        sectionContainer = newElement('div', { className: 'sectionContainer' });

                        if (node.deck.hasOwnProperty('toBeCollapsed')) node.deck.toBeCollapsed.push(sectionContainer);
                        else node.deck.toBeCollapsed = [sectionContainer];
                    }

                    section.content.forEach(content => {
                        let item;

                        if (content.type == 'p') {
                            let escHTML = htmlEscape(content.html)
                                .replace(/(\n\*\s[^\n]+)+/g, '\n<ul>$&\n</ul>')     //  wrap "* string" lines with <ul></ul>
                                .replace(/(\n\*\*\s[^\n]+)+/g, '\n<ol>$&\n</ol>')   //  wrap "** string" lines with <ol></ol>
                                .replace(/\n\**\s([^\n]+)/g, '\n\t<li>$1</li>');    //  wrap each "* string" line with <li></li>

                            item = newElement('div');

                            sCss(item, { marginTop: '10px' });

                            if (!content.hasOwnProperty('bullet')) content.bullet = true;

                            while (this.markup.deco.test(escHTML)) {
                                const
                                    m = escHTML.match(this.markup.deco),
                                    // patterns to turn into tags
                                    _p = /^(b|i|u|em|del|sub|sup|samp)$/g.test(m[1]);

                                escHTML = escHTML.replace(m[0], _p ? `<${m[1]}>${m[2]}</${m[1]}>` : `<a href='${m[2]}' target='_blank'>${m[1]}</a>`);
                            }

                            item.innerHTML = `${content.bullet ? `<i class='fa fa-fw fa-${section.title ? 'bolt' : 'star'}'></i>` : ''} ${escHTML}`;
                        }

                        else if (content.type == 'img') {
                            item = newElement('a', { href: content.src, target: '_blank' });
                            item.appendChild(newElement('img', { src: content.src }));
                        }

                        else if (content.type == 'code') {
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

                        sectionContainer ?
                            sectionContainer.appendChild(item) :
                            card.self.appendChild(item);

                        _section.content.push(item);
                    });

                    card.sections.push(_section);

                    if (sectionContainer) card.self.appendChild(sectionContainer);
                });
            },
        };

        if (this.chart.nodes.hasOwnProperty(node.deck.self.id)) {
            alert(`the ${name} node already exists.`);
            return false;
        }

        this.newArrow({ flow: name.match(/[<>]+/), parent: parent });

        (parent || this.chart.self).appendChild(node.self);
        this.self.appendChild(node.deck.self);

        this.chart.nodes[node.deck.self.id] = node;

        node.deck.self.onmousemove = () => this.autoScroll(event.clientX, node.deck);

        node.self.onclick = () => {
            if (this.activeNode == node) return;

            if (this.activeNode) {
                //  de-highlight current active node, if any
                sCss(this.activeNode.self, { borderColor: '#1D2533' });
                //  hide current active deck
                sCss(this.activeNode.deck.self, { display: 'none' });
            }

            //  highlight clicked node
            sCss(node.self, { borderColor: '#B8D3FC' });
            //  show and scale corresponding deck
            sCss(node.deck.self, {
                display: 'grid',
                height: `${window.innerHeight - gCss(this.self).rowGap - this.chart.self.offsetHeight}px`,
            });

            this.activeNode = node;
            this.chart.updateOffset();

            //  collapse all titled sections within a deck
            if (node.deck.hasOwnProperty('toBeCollapsed')) {
                node.deck.toBeCollapsed.forEach(sc => {
                    const fh = `${gCss(sc).height}px`;
                    sCss(sc, { height: 0 });
                    sc.fullHeight = fh;
                });

                delete node.deck.toBeCollapsed;
            }

            //  snap adjust everything after new deck is displayed
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

    showEditorUI() {
        cPanel.classList.add('lg');

        const
            chartEditor = newElement('div', { id: 'chartEditor' }),
            newNodeButton = newElement('i', { id: 'newNodeButton', className: 'fa fa-plus-square fa-2x' }),
            deckEditor = newElement('div', { id: 'deckEditor', className: 'hidden' }),
            newCardButton = newElement('i', { id: 'newCardButton', className: 'fa fa-plus-circle fa-2x' }),
            applyTemplateIcon = newElement('i', { className: 'fa fa-fw fa-diamond' }),
            setActiveNodeIn = editor => {
                if (event.button) return;

                editor.active = event.target.parentNode;
                editor.active.classList.add('dim');

                const lastNode = (
                    !editor.active.previousElementSibling ||
                    editor.active.previousElementSibling.tagName != 'DIV'
                ) && (
                        !editor.active.nextElementSibling ||
                        editor.active.nextElementSibling.tagName != 'DIV'
                    );

                if (lastNode) {
                    dropActiveNodeIn(editor);
                    return alert('The only element in an edit group cannot be moved.');
                }

                sCss(cPanel, { cursor: 'grabbing' });

                editor.startDrag();
            },
            moveActiveNodeIn = editor => {
                let target;

                event.path.some(e => {
                    if (e.tagName != 'DIV') return;

                    if (e.classList[0] == editor.active.classList[0]) {
                        return target = e;
                    }
                });

                if (!target || !event.movementY) return;

                event.movementY > 0 ?
                    target.parentNode.insertBefore(editor.active, target.nextElementSibling) :
                    target.parentNode.insertBefore(editor.active, target);
            },
            dropActiveNodeIn = editor => {
                editor.active.classList.remove('dim');
                sCss(cPanel, { cursor: 'default' });

                editor.active = null;
                cPanel.onmousemove = null;
            },
            addNodeInput = (val, indent, isNode, focused) => {
                const
                    nodeEditGroup = newElement('div', { className: 'nodeEditGroup' }),
                    dirToggle = newElement('span', { className: 'dirToggle' }),
                    nodeNameInput = newElement('input', { className: 'nodeNameInput' }),
                    deckIcon = newElement('i', { className: 'fa fa-edit fa-fw' }),
                    shellIcon = newElement('i', { className: 'fa fa-folder fa-fw' }),
                    indentIcon = newElement('i', { className: 'fa fa-compress fa-fw' }),
                    removeIcon = newElement('i', { className: 'fa fa-trash fa-fw' }),
                    dragIcon = newElement('i', { className: 'fa fa-unsorted fa-fw' });

                //  attach node input container
                chartEditor.appendChild(nodeEditGroup);

                //  attach direction icon before input box
                nodeEditGroup.appendChild(dirToggle);

                const
                    dirIcon = newElement('i', { className: 'fa' }),
                    dir = (val.match(/^[<>]+/) || [''])[0];

                sCss(dirIcon, { marginTop: '3.5px' });

                if (/<>/.test(dir)) {
                    dirIcon.classList.add('fa-caret-right');
                    dirToggle.appendChild(newElement('i', { className: 'fa fa-caret-left' }));
                }
                else if (/>>/.test(dir)) {
                    dirIcon.classList.add('fa-caret-right');
                }
                else {
                    dirIcon.classList.add('fa-map-marker');
                }

                dirToggle.appendChild(dirIcon);

                dirToggle.onclick = () => {
                    //  change direction icon to map marker
                    if (dirToggle.children.length == 2) {
                        dirToggle.removeChild(dirToggle.firstElementChild);
                        dirIcon.className = 'fa fa-map-marker';
                    }
                    //  change direction icon to right arrow
                    else if (dirIcon.classList.contains('fa-map-marker')) {
                        dirIcon.className = 'fa fa-caret-right';
                    }
                    //  add left direction icon to toggle container
                    else {
                        dirToggle.insertBefore(newElement('i', { className: 'fa fa-caret-left' }), dirIcon);
                    }
                };

                //  attach input box
                nodeEditGroup.appendChild(nodeNameInput);
                nodeNameInput.value = val.replace(/^[<>]+\s*/, '');
                nodeNameInput.targetDeck = camelise(nodeNameInput.value);

                nodeNameInput.onblur = () => {
                    if (!nodeNameInput.value.trim().length) nodeNameInput.value = uid('Node');

                    if (nodeNameInput.parentNode.classList.contains('shellInput')) return;

                    const newKey = camelise(nodeNameInput.value.trim());

                    if (newKey == nodeNameInput.targetDeck) return;

                    const oldValue = this.decksData[nodeNameInput.targetDeck];

                    this.decksData[newKey] = oldValue;
                    delete this.decksData[nodeNameInput.targetDeck];

                    deckEditor[newKey] = deckEditor[nodeNameInput.targetDeck];
                    delete deckEditor[nodeNameInput.targetDeck];

                    nodeNameInput.targetDeck = newKey;
                };

                //  attach icons
                nodeEditGroup.appendChild(deckIcon);
                nodeEditGroup.appendChild(shellIcon);
                nodeEditGroup.appendChild(indentIcon);
                nodeEditGroup.appendChild(removeIcon);
                nodeEditGroup.appendChild(dragIcon);

                //  define events & handlers
                deckIcon.onclick = () => {
                    if (!isNode) return;

                    chartEditor.classList.add('hidden');

                    const deckName = camelise(deckIcon.previousElementSibling.value);

                    deckEditor.activeDeck = { name: deckName, el: deckEditor[deckName] };
                    deckEditor.classList.remove('hidden');
                    deckEditor.activeDeck.el.classList.remove('hidden');
                    //  update deck heading text content
                    deckEditor.activeDeck.el.heading.textContent = nodeNameInput.value;
                    //  resize all <textarea> elements in the deck
                    deckEditor.activeDeck.el.querySelectorAll('.contentInput').forEach(ci => {
                        this.ruler.matchStyle(ci);
                        ci.resize();
                    });

                    doneButton.textContent = 'GO BACK';
                };

                shellIcon.onclick = () => {
                    if (gCss(shellIcon).opacity > 0.1) {
                        const isShell = nodeEditGroup.className.includes('shellInput');

                        if (!isShell) {
                            const key = camelise(nodeNameInput.value.trim());

                            if (this.decksData.hasOwnProperty(key)) {
                                delete this.decksData[key];
                            }
                        }

                        nodeEditGroup.classList.remove(isShell ? 'shellInput' : 'nodeInput');
                        nodeEditGroup.classList.add(isShell ? 'nodeInput' : 'shellInput');
                    }
                };

                indentIcon.onclick = () => {
                    if (gCss(indentIcon).opacity > 0.1) {
                        nodeEditGroup.className.includes('indented') ?
                            nodeEditGroup.classList.remove('indented') :
                            nodeEditGroup.classList.add('indented');
                    }
                };

                removeIcon.onclick = () => {
                    if (chartEditor.querySelectorAll('.nodeEditGroup').length == 1) return alert('Your pipeline must have at least one node.');
                    if (!confirm('You are about to delete a node from the flowchart.\nThis action can not be undone. Are you sure?')) return;
                    delete this.decksData[camelise(removeIcon.parentNode.querySelector('.nodeNameInput').value.trim())];
                    chartEditor.removeChild(removeIcon.parentNode);
                };

                dragIcon.onmousedown = () => setActiveNodeIn(chartEditor);

                nodeEditGroup.classList.add(isNode ? 'nodeInput' : 'shellInput');
                if (indent) nodeEditGroup.classList.add('indented');
                if (focused) nodeNameInput.select();
            },
            addDeckEditGroup = (name, cards) => {
                const
                    deckEditGroup = newElement('div', { className: 'hidden deckEditGroup' }),
                    deckHeading = newElement('h2', { className: 'deckHeading' }),
                    defaultCards = [{ title: '', sections: [{ content: [{ type: 'p', html: '' }] }] }];

                deckEditGroup.addCardGroup = card => {
                    const
                        cardEditGroup = newElement('div', { className: 'cardEditGroup' }),
                        cardTitleInput = newElement('input', { placeholder: 'card title is required', value: card.title || 'Card Title', className: 'editor cardTitle' }),
                        removeIcon = newElement('i', { className: 'fa fa-trash fa-fw' }),
                        dragIcon = newElement('i', { className: 'fa fa-unsorted fa-fw' }),
                        minMaxIcon = newElement('i', { className: 'fa fa-window-minimize' }),
                        newSectionButton = newElement('i', { className: 'newSectionButton fa fa-plus-circle fa-lg' });

                    cardEditGroup.addSectionGroup = section => {
                        const
                            sectionEditGroup = newElement('div', { className: 'sectionEditGroup' }),
                            newParagraphButton = newElement('i', { className: 'newContentButton newParagraphButton fa fa-plus-square fa-lg' }),
                            newImageButton = newElement('i', { className: 'newContentButton newImageButton fa fa-plus-square fa-lg' }),
                            newCodeButton = newElement('i', { className: 'newContentButton newCodeButton fa fa-plus-square fa-lg' }),
                            removeIcon = newElement('i', { className: 'fa fa-trash fa-fw' }),
                            dragIcon = newElement('i', { className: 'fa fa-unsorted fa-fw' }),
                            newContent = (type, key) => {
                                sectionEditGroup.addContentInput({ type: type, [key]: '' });
                                appendButtons();
                            },
                            appendButtons = () => {
                                sectionEditGroup.appendChild(newParagraphButton);
                                sectionEditGroup.appendChild(newImageButton);
                                sectionEditGroup.appendChild(newCodeButton);
                            };

                        sectionEditGroup.addContentInput = item => {
                            const
                                itemEditGroup = newElement('div', { className: 'itemEditGroup' }),
                                typeToggle = newElement('i', { className: `typeToggle fa fa-fw fa-${item.type == 'p' ? 'file-text-o' : item.type == 'img' ? 'file-image-o' : 'code'}` }),
                                contentInput = newElement('textarea', { placeholder: 'Content', className: 'editor contentInput' }),
                                removeIcon = newElement('i', { className: 'fa fa-trash fa-fw' }),
                                dragIcon = newElement('i', { className: 'fa fa-unsorted fa-fw' }),
                                type = item.type == 'p' ? 'html' : item.type == 'img' ? 'src' : 'code';

                            //  resize function for every <textarea>
                            contentInput.resize = () => {
                                this.ruler.textContent = `${contentInput.value} `;
                                sCss(contentInput, { height: `${gCss(this.ruler).height}px` });
                            };

                            sectionEditGroup.appendChild(itemEditGroup);
                            itemEditGroup.appendChild(typeToggle);
                            itemEditGroup.appendChild(contentInput);
                            itemEditGroup.appendChild(removeIcon);
                            itemEditGroup.appendChild(dragIcon);

                            sCss(typeToggle, { color: item.type == 'p' ? 'skyblue' : item.type == 'img' ? 'goldenrod' : 'plum' });

                            typeToggle.onclick = () => {
                                const
                                    isP = typeToggle.classList.contains('fa-file-text-o'),
                                    isImg = typeToggle.classList.contains('fa-file-image-o');

                                typeToggle.classList.remove(isP ? 'fa-file-text-o' : isImg ? 'fa-file-image-o' : 'fa-code');
                                typeToggle.classList.add(isP ? 'fa-file-image-o' : isImg ? 'fa-code' : 'fa-file-text-o');
                                sCss(typeToggle, { color: isP ? 'goldenrod' : isImg ? 'plum' : 'skyblue' });
                            };

                            contentInput.value = item[type];
                            contentInput.onfocus = () => this.ruler.matchStyle(contentInput);
                            contentInput.oninput = contentInput.resize;

                            removeIcon.onclick = () => {
                                if (sectionEditGroup.querySelectorAll('.itemEditGroup').length == 1) return alert('Each section must have at least one item.');
                                if (!confirm('You are about to delete an item.\nThis action can not be undone. Are you sure?')) return;
                                sectionEditGroup.removeChild(removeIcon.parentNode);
                            };

                            dragIcon.onmousedown = () => setActiveNodeIn(deckEditor);

                            contentInput.focus();
                        };

                        cardEditGroup.appendChild(sectionEditGroup);

                        sectionEditGroup.appendChild(newElement('input', {
                            value: section.title || '',
                            placeholder: 'Untitled Section',
                            className: 'editor sectionTitle',
                        }));
                        sectionEditGroup.appendChild(removeIcon);
                        sectionEditGroup.appendChild(dragIcon);

                        //  attach all items to a section
                        section.content.forEach(item => sectionEditGroup.addContentInput(item));

                        appendButtons();

                        removeIcon.onclick = () => {
                            if (cardEditGroup.querySelectorAll('.sectionEditGroup').length == 1) return alert('Each card must have at least one section.');
                            if (!confirm('You are about to delete a section.\nThis action can not be undone. Are you sure?')) return;
                            cardEditGroup.removeChild(removeIcon.parentNode);
                        };

                        dragIcon.onmousedown = () => setActiveNodeIn(deckEditor);

                        newParagraphButton.onclick = () => newContent('p', 'html');
                        newImageButton.onclick = () => newContent('img', 'src');
                        newCodeButton.onclick = () => newContent('code', 'code');
                    };

                    deckEditGroup.appendChild(cardEditGroup);

                    cardEditGroup.onmouseenter = () => deckEditor.activeCard = cardEditGroup;
                    cardEditGroup.onmouseleave = () => deckEditor.activeCard = null;

                    //  attach elements to the card editor group
                    cardEditGroup.appendChild(cardTitleInput);
                    cardEditGroup.appendChild(removeIcon);
                    cardEditGroup.appendChild(dragIcon);
                    cardEditGroup.appendChild(minMaxIcon);
                    card.sections.forEach(sec => cardEditGroup.addSectionGroup(sec));
                    cardEditGroup.appendChild(newSectionButton);

                    //  handle events
                    removeIcon.onclick = () => {
                        if (deckEditGroup.querySelectorAll('.cardEditGroup').length == 1) return alert('Each deck must have at least one card.');
                        if (!confirm('You are about to delete a card.\nThis action can not be undone. Are you sure?')) return;
                        deckEditGroup.removeChild(removeIcon.parentNode);
                    };

                    dragIcon.onmousedown = () => setActiveNodeIn(deckEditor);

                    minMaxIcon.onclick = () => {
                        //  get and store the fully expanded height of the card edit group
                        if (!cardEditGroup.hasOwnProperty('fullHeight')) {
                            cardEditGroup.fullHeight = `${gCss(cardEditGroup).height}px`;
                            //  convert 'auto' height to '0px' format ( prep for transition )
                            sCss(cardEditGroup, { height: cardEditGroup.fullHeight });
                        }

                        if (cardEditGroup.collapsed = !cardEditGroup.collapsed) {
                            minMaxIcon.className = 'fa fa-window-maximize';
                            sCss(cardEditGroup, { height: `${gCss(cardTitleInput).height + 20}px` });
                        }
                        else {
                            minMaxIcon.className = 'fa fa-window-minimize';
                            sCss(cardEditGroup, { height: cardEditGroup.fullHeight });
                        }
                    };

                    newSectionButton.onclick = () => {
                        cardEditGroup.addSectionGroup({
                            title: '',
                            content: [{ type: 'p', html: '' }],
                        });
                        cardEditGroup.appendChild(newSectionButton);
                    };

                    //  reset card edit group height to 'auto' after fully expanded
                    cardEditGroup.addEventListener('transitionend', () => {
                        if (event.target == cardEditGroup && cardEditGroup.style.height == cardEditGroup.fullHeight) {
                            cardEditGroup.removeAttribute('style');
                            delete cardEditGroup.fullHeight;
                        }
                    });
                };

                deckEditor.appendChild(deckEditGroup);
                deckEditGroup.appendChild(deckHeading);

                deckEditor[name] = deckEditGroup;
                deckEditor[name].heading = deckHeading;

                (cards || defaultCards).forEach(card => deckEditGroup.addCardGroup(card));
            };

        //  attach the 'done' button
        const doneButton = newElement('div', { id: 'doneButton', textContent: 'SAVE & CLOSE' });

        cPanel.appendChild(doneButton);

        doneButton.onclick = () => {
            let error;
            const
                nodes = Array.from(document.querySelectorAll('.nodeEditGroup')),
                nodesData = [],
                checkChart = () => nodes.some((node, i) => {
                    //  nic: get the value of input element inside a given node input container
                    const getValue = nic => {
                        const dir = nic.querySelector('.dirToggle').children;
                        return `${dir.length == 1 ? (dir[0].classList.contains('fa-caret-right') ? '>>' : '') : '<>'}${nic.querySelector('input').value.trim()}`;
                    };

                    if (node.classList.contains('shellInput')) {
                        if (i && nodes[i - 1].classList.contains('shellInput')) return error = 'Group nodes must be followed by a indented node.';
                        else nodesData.push([getValue(node), []]);
                    }
                    else if (node.classList.contains('indented')) {
                        const lastNode = gifa(nodesData, -1);

                        if (Array.isArray(lastNode)) lastNode[1].push(getValue(node));
                        else return error = 'Indented nodes must be preceded by a group node.';
                    }
                    else nodesData.push(getValue(node));

                    return;
                }),
                checkDecks = () => {
                    const
                        thisDeck = [],
                        cards = deckEditor.activeDeck.el.querySelectorAll('.cardEditGroup'),
                        objFrom = inputGroup => {
                            const
                                ttcl = inputGroup.querySelector('.typeToggle').classList,
                                type = ttcl.contains('fa-file-text-o') ? 'p' : ttcl.contains('fa-file-image-o') ? 'img' : 'code',
                                key = type == 'p' ? 'html' : type == 'img' ? 'src' : 'code';

                            return {
                                type: type,
                                [key]: this.toMarkup(inputGroup.querySelector('.contentInput').value),
                            };
                        };

                    cards.forEach(card => {
                        thisDeck.unshift({
                            title: card.querySelector('.cardTitle').value,
                            sections: [],
                        });

                        const sections = card.querySelectorAll('.sectionEditGroup');

                        sections.forEach(section => {
                            thisDeck[0].sections.unshift({
                                title: section.querySelector('.sectionTitle').value,
                                content: [],
                            });

                            const contents = Array.from(section.querySelectorAll('.itemEditGroup'));
                            contents.forEach(content => thisDeck[0].sections[0].content.push(objFrom(content)));
                        });

                        thisDeck[0].sections.reverse();
                    });

                    this.decksData = Object.assign(this.decksData, { [deckEditor.activeDeck.name]: thisDeck.reverse() });
                };

            if (doneButton.textContent == 'SAVE & CLOSE') {
                checkChart();

                if (error) return alert(error);

                this.clear();

                if (this.render(nodesData, this.decksData)) this.hideCreatorPanel();

                this.savePipeline();
            }
            else {
                checkDecks();

                chartEditor.classList.remove('hidden');
                deckEditor.classList.add('hidden');
                deckEditor.activeDeck.el.classList.add('hidden');
                deckEditor.activeDeck = null;

                doneButton.textContent = 'SAVE & CLOSE';
                cPanel.scrollTo(0, 0);
            }
        };

        //  attach container for chart editor
        cPanel.appendChild(chartEditor);

        cPanel.onmouseup = () => {
            if (chartEditor.active) dropActiveNodeIn(chartEditor);
            else if (deckEditor.active) dropActiveNodeIn(deckEditor);
        };

        //  parse and add node data to the chart editor
        this.nodesData.forEach(nd => {
            if (Array.isArray(nd)) {
                addNodeInput(nd[0], false, false);
                nd[1].forEach(node => addNodeInput(node, true, true));
            }
            else addNodeInput(nd, false, true);
        });

        //  attach new node button to chart editor
        chartEditor.appendChild(newNodeButton);

        newNodeButton.onclick = () => {
            const
                prevNode = newNodeButton.previousElementSibling.classList,
                isNode = true,
                isFocused = true,
                name = uid('Node', '_'),
                prevIndent = prevNode.contains('indented'),
                dir = prevNode.contains('shellInput') ? '' : '>> ';

            addNodeInput(`${dir}${name}`, !dir || prevIndent, isNode, isFocused);
            chartEditor.appendChild(newNodeButton);

            addDeckEditGroup(camelise(name));
            deckEditor.appendChild(newCardButton);
        };

        //  attach container for deck editor
        cPanel.appendChild(deckEditor);

        Object.entries(this.decksData).forEach(entry => addDeckEditGroup(entry[0], entry[1]));

        //  attach new card button for deck editor
        deckEditor.appendChild(newCardButton);
        deckEditor.appendChild(applyTemplateIcon);

        newCardButton.onclick = () => {
            deckEditor.activeDeck.el.addCardGroup({
                title: '',
                sections: [{ title: '', content: [{ type: 'p', html: '' }] }],
            });
        };

        applyTemplateIcon.onclick = () => {
            if (confirm('Applying a template will overwrite the current deck. Are you sure?')) {
                const options = Object.keys(this.templates);
                const userInput = Number(prompt(`Pick a template to apply:\n${options.map((name, idx) => `${idx + 1}. ${name.replace(/_/g, ' ')}`).join('\n')}`));

                if (userInput > 0) {
                    if (userInput > options.length) return alert('Invalid input');

                    const deckEditGroup = deckEditor.activeDeck.el;

                    //  remove all cards from active deck
                    while (deckEditGroup.children.length > 1) {
                        deckEditGroup.removeChild(deckEditGroup.lastElementChild);
                    }

                    // this.templates[options[userInput - 1]].forEach(card => addCardGroup(deckEditGroup, card));
                    this.templates[options[userInput - 1]].forEach(card => deckEditGroup.addCardGroup(card));
                }
                else return alert('Invalid input.');
            }
        };

        chartEditor.startDrag = () => cPanel.onmousemove = () => moveActiveNodeIn(chartEditor);
        deckEditor.startDrag = () => cPanel.onmousemove = () => moveActiveNodeIn(deckEditor);
    }

    pullData(pipelineNameOptional) {
        if (!window.firebase) return alert('Make sure Firebase is set up and you are connected to the Internet.');
        if (cPanel.classList.contains('expanded')) return alert('Close the editor before reading from cloud.');

        this.fire.collection('Root').get().then(qs => {
            if (qs.docs.length) {
                let
                    msg = 'Enter a number to load:\n',
                    docs = qs.docs.sort();

                docs.forEach((doc, i) => msg += `${i + 1}. ${doc.id}\n`);

                let userInput = -1;

                if (pipelineNameOptional) {
                    for (var i = 0; i < docs.length; i++) {
                        if (docs[i].id == pipelineNameOptional) {
                            userInput = i + 1;
                            editIcon.style.display = 'none';
                            pullIcon.style.display = 'none';
                            pushIcon.style.display = 'none';
                            break;
                        }
                    }
                }

                if (userInput < 0) userInput = Number((prompt(msg) || '').trim());

                if (Number.isFinite(userInput) && userInput > 0) {
                    if (userInput > docs.length) return alert('Invalid input');

                    //  reduce userInput by 1 to be used as index
                    userInput--;
                    //  store initial data
                    this.initData = docs[userInput].data();
                    //  store pipeline name
                    this.name = docs[userInput].id;
                    //  render pipeline
                    this.render(this.initData.nodesData, this.initData.decksData);

                    sCss(cPanel, { top: `${gCss(Chart).height}px` });
                    alert('Pipeline updated.');
                }
                else return alert('Invalid input.');
            }
            else return alert('Nothing is in the cloud.');
        });
    }

    verifyAndPushData() {
        if (!window.firebase) return alert('Make sure Firebase is set up and you are connected to the Internet.');
        if (cPanel.classList.contains('expanded')) return alert('Close the editor before pushing to cloud.');

        let name = prompt('Give this pipeline a name.', this.name);

        if (name) name = name.trim();
        else return alert('Please give theis pipeline a name before pushing to cloud.');

        if (/(^[^a-z])|[^a-z0-9_]/i.test(name)) return alert('Invalid character in name.');

        sCss(pushIcon, { pointerEvents: 'none' });

        const
            fbDoc = this.fire.collection('Root').doc(name),
            initNodesData = Object.values(this.initData.nodesData).map(entry => Array.isArray(entry) ? [entry[0], entry[1]] : entry),
            initDecksData = Object.entries(this.initData.decksData),
            newData = { nodesData: ato(this.nodesData), decksData: this.decksData },
            verify = remote => {
                const
                    matchingNodes = initNodesData.every((node, i) => {
                        if (typeof node == 'string' || node instanceof String) {
                            return node == remote.nodesData[i];
                        }
                        else {
                            const
                                remoteNode = remote.nodesData[i],
                                matchingShell = node[0] == remoteNode[0],
                                matchingTitles = node[1].every((innerNode, _i) => innerNode == remoteNode[1][_i]);

                            return matchingShell && matchingTitles;
                        }
                    }),
                    verifyDecks = () => {
                        return Object.entries(remote.decksData).length == initDecksData.length && initDecksData.every(deck => {
                            return remote.decksData.hasOwnProperty(deck[0]) && verifyCards(deck[1], remote.decksData[deck[0]]);
                        });
                    },
                    verifyCards = (initCards, remoteCards) => {
                        return initCards.length == remoteCards.length && initCards.every((card, j) => {
                            const
                                matchingTitle = card.title == remoteCards[j].title,
                                matchingSections = verifySections(card.sections, remoteCards[j].sections);

                            return matchingTitle && matchingSections;
                        });
                    },
                    verifySections = (initSections, remoteSections) => {
                        return initSections.length == remoteSections.length && initSections.every((sec, k) => {
                            const
                                matchingTitle = sec.title == remoteSections[k].title,
                                matchingContents = verifyContent(sec.content, remoteSections[k].content);

                            return matchingTitle && matchingContents;
                        });
                    },
                    verifyContent = (initContent, remoteContent) => {
                        return initContent.length == remoteContent.length && initContent.every((content, l) => {
                            return Object.entries(content).every(kvp => {
                                const
                                    matchingKey = remoteContent[l].hasOwnProperty(kvp[0]),
                                    matchingValue = kvp[1] == remoteContent[l][kvp[0]];

                                return matchingKey && matchingValue;
                            });
                        });
                    },
                    matchingDecks = matchingNodes && verifyDecks();

                return {
                    then: callback => {
                        if (matchingDecks) {
                            if (!confirm(`"${name}" already exists in the cloud, do you wish to overwrite it?`)) return cancelPush();
                            if (!confirm(`The current "${name}" data will be lost, are you sure?`)) return cancelPush();
                            if (!confirm('This action can not be undone. Please confirm.')) return cancelPush();

                            callback();
                        }
                        else {
                            alert(`This pipeline has been updated since your last commit, you can either:\n1. Upload again and choose a name other than "${name}".\n2. Retrieve the "${name}" pipeline and LOSE YOUR CURRENT PROGRESS.`);
                            console.warn('Push failed. Pipeline data:');
                            console.dir(JSON.stringify(newData));
                            pushIcon.removeAttribute('style');
                        }
                    }
                };
            },
            commitPush = () => {
                const batch = this.fire.batch();

                batch.set(fbDoc, newData);
                batch.commit().then(() => {
                    alert('Pipeline stored in the cloud.');
                    this.initData = cloneObject(newData);
                    pushIcon.removeAttribute('style');
                })
                    .catch(error => cancelPush(error));
            },
            cancelPush = error => {
                alert('Push cancelled');
                pushIcon.removeAttribute('style');
                if (error) throw new Error(error);
            };

        fbDoc.get().then(doc => {
            if (doc.exists) verify(doc.data()).then(commitPush);
            else commitPush();
        })
            .catch(error => cancelPush(error));
    }

    clear() {
        //  remove everything from this.self
        while (this.self.children.length) {
            this.self.removeChild(this.self.firstElementChild);
        }
    }

    savePipeline() {
        const name = this.name.length ? this.name : 'untitled';
        localStorage.setItem(`pipeline:${name}`, JSON.stringify({ nodesData: ato(this.nodesData), decksData: this.decksData }));
    }

    loadPipeline() {
        const titles = Object.entries(localStorage).filter(entry => entry[0].startsWith('pipeline:')).map(entry => entry[0].replace(/^pipeline:/, ''));
        const userInput = Number((prompt(`Specify which pipeline to load:\n${titles.map((title, idx) => `${idx + 1}. ${title}`).join('\n')}`) || '').trim());

        if (userInput > 0) {
            if (userInput > titles.length) return alert('Invalid input.');

            this.name = titles[userInput - 1];

            const localData = JSON.parse(localStorage.getItem(`pipeline:${this.name}`));

            this.render(localData.nodesData, localData.decksData);

            if (this.fire) {
                this.fire.collection('Root').doc(this.name).get().then(doc => this.initData = doc.exists ? doc.data() : localData);
            }
            else {
                this.initData = localData;
            }
        }
        else return alert('Invalid input.');
    }

    printData() {
        console.clear();
        console.warn('Pipeline data:');
        console.log({ nodesData: ato(this.nodesData), decksData: this.decksData });
    }

    creatorAccess() {
        const
            cPanel = newElement('div', { id: 'cPanel' }),
            editIcon = newElement('i', { id: 'editIcon', className: 'fa fa-gear fa-lg' }),
            pushIcon = newElement('i', { id: 'pushIcon', className: 'fa fa-cloud-upload' }),
            pullIcon = newElement('i', { id: 'pullIcon', className: 'fa fa-cloud-download' });

        document.body.appendChild(cPanel);

        cPanel.appendChild(pullIcon);
        cPanel.appendChild(editIcon);
        cPanel.appendChild(pushIcon);

        sCss(cPanel, { top: `${gCss(Chart).height}px` });

        editIcon.onclick = () => this.expandAnd('Edit');
        pullIcon.onclick = () => this.pullData();
        pushIcon.onclick = () => {
            const pw = prompt('Password:') || '';
            if (this.authFn(pw, 1) == 'mfunfjo531') this.verifyAndPushData();
        };
        this.parseAddressLineParameters();
        this.creatorMode = true;
    }

    expandAnd(action) {
        sCss(this.self, { filter: 'blur(5px)', opacity: '0.5' });
        sCss(cPanel, { top: '50vh' });
        sCss(editIcon, { display: 'none' });
        sCss(pushIcon, { display: 'none' });
        sCss(pullIcon, { display: 'none' });

        this.autoScroll(0, this.chart);

        cPanel.classList.add('expanded');
        cPanel.expanded = true;

        if (action == 'Edit') this.showEditorUI();
    }

    hideCreatorPanel() {
        while (cPanel.children.length > 3) {
            cPanel.removeChild(cPanel.lastElementChild);
        }

        sCss(this.self, { filter: 'blur(0)', opacity: '1' });
        sCss(cPanel, { top: `${gCss(Chart).height}px` });
        sCss(editIcon, { display: 'inline-block' });
        sCss(pushIcon, { display: 'inline-block' });
        sCss(pullIcon, { display: 'inline-block' });

        cPanel.removeAttribute('class');
        cPanel.expanded = false;
    }

    authFn(str, offset) {
        let result = '';
        let charcode = 0;
        for (let i = 0; i < str.length; i++) {
            charcode = (str[i].charCodeAt()) + offset;
            result += String.fromCharCode(charcode);
        }
        return result;
    }

    toMarkup(string) {
        return string
            .replace(this.markup.tags, '[$1::$2]')
            .replace(/<a href='([^']+)' target='_blank'>([^<>]+)<\/a>/, '[$2::$1]');
    }

    parseAddressLineParameters() {
        const
            regex = /[?&]([^=#]+)=([^&#]*)/g,
            url = window.location.href,
            params = {};

        let match;

        while (match = regex.exec(url)) {
            params[match[1]] = match[2];
        }

        const pipelineName = params['pipeline'];

        if (pipelineName) {
            this.pullData(pipelineName);
        }
    }
}