import React, { useState, useEffect, useRef } from 'react';
import Header from './Header.jsx'
import FormButton from './FormButton.jsx';
import AromaStages from './AromaStages.jsx';
import TasteStages from './TasteStages.jsx';
import TeaTextField from './TeaTextField.jsx';
import TeaRaiting from './TeaRaiting.jsx';

import { useTeaFormContext } from './TeaFormContext.jsx';

function TeaFormStage2(props) {

	const { 
		straitsStagesFormData, 
		updateStraitsStagesFormData, 
		aromaStagesFormData, 
		updateAromaStagesFormData, 
		tasteStagesFormData, 
		updateTasteStagesFormData } = useTeaFormContext();

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
	let straitStages = useRef({});
	// const brewValueLocal = useRef({});

	const [straits, setStraits] = useState([])
	const [isSubmitted, setIsSubmitted] = useState(false)

	let [stagesCount, setStagesCount] = useState(1)
	const stagesArray = []

	useEffect(()=>{
		console.log('update straitStages', straitStages.current)
	}, [stagesCount])

	useEffect(()=>{
		const obj_len = Object.keys(aromaStagesFormData).length
		
		if (obj_len != 0) {
			aromaStages.current = aromaStagesFormData
			console.log(aromaStages.current)
		}

	}, [])

	useEffect(()=>{
		const obj_len = Object.keys(tasteStagesFormData).length
		
		if (obj_len != 0) {
			tasteStages.current = tasteStagesFormData
		}
		
	}, [])

	useEffect(()=>{
		const obj_len = Object.keys(straitsStagesFormData).length
		
		if (obj_len != 0) {
			const lastStageNumber = Object.keys(straitsStagesFormData)[obj_len-1].split('').map(Number)[0]
			straitStages.current = straitsStagesFormData
			setStagesCount(obj_len)
			renderStrait(lastStageNumber, stagesArray)
		} else {
			renderStrait(stagesCount, stagesArray)
		}
		
	}, [])


	
	const addStraitAndUpdateContext = () => {

		stagesCount !== 5 ? setStagesCount(stagesCount+=1):setStagesCount(stagesCount)
		renderStrait(stagesCount, stagesArray)

	}

	const removeStraitAndUpdateContext = () => {

		stagesCount !== 5 ? setStagesCount(stagesCount-=1):setStagesCount(stagesCount)
		clearStageArraysIf(stagesCount)
		addStrait(stagesCount)
		setStraits(stagesArray)
		updateStraitsStagesFormData(straitStages.current)
	}

	const renderStrait = (stagesCount, stagesArray) => {
		// clearStageArraysIf(stagesCount)
		addStrait(stagesCount)
		setStraits(stagesArray)
		console.log(stagesCount)
	}

	const addStrait = (stagesCount) => {
		console.log(stagesCount)
		for (let i = 0; i < stagesCount; i++) {
			stagesArray.push(renderStraitModule(i+1))
		}
	}

	const renderStraitModule = (stageCount) => {

		straitNum.current = stageCount
		return(
			<section className="form_strait-stages" id={straitNum.current}>
				<h4 className="form_strait-header">Пролив №{stageCount}</h4>
				<AromaStages options={options} stagesHandler={handleAromaInputStage} 
					clearFnc={clearObjByKeyIf}
					// defaultValues={aromaStages.current}
					straitNum={straitNum.current}
					/>
				<TasteStages options={options} stagesHandler={handleTasteInputStage} 
					clearFnc={clearObjByKeyIf} 
					straitNum={straitNum.current}
					// tasteStages={tasteStages.current}
					/>
				<TeaTextField 
					commentText={straitStages.current}
					id={1}
					stagesHandler={handleStraitInputStage}
					straitNum={straitNum.current}
					woStraitNum = {false}
					label = 'Комментарий к проливу'
				/>
				<TeaRaiting 
					id={2} 
					stagesHandler={handleStraitInputStage} 
					ratingValue={straitStages.current} 
					straitNum={straitNum.current}
				/>
			</section>
			)
	}

	function clearStageArraysIf(stagesCount) {
		console.log(stagesArray)
		if (straitNum.current > stagesCount){
			clearObjByKeyIf(straitNum.current, aromaStages.current)
			clearObjByKeyIf(straitNum.current, tasteStages.current)
			clearObjByKeyIf(straitNum.current, straitStages.current, true)
			// clearObjByKeyIf(straitNum.current, stagesArray, true, true)
			// console.log(stagesArray)
			// setStraits(straits)
			// delete straitStages.current[straitNum.current]
			// removeKeyFromTeaFormData(straitNum.current)
		}
	}

	function clearObjByKeyIf(value, obj, current=false, handleStagesArray=false){
		console.log(obj)
		Object.keys(obj).forEach((i)=>{
			const num = String(i).split('').map(Number)
			
			if (!current) {
				if (num[0] == value) {
					delete obj[i]
				}
			} else {
				// if (handleStagesArray) {
				// 	if (num[0]+1 == value) {
				// 		obj.pop()
				// 	}
				// } else {
				if (num[1] == value) {
					delete obj[i]
				}
				// }

			}
		});

	}

	function handleAromaInputStage(value, id){
		aromaStages.current[String(id.split('-')[0])] = value
		updateAromaStagesFormData(aromaStages.current)
	}

	function handleTasteInputStage(value, id){
		tasteStages.current[String(id.split('-')[0])] = value
		updateTasteStagesFormData(tasteStages.current)
	}

	function handleStraitInputStage(value, id){
		straitStages.current[id] = value
		updateStraitsStagesFormData(straitStages.current)
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

	// function postBrewData(formId){

	// 	for (const [key, data] of Object.entries(brewValue.current)) {

	// 		if (!isSubmitted){
	// 			props.postFormStage2Brew(data, formId, key)
	// 		} else {
	// 			props.patchFormStage2Brew(data, formId, key)
	// 		}
	

	// 	}

	// }

	function onSubmit(e){
		e.preventDefault()
		const formId = '0C7C95FA02C054C3B96517C0'
		postAromaData(formId)
		postTasteData(formId)
		// postBrewData(formId)
		setIsSubmitted(true)
		// props.postFormStage2Aroma(data, formId, brewId, aromaShadeId)
		// props.nextStage()
		// updateStraitsStagesFormData(aromaStages.current)
		// updateStraitsStagesFormData(tasteStages.current)
		

	}

	return(
		
		<>
			<Header navigation={props.navigation}/>
			<form className="form">
				<h3 className="form_header">Шаг 2 основаня информация</h3>

				{straits}

				<FormButton 
					buttonName={'Добавить еще пролив'}
					onClick={addStraitAndUpdateContext}
				/>
				<FormButton 
					buttonName={'Удалить последний пролив'}
					onClick={removeStraitAndUpdateContext}
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

export default TeaFormStage2;