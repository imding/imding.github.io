import React, { CSSProperties } from 'react';
import { Node, Socket, Control } from 'rete-react-render-plugin';
import { Input } from 'rete';

export class ElementNode extends Node {
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

export class HTMLNode extends Node {
	render() {
		const { bindSocket, bindControl } = this.props;
		const { inputs, outputs, controls, selected } = this.state;

		const inputGroups = inputs.reduce((acc: { [name: string]: Input[] }, item: Input) => {
			acc[item.key.split('::').shift() as string].push(item);
			return acc;
		}, { head: [], body: [] });

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
				{inputs.map(input => (<div className='input' key={input.key}>
					<Socket
						type='input'
						socket={input.socket}
						io={input}
						innerRef={bindSocket}
					/>
					<div className='input-title'>{input.name.length ? input.name : <i>No Connection</i>}</div>
				</div>))}
				<footer style={wrapperStyles}>{`</${type}>`}</footer>
			</section>);
		});

		return (
			<div className={`node ${selected}`} style={{ background: 'dimgray' }}>
				<div className='title'>HTML Output</div>
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
