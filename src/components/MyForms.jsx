import React, {
  useState,
  useEffect,
  useRef
} from 'react'


import Header from './Header.jsx'
import MyForm from './MyForm.jsx'
import { useForm } from 'react-hook-form'

function MyForms(props) {

	const forms = []
	const [checkLS, setCheckLS] = useState(false)
	const [renderForms, setRenderForms] = useState([])
	// const [myFormsData, setMyFormsData] = useState([])	

	useEffect(()=>{
		props.getAllMyForms()
		// console.log('tyt')
	}, [])

	useEffect(()=>{
		const timeoutId = setTimeout(() => {
			const savedMyFormsData = localStorage.getItem('myForms');
			if (savedMyFormsData) {
				
				// setMyFormsData(JSON.parse(savedMyFormsData))
				setCheckLS(true)
				prepareFormsRender(JSON.parse(savedMyFormsData))
				setRenderForms(forms)
			}
		  }, 3000);

		  return () => clearTimeout(timeoutId);

	}, [])
	

	const prepareFormsRender = (myFormsData) => {
		for (let formData of Object.values(myFormsData)[0]) {
			forms.push(<MyForm navigation={props.navigation} formData={formData}/>)
		}
	}


	if (!checkLS) {
		
		return(
			<>
			<Header navigation={props.navigation}/>
			<div className="myforms">
				<h2 className="header__myforms">Ищем ваши формы...</h2>
			</div>
		</>
		)
	}

	return(
		<>
			<Header navigation={props.navigation}/>
			<div className="myforms">
				<h2 className="header__myforms">Мои формы</h2>
				{renderForms}
			</div>
		</>

		)
}

export default MyForms;