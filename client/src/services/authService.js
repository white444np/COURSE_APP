import api from '../api';

export async function signup(credentials) {
	const { data } = await api.post('/auth/signup', credentials);
	return data;
}

export async function login(credentials) {
	const { data } = await api.post('/auth/login', credentials);
	return data;
}

export async function forgotPassword(payload) {
	const { data } = await api.post('/auth/forgot-password', payload);
	return data;
}

export async function resetPassword(payload) {
	const { data } = await api.post('/auth/reset-password', payload);
	return data;
}

export async function me() {
	const { data } = await api.get('/auth/me');
	return data;
}
