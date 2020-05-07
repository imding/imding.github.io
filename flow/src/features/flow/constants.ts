import Rete from 'rete';

export type Inputs = {
	[key: string]: any[]
};

export enum KEY {
	HEAD = 'HEAD',
	BODY = 'BODY',
	ELEMENT = 'ELEMENT',
	ATTRIBUTE = 'ATTRIBUTE',
	CONTENT = 'CONTENT',
	TEXT = 'TEXT',
}
export const keyDenoter = '::';
export const addSuffix = (key: string) => (suffix?: number | 'MANAGER') => `${key}${suffix ? `${keyDenoter}${suffix}` : ''}`;
export const removeSuffix = (str: string) => str.split(keyDenoter).shift()!;
export const getSuffix = (str: string) => Number(str.split(keyDenoter).pop()!);
export const makeKey = {
	head: addSuffix(KEY.HEAD),
	body: addSuffix(KEY.BODY),
	elm: addSuffix(KEY.ELEMENT),
	attr: addSuffix(KEY.ATTRIBUTE),
	content: addSuffix(KEY.CONTENT),
	text: addSuffix(KEY.TEXT),

	/**
	 * @param type `KEY.ATTRIBUTE | KEY.CONTENT | string`
	 * - Creates keys exclusively for the `input` object
	 * - The `input` object is received via connections between nodes
	 * @returns plural of parameter string cerverted to lowercase
	 */
	io: (type: KEY.ATTRIBUTE | KEY.CONTENT | string) => `${type.toLowerCase()}s`
}

export const numSocket = new Rete.Socket('Number');
export const elmSocket = new Rete.Socket('Element');
export const attrSocket = new Rete.Socket('Attribute');

export const defaultNode = (opts?: any) => Object.assign({
	border: 'none',
	backgroundColor: 'gray'
	// padding: '6px 0 6px 0'
}, opts || {});

export const defaultTextField = (opts?: any) => Object.assign({
	display: 'inline-block',
	whiteSpace: 'pre-wrap',
	minWidth: '150px',
	maxWidth: '250px',
	minHeight: '24px',
	padding: '4px 6px',
	fontFamily: 'Monospace',
	color: 'ghostwhite',
	backgroundColor: 'rgba(0, 0, 0, 0.4)',
	borderRadius: '3px',
	cursor: 'text',
	border: 'none',
	outline: 'none',
	resize: 'none'
}, opts || {});

export const color = {
	add: 'lightskyblue',
	remove: 'lightcoral',
	sync: 'gold'
};

export const text = {
	noConnection: 'No Connection'
};

export const attrFormat = /^([a-z-]+)\s*=\s*(['"])(.*)\2$/;

export const tags = {
	all: [
		// IMPORTANT: ascending tag name lengths
		'p', 'b', 'u', 'i', 'a',
		'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'em', 'hr', 'tt', 'dl', 'dt', 'dd', 'tr', 'th', 'td',
		'col', 'div', 'img', 'nav', 'sup', 'sub', 'pre', 'wbr',
		'area', 'base', 'code', 'html', 'meta', 'head', 'link', 'body', 'span', 'nobr', 'form',
		'embed', 'label', 'input', 'param', 'small', 'style', 'table', 'title', 'frame', 'track',
		'button', 'canvas', 'footer', 'header', 'keygen', 'iframe', 'strong', 'select', 'option', 'script', 'source', 'strike',
		'command', 'article', 'section',
		'noscript', 'textarea', 'frameset', 'noframes', 'progress',
		'blockquote',
	],
	void: ['area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'],
	allowedInHead: ['title', 'base', 'link', 'style', 'meta', 'script', 'noscript', 'template']
};
export const attributes = {
	all: [
		'id',
		'alt', 'dir', 'for', 'low', 'max', 'min', 'rel', 'src',
		'cite', 'code', 'cols', 'data', 'form', 'high', 'href', 'icon', 'kind', 'lang', 'list', 'loop', 'name', 'open', 'ping', 'rows', 'size', 'slot', 'span', 'step', 'type', 'wrap',
		'align', 'async', 'class', 'defer', 'ismap', 'label', 'media', 'muted', 'scope', 'shape', 'sizes', 'start', 'style', 'title', 'value', 'width',
		'accept', 'action', 'coords', 'height', 'hidden', 'method', 'nowrap', 'poster', 'scoped', 'srcdoc', 'srcset', 'target', 'usemap',
		'charset', 'checked', 'colspan', 'compact', 'content', 'declare', 'default', 'dirname', 'enctype', 'headers', 'keytype', 'noshade', 'optimum', 'pattern', 'preload', 'rowspan', 'sandbox', 'srclang', 'summary',
		'autoplay', 'buffered', 'codebase', 'controls', 'datetime', 'disabled', 'download', 'dropzone', 'hreflang', 'itemprop', 'language', 'manifest', 'multiple', 'readonly', 'required', 'reversed', 'seamless', 'selected', 'tabindex',
		'accesskey', 'autofocus', 'challenge', 'draggable', 'integrity', 'maxlength', 'minlength', 'noresize', 'translate',
		'formaction', 'http-equiv', 'novalidate', 'radiogroup', 'spellcheck',
		'contextmenu', 'crossorigin', 'placeholder',
		'autocomplete',
		'accept-charset', 'autocapitalize',
		'contenteditable',

		// window events
		'onafterprint', 'onbeforeprint', 'onbeforeunload', 'onerror', 'onhashchange', 'onload', 'onmessage', 'onoffline', 'ononline', 'onpageshow', 'onpopstate', 'onresize', 'onstorage',
		// form events
		'onblur', 'onchange', 'oncontextmenu', 'onfocus', 'oninput', 'oninvalid', 'onreset', 'onsearch', 'onselect', 'onsubmit',
		// keyboard events
		'onkeydown', 'onkeypress', 'onkeyup',
		// mouse events
		'onclick', 'ondblclick', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'onmousewheel', 'onwheel',
		// drag events
		'ondrag', 'ondragend', 'ondragenter', 'ondragleave', 'ondragover', 'ondragstart', 'ondrop', 'onscroll',
		// clipboard events
		'oncopy', 'oncut', 'onpaste',
		// media events
		'onabort', 'oncanplaythrough', 'oncuechange', 'ondurationchange', 'onemptied', 'onended', /*'onerror', */'onloadeddata', 'onloadedmetadata', 'onloadstart', 'onpaush', 'onplay', 'onplaying', 'onprogress', 'onratechange', 'onseeked', 'onseeking', 'onstalled', 'onsuspend', 'ontimeupdate', 'onvalumechange', 'onwaiting',
		// misc events
		'onshow', 'ontoggle',
	],
	boolean: ['checked', 'disabled', 'selected', 'readonly', 'multiple', 'ismap', 'defer', 'declare', 'noresize', 'nowrap', 'noshade', 'compact'],
};
export const defaultGraphJson = JSON.parse(`{
	"id": "flow@0.1.0",
	"nodes": {
		"1": {
			"id": 1,
			"data": {
				"HEAD::MANAGER": [
					"HEAD::1"
				],
				"BODY::MANAGER": [
					"BODY::1",
					"BODY::2",
					"BODY::3"
				],
				"HEAD::1": "",
				"BODY::1": "",
				"BODY::2": "",
				"html": {},
				"BODY::3": ""
			},
			"inputs": {
				"HEAD::1": {
					"connections": [
						{
							"node": 6,
							"output": "ELEMENT",
							"data": {}
						}
					]
				},
				"BODY::1": {
					"connections": [
						{
							"node": 3,
							"output": "ELEMENT",
							"data": {}
						}
					]
				},
				"BODY::2": {
					"connections": [
						{
							"node": 8,
							"output": "ELEMENT",
							"data": {}
						}
					]
				},
				"BODY::3": {
					"connections": [
						{
							"node": 9,
							"output": "ELEMENT",
							"data": {}
						}
					]
				}
			},
			"outputs": {},
			"position": [
				326.8198575836843,
				-253.57021272790124
			],
			"name": "HTML Output"
		},
		"3": {
			"id": 3,
			"data": {
				"ELEMENT": "h1",
				"ATTRIBUTE::MANAGER": [
					"ATTRIBUTE::1"
				],
				"CONTENT::MANAGER": [
					"CONTENT::1"
				],
				"ATTRIBUTE::1": {
					"name": "id",
					"quote": "'",
					"value": "title"
				},
				"CONTENT::1": "Flow Coding"
			},
			"inputs": {
				"ATTRIBUTE::1": {
					"connections": []
				},
				"CONTENT::1": {
					"connections": []
				}
			},
			"outputs": {
				"ELEMENT": {
					"connections": [
						{
							"node": 1,
							"input": "BODY::1",
							"data": {}
						}
					]
				}
			},
			"position": [
				-98.94763055382651,
				-126.70301828346801
			],
			"name": "Element"
		},
		"6": {
			"id": 6,
			"data": {
				"ELEMENT": "style",
				"ATTRIBUTE::MANAGER": [],
				"CONTENT::MANAGER": [
					"CONTENT::1"
				],
				"CONTENT::1": "body {\\n  background-color: khaki;\\n}\\n\\n#title {\\n  text-align: center;\\n}\\n"
			},
			"inputs": {
				"CONTENT::1": {
					"connections": []
				}
			},
			"outputs": {
				"ELEMENT": {
					"connections": [
						{
							"node": 1,
							"input": "HEAD::1",
							"data": {}
						}
					]
				}
			},
			"position": [
				-409.9344543917789,
				-230.75957197685952
			],
			"name": "Element"
		},
		"8": {
			"id": 8,
			"data": {
				"ELEMENT": "h2",
				"ATTRIBUTE::MANAGER": [],
				"CONTENT::MANAGER": [
					"CONTENT::1"
				],
				"CONTENT::1": "Create HTML pages without having to worry about syntax."
			},
			"inputs": {
				"CONTENT::1": {
					"connections": []
				}
			},
			"outputs": {
				"ELEMENT": {
					"connections": [
						{
							"node": 1,
							"input": "BODY::2",
							"data": {}
						}
					]
				}
			},
			"position": [
				-164.13953966187998,
				96.58648906386625
			],
			"name": "Element"
		},
		"9": {
			"id": 9,
			"data": {
				"ELEMENT": "img",
				"ATTRIBUTE::MANAGER": [
					"ATTRIBUTE::1"
				],
				"CONTENT::MANAGER": [],
				"ATTRIBUTE::1": {
					"name": "src",
					"quote": "'",
					"value": "https://app.bsd.education/resources/mole.png"
				}
			},
			"inputs": {
				"ATTRIBUTE::1": {
					"connections": []
				}
			},
			"outputs": {
				"ELEMENT": {
					"connections": [
						{
							"node": 1,
							"input": "BODY::3",
							"data": {}
						}
					]
				}
			},
			"position": [
				-165.57480153423893,
				288.87417084221113
			],
			"name": "Element"
		}
	}
}`);