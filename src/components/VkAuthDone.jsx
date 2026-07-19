import React, { useEffect } from 'react';
import { mainApi } from '../utils/MainAPI.jsx';

// Landing page for the VK ID callback: the backend has already set the jwt
// cookie, so confirm it works and hand the SPA its localStorage auth flags.
// A full-page redirect re-runs App's token validation with the new cookie.
function VkAuthDone() {
	useEffect(() => {
		mainApi.getProfile()
			.then(() => {
				localStorage.setItem('loggedIn', 'true');
				localStorage.setItem('token', 'vk-oauth');
				window.location.replace('/form_1');
			})
			.catch(() => {
				window.location.replace('/sign-in?vk_error=1');
			});
	}, []);

	return (
		<div className="myforms">
			<h2 className="header__myforms">Входим через VK...</h2>
		</div>
	);
}

export default VkAuthDone;
