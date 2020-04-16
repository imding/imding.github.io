import React, { CSSProperties } from 'react';
import { Node, Socket, Control } from 'rete-react-render-plugin';
import { Input } from 'rete';

import { KEY, key, getKey } from '../constants';

export class ElementNode extends Node {
	render() {
		const { node, bindSocket, bindControl } = this.props;
		const { outputs, controls, inputs } = this.state;
		if (outputs.length !== 1) {
			throw Error('The "Element" node should have only 1 output socket.');
		}
		// else if (controls.length !== 1) {
		// 	console.log(controls);
		// 	throw Error('The "Element" node should have only 1 control component.');
		// }
		const output = outputs[0];
		const elmPicker = controls.find((ctrl: any) => ctrl.key === KEY.ELEMENT);
		const attributeManager = controls.find((ctrl: any) => ctrl.key === key.attr('MANAGER'));
		const contentManager = controls.find((ctrl: any) => ctrl.key === key.content('MANAGER'));
		const fetchAndRegisterInput = (key: KEY, manager: string) => inputs.filter((input: any) => {
			if (input.key.startsWith(key)) {
				if (!node.data[manager].includes(input.key)) {
					node.data[manager].push(input.key);
				}
				return true;
			}
			return false;
		});
		const attributeInputs = fetchAndRegisterInput(KEY.ATTRIBUTE, key.attr("MANAGER"));
		const contentInputs = fetchAndRegisterInput(KEY.CONTENT, key.content("MANAGER"));

		// const { attributeInputs, contentInputs } = inputs.reduce((acc: any, input: any) => {
		// 	if (input.key.startsWith(KEY.ATTRIBUTE)) {
		// 		acc.attributeInputs.push(input);
		// 	}
		// 	else acc.contentInputs.push(input);

		// 	return acc;
		// }, { attributeInputs: [], contentInputs: [] });

		const toReactComponent = (input: any) =>
			<div className='input' key={input.key}>
				<Socket
					type='input'
					socket={input.socket}
					io={input}
					innerRef={bindSocket}
				/>
				{!input.showControl() && (
					<div className='input-title'>{input.name}</div>
				)}
				{input.showControl() && (
					<Control
						className='input-control'
						control={input.control}
						innerRef={bindControl}
					/>
				)}
			</div>;

		return (
			<div className='node' style={{ background: 'grey', padding: '10px 0' }}>
				{/* Outputs */}
				{<div className='output' key={output.key} style={{ display: 'flex' }}>
					<Control
						className='control'
						key={elmPicker.key}
						control={elmPicker}
						innerRef={bindControl}
					/>
					<div className='output-title' style={{ marginLeft: 0 }}>{output.name}</div>
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

export class HTMLNode extends Node {
	render() {
		const { bindSocket } = this.props;
		const { inputs } = this.state;

		const inputGroups = inputs.reduce((acc: any, item: Input) => {
			acc[getKey(item.key)].push(item);
			return acc;
		}, { [KEY.HEAD]: [], [KEY.BODY]: [] });

		const wrapperStyles: CSSProperties = {
			textAlign: 'left',
			paddingLeft: '10px',
			color: 'gainsboro',
			fontFamily: 'monospace'
		};

		const [headInputs, bodyInputs] = Object.entries(inputGroups).map(item => {
			const [type, inputs] = item as [string, Input[]];

			return (<section className='input-group' key={type}>
				<header style={wrapperStyles}>{`<${type}>`}</header>
				{inputs.map(input => {
					return <div className='input' key={input.key}>
						<Socket
							type='input'
							socket={input.socket}
							io={input}
							innerRef={bindSocket}
						/>
						<div className='input-title'><samp>{input.name}</samp></div>
					</div>
				})}
				<footer style={wrapperStyles}>{`</${type}>`}</footer>
			</section>);
		});

		return (
			<div className='node' style={{ background: 'dimgray' }}>
				<div className='title'>HTML Output</div>
				{/* Outputs */}
				{/* Controls */}
				{/* Inputs */}
				{headInputs}
				<hr />
				{bodyInputs}
			</div>
		);
	}
}

export class MyNode extends Node {
	render() {
		const { node, bindSocket, bindControl } = this.props;
		const { outputs, controls, inputs, selected } = this.state;

		return (
			<div className={`node ${selected}`} style={{ background: 'grey' }}>
				<div className='title'>
					{'<<'} {node.name} {'>>'}
				</div>
				{/* Outputs */}
				{outputs.map((output: any) => (
					<div className='output' key={output.key}>
						<div className='output-title'>{output.name}</div>
						<Socket
							type='output'
							socket={output.socket}
							io={output}
							innerRef={bindSocket}
						/>
					</div>
				))}
				{/* Controls */}
				{controls.map((control: any) => (
					<Control
						className='control'
						key={control.key}
						control={control}
						innerRef={bindControl}
					/>
				))}
				{/* Inputs */}
				{inputs.map((input: any) => (
					<div className='input' key={input.key}>
						<Socket
							type='input'
							socket={input.socket}
							io={input}
							innerRef={bindSocket}
						/>
						{!input.showControl() && (
							<div className='input-title'>{input.name}</div>
						)}
						{input.showControl() && (
							<Control
								className='input-control'
								control={input.control}
								innerRef={bindControl}
							/>
						)}
					</div>
				))}
			</div>
		);
	}
}
