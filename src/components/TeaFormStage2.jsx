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
	const commentText = useRef({});
	const ratingValue = useRef({});

	const [straits, setStraits] = useState([])

	let [stagesCount, setStagesCount] = useState(1)
	const stagesArray = []

	useEffect(() => {
		clearStageArraysIf(stagesCount)
  	addStrait()
  	setStraits(stagesArray)
  }, [stagesCount]);

	useEffect(()=>{
		ratingValue.current[stagesCount] = 7
		commentText.current[stagesCount] = ''
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
				<TeaTextField commentText={commentText} straitNum={straitNum.current}/>
				<TeaRaiting ratingValue={ratingValue} straitNum={straitNum.current}/>
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

	function onSubmit(e){
		e.preventDefault()
		const formId = '0C7C95FA02C054C3B96517C0'
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

		  console.log(`${key}: ${data}`);
		}

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