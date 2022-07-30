import React from 'react';

function Login(argument) {
	return(

		<form className="authorization">
		<h1 className="authorization__header">Вход</h1>
			<div className="authorization__fields-box">
				<input className="authorization__email" type="text" 
					name="email" placeholder="Email" 
					minLength={2} maxLength={30} required />
				<input className="authorization__pass"
					type="password" name="password" 
					placeholder="Пароль" required />
				<button type="submit" className="authorization__submit">Войти</button>
			</div>
		</form>

		)
}

export default Login;