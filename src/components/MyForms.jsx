import React, {
  useState,
  useEffect,
  useRef
} from 'react'


import Header from './Header.jsx'
import MyForm from './MyForm.jsx'
import { useForm } from 'react-hook-form'

function MyForms({getAllMyForms, navigation, myFormsLoad, myForms,
	getAllMyBrewingsById, getAllMyAromasById, getAllMyTastesById,
	delMyFormById, delMyBrewsById, delMyTastesById, delMyAromasById,
	tastesLoad, brewsLoad, aromasLoad,
	aromasById, tastesById, brewsById}) {

	const forms = []
	const [checkLS, setCheckLS] = useState(false)
	const [renderForms, setRenderForms] = useState([])
	// const [myFormsData, setMyFormsData] = useState([])	

	useEffect(()=>{
		getAllMyForms()
		// console.log('tyt')
	}, [])

	useEffect(()=>{
		// const timeoutId = setTimeout(() => {
			// const savedMyFormsData = localStorage.getItem('myForms');
			if (myForms) {
				
				// setMyFormsData(JSON.parse(savedMyFormsData))
				setCheckLS(true)
				// console.log(myForms)
				// console.log(JSON.parse(myForms))
				prepareFormsRender(JSON.parse(myForms))
				// setRenderForms(forms)
				// console.log(forms)
			}
		//   }, 1);

		//   return () => clearTimeout(timeoutId);

	}, [myFormsLoad, myForms])

	// useEffect(() => {

	// 	console.log(brewsById)
	// 	console.log(tastesById)
	// 	console.log(aromasById)

	// }, [brewsById, tastesById, aromasById])
	
	const removeFormFromArrById = (id) => {
		
		const updatedForms = renderForms.filter(form => form.key !== id);
		// console.log(id);
		// console.log(forms[0].key);
		setRenderForms(updatedForms);
		
	}


    const prepareFormsRender = (myFormsData) => {

        for (let formData of Object.values(myFormsData)[0]) {
            forms.push(
                <MyForm
                    navigation={navigation}
                    formData={formData}
                    getAllMyBrewingsById={getAllMyBrewingsById}
                    getAllMyAromasById={getAllMyAromasById}
                    getAllMyTastesById={getAllMyTastesById}
                    delMyFormById={delMyFormById}
                    delMyBrewsById={delMyBrewsById}
                    delMyTastesById={delMyTastesById}
                    delMyAromasById={delMyAromasById}
                    // tastesLoad={tastesLoad}
                    // brewsLoad={brewsLoad}
                    // aromasLoad={aromasLoad}
                    // aromasById={aromasById}
                    // tastesById={tastesById}
                    // brewsById={brewsById}
                    getAllMyForms={getAllMyForms}
                    key={formData.sessionId}
                    removeFormFromArrById={removeFormFromArrById}
                />
            );
        }
        setRenderForms(forms);
    };


	if (!checkLS) {
		// if (myFormsLoad ) {
		
		return(
			<>
			<Header navigation={navigation}/>
			<div className="myforms">
				<h2 className="header__myforms">Ищем ваши формы...</h2>
			</div>
		</>
		)
	}

	if (renderForms.length === 0) {
		return(
			<>
			<Header navigation={navigation}/>
			<div className="myforms">
				<h2 className="header__myforms">У вас пока нет форм</h2>
			</div>
		</>
		)
	}

	return(
		<>
			<Header navigation={navigation}/>
			<div className="myforms">
				<h2 className="header__myforms">Мои формы</h2>
				{renderForms}
			</div>
		</>

		)
}

export default MyForms;