

export const makeSource = (head: string, body: string): string => {
	return `<html><head>${head}</head><body>${body}</body></html>`;
};

export const capitalise = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
export const titlise = (str: string) => str.split(/\s*/).map(word => capitalise(word)).join(' ');