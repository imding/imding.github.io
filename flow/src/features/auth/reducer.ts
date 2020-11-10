
const initialState = {};

export const authReducer = (state = initialState, action: any) => {
	switch (action.type) {
		case 'auth/TOGGLE_LOGIN_VIEW':
			return {
				...state,
				showLogin: action.payload
			};
		case 'auth/SET_LOGIN_TYPE':
			return {
				...state,
				loginType: action.payload
			};
		default: return state;
	}
};