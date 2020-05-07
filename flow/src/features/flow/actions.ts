

export const toggleGraphBrowser = (graphs: any) => ({
	type: 'flow/TOGGLE_GRAPH_BROWSER',
	payload: graphs
});

export const setGraphKey = (graphKey: string) => ({
	type: 'flow/SET_GRAPH_KEY',
	payload: graphKey
});

export const setGraphTitle = (title: string) => ({
	type: 'flow/SET_GRAPH_TITLE',
	payload: title
});

export const resolveGraph = (graphJson: any) => ({
	type: 'flow/RESOLVE_GRAPH',
	payload: graphJson
});

export const updateOutput = (htmlString: string) => ({
	type: 'flow/UPDATE_OUTPUT',
	payload: htmlString
});