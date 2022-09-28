import React, { useState } from 'react';
import Header from './Header.jsx'
import SelectBox from './SelectBox.jsx';
import SliderBox from './SliderBox.jsx';
import FormButton from './FormButton.jsx';


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


	return(
		<>
			<Header />
			<form className="form">
				<h3 className="form_header">Шаг 2 основаня информация</h3>
				
				<FormButton 
					buttonName={'Добавить еще пролив'}
				/>
				<FormButton 
					buttonName={'Назад'}
				/>
				<FormButton 
					nextStage={()=>{props.nextStage()}}
					buttonName={'Далее (проверка формы)'}
				/>
			</form>
		</>
		)
}

export default TeaFormStage1;