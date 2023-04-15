class MainApi{
	constructor(config){
		this._headers = config.headers;
		this._usersApiUrl = config.usersApiUrl
	}

	error(res){
		if (res.ok){
			return res.json();
		}

		return Promise.reject({error: res.status})
	}


	handleRegistration(name, pass, email){
		console.log(pass)
		return fetch(`${this._usersApiUrl}/sign-up`, {
			method: 'POST',
			// credentials: 'include',
			headers: this._headers,
			body: JSON.stringify({
				name:name,
				email:email,
				password:pass
			})
		})
		.then(res => this.error(res))

	}


}

export const mainApi = new MainApi({
  // usersApiUrl: 'https://api.movie.mesto.konkin.nomoredomains.work',
  usersApiUrl: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json'
  }
});