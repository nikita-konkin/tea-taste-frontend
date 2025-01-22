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
		clearTeaFormData,
		maxLastStageNumberFnc
		} = useTeaFormContext();

	const options = [
	  { title: "option_1"},
	  { title: "option_2"},
	  { title: "option_3"}
	];

	const straitNum = useRef(null);
	const aromaStages = useRef({});
	const tasteStages = useRef({});

	let straitStages = useRef({});

	const [straits, setStraits] = useState([])
	const [isSubmitted, setIsSubmitted] = useState(false)

	let [stagesCount, setStagesCount] = useState(1)
	const stagesArray = []

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

		const maxLastStageNumber = maxLastStageNumberFnc(aromaStagesFormData, tasteStagesFormData, straitsStagesFormData)
		
		if (maxLastStageNumber != 0) {
			setStagesCount(maxLastStageNumber)
			renderStrait(maxLastStageNumber, stagesArray)
		} else {
			renderStrait(stagesCount, stagesArray)
		}
		
	}, [])
	
	const addStraitAndUpdateContext = () => {

		stagesCount !== 5 ? setStagesCount(stagesCount+=1):setStagesCount(stagesCount)
		renderStrait(stagesCount, stagesArray)

	}

	const removeStraitAndUpdateContext = () => {
		console.log(stagesCount)
		stagesCount !== 5 ? setStagesCount(stagesCount-=1):setStagesCount(stagesCount)
		clearStageArraysIf(stagesCount)
		addStrait(stagesCount)
		setStraits(stagesArray)
		updateStraitsStagesFormData(straitsStagesFormData)
		updateAromaStagesFormData(aromaStages.current)
		updateTasteStagesFormData(tasteStages.current)
	}

	const renderStrait = (stagesCount, stagesArray) => {
		addStrait(stagesCount)
		setStraits(stagesArray)
	}

	const addStrait = (stagesCount) => {
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
					straitNum={straitNum.current}
					/>
				<TasteStages options={options} stagesHandler={handleTasteInputStage} 
					clearFnc={clearObjByKeyIf} 
					straitNum={straitNum.current}
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
					timeValue={straitsStagesFormData}
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
		if (straitNum.current > stagesCount){
			clearObjByKeyIf(straitNum.current, aromaStages.current)
			clearObjByKeyIf(straitNum.current, tasteStages.current)
			clearObjByKeyIf(straitNum.current, straitsStagesFormData)
		}
	}

	function clearObjByKeyIf(value, obj, current=false, handleStagesArray=false){
		Object.keys(obj).forEach((i)=>{
			const num = String(i).split('').map(Number)
			console.log('before: ',obj)
			console.log('before: ',i)
			if (!current) {
				if (num[0] == value) {
					delete obj[i]
					console.log('after: ',obj[i])
					console.log('after: ',obj)
				}
			} else {
				if (num[1] == value) {
					delete obj[i]
				}

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