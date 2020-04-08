import React from 'react';
import Rete from 'rete';

export class NumControl extends Rete.Control {
	emitter: any;
	key: string;
	node: any;
	component: (arg: any) => JSX.Element;
	props: any;
	update: any;

	static component = ({ value, onChange }: any) => (
		<input
			type="number"
			value={value}
			ref={ref => {
				ref && ref.addEventListener("pointerdown", e => e.stopPropagation());
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
				this.emitter.trigger("process");
			}
		};
	}

	setValue(val: any) {
		this.props.value = val;
		this.putData(this.key, val);
		this.update();
	}
}