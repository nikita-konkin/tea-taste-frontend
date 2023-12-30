import React, { useState, useEffect, useRef } from 'react';
import Header from './Header.jsx'
import FormButton from './FormButton.jsx';
import AromaStages from './AromaStages.jsx';
import TasteStages from './TasteStages.jsx';
import TeaTextField from './TeaTextField.jsx';
import TeaRaiting from './TeaRaiting.jsx';


function TeaFormStage1(props) {

	const options = [
	  { title: "The Shawshank Redemption"},
	  { title: "The Godfather"},
	  { title: "The Godfather: Part II"}
	];

	const straitNum = useRef(null);
	const aromaStages = useRef({});
	const tasteStages = useRef({});
	// const commentText = useRef({});
	// const ratingValue = useRef({});
	const brewValue = useRef({});

	const [straits, setStraits] = useState([])
	const [isSubmitted, setIsSubmitted] = useState(false)

	let [stagesCount, setStagesCount] = useState(1)
	const stagesArray = []

	useEffect(() => {
		clearStageArraysIf(stagesCount)
		// localStorage.setItem()
  	addStrait()
  	setStraits(stagesArray)
  }, [stagesCount]);

	useEffect(()=>{
		// brewValue.current[stagesCount + '_brewingTime'] = 7
		// brewValue.current[stagesCount + '_description'] = ''		
		
		brewValue.current[stagesCount] = {
			brewingTime: '00:01:30',
			description: '',
			brewingRating: 7
		}

	})

	const addStrait = (i) => {
		for (let i = 0; i < stagesCount; i++) {
			stagesArray.push(renderStraits(i+1))
		}
	}

	const renderStraits = (stageCount) => {

		straitNum.current = stageCount
		return(
			<section className="form_strait-stages">
				<h4 className="form_strait-header">Пролив №{stageCount}</h4>
				<AromaStages options={options} stagesHandler={handleAromaInputStage} 
					clearFnc={clearObjByKeyIf} aromaStages={aromaStages.current}/>
				<TasteStages options={options} stagesHandler={handleTasteInputStage} 
					clearFnc={clearObjByKeyIf} tasteStages={tasteStages.current}/>
				<TeaTextField 
					commentText={brewValue}
					straitNum={straitNum.current}
					woStraitNum = {false}
					label = 'Комментарий к проливу'
				/>
				<TeaRaiting ratingValue={brewValue} straitNum={straitNum.current}/>
			</section>
			)
	}

	function clearStageArraysIf() {

		if (straitNum.current > stagesCount){
			clearObjByKeyIf(straitNum.current, aromaStages.current)
			clearObjByKeyIf(straitNum.current, tasteStages.current)
		}
	}

	function clearObjByKeyIf(value, obj, current = false){

		Object.keys(obj).forEach((i)=>{
			const num = String(i).split('').map(Number)
			if (!current) {
				if (num[0] == value) {
					delete obj[i]
				}
			} else {
				if (num[1] == value) {
					delete obj[i]
				}
			}
		});
	}

	function handleAromaInputStage(value, key){
		// console.log(String(straitNum.current))
		aromaStages.current[String(straitNum.current) + String(key)] = value
		// console.log(aromaStages)
	}

	function handleTasteInputStage(value, key){
		// console.log(String(straitNum.current))
		tasteStages.current[String(straitNum.current) + String(key)] = value
		// console.log(tasteStages)
	}

	function postAromaData(formId){

		for (const [key, data] of Object.entries(aromaStages.current)) {
			const keys = String(key).split('').map(Number)
			const brewId = keys[0]
			const aromaShadeId = keys[1]
			const aromaStage = keys[2]
			if (aromaStage == 1) {
				props.postFormStage2Aroma(data, formId, brewId, aromaShadeId)
			} else {
				props.patchFormStage2Aroma(data, formId, brewId, aromaShadeId, aromaStage)
			}
		}
	}

	function postTasteData(formId){
		// console.log(tasteStages.current)
		for (const [key, data] of Object.entries(tasteStages.current)) {
			const keys = String(key).split('').map(Number)
			const brewId = keys[0]
			const tasteShadeId = keys[1]
			const tasteStage = keys[2]
			if (tasteStage == 1) {
				props.postFormStage2Taste(data, formId, brewId, tasteShadeId)
			} else {
				props.patchFormStage2Taste(data, formId, brewId, tasteShadeId, tasteStage)
			}
		}
	}


	function postBrewData(formId){

		// const keys = Object.keys(brewValue.current)
		// const ids = keys.map(str => {return parseInt(str, 10); })
		// const maxIds = Math.max.apply(Math, ids)
	
		// const brewId = keys[0]
		// const brewTempId = keys[1]
		// const brewDataType = keys[2]

		// if (brewId == 1) {
		// 	props.postFormStage2Brew(data, formId, brewId)
		// } else {
		// 	props.patchFormStage2Brew(data, formId, brewId)
		// }


		for (const [key, data] of Object.entries(brewValue.current)) {
			// const keys = key.split('_')
			// const brewId = keys[0]
			// const brewTempId = keys[1]
			// const brewDataType = keys[1]
			// console.log(key)
			// console.log(data)
			if (!isSubmitted){
				props.postFormStage2Brew(data, formId, key)
			} else {
				props.patchFormStage2Brew(data, formId, key)
			}
	

		}
		// props.postFormStage2Brew(data, formId, brewId)

	}
	function onSubmit(e){
		e.preventDefault()
		const formId = '0C7C95FA02C054C3B96517C0'
		postAromaData(formId)
		postTasteData(formId)
		postBrewData(formId)
		setIsSubmitted(true)
		// props.postFormStage2Aroma(data, formId, brewId, aromaShadeId)
		// props.nextStage()

	}

	return(
		<>
			<Header navigation={props.navigation}/>
			<form className="form">
				<h3 className="form_header">Шаг 2 основаня информация</h3>

				{straits}

				<FormButton 
					buttonName={'Добавить еще пролив'}
					onClick={()=>{stagesCount !== 5 ? setStagesCount(stagesCount+=1):setStagesCount(stagesCount)}}
				/>
				<FormButton 
					buttonName={'Удалить последний пролив'}
					onClick={()=>{stagesCount !== 1 ? setStagesCount(stagesCount-=1):setStagesCount(stagesCount)}}
				/>
				<FormButton 
					onClick={()=>{props.prevStage()}}
					buttonName={'Назад'}
				/>
				<FormButton 
					onClick={(e)=>{onSubmit(e)}}
					buttonName={'Далее (проверка формы)'}
				/>
			</form>
		</>
		)
}

export default TeaFormStage1;