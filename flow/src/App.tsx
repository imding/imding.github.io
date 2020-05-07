import React from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';

import FirebaseAuth from './features/auth';
import FlowView from './features/flow/components/FlowView';

import './App.css';


export default () => {
	console.log('render: <App>');

	return (
		<div className='App'>
			<header className='App-header'>
				<span />
				<FirebaseAuth />
			</header>
			<main>
				<BrowserRouter>
					<Switch>
						<Route exact path='/'>
							<Redirect to='/flow' />
						</Route>
						<Route exact path='/flow'>
							<FlowView />
						</Route>
						<Redirect to='/' />
					</Switch>
				</BrowserRouter>
			</main>
		</div >
	);
};
