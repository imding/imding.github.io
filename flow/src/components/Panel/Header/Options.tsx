
/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React from 'react';

export const Options: React.FC = props => {
	const optionStyle = css`
		display: grid;
		grid-auto-flow: column;
		grid-gap: 7px;
	`;

	return (
		<div css={optionStyle}>
			{props.children}
		</div>
	);
};