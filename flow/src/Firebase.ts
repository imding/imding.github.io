import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

const fbConfig = {
	apiKey: "AIzaSyC9vwEzF5VUY3-O_z2uQMcZx-YPPBW8b3Q",
	authDomain: "optimal-card-275517.firebaseapp.com",
	databaseURL: "https://optimal-card-275517.firebaseio.com",
	projectId: "optimal-card-275517",
	storageBucket: "optimal-card-275517.appspot.com",
	messagingSenderId: "104004214282",
	appId: "1:104004214282:web:6c96da7ffd57723733c9f3",
	measurementId: "G-FN630FPVZ4"
};

firebase.initializeApp(fbConfig);
firebase.firestore();

export default firebase;