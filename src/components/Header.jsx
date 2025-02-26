import React, {useState} from 'react';
import menuIcon from '../images/menu_icon_mobile.svg';
import logo from '../images/logo.png';
import Navigation from './Navigation.jsx'
import { useNavigate } from 'react-router-dom';

function Header(props) {

	const navigate = useNavigate()

	const handleClick = () => {
		navigate('/form_1')
	}

	return(

		<header className="header">
			<img src={logo} className="header__logo" alt="Logo" onClick={handleClick}/>
			<h1 className="header__title" onClick={handleClick}>Форма Чая</h1>

			<Navigation />

		</header>

		)
}

export default Header;