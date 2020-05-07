/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { connect } from 'react-redux';
import React from 'react';

export interface IPopup {
	graphs: any
}

const mapStateToProps = (state: any) => {
	const { graphs } = state.flowReducer;
	return { graphs };
};

const Popup: React.FC<IPopup> = props => {
	const cls = {
		card: css`
			position: absolute;
			right: 5px;
			top: 5px;
			border-radius: 5px;
			color: ghostwhite;
			background-color: dimgray;
			overflow: hidden;
		`,
		header: css`
			padding: 8px 12px;
			border: solid rgba(0, 0, 0, 0.4);
			border-width: 0 0 1px 0;
			background-color: #444;
		`
	};

	return (
		props.graphs
			? <div css={cls.card}>
				<h5 css={cls.header}>hello</h5>
				{props.graphs.map((graph: any) => {
					return (
						<div key={graph.key}>
							<p>{graph.title}</p>
							{/* <p>{graph.created}</p> */}
						</div>
					);
				})}
			</div>
			: <div />
	);
};

export default connect(mapStateToProps)(React.memo(Popup));