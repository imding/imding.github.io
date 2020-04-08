import React from 'react';
import { useSelector } from 'react-redux';
import { makeSource } from '../../../utils';


const GraphOutput = () => {
	const srcdoc = useSelector((state: any) => state.flowReducer.srcdoc);

	return <iframe id='graph-output' title='Graph Output' srcDoc={srcdoc || makeSource('', '<h1>Flow</h1>')} />;
};

export default GraphOutput;