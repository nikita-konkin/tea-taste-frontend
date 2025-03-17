import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import Header from './Header.jsx'

import PopupButton from './PopupButton.jsx';

function Login(props) {

	const [pass, setPass] = useState('')
	const [email, setEmail] = useState('')

	function handlePass(e) {
		setPass(e.target.value)
	}

	function handleEmail(e) {
		setEmail(e.target.value)
	}

	function handleOnSubmit(e) {
		e.preventDefault()
		props.auth({
			email: email,
			password: pass,
		})
	}

	return (
		<>
		<Helmet>
			<title>Страница входа в форму</title>
			<meta name="description" content="Страница входа в форму заполнения информации о чае и его проливах" />
			<meta name="keywords" content="tea, sign-in, login, password" />
			<meta property="og:title" content="Страница входа в форму заполнения информации о чае и его проливах" />
			<meta property="og:description" content="Страница входа в форму заполнения информации о чае и его проливах" />
			{/* <meta property="og:image" content="https://example.com/image.jpg" /> */}
		</Helmet>
		    <Header />
			<form className="authorization" onSubmit={e => handleOnSubmit(e)}>
				<h1 className="authorization__header">Вход</h1>
				<div className="authorization__fields-box">
					<input className="authorization__email" type="text"
						name="email" placeholder="Email"
						onChange={e => handleEmail(e)}
						minLength={2} maxLength={30} required />
					<input className="authorization__pass"
						type="password" name="password"
						onChange={e => handlePass(e)}
						placeholder="Пароль" required />
					<button type="submit" className="authorization__submit">Войти</button>

					<h2 className="authorization__check-text">Еще не зарегистрированы?</h2>
					<Link
						className="authorization__check-text_link" to="/sign-up">Регистрация</Link>

				</div>
			</form>
			<PopupButton naviagteTo={'/blog'} content={'Блог'}/>
		</>

	)
}

export default Login;