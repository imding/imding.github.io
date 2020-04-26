import React from 'react';
import { Node, Socket, Control } from 'rete-react-render-plugin';

import { KEY, makeKey, defaultNode } from '../../constants';

export default class ElementNode extends Node {
	render() {
		const { node, bindSocket, bindControl } = this.props;
		const { outputs, controls, inputs } = this.state;

		if (outputs.length !== 1) {
			throw Error('The "Element" node should have only 1 output socket.');
		}

		const output = outputs[0];
		const elementInput = controls.find((ctrl: any) => ctrl.key === KEY.ELEMENT);
		const attributeManager = controls.find((ctrl: any) => ctrl.key === makeKey.attr('MANAGER'));
		const contentManager = controls.find((ctrl: any) => ctrl.key === makeKey.content('MANAGER'));
		const fetchAndRegisterInput = (key: KEY, manager: string) => inputs.filter((input: any) => {
			const isMember = input.key.startsWith(key);
			const notRegistered = !node.data[manager].includes(input.key);
			return isMember ? notRegistered ? node.data[manager].push(input.key) : true : false;
		});
		const attributeInputs = fetchAndRegisterInput(KEY.ATTRIBUTE, makeKey.attr("MANAGER"));
		const contentInputs = fetchAndRegisterInput(KEY.CONTENT, makeKey.content("MANAGER"));
		const toReactComponent = (input: any) => {
			input.control.data.isConnected = !input.showControl();

			return <div className='input' key={input.key}>
				<Socket
					type='input'
					socket={input.socket}
					io={input}
					innerRef={bindSocket}
				/>
				<div
					className='input-control'
					title={input.control.key}
					style={{ width: 'auto' }}
					ref={el => el && bindControl(el, input.control)}
				/>
			</div>;
		};

		return (
			<div className='node' style={defaultNode({ backgroundColor: 'gray' })}>
				{/* Outputs */}
				{<div className='output' key={output.key}>
					<div
						className='input-control'
						title={elementInput.key}
						style={{ width: 'auto' }}
						ref={el => el && bindControl(el, elementInput)}
					/>
					<Socket
						type='output'
						socket={output.socket}
						io={output}
						innerRef={bindSocket}
					/>
				</div>}
				{/* ATTRIBUTE MENAGER */}
				<Control
					className='control'
					key={attributeManager.key}
					control={attributeManager}
					innerRef={bindControl}
				/>
				{attributeInputs.map(toReactComponent)}

				{/* CONTENT MENAGER */}
				<Control
					className='control'
					key={contentManager.key}
					control={contentManager}
					innerRef={bindControl}
				/>
				{contentInputs.map(toReactComponent)}
			</div>
		);
	}
}