class MainApi {
	constructor(config) {
		this._headers = config.headers;
		this._usersApiUrl = config.usersApiUrl
	}

	error(res) {
		// console.log(res.json())
		if (res.ok) {
			return res.json();
		}

		// return Promise.reject({ error: res.json() })
		return res.json().then((err) => {
			// console.log(err)
			throw err;
		  });
	}

	handleTokenValidation(JWT) {

		return fetch(`${this._usersApiUrl}/profile/me`, {
			method: 'GET',
			credentials: 'include',
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${JWT}`
			}
		}).then(res => this.error(res));

	}

	handleRegistration(name, pass, email) {

		return fetch(`${this._usersApiUrl}/sign-up`, {
			method: 'POST',
			headers: this._headers,
			body: JSON.stringify({
				name: name,
				email: email,
				password: pass
			})
		})
		  .then(res => this.error(res))
		  .catch((error) => {
			// console.error('Error:', error);
			throw error; // Re-throw the error to be handled by the calling function
		  });
  
	}

	handleAuthorization(email, pass) {

		return fetch(`${this._usersApiUrl}/sign-in`, {
			method: 'POST',
			credentials: 'include',
			headers: this._headers,
			body: JSON.stringify({
				email: email,
				password: pass
			})
		})
		.then(res => this.error(res))
		  .catch((error) => {
			// console.error('Error:', error);
			throw error; // Re-throw the error to be handled by the calling function
		  });

	}

	handleLogOut() {

		return fetch(`${this._usersApiUrl}/sign-out`, {
			method: 'POST',
			credentials: 'include',
			headers: this._headers
		})
		.then(res => this.error(res))
		  .catch((error) => {
			throw error; // Re-throw the error to be handled by the calling function
		  });

	}

	getProfile() {

		return fetch(`${this._usersApiUrl}/profile/me`, {
			method: 'GET',
			credentials: 'include',
			headers: this._headers
		}).then(res => this.error(res));

	}

	updateProfile(data) {

		return fetch(`${this._usersApiUrl}/profile/me`, {
			method: 'PATCH',
			credentials: 'include',
			headers: this._headers,
			body: JSON.stringify(data)
		}).then(res => this.error(res));

	}

	uploadAvatar(file) {

		const formData = new FormData();
		formData.append('avatar', file);

		// No Content-Type header: the browser sets the multipart boundary.
		return fetch(`${this._usersApiUrl}/profile/avatar`, {
			method: 'POST',
			credentials: 'include',
			body: formData
		}).then(res => this.error(res));

	}

	requestPasswordReset(email) {

		return fetch(`${this._usersApiUrl}/password-reset/request`, {
			method: 'POST',
			headers: this._headers,
			body: JSON.stringify({ email: email })
		}).then(res => this.error(res));

	}

	confirmPasswordReset(token, newPassword) {

		return fetch(`${this._usersApiUrl}/password-reset/confirm`, {
			method: 'POST',
			headers: this._headers,
			body: JSON.stringify({ token: token, newPassword: newPassword })
		}).then(res => this.error(res));

	}

	adminGetUsers() {

		return fetch(`${this._usersApiUrl}/admin/users`, {
			method: 'GET',
			credentials: 'include',
			headers: this._headers
		}).then(res => this.error(res));

	}

	adminSetUserRole(id, role) {

		return fetch(`${this._usersApiUrl}/admin/users/${id}/role`, {
			method: 'PATCH',
			credentials: 'include',
			headers: this._headers,
			body: JSON.stringify({ role: role })
		}).then(res => this.error(res));

	}

	adminDeleteUser(id) {

		return fetch(`${this._usersApiUrl}/admin/users/${id}`, {
			method: 'DELETE',
			credentials: 'include',
			headers: this._headers
		}).then(res => this.error(res));

	}

	updatePassword(oldPassword, newPassword) {

		return fetch(`${this._usersApiUrl}/profile/password`, {
			method: 'PATCH',
			credentials: 'include',
			headers: this._headers,
			body: JSON.stringify({
				oldPassword: oldPassword,
				newPassword: newPassword
			})
		}).then(res => this.error(res));

	}

}

export const mainApi = new MainApi({
	// usersApiUrl: 'https://api.movie.mesto.konkin.nomoredomains.work',
	//   usersApiUrl: 'http://192.168.50.33:3000',
	//   usersApiUrl: 'http://192.168.137.1:3000',
	// usersApiUrl: 'http://localhost:3000',
	usersApiUrl: process.env.REACT_APP_API_URL || "/api",
	// usersApiUrl: process.env.REACT_APP_API_URL || "https://teaform.ru/api",
	headers: {
		'Content-Type': 'application/json'
	}
});