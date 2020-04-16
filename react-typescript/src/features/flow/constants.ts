
export enum KEY {
	HEAD = 'HEAD',
	BODY = 'BODY',
	ELEMENT = 'ELEMENT',
	ATTRIBUTE = 'ATTRIBUTE',
	CONTENT = 'CONTENT',
	TEXT = 'TEXT',
}

export const keyConnector = '::';
export const makeKey = (key: string) => (suffix?: number | 'MANAGER') => `${key}${suffix ? `${keyConnector}${suffix}` : ''}`;
export const getKey = (str: string) => str.split(keyConnector).shift()!;
export const getNumber = (str: string) => Number(str.split(keyConnector).pop()!);
export const key = {
	head: makeKey(KEY.HEAD),
	body: makeKey(KEY.BODY),
	elm: makeKey(KEY.ELEMENT),
	attr: makeKey(KEY.ATTRIBUTE),
	content: makeKey(KEY.CONTENT),
	text: makeKey(KEY.TEXT),
}

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
export const defaultNodes = `{
	"id": "flow@0.1.0",
	"nodes": {
		"1": {
			"id": 1,
			"data": {
				"html": {}
			},
			"inputs": {
				"HEAD::1": {
					"connections": []
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
							"node": 4,
							"output": "ELEMENT",
							"data": {}
						}
					]
				}
			},
			"outputs": {},
			"position": [
				285.91385927657996,
				-305.38199336970774
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
				-111.65555344238643,
				-286.44505677465486
			],
			"name": "Element"
		},
		"4": {
			"id": 4,
			"data": {
				"ELEMENT": "h2",
				"ATTRIBUTE::MANAGER": [
					"ATTRIBUTE::1"
				],
				"CONTENT::MANAGER": [
					"CONTENT::1"
				],
				"ATTRIBUTE::1": {
					"name": "class",
					"quote": "'",
					"value": "subtitle"
				},
				"CONTENT::1": "hello world!"
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
							"input": "BODY::2",
							"data": {}
						}
					]
				}
			},
			"position": [
				-111.65900786086542,
				-3.0748492968437233
			],
			"name": "Element"
		}
	}
}`;