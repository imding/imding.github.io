import React from 'react';
import Rete from 'rete';

import ContentEditable from 'react-contenteditable';
import { MdIndeterminateCheckBox as MdMinusBox } from 'react-icons/md';
import { text, color, defaultTextField } from '../../constants';

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

export default class TextContentControl extends Rete.Control {
	emitter: any;
	key: string;
	node: any;
	component: (arg: any) => JSX.Element;
	props: any;
	update: any;

	constructor(emitter: any, key: string, node: any, readonly: boolean = false) {
		super(key);

		this.emitter = emitter;
		this.key = key;
		this.component = ({ value, onChange, onRemove }) => {
			const { isConnected } = this.data as any;
			const content = isConnected ? key : readonly ? text.noConnection : value;
			const locked = readonly || isConnected;

			return <>
				<ContentEditable
					className='editable'
					tagName='pre'
					spellCheck='false'
					disabled={locked}
					html={content}
					onChange={e => onChange(e.target)}
					ref={(ref: any) => ref && (ref.getEl().onpointerdown = (e: PointerEvent) => !locked && e.stopPropagation())}
					style={defaultTextField(locked ? readonlyStyle : editableStyle)}
				/>
				<MdMinusBox
					style={{ verticalAlign: 'middle', color: color.remove }}
					onClick={onRemove}
				/>
			</>;
		};

		const initial = node.data[key] || '';

		node.data[key] = initial;

		this.props = {
			readonly,
			value: initial,
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

	getRows(target: HTMLTextAreaElement) {
		const rows = target.value
			.split(/\n/)
			.reduce((acc: number, line: string) => acc += line.length > target.cols ? 2 : 1, 0);

		return Math.max(rows, 1).toString();
	}

	setValue(val: any) {
		this.props.value = val;
		this.putData(this.key, val);
		this.update();
	}
}