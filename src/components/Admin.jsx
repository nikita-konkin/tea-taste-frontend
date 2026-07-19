import React, { useEffect, useState } from 'react';
import Header from './Header.jsx';
import { mainApi } from '../utils/MainAPI.jsx';
import { usePopup } from './PopupContext.jsx';

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
	background: '#96B295', display: 'inline-flex',
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

// Admin console: list every account, change roles, delete users with
// their tea data. The backend enforces the admin role; non-admins get an
// error popup and an empty page.
function Admin({ navigation }) {
	const { openPopup } = usePopup();
	const [users, setUsers] = useState(null); // null = loading
	const [myId, setMyId] = useState(null);
	const [confirmId, setConfirmId] = useState(null);

	const load = () => {
		mainApi.adminGetUsers()
			.then((res) => setUsers(res.data))
			.catch((err) => {
				setUsers([]);
				openPopup(err.message || 'Нет доступа.');
			});
	};

	useEffect(() => {
		mainApi.getProfile().then((res) => setMyId(res.data._id)).catch(() => {});
		load();
	}, []);

	const setRole = (u, role) => {
		mainApi.adminSetUserRole(u._id, role)
			.then(load)
			.catch((err) => openPopup(err.message || 'Не удалось изменить роль.'));
	};

	const remove = (u) => {
		mainApi.adminDeleteUser(u._id)
			.then(() => { setConfirmId(null); load(); })
			.catch((err) => openPopup(err.message || 'Не удалось удалить пользователя.'));
	};

	return (
		<>
			<Header navigation={navigation} />
			<div className="myforms">
				<h2 className="header__myforms">Пользователи</h2>
				{users === null && <h2 className="header__myforms">Загружаем...</h2>}
				{users && users.map((u) => (
					<section key={u._id} style={cardStyle}>
						<div style={rowStyle}>
							{u.avatar
								? <img src={u.avatar} alt="" style={avatarStyle} />
								: <span style={avatarStyle}>{(u.name || '?').charAt(0).toUpperCase()}</span>}
							<div style={{ minWidth: 0 }}>
								<div style={{ fontWeight: 600 }}>
									{u.name}{' '}
									{u.role === 'admin' && <span style={badgeStyle}>админ</span>}{' '}
									{u.vkId && <span style={badgeStyle}>VK</span>}
								</div>
								<div style={{ fontSize: '14px', opacity: 0.85, overflowWrap: 'anywhere' }}>{u.email}</div>
							</div>
						</div>
						<div style={{ fontSize: '14px', opacity: 0.85, margin: '8px 0' }}>
							Форм: {u.forms} · с {u.createdAt && new Date(u.createdAt).toLocaleDateString('ru-RU')}
							{u.career ? ` · ${u.career}` : ''}
						</div>
						{u._id !== myId && (
							<div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
								{u.role === 'admin'
									? <button style={btnStyle} onClick={() => setRole(u, 'user')}>Снять админа</button>
									: <button style={btnStyle} onClick={() => setRole(u, 'admin')}>Сделать админом</button>}
								{u.role !== 'admin' && (confirmId === u._id
									? (
										<>
											<button style={dangerBtnStyle} onClick={() => remove(u)}>Точно удалить?</button>
											<button style={btnStyle} onClick={() => setConfirmId(null)}>Отмена</button>
										</>
									)
									: <button style={dangerBtnStyle} onClick={() => setConfirmId(u._id)}>Удалить</button>)}
							</div>
						)}
					</section>
				))}
			</div>
		</>
	);
}

export default Admin;
