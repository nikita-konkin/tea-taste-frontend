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
	const [currentLocation, setCurrentLocation] = useState('None')

	const navStyle = menuState ? `navigation__side` : `navigation`
	const addMenuBackground = <div className="navigation__background"></div>
	const navLinkStyleActive = 'navigation__link_active'
	const navLinkStyle = 'navigation__link'

	const [isComponentVisible, setIsComponentVisible] = useState(true);
	const ref = useRef(null);

	const handleLocation = () => {
		const loc = document.location.href
		loc.includes('form_1') ? setCurrentLocation('Форма №1') : setCurrentLocation('None')
		loc.includes('form_2') ? setCurrentLocation('Форма №2') : setCurrentLocation('None')
		loc.includes('profile') ? setCurrentLocation('ЛК') : setCurrentLocation('None')
		loc.includes('my_forms') ? setCurrentLocation('ЛК') : setCurrentLocation('None')
		loc.includes('blog') ? 	setCurrentLocation('Блог'): setCurrentLocation('None')
		loc.includes('form_submit') ? setCurrentLocation('Проверка формы') : setCurrentLocation('None') 
	}

	const handleClickOutside = (event) => {
		
	  if (ref.current && !ref.current.contains(event.target) && event.path[0].tagName !== 'BUTTON') {
	    setMenuState(false)
	  }

	};

	useEffect(() => {
		handleLocation()
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
  		<h2 className="header__navigation">{currentLocation}</h2>
      <button className='navigation__hamburger' 
      onClick={openMenu} alt="Кнопка меню"></button>
      </>
		)

  }

  function sideMenu(addMenuBackground){
    return(
      <>
      {addMenuBackground}
      <nav className={navStyle} ref={ref}>
      	<NavLink className={({ isActive }) => (isActive ? `${navLinkStyleActive}` : `${navLinkStyle}`)} to="/form_1">Форма этап №1</NavLink>
      	{/*<NavLink className={({ isActive }) => (isActive ? `${navLinkStyleActive}` : `${navLinkStyle}`)} to="/form_2">Форма этап №2</NavLink>*/}
        <NavLink className={({ isActive }) => (isActive ? `${navLinkStyleActive}` : `${navLinkStyle}`)} to="/profile">Профиль</NavLink>
        <NavLink className={({ isActive }) => (isActive ? `${navLinkStyleActive}` : `${navLinkStyle}`)} to="/my_forms">Мои формы</NavLink>
        <NavLink className={({ isActive }) => (isActive ? `${navLinkStyleActive}` : `${navLinkStyle}`)} to="/blog">Блог</NavLink>
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