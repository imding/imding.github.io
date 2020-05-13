
import React from 'react';
import { connect } from 'react-redux';
import { useFirebase, useFirestore } from 'react-redux-firebase';
import { MoonLoader } from 'react-spinners'
import Avatars from '@dicebear/avatars';
import sprites from '@dicebear/avatars-gridy-sprites';

import Dropdown, { IDropdownTrigger, IDropdownOption } from '../../components/Dropdown';
import defaultProfileImage from './user.svg';
import { setLoginType } from './actions';

export interface IFirebaseAuth {
	uid: string,
	displayName: string,
	email: string,
	photoURL: string,
	isAnonymous: boolean,
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
		isAnonymous: auth.isAnonymous,
		isLoaded: auth.isLoaded,
		isEmpty: auth.isEmpty
	};
};

const mapDispatchToProps = (dispatch: any) => ({
	setLoginType: (loginType: number) => dispatch(setLoginType(loginType))
});

const FirebaseAuth: React.FC<any> = props => {
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
					const { additionalUserInfo, user } = credential;
					const { isNewUser, profile } = additionalUserInfo!;
					const { given_name: givenName, family_name: familyName, email } = profile as any;
console.log(credential);
					if (isNewUser) {
						firestore.collection('user').doc(user!.uid).set({
							givenName,
							familyName,
							email,
							content: {}
						});
					}
				})
				.catch(err => {
					console.warn(`Login unsuccessful: ${err.code}`, err)
				})
		// }, {
		// 	icon: 'anonymous',
		// 	text: 'Anonymous',
		// 	handler: () => firebase.auth().signInAnonymously()
		}]
		: [{
			icon: 'logout',
			text: 'Log out',
			handler: () => firebase.logout()
		}];

	console.log('render: <FirebaseAuth>', props.isLoaded);

	const unsubscribe = firebase.auth().onAuthStateChanged(data => {
		const loginType = data === null ? 0 : data.isAnonymous ? 1 : 2;
		props.setLoginType(loginType);
		unsubscribe();
	});

	return props.isLoaded
		? <Dropdown trigger={trigger} header={header} options={options} />
		: <MoonLoader size={trigger.size * 0.6} color='white' />
};

export default connect(mapStateToProps, mapDispatchToProps)(FirebaseAuth);