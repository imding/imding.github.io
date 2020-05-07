
const initialState = {};

export const authReducer = (state = initialState, action: any) => {
	switch (action.type) {
		case 'auth/TOGGLE_LOGIN_VIEW':
			return {
				...state,
				showLogin: action.payload
			};
		default: return state;
	}
};