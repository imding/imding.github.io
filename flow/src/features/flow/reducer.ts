
const initialState = {};

export const flowReducer = (state = initialState, action: any) => {
	switch (action.type) {
		case 'flow/TOGGLE_CODE_VIEWER':
			return {
				...state,
				showCode: action.payload
			};
		case 'flow/SET_SAVE_STATE':
			return {
				...state,
				saveState: action.payload
			};
		case 'flow/SET_FETCH_STATE':
			return {
				...state,
				fetchState: action.payload
			};
		case 'flow/TOGGLE_GRAPH_BROWSER':
			return {
				...state,
				graphBrowser: action.payload
			};
		case 'flow/SET_GRAPH_KEY':
			return {
				...state,
				graphKey: action.payload
			};
		case 'flow/SET_GRAPH_TITLE':
			return {
				...state,
				graphTitle: action.payload
			};
		case 'flow/RESOLVE_GRAPH':
			return {
				...state,
				graphJson: action.payload,
			};
		case 'flow/UPDATE_OUTPUT':
			return {
				...state,
				htmlString: action.payload.trim()
			};
		default: return state;
	}
};