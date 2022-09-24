import React, { useState } from 'react';
import Header from './Header.jsx'
import SelectBox from './SelectBox.jsx';
import SliderBox from './SliderBox.jsx';
import NextButton from './ButtonNext.jsx';


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
				<h3 className="form_header">Шаг 1 основаня информация</h3>
				<SelectBox boxName='Название чая' options={options}/>
				<SliderBox 
					sliderName='Вес чая при заваривании'
					maxValue={50}
					defaultValue={5}
					units='г'
					marks = {SLIDER_WEIGHT_DATA}
				/>
				<SelectBox boxName='Тип чая' options={options}/>
				<SelectBox boxName='Вода' options={options}/>
				<SliderBox 
					sliderName='Объем воды'
					maxValue={1000}
					defaultValue={100}
					units='мл'
					marks = {SLIDER_WATER_DATA}
				/>
				<SliderBox 
					sliderName='Температура воды'
					maxValue={100}
					defaultValue={95}
					units='°C'
					marks = {SLIDER_TEMPERATURE_DATA}
				/>
				<SelectBox boxName='Посуда' options={options}/>
				<SelectBox boxName='Метод заваривания' options={options}/>

				<NextButton onClick={props.nextStage()}/>
			</form>
		</>
		)
}

export default TeaFormStage1;