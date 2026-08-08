import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageMeta from './PageMeta.jsx';

import { usePopup } from './PopupContext';
import Header from './Header';
import { mainApi } from '../utils/MainAPI.jsx';

import PopupButton from './PopupButton.jsx';
import { useT } from '../i18n/index.js';

// See Login.jsx: the locale has to travel as a query parameter because this
// leaves the app entirely.
const vkAuthUrl = (locale) => `${process.env.REACT_APP_API_URL || '/api'}/auth/vk?locale=${locale}`;

function Registration({ auth, popupContent }) {


	const { openPopup } = usePopup();
	const { t, url, locale } = useT();
	// null while unknown: assume open, because the server refuses on its own
	// anyway. Hiding the form on a failed check would lock people out of a
	// working site over one dropped request.
	const [registrationOpen, setRegistrationOpen] = useState(null);
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		password1: '',
		password2: '',

	})

	useEffect(() => {
		mainApi.getPublicSettings()
			.then((res) => setRegistrationOpen(res.data.registrationOpen !== false))
			.catch(() => setRegistrationOpen(true));
	}, []);

	const handleForm = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		})
	}


	function handleOnSubmit(e) {
		e.preventDefault()

		if (formData.password1 === formData.password2) {

			auth({
				name: formData.name,
				pass: formData.password1,
				email: formData.email,
			})

		} else {
			openPopup(t('auth.passwordsDiffer'));
		}

	}


	return (
		<>
			<PageMeta title={t('auth.signUp')} path="/sign-up" noIndex
				description={t('auth.signUpDescription')} />
			<Header />
			<form className="registration" onSubmit={handleOnSubmit}>
				<h1 className="registration__header">{t('auth.signUp')}</h1>
				<div className="registration__fields-box">
					{registrationOpen === false ? (
						<>
							<h2 className="registration__check-text" style={{ lineHeight: 1.4 }}>
								{t('auth.signUpClosed')}
							</h2>
							<Link className="registration__check-text_link" to={url('/sign-in')}>{t('auth.signInAction')}</Link>
						</>
					) : (
					<>
					<input className="registration__name" type="text"
						name="name" placeholder={t('auth.name')}
						onChange={e => handleForm(e)}
						minLength={2} maxLength={30} required />
					<input className="registration__email" type="text"
						name="email" placeholder={t('auth.email')}
						onChange={e => handleForm(e)}
						minLength={2} maxLength={30} required />
					<input className="registration__pass"
						type="password" name="password1"
						onChange={e => handleForm(e)}
						placeholder={t('auth.password')} required />
					<input className="registration__pass"
						type="password" name="password2"
						onChange={e => handleForm(e)}
						placeholder={t('auth.repeatPassword')} required />
					{/* <Test/> */}
					<button type="submit" className="registration__submit">{t('auth.signUpAction')}</button>
					<button type="button" className="registration__submit"
						style={{ background: 'rgba(0, 119, 255, 0.45)', border: '1px solid rgba(255, 255, 255, 0.35)', margin: '14px 0 0 0' }}
						onClick={() => { window.location.href = vkAuthUrl(locale); }}>
						{t('auth.continueVk')}
					</button>

					<h2 className="registration__check-text">{t('auth.haveAccount')}</h2>
					<Link
						className="registration__check-text_link" to={url('/sign-in')}>{t('auth.signInAction')}</Link>
					</>
					)}

				</div>

				<PopupButton naviagteTo={url('/blog')} content={t('nav.feed')}/>
				
			</form>
		</>
	)
}

export default Registration;