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


}

export const mainApi = new MainApi({
	// usersApiUrl: 'https://api.movie.mesto.konkin.nomoredomains.work',
	  usersApiUrl: 'http://192.168.50.33:3000',
	//   usersApiUrl: 'http://192.168.137.1:3000',
	
	// usersApiUrl: 'http://localhost:3000',
	headers: {
		'Content-Type': 'application/json'
	}
});