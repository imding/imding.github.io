
import React from 'react';
import { connect } from 'react-redux';
import { useFirestore } from 'react-redux-firebase';

import moment from 'moment';
import { MdSave } from 'react-icons/md';
import { Button, IButton } from '../../../../components/Panel/Header/Button';
import { setGraphKey } from '../../actions';

const mapStateToProps = (state: any) => ({
	graphKey: state.flowReducer.graphKey,
	graphTitle: state.flowReducer.graphTitle,
	graphJson: state.flowReducer.graphJson,
	loginType: state.authReducer.loginType,
	uid: state.firebaseReducer.auth.uid,
});

const mapDispatchToProps = (dispatch: any) => ({
	setGraphKey: (graphKey: string) => dispatch(setGraphKey(graphKey))
});

const SaveButton: React.FC<any> = props => {
	const firestore = useFirestore();
	const cfg: IButton = {
		icon: MdSave,
		size: 36,
		enabled: props.loginType === 2,
		title: 'Save this graph',
		handler: () => {
			if (props.isEmpty) return alert('Log in first');

			const timestamp = moment().toDate();
			const dbContent = firestore.collection('userContent');
			const mergeSave = () => dbContent.doc(props.graphKey!).set({
				lastEdited: timestamp,
				title: props.graphTitle,
				json: props.graphJson
			}, { merge: true });
			const newSave = () => {
				dbContent.add({
					authorId: props.uid,
					created: timestamp,
					title: props.graphTitle,
					json: props.graphJson,
				}).then((docRef: any) => {
					props.setGraphKey(docRef.id);
					firestore.collection('user').doc(props.uid).update({
						[`content.${docRef.id}`]: {
							type: 'flowGraph',
							title: props.graphTitle,
							created: timestamp
						}
					});
				});
			}

			props.graphKey ? mergeSave() : newSave();
		}
	};

	return <Button {...cfg} />
};

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(SaveButton)); 