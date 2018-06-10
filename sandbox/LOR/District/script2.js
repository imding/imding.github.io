const
    aspectRatio = 16 / 9,
    doc = {
        responsiveNodes: [],
        add: function (node, parent = document.body) {
            checkNodeType(node);
            checkNodeType(parent);
            parent.appendChild(node);
            doc.responsiveNodes.push(node);
        },
    };

window.addEventListener('load', function () {
    doc.add(newNode('div', { id: 'frame' }));
    doc.add(newNode('button', { id: 'start' }), frame);
    doc.add(newLabel({
        id: 'label',
        html: [{
            tagName: 'P',
            attr: {
                textContent: 'Your path of learning starts here.',
            },
        }],
        css: {
            backgroundColor: 'skyblue',
            borderColor: 'royalblue',
        },
        parent: frame,
        arrow: { dir: 'down' },
    }), frame);

    frame.adapt = function (ref) {
        frame.style.width = ref.v.width / ref.v.height > aspectRatio ? `${aspectRatio * ref.v.height}px` : '100%';
        frame.style.height = `${ref.f.width / aspectRatio}px`;
        place(frame, 50).inParent.onXY;
    };

    start.adapt = function (ref) {
        start.style.width = `${ref.f.width * 0.2}px`;
        start.style.height = `${ref.f.width * 0.2}px`;
        start.style.borderWidth = `${ref.f.width * 0.01}px`;
        place(start, 50).inParent.onX;
        place(start, 65).inParent.onY;
    };

    label.adapt = function (ref) {
        label.body.style.fontSize = `${ref.f.width * 0.03}px`;
        label.body.style.borderWidth = `${ref.f.width * 0.01}px`;
        label.body.style.borderRadius = `${ref.f.width * 0.02}px`;
        label.body.style.padding = `${ref.f.width * 0.01}px ${ref.f.width * 0.02}px`;
        label.arrow.adapt();
        place(label, 50).inParent.onX;
        place(label, 10).above(start);
    };

    setTimeout(adaptToViewport, 100);
    console.log(doc);
});

window.addEventListener('resize', adaptToViewport);
// window.addEventListener('resize', delay(adaptToViewport, 30));

// =================== //
// ===== Utility ===== //
// =================== //

function adaptToViewport() {
    const ref = { v: bb(document.body), f: bb(frame) };
    console.clear();
    doc.responsiveNodes.forEach(node => {
        if (node.adapt) node.adapt(ref);
        else console.warn(node, 'has no adapt() method.');
    });
}

function getCSS(node, propertyName) {
    checkNodeType(node);
    return window.getComputedStyle(node).getPropertyValue(propertyName);
}

function bb(node) {
    const
        nodeBox = node.getBoundingClientRect(),
        parentBox = node.parentNode.getBoundingClientRect();

    return {
        get width() {
            return parseFloat(getCSS(node, 'width'));
        },
        get height() {
            return parseFloat(getCSS(node, 'height'));
        },
        get top() {
            return nodeBox.top;
        },
        get bottom() {
            return bb(document.body).height - nodeBox.bottom;
        },
        get left() {
            return nodeBox.left;
        },
        get right() {
            return bb(document.body).width - nodeBox.right;
        },
        get relTop() {
            return nodeBox.top - parentBox.top;
        },
        get relBottom() {
            return parentBox.bottom - nodeBox.bottom;
        },
        get relLeft() {
            return nodeBox.left - parentBox.left;
        },
        get relRight() {
            return parentBox.right - nodeBox.right;
        },
        get absTop() {
            return nodeBox.top + window.scrollY;
        },
        get absBottom() {
            return bb(document.body).height - window.scrollY - nodeBox.top - parseFloat(getCSS(node, 'height'));
        },
        get absLeft() {
            return nodeBox.left + window.scrollX;
        },
        get absRight() {
            return bb(document.body).width - window.scrollX - nodeBox.left - parseFloat(getCSS(node, 'width'));
        },
    };
}

// place(label, 10).above(button)
// place(label, 25).in(frame).onX
// place(frame, 50).inParent.onXY
function place(node, scale, unit = '%') {
    checkNodeType(node);
    const
        tbox = bb(node),
        cssPosition = getCSS(node, 'position'),
        relative = cssPosition === 'relative' || getCSS(node.parentNode, 'position') === 'relative',
        sibling = (ref) => { return node.parentNode === ref.parentNode; },
        position = (ref, flag, rbox = bb(ref)) => {
            checkNodeType(ref);
            const placement = unit === 'px' ? scale : (flag === 'above' || flag === 'below' ? rbox.height : rbox.width) * scale / 100;

            if (sibling(ref)) {
                switch (flag) {
                    case 'above':
                        node.style.top = `${rbox.relTop - tbox.height - placement}px`; break;
                    case 'below':
                        node.style.top = `${rbox.relTop + rbox.height + placement}px`; break;
                    case 'leftOf':
                        node.style.left = `${rbox.relLeft - tbox.width - placement}px`; break;
                    case 'rightOf':
                        node.style.left = `${rbox.relLeft + rbox.width + placement}px`; break;
                }
            }
        },
        direction = (ref, rbox = bb(ref)) => {
            const placement = {
                x: unit === 'px' ? scale[0] : rbox.width * scale / 100,
                y: unit === 'px' ? scale[1] : rbox.height * scale / 100,
            };

            return {
                get onX() {
                    node.style.left = `${(relative ? 0 : rbox.left) + placement.x - (unit === '%' ? tbox.width / 2 : 0)}px`;
                },
                get onY() {
                    node.style.top = `${(relative ? 0 : rbox.top) + placement.y - (unit === '%' ? tbox.height / 2 : 0)}px`;
                },
                get onXY() {
                    node.style.left = `${(relative ? 0 : rbox.left) + placement.x - (unit === '%' ? tbox.width / 2 : 0)}px`;
                    node.style.top = `${(relative ? 0 : rbox.top) + placement.y - (unit === '%' ? tbox.height / 2 : 0)}px`;
                },
            };
        };

    if (!(cssPosition === 'absolute' || cssPosition === 'relative')) throw new Error('To use the place(node) function, node position must be set to absolute or relative.');

    return {
        above: ref => position(ref, 'above'),
        below: ref => position(ref, 'below'),
        leftOf: ref => position(ref, 'leftOf'),
        rightOf: ref => position(ref, 'rightOf'),
        in: function (ref) {
            checkNodeType(ref);
            return direction(ref);
        },
        inParent: function () {
            checkNodeType(node.parentNode);
            return direction(node.parentNode);
        }(),
    };
}

function checkNodeType(node) {
    if (Array.isArray(node)) {
        node.forEach(n => {
            if (n.nodeType !== 1) throw new Error('Input is not an HTML node.');
        });
    }
    else checkNodeType([node]);
}

function newNode(tagName, attr) {
    return Object.assign(document.createElement(tagName), attr);
}

function newLabel(opts) {
    const root = newNode('div'), body = newNode('div'), arrow = opts.arrow ? newNode('div') : null;

    root.id = 'label';
    body.className = 'labelBody';
    body.style.textAlign = 'center';
    body.style.borderStyle = 'solid';
    body.style.borderColor = opts.css.borderColor;
    body.style.backgroundColor = opts.css.backgroundColor;

    opts.html.forEach(n => body.appendChild(newNode(n.tagName, n.attr)));

    root.appendChild(body);

    if (arrow) {
        arrow.className = 'labelArrow';
        Object.defineProperty(arrow, 'dir', { value: `arrow-${opts.arrow.dir}` });

        switch (arrow.dir) {
            case 'arrow-up':
                arrow.style.borderBottomColor = opts.css.borderColor;
                break;
            case 'arrow-down':
                arrow.style.borderTopColor = opts.css.borderColor;
                break;
            case 'arrow-left':
                arrow.style.borderRightColor = opts.css.borderColor;
                break;
            case 'arrow-right':
                arrow.style.borderLeftColor = opts.css.borderColor;
                break;
        }

        arrow.adapt = function () {
            const b = bb(body), p = bb(opts.parent);
            arrow.style.borderWidth = `${Math.min(p.width * 0.03, Math.min(b.width, b.height) * 0.8)}px`;
            place(arrow, 50).inParent.onX;

            switch (arrow.dir) {
                case 'arrow-up':
                    arrow.style.borderTopWidth = '0';
                    root.insertBefore(arrow, body);
                    break;
                case 'arrow-down':
                    arrow.style.borderBottomWidth = '0';
                    break;
                case 'arrow-left':
                    place(arrow, 0).leftOf(body);
                    arrow.style.borderLeftWidth = '0';
                    break;
                case 'arrow-right':
                    arrow.style.borderRightWidth = '0';
                    break;
            }
        };

        root.appendChild(arrow);
    }

    return Object.assign(root, { body: body, arrow: arrow });
}

function delay(f, _t) {
    var t;
    return function (event) {
        if (t) clearTimeout(t);
        t = setTimeout(f, _t, event);
    };
}