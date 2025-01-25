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


	const straitNum = useRef(1);
	const aromaStages = useRef({});
	const tasteStages = useRef({});

	let straitStages = useRef({});

	const [straits, setStraits] = useState([])
	// const [isSubmitted, setIsSubmitted] = useState(false)

	let [stagesCount, setStagesCount] = useState(1)
	const stagesArray = []

	const options = JSON.parse(localStorage.getItem('aromaDB'))
	
	// useEffect(()=>{
	// 	console.log('options: ', options.data.category)
	// }, [])

	// useEffect(()=>{
	// 	const obj_len = Object.keys(aromaStagesFormData).length
		
	// 	if (obj_len != 0) {
	// 		aromaStagesFormData = aromaStagesFormData
	// 	}

	// }, [])

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
		stagesCount > 1 ? setStagesCount(stagesCount-=1):setStagesCount(stagesCount)
		clearStageArraysIf(stagesCount)
		addStrait(stagesCount)
		setStraits(stagesArray)
		updateStraitsStagesFormData(straitsStagesFormData)
		updateAromaStagesFormData(aromaStagesFormData)
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
		console.log('straitNum.current: ', straitNum.current)
		return(
			<section className="form_strait-stages" id={straitNum.current}>
				<h4 className="form_strait-header">Пролив №{stageCount}</h4>
				<AromaStages 
					options={options} 
					stagesHandler={handleAromaInputStage} 
					clearFnc={clearObjByKeyIf}
					straitNum={stageCount}
					/>
				<TasteStages 
					options={options} 
					stagesHandler={handleTasteInputStage} 
					clearFnc={clearObjByKeyIf} 
					straitNum={straitNum.current}
					/>
				<TeaTextField 
					id={1}
					commentText={straitsStagesFormData}
					straitNum={straitNum.current}
					stagesHandler={handleStraitInputStage}
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
			clearObjByKeyIf(straitNum.current, aromaStagesFormData)
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
		aromaStagesFormData[String(id.split('-')[0])] = value
		updateAromaStagesFormData(aromaStagesFormData)
	}

	function handleTasteInputStage(value, id){
		tasteStages.current[String(id.split('-')[0])] = value
		updateTasteStagesFormData(tasteStages.current)
	}

	function handleStraitInputStage(value, id){
		straitsStagesFormData[id] = value
		updateStraitsStagesFormData(straitsStagesFormData)
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