import React, {useState} from 'react';
import { Link } from 'react-router-dom';

function Registration(props) {


	const [name, setName] = useState('')
	const [pass, setPass] = useState('')
	const [email, setEmail] = useState('')

	function handleName(e){
		setName(e.target.value)
	}
	function handlePass(e){
		setPass(e.target.value)
	}
	function handleEmail(e){
		setEmail(e.target.value)
	}

	function handleOnSubmit(e){
		e.preventDefault()
		props.auth({
			name: name,
			pass: pass,
			email: email,
		})
	}


	return(
		<form className="registration" onSubmit={handleOnSubmit}>
		<h1 className="registration__header">Регистрация</h1>
			<div className="registration__fields-box">
				<input className="registration__name" type="text" 
						name="name" placeholder="Имя"
						onChange={e => handleName(e)}
						minLength={2} maxLength={30} required />
				<input className="registration__email" type="text" 
					name="email" placeholder="Email"
					onChange={e => handleEmail(e)}
					minLength={2} maxLength={30} required />
				<input className="registration__pass"
					type="password" name="password"
					onChange={e => handlePass(e)}
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