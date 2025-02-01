class FormApi {
    constructor(config) {
        this._headers = config.headers;
        this._usersApiUrl = config.usersApiUrl;
    }

    async error(res) {
        if (res.ok) {
            return res.json();
        }
        throw new Error(`HTTP error! status: ${res.status}`);
    }

    async postFormStage1(data, formId) {
        try {
            const response = await fetch(`${this._usersApiUrl}/create-form/${formId}`, {
                method: 'POST',
                credentials: 'include',
                headers: this._headers,
                body: JSON.stringify({
                    nameRU: data.teaName,
                    type: data.teaType.label,
                    weight: data.teaWeight,
                    water: data.waterBrand.label,
                    volume: data.waterVolume,
                    temperature: data.waterTemperature,
                    teaware: data.teaWare.label,
                    brewingtype: data.brewingType.label,
                    country: data.teaCountry.label
                })
            });
            return await this.error(response);
        } catch (error) {
            console.error('Error posting form stage 1:', error);
            throw error;
        }
    }

    async postFormStage2Aroma(data, formId, brewId, aromaShadeId) {
        try {
            const response = await fetch(`${this._usersApiUrl}/my-aromas/${formId}/brew/${brewId}/aroma/${aromaShadeId}`, {
                method: 'POST',
                credentials: 'include',
                headers: this._headers,
                body: JSON.stringify({
                    aromaStage1: data
                })
            });
            return await this.error(response);
        } catch (error) {
            console.error('Error posting form stage 2 aroma:', error);
            throw error;
        }
    }

    async patchFormStage2Aroma(data, formId, brewId, aromaShadeId, aromaStageId) {
        const key = 'aromaStage' + String(aromaStageId);
        const obj = {};
        obj[key] = data;

        try {
            const response = await fetch(`${this._usersApiUrl}/my-aromas/${formId}/brew/${brewId}/aroma/${aromaShadeId}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: this._headers,
                body: JSON.stringify(obj)
            });
            return await this.error(response);
        } catch (error) {
            console.error('Error patching form stage 2 aroma:', error);
            throw error;
        }
    }

    async postFormStage2Taste(data, formId, brewId, tasteShadeId) {
        try {
            const response = await fetch(`${this._usersApiUrl}/my-tastes/${formId}/brew/${brewId}/taste/${tasteShadeId}`, {
                method: 'POST',
                credentials: 'include',
                headers: this._headers,
                body: JSON.stringify({
                    tasteStage1: data
                })
            });
            return await this.error(response);
        } catch (error) {
            console.error('Error posting form stage 2 taste:', error);
            throw error;
        }
    }

    async patchFormStage2Taste(data, formId, brewId, tasteShadeId, tasteStageId) {
        const key = 'tasteStage' + String(tasteStageId);
        const obj = {};
        obj[key] = data;

        try {
            const response = await fetch(`${this._usersApiUrl}/my-tastes/${formId}/brew/${brewId}/taste/${tasteShadeId}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: this._headers,
                body: JSON.stringify(obj)
            });
            return await this.error(response);
        } catch (error) {
            console.error('Error patching form stage 2 taste:', error);
            throw error;
        }
    }

    async postFormStage2Brew(data, formId, brewId) {
        try {
            const response = await fetch(`${this._usersApiUrl}/my-brewings/${formId}/brew/${brewId}`, {
                method: 'POST',
                credentials: 'include',
                headers: this._headers,
                body: JSON.stringify({
                    description: data.description,
                    brewingRating: data.brewingRating,
                    brewingTime: data.brewingTime
                })
            });
            return await this.error(response);
        } catch (error) {
            console.error('Error posting form stage 2 brew:', error);
            throw error;
        }
    }

    async patchFormStage2Brew(data, formId, brewId) {
        try {
            const response = await fetch(`${this._usersApiUrl}/my-brewings/${formId}/brew/${brewId}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: this._headers,
                body: JSON.stringify({
                    description: data.description,
                    brewingRating: data.brewingRating,
                    brewingTime: data.brewingTime
                })
            });
            return await this.error(response);
        } catch (error) {
            console.error('Error patching form stage 2 brew:', error);
            throw error;
        }
    }

    async getAllFromAromaDB() {
        try {
            const response = await fetch(`${this._usersApiUrl}/aromadb`, {
                method: 'GET',
                credentials: 'include',
                headers: this._headers
            });
            return await this.error(response);
        } catch (error) {
            console.error('Error fetching all from aroma DB:', error);
            throw error;
        }
    }

    async getAllFromTasteDB() {
        try {
            const response = await fetch(`${this._usersApiUrl}/tastedb`, {
                method: 'GET',
                credentials: 'include',
                headers: this._headers
            });
            return await this.error(response);
        } catch (error) {
            console.error('Error fetching all from taste DB:', error);
            throw error;
        }
    }
    async getAllMyForms() {
        try {
            const response = await fetch(`${this._usersApiUrl}/my-forms`, {
                method: 'GET',
                credentials: 'include',
                headers: this._headers
            });
            return await this.error(response);
        } catch (error) {
            console.error('Error fetching all froms:', error);
            throw error;
        }
    }

}

export const formApi = new FormApi({
  // usersApiUrl: 'https://api.movie.mesto.konkin.nomoredomains.work',
  usersApiUrl: 'http://192.168.50.33:3000',
//   usersApiUrl: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json'
  }
});