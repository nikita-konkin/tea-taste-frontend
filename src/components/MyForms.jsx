import React, {
	useState,
	useEffect,
	useRef
} from 'react'


import Header from './Header.jsx'
import MyForm from './MyForm.jsx'
import { useMyFormConext } from './MyFormConext.jsx';

function MyForms({ getAllMyForms, navigation,
	// myFormsLoad, myForms,
	getAllMyBrewingsById, getAllMyAromasById, getAllMyTastesById,
	delMyFormById, delMyBrewsById, delMyTastesById, delMyAromasById,
	// tastesLoad, brewsLoad, aromasLoad,
	// aromasById, tastesById, brewsById
}) {

	const { myForms, removedFormById, removedBrewsById, removedTastesById, removedAromasById

	} = useMyFormConext();
	// const forms = []
	const [checkLS, setCheckLS] = useState(false)
	const [renderForms, setRenderForms] = useState([])
	const [removed, setRemoved] = useState(false)

	useEffect(() => {
		// console.log('myFormsUP!')
		getAllMyForms()
		// console.log('tyt')
	}, [])

	useEffect(() => {
		// console.log('myForms')
		if (myForms) {
			setCheckLS(true)
			prepareFormsRender(myForms)
		}
	}, [myForms])

	useEffect(() => {
		// console.log('removedUP')
		if (removedFormById && removed) {
			// console.log('removed')
			setCheckLS(false)
			
			// getAllMyForms();
		}
	}, [removedFormById, removedAromasById, removedBrewsById, removedTastesById, removed])

	// useEffect(() => {

	// 	console.log(brewsById)
	// 	console.log(tastesById)
	// 	console.log(aromasById)

	// }, [brewsById, tastesById, aromasById])

	const removeFormFromArrById = (id) => {

		setCheckLS(false)
		setRemoved(true)

		delMyBrewsById(id);
		delMyTastesById(id);
		delMyAromasById(id);
		delMyFormById(id);

		// removeFormFromArrById(id);

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
				<MyForm
					navigation={navigation}
					formData={formData}
					getAllMyBrewingsById={getAllMyBrewingsById}
					getAllMyAromasById={getAllMyAromasById}
					getAllMyTastesById={getAllMyTastesById}
					removeFormFromArrById={removeFormFromArrById}
					key={formData.sessionId}
				/>
			);
		}
		setRenderForms(forms);
	};


	if (!checkLS) {
		// if (myFormsLoad ) {

		return (
			<>
				<Header navigation={navigation} />
				<div className="myforms">
					<h2 className="header__myforms">Ищем ваши формы...</h2>
				</div>
			</>
		)
	}

	if (renderForms.length === 0) {
		return (
			<>
				<Header navigation={navigation} />
				<div className="myforms">
					<h2 className="header__myforms">У вас пока нет форм</h2>
				</div>
			</>
		)
	}

	return (
		<>
			<Header navigation={navigation} />
			<div className="myforms">
				<h2 className="header__myforms">Мои формы</h2>
				{renderForms}
			</div>
		</>

	)
}

export default MyForms;