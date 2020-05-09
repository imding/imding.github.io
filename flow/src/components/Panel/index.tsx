/** @jsx jsx */
import { jsx, css, SerializedStyles } from '@emotion/core';
import React from 'react';

export { Header, Title, Options, Button } from './Header';

export interface IPanel {
	/** use @emotion/core
	 * @example style: css`property: value;`
	 * @see https://emotion.sh/docs/css-prop
	 */
	style?: SerializedStyles,
	css?: never
};

export const Panel: React.FC<IPanel> = props => {
	const panelStyle = css`
		width: calc(100% - 10px);
		height: calc(100% - 10px);
		position: relative;
		left: 5px;
		top: 5px;
		overflow: hidden;
	`;

	console.log('render: <Panel>')

	const [header, content] = React.Children.toArray(props.children);

	return (
		<div css={props.style}>
			<div css={panelStyle}>
				{header}
				{content}
			</div>
		</div>
	);
};