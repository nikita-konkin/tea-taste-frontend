import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageMeta from './PageMeta.jsx';

import Header from './Header.jsx'

import PopupButton from './PopupButton.jsx';
import { usePopup } from './PopupContext.jsx';
import { useT } from '../i18n/index.js';

// The locale rides in the query string: this is a top-level navigation out to
// VK, so the X-Locale header the app sends on fetches is not available, and the
// backend would otherwise have to guess from Accept-Language.
const vkAuthUrl = (locale) => `${process.env.REACT_APP_API_URL || '/api'}/auth/vk?locale=${locale}`;

function Login(props) {

	const { openPopup } = usePopup();
	const { t, url, locale } = useT();
	const [pass, setPass] = useState('')
	const [email, setEmail] = useState('')

	useEffect(() => {
		const vkError = new URLSearchParams(window.location.search).get('vk_error');
		if (vkError === 'closed') {
			// Not a failure on the user's side — VK worked, the site is closed
			// to new accounts. Telling them to "try again" would be a lie.
			openPopup(t('auth.signUpClosed'));
		} else if (vkError) {
			openPopup(t('auth.vkFailed'));
		}
	// Mount only: reports the vk_error the redirect arrived with, once.
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	function handlePass(e) {
		setPass(e.target.value)
	}

	function handleEmail(e) {
		setEmail(e.target.value)
	}

	function handleOnSubmit(e) {
		e.preventDefault()
		props.auth({
			email: email,
			password: pass,
		})
	}

	return (
		<>
		<PageMeta title={t('auth.signIn')} path="/sign-in" noIndex
			description={t('auth.signInDescription')} />
		    <Header />
			<form className="authorization" onSubmit={e => handleOnSubmit(e)}>
				<h1 className="authorization__header">{t('auth.signIn')}</h1>
				<div className="authorization__fields-box">
					<input className="authorization__email" type="text"
						name="email" placeholder={t('auth.email')}
						onChange={e => handleEmail(e)}
						minLength={2} maxLength={30} required />
					<input className="authorization__pass"
						type="password" name="password"
						onChange={e => handlePass(e)}
						placeholder={t('auth.password')} required />
					<button type="submit" className="authorization__submit">{t('auth.signInAction')}</button>
					<button type="button" className="authorization__submit"
						style={{ background: 'rgba(0, 119, 255, 0.45)', border: '1px solid rgba(255, 255, 255, 0.35)', margin: '14px 0 0 0' }}
						onClick={() => { window.location.href = vkAuthUrl(locale); }}>
						{t('auth.signInVk')}
					</button>

					<h2 className="authorization__check-text">{t('auth.noAccount')}</h2>
					<Link
						className="authorization__check-text_link" to={url('/sign-up')}>{t('auth.signUp')}</Link>
					<Link
						className="authorization__check-text_link" to={url('/reset-password')}>{t('auth.forgotPassword')}</Link>

				</div>
			</form>
			<PopupButton naviagteTo={url('/blog')} content={t('nav.feed')}/>
		</>

	)
}

export default Login;