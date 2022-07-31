import React from 'react';
import { Link } from 'react-router-dom';

function Registration(argument) {
	return(

		<form className="registration">
		<h1 className="registration__header">Регистрация</h1>
			<div className="registration__fields-box">
				<input className="registration__name" type="text" 
						name="name" placeholder="Имя" 
						minLength={2} maxLength={30} required />
				<input className="registration__email" type="text" 
					name="email" placeholder="Email" 
					minLength={2} maxLength={30} required />
				<input className="registration__pass"
					type="password" name="password" 
					placeholder="Пароль" required />
				<button type="submit" className="registration__submit">Зарегистрироваться</button>

				<h2 className="registration__check-text">Уже зарегистрированы?</h2>
				<Link
				className="registration__check-text_link" to="/sign-in">Войти</Link>

			</div>
		</form>

		)
}

export default Registration;