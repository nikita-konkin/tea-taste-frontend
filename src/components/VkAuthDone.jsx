import React, { useEffect } from 'react';
import { mainApi } from '../utils/MainAPI.jsx';
import PageMeta from './PageMeta.jsx';
import { useT } from '../i18n/index.js';

// Landing page for the VK ID callback: the backend has already set the jwt
// cookie, so confirm it works and hand the SPA its localStorage auth flags.
// A full-page redirect re-runs App's token validation with the new cookie.
function VkAuthDone() {
	const { t, url } = useT();

	useEffect(() => {
		mainApi.getProfile()
			.then(() => {
				localStorage.setItem('loggedIn', 'true');
				localStorage.setItem('token', 'vk-oauth');
				// The callback already redirected here in the account's saved
				// language, so this address is the one to keep — a bare
				// '/form_1' would drop it at the last step.
				window.location.replace(url('/form_1'));
			})
			.catch(() => {
				window.location.replace(`${url('/sign-in')}?vk_error=1`);
			});
	}, []);

	return (
		<>
			<PageMeta title={t('auth.signInVk')} path="/oauth/vk" noIndex />
			<div className="myforms">
				<h2 className="header__myforms">{t('auth.vkSigningIn')}</h2>
			</div>
		</>
	);
}

export default VkAuthDone;
