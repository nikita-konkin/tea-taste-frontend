import React from 'react';
import logo from '../images/logo.png';
import Navigation from './Navigation.jsx'
import { useNavigate } from 'react-router-dom';

function Header(props) {

	const navigate = useNavigate()

	// The logo and the title lead home, and home is the feed — the same place
	// `/` redirects to. They used to open the new-tasting wizard, which is a
	// surprising thing for a site logo to do.
	const handleClick = () => {
		navigate('/blog')
	}

	return (
		<>
			<header className="header">
				{/* Brand, not a heading: the h1 belongs to the page's own subject
				    — the tasting on /blog/:id, the feed on /blog — and this used
				    to take it on every page, so every page claimed to be about
				    "Форма Чая". Both halves are one button for the keyboard. */}
				<button type="button" className="header__home" onClick={handleClick}
					aria-label="На главную — лента дегустаций">
					<img src={logo} className="header__logo" alt="" width="56" height="56" />
					<span className="header__title">Форма Чая</span>
				</button>

				<Navigation />

			</header>
		</>

	)
}

export default Header;