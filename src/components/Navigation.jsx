import React, {
  useState,
  useEffect
} from 'react'
import {
  NavLink,
} from "react-router-dom";
// import hamburgerBtn from '../images/menu_icon_mobile.svg';


function Navigation() {

	const [menuState, setMenuState] = useState(false)

	const navStyle = menuState ? `navigation__side` : `navigation`

	const addMenuBackground = <div className="navigation__background"></div>
	const navLinkStyleActive = 'navigation__link_active'
	const navLinkStyle = 'navigation__link'

  function navBtn(){

  	function openMenu(){
      menuState ? setMenuState(false) : setMenuState(true)
    }

  	return(
  		<>
  		<h2 className="header__navigation">Форма</h2>
      <button className='navigation__hamburger' 
      onClick={openMenu} alt="Кнопка меню"></button>
      </>
		)

  }

  function sideMenu(addMenuBackground){

    return(
      <>
      {addMenuBackground}
      <nav className={navStyle}>
      	<NavLink className={({ isActive }) => (isActive ? `${navLinkStyleActive}` : `${navLinkStyle}`)}  to="/form_1">Форма</NavLink>
        <NavLink className={({ isActive }) => (isActive ? `${navLinkStyleActive}` : `${navLinkStyle}`)}   to="/movies">Профиль</NavLink>
        <NavLink className={({ isActive }) => (isActive ? `${navLinkStyleActive}` : `${navLinkStyle}`)}   to="/saved-movies">Мои формы</NavLink>
        <NavLink className={({ isActive }) => (isActive ? `${navLinkStyleActive}` : `${navLinkStyle}`)}   to="/profile">Блог</NavLink>
      </nav>
      </>

    )
  }

	return(
		<>
		{navBtn()}
		{menuState ? sideMenu() : ''}
		</>
		)
}

export default Navigation;