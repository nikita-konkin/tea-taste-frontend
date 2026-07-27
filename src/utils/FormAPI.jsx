import { readVoiceDraft } from './voiceDraft.js';

// Autocomplete values are {label, value} objects, plain strings when typed
// freely, or null when left empty. Returns undefined for anything unusable so
// JSON.stringify omits the key entirely rather than sending null.
const label = (option) => {
    if (!option) return undefined;
    if (typeof option === 'string') return option.trim() || undefined;
    return (option.label || '').trim() || undefined;
};

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
                // The Autocomplete fields default to null and, now that the
                // required rules are gone, can legitimately stay that way. Reading
                // .label off null threw a TypeError before fetch was even reached,
                // so the tasting was never created while its brewings and
                // descriptors — posted earlier in the same handler — were, leaving
                // orphans behind. JSON.stringify drops the undefined keys, and the
                // API treats every one of these as optional.
                body: JSON.stringify({
                    nameRU: label(data.teaName),
                    country: label(data.teaCountry),
                    shop: label(data.teaShop),
                    weight: data.teaWeight,
                    type: label(data.teaType),
                    water: label(data.waterBrand),
                    volume: data.waterVolume,
                    temperature: data.waterTemperature,
                    price: data.teaPrice,
                    teaware: label(data.teaWare),
                    brewingtype: label(data.brewingType),
                    averageRating: data.avrRaiting,
                    publicAccess: data.publicAccess,
                    photos: data.teaPhotos || [],
                    // Voice segments are not a field of either wizard step — both
                    // record into the shared draft, and this is where the two
                    // halves finally meet.
                    voice: { segments: readVoiceDraft() }
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
    // Creates a descriptor row carrying all three levels at once. The wizard's
    // postFormStage2Aroma only ever sends stage 1, but an extracted path can be
    // "Древесный → Кора → Дуб".
    //
    // The API upserts with $setOnInsert, so posting to an aromaId that already
    // exists silently does nothing — the caller must pick a free index and then
    // refetch to confirm the row actually landed.
    async postAromaStages(formId, brewId, aromaId, stages, publicAccess) {
        const response = await fetch(`${this._usersApiUrl}/my-aromas/${formId}/brew/${brewId}/aroma/${aromaId}`, {
            method: 'POST',
            credentials: 'include',
            headers: this._headers,
            body: JSON.stringify({ ...stages, publicAccess: Boolean(publicAccess) })
        });
        return this.error(response);
    }

    async postTasteStages(formId, brewId, tasteId, stages, publicAccess) {
        const response = await fetch(`${this._usersApiUrl}/my-tastes/${formId}/brew/${brewId}/taste/${tasteId}`, {
            method: 'POST',
            credentials: 'include',
            headers: this._headers,
            body: JSON.stringify({ ...stages, publicAccess: Boolean(publicAccess) })
        });
        return this.error(response);
    }

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