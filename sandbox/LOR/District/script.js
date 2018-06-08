const
    aspectRatio = 16 / 9, labels = [],
    labelCSS = {
        fontSize: 3,
        padding: [2, 3],
        borderRadius: 2,
        borderWidth: 1,
        borderColor: 'royalblue',
        arrowSize: 4,
    };
let cf = 0;

function checkNodeType(node, message) {
    if (!(node.nodeType === 1)) throw new Error(node || 'input', message);
}

function verify(opts) {

}

function styleLable(label) {
    label.body.style.fontSize = `${perc(labelCSS.fontSize)}px`;
    label.body.style.padding = `${perc(labelCSS.padding[0])}px ${perc(labelCSS.padding[1])}px`;
    label.body.style.borderRadius = `${perc(labelCSS.borderRadius)}px`;
    label.body.style.border = `${perc(labelCSS.borderWidth)}px solid ${labelCSS.borderColor}`;

    if (label.arrow) {
        label.arrow.style.borderWidth = `${perc(labelCSS.arrowSize)}px`;

        switch (label.arrow.dir) {
            case 'arrow-up':
                label.arrow.style.borderTopWidth = '0';
                break;
            case 'arrow-down':
                label.arrow.style.borderBottomWidth = '0';
                break;
            case 'arrow-left':
                label.arrow.style.borderLeftWidth = '0';
                break;
            case 'arrow-right':
                label.arrow.style.borderRightWidth = '0';
                break;
        }
    }
}

function generalStyles() {
    frame.style.width = window.innerWidth / window.innerHeight > aspectRatio ? `${aspectRatio * box(document.body).height}px` : '100%';
    frame.style.height = `${box(frame).width / aspectRatio}px`;
    place(frame, 50, '%').inParent.onXY;

    labels.forEach(e => styleLable(e));
}

function Label(opts) {
    const
        wrapper = document.createElement('div'),
        body = document.createElement('div'),
        arrow = opts.arrow ? document.createElement('div') : null;

    body.className = 'labelBody';
    body.innerHTML = opts.bodyContent;
    body.style.borderColor = opts.borderColor;
    body.style.backgroundColor = opts.backgroundColor;

    wrapper.appendChild(body);

    if (arrow) {
        arrow.className = 'labelArrow';
        Object.defineProperty(arrow, 'dir', { value: opts.arrow.dir });
        styleLable({ body, arrow });

        switch (opts.arrow.dir) {
            case 'arrow-up':
                arrow.style.borderBottomColor = opts.borderColor;
                break;
            case 'arrow-down':
                arrow.style.borderTopColor = opts.borderColor;
                break;
            case 'arrow-left':
                arrow.style.borderRightColor = opts.borderColor;
                break;
            case 'arrow-right':
                arrow.style.borderLeftColor = opts.borderColor;
                break;
        }

        wrapper.appendChild(arrow);
    }
    else { styleLable({ body }); }

    opts.parent.appendChild(wrapper);

    return {
        wrapper: wrapper,
        body: body,
        arrow: arrow,
        changeContent: opts => {
            if (opts) {
                body.innerHTML = opts.html;
                opts.buttons.forEach(b => {
                    const button = document.createElement('button');
                    Object.assign(button, b);
                    body.appendChild(button);
                });
            }
            else throw new Error('changeContent function expects a meaningful argument.');
        },
    };
}

function init() {
    generalStyles();
    nextFrame();
}

function nextFrame() {
    // increase current frame number by 1
    cf++;

    // modify DOM according to current frame
    if (cf == 1) {
        start.style.height = `${box(start).width}px`;
        start.style.borderWidth = `${box(frame).width * 0.01}px`;
        place(start, 65, '%').in(frame).onY;
        place(start, 50, '%').inParent.onX;

        labels.push(new Label({
            arrow: { dir: 'arrow-down' },
            bodyContent: `
                <p>Your learning journey starts here</p>
            `,
            borderColor: 'royalblue',
            backgroundColor: 'skyblue',
            parent: frame,
        }));

        place(labels[0].wrapper, box(frame).height * 0.05).above(start);
        place(labels[0].wrapper, 50, '%').inParent.onX;
        place(labels[0].arrow, 50, '%').inParent.onX;

        start.onclick = () => {
            const anim = { rotation: 0, alpha: 100 };
            let flipped = false, repositioned = false;

            anime({
                targets: anim,
                rotation: 180,
                alpha: 0,
                round: 5,
                easing: 'easeInOutQuart',
                duration: 800,
                update: () => {
                    // remap rotation from 0 > 180 to 0 > 90/-90 > 0
                    const r = anim.rotation > 90 ? -(180 - anim.rotation) : anim.rotation;
                    // remap alhpa from 1 > 0 to 1 > 0 > 1
                    const a = (anim.alpha > 50 ? (anim.alpha - 50) * 2 : 100 - (anim.alpha * 2)) / 100;

                    if (!flipped && r < 0) {
                        flipped = true;
                        labels[0].changeContent({
                            html: [{
                                tagName: 'P',
                                textContent: 'What\'s your name?',
                            }, {
                                tagName: 'INPUT',
                                
                            }],
                            buttons: [{
                                textContent: 'Submit',
                                onclick: nextFrame,
                            }],
                        });
                    }

                    if (flipped && !repositioned) {
                        repositioned = true;
                        place(labels[0].wrapper, 50, '%').inParent.onX;
                        place(labels[0].wrapper, box(frame).height * 0.05).above(start);
                        place(labels[0].arrow, 50, '%').inParent.onX;
                    }

                    labels[0].wrapper.style.transform = `rotate3d(0, 1, 0, ${r}deg)`;
                    Array.from(labels[0].body.children).forEach(child => child.style.opacity = a);
                },
                complete: () => {
                    // labels[0].wrapper.style.transform = 'inherit';
                },
            });

            start.onclick = () => { };
        };
    }
    else if (cf == 2) {
        console.log('frame', cf);
    }
}

window.onload = init;
window.onresize = function () {
    // elements that need to be resized/repositioned for all keyframes
    generalStyles();

    // resize/reposition keyframe specific elements
    switch (cf) {
        case 1:
            start.style.height = `${box(start).width}px`;
            start.style.borderWidth = `${box(frame).width * 0.01}px`;
            place(start, 65, '%').in(frame).onY;
            place(start, 50, '%').inParent.onX;
            place(labels[0].wrapper, box(frame).height * 0.05).above(start);
            place(labels[0].wrapper, 50, '%').inParent.onX;
            place(labels[0].arrow, 50, '%').inParent.onX;
            break;

        // case 2:
    }
};

// =================== //
// ===== Utility ===== //
// =================== //

// place(label, 10).above(button)
// place(label, 25, '%').in(frame).onX
// place(frame, 50, '%').inParent.onXY
function place(node, scale, unit = 'px') {
    checkNodeType(node, 'is not an HTML node.');
    const
        tbox = box(node),
        cssPosition = getCSS(node, 'position'),
        relative = cssPosition === 'relative' || getCSS(node.parentNode, 'position') === 'relative',
        sibling = (ref) => { return node.parentNode === ref.parentNode; },
        position = (ref, flag, rbox = box(ref)) => {
            const placement = unit === 'px' ? scale : (flag === 'above' || flag === 'below' ? rbox.height : rbox.width) * scale / 100;

            if (sibling(ref)) {
                switch (flag) {
                    case 'above':
                        node.style.top = `${rbox.relTop - tbox.height - placement}px`; break;
                }
            }
        },
        direction = (ref, rbox = box(ref)) => {
            const placement = {
                x: unit === 'px' ? scale : rbox.width * scale / 100,
                y: unit === 'px' ? scale : rbox.height * scale / 100,
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

    if (cssPosition !== 'absolute' && cssPosition !== 'relative') throw new Error('invalid position property for target node');

    return {
        above: ref => position(ref, 'above'),
        in: function (ref) {
            checkNodeType(node, 'is not an HTML node.');
            return direction(ref);
        },
        inParent: function () {
            checkNodeType(node.parentNode, 'has no parent');
            return direction(node.parentNode);
        }(),
    };
}

function getCSS(node, propertyName) {
    checkNodeType(node, 'is not an HTML node.');
    return window.getComputedStyle(node).getPropertyValue(propertyName);
}

function box(node) {
    const
        box = node.getBoundingClientRect(),
        parentBox = node.parentNode.getBoundingClientRect();

    return {
        top: box.top,
        bottom: box.bottom,
        left: box.left,
        right: box.right,
        width: parseInt(getCSS(node, 'width')),
        height: parseInt(getCSS(node, 'height')),
        relTop: box.top - parentBox.top,
        relBottom: box.bottom - parentBox.bottom,
        relLeft: box.left - parentBox.left,
        relRight: box.right - parentBox.right,
    };
}

function elm(key) {
    if (key.startsWith('.')) {
        return Array.from(document.getElementsByClassName(key.slice(1)));
    }
    else {
        return Array.from(document.getElementsByTagName(key));
    }
}

function perc(n, dir = 'width') {
    return (dir === 'width' ? box(frame).width : box(frame).height) * n / 100;
}