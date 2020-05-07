import React from 'react';
import Rete from 'rete';

import { tags } from '../../constants';

export default class ElementPicker extends Rete.Control {
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
		this.node = node;
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
			<h5 style={{ display: 'inline-block', verticalAlign: 'middle', color: 'white', marginLeft: '5px' }}>Element</h5>
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

	setValue(elementName: string) {
		const tagName = this.stripBracket(elementName);

		this.putData(this.key, tagName.trim().length ? tagName : '');
		this.props.value = elementName;
		this.update();
	}

	stripBracket(str: string) {
		return str.replace(/[<>]/g, '');
	}
}