import React, { useState } from 'react';
import FormButton from './FormButton.jsx';
import { mainApi } from '../utils/MainAPI.jsx';
import { usePopup } from './PopupContext.jsx';

const textareaStyle = {
	width: '100%',
	minHeight: '120px',
	boxSizing: 'border-box',
	resize: 'vertical',
	background: 'rgba(255, 255, 255, 0.10)',
	border: '1px solid rgba(255, 255, 255, 0.35)',
	borderRadius: '10px',
	color: '#ffffff',
	padding: '10px 12px',
	fontFamily: 'inherit',
	fontSize: '16px',
	margin: '12px 0 0 0',
};

// Feedback form shown in the popup (opened from the side menu). Requires a
// signed-in user — the API answers 401 otherwise.
function SuggestionForm() {
	const { closePopup } = usePopup();
	const [text, setText] = useState('');
	const [sending, setSending] = useState(false);
	const [status, setStatus] = useState(null); // null | 'sent' | error text

	const submit = () => {
		if (text.trim().length < 5) {
			setStatus('Опишите предложение хотя бы в 5 символов.');
			return;
		}
		setSending(true);
		setStatus(null);
		mainApi.sendSuggestion(text.trim())
			.then(() => setStatus('sent'))
			.catch((err) => setStatus(err.message === '401 - Необходима авторизация.' || err.statusCode === 401
				? 'Войдите в аккаунт, чтобы отправить предложение.'
				: (err.message || 'Не удалось отправить. Попробуйте позже.')))
			.finally(() => setSending(false));
	};

	if (status === 'sent') {
		return (
			<section className="myforminteraction__section">
				<h3 style={{ margin: '0 0 8px 0' }}>Спасибо!</h3>
				<p style={{ margin: 0 }}>Предложение отправлено — мы его обязательно посмотрим.</p>
				<FormButton buttonName={'Закрыть'} onClick={closePopup} />
			</section>
		);
	}

	return (
		<section className="myforminteraction__section">
			<h3 style={{ margin: 0 }}>Предложить улучшение</h3>
			<p style={{ margin: '6px 0 0 0', fontSize: '14px', opacity: 0.85 }}>
				Чего не хватает сервису? Что неудобно? Напишите — это читает автор.
			</p>
			<textarea style={textareaStyle} value={text} maxLength={1000}
				placeholder="Например: хочу экспорт моих дегустаций в PDF..."
				onChange={(e) => setText(e.target.value)} />
			{status && <p style={{ margin: '8px 0 0 0', color: '#ffd9d9', fontSize: '14px' }}>{status}</p>}
			<FormButton
				buttonName={sending ? 'Отправляем...' : 'Отправить'}
				onClick={submit}
			/>
		</section>
	);
}

export default SuggestionForm;
