
const initialState = {};

export const flowReducer = (state = initialState, action: any) => {
	switch (action.type) {
		case 'flow/TOGGLE_GRAPH_BROWSER':
			return {
				...state,
				graphs: action.payload
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