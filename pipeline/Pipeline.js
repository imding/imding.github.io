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

        this.markup = {
            deco: /\[([^:[\]]+)::([^\]]+)\]/,
            // b|i|u|em|del|sub|sup|samp
            tags: /<(b|i|u|em|del|sub|sup|samp)>([^<>]+)<\/\1>/g,
        };

        if (window.firebase) {
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

        window.ruler = newElement('div', { id: 'ruler' });
        window.ruler.matchStyle = target => {
            const targetStyle = gCss(target);

            sCss(window.ruler, {
                boxSizing: targetStyle.boxSizing,
                whiteSpace: targetStyle.whiteSpace,
                fontFamily: targetStyle.fontFamily,
                fontSize: `${targetStyle.fontSize}px`,
                width: `${targetStyle.width}px`,
                padding: `${targetStyle.paddingTop}px ${targetStyle.paddingRight}px ${targetStyle.paddingBottom}px ${targetStyle.paddingLeft}px`,
            });
        };
        document.body.appendChild(window.ruler);

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
        this.chart.self = newElement('div', { id: 'Chart' });
        this.chart.nodes = {};
        this.chart.offset = 0;
        this.chart.scroll = 0;

        this.self.appendChild(this.chart.self);
        this.chart.self.onmousemove = () => this.autoScroll(event.clientX, this.chart);
    }

    autoScroll(ref, focus) {
        if (this.creatorMode && cPanel.expanded) return;

        const
            vw = window.innerWidth,
            clipSize = Math.max(0, focus.self.offsetWidth - vw);

        focus.scroll = ref;

        //  normalised scroll range
        ref = (clamp(ref, vw * 0.2, vw * 0.8) - vw * 0.2) / (vw * 0.6);

        sCss(focus.self, { left: `-${ref * clipSize + focus.offset}px` });
    }

    render(nodesData, decksData) {
        const autofillDeck = name => this.decksData[camelise(name)] = decksData[camelise(name)] || [{
            title: '',
            sections: [{ title: '', content: [{ type: 'p', html: '' }] }],
        }];

        this.init();

        this.nodesData = nodesData;
        this.decksData = decksData;

        const status = nodesData.every(nd => {
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

        if (status) Object.entries(decksData).forEach(entry => {
            const deckName = entry[0], cards = entry[1];
            cards.forEach(card => this.chart.nodes[deckName].addCard(card));
        });

        return status;
    }

    newNode(name, parent) {
        if (!(name || '').trim().length) throw new Error('the newNode() method expects a name');

        const node = {
            //  index: Object.keys(this.chart.nodes).length,
            self: newElement('div', { className: `Node ${parent ? 'Inner' : ''} Active`, textContent: name.replace(/^[^\w]+|[^\w]+$/, '') }),
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

                    if (section.title) {
                        _section.title = newElement('h5', { textContent: section.title });
                        card.self.appendChild(_section.title);
                    }

                    section.content.forEach(content => {
                        let item;

                        if (content.type === 'p') {
                            let escHTML = htmlEscape(content.html)
                                            .replace(/(\n\*\s[^\n]+)+/g, '\n<ul>$&\n</ul>')     //  wrap "* string" lines with <ul></ul>
                                            .replace(/\n\*\s([^\n]+)/g, '\n\t<li>$1</li>');     //  wrap each "* string" line with <li></li>
                            
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
                            
                            item.innerHTML = `${content.bullet ? `<i class='fa fa-${section.title ? 'exclamation-circle' : 'info-circle'}'></i>` : ''} ${escHTML}`;
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
            if (this.authFn(prompt('Password:'), 1) == 'mfunfjo531') this.pushData();
        };
        this.parseAddressLineParameters();
        this.creatorMode = true;
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

    authFn(str, offset) {
        let result = '';
        let charcode = 0;
        for (let i = 0; i < str.length; i++) {
            charcode = (str[i].charCodeAt()) + offset;
            result += String.fromCharCode(charcode);
        }
        return result;
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

    showEditorUI() {
        cPanel.classList.add('lg');

        const
            chartEditor = newElement('div', { id: 'chartEditor' }),
            newNodeButton = newElement('i', { id: 'newNodeButton', className: 'fa fa-plus-square fa-2x' }),
            deckEditor = newElement('div', { id: 'deckEditor', className: 'hidden' }),
            newCardButton = newElement('i', { id: 'newCardButton', className: 'fa fa-plus-circle fa-2x' }),
            addNodeInput = (val, indent, isNode, focused) => {
                const
                    nodeEditGroup = newElement('div', { className: 'nodeEditGroup' }),
                    dirToggle = newElement('div', { className: 'dirToggle' }),
                    nodeNameInput = newElement('input', { className: 'nodeNameInput' }),
                    deckIcon = newElement('i', { className: 'fa fa-edit' }),
                    shellIcon = newElement('i', { className: 'fa fa-object-group' }),
                    indentIcon = newElement('i', { className: 'fa fa-indent' }),
                    removeIcon = newElement('i', { className: 'fa fa-remove' }),
                    dragIcon = newElement('i', { className: 'fa fa-reorder' });

                //  attach node input container
                chartEditor.appendChild(nodeEditGroup);

                //  attach arrows before input box
                nodeEditGroup.appendChild(dirToggle);

                const dir = val.match(/^[<>]+/);

                if (dir) {
                    if (/</.test(dir[0])) dirToggle.appendChild(newElement('i', { className: 'fa fa-caret-left' }));
                    if (/>/.test(dir[0])) dirToggle.appendChild(newElement('i', { className: 'fa fa-caret-right' }));
                }

                dirToggle.onclick = () => {
                    if (dirToggle.children.length == 0) dirToggle.appendChild(newElement('i', { className: 'fa fa-caret-right' }));
                    else if (dirToggle.children.length == 1) dirToggle.insertBefore(newElement('i', { className: 'fa fa-caret-left' }), dirToggle.firstElementChild);
                    else dirToggle.innerHTML = null;
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
                    deckEditor.activeDeck = {
                        name: camelise(deckIcon.previousElementSibling.value),
                        el: deckEditor[camelise(deckIcon.previousElementSibling.value)]
                    };
                    deckEditor.classList.remove('hidden');
                    deckEditor.activeDeck.el.classList.remove('hidden');
                    //  update deck heading text content
                    deckEditor.activeDeck.el.heading.textContent = nodeNameInput.value;
                    //  resize all <textarea> elements in the deck
                    deckEditor.activeDeck.el.querySelectorAll('.contentInput').forEach(ci => {
                        window.ruler.matchStyle(ci);
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
                        if (nodeEditGroup.className.includes('indented')) {
                            nodeEditGroup.classList.remove('indented');
                        }
                        else nodeEditGroup.classList.add('indented');
                    }
                };

                removeIcon.onclick = () => {
                    if (chartEditor.querySelectorAll('.nodeEditGroup').length == 1) return alert('Your pipeline must have at least one node.');
                    if (!confirm('You are about to delete a node from the flowchart.\nThis action can not be undone. Are you sure?')) return;
                    delete this.decksData[camelise(removeIcon.parentNode.querySelector('.nodeNameInput').value.trim())];
                    chartEditor.removeChild(removeIcon.parentNode);
                };

                dragIcon.onmousedown = () => {
                    chartEditor.active = dragIcon.parentNode;
                    sCss(chartEditor.active, {
                        opacity: '0.6',
                        filter: 'blur(0.6px)',
                    });
                };

                nodeEditGroup.classList.add(isNode ? 'nodeInput' : 'shellInput');
                if (indent) nodeEditGroup.classList.add('indented');
                if (focused) nodeNameInput.select();
            },
            addDeck = (name, cards) => {
                const
                    deckEditGroup = newElement('div', { className: 'hidden deckEditGroup' }),
                    deckHeading = newElement('div', { className: 'deckHeading' });

                deckEditor.appendChild(deckEditGroup);
                deckEditGroup.appendChild(deckHeading);

                deckEditor[name] = deckEditGroup;
                deckEditor[name].heading = deckHeading;

                (cards || [{ title: '', sections: [{ content: [{ type: 'p', html: '' }] }] }])
                    .forEach(card => addCardGroup(deckEditGroup, card));
            },
            addCardGroup = (deck, card) => {
                const
                    cardEditGroup = newElement('div', { className: 'cardEditGroup' }),
                    removeIcon = newElement('i', { className: 'fa fa-remove' }),
                    dragIcon = newElement('i', { className: 'fa fa-reorder' }),
                    newSectionButton = newElement('i', { className: 'newSectionButton fa fa-plus-circle fa-lg' });

                deck.appendChild(cardEditGroup);

                cardEditGroup.onmouseenter = () => deckEditor.activeCard = cardEditGroup;
                cardEditGroup.onmouseleave = () => deckEditor.activeCard = null;

                cardEditGroup.appendChild(newElement('input', {
                    value: card.title || 'Card Title',
                    className: 'editor cardTitle',
                }));
                cardEditGroup.appendChild(removeIcon);
                cardEditGroup.appendChild(dragIcon);

                removeIcon.onclick = () => {
                    if (deck.querySelectorAll('.cardEditGroup').length == 1) return alert('Each deck must have at least one card.');
                    if (!confirm('You are about to delete a card.\nThis action can not be undone. Are you sure?')) return;
                    deck.removeChild(removeIcon.parentNode);
                };

                dragIcon.onmousedown = () => {
                    deckEditor.active = dragIcon.parentNode;
                    sCss(deckEditor.active, {
                        opacity: '0.6',
                        filter: 'blur(0.6px)',
                    });
                };

                card.sections.forEach(sec => addSectionGroup(cardEditGroup, sec));

                //  attach the button to add new item
                cardEditGroup.appendChild(newSectionButton);

                newSectionButton.onclick = () => {
                    addSectionGroup(cardEditGroup, {
                        title: '',
                        content: [{ type: 'p', html: '' }],
                    });
                    cardEditGroup.appendChild(newSectionButton);
                };
            },
            addSectionGroup = (card, section) => {
                const
                    sectionEditGroup = newElement('div', { className: 'sectionEditGroup' }),
                    newParagraphButton = newElement('i', { className: 'newContentButton newParagraphButton fa fa-plus-square fa-lg' }),
                    newImageButton = newElement('i', { className: 'newContentButton newImageButton fa fa-plus-square fa-lg' }),
                    newCodeButton = newElement('i', { className: 'newContentButton newCodeButton fa fa-plus-square fa-lg' }),
                    removeIcon = newElement('i', { className: 'fa fa-remove' }),
                    dragIcon = newElement('i', { className: 'fa fa-reorder' }),
                    newContent = (type, key) => {
                        addContentInput(sectionEditGroup, { type: type, [key]: '' });
                        appendButtons();
                    },
                    appendButtons = () => {
                        sectionEditGroup.appendChild(newParagraphButton);
                        sectionEditGroup.appendChild(newImageButton);
                        sectionEditGroup.appendChild(newCodeButton);
                    };

                card.appendChild(sectionEditGroup);

                sectionEditGroup.appendChild(newElement('input', {
                    value: section.title || '',
                    placeholder: 'Untitled Section',
                    className: 'editor sectionTitle',
                }));
                sectionEditGroup.appendChild(removeIcon);
                sectionEditGroup.appendChild(dragIcon);

                //  attach all items to a section
                section.content.forEach(item => addContentInput(sectionEditGroup, item));

                appendButtons();

                removeIcon.onclick = () => {
                    if (card.querySelectorAll('.sectionEditGroup').length == 1) return alert('Each card must have at least one section.');
                    if (!confirm('You are about to delete a section.\nThis action can not be undone. Are you sure?')) return;
                    card.removeChild(removeIcon.parentNode);
                };

                dragIcon.onmousedown = () => {
                    deckEditor.active = dragIcon.parentNode;
                    sCss(deckEditor.active, {
                        opacity: '0.6',
                        filter: 'blur(0.6px)',
                    });
                };

                newParagraphButton.onclick = () => newContent('p', 'html');
                newImageButton.onclick = () => newContent('img', 'src');
                newCodeButton.onclick = () => newContent('code', 'code');
            },
            addContentInput = (section, item) => {
                const
                    itemEditGroup = newElement('div', { className: 'itemEditGroup' }),
                    typeToggle = newElement('i', { className: `typeToggle fa fa-fw fa-${item.type == 'p' ? 'file-text-o' : item.type == 'img' ? 'file-image-o' : 'code'}` }),
                    contentInput = newElement('textarea', { placeholder: 'Content', className: 'editor contentInput' }),
                    removeIcon = newElement('i', { className: 'fa fa-remove' }),
                    dragIcon = newElement('i', { className: 'fa fa-reorder' }),
                    type = item.type == 'p' ? 'html' : item.type == 'img' ? 'src' : 'code';

                //  resize function for every <textarea>
                contentInput.resize = () => {
                    window.ruler.textContent = `${contentInput.value} `;
                    sCss(contentInput, { height: `${gCss(window.ruler).height}px` });
                };

                section.appendChild(itemEditGroup);
                itemEditGroup.appendChild(typeToggle);
                itemEditGroup.appendChild(contentInput);
                itemEditGroup.appendChild(removeIcon);
                itemEditGroup.appendChild(dragIcon);

                typeToggle.onclick = () => {
                    const
                        isP = typeToggle.classList.contains('fa-file-text-o'),
                        isImg = typeToggle.classList.contains('fa-file-image-o');

                    typeToggle.classList.remove(isP ? 'fa-file-text-o' : isImg ? 'fa-file-image-o' : 'fa-code');
                    typeToggle.classList.add(isP ? 'fa-file-image-o' : isImg ? 'fa-code' : 'fa-file-text-o');
                };

                contentInput.value = item[type];
                contentInput.onfocus = () => window.ruler.matchStyle(contentInput);
                contentInput.oninput = contentInput.resize;

                removeIcon.onclick = () => {
                    if (section.querySelectorAll('.itemEditGroup').length == 1) return alert('Each section must have at least one item.');
                    if (!confirm('You are about to delete an item.\nThis action can not be undone. Are you sure?')) return;
                    section.removeChild(removeIcon.parentNode);
                };

                dragIcon.onmousedown = () => {
                    deckEditor.active = dragIcon.parentNode;
                    sCss(deckEditor.active, {
                        opacity: '0.6',
                        filter: 'blur(0.6px)',
                    });
                };

                contentInput.focus();
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
                        const dir = nic.querySelector('.dirToggle').children.length;
                        return `${dir ? (dir == 1 ? '>>' : '<>') : ''}${nic.querySelector('input').value.trim()}`;
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

                while (this.self.children.length) {
                    this.self.removeChild(this.self.firstElementChild);
                }

                if (this.render(nodesData, this.decksData)) this.hideCreatorPanel();
            }
            else {
                checkDecks();

                chartEditor.classList.remove('hidden');
                deckEditor.classList.add('hidden');
                deckEditor.activeDeck.el.classList.add('hidden');
                deckEditor.activeDeck = null;

                doneButton.textContent = 'SAVE & CLOSE';
            }
        };

        //  attach container for chart editor
        cPanel.appendChild(chartEditor);

        cPanel.onmousemove = () => {
            //  applicable to the chart editor only
            if (chartEditor.active) {
                const
                    et = event.target,
                    //  valid target
                    vt = et.className.includes('nodeEditGroup') ? et : et.parentNode.className.includes('nodeEditGroup') ? et.parentNode : null;

                if (!vt) return;

                vt.restorePadding = () => {
                    sCss(vt, { paddingTop: '10px' });
                    vt.removeEventListener('mouseout', vt.restorePadding);
                };

                if (vt != chartEditor.active && vt != chartEditor.active.nextElementSibling) {
                    sCss(vt, { paddingTop: '20px' });
                    chartEditor.target = vt;
                }
                else chartEditor.target = null;

                vt.addEventListener('mouseout', vt.restorePadding);
            }
            //  applicable to the deck editor only
            else if (deckEditor.active) {
                const
                    et = event.target,
                    dac = deckEditor.active.className,
                    etp = et.parentNode,
                    etgp = etp.parentNode,
                    etggp = etgp.parentNode,
                    //  valid target
                    vt = et.className === dac ? et : etp.className === dac ? etp : etgp.className === dac ? etgp : etggp.className === dac ? etggp : null;

                if (!vt) return;

                if (dac === 'itemEditGroup') {
                    vt.restorePadding = () => {
                        sCss(vt, { paddingTop: '0' });
                        vt.removeEventListener('mouseout', vt.restorePadding);
                    };

                    if (vt != deckEditor.active && vt != deckEditor.active.nextElementSibling) {
                        sCss(vt, { paddingTop: '10px' });
                        deckEditor.target = vt;
                    }
                    else deckEditor.target = null;
                }
                else {
                    vt.restoreMargin = () => {
                        sCss(vt, { marginTop: vt.className === 'sectionEditGroup' ? '15px' : '25px' });
                        vt.removeEventListener('mouseout', vt.restoreMargin);
                    };

                    if (vt != deckEditor.active && vt != deckEditor.active.nextElementSibling) {
                        sCss(vt, { marginTop: vt.className === 'sectionEditGroup' ? '25px' : '35px' });
                        deckEditor.target = vt;
                    }
                    else deckEditor.target = null;
                }

                vt.addEventListener('mouseout', vt.restorePadding || vt.restoreMargin);
            }
        };

        cPanel.onmouseup = () => {
            if (chartEditor.active) {
                if (chartEditor.target) {
                    chartEditor.insertBefore(chartEditor.active, chartEditor.target);
                    chartEditor.target.restorePadding();
                }

                sCss(chartEditor.active, {
                    opacity: '1',
                    filter: 'none',
                });

                chartEditor.active = null;
            }
            else if (deckEditor.active) {
                if (deckEditor.target) {
                    deckEditor.target.parentNode.insertBefore(deckEditor.active, deckEditor.target);
                    (deckEditor.target.restorePadding || deckEditor.target.restoreMargin)();
                }

                sCss(deckEditor.active, {
                    opacity: '1',
                    filter: 'none',
                });

                deckEditor.active = null;
            }
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
                noIndent = false,
                isNode = true,
                isFocused = true,
                name = uid('Node', '_');

            addNodeInput(name, noIndent, isNode, isFocused);
            chartEditor.appendChild(newNodeButton);

            addDeck(camelise(name));
            deckEditor.appendChild(newCardButton);
        };

        //  attach container for deck editor
        cPanel.appendChild(deckEditor);

        Object.entries(this.decksData).forEach(entry => addDeck(entry[0], entry[1]));

        //  attach new card button for deck editor
        deckEditor.appendChild(newCardButton);

        newCardButton.onclick = () => {
            addCardGroup(deckEditor.activeDeck.el, {
                title: '',
                sections: [{ title: '', content: [{ type: 'p', html: '' }] }],
            });
            deckEditor.activeDeck.el.appendChild(newCardButton);
        };
    }

    pushData() {
        if (!window.firebase) return alert('Make sure Firebase is set up and you are connected to the Internet.');
        if (cPanel.classList.contains('expanded')) return alert('Close the editor before pushing to cloud.');

        let name = prompt('Give this pipeline a name.', this.name);

        if (name) name = name.trim();
        else return alert('Please give theis pipeline a name before pushing to cloud.');

        if (/(^[^a-z])|[^a-z0-9_]/i.test(name)) return alert('Invalid character in name.');

        this.fire.collection('Root').doc(name).get().then(qs => {
            if (qs.exists) {
                if (!confirm(`"${name}" already exists in the cloud, do you wish to overwrite it?`)) return alert('Push cancelled');
                if (!confirm(`The current "${name}" data will be lost, are you sure?`)) return alert('Push cancelled');
                if (!confirm('This action can not be undone. Please confirm.')) return alert('Push cancelled');
            }

            const
                batch = this.fire.batch(),
                data = {
                    nodesData: ato(this.nodesData),
                    decksData: this.decksData,
                };

            batch.set(this.fire.collection('Root').doc(name), data);

            batch.commit().then(() => alert('Pipeline stored in the cloud.'));
        });
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

                let r = -1;

                if (pipelineNameOptional) {
                    for (var i = 0; i < docs.length; i++) {
                        if (docs[i].id == pipelineNameOptional) {
                            r = i + 1;
                            editIcon.style.display = 'none';
                            pullIcon.style.display = 'none';
                            pushIcon.style.display = 'none';
                            break;
                        }
                    }
                }

                if (r < 0) {
                    r = (prompt(msg) || '').trim();
                }

                if (/^\d+$/.test(r)) {
                    //  remove everything from this.self
                    while (this.self.children.length) {
                        this.self.removeChild(this.self.firstElementChild);
                    }

                    const nd = [], index = Number(r) - 1;

                    //  build nodes array from cloud data object
                    Object.values(docs[index].data().nodesData).forEach(field => nd.push(typeof (field) == 'object' ? Object.values(field) : field));

                    this.render(nd, docs[index].data().decksData);

                    sCss(cPanel, { top: `${gCss(Chart).height}px` });

                    alert('Pipeline updated.');

                    this.name = docs[r - 1].id;
                }
                else return alert('Invalid input.');
            }
            else return alert('Nothing is in the cloud.');
        });
    }

    // printDeck() {
    //     let deckObj = '';

    //     //  parse this.decksData and build deckObj
    //     Object.entries(this.decksData).forEach(entry => {
    //         deckObj += `${entry[0]}: [{\n`;
    //         entry[1].forEach((card, j) => {
    //             deckObj += `\ttitle: '${card.title}',\n\tsections: [{\n`;

    //             card.sections.forEach((sec, k) => {
    //                 if (!sec.hasOwnProperty('title')) sec = { title: '', content: sec.content };

    //                 deckObj += `\t\ttitle: '${sec.title}',\n\t\tcontent: [\n`;

    //                 sec.content.forEach(content => {
    //                     const
    //                         key = Object.keys(content)[1],
    //                         value = Object.values(content)[1];

    //                     deckObj += `\t\t\t{ type: '${content.type}', ${key}: '${value}' },\n`;
    //                 });

    //                 deckObj += '\t\t],\n';

    //                 if (k == card.sections.length - 1) deckObj += '\t}],\n';
    //                 else deckObj += '\t}, {\n';
    //             });

    //             if (j == entry[1].length - 1) deckObj += '}],\n';
    //             else deckObj += '}, {\n';
    //         });
    //     });

    //     return `\n${deckObj}\n`;
    // }

    toMarkup(string) {
        return string
            .replace(this.markup.tags, '[$1::$2]')
            .replace(/<a href='([^']+)' target='_blank'>([^<>]+)<\/a>/, '[$2::$1]');
    }
}