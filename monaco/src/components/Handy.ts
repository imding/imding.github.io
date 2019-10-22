

// ========== ELEMENTS ========== //

export function newEl(type: string, attr?: object): HTMLElement {
    const newElement = Object.assign(document.createElement(type), attr);
    return newElement;
}

export function el(indicator: HTMLElement | string, attr?: object): any {
    const blue = { color: 'skyblue '};
    const parent = (indicator as HTMLElement);
    const addNew = (indicator: string, attr: object): object => {
        return parent.appendChild(newEl(indicator, attr));
    };
    const methods: object = {
        addNew: (indicator: string, attr: object): object => {
            return Object.assign(parent.appendChild(newEl(indicator, attr)), addNew);
        },
        forEachChild: (cb: (...arg: [HTMLElement, number]) => any): void => {
            Array.from(parent.children).forEach((child: HTMLElement, idx) => cb(child, idx));
        },
        remove: (...arr: Array<HTMLElement>): void => {
            arr.forEach(child => parent.removeChild(child));
        },
        setStyle: (css: CSSStyleDeclaration): void => {
            Object.entries(css).forEach(item => {
                const [prop, value] = item;
                parent.style[prop] = value;
            });
        },
    };

    if (typeof indicator === 'string') {
        if (attr) {
            return Object.assign(newEl(indicator, attr), { addNew });
        }

        const query = document.querySelector(indicator);

        if (!query) rt([`el('${indicator}')`, blue], ' returned null.');
        
        return query;
    }
    else {
        return methods;
    }


    // const red = { color: 'crimson' };
    // const blue = { color: 'dodgerblue' };
    // const Errors = {
    //     parentAbsent: richText('el(', ['<Missing>', red], ')'),
    // };
    // const missingParent = parent === undefined;
    // const validParent = () => {
    //     missingParent && console.warn(...Errors.parentAbsent);
    //     return !missingParent;
    // };

    // return validParent() && {
    //     addChild: (...arr: Array<HTMLElement | string>): void => {
    //         arr.forEach(child => {
    //             parent.appendChild(typeof child === 'string' ?
    //                 document.createTextNode(child) : child
    //             );
    //         });
    //     },
    //     getStyle: (prop: string): string | number => {
    //         return window.getComputedStyle(parent).getPropertyValue(prop);
    //     },
        // forEachChild: (cb: (...arg: [HTMLElement, number]) => any): void => {
        //     Array.from(parent.children).forEach((child: HTMLElement, idx) => cb(child, idx));
        // },
    //     new: (type: string, attr?: object): HTMLElement => {
    //         return parent.appendChild(newEl(type, attr));
    //     },
        // remove: (...arr: Array<HTMLElement>): void => {
        //     arr.forEach(child => parent.removeChild(child));
        // },
    //     removeStyle: (...props: Array<string>): void => {
    //         props.forEach(prop => {
    //             parent.style.removeProperty(prop);
    //             if (parent.style.length === 0) parent.removeAttribute('style');
    //         });
    //     },
        // style: (css: object): void => {
        //     Object.entries(css).forEach(item => {
        //         const [prop, value] = item;
        //         parent.style[prop] = value;
        //     });
        // },
    //     toggle: (props: object): void => {
    //         Object.entries(props).every(prop => {
    //             const [key, values] = prop;
    //             if (Array.isArray(values) && values.length === 2) {
    //                 const val = parent[key];
    //                 const [a, b] = values;

    //                 if (val !== a && val !== b) {
    //                     console.warn(...richText('parent.', [key, red], 'must have one of these values: ', [`[${a}, ${b}]`, blue]));
    //                     return false;
    //                 }

    //                 parent[key] = val === a ? b : a;
    //                 return true;
    //             }
    //             return false;
    //         });
    //     },
    //     when: (type: string, callback: (...arg: any) => void, opt?: 'once'): void => {
    //         const handler = callback;

    //         if (opt) callback = function () {
    //             parent.removeEventListener(type, callback);
    //             return handler.apply(handler, arguments);
    //         };

    //         parent.addEventListener(type, callback);
    //     },
    // };
}

// ========== OBJECTS ========== //

export function obj(srcObj: object) {
    const srcClone = Object.assign({}, srcObj);

    return {
        clone: () => srcClone,
        delete: (...keys: Array<string>): object => {
            keys.forEach(key => delete srcClone[key]);
            return srcClone;
        },
        //  obj(o).filter('values', val => val.title !== 'Deleted by merging process');
        /**
         * - remove properties in source object based on input algorithm
         * @returns source object as array
         */
        filter: (selector: 'keys' | 'values', cb: (arg: any) => any): Array<any> => {
            return Object[selector](srcClone).filter(cb);
        },
        forEachEntry: (cb: (...arg: [string, any, number]) => any): void => {
            Object.entries(srcObj).forEach((entry, idx) => cb(entry[0], entry[1], idx));
        },
        forEachKey: (cb: (...arg: [string, number]) => any): void => {
            Object.keys(srcObj).forEach((key, idx) => cb(key, idx));
        },
        mutate: (toObj: object): object => {
            Object.entries(toObj).forEach(item => {
                let [srcKey, newItem] = item;

                if (srcObj.hasOwnProperty(srcKey)) {
                    if (typeof newItem === 'object' && newItem !== null) delete srcClone[srcKey];
                    else newItem = { [srcKey]: newItem };

                    Object.assign(srcClone, newItem);
                }
            });

            return srcClone;
        },
        sort: (selector: 'keys' | 'values', cb?: (...arg: [any, any]) => any): Array<any> => {
            return Object[selector](srcClone).sort(cb || ((a: number, b: number) => a - b));
        }
    };
}

// ========== ARRAYS ========== //

export function arr(arr: Array<any>) {
    return {

        sum: (): number => arr.reduce((a, b) => a + b, 0),
    };
};

// ========== STRINGS ========== //

export function str(src: string): object {
    return {
        splice: (newSubStr: string, idx: number): string => `${src.slice(0, idx)}${newSubStr}${src.slice(idx)}`
    };
}

export function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const
            r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);

        return v.toString(16);
    });
};

// ========== ANIMEJS ========== //

export function animate(timeline: object, arg: object) { }

// ========== ALGREBRA ========== //

export function range(min: number, max: number) {
    return {
        valAtPerc: (perc: number): number => perc * (max - min) + min,
    }
};

// ========== MISC ========== //

export type RichText = Array<any | [string, object?]>;

export function rt(...segments: RichText): Array<string> {
    let finalString = '';
    let styles = [];

    segments.forEach(item => {
        const [str, rule] = Array.isArray(item) ? item : [item, {}];
        finalString += `%c${str}`;

        Object.entries(Object.assign({ color: 'gainsboro' }, rule)).forEach(style => {
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