class TargetTypeChallenge {
    constructor() {
        this.config = {
            parent: document.body,
            targets: [],
            shuffle: false,
            speed: 1,
            interval: 0,
            inputFont: 'Monospace',
            blockFont: 'Monospace',
            bannerFont: 'Arial',
            objective: '',
        };

        this.startTime = null;
        this.handlers = {};

        this.score = 0;

        this.blockFontSize = 0.03;
        this.inputFontSize = 0.04;
        this.bannerFontSize = 0.025,

            // these should possibly belong to a parent class
            this.events = Object.freeze(['complete', 'score', 'miss']);
        this.util = Object.freeze({
            aspectRatio: 4 / 3,
            range: (min, max, int = false) => {
                const r = Math.random() * (max - min) + min;
                return int ? Math.round(r) : r;
            },
            fluc: (val, scale) => this.util.range(val * (1 - scale), val * (1 + scale)),
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
            shuffle: array => {
                let counter = array.length;

                while (counter > 0) {
                    // pick a random index
                    let index = Math.floor(Math.random() * counter);
                    counter--;

                    // swap the last element with it
                    let temp = array[counter];
                    array[counter] = array[index];
                    array[index] = temp;
                }
            }
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
            this.UI.topBanner.adapt(ref);
            this.UI.start.adapt(ref);
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

        // define properties for the input field
        this.UI.input.adapt = r => {
            this.UI.input.style.width = `${0.8 * r.f.width}px`;
            this.UI.input.style.left = `${r.f.width / 2 - this.util.css(this.UI.input).width / 2}px`;
            this.UI.input.style.bottom = `${0.02 * r.f.height}px`;
            this.UI.input.style.fontSize = `${this.inputFontSize * r.f.width}px`;
        };
        this.UI.input.adapt(ref);

        // define properties for the top banner
        this.UI.topBanner.adapt = r => {
            this.UI.topBanner.style.height = `${0.08 * r.f.height}px`;
            this.UI.topBanner.style.padding = `${0.02 * r.f.height}px`;
            this.UI.topBanner.style.fontSize = `${this.bannerFontSize * r.f.width}px`;
        };
        this.UI.topBanner.adapt(ref);

        // define properties for the start button
        this.UI.start.adapt = r => {
            this.UI.start.style.borderRadius = `${0.02 * r.f.width}px`;
            this.UI.start.style.borderWidth = `${0.005 * r.f.width}px`;
            this.UI.start.style.fontSize = `${this.inputFontSize * r.f.width}px`;
            this.UI.start.style.padding = `${0.02 * r.f.width}px`;
            this.UI.start.style.left = `${r.f.width / 2 - this.util.css(this.UI.start).width / 2}px`;
            this.UI.start.style.top = `${r.f.height / 2 - this.util.css(this.UI.start).height / 2}px`;
        };
        this.UI.start.adapt(ref);

        // start falling animation
        this.UI.start.onclick = () => {
            // define properties for each block
            if (this.config.shuffle) this.util.shuffle(this.UI.blocks);
            this.UI.blocks.forEach((block, i, arr) => {
                // randomly offset user defined speed by 10% for each block
                block.speed = this.util.fluc(this.config.speed, 0.1) / 1000;

                // define time (in milliseconds) at which the block will start falling
                const prevExptTime = i ? arr[i - 1].textContent.length * Math.round(this.util.fluc(this.config.interval, 0.1) * 1000) : 0;
                block.time = (i ? arr[i - 1].time : 0) + prevExptTime;

                // resize block font before positioning it
                block.style.fontSize = `${this.blockFontSize * ref.f.width}px`;

                // add the block to the frame
                this.UI.frame.insertBefore(block, this.UI.input);

                // calculate range of position ratio
                const
                    min = ref.f.width / 100,
                    max = ref.f.width - this.util.css(block).width - min * 2;

                // define position ratio in relation to the frame
                block.pr = {
                    x: this.util.range(min, max) / ref.f.width,
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

            this.UI.start.style.opacity = 0;
            this.UI.start.addEventListener('transitionend', () => this.UI.frame.removeChild(event.target));

            requestAnimationFrame((ts) => this.animate(ref, ts));
        };

        // event handler for the input field
        this.UI.input.onblur = this.UI.input.focus;
        this.UI.input.onkeydown = () => this.checkInput();
        this.UI.input.focus();

        // resize event for the parent container of the challenge
        this.config.parent.onresize = adaptToParent;
    }

    checkInput() {
        if (event.code == 'Enter' || event.code == 'NumpadEnter') {
            const s = this.UI.input.value.trim();

            // if user input matches text in an on-screen block
            if (this.UI.blocks.map(b => b.textContent).includes(s)) {
                const block = this.UI.blocks.filter(b => b.textContent === s)[0];
                this.UI.frame.removeChild(block);
                this.UI.blocks.splice(this.UI.blocks.indexOf(block), 1);
                this.UI.input.value = '';

                this.score++;
                TargetTypeChallenge.dispatch('score', this.handlers);
                this.checkComplete();
            }
            // no match found
            else {
                this.UI.input.style.color = 'firebrick';
                setTimeout(() => this.UI.input.style.color = 'black', 500);
            }
        }
        else if (event.code == 'Escape') {
            this.UI.input.value = '';
        }
    }

    checkComplete() {
        if (this.UI.blocks.length) return;
        this.startTime = null;
        this.UI.topBanner.textContent = `Well done! You have completed this challenge. You scored ${this.score} out of ${this.config.targets.length}.`;
        this.UI.start.textContent = 'Reload Challenge';
        this.UI.start.style.opacity = 1;
        this.UI.start.onclick = () => window.location.reload(true);
        this.UI.frame.appendChild(this.UI.start);
        TargetTypeChallenge.dispatch('complete', this.handlers);
    }

    animate(r, ts) {
        // store start time
        if (!this.startTime && ts) this.startTime = ts;
        // offset global timestamp by this.startTime
        ts -= (this.startTime || 0);

        // animate each block
        this.UI.blocks.forEach((block, i) => {
            if (ts > block.time) {
                block.pr.y += block.speed;

                const y = block.pr.y * r.f.height;
                block.style.top = `${y}px`;

                // remove blocks that are too close to the bottom
                if (y > r.f.height * 0.8) {
                    this.UI.blocks.splice(i, 1);
                    block.style.opacity = 0;
                    block.addEventListener('transitionend', e => this.UI.frame.removeChild(e.target));

                    TargetTypeChallenge.dispatch('miss', this.handlers);
                    this.checkComplete();
                }
            }
        });
        requestAnimationFrame((ts) => this.animate(r, ts));
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

    static createUI(config) {
        // define UI object
        const UI = {
            frame: document.createElement('div'),
            blocks: [],
            input: document.createElement('input'),
            topBanner: document.createElement('div'),
            start: document.createElement('button'),
            defaultStyle: {
                position: 'absolute',
                boxSizing: 'border-box',
            },
        };

        // style & append frame
        Object.assign(UI.frame.style, UI.defaultStyle, {
            backgroundColor: 'silver',
        });
        config.parent.appendChild(UI.frame);

        // create, style & append blocks
        config.targets.forEach(text => {
            UI.blocks.unshift(document.createElement('div'));
            UI.blocks[0].textContent = text;
            Object.assign(UI.blocks[0].style, UI.defaultStyle, {
                fontFamily: config.blockFont,
                transition: 'opacity 0.1s',
            });
        });

        // style & append input
        Object.assign(UI.input.style, UI.defaultStyle, {
            fontFamily: config.inputFont,
            textAlign: 'center',
            outline: 'none',
            borderStyle: 'solid',
            borderWidth: '0 0 1px 0',
            backgroundColor: 'rgba(0, 0, 0, 0)',
            transition: 'color 0.1s',
        });
        UI.frame.appendChild(UI.input);

        // style & append top banner
        UI.topBanner.textContent = config.objective;
        Object.assign(UI.topBanner.style, UI.defaultStyle, {
            fontFamily: config.bannerFont,
            textAlign: 'center',
            width: '100%',
            backgroundColor: 'ghostwhite',
        });
        UI.frame.appendChild(UI.topBanner);

        // style & append start button
        UI.start.textContent = 'Start Challenge';
        Object.assign(UI.start.style, UI.defaultStyle, {
            borderColor: 'rgba(0, 0, 0, 0.5)',
            backgroundColor: 'skyblue',
            cursor: 'pointer',
            outline: 'none',
            transition: 'opacity 0.1s',
        });
        UI.frame.appendChild(UI.start);

        return Object.freeze(UI);
    }

    static dispatch(eventName, handlers) {
        if (handlers.hasOwnProperty(eventName)) {
            handlers[eventName].forEach(handler => setTimeout(handler, 0));
        }
    }
}