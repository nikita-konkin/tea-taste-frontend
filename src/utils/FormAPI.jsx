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
                    nameRU: data.teaName.label,
                    country: data.teaCountry.label,
                    shop: data.teaShop.label,
                    weight: data.teaWeight,
                    type: data.teaType.label,
                    water: data.waterBrand.label,
                    volume: data.waterVolume,
                    temperature: data.waterTemperature,
                    price: data.teaPrice,
                    teaware: data.teaWare.label,
                    brewingtype: data.brewingType.label,
                    averageRating: data.avrRaiting,
                    publicAccess: data.publicAccess,
                    photos: data.teaPhotos || []
                })
            });
            return await this.error(response);
        } catch (error) {
            console.error('Error posting form stage 1:', error);
            throw error;
        }
    }

    async postFormStage2Aroma(data, formId, brewId, aromaShadeId, publicAccess) {
        try {
            const response = await fetch(`${this._usersApiUrl}/my-aromas/${formId}/brew/${brewId}/aroma/${aromaShadeId}`, {
                method: 'POST',
                credentials: 'include',
                headers: this._headers,
                body: JSON.stringify({
                    aromaStage1: data,
                    publicAccess: publicAccess
                })
            });
            return await this.error(response);
        } catch (error) {
            console.error('Error posting form stage 2 aroma:', error);
            throw error;
        }
    }

    async patchFormStage2Aroma(data, formId, brewId, aromaShadeId, aromaStageId, publicAccess) {
        const key = 'aromaStage' + String(aromaStageId);
        const obj = {};
        obj[key] = data;
        obj.publicAccess = publicAccess;

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

    async postFormStage2Taste(data, formId, brewId, tasteShadeId, publicAccess) {
        try {
            const response = await fetch(`${this._usersApiUrl}/my-tastes/${formId}/brew/${brewId}/taste/${tasteShadeId}`, {
                method: 'POST',
                credentials: 'include',
                headers: this._headers,
                body: JSON.stringify({
                    tasteStage1: data,
                    publicAccess: publicAccess
                })
            });
            return await this.error(response);
        } catch (error) {
            console.error('Error posting form stage 2 taste:', error);
            throw error;
        }
    }

    async patchFormStage2Taste(data, formId, brewId, tasteShadeId, tasteStageId, publicAccess) {
        const key = 'tasteStage' + String(tasteStageId);
        const obj = {};
        obj[key] = data;
        obj.publicAccess = publicAccess;

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

    async postFormStage2Brew(data, formId, brewId, publicAccess) {
        
        try {
            const response = await fetch(`${this._usersApiUrl}/my-brewings/${formId}/brew/${brewId}`, {
                method: 'POST',
                credentials: 'include',
                headers: this._headers,
                body: JSON.stringify({
                    description: data.description,
                    brewingRating: data.brewingRating,
                    brewingTime: data.brewingTime,
                    publicAccess: publicAccess
                })
            });
            return await this.error(response);
        } catch (error) {
            console.error('Error posting form stage 2 brew:', error);
            throw error;
        }
    }

    async patchFormStage2Brew(data, formId, brewId, publicAccess) {
        try {
            const response = await fetch(`${this._usersApiUrl}/my-brewings/${formId}/brew/${brewId}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: this._headers,
                body: JSON.stringify({
                    description: data.description,
                    brewingRating: data.brewingRating,
                    brewingTime: data.brewingTime,
                    publicAccess: publicAccess
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

    // params: { page, limit, type, sort } — see GET /public-forms on the API.
    async getAllPublicForms(params = {}) {
        try {
            const query = new URLSearchParams(
                Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
            ).toString();
            const response = await fetch(`${this._usersApiUrl}/public-forms${query ? `?${query}` : ''}`, {
                method: 'GET',
                credentials: 'include',
                headers: this._headers
            });
            return await this.error(response);
        } catch (error) {
            console.error('Error fetching all public forms:', error);
            throw error;
        }
    }

    async getPublicFormById(sessionId) {
        const response = await fetch(`${this._usersApiUrl}/public-form/${sessionId}`, {
            method: 'GET',
            headers: this._headers
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || `HTTP error! status: ${response.status}`);
        }
        return response.json();
    }

    // Quick-pick data for the Stage-2 descriptor picker.
    async getTopDescriptors() {
        const response = await fetch(`${this._usersApiUrl}/my-descriptors`, {
            method: 'GET',
            credentials: 'include',
            headers: this._headers
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    }

    // Deletes one brewing of a session together with its aromas/tastes.
    async delBrewSelective(sessionId, brewId) {
        const response = await fetch(`${this._usersApiUrl}/my-brewings/${sessionId}/brew/${brewId}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: this._headers
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || `HTTP error! status: ${response.status}`);
        }
        return response.json();
    }

    async getAllMyBrewingsById(brewId) {
        try {
            const response = await fetch(`${this._usersApiUrl}/my-brewings/${brewId}`, {
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

    async getPublicBrewingsById(brewId) {
        try {
            const response = await fetch(`${this._usersApiUrl}/public-brewings/${brewId}`, {
                method: 'GET',
                credentials: 'include',
                headers: this._headers
            });
            return await this.error(response);
        } catch (error) {
            console.error('Error fetching all public forms:', error);
            throw error;
        }
    }

    async getAllMyTastesById(tasteId) {
        try {
            const response = await fetch(`${this._usersApiUrl}/my-tastes/${tasteId}`, {
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

    async getPublicTastesById(tasteId) {
        try {
            const response = await fetch(`${this._usersApiUrl}/public-tastes/${tasteId}`, {
                method: 'GET',
                credentials: 'include',
                headers: this._headers
            });
            return await this.error(response);
        } catch (error) {
            console.error('Error fetching all public forms:', error);
            throw error;
        }
    }

    async getAllMyAromasById(aromaId) {
        try {
            const response = await fetch(`${this._usersApiUrl}/my-aromas/${aromaId}`, {
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

    async getPublicAromasById(aromaId) {
        try {
            const response = await fetch(`${this._usersApiUrl}/public-aromas/${aromaId}`, {
                method: 'GET',
                credentials: 'include',
                headers: this._headers
            });
            return await this.error(response);
        } catch (error) {
            console.error('Error fetching all public forms:', error);
            throw error;
        }
    }

    // Update several stages of one aroma record at once (used by the
    // edit dialog). Empty stages are omitted — the backend keeps them as-is.
    async patchAromaStages(formId, brewId, aromaId, stages) {
        const body = {};
        ['aromaStage1', 'aromaStage2', 'aromaStage3'].forEach((key) => {
            if (stages[key]) body[key] = stages[key];
        });
        const response = await fetch(`${this._usersApiUrl}/my-aromas/${formId}/brew/${brewId}/aroma/${aromaId}`, {
            method: 'PATCH',
            credentials: 'include',
            headers: this._headers,
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || `HTTP error! status: ${response.status}`);
        }
        return response.json();
    }

    async patchTasteStages(formId, brewId, tasteId, stages) {
        const body = {};
        ['tasteStage1', 'tasteStage2', 'tasteStage3'].forEach((key) => {
            if (stages[key]) body[key] = stages[key];
        });
        const response = await fetch(`${this._usersApiUrl}/my-tastes/${formId}/brew/${brewId}/taste/${tasteId}`, {
            method: 'PATCH',
            credentials: 'include',
            headers: this._headers,
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || `HTTP error! status: ${response.status}`);
        }
        return response.json();
    }

    // Full update of a tea form: body must contain every form field
    // (the backend validates the complete set on PATCH /create-form).
    async patchMyFormById(formId, body) {
        const response = await fetch(`${this._usersApiUrl}/create-form/${formId}`, {
            method: 'PATCH',
            credentials: 'include',
            headers: this._headers,
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || `HTTP error! status: ${response.status}`);
        }
        return response.json();
    }

    async delMyFormById(formId) {
        try {
            const response = await fetch(`${this._usersApiUrl}/my-form/${formId}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: this._headers
            });
            return await this.error(response);
        } catch (error) {
            console.error('Error fetching all froms:', error);
            throw error;
        }
    }

    async delMyBrewsById(brewId) {
        try {
            const response = await fetch(`${this._usersApiUrl}/my-brews/${brewId}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: this._headers
            });
            return await this.error(response);
        } catch (error) {
            console.error('Error fetching all froms:', error);
            throw error;
        }
    }

    async delMyTastesById(tasteId) {
        try {
            const response = await fetch(`${this._usersApiUrl}/my-tastes/${tasteId}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: this._headers
            });
            return await this.error(response);
        } catch (error) {
            console.error('Error fetching all froms:', error);
            throw error;
        }
    }


    async delMyAromasById(aromaId) {
        try {
            const response = await fetch(`${this._usersApiUrl}/my-aromas/${aromaId}`, {
                method: 'DELETE',
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
//   usersApiUrl: 'http://192.168.50.33:3000',
// usersApiUrl: 'http://192.168.137.1:3000',
//   usersApiUrl: 'http://localhost:3000',
    usersApiUrl: process.env.REACT_APP_API_URL || "/api",
    // usersApiUrl: process.env.REACT_APP_API_URL || "https://teaform.ru/api",
  headers: {
    'Content-Type': 'application/json'
  }
});