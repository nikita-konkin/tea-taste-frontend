import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import Header from './Header.jsx';
import { mainApi } from '../utils/MainAPI.jsx';

// /reset-password           — request a reset link by email
// /reset-password?token=... — set a new password (link from the email)
function ResetPassword() {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
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
			.then((res) => setMessage(res.message || 'Если такой email зарегистрирован, ссылка отправлена.'))
			.catch((err) => setMessage(err.message || 'Не удалось отправить ссылку.'))
			.finally(() => setBusy(false));
	};

	const handleConfirm = (e) => {
		e.preventDefault();
		setBusy(true);
		setMessage('');
		mainApi.confirmPasswordReset(token, password)
			.then(() => {
				setMessage('Пароль изменён! Перенаправляем на вход...');
				setTimeout(() => navigate('/sign-in'), 1500);
			})
			.catch((err) => setMessage(err.message || 'Не удалось изменить пароль.'))
			.finally(() => setBusy(false));
	};

	return (
		<>
			<Header />
			{token ? (
				<form className="authorization" onSubmit={handleConfirm}>
					<h1 className="authorization__header">Новый пароль</h1>
					<div className="authorization__fields-box">
						<input className="authorization__pass" type="password"
							name="newPassword" placeholder="Новый пароль"
							value={password} onChange={(e) => setPassword(e.target.value)}
							autoComplete="new-password" required />
						<button type="submit" className="authorization__submit" disabled={busy}>
							{busy ? 'Сохраняем...' : 'Сохранить пароль'}
						</button>
						{message && <p className="authorization__check-text">{message}</p>}
					</div>
				</form>
			) : (
				<form className="authorization" onSubmit={handleRequest}>
					<h1 className="authorization__header">Восстановление пароля</h1>
					<div className="authorization__fields-box">
						<input className="authorization__email" type="email"
							name="email" placeholder="Email"
							value={email} onChange={(e) => setEmail(e.target.value)}
							required />
						<button type="submit" className="authorization__submit" disabled={busy}>
							{busy ? 'Отправляем...' : 'Отправить ссылку'}
						</button>
						{message && <p className="authorization__check-text">{message}</p>}
						<Link className="authorization__check-text_link" to="/sign-in">Вспомнили пароль? Войти</Link>
					</div>
				</form>
			)}
		</>
	);
}

export default ResetPassword;
