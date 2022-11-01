import React, {
  useState,
  useEffect,
  useRef
} from 'react'
import {
  NavLink,
} from "react-router-dom";
// import hamburgerBtn from '../images/menu_icon_mobile.svg';


function Navigation(props) {

	const [menuState, setMenuState] = useState(false)

	const navStyle = menuState ? `navigation__side` : `navigation`

	const addMenuBackground = <div className="navigation__background"></div>
	const navLinkStyleActive = 'navigation__link_active'
	const navLinkStyle = 'navigation__link'

	const [isComponentVisible, setIsComponentVisible] = useState(true);
	const ref = useRef(null);

	const handleClickOutside = (event) => {

	  if (ref.current && !ref.current.contains(event.target) && event.path[0].tagName !== 'BUTTON') {
	  	console.log(ref.current)
	    setMenuState(false)
	  }

	};

	useEffect(() => {
	  document.body.addEventListener('click', handleClickOutside, true);
	  return () => {
	      document.body.removeEventListener('click', handleClickOutside, true);
	  };
	}, []);

	const openMenu = () =>{

    menuState ? setMenuState(false) : setMenuState(true) 

  }

  function navBtn(){

  	return(
  		<>
  		<h2 className="header__navigation">Форма</h2>
      <button className='navigation__hamburger' 
      onClick={openMenu} alt="Кнопка меню"></button>
      </>
		)

  }

  function sideMenu(addMenuBackground){
  	console.log(menuState)
    return(
      <>
      {addMenuBackground}
      <nav className={navStyle} ref={ref}>
      	<NavLink className={({ isActive }) => (isActive ? `${navLinkStyleActive}` : `${navLinkStyle}`)}  to="/form_1">Форма</NavLink>
        <NavLink className={({ isActive }) => (isActive ? `${navLinkStyleActive}` : `${navLinkStyle}`)}   to="/profile">Профиль</NavLink>
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