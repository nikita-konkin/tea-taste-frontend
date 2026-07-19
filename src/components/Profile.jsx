import React, {
	useState,
	useEffect
} from 'react'

import FormButton from './FormButton.jsx';
import Header from './Header.jsx'
import { mainApi } from '../utils/MainAPI.jsx';
import { usePopup } from './PopupContext.jsx';

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
	background: '#96B295',
	color: '#ffffff',
	fontFamily: 'inherit',
};

function Profile(props) {
	const { openPopup } = usePopup();

	const [profile, setProfile] = useState({
		name: '',
		email: '',
		career: '',
		about: '',
		avatar: '',
	});
	const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '' });
	const [isAdmin, setIsAdmin] = useState(false);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [avatarBroken, setAvatarBroken] = useState(false);

	useEffect(() => {
		mainApi.getProfile()
			.then((res) => {
				setProfile({
					name: res.data.name || '',
					email: res.data.email || '',
					career: res.data.career || '',
					about: res.data.about || '',
					avatar: res.data.avatar || '',
				});
				setIsAdmin(res.data.role === 'admin');
			})
			.catch((err) => openPopup(err.message || 'Не удалось загрузить профиль.'))
			.finally(() => setLoading(false));
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

	const handleProfileSubmit = (e) => {
		e.preventDefault();
		setSaving(true);
		mainApi.updateProfile(profile)
			.then((res) => {
				openPopup('Профиль обновлён.');
			})
			.catch((err) => openPopup(err.message || 'Не удалось обновить профиль.'))
			.finally(() => setSaving(false));
	};

	const handlePasswordSubmit = (e) => {
		e.preventDefault();
		setSaving(true);
		mainApi.updatePassword(passwords.oldPassword, passwords.newPassword)
			.then(() => {
				setPasswords({ oldPassword: '', newPassword: '' });
				openPopup('Пароль изменён.');
			})
			.catch((err) => openPopup(err.message || 'Не удалось изменить пароль.'))
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
					<h2 className="header__myforms">Загружаем профиль...</h2>
				</div>
			</>
		);
	}

	return (
		<>
			<Header navigation={props.navigation} />

			<form className="authorization authorization_compact" onSubmit={handleProfileSubmit}>
				<h1 className="authorization__header">Профиль</h1>
				<div className="authorization__fields-box">

					{profile.avatar && !avatarBroken ? (
						<img src={profile.avatar} alt="Аватар" style={avatarStyle}
							onError={() => setAvatarBroken(true)} />
					) : (
						<div style={avatarPlaceholderStyle} aria-label="Аватар не задан">
							{(profile.name || '?').charAt(0).toUpperCase()}
						</div>
					)}
					<label className="authorization__check-text" style={{ cursor: 'pointer', color: '#d8f5cc' }}>
						Загрузить аватар (до 2 МБ)
						<input type="file" accept="image/png,image/jpeg,image/webp,image/gif"
							style={{ display: 'none' }}
							onChange={(e) => {
								const file = e.target.files && e.target.files[0];
								if (!file) return;
								mainApi.uploadAvatar(file)
									.then((res) => {
										setAvatarBroken(false);
										setProfile((prev) => ({ ...prev, avatar: res.data.avatar }));
										openPopup('Аватар обновлён.');
									})
									.catch((err) => openPopup(err.message || 'Не удалось загрузить аватар.'));
								e.target.value = '';
							}} />
					</label>

					<p style={fieldLabelStyle}>Или ссылка на аватар</p>
					<input className="authorization__email" type="text"
						name="avatar" placeholder="https://..."
						value={profile.avatar} onChange={handleProfileChange} />

					<p style={fieldLabelStyle}>Имя</p>
					<input className="authorization__email" type="text"
						name="name" placeholder="Имя"
						value={profile.name} onChange={handleProfileChange}
						minLength={2} maxLength={30} required />

					<p style={fieldLabelStyle}>Email</p>
					<input className="authorization__email" type="email"
						name="email" placeholder="Email"
						value={profile.email} onChange={handleProfileChange}
						required />

					<p style={fieldLabelStyle}>Род занятий</p>
					<input className="authorization__email" type="text"
						name="career" placeholder="Например: чайный мастер"
						value={profile.career} onChange={handleProfileChange}
						maxLength={100} />

					<p style={fieldLabelStyle}>О себе</p>
					<textarea className="authorization__email" rows={4}
						name="about" placeholder="Пара слов о себе и любимом чае"
						value={profile.about} onChange={handleProfileChange}
						maxLength={500} style={{ resize: 'vertical', fontFamily: 'inherit' }} />

					<FormButton
						type="submit"
						buttonName={saving ? 'Сохраняем...' : 'Сохранить профиль'}
					/>
				</div>
			</form>

			<form className="authorization authorization_compact" onSubmit={handlePasswordSubmit}>
				<div className="authorization__fields-box">
					<h2 className="authorization__check-text">Смена пароля</h2>

					<input className="authorization__pass" type="password"
						name="oldPassword" placeholder="Текущий пароль"
						value={passwords.oldPassword} onChange={handlePasswordChange}
						autoComplete="current-password" required />
					<input className="authorization__pass" type="password"
						name="newPassword" placeholder="Новый пароль"
						value={passwords.newPassword} onChange={handlePasswordChange}
						autoComplete="new-password" required />

					<FormButton
						type="submit"
						buttonName={'Изменить пароль'}
					/>
				</div>
			</form>

			<div className="authorization authorization_compact">
				<div className="authorization__fields-box">
					{isAdmin && (
						<FormButton
							buttonName={'Пользователи (админ)'}
							margin={'0 0 0 0'}
							onClick={() => { window.location.href = '/admin'; }}
						/>
					)}
					<FormButton
						buttonName={'Выйти из аккаунта'}
						onClick={handleLogout}
					/>
				</div>
			</div>
		</>
	)
}

export default Profile;
