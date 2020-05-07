import { combineReducers } from 'redux';
import { firebaseReducer } from 'react-redux-firebase';
import { authReducer  } from '../../features/auth/reducer';
import { flowReducer  } from '../../features/flow/reducer';

export default combineReducers({
	authReducer,
	flowReducer,
	firebaseReducer
});