import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import { usePopup } from './PopupContext';

function Registration({ auth, popupContent }) {


	const { openPopup } = usePopup();
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		password1: '',
		password2: '',

	})

	const handleForm = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		})
	}


	function handleOnSubmit(e) {
		e.preventDefault()

		if (formData.password1 === formData.password2) {

			auth({
				name: formData.name,
				pass: formData.password1,
				email: formData.email,
			})

		} else {
			openPopup('Пароли не совпадают');
		}

	}


	return (
		<>
			<Helmet>
				<title>Страница регистрации нофого аккаунта</title>
				<meta name="description" content="Страница регистрации нового аккаунта" />
				<meta name="keywords" content="tea, sign-up, login, password" />
				<meta property="og:title" content="Страница регистрации нового аккаунта" />
				<meta property="og:description" content="Страница регистрации нового аккаунта" />
				{/* <meta property="og:image" content="https://example.com/image.jpg" /> */}
			</Helmet>

			<form className="registration" onSubmit={handleOnSubmit}>
				<h1 className="registration__header">Регистрация</h1>
				<div className="registration__fields-box">
					<input className="registration__name" type="text"
						name="name" placeholder="Имя"
						onChange={e => handleForm(e)}
						minLength={2} maxLength={30} required />
					<input className="registration__email" type="text"
						name="email" placeholder="Email"
						onChange={e => handleForm(e)}
						minLength={2} maxLength={30} required />
					<input className="registration__pass"
						type="password" name="password1"
						onChange={e => handleForm(e)}
						placeholder="Пароль" required />
					<input className="registration__pass"
						type="password" name="password2"
						onChange={e => handleForm(e)}
						placeholder="Повторите пароль" required />
					{/* <Test/> */}
					<button type="submit" className="registration__submit">Зарегистрироваться</button>

					<h2 className="registration__check-text">Уже зарегистрированы?</h2>
					<Link
						className="registration__check-text_link" to="/sign-in">Войти</Link>

				</div>

			</form>
		</>
	)
}

export default Registration;