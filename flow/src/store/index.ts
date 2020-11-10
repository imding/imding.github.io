import { compose, createStore } from 'redux';

import rootReducer from './reducers';

const composeEnhancers = process.env.NODE_ENV === 'development'
	? (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
	: compose;

export default createStore(
	rootReducer,
	composeEnhancers()
);