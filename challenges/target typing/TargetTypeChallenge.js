class TargetTypeChallenge {
    constructor() {
        this.config = {
            parent: document.body,
            targets: [],
            speed: 1,
            objective: '',
        };

        this.handlers = {};

        this.errors = 0;

        this.blockFontSize = 0.03;
        this.inputFontSize = 0.05;

        // these should possibly belong to a parent class
        this.events = Object.freeze(['win']);
        this.util = Object.freeze({
            aspectRatio: 4 / 3,
            range: (min, max, int = false) => {
                const r = Math.random() * (max - min) + min;
                return int ? Math.round(r) : r;
            },
            css: el => {
                const gcs = (e, p) => parseFloat(window.getComputedStyle(e).getPropertyValue(p));

                return {
                    get width() {
                        return gcs(el, 'width');
                    },
                    get height() {
                        return gcs(el, 'height');
                    },
                    get top() {
                        return gcs(el, 'top');
                    },
                    get bottom() {
                        return gcs(el, 'bottom');
                    },
                    get left() {
                        return gcs(el, 'left');
                    },
                    get right() {
                        return gcs(el, 'right');
                    },
                };
            },
        });
    }

    start() {
        // check config

        // create UI
        document.children[0].style.height = '100%';
        document.body.style.height = '100%';
        document.body.style.margin = '0';
        document.body.style.overflow = 'hidden';
        console.info('"height: 100%" was added to the <html> tag.');
        console.info('"height: 100%" was added to the <body> tag.');
        console.info('"margin: 0" was added to the <body> tag.');
        console.info('"overflow: hidden" was added to the <body> tag.');

        this.UI = TargetTypeChallenge.createUI(this.config);

        // define reference object
        const ref = {
            v: this.util.css(this.config.parent),   // viewport
            f: this.util.css(this.UI.frame),        // frame
        };

        // callback function to adapt elements
        const adaptToParent = () => {
            this.UI.frame.adapt(ref);
            this.UI.blocks.forEach(block => block.adapt(ref));
            this.UI.input.adapt(ref);
        };

        // define adapt methods for the frame
        this.UI.frame.adapt = r => {
            this.UI.frame.style.width = r.v.width / r.v.height > this.util.aspectRatio ? `${this.util.aspectRatio * r.v.height}px` : '100%';
            this.UI.frame.style.height = `${r.f.width / this.util.aspectRatio}px`;
            this.UI.frame.style.left = `${r.v.width / 2 - r.f.width / 2}px`;
            this.UI.frame.style.top = `${r.v.height / 2 - r.f.height / 2}px`;
        };
        // adapt to viewport immediately
        this.UI.frame.adapt(ref);

        // define properties for each block
        this.UI.blocks.forEach(block => {
            // randomly offset user defined speed by 10% for each block
            block.speed = this.util.range(this.config.speed * 0.9, this.config.speed * 1.1) / 1000;
            
            block.style.fontSize = `${this.blockFontSize * ref.f.width}px`;

            // calculate stuff for later use
            const
                fw = this.util.css(this.UI.frame).width,
                min = fw / 100,
                max = fw - this.util.css(block).width - min * 2;

            // position ratio in relation to the frame
            block.pr = {
                x: this.util.range(min, max) / fw,
                y: 0,
            };

            // adapt method
            block.adapt = r => {
                // block.style.padding = `${}px`;
                block.style.fontSize = `${this.blockFontSize * r.f.width}px`;
                block.style.left = `${block.pr.x * r.f.width}px`;
            };
            // adapt to frame immediately
            block.adapt(ref);
        });

        // define properties for the input field
        this.UI.input.adapt = r => {
            this.UI.input.style.width = `${0.8 * r.f.width}px`;
            this.UI.input.style.left = `${r.f.width / 2 - this.util.css(this.UI.input).width / 2}px`;
            this.UI.input.style.bottom = `${0.02 * r.f.height}px`;
            this.UI.input.style.fontSize = `${this.inputFontSize * r.f.width}px`;
        };
        this.UI.input.adapt(ref);

        // start falling animation
        requestAnimationFrame(() => this.animate(ref));

        // resize event for the parent container of the challenge
        this.config.parent.onresize = adaptToParent;

        // event handler for the input field
        this.UI.input.oninput = () => this.checkInput();

        this.UI.input.onblur = this.UI.input.focus;
        this.UI.input.focus();
    }

    on(eventName, handler) {
        if (!this.events.includes(eventName)) {
            console.warn(`The '${eventName}' event does not exist for this class.`);
        }
        else if (this.handlers.hasOwnProperty(eventName)) {
            this.handlers[eventName].push(handler);
        }
        else {
            this.handlers[eventName] = [handler];
        }
    }

    checkInput() {
        const s = this.UI.input.value.trim();

        if (this.config.targets.includes(s)) {
            const block = this.UI.blocks.filter(b => b.textContent === s)[0];
            this.UI.frame.removeChild(block);
            this.UI.blocks.splice(this.UI.blocks.indexOf(block), 1);
            this.UI.input.value = '';
        }
    }

    animate(r) {
        this.UI.blocks.forEach((block, i) => {
            block.pr.y += block.speed;

            const y = block.pr.y * r.f.height;
            block.style.top = `${y}px`;

            // remove blocks that are too close to the bottom
            if (y > r.f.height * 0.8) {
                this.UI.frame.removeChild(block);
                this.UI.blocks.splice(i, 1);
            }
        });
        requestAnimationFrame(() => this.animate(r));
    }

    static createUI(config) {
        const UI = {
            frame: document.createElement('div'),
            blocks: [],
            input: document.createElement('input'),
            defaultStyle: {
                position: 'absolute',
                boxSizing: 'border-box',
            },
        };

        // append frame
        config.parent.appendChild(UI.frame);
        Object.assign(UI.frame.style, UI.defaultStyle, {
            backgroundColor: 'silver',
        });

        // append blocks
        config.targets.forEach(text => {
            UI.blocks.unshift(document.createElement('div'));
            UI.blocks[0].textContent = text;
            UI.frame.appendChild(UI.blocks[0]);
            Object.assign(UI.blocks[0].style, UI.defaultStyle);
        });

        // append input
        UI.frame.appendChild(UI.input);
        Object.assign(UI.input.style, UI.defaultStyle, {
            fontFamily: 'Monospace',
            textAlign: 'center',
            outline: 'none',
            borderStyle: 'solid',
            borderWidth: '0 0 1px 0',
            backgroundColor: 'rgba(0, 0, 0, 0)',
        });

        return Object.freeze(UI);
    }

    static dispatch(eventName, handlers) {
        if (handlers.hasOwnProperty(eventName)) {
            handlers[eventName].forEach(handler => setTimeout(handler, 0));
        }
    }
}