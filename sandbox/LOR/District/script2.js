const
    aspectRatio = 16 / 9,
    doc = {
        responsiveNodes: [],
        add: function (node, parent = document.body, ref) {
            checkNodeType(node);
            checkNodeType(parent);
            doc.responsiveNodes.push(node);
            if (ref && checkNodeType(ref)) {
                parent.insertBefore(node, ref);
            }
            else parent.appendChild(node);
            return node;
        },
    };

function init() {
    doc.add(newNode('div', { id: 'frame' }));
    doc.add(newNode('button', {
        id: 'logo',
        onmouseenter: () => label.style.opacity = 1,
        onmouseout: () => label.style.opacity = 0,
        onclick: (evt) => {
            evt.target.onclick = null;
            stepOne();
        },
    }), frame);
    doc.add(newLabel({
        id: 'label',
        html: [{
            tagName: 'P',
            attr: { textContent: 'Your path of learning starts here.' },
        }],
        // CSS for body and arrow
        css: {
            backgroundColor: 'skyblue',
            borderColor: 'royalblue',
            opacity: 0,
        },
        parent: frame,
        arrow: { dir: 'down' },
    }), frame);

    frame.adapt = function (r) {
        frame.style.width = r.view.width / r.view.height > aspectRatio ? `${aspectRatio * r.view.height}px` : '100%';
        frame.style.height = `${r.frame.width / aspectRatio}px`;
        place(frame, 50).inParent.onXY;
    };

    logo.adapt = function (r) {
        logo.style.width = `${r.frame.width * 0.2}px`;
        logo.style.height = `${r.frame.width * 0.2}px`;
        logo.style.borderWidth = `${r.frame.width * 0.01}px`;
        place(logo, 50).inParent.onX;
        place(logo, 65).inParent.onY;
    };

    label.adapt = function (r) {
        label.body.style.fontSize = `${r.frame.width * 0.03}px`;
        label.body.style.borderWidth = `${r.frame.width * 0.01}px`;
        label.body.style.borderRadius = `${r.frame.width * 0.02}px`;
        label.body.style.padding = `${r.frame.width * 0.01}px ${r.frame.width * 0.02}px`;
        label.arrow.adapt();
        place(label, 50).inParent.onX;
        place(label, 10).above(logo);
    };

    setTimeout(adaptToViewport, 100);
}

function stepOne() {
    const
        r = bb(frame), pt = r.height * 0.1, pbr = pt / 2, pw = (r.width + pt) / 2,
        path = doc.add(newNode('div', { id: 'path' }, {
            height: `${pt}px`,
            borderRadius: `${pbr}px`,
            backgroundColor: 'red',
        }), frame, logo);

    logo.onmouseout = null;
    logo.onmouseenter = null;

    place(path, -50).rightOf(logo);
    place(path, 65).inParent.onY;

    anime({
        targets: path,
        width: pw,
        duration: 800,
        elasticity: 0,
        easing: 'easeInOutQuart',
        complete: function () {
            path.adapt = function (r) {
                const pt = r.frame.height * 0.1;
                path.style.width = `${(r.frame.width + pt) / 2}px`;
                path.style.height = `${pt}px`;
                path.style.borderRadius = `${pt / 2}px`;
                place(path, -50).rightOf(logo);
                place(path, 65).inParent.onY;
            };
            adaptToViewport();
            stepTwo();
        },
    });
}

function stepTwo() {
    label.newContent([{
        tagName: 'P',
        attr: { textContent: 'Begin your journey with thousands of learners worldwide.' },
    }]);

    setTimeout(function () {
        // bounding box object
        const ref = {
            frame: bb(frame),
            label: bb(label),
            logo: bb(logo),
        };
        
        let radius = 1, users = [];

        while (radius > 0.1) {
            radius *= 0.8;

            // create new button element
            const b = newNode('button', { r: radius }, {
                backgroundColor: 'silver',
                backgroundImage: `url(https://app-staging.bsdlaunchbox.com/resources/avatar${Math.ceil(Math.random() * 11) - 1}.png)`,
                backgroundPosition: 'center',
                backgroundSize: '60%',
                backgroundRepeat: 'no-repeat',
                borderStyle: 'solid',
                borderColor: 'rgba(0, 0, 0, 0.25)',
                borderRadius: '50%',
            });

            // define how each button should adapt to viewport
            b.adapt = function (r) {
                const size = r.logo.width * b.r;
                b.style.width = `${size}px`;
                b.style.height = `${size}px`;
                b.style.borderWidth = `${size * 0.05}px`;
            };
            
            // build array in reverse
            users.unshift(b);
        }

        // attach each user avatar to DOM
        users.forEach(user => {
            doc.add(user, frame, path);
            user.adapt(ref);
            // put each avatar directly behind the logo
            place(user, 50).inParent.onX;
            place(user, 65).inParent.onY;
        });

        // define animation initial state
        // const anim = {
        //     label: { top: ref.label.relTop },
        //     logo: { top: ref.logo.relTop },

        // };
    }, 1000);
}

window.addEventListener('load', init);

// window.addEventListener('resize', adaptToViewport);
window.addEventListener('resize', delay(adaptToViewport, 100));

// =================== //
// ===== Utility ===== //
// =================== //

function adaptToViewport() {
    const r = { view: bb(document.body), frame: bb(frame), logo: bb(logo) };
    console.clear();
    doc.responsiveNodes.forEach(node => {
        if (node.adapt) node.adapt(r);
        else console.warn(node, 'has no adapt() method.');
    });
    console.log(doc);
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
        in: function (r) {
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
        return true;
    }
    else {
        return checkNodeType([node]);
    }
}

function newNode(tagName, attr, css = {}) {
    const n = document.createElement(tagName);
    Object.assign(Object.assign(n, attr).style, css);
    return n;
}

function newLabel(opts) {
    const root = newNode('div'), body = newNode('div'), arrow = opts.arrow ? newNode('div') : null;

    root.id = 'label';
    root.style.opacity = opts.css.opacity;

    body.className = 'labelBody';
    body.style.textAlign = 'center';
    body.style.borderStyle = 'solid';
    body.style.borderColor = opts.css.borderColor;
    body.style.backgroundColor = opts.css.backgroundColor;

    opts.html.forEach(n => body.appendChild(newNode(n.tagName, n.attr, n.css)));

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

    root.newContent = function (html) {
        if (!Array.isArray(html)) throw new Error('First argument must be an array');
        body.innerHTML = null;
        html.forEach(n => body.appendChild(newNode(n.tagName, n.attr, n.css)));
        adaptToViewport();
    };

    return Object.assign(root, { body: body, arrow: arrow });
}

function elm(key) {
    if (key.startsWith('#')) {
        return document.getElementById(key.slice(1));
    }
    else if (key.startsWith('.')) {
        return Array.from(document.getElementsByClassName(key.slice(1)));
    }
    else {
        return Array.from(document.getElementsByTagName(key));
    }
}

function delay(f, _t) {
    var t;
    return function (event) {
        if (t) clearTimeout(t);
        t = setTimeout(f, _t, event);
    };
}