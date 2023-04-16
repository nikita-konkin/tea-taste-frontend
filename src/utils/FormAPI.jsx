class FormApi{
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

	postFormMainData(data, formId){

		return fetch(`${this._usersApiUrl}/create-form/${(formId)}` ,{
			method: 'POST',
			credentials: 'include',
			headers: this._headers,
			body: JSON.stringify({
				nameRU: data.teaName,
				type: data.teaType,
				weight: data.teaWeight,
				water: data.waterBrand,
				volume: data.waterVolume,
				temperature: data.waterTemperature,
				teaware: data.teaWare,
				brewingtype: data.brewingType,
				country: data.teaCountry
			})
		})
		.then(res=>{this.error(res)})
	}


}

export const formApi = new FormApi({
  // usersApiUrl: 'https://api.movie.mesto.konkin.nomoredomains.work',
  usersApiUrl: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json'
  }
});