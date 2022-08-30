import React from 'react';
import menuIcon from '../images/menu_icon_mobile.svg';

function Header(argument) {
	return(

		<form className="header">
			<h1 className="header__title">Форма Чая</h1>
			<h2 className="header__navigation">Форма</h2>
			<img src={menuIcon} className="header__menu" alt="Логотип" />
		</form>

		)
}

export default Header;