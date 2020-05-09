/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React from 'react';
import { connect } from 'react-redux';
// import { useFirestore } from 'react-redux-firebase';
// import moment from 'moment';
// import {
// 	MdSave,
// 	MdFolder,
// 	MdFolderOpen,
// 	MdGridOn,
// 	MdGridOff,
// 	MdYoutubeSearchedFor as MdResetView,
// } from 'react-icons/md';

// import { toggleGraphBrowser } from '../../flow/actions';
// import Panel, { IPanel } from '../../../components/Panel';

import { Panel, Header, Title, Options, IPanel } from './../../../components/Panel';
import { IHeader, Button } from './../../../components/Panel/Header/';
import { ITitle } from './../../../components/Panel/Header/Title';
import { IButton } from './../../../components/Panel/Header/Button';

import SaveButton from './Editor/SaveButton';

import { setGraphTitle, resolveGraph, updateOutput } from '../actions';
import { MdFolder, MdFolderOpen, MdSave } from 'react-icons/md';
import cuid from 'cuid';
import ReteEditor from './ReteEditor';

export interface IGraphEditor {
	// uid: string,
	// isEmpty: boolean,
	// toggleGraphBrowser: (arg: any) => any,
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
const mapStateToTitle = (state: any) => ({ [titleState]: state.flowReducer[titleState] });

const saveState: keyof IFlowReducer = 'graphJson';
const mapStateToSaveButton = (state: any) => ({ [saveState]: state.flowReducer[saveState] });

const authState: (keyof IAuth)[] = ['loginType'];
const mapStateToButton = (state: any) => Object.fromEntries(authState.map(key => [key, state.authReducer[key]]));

const editorState: (keyof IFlowReducer)[] = ['graphJson', 'htmlString'];
const mapStateToEditor = (state: any) => Object.fromEntries(editorState.map(key => [key, state.flowReducer[key]]));

const mapDispatchToEditor = (dispatch: any) => ({
	updateOutput: (htmlString: string) => dispatch(updateOutput(htmlString)),
});

const mapDispatchToProps = (dispatch: any) => ({
	// toggleGraphBrowser: (graphs: any) => dispatch(toggleGraphBrowser(graphs))
	updateOutput: (htmlString: string) => dispatch(updateOutput(htmlString)),
	setGraphTitle: (graphTitle: string) => dispatch(setGraphTitle(graphTitle)),
	resolveGraph: (graphJson: any) => dispatch(resolveGraph(graphJson))
});

const GraphEditor: React.FC<IGraphEditor> = props => {
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
		},
		onEdit: (text: string) => props.setGraphTitle(text)
	};
	// const buttonsCfg: IButton[] = [{
	// 	icon: MdFolder,
	// 	toggle: MdFolderOpen,
	// 	enabled: {
	// 		default: true,
	// 		state: authState[0],
	// 		stateTransform: stateValue => stateValue === 2
	// 	},
	// 	title: 'Open a previously saved graph',
	// 	handler: (isToggled: boolean, ) => {
	// 		if (authState[1]) return alert('Log in first');

	// 		if (isToggled) {
	// 			props.toggleGraphBrowser(null);
	// 		}
	// 		else firestore.collection('user').doc(props.uid).get().then((doc: any) => {
	// 			const contentMap = doc.data()!.content || [];
	// 			const graphs = Object.entries(contentMap)
	// 				.filter(([key, value]: any) => value.type === 'flowGraph')
	// 				.map(([key, value]: any) => {
	// 					delete value.type;
	// 					return Object.assign(value, { key });
	// 				});

	// 			props.toggleGraphBrowser(graphs);
	// 		});
	// 	}
	// }];


	console.log('render: <GraphEditor>')

	const GraphTitle = connect(mapStateToTitle)(Title);

	props.setGraphTitle('Untitled Graph');

	return (
		<Panel {...panelCfg}>
			<Header {...headerCfg}>
				<GraphTitle {...titleCfg} />
				<Options>
					<SaveButton />
				</Options>
			</Header>
			<ReteEditor
				useJson={(graphJson: any) => props.resolveGraph(graphJson)}
				useHtml={(htmlString: string) => props.updateOutput(htmlString)}
			/>
		</Panel>
		// <Panel {...panelCfg}>
		// 	<ReteEditor sync={cleanJson => json.current = cleanJson} />
		// 	<Popup />
		// </Panel>
	);
};

// export default GraphEditor;
export default connect(null, mapDispatchToProps)(React.memo(GraphEditor));
