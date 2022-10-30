import React from 'react';
import menuIcon from '../images/menu_icon_mobile.svg';

function Header(props) {
	return(

		<header className="header">
			<h1 className="header__title">Форма Чая</h1>
			{props.navigation()}
			{/*<h2 className="header__navigation">Форма</h2>*/}
			{/*<img src={menuIcon} className="header__menu" alt="Логотип" />*/}
		</header>

		)
}

export default Header;