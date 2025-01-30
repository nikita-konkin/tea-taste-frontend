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

	postFormStage1(data, formId){

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


	postFormStage2Aroma(data, formId, brewId, aromaShadeId){

		return fetch(`${this._usersApiUrl}/my-aromas/${formId}/brew/${brewId}/aroma/${aromaShadeId}` ,{
			method: 'POST',
			credentials: 'include',
			headers: this._headers,
			body: JSON.stringify({
				aromaStage1: data
			})
		})
		.then(res=>{this.error(res)})
	}

	patchFormStage2Aroma(data, formId, brewId, aromaShadeId, aromaStageId){
		const key = 'aromaStage'+String(aromaStageId)
		const obj = {};

		obj[key] = data

		return fetch(`${this._usersApiUrl}/my-aromas/${formId}/brew/${brewId}/aroma/${aromaShadeId}` ,{
			method: 'PATCH',
			credentials: 'include',
			headers: this._headers,
			body: JSON.stringify(obj)
		})
		.then(res=>{this.error(res)})
	}

	postFormStage2Taste(data, formId, brewId, tasteShadeId){

		return fetch(`${this._usersApiUrl}/my-tastes/${formId}/brew/${brewId}/taste/${tasteShadeId}` ,{
			method: 'POST',
			credentials: 'include',
			headers: this._headers,
			body: JSON.stringify({
				tasteStage1: data
			})
		})
		.then(res=>{this.error(res)})
	}

	patchFormStage2Taste(data, formId, brewId, tasteShadeId, tasteStageId){
		const key = 'tasteStage'+String(tasteStageId)
		const obj = {};

		obj[key] = data
		console.log(obj)
		return fetch(`${this._usersApiUrl}/my-tastes/${formId}/brew/${brewId}/taste/${tasteShadeId}` ,{
			method: 'PATCH',
			credentials: 'include',
			headers: this._headers,
			body: JSON.stringify(obj)
		})
		.then(res=>{this.error(res)})
	}


	postFormStage2Brew(data, formId, brewId){
		console.log(data)
		return fetch(`${this._usersApiUrl}/my-brewings/${formId}/brew/${brewId}` ,{
			method: 'POST',
			credentials: 'include',
			headers: this._headers,
			body: JSON.stringify({
				description: data.description,
				brewingRating: data.brewingRating,
				brewingTime: data.brewingTime
			})
		})
		.then(res=>{
			console.log(res.brew)
			this.error(res)
		})
	}

	patchFormStage2Brew(data, formId, brewId){
		// const key = 'brewStage'+String(brewStageId)
		// const obj = {};

		// obj[key] = data

		return fetch(`${this._usersApiUrl}/my-brewings/${formId}/brew/${brewId}` ,{
			method: 'PATCH',
			credentials: 'include',
			headers: this._headers,
			// body: JSON.stringify(obj)
			body: JSON.stringify({
				description: data.description,
				brewingRating: data.brewingRating,
				brewingTime: data.brewingTime
			})
		})
		.then(res=>{this.error(res)})
	}

	getAllFromAromaDB() {

		return fetch(`${this._usersApiUrl}/aromadb`, {
		  method: 'GET',
		  credentials: 'include',
		  headers: this._headers
		}).then(res => this.error(res));
	
	  }

	getAllFromTasteDB() {

	return fetch(`${this._usersApiUrl}/tastedb`, {
		method: 'GET',
		credentials: 'include',
		headers: this._headers
	}).then(res => this.error(res));

	}

}

export const formApi = new FormApi({
  // usersApiUrl: 'https://api.movie.mesto.konkin.nomoredomains.work',
  usersApiUrl: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json'
  }
});