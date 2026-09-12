import React, {
	useState,
	useEffect,
	useRef
} from 'react'
import {
	NavLink,
} from "react-router-dom";
import { usePopup } from './PopupContext.jsx';
import { useT } from '../i18n/index.js';
import SuggestionForm from './SuggestionForm.jsx';
import VoiceGuide from './VoiceGuide.jsx';

// The current page's name, shown beside the hamburger. Message keys, resolved
// per language. Order matters: the first match wins, so the more specific
// paths (form_submit, form_1) come before anything they are a prefix of.
const PAGE_TITLES = [
	['voice_import', 'voice.wholeSession'],
	['form_submit', 'page.formSubmit'],
	['form_1', 'page.form1'],
	['form_2', 'page.form2'],
	['profile', 'nav.profile'],
	['my_forms', 'nav.myForms'],
	['blog', 'nav.feed'],
	['sign-up', 'auth.signUp'],
	['sign-in', 'auth.signIn'],
];

// Thin line-art icons in the pale green of the site logo (outline style,
// like the leaf/tea-bowl artwork), instead of colored emoji.
const NavIcon = ({ children }) => (
	<svg className="navigation__link-icon" viewBox="0 0 24 24"
		fill="none" stroke="currentColor" strokeWidth="1.6"
		strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
		{children}
	</svg>
);

const ICONS = {
	leaf: (
		<NavIcon>
			<path d="M6 20.5c0-9 4.5-13.5 13.5-15.5-1.5 9-5.5 13.5-13.5 15.5z" />
			<path d="M6 20.5c3-6 7-10 10.5-12.5" />
		</NavIcon>
	),
	drop: (
		<NavIcon>
			<path d="M12 3.5c4 4.8 6 7.9 6 10.5a6 6 0 1 1-12 0c0-2.6 2-5.7 6-10.5z" />
		</NavIcon>
	),
	bowl: (
		<NavIcon>
			<path d="M3.5 10.5h17c-.5 5.5-4 8.5-8.5 8.5s-8-3-8.5-8.5z" />
			<path d="M9 6.5c2-1.5 4-1.5 6 0" />
		</NavIcon>
	),
	book: (
		<NavIcon>
			<path d="M12 6.5c-2-1.5-4.7-2-7.5-2v13c2.8 0 5.5.5 7.5 2 2-1.5 4.7-2 7.5-2v-13c-2.8 0-5.5.5-7.5 2z" />
			<path d="M12 6.5v13" />
		</NavIcon>
	),
	user: (
		<NavIcon>
			<circle cx="12" cy="8" r="3.5" />
			<path d="M5 20c1.5-3.5 4-5 7-5s5.5 1.5 7 5" />
		</NavIcon>
	),
	bulb: (
		<NavIcon>
			<path d="M9 18h6M10 21h4" />
			<path d="M12 3a6 6 0 0 0-4 10.5c.8.7 1 1.5 1 2.5h6c0-1 .2-1.8 1-2.5A6 6 0 0 0 12 3z" />
		</NavIcon>
	),
	mic: (
		<NavIcon>
			<rect x="9" y="3" width="6" height="11" rx="3" />
			<path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" />
		</NavIcon>
	),
	upload: (
		<NavIcon>
			<path d="M12 16V4M8.5 7.5 12 4l3.5 3.5" />
			<path d="M4.5 15v3.5a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5V15" />
		</NavIcon>
	),
};

// Titles and labels are message keys, resolved per language at render time.
const MENU_SECTIONS = [
	{
		title: 'nav.tasting',
		links: [
			{ to: '/form_1', icon: 'leaf', label: 'nav.stage1' },
			{ to: '/form_2', icon: 'drop', label: 'nav.stage2' },
			// An action that produces data, so it belongs with the tasting
			// steps rather than under «Справка» beside the voice guide.
			{ to: '/voice_import', icon: 'upload', label: 'nav.voiceImport' },
		],
	},
	{
		title: 'nav.records',
		links: [
			{ to: '/my_forms', icon: 'bowl', label: 'nav.myForms' },
			{ to: '/blog', icon: 'book', label: 'nav.feed' },
		],
	},
	{
		title: 'nav.account',
		links: [
			{ to: '/profile', icon: 'user', label: 'nav.profile' },
		],
	},
];

function Navigation(props) {

	const { openPopup } = usePopup();
	const { t, url } = useT();
	const [menuState, setMenuState] = useState(false)
	const [currentLocation, setCurrentLocation] = useState('')

	const ref = useRef(null);

	const handleLocation = () => {
		const loc = document.location.href
		const match = PAGE_TITLES.find(([path]) => loc.includes(path));
		setCurrentLocation(match ? match[1] : '')
	}

	const handleClickOutside = (event) => {
		if (ref.current && !ref.current.contains(event.target) && event.target.tagName !== 'BUTTON') {
			setMenuState(false)
		}
	};

	useEffect(() => {
		handleLocation()
		const handleEsc = (event) => {
			if (event.key === 'Escape') setMenuState(false)
		};
		document.body.addEventListener('click', handleClickOutside, true);
		document.addEventListener('keydown', handleEsc);
		return () => {
			document.body.removeEventListener('click', handleClickOutside, true);
			document.removeEventListener('keydown', handleEsc);
		};
	}, []);

	// Lock page scroll while the menu is open.
	useEffect(() => {
		document.body.style.overflow = menuState ? 'hidden' : '';
		return () => { document.body.style.overflow = ''; };
	}, [menuState]);

	const closeMenu = () => setMenuState(false);

	function navBtn() {
		return (
			<>
				<h2 className="header__navigation">{currentLocation ? t(currentLocation) : ''}</h2>
				<button className='navigation__hamburger' aria-label={t('nav.openMenu')}
					onClick={() => setMenuState(!menuState)}></button>
			</>
		)
	}

	function sideMenu() {
		return (
			<>
				<div className="navigation__background" onClick={closeMenu}></div>
				<nav className="navigation__side" ref={ref} aria-label={t('nav.mainMenu')}>
					<div className="navigation__side-head">
						<span className="navigation__side-title">{t('nav.menu')}</span>
					</div>
					{MENU_SECTIONS.map((section) => (
						<div className="navigation__section" key={section.title}>
							<span className="navigation__section-title">{t(section.title)}</span>
							{section.links.map((link) => (
								<NavLink key={link.to} to={url(link.to)} onClick={closeMenu}
									className={({ isActive }) => (isActive ? 'navigation__link navigation__link_active' : 'navigation__link')}>
									{ICONS[link.icon]}
									{t(link.label)}
								</NavLink>
							))}
						</div>
					))}
					<div className="navigation__section">
						<span className="navigation__section-title">{t('nav.help')}</span>
						<button type="button" className="navigation__link navigation__link_button"
							onClick={() => { closeMenu(); openPopup(<VoiceGuide />); }}>
							{ICONS.mic}
							{t('nav.voiceNotes')}
						</button>
					</div>
					<div className="navigation__section">
						<span className="navigation__section-title">{t('nav.feedback')}</span>
						<button type="button" className="navigation__link navigation__link_button"
							onClick={() => { closeMenu(); openPopup(<SuggestionForm />); }}>
							{ICONS.bulb}
							{t('nav.suggest')}
						</button>
					</div>
					<button className="navigation__close navigation__close_corner" aria-label={t('nav.closeMenu')}
						onClick={closeMenu}>&times;</button>
				</nav>
			</>
		)
	}

	return (
		<>
			{navBtn()}
			{menuState ? sideMenu() : ''}
		</>
	)
}

export default Navigation;
