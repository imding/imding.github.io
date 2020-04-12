import React from 'react';
import Rete from 'rete';

export class TextContentControl extends Rete.Control {
	emitter: any;
	key: string;
	node: any;
	component: (arg: any) => JSX.Element;
	props: any;
	update: any;

	constructor(emitter: any, key: string, node: any, readonly = false) {
		super(key);

		this.emitter = emitter;
		this.key = key;
		this.component = ({ value, onChange }) => {
			return <><textarea
				// type='text'
				value={value}
				placeholder='text content'
				style={{
					border: 'none',
					boxSizing: 'border-box',
					resize: 'vertical',
					width: '100%',
					minHeight: '50px',
				}}
				ref={ref => {
					ref && ref.addEventListener('pointerdown', e => e.stopPropagation());
				}}
				onChange={e => onChange(e.target.value)}
			/></>;
		};

		const initial = node.data[key] || '';

		node.data[key] = initial;

		this.props = {
			readonly,
			value: initial,
			onChange: (v: string) => {
				this.setValue(v);
				this.emitter.trigger('process');
			}
		};
	}

	setValue(val: any) {
		const element = this.getData('element');

		if (element) {
			(element as HTMLElement).textContent = val;
			this.putData('element', element);
		}

		this.props.value = val;
		this.putData(this.key, val);
		this.update();

		console.log(this.getData('element'));
	}
}

export class AttributeControl extends Rete.Control {
	emitter: any;
	key: string;
	node: any;
	component: (arg: any) => JSX.Element;
	props: any;
	update: any;

	constructor(emitter: any, key: string, node: any, readonly = false) {
		super(key);

		this.emitter = emitter;
		this.key = key;
		this.component = ({ value, onChange }) => {
			const attributes = {
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
					'onabort', 'oncanplaythrough', 'oncuechange', 'ondurationchange', 'onemptied', 'onended', 'onerror', 'onloadeddata', 'onloadedmetadata', 'onloadstart', 'onpaush', 'onplay', 'onplaying', 'onprogress', 'onratechange', 'onseeked', 'onseeking', 'onstalled', 'onsuspend', 'ontimeupdate', 'onvalumechange', 'onwaiting',
					// misc events
					'onshow', 'ontoggle',

					'role' /* jQuery mobile specific */,
				],
				boolean: ['checked', 'disabled', 'selected', 'readonly', 'multiple', 'ismap', 'defer', 'declare', 'noresize', 'nowrap', 'noshade', 'compact'],
			};

			return <>
				<datalist id='attr-list'>
					{attributes.all.map(attr => (<option key={attr}>{attr}</option>))}
				</datalist>
				<input
					type='text'
					list='attr-list'
					value={value}
					ref={ref => {
						ref && ref.addEventListener('pointerdown', e => e.stopPropagation());
					}}
					onChange={e => onChange(e.target.value)}
				/>
			</>;
		};

		const initial = node.data[key] || '';

		node.data[key] = initial;

		this.props = {
			readonly,
			value: initial,
			onChange: (v: string) => {
				this.setValue(v);
				this.emitter.trigger('process');
			}
		};
	}

	setValue(val: any) {
		this.props.value = val;
		this.putData(this.key, val);
		this.update();
	}
}

export class ElementControl extends Rete.Control {
	emitter: any;
	key: string;
	node: any;
	component: (arg: any) => JSX.Element;
	props: any;
	update: any;

	constructor(emitter: any, key: string, node: any, readonly = false) {
		super(key);

		this.emitter = emitter;
		this.key = key;
		this.component = ({ value, onChange }: any) => {
			const tags = {
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

			return <>
				<datalist id='tag-list'>
					{tags.all.map(tag => (<option key={tag}>{tag}</option>))}
				</datalist>
				<input
					type='text'
					list='tag-list'
					value={value}
					placeholder='element name'
					style={{ border: 'none' }}
					ref={ref => {
						ref && ref.addEventListener('pointerdown', e => e.stopPropagation());
					}}
					onChange={e => onChange(e.target.value)}
				/>
			</>;
		};

		const initial = node.data[key] || '';

		node.data[key] = initial;

		this.props = {
			readonly,
			value: initial,
			onChange: (v: string) => {
				this.setValue(v);
				this.emitter.trigger('process');
			}
		};
	}

	setValue(val: string) {
		if (val.trim().length) {
			const element = document.createElement(val) as HTMLElement;
			const content = this.getData('text') as string;

			if (content && content.length) {
				element.textContent = content.trim();
			}

			this.putData(this.key, element);
		}

		this.props.value = val;
		this.update();
	}
}

export class NumControl extends Rete.Control {
	emitter: any;
	key: string;
	node: any;
	component: (arg: any) => JSX.Element;
	props: any;
	update: any;

	static component = ({ value, onChange }: any) => (
		<input
			type='number'
			value={value}
			ref={ref => {
				ref && ref.addEventListener('pointerdown', e => e.stopPropagation());
			}}
			onChange={e => onChange(+e.target.value)}
		/>
	);

	constructor(emitter: any, key: string, node: any, readonly = false) {
		super(key);

		this.emitter = emitter;
		this.key = key;
		this.component = NumControl.component;

		const initial = node.data[key] || 0;

		node.data[key] = initial;

		this.props = {
			readonly,
			value: initial,
			onChange: (v: number) => {
				this.setValue(v);
				this.emitter.trigger('process');
			}
		};
	}

	setValue(val: any) {
		this.props.value = val;
		this.putData(this.key, val);
		this.update();
	}
}