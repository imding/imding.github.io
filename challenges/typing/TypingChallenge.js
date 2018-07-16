class TypingChallenge {
    constructor() {
        this.config = {
            parent: document.body,
            targets: [],
            decoys: [],
            shuffle: false,
            speed: 1,
            levels: 1,
            interval: 0,
            inputFont: 'Monospace',
            blockFont: 'Monospace',
            bannerFont: 'Arial',
            objective: 'Type the falling words EXACTLY as it\'s shown.',
            praise: 'Well done! You scored #SCORE#/#TOTAL# points in #TIME#.',
        };

        this.render = null;
        this.startTime = null;
        this.handlers = {};

        this.score = 0;
        this.time = 0;

        this.blockFontSize = 0.03;
        this.inputFontSize = 0.04;
        this.bannerFontSize = 0.025;

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
        this.checkConfig();

        // create UI
        document.children[0].style.height = '100%';
        document.body.style.height = '100%';
        document.body.style.margin = '0';
        document.body.style.overflow = 'hidden';
        console.info('"height: 100%" was added to the <html> tag.');
        console.info('"height: 100%" was added to the <body> tag.');
        console.info('"margin: 0" was added to the <body> tag.');
        console.info('"overflow: hidden" was added to the <body> tag.');

        this.UI = TypingChallenge.createUI(this.config);

        // define reference object
        const ref = {
            v: this.util.css(this.config.parent),   // viewport
            f: this.util.css(this.UI.frame),        // frame
        };

        // callback function to adapt elements
        const adaptToParent = () => {
            this.UI.frame.adapt(ref);
            this.UI.blocks.forEach(block => { if (block.adapt) block.adapt(ref); });
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

            // prepare all the blocks
            this.UI.blocks.forEach((block, i, arr) => {
                // randomly offset user defined speed by 10% for each block
                block.speed = this.util.fluc(this.config.speed, 0.1) / 1000;

                // define time (in milliseconds) at which the block will start falling
                const prevExptTime = i ? arr[i - 1].textContent.length * Math.round(this.util.fluc(this.config.interval, 0.1) * 1000) : 0;
                block.time = (i ? arr[i - 1].time : 0) + prevExptTime;

                // resize block font before positioning it
                block.style.fontSize = `${this.blockFontSize * ref.f.width}px`;

                // define onclick event handler
                block.onclick = () => {
                    if (block.isDecoy) this.commend();
                    else this.crit();
                    this.remove(block);
                };

                // add the block to the frame
                this.UI.frame.insertBefore(block, this.UI.input);

                // calculate range of position ratio
                const
                    min = ref.f.width / 100,
                    max = ref.f.width - this.util.css(block).width - min * 2;

                // define position ratio in relation to the frame
                block.pr = {
                    x: this.util.range(min, max) / ref.f.width,
                    y: 0.03,
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
            this.UI.start.addEventListener('transitionend', e => this.UI.frame.removeChild(e.target));

            this.render = requestAnimationFrame((ts) => this.animate(ref, ts));
        };

        // event handler for the input field
        this.UI.input.onblur = this.UI.input.focus;
        this.UI.input.onkeydown = () => this.checkInput();
        this.UI.input.focus();

        // resize event for the parent container of the challenge
        this.config.parent.onresize = adaptToParent;
    }

    checkConfig() {
        const errors = [
            {
                found: this.config.levels < 1,
                tip: 'The value of config.levels must be 1 or greater.',
            },
            {
                found: this.config.levels > 1 && !Array.isArray(this.config.speed),
                tip: 'config.speed must be an array when config.levels is greater than 1.',
            },
            {
                found: this.config.levels > 1 && this.config.speed.length != this.config.levels,
                tip: 'The length of config.speed must equal to the value of config.levels.',
            },
            {
                found: this.config.levels > 1 ? !this.config.speed.every(s => s > 0) : this.config.speed <= 0,
                tip: 'config.speed value(s) must be greater than 0.',
            },
        ];

        errors.forEach(error => {
            if (error.found) {
                alert(error.tip);
                throw new Error(error.tip);
            }
        });
    }

    animate(r, ts) {
        // store start time
        if (!this.startTime && ts) this.startTime = ts;
        // offset global timestamp by this.startTime
        ts -= (this.startTime || 0);

        // animate each block
        this.UI.blocks.forEach((block, i) => {
            if (!i && block.time > ts) block.time = ts;

            if (ts >= block.time) {
                block.pr.y += block.speed;

                const y = block.pr.y * r.f.height;
                block.style.top = `${y}px`;

                // remove blocks that are too close to the bottom
                if (y > r.f.height * 0.8) {
                    if (block.isDecoy) this.commend();
                    else this.crit();
                    this.remove(block, i);
                }
            }
        });

        this.time = ts;

        if (!this.UI.blocks.length) cancelAnimationFrame(this.render);
        else this.render = requestAnimationFrame((ts) => this.animate(r, ts));
    }

    checkInput() {
        if (event.code == 'Enter' || event.code == 'NumpadEnter') {
            const s = this.UI.input.value.trim();

            // if user input matches text in an on-screen block
            if (this.UI.blocks.map(b => b.textContent).includes(s)) {
                const block = this.UI.blocks.filter(b => b.textContent === s)[0];

                if (block.isDecoy) this.crit();
                else this.commend();

                this.UI.input.value = '';
                this.remove(block);
            }
            // no match found
            else {
                this.UI.input.style.color = 'firebrick';
                setTimeout(() => {
                    this.UI.input.style.color = 'black';
                    this.UI.input.value = '';
                }, 500);
            }
        }
        else if (event.code == 'Escape') {
            this.UI.input.value = '';
        }
    }

    commend() {
        this.score++;
        this.UI.topBanner.textContent = 'Good job!';
        if (this.UI.blocks.length > 1) setTimeout(() => this.UI.topBanner.textContent = this.config.objective, 1000);
        TypingChallenge.dispatch('score', this.handlers);
    }

    crit() {
        this.UI.topBanner.textContent = 'That wasn\'t quite right.';
        if (this.UI.blocks.length > 1) setTimeout(() => this.UI.topBanner.textContent = this.config.objective, 1000);
        TypingChallenge.dispatch('miss', this.handlers);
    }

    remove(el, i = this.UI.blocks.indexOf(el)) {
        this.UI.blocks.splice(i, 1);
        el.style.opacity = 0;
        el.addEventListener('transitionend', e => this.UI.frame.removeChild(e.target));

        this.checkComplete();
    }

    checkComplete() {
        if (this.UI.blocks.length) return;

        this.startTime = null;
        this.render = null;

        if (this.levels > 1) {
            this.nextLevel();
        }
        else {
            this.UI.topBanner.textContent = this.config.praise
                .replace('#SCORE#', this.score)
                .replace('#TOTAL#', this.config.targets.concat(this.config.decoys).length)
                .replace('#TIME#', `${Math.ceil(this.time / 1000)} seconds`);
            TypingChallenge.dispatch('complete', this.handlers);
            return true;
        }
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
        Object.assign(UI.frame.style, UI.defaultStyle, { backgroundColor: 'silver' });
        config.parent.appendChild(UI.frame);

        // create, style & append blocks
        const append = (el, text) => {
            el.textContent = text;
            Object.assign(el.style, UI.defaultStyle, {
                fontFamily: config.blockFont,
                transition: 'opacity 0.1s',
                cursor: 'pointer',
            });
            UI.blocks.push(el);
        };

        config.targets.forEach(text => append(document.createElement('div'), text));
        config.decoys.forEach(text => {
            const decoy = document.createElement('div');
            decoy.isDecoy = true;
            append(decoy, text);
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