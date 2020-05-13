

export interface IGraphMeta {
	created: string,
	title: string,
	uid: string
}
interface IGraphBrowser {
	show: boolean,
	graphs?: IGraphMeta[]
}

export interface IFetchGraph {
	isFetching: boolean,
	jsonResponse: any
}

export const toggleCodeViewer = (showCode: boolean) => ({
	type: 'flow/TOGGLE_CODE_VIEWER',
	payload: showCode
});

export const setSaveState = (isSaving: boolean) => ({
	type: 'flow/SET_SAVE_STATE',
	payload: isSaving
});

export const setFetchState = (fetchState: IFetchGraph) => ({
	type: 'flow/SET_FETCH_STATE',
	payload: fetchState
});

export const toggleGraphBrowser = (graphBrowser: IGraphBrowser) => ({
	type: 'flow/TOGGLE_GRAPH_BROWSER',
	payload: graphBrowser
});

export const setGraphKey = (graphKey: string) => ({
	type: 'flow/SET_GRAPH_KEY',
	payload: graphKey
});

export const setGraphTitle = (graphTitle: string) => ({
	type: 'flow/SET_GRAPH_TITLE',
	payload: graphTitle
});

export const resolveGraph = (graphJson: any) => ({
	type: 'flow/RESOLVE_GRAPH',
	payload: graphJson
});

export const updateOutput = (htmlString: string) => ({
	type: 'flow/UPDATE_OUTPUT',
	payload: htmlString
}); 