import React from 'react';
import Rete from 'rete';

import { MdAddBox } from 'react-icons/md';

import { keyDenoter, getSuffix, removeSuffix, color } from '../../constants';
import { capitalise } from '../../../../utils';

export default class InputManager extends Rete.Control {
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
			const title = capitalise(removeSuffix(key));

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
					<MdAddBox style={{ margin: '6px 0 0 4px', color: color.add }} />
				</span>
			</div>;
		}

		const initial = node.data[key] || [];

		node.data[key] = initial;

		const manager = removeSuffix(key);

		this.props = {
			addSocket: () => {
				const sockets = this.getData(key) as string[];
				const nextNumber = sockets.reduce((acc: number, name: string) => {
					const n = getSuffix(name);
					return n >= acc ? acc = n + 1 : acc;
				}, 1);

				sockets.push(`${manager}${keyDenoter}${nextNumber}`);
				this.putData(key, sockets);
				this.emitter.trigger('process');
			}
		};
	}
}