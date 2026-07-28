import React, {
	useState,
	useEffect,
	useRef
} from 'react'

import PopupButton from './PopupButton.jsx';

import Header from './Header.jsx'
import Form from './Form.jsx'
import { useMyFormConext } from './MyFormConext.jsx';
import { teaTypeLabels } from '../utils/teaTypes.js';
import { Select, MenuItem } from '@mui/material';

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
	const [checkLS, setCheckLS] = useState(false)
	const [renderForms, setRenderForms] = useState([])
	const [removed, setRemoved] = useState(false)

	// Blog feed controls (server-side pagination/filter/sort).
	const [page, setPage] = useState(1)
	const [typeFilter, setTypeFilter] = useState('')
	const [sortOrder, setSortOrder] = useState('date')

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
		if (myForms) {
			setCheckLS(true)
			prepareFormsRender(myForms)
		}
	}, [myForms, mySort])

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
				/>
			);
		}
		setRenderForms(forms);
	};


	if (!checkLS) {
		return (
			<>
				<Header navigation={navigation} />
				<div className="myforms">
					<h2 className="header__myforms">Ищем формы...</h2>
				</div>
			</>
		)
	}

	const myFormsControls = () => {
		if (!isMyForms) return null;
		return (
			<div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '0 0 16px 0' }}>
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
			</div>
		);
	};

	const blogControls = () => {
		if (!isBlog) return null;
		return (
			<div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '0 0 16px 0' }}>
				<Select size="small" sx={selectSx} MenuProps={selectMenuProps}
					value={typeFilter} displayEmpty
					inputProps={{ 'aria-label': 'Фильтр по типу чая' }}
					onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}>
					<MenuItem value="">Все типы чая</MenuItem>
					{teaTypeLabels.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
				</Select>
				<Select size="small" sx={selectSx} MenuProps={selectMenuProps}
					value={sortOrder}
					inputProps={{ 'aria-label': 'Сортировка' }}
					onChange={(e) => { setSortOrder(e.target.value); setPage(1); }}>
					<MenuItem value="date">Сначала новые</MenuItem>
					<MenuItem value="-date">Сначала старые</MenuItem>
					<MenuItem value="rating">Рейтинг: по убыванию</MenuItem>
					<MenuItem value="-rating">Рейтинг: по возрастанию</MenuItem>
				</Select>
			</div>
		);
	};

	const pagination = () => {
		if (!isBlog || !myForms || !myForms.pages || myForms.pages <= 1) return null;
		return (
			<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', margin: '12px 0', color: '#ffffff' }}>
				<button style={pageBtnStyle} disabled={page <= 1}
					onClick={() => setPage(page - 1)}>←</button>
				<span>{page} / {myForms.pages}</span>
				<button style={pageBtnStyle} disabled={page >= myForms.pages}
					onClick={() => setPage(page + 1)}>→</button>
			</div>
		);
	};

	if (renderForms.length === 0) {
		return (
			<>
				<Header navigation={navigation} />
				<div className="myforms">
					<h2 className="header__myforms">{isMyForms ? 'Мои Формы' : 'Публичные формы'}</h2>
					{blogControls()}
					<h2 className="header__myforms">{isMyForms ? 'У вас пока нет форм' : 'Ничего не найдено'}</h2>
				</div>
				<PopupButton naviagteTo={'/form_1'} content={'Создать форму'}/>
			</>
		)
	}

	return (
		<>
			<Header navigation={navigation} />
			<div className="myforms">
				<h2 className="header__myforms">{isMyForms ? 'Мои Формы' : 'Публичные формы'}</h2>
				{blogControls()}
				{/* Only with something to sort — a lone select above "у вас пока
				    нет форм" is noise, and sorting cannot bring the list back. */}
				{myFormsControls()}
				{renderForms}
				{pagination()}
			</div>
			<PopupButton naviagteTo={'/form_1'} content={'Создать форму'}/>
		</>

	)
}

export default Forms;