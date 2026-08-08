import React from 'react';
import logo from '../images/logo.png';
import Navigation from './Navigation.jsx'
import { Link } from 'react-router-dom';
import { useT } from '../i18n/index.js';

function Header(props) {

	const { t, url } = useT();

	return (
		<>
			<header className="header">
				{/* Brand, not a heading: the h1 belongs to the page's own subject
				    — the tasting on /blog/:id, the feed on /blog — and this used
				    to take it on every page, so every page claimed to be about
				    "Форма Чая". Both halves are one link for the keyboard.
				    A link rather than a navigate() button, because this is the
				    one element on every page of the site: as a button it was a
				    site-wide dead end for anything that reads HTML. */}
				<Link to={url('/')} className="header__home"
					aria-label={t('site.home')}>
					<img src={logo} className="header__logo" alt="" width="56" height="56" />
					<span className="header__title">{t('site.name')}</span>
				</Link>

				<Navigation />

			</header>
		</>

	)
}

export default Header;