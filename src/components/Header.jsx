import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import logo from '../images/logo.png';
import Navigation from './Navigation.jsx'
import { useNavigate } from 'react-router-dom';

function Header(props) {

	const navigate = useNavigate()

	const handleClick = () => {
		navigate('/form_1')
	}

	return (
		<>
			<Helmet>
				<title>Форма чая</title>
				<meta name="description" content="Форма чая" />
				<meta name="keywords" content="tea form, teaform" />
				<meta property="og:title" content="Форма чая" />
				<meta property="og:description" content="Форма чая" />
				{/* <meta property="og:image" content="https://example.com/image.jpg" /> */}
			</Helmet>

			<header className="header">
				<img src={logo} className="header__logo" alt="Logo" onClick={handleClick} />
				<h1 className="header__title" onClick={handleClick}>Форма Чая</h1>

				<Navigation />

			</header>
		</>

	)
}

export default Header;