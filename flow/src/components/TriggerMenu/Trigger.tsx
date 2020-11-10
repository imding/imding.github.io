/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React from 'react';

export interface ITrigger {
	size: number,
	image?: string,
	text?: string,
	handler?: (...arg: any) => any
}

export const Trigger: React.FC<ITrigger> = props => {
	const cls = {
		triggerWrapper: css`
			width: ${props.size}px;
			height: ${props.size}px;
			cursor: pointer;
		`,
	};

	console.log('render: <Trigger>', props.image || props.text);

	return (
		<div css={cls.triggerWrapper}>
			{(props.image && <img src={props.image} alt='trigger' />)
				|| (props.text && <p>{props.text}</p>)}
		</div>
	);
};