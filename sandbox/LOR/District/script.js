const
    aspectRatio = 16 / 9, labels = [],
    labelCSS = {
        fontSize: 5,
        padding: [2, 3],
        borderRadius: 2,
        borderWidth: 1,
        borderColor: 'royalblue',
        arrowSize: 4,
    };
let cf = 0;

function box(node) {
    return node.getBoundingClientRect();
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

function centre(node) {
    if (!(node.nodeType === 1)) throw new Error(node, 'is not an HTML node.');
    const
        tbox = node.getBoundingClientRect(),
        centreMethods = (ref, relative = false) => {
            const rbox = ref.getBoundingClientRect();
            return {
                get horizontally() { node.style.left = `${(relative ? 0 : rbox.left) + rbox.width / 2 - tbox.width / 2}px`; },
                get vertically() { node.style.top = `${(relative ? 0 : rbox.top) + rbox.height / 2 - tbox.height / 2}px`; },
                get fully() {
                    node.style.left = `${(relative ? 0 : rbox.left) + rbox.width / 2 - tbox.width / 2}px`;
                    node.style.top = `${(relative ? 0 : rbox.top) + rbox.height / 2 - tbox.height / 2}px`;
                },
            };
        };

    return {
        in: function (ref) {
            if (!ref) throw new Error('please provide an HTML Node as reference.');
            return centreMethods(ref);
        },
        inParent: function () {
            if (!node.parentNode) throw new Error(node, 'has no parent.');
            return centreMethods(node.parentNode, true);
        }(),
    };
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
    centre(frame).inParent.fully;

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
        start.style.borderWidth = `${box(frame).width * 0.008}px`;
        start.style.top = `${box(frame).height * 0.65 - box(start).height / 2}px`;
        centre(start).inParent.horizontally;

        labels.push(new Label({
            arrow: { dir: 'arrow-down' },
            bodyContent: `
                <p>Your learning journey starts here</p>
            `,
            borderColor: 'royalblue',
            backgroundColor: 'skyblue',
            parent: frame,
        }));

        labels[0].wrapper.style.top = `${box(start).top - box(frame).top - box(labels[0].wrapper).height - (box(frame).height * 0.05)}px`;
        labels[0].arrow.style.marginLeft = `${(box(labels[0].body).width - box(labels[0].arrow).width) / 2}px`;
        centre(labels[0].wrapper).inParent.horizontally;

        start.onclick = () => {
            const anim = { rotation: 0, alpha: 100 };
            let flip = false;

            anime({
                targets: anim,
                rotation: 180,
                alpha: 0,
                round: 5,
                easing: 'easeInOutQuart',
                duration: 800,
                update: () => {
                    const r = anim.rotation > 90 ? -(180 - anim.rotation) : anim.rotation;
                    const a = (anim.alpha > 50 ? (anim.alpha - 50) * 2 : 100 - (anim.alpha * 2)) / 100;

                    if (!flip && r)

                    labels[0].wrapper.style.transform = `rotate3d(0, 1, 0, ${r}deg)`;
                    Array.from(labels[0].body.children).forEach(child => child.style.opacity = a);
                },
            });

            start.onclick = () => { };
        };
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
            start.style.borderWidth = `${box(frame).width * 0.008}px`;
            start.style.top = `${box(frame).height * 0.65 - box(start).height / 2}px`;
            centre(start).inParent.horizontally;

            labels[0].wrapper.style.top = `${box(start).top - box(frame).top - box(labels[0].wrapper).height - (box(frame).height * 0.05)}px`;
            labels[0].arrow.style.marginLeft = `${(box(labels[0].body).width - box(labels[0].arrow).width) / 2}px`;
            centre(labels[0].wrapper).inParent.horizontally;
            break;

        // case 2:
    }
};