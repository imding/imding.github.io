import React from 'react';

import GraphEditor from './GraphEditor';
import GraphOutput from './GraphOutput';

const FlowView = () => <div
	id='flow-view'
	style={{
		width: '100%',
		height: '100%',
		position: 'relative'
	}}
>
	<GraphEditor />
	<GraphOutput />
</div>;

export default FlowView;

