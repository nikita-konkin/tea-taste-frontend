import React, {
	useState,
	useEffect,
	useRef
} from 'react'

import PopupButton from './PopupButton.jsx';

import Header from './Header.jsx'
import Form from './Form.jsx'
import { useMyFormConext } from './MyFormConext.jsx';

function Forms({ forms, navigation,
	isMyForms, isBlog,
	brewingsById, aromasById, tastesById,
	delFormById, delBrewsById, delTastesById, delAromasById,
}) {

	const { myForms, removedFormById, 
		removedBrewsById, removedTastesById, 
		removedAromasById
	} = useMyFormConext();
	const [checkLS, setCheckLS] = useState(false)
	const [renderForms, setRenderForms] = useState([])
	const [removed, setRemoved] = useState(false)

	useEffect(() => {
		forms()
	}, [isMyForms, isBlog])

	useEffect(() => {
		if (myForms) {
			setCheckLS(true)
			prepareFormsRender(myForms)
		}
	}, [myForms])

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


	const prepareFormsRender = (myFormsData) => {
		const forms = []
		for (let formData of Object.values(myFormsData)[0]) {
			forms.push(
				<Form
					navigation={navigation}
					formData={formData}
					brewingsById={brewingsById}
					aromasById={aromasById}
					tastesById={tastesById}
					removeFormFromArrById={removeFormFromArrById}
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

	if (renderForms.length === 0) {
		return (
			<>
				<Header navigation={navigation} />
				<div className="myforms">
					<h2 className="header__myforms">{isMyForms ? 'У вас пока нет форм' : 'Пока нет публичных форм'}</h2>
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
				{renderForms}
			</div>
			<PopupButton naviagteTo={'/form_1'} content={'Создать форму'}/>
		</>

	)
}

export default Forms;