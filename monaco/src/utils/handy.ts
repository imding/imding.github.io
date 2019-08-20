import { AppNode } from './interfaces';

// ========== ELEMENTS ========== //

export function newEl(type: string, attr?: object): AppNode {
    const newElement = Object.assign(document.createElement(type), attr);
    return newElement;
};

export function el(parent?: AppNode) {
    const red = { color: 'crimson' };
    const blue = { color: 'dodgerblue' };
    const Errors = {
        parentAbsent: richText(['el(', ['<Missing>', red], ')']),
    };
    const missingParent = parent === undefined;
    const validParent = () => {
        missingParent && console.warn(...Errors.parentAbsent);
        return !missingParent;
    };

    return {
        addChild: (...arr: Array<AppNode | string>) => {
            validParent() && arr.forEach(child => {
                parent.appendChild(typeof child === 'string' ?
                    document.createTextNode(child) : child
                );
            });
        },
        new: (type: string, attr?: object): AppNode => {
            return validParent() && parent.appendChild(newEl(type, attr));
        },
        remove: (...arr: Array<AppNode>) => {
            validParent() && arr.forEach(child => parent.removeChild(child));
        },
        removeStyle: (...props: Array<string>): void => {
            validParent() && props.forEach(prop => {
                parent.style.removeProperty(prop);
                if (parent.style.length === 0) parent.removeAttribute('style');
            });
        },
        style: (css: object): void => {
            validParent() && Object.entries(css).forEach(item => {
                const [prop, value] = item;
                parent.style[prop] = value;
            });
        },
        toggle: (props: object): any => {
            validParent() && Object.entries(props).every(prop => {
                const [key, values] = prop;
                if (Array.isArray(values) && values.length === 2) {
                    const val = parent[key];
                    const [a, b] = values;

                    if (val !== a && val !== b) {
                        console.warn(...richText(['parent.', [key, red], 'must have one of these values: ', [`[${a}, ${b}]`, blue]]));
                        return false;
                    }

                    parent[key] = val === a ? b : a;
                    return true;
                }
                return false;
            });
        },
        when: (type: string, callback: (...arg: any) => void, opt?: 'once') => {
            const handler = callback;

            if (opt) callback = function () {
                parent.removeEventListener(type, callback);
                return handler.apply(handler, arguments);
            };

            parent.addEventListener(type, callback);
        },
    };
};

// ========== OBJECTS ========== //

export function obj(obj: object) {
    return {
        forEachKey: (cb: (arg) => any) => {

        },
    };
}

// ========== ARRAYS ========== //

export function arr(arr: Array<number>) {
    return {
        sum: (): number => arr.reduce((a, b) => a + b, 0),
    };
};

export function mutate(srcObj: object, toObj: object): object {
    const srcClone = Object.assign({}, srcObj);

    Object.entries(toObj).forEach(item => {
        const srcKey = item[0];
        let newItem = item[1];

        if (srcObj.hasOwnProperty(srcKey)) {
            if (typeof newItem === 'object' && newItem !== null) delete srcClone[srcKey];
            else newItem = { [srcKey]: newItem };

            Object.assign(srcClone, newItem);
        }
    });

    return srcClone;
};

// ========== STRINGS ========== //

export function str(src: string) {
    return {
        splice: (newSubStr: string, idx: number): string => `${src.slice(0, idx)}${newSubStr}${src.slice(idx)}`
    };
}

// ========== ANIMEJS ========== //

export function animate(timeline: object, arg: object) {}

// ========== ALGREBRA ========== //

export function range(min: number, max: number) {
    return {
        valAtPerc: (perc: number): number => perc * (max - min) + min,
    }
};

// ========== MISC ========== //

export function richText(segments: Array<string | [string, object?]>): Array<string> {
    let finalString = '';
    let styles = [];

    segments.forEach(item => {
        const [str, rule] = typeof item === 'string' ? [item, {}] : item;
        finalString += `%c${str}`;

        Object.entries(Object.assign({ color: 'ghostwhite' }, rule)).forEach(style => {
            const [prop, value] = style;
            styles.push(`${prop}: ${value};`);
        });
    });

    return [finalString, ...styles];
}

// export function debug(msg: any | Array<any>, opt?: 'log' | 'warn' | 'error') {
//     if (!opt) { opt = 'log'; }

//     const
//         time = new Date(),
//         tStamp = `[${this.pad(time.getHours())}:${this.pad(time.getMinutes())}:${this.pad(time.getSeconds())}]`;

//     if (Array.isArray(msg)) console[opt](tStamp, ...msg);
//     else console[opt](tStamp, msg);
// }