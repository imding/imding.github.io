
import React from 'react';
import { connect } from 'react-redux';
import { useFirestore } from 'react-redux-firebase';

import moment from 'moment';
import { MdSave } from 'react-icons/md';
import { Button, IButton } from '../../../../components/Panel/Header/Button';
import { setGraphKey, setSaveState, toggleGraphBrowser } from '../../actions';

const mapStateToProps = (state: any) => ({
	isSaving: state.flowReducer.saveState,
	fetchState: state.flowReducer.fetchState,
	graphKey: state.flowReducer.graphKey,
	graphTitle: state.flowReducer.graphTitle,
	graphJson: state.flowReducer.graphJson,
	loginType: state.authReducer.loginType,
	uid: state.firebaseReducer.auth.uid
});

const mapDispatchToProps = (dispatch: any) => ({
	setGraphKey: (graphKey: string) => dispatch(setGraphKey(graphKey)),
	setSaveState: (isSaving: boolean) => dispatch(setSaveState(isSaving)),
	toggleGraphBrowser: (graphBrowser: any) => dispatch(toggleGraphBrowser(graphBrowser))
});

const SaveButton: React.FC<any> = props => {
	const { isFetching } = props.fetchState || {};
	const firestore = useFirestore();
	const updateMeta = (id: string, timestamp: any) => {
		props.setGraphKey(id);

		firestore.collection('user').doc(props.uid).update({
			[`content.${id}`]: {
				type: 'flowGraph',
				title: props.graphTitle,
				created: timestamp
			}
		}).then(() => props.setSaveState(false));
	};
	const cfg: IButton = {
		icon: MdSave,
		size: 36,
		enabled: props.loginType === 2
			&& props.graphJson
			&& !props.isSaving
			&& !isFetching,
		title: 'Save this graph',
		handler: () => {
			const timestamp = moment().toDate();
			const dbContent = firestore.collection('userContent');
			const mergeSave = () => dbContent.doc(props.graphKey!).set({
				lastEdited: timestamp,
				title: props.graphTitle,
				json: props.graphJson
			}, { merge: true }).then(() => updateMeta(props.graphKey, timestamp));
			const newSave = () => {
				dbContent.add({
					authorId: props.uid,
					created: timestamp,
					title: props.graphTitle,
					json: props.graphJson,
				}).then((docRef: any) => updateMeta(docRef.id, timestamp));
			}

			props.toggleGraphBrowser({ show: false, graphs: null });
			props.setSaveState(true);
			props.graphKey ? mergeSave() : newSave();
		}
	};

	return <Button {...cfg} />
};

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(SaveButton)); 