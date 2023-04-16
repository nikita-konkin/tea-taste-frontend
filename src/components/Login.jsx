import React, {useState} from 'react';
import { Link } from 'react-router-dom';

function Login(props) {

	const [pass, setPass] = useState('')
	const [email, setEmail] = useState('')

	function handlePass(e){
		setPass(e.target.value)
	}

	function handleEmail(e){
		setEmail(e.target.value)
	}

	function handleOnSubmit(e){
		e.preventDefault()
		props.auth({
			email: email,
			password: pass,
		})
	}


	return(

		<form className="authorization" onSubmit={e=>handleOnSubmit(e)}>
		<h1 className="authorization__header">Вход</h1>
			<div className="authorization__fields-box">
				<input className="authorization__email" type="text" 
					name="email" placeholder="Email" 
					onChange={e=>handleEmail(e)}
					minLength={2} maxLength={30} required />
				<input className="authorization__pass"
					type="password" name="password"
					onChange={e=>handlePass(e)}
					placeholder="Пароль" required />
				<button type="submit" className="authorization__submit">Войти</button>

				<h2 className="authorization__check-text">Еще не зарегистрированы?</h2>
				<Link 
				className="authorization__check-text_link" to="/sign-up">Регистрация</Link>

			</div>
		</form>

		)
}

export default Login;