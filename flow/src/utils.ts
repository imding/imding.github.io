export const makeSource = (head: string, body: string): string => {
	return `<html><head>${head}</head><body>${body}</body></html>`;
};

export const capitalise = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
export const titlise = (str: string) => str.split(/\s*/).map(word => capitalise(word)).join(' ');


// ========== OBJECTS ========== //

export function obj(srcObj: object) {
	const srcClone: { [key: string]: any } = Object.assign({}, srcObj);

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
		forEachEntry: (cb: (key: string, value: any, idx?: number) => any): void => {
			Object.entries(srcObj).forEach((entry, idx) => cb(entry[0], entry[1], idx));
		},
		forEachKey: (cb: (...arg: [string, number]) => any): void => {
			Object.keys(srcObj).forEach((key, idx) => cb(key, idx));
		},
		hasKey: (key: string): boolean => ({}).hasOwnProperty.call(srcClone, key),
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
		sort: (selector: 'keys' | 'values', cb?: (...arg: [any, any]) => number) => {
			return Object.fromEntries(Object.entries(srcClone).sort((a: [string, any], b: [string, any]) => {
				const [key1, value1] = a;
				const [key2, value2] = b;

				if (cb) return cb(a, b);
				else if (selector === 'keys') {
					return key1 < key2 ? -1 : key1 > key2 ? 1 : 0;
				}
				else if (selector === 'values') {
					return value1 - value2;
				}
				return 0;
			}));
			// return Object[selector](srcClone).sort(cb || ((a: number, b: number) => a - b));
		},
		/**
		 *- takes a function as argument that transforms each key in the source object
		 *- transformed keys are then arranged into groups by uniqueness
		 ** `const o = { key1: 1, key2: 2, key10: 10 };`
		 ** `obj(0).uniqueKeyGroup(key => parseInt(key) >= 10 ? 'a' : 'b')` returns `[[10], [1, 2]]`
         * @returns an array equal in size to the number of unique groups, each group an array containing the value of the 
         */
		keyGroups: (groupLogic: (key: string) => string): any[] => {
			const groups = Object.entries(srcClone).reduce((acc: any, entry: any) => {
				const [key, value] = entry;
				const group = groupLogic(key);

				if (acc.hasOwnProperty(group)) {
					acc[group].push(value);
				}
				else acc[group] = [value];
				return acc;
			}, {});
			const sortedGroups = obj(groups).sort('keys');

			return Object.values(sortedGroups);
		}
	};
}

// ========== TEXT ========== //

export function insertTextAtCursor(text: string) {
	if (window.getSelection) {
		const sel = window.getSelection()!;
		if (sel.getRangeAt && sel.rangeCount) {
			const range = sel.getRangeAt(0);
			range.deleteContents();
			range.insertNode(document.createTextNode(text));
		}
	}
	// else if ((document as any).selection && (document as any).selection.createRange) {
	// 	(document as any).selection.createRange().text = text;
	// }
}