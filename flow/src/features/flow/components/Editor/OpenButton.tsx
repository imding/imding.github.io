
import React from 'react';
import { connect } from 'react-redux';
import { useFirestore } from 'react-redux-firebase';

import { MdFolder, MdFolderOpen } from 'react-icons/md';
import { Button, IButton } from '../../../../components/Panel/Header/Button';
import { toggleGraphBrowser } from '../../actions';

const mapStateToProps = (state: any) => ({
	isSaving: state.flowReducer.saveState,
	fetchState: state.flowReducer.fetchState,
	loginType: state.authReducer.loginType,
	uid: state.firebaseReducer.auth.uid,
});

const mapDispatchToProps = (dispatch: any) => ({
	toggleGraphBrowser: (graphBrowser: any) => dispatch(toggleGraphBrowser(graphBrowser))
});

const OpenButton: React.FC<any> = props => {
	const { isFetching } = props.fetchState || {};
	const firestore = useFirestore();
	const cfg: IButton = {
		icon: MdFolder,
		toggle: MdFolderOpen,
		size: 36,
		enabled: props.loginType === 2 && !props.isSaving && !isFetching,
		title: 'Open a graph',
		handler: isToggled => {
			const show = isToggled && !props.isSaving && !isFetching;
			props.toggleGraphBrowser({ show, graphs: null });

			if (isToggled) firestore.collection('user').doc(props.uid).get().then((doc: any) => {
				const contentMap = doc.data()!.content || {};
				const graphs = Object.entries(contentMap)
					.filter(([key, value]: any) => value.type === 'flowGraph')
					.sort()
					.map(([uid, value]: any) => {
						delete value.type;
						return Object.assign(value, { uid });
					});

				props.toggleGraphBrowser({ show, graphs });
			})
		}
	}

	return <Button {...cfg} />
};

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(OpenButton));