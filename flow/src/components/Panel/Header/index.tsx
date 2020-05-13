/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React from 'react';

export { Title } from './Title';
export { Options } from './Options';
export { Button } from './Button';

export interface IHeader {
	name: string,
	height?: number,
}

export const Header: React.FC<IHeader> = props => {
	const cls = {
		header: css`
			height: ${props.height || 42}px;
			padding: 0 10px;
			border-radius: 6px 6px 0 0;
			display: grid;
			grid-auto-flow: column;
			place-items: center;
			justify-content: space-between;
			background-color: #333;
			color: ghostwhite;
			white-space: nowrap;
		`,
		name: css`
			opacity: 0.4;
			cursor: default;
			user-select: none;
		`
	};
	const [title, options] = React.Children.toArray(props.children);

	console.log(`render: <Header> "${props.name}"`);

	return (
		<div css={cls.header}>
			<h5 css={cls.name}>{props.name}</h5>
			{title || <span />}
			{options || <span />}
		</div>
	);
};