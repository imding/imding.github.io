import React from 'react';
import Rete from 'rete';

import { MdAddBox } from 'react-icons/md';
import { keyConnector, getKey, getNumber, tags, attributes, attrFormat } from '../constants';
import { capitalise } from '../../../utils';

const defaultTextField = (opts?: any) => {
	return Object.assign({
		margin: '6px',
		padding: '4px 6px',
		width: 'calc(100% - 12px)',
		height: '24px',
		minHeight: '24px',
		fontFamily: 'Monospace',
		border: 'none',
		outline: 'none',
		borderRadius: '3px',
		resize: 'vertical',
		verticalAlign: 'bottom'
	}, opts || {});
};

export class ControlManager extends Rete.Control {
	emitter: any;
	key: string;
	node: any;
	component: (arg: any) => JSX.Element;
	props: any;
	update: any;

	constructor(emitter: any, key: string, node: any) {
		super(key);

		this.emitter = emitter;
		this.key = key;
		this.component = ({ addSocket }) => {
			const title = capitalise(getKey(key));

			return <div style={{
				color: 'white',
				display: 'flex',
				flexDirection: 'row'
			}}>
				<h5 style={{ margin: '0', padding: '5px 0' }}>{title}</h5>
				<span
					title={`Add ${title}`}
					onClick={addSocket}
					ref={ref => {
						ref && ref.addEventListener('pointerdown', e => e.stopPropagation());
					}}
				>
					<MdAddBox style={{ margin: '6px 0 0 4px', color: 'lightblue' }} />
				</span>


				{/* <MdMinusBox title='Remove Socket' /> */}
			</div>;
		}

		const initial = node.data[key] || [];

		node.data[key] = initial;

		this.props = {
			addSocket: () => {
				const manager = getKey(key);
				const sockets = this.getData(key) as string[];
				const nextNumber = sockets.reduce((acc: number, name: string) => {
					const n = getNumber(name);

					return n >= acc ? acc = n + 1 : acc;
				}, 1);

				sockets.push(`${manager}${keyConnector}${nextNumber}`)

				this.putData(key, sockets);
				this.emitter.trigger('process');

				console.log(node.data);
			}
		};
	}
}

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
				value={value}
				placeholder='text content'
				style={defaultTextField()}
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
		this.props.value = val;
		this.putData(this.key, val);
		this.update();
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
		this.component = ({ value, onChange }) => <>
			<datalist id='attr-list'>
				{attributes.all.map(attr => {
					const data = attributes.boolean.includes(attr) ? attr : `${attr}=''`;
					return (<option key={attr}>{data}</option>);
				})}
			</datalist>
			<input
				type='text'
				list='attr-list'
				value={value}
				placeholder='name="value"'
				style={defaultTextField()}
				ref={ref => {
					ref && ref.addEventListener('pointerdown', e => e.stopPropagation());
				}}
				onChange={e => onChange(e.target.value)}
			/>
		</>;

		const initial = node.data[key] || { name: '', quote: '', value: '' };

		node.data[key] = initial;

		this.props = {
			readonly,
			value: this.attrToString(initial),
			onChange: (v: string) => {
				this.setValue(v);
				this.emitter.trigger('process');
			}
		};
	}

	parseAttr = (str: string) => {
		const empty = { name: '', quote: '', value: '' };

		str = str.trim();

		if (str.length === 0) return empty;

		const attr = str.match(attrFormat);

		if (attr === null) return empty;

		const [_, name, quote, value] = str.match(attrFormat) as any;
		const escapedQuote = new RegExp(`\\\\${quote}`, 'g');
		const valueNoQuote = value.replace(escapedQuote, '');

		if (valueNoQuote.includes(quote)) {
			console.warn('Incorrect quote usage.');
			return empty;
		}

		return { name, quote, value };
	}

	attrToString = (attr: any) => {
		const { name, quote, value } = attr;

		if (name.length && quote.length && value.length) {
			return `${name}=${quote}${value}${quote}`;
		}

		return '';
	}

	setValue(val: any) {
		this.props.value = val;
		this.putData(this.key, this.parseAttr(val));
		this.update();
	}
}

export class ElementPicker extends Rete.Control {
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
		this.component = ({ value, onChange }: any) => <>
			<datalist id='tag-list'>
				{tags.all.map(tag => (<option key={tag}>{`<${tag}>`}</option>))}
			</datalist>
			<input
				type='text'
				list='tag-list'
				value={value}
				placeholder='element name'
				style={{
					width: '100px',
					minWidth: '100px',
					padding: '4px 6px',
					color: 'rgba(255, 255, 255, 0.8)',
					fontFamily: 'Monospace',
					textAlign: 'center',
					outline: 'none',
					border: 'none',
					borderRadius: '4px',
					backgroundColor: 'rgba(0, 0, 0, 0.4)'
				}}
				ref={ref => {
					ref && ref.addEventListener('pointerdown', e => e.stopPropagation());
				}}
				onChange={e => onChange(e.target)}
			/>
		</>;

		const fromData = node.data[key];
		const initial = (fromData && `<${fromData}>`) || '';

		node.data[key] = this.stripBracket(initial);

		this.props = {
			readonly,
			value: initial,
			onChange: (el: HTMLInputElement) => {
				el.style.width = `${el.value.length * 8 + 12}px`;
				this.setValue(el.value);
				this.emitter.trigger('process');
			}
		};
	}

	setValue(val: string) {
		const tagName = this.stripBracket(val);

		this.putData(this.key, tagName.trim().length ? tagName : '');
		this.props.value = val;
		this.update();
	}

	stripBracket(str: string) {
		return str.replace(/[<>]/g, '');
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