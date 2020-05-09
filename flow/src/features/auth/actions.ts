
export const toggleLoginView = (showLogin: boolean) => ({
	type: 'auth/TOGGLE_LOGIN_VIEW',
	payload: showLogin
});

export const setLoginType = (loginType: number) => ({
	type: 'auth/SET_LOGIN_TYPE',
	payload: loginType
});