import React, { useEffect, useState } from 'react';
import Header from './Header.jsx';
import PageMeta from './PageMeta.jsx';
import { mainApi } from '../utils/MainAPI.jsx';
import { usePopup } from './PopupContext.jsx';
import { formatMinutes, formatShortDateTime } from '../utils/utils.js';
import QuotaBar from './QuotaBar.jsx';
import { useT } from '../i18n/index.js';

const cardStyle = {
	background: 'rgba(255, 255, 255, 0.10)',
	border: '1px solid rgba(255, 255, 255, 0.25)',
	borderRadius: '14px',
	backdropFilter: 'blur(12px)',
	WebkitBackdropFilter: 'blur(12px)',
	padding: '14px 16px',
	margin: '0 0 14px 0',
	color: '#ffffff',
};

const rowStyle = { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' };

const avatarStyle = {
	width: '36px', height: '36px', borderRadius: '50%',
	objectFit: 'cover', flexShrink: 0,
	background: '#40684d', display: 'inline-flex',
	alignItems: 'center', justifyContent: 'center', fontSize: '16px',
};

const badgeStyle = {
	display: 'inline-block',
	background: 'rgba(168, 244, 147, 0.25)',
	border: '1px solid rgba(168, 244, 147, 0.6)',
	borderRadius: '999px',
	padding: '1px 10px',
	fontSize: '13px',
	color: '#d8f5cc',
};

const btnStyle = {
	background: 'rgba(255, 255, 255, 0.14)',
	border: '1px solid rgba(255, 255, 255, 0.30)',
	borderRadius: '8px',
	color: '#ffffff',
	padding: '5px 12px',
	fontFamily: 'inherit',
	fontSize: '14px',
	cursor: 'pointer',
};

const dangerBtnStyle = {
	...btnStyle,
	background: 'rgba(255, 90, 90, 0.25)',
	border: '1px solid rgba(255, 120, 120, 0.5)',
};

const warnBadgeStyle = {
	...badgeStyle,
	background: 'rgba(255, 170, 90, 0.22)',
	border: '1px solid rgba(255, 190, 120, 0.6)',
	color: '#ffdcb0',
};


// Admin console: list every account, change roles, delete users with
// their tea data. The backend enforces the admin role; non-admins get an
// error popup and an empty page.
function Admin({ navigation }) {
	const { openPopup } = usePopup();
	const { t } = useT();
	const [users, setUsers] = useState(null); // null = loading
	const [suggestions, setSuggestions] = useState([]);
	const [myId, setMyId] = useState(null);
	const [confirmId, setConfirmId] = useState(null);
	const [voiceLimit, setVoiceLimit] = useState(0);
	const [voicePeriod, setVoicePeriod] = useState('');
	const [settings, setSettings] = useState(null);
	const [savingSettings, setSavingSettings] = useState(false);
	const [blocked, setBlocked] = useState([]);
	const [confirmSession, setConfirmSession] = useState(null);

	const load = () => {
		// The moderation queue: blocked tastings are out of the feed, so this is
		// the only place they can be found and let back in.
		mainApi.adminGetBlockedForms()
			.then((res) => setBlocked(res.data))
			.catch(() => setBlocked([]));
		mainApi.adminGetUsers()
			.then((res) => {
				setUsers(res.data);
				setVoiceLimit(res.voiceLimitSeconds || 0);
				setVoicePeriod(res.voicePeriod || '');
			})
			.catch((err) => {
				setUsers([]);
				openPopup(err.message || t('admin.noAccess'));
			});
		mainApi.adminGetSuggestions()
			.then((res) => setSuggestions(res.data))
			.catch(() => setSuggestions([]));
		mainApi.adminGetSettings()
			.then((res) => setSettings(res.data))
			.catch(() => setSettings(null));
	};

	useEffect(() => {
		mainApi.getProfile().then((res) => setMyId(res.data._id)).catch(() => {});
		load();
	// Mount only: the admin page loads its lists once and reloads them through load() on demand.
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const toggleRegistration = () => {
		if (!settings) return;
		const next = !settings.registrationOpen;
		setSavingSettings(true);
		mainApi.adminUpdateSettings({ registrationOpen: next })
			.then((res) => {
				setSettings(res.data);
				openPopup(res.data.registrationOpen
					? t('admin.regOpen')
					: t('admin.regClosed'));
			})
			.catch((err) => openPopup(err.message || t('admin.settingFailed')))
			.finally(() => setSavingSettings(false));
	};

	const dismissSuggestion = (id) => {
		mainApi.adminDeleteSuggestion(id)
			.then(load)
			.catch((err) => openPopup(err.message || t('admin.deleteFailed')));
	};

	const setRole = (u, role) => {
		mainApi.adminSetUserRole(u._id, role)
			.then(load)
			.catch((err) => openPopup(err.message || t('admin.roleFailed')));
	};

	const remove = (u) => {
		mainApi.adminDeleteUser(u._id)
			.then(() => { setConfirmId(null); load(); })
			.catch((err) => openPopup(err.message || t('admin.userDeleteFailed')));
	};

	const unblockForm = (form) => {
		mainApi.adminSetFormBlocked(form.sessionId, false)
			.then(() => {
				load();
				// Said out loud because nothing visible happens in the feed: the
				// tasting stays private until its author publishes it again.
				openPopup(t('admin.unblocked'));
			})
			.catch((err) => openPopup(err.message || t('admin.unblockFailed')));
	};

	const removeForm = (form) => {
		mainApi.adminDeleteForm(form.sessionId)
			.then(() => { setConfirmSession(null); load(); })
			.catch((err) => openPopup(err.message || t('admin.formDeleteFailed')));
	};

	return (
		<>
			<PageMeta title={t('admin.title')} path="/admin" noIndex />
			<Header navigation={navigation} />
			<div className="myforms">
				<h2 className="header__myforms">{t('admin.siteSettings')}</h2>
				<section style={cardStyle}>
					<div style={{ ...rowStyle, justifyContent: 'space-between' }}>
						<div style={{ minWidth: 0 }}>
							<div style={{ fontWeight: 600 }}>
								{t('admin.registration')}{' '}
								{settings && !settings.registrationOpen && <span style={warnBadgeStyle}>{t('admin.closed')}</span>}
							</div>
							<div style={{ fontSize: '14px', opacity: 0.85, marginTop: '4px' }}>
								{t('admin.regHint')}
							</div>
						</div>
						{settings === null
							? <span style={{ fontSize: '14px', opacity: 0.7 }}>{t('admin.loading')}</span>
							: (
								<button
									style={settings.registrationOpen ? dangerBtnStyle : btnStyle}
									disabled={savingSettings}
									onClick={toggleRegistration}>
									{settings.registrationOpen ? t('admin.closeReg') : t('admin.openReg')}
								</button>
							)}
					</div>
				</section>

				<h2 className="header__myforms">{t('admin.suggestions')} {suggestions.length > 0 && `(${suggestions.length})`}</h2>
				{suggestions.length === 0 && (
					<p style={{ color: '#ffffff', opacity: 0.7, margin: '0 0 14px 0' }}>{t('admin.empty')}</p>
				)}
				{suggestions.map((s) => (
					<section key={s._id} style={cardStyle}>
						<div style={{ fontSize: '14px', opacity: 0.85, marginBottom: '6px' }}>
							{s.owner ? `${s.owner.nickname || s.owner.name} · ${s.owner.email}` : t('admin.userDeleted')}
							{' · '}
							{formatShortDateTime(s.createdAt)}
						</div>
						<div style={{ overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}>{s.text}</div>
						<div style={{ marginTop: '10px' }}>
							<button style={btnStyle} onClick={() => dismissSuggestion(s._id)}>{t('admin.processed')}</button>
						</div>
					</section>
				))}

				<h2 className="header__myforms">
					{t('admin.hiddenForms')} {blocked.length > 0 && `(${blocked.length})`}
				</h2>
				{blocked.length === 0 && (
					<p style={{ color: '#ffffff', opacity: 0.7, margin: '0 0 14px 0' }}>
						{t('admin.nothingHidden')}
					</p>
				)}
				{blocked.map((f) => (
					<section key={f.sessionId} style={cardStyle}>
						<div style={{ fontWeight: 600 }}>
							{f.nameRU} <span style={warnBadgeStyle}>{t('admin.hidden')}</span>
						</div>
						<div style={{ fontSize: '14px', opacity: 0.85, margin: '6px 0' }}>
							{f.owner ? `${f.owner.nickname || f.owner.name} · ${f.owner.email}` : t('admin.authorDeleted')}
							{f.type ? ` · ${f.type}` : ''}
							{f.blockedAt ? ` ${t('admin.hiddenAt', { date: formatShortDateTime(f.blockedAt) })}` : ''}
						</div>
						<div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
							<button style={btnStyle} onClick={() => unblockForm(f)}>{t('admin.returnToAuthor')}</button>
							{confirmSession === f.sessionId
								? (
									<>
										<button style={dangerBtnStyle} onClick={() => removeForm(f)}>{t('admin.confirmDelete')}</button>
										<button style={btnStyle} onClick={() => setConfirmSession(null)}>{t('admin.cancel')}</button>
									</>
								)
								: <button style={dangerBtnStyle} onClick={() => setConfirmSession(f.sessionId)}>{t('admin.deleteForever')}</button>}
						</div>
					</section>
				))}

				<h2 className="header__myforms">{t('admin.users')}</h2>
				{users === null && <h2 className="header__myforms">{t('admin.loading')}</h2>}
				{users && users.map((u) => (
					<section key={u._id} style={cardStyle}>
						<div style={rowStyle}>
							{u.avatar
								? <img src={u.avatar} alt="" style={avatarStyle} />
								: <span style={avatarStyle}>{(u.name || '?').charAt(0).toUpperCase()}</span>}
							<div style={{ minWidth: 0 }}>
								<div style={{ fontWeight: 600 }}>
									{u.nickname || u.name}{' '}
									{u.role === 'admin' && <span style={badgeStyle}>{t('admin.adminBadge')}</span>}{' '}
									{u.vkId && <span style={badgeStyle}>VK</span>}
								</div>
								<div style={{ fontSize: '14px', opacity: 0.85, overflowWrap: 'anywhere' }}>
									{u.nickname && u.name ? `${u.name} · ` : ''}{u.email}
								</div>
							</div>
						</div>
						<div style={{ fontSize: '14px', opacity: 0.85, margin: '8px 0' }}>
							{t('admin.userForms', { n: u.forms, date: formatShortDateTime(u.createdAt) })}
							{u.career ? ` · ${u.career}` : ''}
						</div>
						{voiceLimit > 0 && (
							<div style={{ fontSize: '14px', opacity: 0.85, margin: '8px 0' }}>
								{t('admin.userVoice', {
									period: voicePeriod,
									used: formatMinutes(u.voiceSeconds),
									limit: formatMinutes(voiceLimit),
								})}
								{u.voiceSeconds >= voiceLimit && <span style={{ marginLeft: '8px' }}><span style={warnBadgeStyle}>{t('admin.limitSpent')}</span></span>}
								<QuotaBar used={u.voiceSeconds || 0} limit={voiceLimit} />
							</div>
						)}
						{u._id !== myId && (
							<div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
								{u.role === 'admin'
									? <button style={btnStyle} onClick={() => setRole(u, 'user')}>{t('admin.demote')}</button>
									: <button style={btnStyle} onClick={() => setRole(u, 'admin')}>{t('admin.promote')}</button>}
								{u.role !== 'admin' && (confirmId === u._id
									? (
										<>
											<button style={dangerBtnStyle} onClick={() => remove(u)}>{t('admin.confirmDelete')}</button>
											<button style={btnStyle} onClick={() => setConfirmId(null)}>{t('admin.cancel')}</button>
										</>
									)
									: <button style={dangerBtnStyle} onClick={() => setConfirmId(u._id)}>{t('admin.delete')}</button>)}
							</div>
						)}
					</section>
				))}
			</div>
		</>
	);
}

export default Admin;
