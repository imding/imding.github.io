/** @jsx jsx */

import React from 'react';
import { jsx, css } from '@emotion/core';

import GraphEditor from './GraphEditor';
import GraphOutput from './Output';


const FlowView: React.FC = () => {
	const cls = {
		view: css`
			width: 100%;
			height: 100%;
			position: relative;
		`,
		loader: css`
			width: 100%;
			height: 100%;
			display: grid;
			place-items: center;
		`,
	};

	console.log('render: <FlowView>');

	return (
		<div css={cls.view}>
			<GraphEditor />
			<GraphOutput /> 
		</div>
	);
};

export default FlowView;

