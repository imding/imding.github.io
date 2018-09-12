class Utility {
    constructor() {
        this.config = {
            showDebug: false,
        };

        // unique id
        this.uid = prefix => {
            // non-zero random scalar
            const nzrs = () => Math.random() || this.nzrs();

            // random string
            const rs = `${prefix ? `${prefix}-` : ''}${nzrs().toString(36).slice(-3)}`;

            if (Array.from(document.documentElement.getElementsByTagName('*')).some(el => prefix ? el.id == rs : el.id.endsWith(`-${rs}`))) return this.uid(prefix);
            return rs;
        };

        // element array queries
        this.elarr = arr => {
            arr = Array.from(arr);
            if (!Array.isArray(arr)) throw new Error('the elarr method expects and array like object');

            return {
                get maxWidth() {
                    return Math.max(...arr.map(el => gCss(el).width));
                },
            };
        };

        // flatten array
        this.flarr = arr => {
            return {
                get shallow() { return arr.reduce((acc, val) => acc.concat(val), []); },
                get deep() { return arr.reduce((acc, val) => Array.isArray(val) ? acc.concat(this.flarr(val)) : acc.concat(val), []); },
            };
        };

        // get item from array
        this.gifa = (arr, i) => i < 0 ? arr[arr.length + i] : arr[i];

        // remove item from array
        this.rifa = (item, arr) => arr.splice(arr.indexOf(item), 1);

        // set & get attribute
        this.sAttr = (el, details) => Object.entries(details).forEach(entry => el.setAttribute(entry[0].replace(/([A-Z])/g, '-$1').toLowerCase(), entry[1].toString()));
        this.gAttr = el => {
            return new Proxy(
                {
                    get x() { return parseFloat(el.getAttribute('x')); },
                    get y() { return parseFloat(el.getAttribute('y')); },
                    get width() { return parseFloat(el.getAttribute('width')) || el.getBBox().width; },
                    get height() { return parseFloat(el.getAttribute('height')) || el.getBBox().height; },
                }, {
                    get: (o, attr) => attr in o ? o[attr] : el.getAttribute(attr),
                }
            );
        };

        // set & get css style
        this.sCss = (el, details) => Object.entries(details).forEach(entry => el.style[entry[0]] = entry[1]);
        this.gCss = el => {
            const
                cs = window.getComputedStyle(el),
                val = p => cs.getPropertyValue(p),
                box = el => el.getBoundingClientRect();

            return new Proxy(
                {
                    get width() { return (parseFloat(val('width')) || box(el).width); },
                    get height() { return (parseFloat(val('height')) || box(el).height); },
                    get left() { return (parseFloat(val('left')) || box(el).left); },
                    get top() { return (parseFloat(val('top')) || box(el).top); },
                }, {
                    get: (o, p) => p in o ? o[p] : val(p.replace(/([A-Z])/g, '-$1'.toLowerCase())),
                }
            );
        };

        // relative cursor position
        this.relCursor = (ref, cf) => {
            if (ref && ref.nodeType != 1) throw new Error('the relCursor method expects an HTML element as argument');

            const refBox = (ref || document.body).getBoundingClientRect();

            let pos = {
                x: event.clientX - refBox.left + window.scrollX,
                y: event.clientY - refBox.top + window.scrollY,
            };

            return this.applyConfig(pos, cf, refBox);
        };

        // relative element position
        this.relPos = (el, ref, cf) => {
            const
                elBox = el.getBoundingClientRect(),
                refBox = ref.getBoundingClientRect();

            let pos = {
                x: elBox.left - refBox.left + window.scrollX,
                y: elBox.top - refBox.top + window.scrollY,
            };

            return this.applyConfig(pos, cf, elBox);
        };

        // apply general configurations for 2D vector
        this.applyConfig = (v2, cf, ref) => {
            if (/cog/.test(cf)) {
                if (!ref) throw new Error('a reference bounding box is required to calculate centre of gravity.');
                v2.x += ref.width / 2;
                v2.y += ref.height / 2;
            }

            if (/round/.test(cf)) {
                v2.x = Math.round(v2.x);
                v2.y = Math.round(v2.y);
            }

            if (/abs/.test(cf)) {
                v2.x = Math.abs(v2.x);
                v2.y = Math.abs(v2.y);
            }

            return v2;
        };

        // new svg element
        this.newSVG = type => document.createElementNS('http://www.w3.org/2000/svg', type);

        // new element
        this.newElement = (type, attr) => {
            const el = document.createElement(type);
            Object.assign(el, attr);
            return el;
        };

        // convert string to camel case
        this.camelize = str => {
            if (!/\s/.test(str.trim())) return str;
            return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (letter, index) {
                return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
            }).replace(/\s+/g, '');
        };

        // make width & height integer
        this.trimScale = (...o) => {
            if (o.length === 1) o = o[0];
            Object.values(o).forEach(el => {
                if (el.nodeType === 1) this.sCss(el, {
                    width: `${Math.ceil(this.gCss(el).width)}px`,
                    height: `${Math.ceil(this.gCss(el).height)}px`,
                });
            });
        };

        this.print = (msg, opt) => {
            if (!this.config.showDebug) return;
            if (!opt) { opt = 'log'; }

            const
                time = new Date(),
                tStamp = `[${this.pad(time.getHours())}:${this.pad(time.getMinutes())}:${this.pad(time.getSeconds())}]`;

            if (Array.isArray(msg)) console[opt](tStamp, ...msg);
            else console[opt](tStamp, msg);
        };

        this.pad = n => {
            return n.toString().length == 2 ? n : '0' + n.toString();
        };
    }
}

window.onload = () => Object.assign(window, new Utility());