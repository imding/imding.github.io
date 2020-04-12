
const initialState = {
	nodes: {}
}

export const flowReducer = (state = initialState, action: any) => {
	switch (action.type) {
		case 'flow/RESOLVE_GRAPH': 
			return {
				...state,
				nodes: action.payload
			};
		case 'flow/UPDATE_OUTPUT':
			return {
				...state,
				update: action.payload
			};
		default: return state;
	}
};