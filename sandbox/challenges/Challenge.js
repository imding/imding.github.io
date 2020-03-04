class Challenge {
    constructor() {
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

    static dispatch(eventName, handlers) {
        if (handlers.hasOwnProperty(eventName)) {
            handlers[eventName].forEach(handler => setTimeout(handler, 0));
        }
    }
}