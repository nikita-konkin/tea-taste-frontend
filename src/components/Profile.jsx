import React, {
	useState,
	useEffect
} from 'react'
import { useLocation } from 'react-router-dom';

import FormButton from './FormButton.jsx';
import Header from './Header.jsx'
import PageMeta from './PageMeta.jsx';
import { mainApi } from '../utils/MainAPI.jsx';
import { usePopup } from './PopupContext.jsx';
import { formatMinutes } from '../utils/utils.js';
import { useT, LOCALE_NAME } from '../i18n/index.js';
import LocaleSwitcher from './LocaleSwitcher.jsx';
import QuotaBar from './QuotaBar.jsx';

const fieldLabelStyle = {
	width: '100%',
	textAlign: 'left',
	margin: '10px 0 0 0',
	fontFamily: 'inherit',
};

const avatarStyle = {
	width: '120px',
	height: '120px',
	borderRadius: '50%',
	objectFit: 'cover',
	margin: '10px auto 0 auto',
	display: 'block',
	border: '2px solid #96B295',
};

const avatarPlaceholderStyle = {
	...avatarStyle,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	fontSize: '48px',
	background: '#40684d',
	color: '#ffffff',
	fontFamily: 'inherit',
};

function Profile(props) {
	const { openPopup } = usePopup();
	const { t, url } = useT();
	// Set when we arrived here by picking a language on this page — see the
	// switcher's `state`. Outranks what the profile fetch says, which may have
	// been read a millisecond before the write landed.
	const justChosen = useLocation().state?.language || '';

	const [profile, setProfile] = useState({
		name: '',
		nickname: '',
		email: '',
		career: '',
		about: '',
		avatar: '',
		language: justChosen,
	});
	const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '' });
	const [isAdmin, setIsAdmin] = useState(false);
	const [quota, setQuota] = useState(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [avatarBroken, setAvatarBroken] = useState(false);

	useEffect(() => {
		mainApi.getProfile()
			.then((res) => {
				setProfile({
					name: res.data.name || '',
					nickname: res.data.nickname || '',
					email: res.data.email || '',
					career: res.data.career || '',
					about: res.data.about || '',
					avatar: res.data.avatar || '',
					language: justChosen || res.data.language || '',
				});
				setIsAdmin(res.data.role === 'admin');
				setQuota(res.voiceQuota || null);
			})
			.catch((err) => openPopup(err.message || t('profile.loadFailed')))
			.finally(() => setLoading(false));
	// Mount only: loads the profile once; every later write updates state directly.
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleProfileChange = (e) => {
		const { name, value } = e.target;
		if (name === 'avatar') setAvatarBroken(false);
		setProfile((prev) => ({ ...prev, [name]: value }));
	};

	const handlePasswordChange = (e) => {
		const { name, value } = e.target;
		setPasswords((prev) => ({ ...prev, [name]: value }));
	};

	// Saved as the link navigates. Shown as saved immediately rather than after
	// the round trip: the click is also a page transition, and a setting that
	// only catches up a moment later reads as one that did not take.
	const handleLanguageSelect = (language) => {
		setProfile((prev) => ({ ...prev, language }));
		mainApi.updateProfile({ language })
			.catch((err) => openPopup(err.message || t('profile.updateFailed')));
	};

	const handleProfileSubmit = (e) => {
		e.preventDefault();
		setSaving(true);
		mainApi.updateProfile(profile)
			.then((res) => {
				openPopup(t('profile.updated'));
			})
			.catch((err) => openPopup(err.message || t('profile.updateFailed')))
			.finally(() => setSaving(false));
	};

	const handlePasswordSubmit = (e) => {
		e.preventDefault();
		setSaving(true);
		mainApi.updatePassword(passwords.oldPassword, passwords.newPassword)
			.then(() => {
				setPasswords({ oldPassword: '', newPassword: '' });
				openPopup(t('profile.passwordChanged'));
			})
			.catch((err) => openPopup(err.message || t('profile.passwordChangeFailed')))
			.finally(() => setSaving(false));
	};

	const handleLogout = () => {
		props.handleLogout();
	};

	if (loading) {
		return (
			<>
				<Header navigation={props.navigation} />
				<div className="myforms">
					<h2 className="header__myforms">{t('profile.loading')}</h2>
				</div>
			</>
		);
	}

	return (
		<>
			<PageMeta title={t('profile.title')} path="/profile" noIndex />
			<Header navigation={props.navigation} />

			<form className="authorization authorization_compact" onSubmit={handleProfileSubmit}>
				<h1 className="authorization__header">{t('profile.title')}</h1>
				<div className="authorization__fields-box">

					{profile.avatar && !avatarBroken ? (
						<img src={profile.avatar} alt={t('profile.avatar')} style={avatarStyle}
							onError={() => setAvatarBroken(true)} />
					) : (
						<div style={avatarPlaceholderStyle} aria-label={t('profile.avatarNotSet')}>
							{(profile.name || '?').charAt(0).toUpperCase()}
						</div>
					)}
					<label className="authorization__check-text" style={{ cursor: 'pointer', color: '#d8f5cc' }}>
						{t('profile.uploadAvatar')}
						<input type="file" accept="image/png,image/jpeg,image/webp,image/gif"
							style={{ display: 'none' }}
							onChange={(e) => {
								const file = e.target.files && e.target.files[0];
								if (!file) return;
								mainApi.uploadAvatar(file)
									.then((res) => {
										setAvatarBroken(false);
										setProfile((prev) => ({ ...prev, avatar: res.data.avatar }));
										openPopup(t('profile.avatarUpdated'));
									})
									.catch((err) => openPopup(err.message || t('profile.avatarUploadFailed')));
								e.target.value = '';
							}} />
					</label>

					<p style={fieldLabelStyle}>{t('profile.avatarUrl')}</p>
					<input className="authorization__email" type="text"
						name="avatar" placeholder="https://..."
						value={profile.avatar} onChange={handleProfileChange} />

					<p style={fieldLabelStyle}>{t('auth.name')}</p>
					<input className="authorization__email" type="text"
						name="name" placeholder={t('auth.name')}
						value={profile.name} onChange={handleProfileChange}
						minLength={2} maxLength={30} required />

					<p style={fieldLabelStyle}>{t('profile.nickname')}</p>
					<input className="authorization__email" type="text"
						name="nickname" placeholder={t('profile.nicknameLabel')}
						value={profile.nickname} onChange={handleProfileChange}
						minLength={2} maxLength={30} />
					<p style={{ ...fieldLabelStyle, fontSize: '13px', opacity: 0.7, margin: '4px 0 6px 0' }}>
						{t('profile.nicknameHint')}
					</p>

					<p style={fieldLabelStyle}>Email</p>
					<input className="authorization__email" type="email"
						name="email" placeholder="Email"
						value={profile.email} onChange={handleProfileChange}
						required />

					<p style={fieldLabelStyle}>{t('profile.occupation')}</p>
					<input className="authorization__email" type="text"
						name="career" placeholder={t('profile.nicknamePlaceholder')}
						value={profile.career} onChange={handleProfileChange}
						maxLength={100} />

					<p style={fieldLabelStyle}>{t('profile.about')}</p>
					<textarea className="authorization__email" rows={4}
						name="about" placeholder={t('profile.aboutPlaceholder')}
						value={profile.about} onChange={handleProfileChange}
						maxLength={500} style={{ resize: 'vertical', fontFamily: 'inherit' }} />

					<FormButton
						type="submit"
						buttonName={saving ? t('auth.saving') : t('profile.save')}
					/>
				</div>
			</form>

			{/* The allowance is spent silently in the background, so the only
			    place a user can find out where they stand before recording is
			    here. */}
			{quota && (
				<div className="authorization authorization_compact">
					<div className="authorization__fields-box">
						<h2 className="authorization__check-text">{t('nav.voiceNotes')}</h2>
						<p style={{ ...fieldLabelStyle, margin: '6px 0 0 0' }}>
							{t('profile.quotaUsed', { used: formatMinutes(quota.usedSeconds), limit: formatMinutes(quota.limitSeconds) })}
						</p>
						<div style={{ width: '100%' }}>
							<QuotaBar used={quota.usedSeconds} limit={quota.limitSeconds} />
						</div>
						<p style={{ ...fieldLabelStyle, fontSize: '13px', opacity: 0.75, margin: '8px 0 0 0' }}>
							{quota.leftSeconds > 0
								? t('profile.quotaLeft', { left: formatMinutes(quota.leftSeconds) })
								: t('profile.quotaSpent')}
						</p>
						<p style={{ ...fieldLabelStyle, fontSize: '13px', opacity: 0.75, margin: '4px 0 0 0' }}>
							{t('profile.quotaPerTasting', { max: formatMinutes(quota.maxTrackSeconds) })}
						</p>
					</div>
				</div>
			)}

			{/* The footer carries the same switcher, but the footer only renders
			    on the public pages — a signed-in reader living in /my_forms and
			    the wizard would never see it. This is where someone looks for a
			    setting anyway, and this is the copy that persists. */}
			<div className="authorization authorization_compact">
				<div className="authorization__fields-box">
					<h2 className="authorization__check-text">{t('nav.language')}</h2>
					<LocaleSwitcher variant="block" onSelect={handleLanguageSelect} />
					{/* The tick marks the language of the page you are on, which
					    is not necessarily the one saved — you can reach /profile
					    from a Russian link with English saved. So the saved one
					    is stated outright rather than left to be inferred. */}
					<p style={{ ...fieldLabelStyle, fontSize: '13px', opacity: 0.75, margin: '8px 0 0 0' }}>
						{profile.language
							? t('profile.languageSaved', { language: LOCALE_NAME[profile.language] })
							: t('profile.languageUnset')}
					</p>
					<p style={{ ...fieldLabelStyle, fontSize: '13px', opacity: 0.6, margin: '4px 0 0 0' }}>
						{t('profile.languageShared')}
					</p>
				</div>
			</div>

			<form className="authorization authorization_compact" onSubmit={handlePasswordSubmit}>
				<div className="authorization__fields-box">
					<h2 className="authorization__check-text">{t('profile.passwordSection')}</h2>

					<input className="authorization__pass" type="password"
						name="oldPassword" placeholder={t('profile.currentPassword')}
						value={passwords.oldPassword} onChange={handlePasswordChange}
						autoComplete="current-password" required />
					<input className="authorization__pass" type="password"
						name="newPassword" placeholder={t('auth.newPassword')}
						value={passwords.newPassword} onChange={handlePasswordChange}
						autoComplete="new-password" required />

					<FormButton
						type="submit"
						buttonName={t('profile.changePassword')}
					/>
				</div>
			</form>

			<div className="authorization authorization_compact">
				<div className="authorization__fields-box">
					{isAdmin && (
						<FormButton
							buttonName={t('profile.usersAdmin')}
							margin={'0 0 0 0'}
							onClick={() => { window.location.href = url('/admin'); }}
						/>
					)}
					<FormButton
						buttonName={t('profile.logout')}
						onClick={handleLogout}
					/>
				</div>
			</div>
		</>
	)
}

export default Profile;
