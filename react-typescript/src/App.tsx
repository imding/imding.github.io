import React from 'react';
import defaultProfileImage from './user.svg';

import './App.css';

import FlowView from './features/flow/components/FlowView';

function App() {
	return (
		<div className="App">
			<header className="App-header">
				<img className="User-image" src={defaultProfileImage} alt="user" />
			</header>
			<main>
				<FlowView />
			</main>
		</div>
	);
}

export default App;
