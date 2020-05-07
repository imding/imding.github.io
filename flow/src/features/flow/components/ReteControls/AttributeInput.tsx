import React from 'react';
import Rete from 'rete';

import ContentEditable from 'react-contenteditable';
import { MdIndeterminateCheckBox as MdMinusBox } from 'react-icons/md';
import { color, /* attributes, */attrFormat, defaultTextField } from '../../constants';

const editableStyle = {
	marginRight: '2px',
	verticalAlign: 'middle'
};
const readonlyStyle = {
	backgroundColor: 'transparent',
	color: 'gainsboro',
	fontStyle: 'italic',
	cursor: 'pointer'
};

export default class AttributeInput extends Rete.Control {
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
		this.component = ({ value, onChange, onRemove }) => {
			const { isConnected } = this.data as any;
			const content = isConnected ? key : value;

			return <>
				<ContentEditable
					className='editable'
					tagName='pre'
					spellCheck='false'
					disabled={isConnected}
					html={content}
					onChange={e => onChange(e.target)}
					ref={(ref: any) => ref && (ref.getEl().onpointerdown = (e: PointerEvent) => !isConnected && e.stopPropagation())}
					style={defaultTextField(isConnected ? readonlyStyle : editableStyle)}
				/>
				<MdMinusBox
					style={{ verticalAlign: 'middle', color: color.remove }}
					onClick={onRemove}
				/>
			</>
		};

		const initial = node.data[key] || { name: '', quote: '', value: '' };

		node.data[key] = initial;

		this.props = {
			readonly,
			value: this.attrToString(initial),
			onChange: (target: any) => {
				this.setValue(target.value);
				this.emitter.trigger('process');
			},
			onRemove: () => {
				this.removeInput();
				this.emitter.trigger('process');
			}
		};
	}

	removeInput() {
		this.putData(this.key, null);
		this.update();
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
			console.warn(`Incorrect quote usage in: ${_}`);
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

	setValue(val: string) {
		this.props.value = val;
		this.putData(this.key, this.parseAttr(val));
		this.update();
	}
}