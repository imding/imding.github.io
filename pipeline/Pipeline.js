class Pipeline {
    constructor(root) {
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
            }
            this.autoScroll(this.chart.scroll, this.chart);
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
        if (this.creatorMode && editor.expanded) return;

        const
            vw = window.innerWidth,
            clipSize = Math.max(0, focus.self.offsetWidth - vw);

        focus.scroll = ref;

        // normalised scroll range
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

        const renderStatus = nodesData.every(nd => {
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

        Object.entries(decksData).forEach(entry => {
            const deckName = entry[0], cards = entry[1];
            cards.forEach(card => this.chart.nodes[deckName].addCard(card));
        });

        return renderStatus;
    }

    newNode(name, parent) {
        if (!(name || '').trim().length) throw new Error('the newNode() method expects a name');

        const node = {
            // index: Object.keys(this.chart.nodes).length,
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
                            let escHTML = htmlEscape(content.html);
                            item = newElement('p');

                            if (!content.hasOwnProperty('bullet')) content.bullet = true;

                            while (this.markup.deco.test(escHTML)) {
                                const
                                    m = escHTML.match(this.markup.deco),
                                    // patterns to turn into tags
                                    _p = /^(b|i|u|em|del|sub|sup|samp)$/g.test(m[1]);

                                escHTML = escHTML.replace(m[0], _p ? `<${m[1]}>${m[2]}</${m[1]}>` : `<a href='${m[2]}' target='_blank'>${m[1]}</a>`);
                            }

                            item.innerHTML = `${content.bullet ? '<i class=\'fa fa-info-circle\'></i>' : ''} ${escHTML}`;
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

    creatorAccess() {
        const
            editor = newElement('div', { id: 'editor' }),
            editIcon = newElement('i', { id: 'editIcon', className: 'fa fa-gear fa-lg' });

        document.body.appendChild(editor);
        editor.appendChild(editIcon);
        editIcon.onclick = () => this.expandEditPanel();

        this.creatorMode = true;
    }

    shrinkEditPanel() {
        Array.from(editor.children).forEach(el => el != editIcon ? editor.removeChild(el) : null);

        sCss(this.self, { filter: 'blur(0)', opacity: '1' });
        sCss(editIcon, { display: 'inline-block' });

        editor.classList.remove('expanded');
        editor.expanded = false;
    }

    expandEditPanel() {
        sCss(this.self, { filter: 'blur(5px)', opacity: '0.5' });
        sCss(editIcon, { display: 'none' });

        this.autoScroll(0, this.chart);

        editor.classList.add('expanded');
        editor.expanded = true;

        const
            chartEditor = newElement('div', { id: 'chartEditor' }),
            newNodeButton = newElement('i', { id: 'newNodeButton', className: 'fa fa-plus-square fa-2x' }),
            deckEditor = newElement('div', { id: 'deckEditor', className: 'hidden' }),
            newCardButton = newElement('i', { id: 'newCardButton', className: 'fa fa-plus-circle fa-2x' }),
            addNodeInput = (val, indent, isNode) => {
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
                    deckEditor[newKey].heading.textContent = decamelise(nodeNameInput.value.trim());
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
                    deckEditor.activeDeck.el.querySelectorAll('.contentInput').forEach(ci => {
                        window.ruler.matchStyle(ci);
                        ci.resize();
                    });

                    doneButton.textContent = 'GO BACK';
                };

                shellIcon.onclick = () => {
                    if (gCss(shellIcon).opacity > 0.1) {
                        if (nodeEditGroup.className.includes('shellInput')) {
                            nodeEditGroup.classList.remove('shellInput');
                            nodeEditGroup.classList.add('nodeInput');
                        }
                        else {
                            nodeEditGroup.classList.remove('nodeInput');
                            nodeEditGroup.classList.add('shellInput');
                        }
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
                    delete this.decksData[camelise(removeIcon.previousElementSibling.textContent)];
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
            },
            addDeck = (name, cards) => {
                const
                    deckEditGroup = newElement('div', { className: 'hidden deckEditGroup' }),
                    deckHeading = newElement('div', { className: 'deckHeading', textContent: decamelise(name) });

                deckEditor.appendChild(deckEditGroup);
                deckEditGroup.appendChild(deckHeading);

                deckEditor[name] = deckEditGroup;
                deckEditor[name].heading = deckHeading;

                (cards || [{ title: '', sections: [{ content: [{ type: 'p', html: '' }] }] }]).forEach(card => addCardGroup(deckEditGroup, card));
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
                    if (removeIcon.parentNode.parentNode.querySelectorAll('.cardEditGroup').length == 1) return alert('Each deck must have at least one card.');
                    if (!confirm('You are about to delete a card.\nThis action can not be undone. Are you sure?')) return;
                    removeIcon.parentNode.parentNode.removeChild(removeIcon.parentNode);
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
                    if (removeIcon.parentNode.parentNode.querySelectorAll('.sectionEditGroup').length == 1) return alert('Each card must have at least one section.');
                    if (!confirm('You are about to delete a section.\nThis action can not be undone. Are you sure?')) return;
                    removeIcon.parentNode.parentNode.removeChild(removeIcon.parentNode);
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
                    if (removeIcon.parentNode.parentNode.querySelectorAll('.itemEditGroup').length == 1) return alert('Each section must have at least one item.');
                    if (!confirm('You are about to delete an item.\nThis action can not be undone. Are you sure?')) return;
                    removeIcon.parentNode.parentNode.removeChild(removeIcon.parentNode);
                };

                dragIcon.onmousedown = () => deckEditor.active = dragIcon.parentNode;
                dragIcon.onmouseup = () => deckEditor.active = null;
            };

        //  attach the 'done' button
        const doneButton = newElement('div', { id: 'doneButton', textContent: 'SAVE & CLOSE' });

        editor.appendChild(doneButton);

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
                                [key]: htmlDecode(this.toMarkup(inputGroup.querySelector('.contentInput').value)),
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

                if (this.render(nodesData, this.decksData)) this.shrinkEditPanel();
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
        editor.appendChild(chartEditor);

        editor.onmousemove = () => {
            const
                et = event.target,
                can = chartEditor.active,
                dan = deckEditor.active;

            //  applicable to the chart editor only
            if (can) {
                //  valid target
                const vt = et.className.includes('nodeEditGroup') ? et : et.parentNode.className.includes('nodeEditGroup') ? et.parentNode : null;

                if (!vt) return;

                vt.restorePadding = () => {
                    sCss(vt, { paddingTop: '10px' });
                    vt.removeEventListener('mouseout', vt.restorePadding);
                };

                if (vt != can && vt != can.nextElementSibling) {
                    sCss(vt, { paddingTop: '20px' });
                    chartEditor.target = vt;
                }
                else chartEditor.target = null;

                vt.addEventListener('mouseout', vt.restorePadding);
            }
            //  applicable to the deck editor only
            else if (dan) {
                console.log('move');
            }
        };

        editor.onmouseup = () => {
            const
                can = chartEditor.active,
                ct = chartEditor.target,
                dan = deckEditor.active;

            if (can) {
                if (ct) {
                    chartEditor.insertBefore(can, ct);
                    ct.restorePadding();
                }
                sCss(can, {
                    opacity: 'initial',
                    filter: 'none',
                });
                chartEditor.active = null;
            }
            else if (dan) {
                console.log('drop');
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
            const name = uid('Node', '_');

            addNodeInput(name, false, true);
            chartEditor.appendChild(newNodeButton);

            addDeck(camelise(name));
            deckEditor.appendChild(newCardButton);
        };

        //  attach container for deck editor
        editor.appendChild(deckEditor);

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

    pushToCloud(name) {
        if (!window.firebase) return alert('Firebase is not set up.');
        if (!name) return alert('Specify a name for the pipeline before pushing to cloud, e.g. pushToCloud("project_one").');
        if (/[^a-z0-9_]/i.test(name)) return alert('Invalid character in name.');
        if (!this.creatorMode) return alert('Eable creator mode before pushing to cloud.');
        if (editor.classList.contains('expanded')) return alert('Close the editor before pushing to cloud.');

        const batch = this.fire.batch();

        batch.set(
            this.fire.collection(name).doc('nodesData'),
            ato(this.nodesData)
        );

        batch.set(
            this.fire.collection(name).doc('decksData'),
            this.decksData
        );

        batch.commit().then(() => alert('Pipeline stored in the cloud.'));
    }

    readFromCloud(name) {
        if (!window.firebase) return alert('Firebase is not set up.');
        if (!name) return alert('Specify the name for the pipeline to retrieve, e.g. pushToCloud("project_one").');
        if (!this.creatorMode) return alert('Eable creator mode before reading from cloud.');
        if (editor.classList.contains('expanded')) return alert('Close the editor before reading from cloud.');

        //  read nodes data from firebase
        this.fire.collection(name).doc('nodesData').get().then(qs => {
            const nd = [];

            //  build nodes array from cloud data object
            Object.values(qs.data()).forEach(field => nd.push(typeof (field) == 'object' ? Object.values(field) : field));
            print('Nodes loaded.');

            //  read decks data from firebase
            this.fire.collection(name).doc('decksData').get().then(qs => {
                print('Decks loaded.');

                while (this.self.children.length) {
                    this.self.removeChild(this.self.firstElementChild);
                }

                this.render(nd, qs.data());

                alert('Pipeline updated.');
            });
        });
    }

    printDeck() {
        let deckObj = '';

        //  parse this.decksData and build deckObj
        Object.entries(this.decksData).forEach(entry => {
            deckObj += `${entry[0]}: [{\n`;
            entry[1].forEach((card, j) => {
                deckObj += `\ttitle: '${card.title}',\n\tsections: [{\n`;

                card.sections.forEach((sec, k) => {
                    if (!sec.hasOwnProperty('title')) sec = { title: '', content: sec.content };

                    deckObj += `\t\ttitle: '${sec.title}',\n\t\tcontent: [\n`;

                    sec.content.forEach(content => {
                        const
                            key = Object.keys(content)[1],
                            value = Object.values(content)[1];

                        deckObj += `\t\t\t{ type: '${content.type}', ${key}: '${value}' },\n`;
                    });

                    deckObj += '\t\t],\n';

                    if (k == card.sections.length - 1) deckObj += '\t}],\n';
                    else deckObj += '\t}, {\n';
                });

                if (j == entry[1].length - 1) deckObj += '}],\n';
                else deckObj += '}, {\n';
            });
        });

        return `\n${deckObj}\n`;
    }

    toMarkup(string) {
        return string
            .replace(this.markup.tags, '[$1::$2]')
            .replace(/<a href='([^']+)' target='_blank'>([^<>]+)<\/a>/, '[$2::$1]');
    }
}