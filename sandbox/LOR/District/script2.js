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
        K: {
            get f() { return this._f || 0; },
            get Y() { return [65, 90][this.f]; },
            get nextY() { this.f++; return this.Y; },
            get prevY() { this.f--; return this.Y; },

            set f(n) { this._f = n; },
        },
        onmouseenter: () => label.style.opacity = 1,
        onmouseout: () => label.style.opacity = 0,
        onclick: (evt) => {
            evt.target.onclick = null;
            stepOne();
        },
    }), frame);
    doc.add(newLabel({
        attr: {
            id: 'label',
            K: {
                get f() { return this._f || 0; },
                get Y() { return [10, 135][this.f]; },
                get nextY() { this.f++; return this.Y; },
                get prevY() { this.f--; return this.Y; },

                set f(n) { this._f = n; },
            },
        },
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
        place(logo, logo.K.Y).inParent.onY;
    };

    label.adapt = function (r) {
        label.body.style.fontSize = `${r.frame.width * 0.03}px`;
        label.body.style.borderWidth = `${r.frame.width * 0.01}px`;
        label.body.style.borderRadius = `${r.frame.width * 0.02}px`;
        label.body.style.padding = `${r.frame.width * 0.01}px ${r.frame.width * 0.02}px`;
        label.arrow.adapt();
        place(label, 50).inParent.onX;
        place(label, label.K.Y).above(logo);
    };

    setTimeout(adaptToViewport, 0);
}

function stepOne() {
    const
        r = bb(frame), pt = r.height * 0.1, pbr = pt / 2, pw = (r.width + pt) / 2,
        path = doc.add(newNode('div', { id: 'path' }, {
            height: `${pt}px`,
            borderRadius: `${pbr}px`,
            backgroundColor: 'indianred',
        }), frame, logo);

    logo.onmouseout = null;
    logo.onmouseenter = null;

    place(path, -50).rightOf(logo);
    place(path, logo.K.Y).inParent.onY;

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
                place(path, logo.K.Y).inParent.onY;
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

        let scale = 1, z = 0, avatars = [];

        while (scale > 0.2) {
            scale *= 0.8;

            // create new user avatar
            const avatar = doc.add(newNode('button', { r: scale }, {
                backgroundColor: 'silver',
                backgroundImage: `url(https://app-staging.bsdlaunchbox.com/resources/avatar${Math.ceil(Math.random() * 11) - 1}.png)`,
                backgroundPosition: 'center',
                backgroundSize: '100%',
                backgroundRepeat: 'no-repeat',
                borderStyle: 'solid',
                borderColor: 'rgba(0, 0, 0, 0.25)',
                borderRadius: '50%',
                zIndex: --z,
            }), frame);

            avatar.K = {
                get f() { return this._f || 0; },
                get Y() { return [65, 90 - (1 - avatar.r) * 75][this.f]; },
                get nextY() { this.f++; return this.Y; },
                get prevY() { this.f--; return this.Y; },

                set f(n) { this._f = n; },
            };

            // define how each button should adapt to viewport
            avatar.adapt = function (r) {
                const size = r.logo.width * avatar.r;
                avatar.style.width = `${size}px`;
                avatar.style.height = `${size}px`;
                avatar.style.borderWidth = `${size * 0.05}px`;
                place(avatar, 50).inParent.onX;
                place(avatar, avatar.K.Y).inParent.onY;
            };
            avatar.adapt(ref);
            avatars.push(avatar);

            // create new path
            // const _path = newNode('div', { h: scale }, {
            //     backgroundColor: 'lightcoral',
            // });

            // define how each path should adapt to viewport
            // _path.adapt = function (r) {
            //     const pt = r.frame.height * 0.1 * _path.h;
            //     _path.style.width = `${(r.frame.width + pt) / 2}px`;
            //     _path.style.height = `${pt}px`;
            //     _path.style.borderRadius = `${pt / 2}px`;
            //     _path.style.left = `${r.frame.width / 2}px`;
            // };

            // build path array in reverse
            // paths.unshift(_path);
        }

        // define animation initial state
        const
            animValue = {
                labelLift: label.K.Y,
                logoTop: logo.K.Y,
            },
            endValue = {
                labelLift: label.K.nextY,
                logoTop: logo.K.nextY,
            };

        anime({
            targets: animValue,
            labelLift: endValue.labelLift,
            logoTop: endValue.logoTop,
            easing: 'easeInOutQuart',
            elasticity: 0,
            duration: 800,
            begin: () => avatars.forEach(a => a.K.nextY),
            update: function () {
                place(logo, animValue.logoTop).inParent.onY;
                place(path, animValue.logoTop).inParent.onY;
                place(label, animValue.labelLift).above(logo);
                avatars.forEach(a => place(a, a.K.Y).inParent.onY);
            },
            complete: function () {
            },
        });
    }, 1000);
}

window.addEventListener('load', init);

// window.addEventListener('resize', adaptToViewport);
window.addEventListener('resize', delay(adaptToViewport, 100));

function adaptToViewport() {
    const r = { view: bb(document.body), frame: bb(frame), logo: bb(logo) };
    console.clear();
    doc.responsiveNodes.forEach(node => {
        if (node.adapt) node.adapt(r);
        else console.warn(node, 'has no adapt() method.');
    });
    console.log(doc);
}

// function modifyFunction(node, fn, arg, methods, fs = node[`_${fn}`]) {
//     methods.forEach(m => fs = fs.replace(m.key, m.edit));
//     node[fn] = new Function(arg, fs);
// }

// =================== //
// ===== Utility ===== //
// =================== //

function getCSS(node, propertyName) {
    checkNodeType(node);
    return window.getComputedStyle(node).getPropertyValue(propertyName);
}

function getPropPos(node) {
    checkNodeType(node);
    const nodeBB = bb(node),
        direction = (refBB) => {
            return {
                get onX() {
                    return (nodeBB.absLeft - refBB.absLeft + nodeBB.width / 2) / refBB.width;
                },
                get onY() {
                    return (nodeBB.absTop - refBB.absTop + nodeBB.height / 2) / refBB.height;
                },
                get onXY() {
                    return [
                        (nodeBB.absLeft - refBB.absLeft + nodeBB.width / 2) / refBB.width,
                        (nodeBB.absTop - refBB.absTop + nodeBB.height / 2) / refBB.height,
                    ];
                },
            };
        };

    return {
        inParent: function () {
            if (!node.parentNode) throw new Error('getPropPos().inParent has no effect because', node, 'has no parent.');
            return direction(bb(node.parentNode));
        }(),
    };
}

function bb(node) {
    const
        docBB = document.body.getBoundingClientRect(),
        nodeBB = node.getBoundingClientRect(),
        parentBB = function () {
            if (node.parentNode) {
                return node.parentNode.getBoundingClientRect();
            }
            else {
                console.warn('Defaulting parent node to self because', node, 'has no parent.');
                return nodeBB;
            }
        }();

    return {
        get width() {
            return parseFloat(getCSS(node, 'width'));
        },
        get height() {
            return parseFloat(getCSS(node, 'height'));
        },
        get top() {
            return nodeBB.top;
        },
        get bottom() {
            return docBB.height - nodeBB.bottom;
        },
        get left() {
            return nodeBB.left;
        },
        get right() {
            return docBB.width - nodeBB.right;
        },
        get relTop() {
            return nodeBB.top - parentBB.top;
        },
        get relBottom() {
            return parentBB.bottom - nodeBB.bottom;
        },
        get relLeft() {
            return nodeBB.left - parentBB.left;
        },
        get relRight() {
            return parentBB.right - nodeBB.right;
        },
        get absTop() {
            return nodeBB.top + window.scrollY;
        },
        get absBottom() {
            return docBB.height - window.scrollY - nodeBB.top - parseFloat(getCSS(node, 'height'));
        },
        get absLeft() {
            return nodeBB.left + window.scrollX;
        },
        get absRight() {
            return docBB.width - window.scrollX - nodeBB.left - parseFloat(getCSS(node, 'width'));
        },
    };
}

// place(label, 10).above(button)
// place(label, 25).in(frame).onX
// place(frame, 50).inParent.onXY
function place(node, scale, unit = '%') {
    checkNodeType(node);
    const
        nodeBB = bb(node),
        cssPosition = getCSS(node, 'position'),
        relative = cssPosition === 'relative' || getCSS(node.parentNode, 'position') === 'relative',
        sibling = (ref) => { return node.parentNode === ref.parentNode; },
        position = (ref, flag, refBB = bb(ref)) => {
            checkNodeType(ref);
            const placement = unit === 'px' ? scale : (flag === 'above' || flag === 'below' ? refBB.height : refBB.width) * scale / 100;

            if (sibling(ref)) {
                switch (flag) {
                    case 'above':
                        node.style.top = `${refBB.relTop - nodeBB.height - placement}px`; break;
                    case 'below':
                        node.style.top = `${refBB.relTop + refBB.height + placement}px`; break;
                    case 'leftOf':
                        node.style.left = `${refBB.relLeft - nodeBB.width - placement}px`; break;
                    case 'rightOf':
                        node.style.left = `${refBB.relLeft + refBB.width + placement}px`; break;
                }
            }
        },
        direction = (ref, refBB = bb(ref)) => {
            const placement = {
                x: unit === 'px' ? scale[0] : refBB.width * scale / 100,
                y: unit === 'px' ? scale[1] : refBB.height * scale / 100,
            };

            return {
                get onX() {
                    node.style.left = `${(relative ? 0 : refBB.left) + placement.x - (unit === '%' ? nodeBB.width / 2 : 0)}px`;
                },
                get onY() {
                    node.style.top = `${(relative ? 0 : refBB.top) + placement.y - (unit === '%' ? nodeBB.height / 2 : 0)}px`;
                },
                get onXY() {
                    node.style.left = `${(relative ? 0 : refBB.left) + placement.x - (unit === '%' ? nodeBB.width / 2 : 0)}px`;
                    node.style.top = `${(relative ? 0 : refBB.top) + placement.y - (unit === '%' ? nodeBB.height / 2 : 0)}px`;
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

    Object.assign(root, opts.attr);
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

function remap(v, iMin, iMax, oMin, oMax) {
    return oMin + (v - iMin) * (oMax - oMin) / (iMax - iMin);
}