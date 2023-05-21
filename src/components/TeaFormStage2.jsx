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

	const aromaStages = useRef({});
	const tasteStages = useRef({});
	const straitNum = useRef(null);

	const [straits, setStraits] = useState([])

	let [stagesCount, setStagesCount] = useState(1)
	const aromaStagesCount = useRef(1);
	const tasteStagesCount = useRef(1);
	const stagesArray = []

	useEffect(() => {
		clearStageArraysIf(stagesCount)
  	addStrait()
  	setStraits(stagesArray)
  }, [stagesCount]);

  // useEffect(() => {
		// clearStageArrays(stagesCount)
  // 	addStrait()
  // 	setStraits(stagesArray)
  // }, [stagesCount]);


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
				<AromaStages options={options} stagesHandler={handleAromaInputStage} clearFnc={clearObjByKeyIf} aromaStages={aromaStages.current}/>
				<TasteStages options={options} stagesHandler={handleTasteInputStage} clearFnc={clearObjByKeyIf} tasteStages={tasteStages.current}/>
				<TeaTextField />
				<TeaRaiting />
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

		console.log(obj)
	}

	function handleAromaInputStage(value, key){
		console.log(String(straitNum.current))
		aromaStages.current[String(straitNum.current) + String(key)] = value
		console.log(aromaStages)
	}

	function handleTasteInputStage(value, key){
		console.log(String(straitNum.current))
		tasteStages.current[String(straitNum.current) + String(key)] = value
		console.log(tasteStages)
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
					onClick={()=>{props.nextStage()}}
					buttonName={'Далее (проверка формы)'}
				/>
			</form>
		</>
		)
}

export default TeaFormStage1;