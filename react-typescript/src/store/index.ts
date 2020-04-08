import { createStore, combineReducers } from 'redux';

import { flowReducer  } from '../features/flow/reducer';

const rootReducer = combineReducers({
	flowReducer 
});

const store = createStore(
	rootReducer,
	(window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__()
);

export default store;