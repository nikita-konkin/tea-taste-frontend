import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Header from './Header.jsx';
import PageMeta from './PageMeta.jsx';
import { mainApi } from '../utils/MainAPI.jsx';
import { useT, useLocalizedNavigate } from '../i18n/index.js';

// /reset-password           — request a reset link by email
// /reset-password?token=... — set a new password (link from the email)
function ResetPassword() {
	const [searchParams] = useSearchParams();
	const navigate = useLocalizedNavigate();
	const { t, url } = useT();
	const token = searchParams.get('token');

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [message, setMessage] = useState('');
	const [busy, setBusy] = useState(false);

	const handleRequest = (e) => {
		e.preventDefault();
		setBusy(true);
		setMessage('');
		mainApi.requestPasswordReset(email)
			.then((res) => setMessage(res.message || t('auth.resetSent')))
			.catch((err) => setMessage(err.message || t('auth.resetSendFailed')))
			.finally(() => setBusy(false));
	};

	const handleConfirm = (e) => {
		e.preventDefault();
		setBusy(true);
		setMessage('');
		mainApi.confirmPasswordReset(token, password)
			.then(() => {
				setMessage(t('auth.resetDone'));
				setTimeout(() => navigate('/sign-in'), 1500);
			})
			.catch((err) => setMessage(err.message || t('auth.resetFailed')))
			.finally(() => setBusy(false));
	};

	return (
		<>
			{/* noIndex is not belt-and-braces here: the URL carries a
			    single-use reset token, and an indexed copy of it is a link
			    anyone can read out of a search result. */}
			<PageMeta title={t('auth.resetTitle')} path="/reset-password" noIndex />
			<Header />
			{token ? (
				<form className="authorization" onSubmit={handleConfirm}>
					<h1 className="authorization__header">{t('auth.newPassword')}</h1>
					<div className="authorization__fields-box">
						<input className="authorization__pass" type="password"
							name="newPassword" placeholder={t('auth.newPassword')}
							value={password} onChange={(e) => setPassword(e.target.value)}
							autoComplete="new-password" required />
						<button type="submit" className="authorization__submit" disabled={busy}>
							{busy ? t('auth.saving') : t('auth.savePassword')}
						</button>
						{message && <p className="authorization__check-text">{message}</p>}
					</div>
				</form>
			) : (
				<form className="authorization" onSubmit={handleRequest}>
					<h1 className="authorization__header">{t('auth.resetTitle')}</h1>
					<div className="authorization__fields-box">
						<input className="authorization__email" type="email"
							name="email" placeholder={t('auth.email')}
							value={email} onChange={(e) => setEmail(e.target.value)}
							required />
						<button type="submit" className="authorization__submit" disabled={busy}>
							{busy ? t('auth.sending') : t('auth.sendLink')}
						</button>
						{message && <p className="authorization__check-text">{message}</p>}
						<Link className="authorization__check-text_link" to={url('/sign-in')}>{t('auth.rememberedPassword')}</Link>
					</div>
				</form>
			)}
		</>
	);
}

export default ResetPassword;
