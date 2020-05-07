
import React from 'react';
import { connect } from 'react-redux';
import { useFirebase, useFirestore } from 'react-redux-firebase';
import { MoonLoader } from 'react-spinners'
import Avatars from '@dicebear/avatars';
import sprites from '@dicebear/avatars-gridy-sprites';

import Dropdown, { IDropdownTrigger, IDropdownOption } from '../../components/Dropdown';
import defaultProfileImage from './user.svg';

export interface IFirebaseAuth {
	uid: string,
	displayName: string,
	email: string,
	photoURL: string,
	isLoaded: boolean,
	isEmpty: boolean
}

const mapStateToProps = (state: any) => {
	const { auth } = state.firebaseReducer;
	return {
		uid: auth.uid,
		displayName: auth.displayName,
		email: auth.email,
		photoURL: auth.photoURL,
		isLoaded: auth.isLoaded,
		isEmpty: auth.isEmpty
	};
};

const FirebaseAuth: React.FC<IFirebaseAuth> = props => {
	const firebase = useFirebase();
	const firestore = useFirestore();
	const trigger: IDropdownTrigger = {
		type: 'image',
		src: (props.isEmpty && defaultProfileImage)
			|| props.photoURL
			|| new Avatars(sprites, { base64: true, colorful: true }).create(props.uid),
		size: 40,
		margin: 15
	};
	const header = props.isEmpty ? 'Log In' : (props.displayName || 'Anonymous');
	const options: IDropdownOption[] = props.isEmpty
		? [{
			icon: 'google',
			text: 'Google',
			handler: () => firebase.login({ provider: 'google', type: 'popup' })
				.then(credential => {
					const { additionalUserInfo } = credential;
					const { isNewUser, profile } = additionalUserInfo!;
					const { given_name: givenName, family_name: familyName } = profile as any; 

					if (isNewUser) {
						firestore.collection('user').doc(props.uid).set({
							givenName,
							familyName,
							email: props.email,
							content: {}
						});
					}
				})
		}, {
			icon: 'anonymous',
			text: 'Anonymous',
			handler: () => firebase.auth().signInAnonymously()
		}]
		: [{
			icon: 'logout',
			text: 'Log out',
			handler: () => firebase.logout()
		}];

	console.log('render: <FirebaseAuth>', props.isLoaded);

	return props.isLoaded
		? <Dropdown trigger={trigger} header={header} options={options} />
		: <MoonLoader size={trigger.size * 0.6} color='white' />
};

export default connect(mapStateToProps)(FirebaseAuth);