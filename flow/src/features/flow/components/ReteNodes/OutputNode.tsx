/** @jsx jsx */
import { Node, Socket, Control } from 'rete-react-render-plugin';
import { jsx, css } from '@emotion/core';

import { KEY, makeKey, defaultNode } from '../../constants';

const cls = {
	title: css`
		border-bottom: 1px solid rgba(0, 0, 0, 0.4);
		background-color: rgba(0, 0, 0, 0.2);
		border-radius: 10px 10px 0 0;
	`,
};
export default class HTMLNode extends Node {
	render() {
		const { node, bindControl, bindSocket } = this.props;
		const { controls, inputs } = this.state;
		const headContentMKey = makeKey.head('MANAGER');
		const bodyContentMKey = makeKey.body('MANAGER');
		const headContentManager = controls.find((ctrl: any) => ctrl.key === headContentMKey);
		const bodyContentManager = controls.find((ctrl: any) => ctrl.key === bodyContentMKey);
		const fetchAndRegisterInput = (key: KEY, manager: string) => inputs.filter((input: any) => {
			const isMember = input.key.startsWith(key);
			const notRegistered = !node.data[manager].includes(input.key);
			return isMember ? notRegistered ? node.data[manager].push(input.key) : true : false;
		});
		const headInputs = fetchAndRegisterInput(KEY.HEAD, headContentMKey);
		const bodyInputs = fetchAndRegisterInput(KEY.BODY, bodyContentMKey);
		const toReactComponent = (input: any) => {
			input.control.data.isConnected = !input.showControl();

			return (
				<div className='input' key={input.key} style={{ display: 'flex' }}>
					<Socket
						type='input'
						socket={input.socket}
						io={input}
						innerRef={bindSocket}
					/>
					<div
						className='input-control'
						title={input.control.key}
						style={{ width: 'auto', display: 'flex', alignItems: 'center' }}
						ref={el => el && bindControl(el, input.control)}
					/>
				</div>
			)
		};

		return (
			<div className='node' style={defaultNode({ textAlign: 'center', backgroundColor: 'gray' })}>
				<div className='title' css={cls.title}>HTML Output</div>
				{/* HEAD CONTROL MANAGER */}
				<Control
					className='control'
					key={headContentManager.key}
					control={headContentManager}
					innerRef={bindControl}
				/>
				{headInputs.map(toReactComponent)}

				{/* BODY CONTROL MANAGER */}
				<Control
					className='control'
					key={bodyContentManager.key}
					control={bodyContentManager}
					innerRef={bindControl}
				/>
				{bodyInputs.map(toReactComponent)}
			</div>
		);
	}
}