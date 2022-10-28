import React, { useState, useEffect } from 'react';
import Header from './Header.jsx'
import SelectBox from './SelectBox.jsx';
import SliderBox from './SliderBox.jsx';
import FormButton from './FormButton.jsx';
import AromaStages from './AromaStages.jsx';
import TasteStages from './TasteStages.jsx';
import TeaTextField from './TeaTextField.jsx';
import TeaRaiting from './TeaRaiting.jsx';


import {
  SLIDER_WEIGHT_DATA,
  SLIDER_WATER_DATA,
  SLIDER_TEMPERATURE_DATA
} from '../utils/utils.js'

function TeaFormStage1(props) {

	const options = [
	  { title: "The Shawshank Redemption", year: 1994 },
	  { title: "The Godfather", year: 1972 },
	  { title: "The Godfather: Part II", year: 1974 }
	];

	const [straits, setStraits] = useState([])
	let [stagesCount, setStagesCount] = useState(1)
	const stagesArray = []


	useEffect(() => {

  	addStrait()
  	setStraits(stagesArray)

  }, [stagesCount]);


	const addStrait = () => {
    for (let i = 0; i < stagesCount; i++) {
      stagesArray.push(renderStraits())
    }
	}

	const renderStraits = () => {
		return(
			<div>
					<AromaStages options={options}/>
					<TasteStages options={options}/>
					<TeaTextField />
					<TeaRaiting />
			</div>
			)
	}

	return(
		<>
			<Header />
			<form className="form">
				<h3 className="form_header">Шаг 2 основаня информация</h3>

				{straits}

				<FormButton 
					buttonName={'Добавить еще пролив'}
					onClick={()=>{stagesCount != 5 ? setStagesCount(stagesCount+=1):setStagesCount(stagesCount)}}
				/>
				<FormButton 
					buttonName={'Удалить последний пролив'}
					onClick={()=>{stagesCount != 1 ? setStagesCount(stagesCount-=1):setStagesCount(stagesCount)}}
				/>
				<FormButton 
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