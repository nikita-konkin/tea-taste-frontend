import React, { useState } from 'react';
import FormButton from './FormButton.jsx';
import { mainApi } from '../utils/MainAPI.jsx';
import { useT } from '../i18n/index.js';
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
	const { t } = useT();
	const [text, setText] = useState('');
	const [sending, setSending] = useState(false);
	const [status, setStatus] = useState(null); // null | 'sent' | error text

	const submit = () => {
		if (text.trim().length < 5) {
			setStatus(t('suggest.tooShort'));
			return;
		}
		setSending(true);
		setStatus(null);
		mainApi.sendSuggestion(text.trim())
			.then(() => setStatus('sent'))
			// 401 is its own message: "sign in to send a suggestion" says what to
			// do, where the API's own «Необходима авторизация.» only says what
			// went wrong. Branching on the status, not on the text — matching the
			// message meant matching one language, and it had already drifted.
			.catch((err) => setStatus(err.statusCode === 401
				? t('suggest.needAuth')
				: (err.message || t('suggest.sendFailed'))))
			.finally(() => setSending(false));
	};

	if (status === 'sent') {
		return (
			<section className="myforminteraction__section">
				<h3>{t('suggest.thanks')}</h3>
				<p style={{ margin: 0 }}>{t('suggest.sent')}</p>
				<FormButton buttonName={t('suggest.close')} onClick={closePopup} />
			</section>
		);
	}

	return (
		<section className="myforminteraction__section">
			<h3>{t('suggest.title')}</h3>
			<p style={{ margin: '0 0 0 0', fontSize: '14px', opacity: 0.85 }}>
				{t('suggest.intro')}
			</p>
			<textarea style={textareaStyle} value={text} maxLength={1000}
				placeholder={t('suggest.placeholder')}
				onChange={(e) => setText(e.target.value)} />
			{status && <p style={{ margin: '8px 0 0 0', color: '#ffd9d9', fontSize: '14px' }}>{status}</p>}
			<FormButton
				buttonName={sending ? t('suggest.sending') : t('suggest.send')}
				onClick={submit}
			/>
		</section>
	);
}

export default SuggestionForm;
