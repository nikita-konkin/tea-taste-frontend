import React, {
	useState,
	useEffect,
	useRef
} from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'

import PopupButton from './PopupButton.jsx';

import Header from './Header.jsx'
import PageMeta from './PageMeta.jsx'
import SiteFooter from './SiteFooter.jsx'
import Form from './Form.jsx'
import VoiceGuide, { MicIcon } from './VoiceGuide.jsx';
import { useMyFormConext } from './MyFormConext.jsx';
import { usePopup } from './PopupContext.jsx';
import { mainApi } from '../utils/MainAPI.jsx';
import { teaTypeSlugs, teaTypeBySlug } from '../utils/teaTypes.js';
import { Select, MenuItem } from '@mui/material';

// Anything else in ?sort= is ignored rather than passed through: the value goes
// into a URL a stranger can edit, and the feed should answer with its default
// instead of an error page.
const SORT_ORDERS = ['date', '-date', 'rating', '-rating'];

const controlStyle = {
	background: 'rgba(255, 255, 255, 0.12)',
	border: '1px solid rgba(255, 255, 255, 0.30)',
	borderRadius: '8px',
	color: '#ffffff',
	padding: '6px 8px',
	fontFamily: 'inherit',
	fontSize: '14px',
	maxWidth: '100%',
};

// Same glass look as controlStyle, for the MUI filter/sort selects.
const selectSx = {
	color: '#ffffff',
	fontFamily: 'jura',
	fontSize: '14px',
	borderRadius: '8px',
	background: 'rgba(255, 255, 255, 0.12)',
	maxWidth: '100%',
	'& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.30)' },
	'&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#ffffff' },
	'&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#ffffff' },
	'& .MuiSelect-icon': { color: '#ffffff' },
	'& .MuiSelect-select': { padding: '6px 8px' },
};

// Dropdown paper: the same translucent green glass as the view popup, so the
// menu doesn't open as a native white list on the dark background.
const selectMenuProps = {
	PaperProps: {
		sx: {
			background: 'rgba(29, 92, 65, 0.85)',
			backdropFilter: 'blur(16px)',
			color: '#ffffff',
			borderRadius: '10px',
			border: '1px solid rgba(255, 255, 255, 0.25)',
			marginTop: '4px',
			'& .MuiMenuItem-root': {
				fontFamily: 'jura',
				fontSize: '14px',
				'&:hover': { background: 'rgba(255, 255, 255, 0.12)' },
				'&.Mui-selected': { background: 'rgba(255, 255, 255, 0.20)' },
				'&.Mui-selected:hover': { background: 'rgba(255, 255, 255, 0.25)' },
			},
		},
	},
};

const pageBtnStyle = {
	...controlStyle,
	cursor: 'pointer',
	padding: '6px 14px',
	// The arrows are links now, so they need the decoration and colour a button
	// got for free.
	display: 'inline-block',
	textDecoration: 'none',
	color: '#ffffff',
};

function Forms({ forms, navigation,
	isMyForms, isBlog,
	brewingsById, aromasById, tastesById,
	delFormById, delBrewsById, delTastesById, delAromasById,
	patchFormById,
}) {

	const { myForms, removedFormById,
		removedBrewsById, removedTastesById,
		removedAromasById
	} = useMyFormConext();
	const { openPopup } = usePopup();
	const navigate = useNavigate();
	// Moderation controls appear on blog cards for admins only. The blog is a
	// public page, so this asks the server and quietly settles on "not an admin"
	// for a signed-out visitor or any failure — the endpoints refuse anyway.
	const [isAdmin, setIsAdmin] = useState(false)
	const [checkLS, setCheckLS] = useState(false)
	const [renderForms, setRenderForms] = useState([])
	const [removed, setRemoved] = useState(false)

	// Blog feed controls (server-side pagination/filter/sort), read from the URL
	// rather than held in state.
	//
	// As component state none of this had an address: page 2 of the feed and
	// every tea type were the same URL as page 1, so they could not be linked,
	// shared, reloaded, or indexed — the whole public site was two URL shapes.
	// The tea type is a path segment (/blog/type/puer) and not a query
	// parameter, so each type has exactly one canonical address.
	const [searchParams, setSearchParams] = useSearchParams()
	const { typeSlug } = useParams()
	const teaType = typeSlug ? teaTypeBySlug(typeSlug) : null

	const page = Math.max(1, parseInt(searchParams.get('page'), 10) || 1)
	const sortOrder = SORT_ORDERS.includes(searchParams.get('sort'))
		? searchParams.get('sort')
		: 'date'
	const typeFilter = teaType ? teaType.label : ''

	// Base path of the feed the user is looking at — the type hub or the feed.
	const basePath = teaType ? `/blog/type/${teaType.slug}` : '/blog'

	// Page 1 is written as the bare path, not `?page=1`: two addresses for one
	// list is exactly the duplicate a canonical then has to undo.
	const feedUrl = (nextPage, nextSort = sortOrder) => {
		const params = new URLSearchParams()
		if (nextPage > 1) params.set('page', String(nextPage))
		if (nextSort !== 'date') params.set('sort', nextSort)
		const query = params.toString()
		return query ? `${basePath}?${query}` : basePath
	}

	// Changing the order starts again from page 1: page 3 of one ordering has
	// nothing to do with page 3 of another.
	const setSortOrder = (next) => {
		const params = new URLSearchParams(searchParams)
		if (next !== 'date') params.set('sort', next); else params.delete('sort')
		params.delete('page')
		setSearchParams(params)
	}

	// /my_forms sorts in the browser instead: the endpoint returns the whole
	// list in one response, so re-ordering it is free and a refetch would only
	// make the list flicker. The choice is remembered, since a user who prefers
	// their tastings by rating prefers that on every visit.
	const [mySort, setMySort] = useState(
		() => localStorage.getItem('myFormsSort') || 'date'
	)

	useEffect(() => {
		if (isBlog) {
			forms({ page, type: typeFilter, sort: sortOrder })
		} else {
			forms()
		}
	}, [isMyForms, isBlog, page, typeFilter, sortOrder])

	useEffect(() => {
		if (!isBlog || localStorage.getItem('loggedIn') !== 'true') return;
		mainApi.getProfile()
			.then((res) => setIsAdmin((res.data || res).role === 'admin'))
			.catch(() => setIsAdmin(false));
	}, [isBlog])

	// Blocking or deleting changes what belongs on the page, and the feed is
	// paginated server-side — refetching is the only honest way to redraw it.
	const refetchFeed = () => forms({ page, type: typeFilter, sort: sortOrder })

	// isAdmin belongs in the deps: the cards are built into state, and the role
	// arrives from its own request after the first build — without it the admin
	// sees a feed rendered while the answer was still "no".
	useEffect(() => {
		if (myForms) {
			setCheckLS(true)
			prepareFormsRender(myForms)
		}
	}, [myForms, mySort, isAdmin])

	useEffect(() => {
		if (removedFormById && removed) {
			setCheckLS(false)
		}
	}, [removedFormById, removedAromasById, removedBrewsById, removedTastesById, removed])

	const removeFormFromArrById = (id) => {

		setCheckLS(false)
		setRemoved(true)

		delBrewsById(id);
		delTastesById(id);
		delAromasById(id);
		delFormById(id);


		if (localStorage.getItem(`brews_${id}`)) {
			localStorage.removeItem(`brews_${id}`);
		}
		if (localStorage.getItem(`aromas_${id}`)) {
			localStorage.removeItem(`aromas_${id}`);
		}
		if (localStorage.getItem(`tastes_${id}`)) {
			localStorage.removeItem(`tastes_${id}`);
		}
		localStorage.removeItem(`myForms`);

	}


	// Comparators for the /my_forms list. Undated or unrated tastings sort last
	// rather than to the top, which is where a 0 default would put them.
	const mySortComparators = {
		date: (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
		'-date': (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
		rating: (a, b) => (b.averageRating || 0) - (a.averageRating || 0),
		'-rating': (a, b) => (a.averageRating || 0) - (b.averageRating || 0),
		name: (a, b) => String(a.nameRU || '').localeCompare(String(b.nameRU || ''), 'ru'),
		'-name': (a, b) => String(b.nameRU || '').localeCompare(String(a.nameRU || ''), 'ru'),
	}

	const prepareFormsRender = (myFormsData) => {
		const forms = []
		// The blog arrives already sorted by the server; only /my_forms is ours
		// to order. Copied first — this array is the context's own state.
		const list = Object.values(myFormsData)[0]
		const ordered = isMyForms
			? [...list].sort(mySortComparators[mySort] || mySortComparators.date)
			: list

		for (let formData of ordered) {
			forms.push(
				<Form
					navigation={navigation}
					formData={formData}
					brewingsById={brewingsById}
					aromasById={aromasById}
					tastesById={tastesById}
					removeFormFromArrById={removeFormFromArrById}
					patchFormById={patchFormById}
					key={formData.sessionId}
					isMyForms={isMyForms}
					isAdmin={isAdmin}
					onModerated={refetchFeed}
				/>
			);
		}
		setRenderForms(forms);
	};


	// withSort is false on the empty page: sorting cannot bring the list back,
	// but the voice guide is exactly what a user with no tastings yet is looking
	// for, so the row itself stays.
	const myFormsControls = (withSort) => {
		if (!isMyForms) return null;
		return (
			<div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', margin: '0 0 16px 0' }}>
				{withSort && (
					<Select size="small" sx={selectSx} MenuProps={selectMenuProps}
						value={mySort}
						inputProps={{ 'aria-label': 'Сортировка' }}
						onChange={(e) => {
							setMySort(e.target.value);
							localStorage.setItem('myFormsSort', e.target.value);
						}}>
						<MenuItem value="date">Сначала новые</MenuItem>
						<MenuItem value="-date">Сначала старые</MenuItem>
						<MenuItem value="rating">Рейтинг: по убыванию</MenuItem>
						<MenuItem value="-rating">Рейтинг: по возрастанию</MenuItem>
						<MenuItem value="name">Название: А–Я</MenuItem>
						<MenuItem value="-name">Название: Я–А</MenuItem>
					</Select>
				)}
				{/* Not «О голосовых заметках»: in Jura a standalone «О» is
				    indistinguishable from a zero, and the button read "0 голосовых
				    заметках" on the real page. */}
				<button type="button" className="voicenote__button voiceguide__open"
					onClick={() => openPopup(<VoiceGuide />)}>
					<MicIcon />
					Как работают голосовые заметки
				</button>
			</div>
		);
	};

	const blogControls = () => {
		if (!isBlog) return null;
		return (
			<div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '0 0 16px 0' }}>
				{/* Picking a type navigates to that type's own page rather than
				    filtering in place: a hub with an address can be linked to,
				    indexed and ranked for the query people actually type
				    («пуэр отзывы»), and there is only ever one URL per type. */}
				<Select size="small" sx={selectSx} MenuProps={selectMenuProps}
					value={typeSlug || ''} displayEmpty
					inputProps={{ 'aria-label': 'Фильтр по типу чая' }}
					onChange={(e) => navigate(e.target.value ? `/blog/type/${e.target.value}` : '/blog')}>
					<MenuItem value="">Все типы чая</MenuItem>
					{teaTypeSlugs.map((t) => <MenuItem key={t.slug} value={t.slug}>{t.label}</MenuItem>)}
				</Select>
				<Select size="small" sx={selectSx} MenuProps={selectMenuProps}
					value={sortOrder}
					inputProps={{ 'aria-label': 'Сортировка' }}
					onChange={(e) => setSortOrder(e.target.value)}>
					<MenuItem value="date">Сначала новые</MenuItem>
					<MenuItem value="-date">Сначала старые</MenuItem>
					<MenuItem value="rating">Рейтинг: по убыванию</MenuItem>
					<MenuItem value="-rating">Рейтинг: по возрастанию</MenuItem>
				</Select>
			</div>
		);
	};

	const feedTitle = () => {
		if (isMyForms) return 'Мои Формы';
		if (teaType) return `${teaType.short} — дегустации`;
		return 'Публичные формы';
	};

	// /my_forms is behind a login and is in robots.txt as Disallow, so it says so
	// rather than competing with the feed for the same search result.
	//
	// The canonical deliberately keeps ?page but drops ?sort: the same tastings
	// reordered are the same page, and left alone each sort would be indexed as
	// a separate near-identical URL. Page 2 is genuinely different content and
	// keeps its own.
	const pageMeta = () => {
		if (isMyForms) return <PageMeta title="Мои дегустации" path="/my_forms" noIndex />;

		const canonical = page > 1 ? `${basePath}?page=${page}` : basePath;
		const suffix = page > 1 ? ` — страница ${page}` : '';

		if (teaType) {
			return (
				<PageMeta
					title={`${teaType.short}: дегустации и отзывы${suffix}`}
					description={`Дегустации, собранные читателями: ${teaType.short.toLowerCase()} — аромат, вкус, проливы, оценки и фотографии.`}
					path={canonical}
				/>
			);
		}

		return (
			<PageMeta
				title={`Лента дегустаций${suffix}`}
				description="Дегустации чая, которыми поделились участники: аромат, вкус, проливы, фотографии и голосовые заметки."
				path={canonical}
			/>
		);
	};

	// Anchors, not click handlers: pagination is how a crawler walks past the
	// first ten tastings, and as buttons page 2 onward existed for nobody but a
	// mouse. Disabled ends stay <span> — a link to nowhere is worse than none.
	const pagination = () => {
		if (!isBlog || !myForms || !myForms.pages || myForms.pages <= 1) return null;
		const arrow = (label, target, enabled) => (enabled
			? <Link style={pageBtnStyle} to={feedUrl(target)} rel={label === '←' ? 'prev' : 'next'}>{label}</Link>
			: <span style={{ ...pageBtnStyle, opacity: 0.4 }}>{label}</span>);
		return (
			<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', margin: '12px 0', color: '#ffffff' }}>
				{arrow('←', page - 1, page > 1)}
				<span>{page} / {myForms.pages}</span>
				{arrow('→', page + 1, page < myForms.pages)}
			</div>
		);
	};

	// The loading state used to return before pageMeta() was ever rendered, so
	// for as long as the fetch took, the page carried index.html's site-wide
	// defaults and no canonical at all — which is the whole window a crawler
	// gets. Every branch below now starts with the metadata.
	if (!checkLS) {
		return (
			<>
				{pageMeta()}
				<Header navigation={navigation} />
				<div className="myforms">
					<h2 className="header__myforms">Ищем формы...</h2>
				</div>
			</>
		)
	}

	if (renderForms.length === 0) {
		return (
			<>
				{pageMeta()}
				<Header navigation={navigation} />
				<div className="myforms">
					<h1 className="header__myforms">{feedTitle()}</h1>
					{blogControls()}
					{myFormsControls(false)}
					<h2 className="header__myforms">{isMyForms ? 'У вас пока нет форм' : 'Ничего не найдено'}</h2>
				</div>
				<PopupButton naviagteTo={'/form_1'} content={'Создать форму'}/>
				{isBlog && <SiteFooter />}
			</>
		)
	}

	return (
		<>
			{pageMeta()}
			<Header navigation={navigation} />
			<div className="myforms">
				<h1 className="header__myforms">{feedTitle()}</h1>
				{blogControls()}
				{myFormsControls(true)}
				{renderForms}
				{pagination()}
			</div>
			<PopupButton naviagteTo={'/form_1'} content={'Создать форму'}/>
			{isBlog && <SiteFooter />}
		</>

	)
}

export default Forms;