/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React from 'react';
import { connect } from 'react-redux';
import ReteEditor from './ReteEditor';

import { Panel, Header, Title, Options, IPanel } from './../../../components/Panel';
import { IHeader } from './../../../components/Panel/Header/';
import { ITitle } from './../../../components/Panel/Header/Title';

import SaveButton from './Editor/SaveButton';
import OpenButton from './Editor/OpenButton';
import GraphBrowser from './GraphBrowser';

import { setGraphTitle, resolveGraph, updateOutput } from '../actions';

export interface IGraphEditor {
	setGraphTitle: (text: string) => any,
	resolveGraph: (graphJson: any) => any,
	updateOutput: (htmlString: string) => any
};

interface IFlowReducer {
	graphTitle: string,
	graphKey: string,
	graphJson: any,
	htmlString: string
}

interface IAuth {
	loginType: number
};

interface IFirebaseReducer {
	auth: IAuth
}

const titleState: keyof IFlowReducer = 'graphTitle';
const panelCfg: IPanel = {
	style: css`
		width: calc(100% - 640px);
		height: 100%;
	`
};
const headerCfg: IHeader = {
	name: 'Graph Editor',
	height: 38,
};
const titleCfg: ITitle = {
	text: {
		default: 'Untitled Graph',
		state: titleState,
	}
};
const contentStyle = css`
	height: calc(100% - 38px);
	border: solid silver;
	border-width: 0 1px 1px 1px;
	border-radius: 0 0 6px 6px;
	overflow: hidden;
`;
const mapStateToTitle = (state: any) => ({ [titleState]: state.flowReducer[titleState] });
const mapDispatchToProps = (dispatch: any) => ({
	updateOutput: (htmlString: string) => dispatch(updateOutput(htmlString)),
	setGraphTitle: (graphTitle: string) => dispatch(setGraphTitle(graphTitle)),
	resolveGraph: (graphJson: any) => dispatch(resolveGraph(graphJson))
});
const GraphEditor: React.FC<IGraphEditor> = props => {
	console.log('render: <GraphEditor>')
	
	const GraphTitle = connect(mapStateToTitle)(Title);
	
	titleCfg.onEdit = (text: string) => props.setGraphTitle(text);
	props.setGraphTitle('Untitled Graph');

	return (
		<Panel {...panelCfg}>
			<Header {...headerCfg}>
				<GraphTitle {...titleCfg} />
				<Options>
					<OpenButton />
					<SaveButton />
				</Options>
			</Header>
			<div css={contentStyle}>
				<ReteEditor
					useJson={(graphJson: any) => props.resolveGraph(graphJson)}
					useHtml={(htmlString: string) => props.updateOutput(htmlString)}
				/>
				<GraphBrowser />
			</div>
		</Panel>
	);
};

export default connect(null, mapDispatchToProps)(React.memo(GraphEditor));
