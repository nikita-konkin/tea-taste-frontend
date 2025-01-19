import React, { useState, useEffect, useRef } from 'react';
import Header from './Header.jsx'
import FormButton from './FormButton.jsx';
import AromaStages from './AromaStages.jsx';
import TasteStages from './TasteStages.jsx';
import TeaTextField from './TeaTextField.jsx';
import TeaRaiting from './TeaRaiting.jsx';
import TimeBox from './TimeBox.jsx';

import dayjs from 'dayjs';

import { useTeaFormContext } from './TeaFormContext.jsx';

function TeaFormStage2(props) {

	const { 
		straitsStagesFormData, 
		updateStraitsStagesFormData, 
		aromaStagesFormData, 
		updateAromaStagesFormData, 
		tasteStagesFormData, 
		updateTasteStagesFormData, 
		formId } = useTeaFormContext();

	const options = [
	  { title: "option_1"},
	  { title: "option_2"},
	  { title: "option_3"}
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

	// useEffect(()=>{
	// 	console.log('update straitStages', straitsStagesFormData)
	// }, [stagesCount])

	useEffect(()=>{
		const obj_len = Object.keys(aromaStagesFormData).length
		
		if (obj_len != 0) {
			aromaStages.current = aromaStagesFormData
		}

	}, [])

	useEffect(()=>{
		const obj_len = Object.keys(tasteStagesFormData).length
		
		if (obj_len != 0) {
			tasteStages.current = tasteStagesFormData
		}
		
	}, [])

	useEffect(()=>{
		const obj1_len = Object.keys(straitsStagesFormData).length
		const obj2_len = Object.keys(aromaStagesFormData).length
		const obj3_len = Object.keys(tasteStagesFormData).length

		const maxLenObj = Math.max(obj1_len, obj2_len, obj3_len)
		
		if (maxLenObj != 0) {
			const lastStageNumber1 = obj1_len ? Object.keys(straitsStagesFormData)[obj1_len-1].split('').map(Number)[0] : 0
			const LastStageNumber2 = obj2_len ? Object.keys(aromaStagesFormData)[obj2_len-1].split('').map(Number)[0] : 0
			const LastStageNumber3 = obj3_len ? Object.keys(tasteStagesFormData)[obj3_len-1].split('').map(Number)[0] : 0

			const maxLastStageNUmber = Math.max(lastStageNumber1, LastStageNumber2, LastStageNumber3)
			
			// straitsStagesFormData = straitsStagesFormData
			setStagesCount(maxLastStageNUmber)
			renderStrait(maxLastStageNUmber, stagesArray)
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
		updateStraitsStagesFormData(straitsStagesFormData)
	}

	const renderStrait = (stagesCount, stagesArray) => {
		// clearStageArraysIf(stagesCount)
		addStrait(stagesCount)
		setStraits(stagesArray)
		// console.log(stagesCount)
	}

	const addStrait = (stagesCount) => {
		// console.log(stagesCount)
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
					commentText={straitsStagesFormData}
					id={1}
					stagesHandler={handleStraitInputStage}
					straitNum={straitNum.current}
					woStraitNum = {false}
					label = 'Комментарий к проливу'
				/>
				<TimeBox 
					id={2}
					timeValue={dayjs().hour(0).minute(1).second(0)}
					straitNum={straitNum.current}
					stagesHandler={handleStraitInputStage}
				/>
				<TeaRaiting 
					id={3} 
					stagesHandler={handleStraitInputStage} 
					ratingValue={straitsStagesFormData} 
					straitNum={straitNum.current}
				/>
			</section>
			)
	}

	function clearStageArraysIf(stagesCount) {
		// console.log(stagesArray)
		if (straitNum.current > stagesCount){
			clearObjByKeyIf(straitNum.current, aromaStages.current)
			clearObjByKeyIf(straitNum.current, tasteStages.current)
			clearObjByKeyIf(straitNum.current, straitsStagesFormData, true)
			// clearObjByKeyIf(straitNum.current, stagesArray, true, true)
			// console.log(stagesArray)
			// setStraits(straits)
			// delete straitsStagesFormData[straitNum.current]
			// removeKeyFromTeaFormData(straitNum.current)
		}
	}

	function clearObjByKeyIf(value, obj, current=false, handleStagesArray=false){
		// console.log(obj)
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
		straitsStagesFormData[id] = value
		updateStraitsStagesFormData(straitsStagesFormData)
	}

	function postAromaData(formId){
		// console.log()
		for (const [key, data] of Object.entries(aromaStages.current)) {
			const keys = String(key).split('').map(Number)
			const brewId = keys[0]
			const aromaShadeId = keys[1]
			const aromaStage = keys[2]
			console.log(data)
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
			console.log(data)
			if (tasteStage == 1) {
				props.postFormStage2Taste(data, formId, brewId, tasteShadeId)
			} else {
				props.patchFormStage2Taste(data, formId, brewId, tasteShadeId, tasteStage)
			}
		}
	}

	function postStraitData(formId){
		let checkKey = 1
		for (const [key, data] of Object.entries(straitsStagesFormData)) {
			const straitNumKey = String(key).split('').map(Number)[0]
			
			if (straitNumKey == checkKey) {
				const straitData = {
					description: straitsStagesFormData[String(straitNumKey)+'1'] ? straitsStagesFormData[String(straitNumKey)+'1'] : 'None',
					brewingTime: straitsStagesFormData[String(straitNumKey)+'2'] ,
					brewingRating: straitsStagesFormData[String(straitNumKey)+'3'],
				}
				// console.log(straitData)
				checkKey += 1

				if (!isSubmitted){
					props.postFormStage2Brew(straitData, formId, straitNumKey)
				} else {
					props.patchFormStage2Brew(straitData, formId, straitNumKey)
				}

			}


	

		}

	}

	function onSubmit(e){
		e.preventDefault()
		// const formId = '0C7C95FA02C054C3B96517C0'
		// postAromaData(formId)
		// postTasteData(formId)
		// postStraitData(formId)
		// setIsSubmitted(true)

		props.nextStage()

		

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