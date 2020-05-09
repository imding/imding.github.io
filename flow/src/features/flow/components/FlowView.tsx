/** @jsx jsx */

import React from 'react';
import { connect } from 'react-redux';
import { jsx, css } from '@emotion/core';
import { FadeLoader } from 'react-spinners'

import GraphEditor from './GraphEditor';
import GraphOutput from './GraphOutput';

export interface IFlowView {
	isLoaded: boolean
}

const mapStateToProps = (state: any) => {
	const { auth } = state.firebaseReducer;
	return { isLoaded: auth.isLoaded };
};

const FlowView: React.FC<IFlowView> = props => {
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

	console.log('render: <FlowView>', props.isLoaded);

	return props.isLoaded
		? <div css={cls.view}>
			<GraphEditor />
			{/* <GraphOutput /> */}
		</div>
		: <div css={cls.loader}>
			<FadeLoader color='dimgray' />
		</div>;
};

export default connect(mapStateToProps)(FlowView);

