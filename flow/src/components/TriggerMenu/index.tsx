/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React from 'react';

export interface ITriggerMenu { }

export const TriggerMenu: React.FC = props => {
	const cls = {
		root: css`
			display: inline-block;
			vertical-align: middle;
		`,
	};
	const [trigger, menu] = React.Children.toArray(props.children);
	
	return (
		<div css={cls.root}>
			{trigger}
			{menu}
		</div>
	);
};