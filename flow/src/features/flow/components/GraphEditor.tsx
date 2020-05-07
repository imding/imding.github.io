/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React, { useRef } from 'react';
import { connect } from 'react-redux';
import { useFirestore } from 'react-redux-firebase';
import moment from 'moment';
import {
	MdSave,
	MdFolder,
	MdFolderOpen,
	MdGridOn,
	MdGridOff,
	MdYoutubeSearchedFor as MdResetView,
} from 'react-icons/md';

import { toggleGraphBrowser } from '../../flow/actions';
import Panel, { IPanel } from '../../../components/Panel';

export interface IGraphEditor {
	uid: string,
	isEmpty: boolean,
	toggleGraphBrowser: (arg: any) => any,
};

const mapStateToProps = (state: any) => {
	const { auth } = state.firebaseReducer;

	return {
		uid: auth.uid,
		isEmpty: auth.isEmpty
	};
};

const mapDispatchToProps = (dispatch: any) => ({
	toggleGraphBrowser: (graphs: any) => dispatch(toggleGraphBrowser(graphs))
});

const GraphEditor: React.FC<IGraphEditor> = props => {
	const firestore = useFirestore();
	const key = useRef<null | string>(null);
	const title = useRef('Untitled Graph');
	const json = useRef();
	const openHandler = (isToggled: boolean) => {
		if (props.isEmpty) return alert('Log in first');

		if (isToggled) {
			props.toggleGraphBrowser(null);
		}
		else firestore.collection('user').doc(props.uid).get().then((doc: any) => {
			const contentMap = doc.data()!.content || [];
			const graphs = Object.entries(contentMap)
				.filter(([key, value]: any) => value.type === 'flowGraph')
				.map(([key, value]: any) => {
					delete value.type;
					return Object.assign(value, { key });
				});

			props.toggleGraphBrowser(graphs);
		});
	};
	const saveHandler = () => {
		if (props.isEmpty) return alert('Log in first');

		const timestamp = moment().toDate();
		const dbContent = firestore.collection('userContent');
		const mergeSave = () => dbContent.doc(key.current!).set({
			lastEdited: timestamp,
			title: title.current,
			json: json.current
		}, { merge: true });
		const newSave = () => dbContent.add({
			authorId: props.uid,
			created: timestamp,
			title: title.current,
			json: json.current,
		}).then((docRef: any) => {
			key.current = docRef.id;
			firestore.collection('user').doc(props.uid).update({
				[`content.${docRef.id}`]: {
					type: 'flowGraph',
					title: title.current,
					created: timestamp
				}
			});
		});

		key.current ? mergeSave() : newSave();
	};
	const panelCfg: IPanel = {
		style: css`
			width: calc(100% - 640px);
			height: 100%;
		`,
		header: { height: 38 },
		name: 'Graph Editor',
		title: {
			text: title.current,
			editable: true,
			sync: text => title.current = text
		},
		options: [{
			icon: MdFolder,
			toggle: MdFolderOpen,
			title: 'Open a previously saved graph',
			handler: openHandler
		}, {
			icon: MdGridOff,
			toggle: MdGridOn,
			title: 'Toggle editor background grid'
		}, {
			icon: MdResetView,
			title: 'Reset graph view'
		}, {
			icon: MdSave,
			title: 'Save the graph',
			handler: saveHandler
		}],
	};

	console.log('render: <GraphEditor>')

	return (
		<Panel {...panelCfg}>
			{/* <ReteEditor sync={cleanJson => json.current = cleanJson} />
			<Popup /> */}
		</Panel>
	);
};

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(GraphEditor));
