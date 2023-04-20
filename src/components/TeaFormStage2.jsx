import React, { useState, useEffect } from 'react';
import Header from './Header.jsx'
// import SelectBox from './SelectBox.jsx';
// import SliderBox from './SliderBox.jsx';
import FormButton from './FormButton.jsx';
import AromaStages from './AromaStages.jsx';
import TasteStages from './TasteStages.jsx';
import TeaTextField from './TeaTextField.jsx';
import TeaRaiting from './TeaRaiting.jsx';


// import {
//   SLIDER_WEIGHT_DATA,
//   SLIDER_WATER_DATA,
//   SLIDER_TEMPERATURE_DATA
// } from '../utils/utils.js'

function TeaFormStage1(props) {

	const options = [
	  { title: "The Shawshank Redemption"},
	  { title: "The Godfather"},
	  { title: "The Godfather: Part II"}
	];

	const [aromaStage1, setAromaStage1] = useState('')
	const [aromaStage2, setAromaStage2] = useState('')
	const [aromaStage3, setAromaStage3] = useState('')
	const [straits, setStraits] = useState([])

	let [stagesCount, setStagesCount] = useState(1)
	const stagesArray = []

	const aromaData = {
		aromaStage1: aromaStage1.title,
		aromaStage2: aromaStage2.title,
		aromaStage3: aromaStage3.title
	}
	useEffect(() => {

  	addStrait()
  	setStraits(stagesArray)

  }, [stagesCount]);


	const addStrait = (i) => {
    for (let i = 0; i < stagesCount; i++) {
      stagesArray.push(renderStraits(i+1))
    }
	}

	const renderStraits = (stageCount) => {
		return(
			<section className="form_strait-stages">
				<h4 className="form_strait-header">Пролив №{stageCount}</h4>
				<AromaStages options={options} stagesHandler={handleAromaStage}/>
				<TasteStages options={options}/>
				<TeaTextField />
				<TeaRaiting />
			</section>
			)
	}

	function handleAromaStage(value, key){

		if (key === 11){
			console.log(value)
			setAromaStage1(value.title)
			console.log(aromaStage1)
		}
		if (key === 12){
			setAromaStage2(value.title)
			console.log(aromaStage2)
		}
		if (key === 13){
			setAromaStage3(value.title)
		}
		console.log(aromaData)
		
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