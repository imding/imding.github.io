import React from 'react';
import { useSelector } from 'react-redux';
import { makeSource } from '../../../utils';


const GraphOutput = () => {
	const update = useSelector((state: any) => state.flowReducer.update);
	const srcdoc = update && update.srcdoc.trim().length && update.srcdoc;

	return <iframe id='graph-output' title='Graph Output' srcDoc={srcdoc || makeSource('', '<h1>Flow</h1>')} />;
};

export default GraphOutput;