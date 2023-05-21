import React, { useState, useRef } from 'react';
import Header from './Header.jsx'
import SelectBox from './SelectBox.jsx';
import SliderBox from './SliderBox.jsx';
import FormButton from './FormButton.jsx';
import {
  useNavigate
} from 'react-router-dom';


import {
  SLIDER_WEIGHT_DATA,
  SLIDER_WATER_DATA,
  SLIDER_TEMPERATURE_DATA
} from '../utils/utils.js'

function TeaFormStage1(props) {

	const teaData = useRef({});
	const navigate = useNavigate();
	const options = [
	  { title: "The Shawshank Redemption"},
	  { title: "The Godfather"},
	  { title: "The Godfather: Part II"}
	];

	function handleInputsData(value, boxName){
		console.log(String(teaData.current))
		teaData.current[String(arguments[2])] = arguments[0]
		console.log(teaData)
	}


	function onSubmit(e){
		e.preventDefault()
		const formId = '0C7C95FA02C054C3B96517C0'
		if (teaData.teaName != 'undefined'){
			console.log('SENDED')
			props.postFormMainData(teaData.current, formId)
			props.nextStage()
		}
		else{
			props.nextStage()
		}
	}

	return(
		<>
			<Header navigation={props.navigation}/>
			<form className="form" >
				<h3 className="form_header">Шаг 1 основаня информация</h3>
				<SelectBox boxName='Название чая' handler={handleInputsData} boxId = 'teaName'
					options={options}/>
				<SelectBox boxName='Страна' handler={handleInputsData} boxId = 'teaCountry'
					options={options}/>
				<SliderBox 
					handler={handleInputsData}
					sliderName='Вес чая при заваривании'
					maxValue={50}
					defaultValue={5}
					units='г'
					marks = {SLIDER_WEIGHT_DATA}
					boxId = 'teaWeight'
				/>
				<SelectBox boxName='Тип чая' options={options}
					handler={handleInputsData}
					boxId='teaType'
				/>
				<SelectBox boxName='Вода' options={options}
					handler={handleInputsData}
					boxId='waterBrand'
				/>
				<SliderBox 
					handler={handleInputsData}
					sliderName='Объем воды'
					maxValue={1000}
					defaultValue={100}
					units='мл'
					marks = {SLIDER_WATER_DATA}
					boxId='waterVolume'
				/>
				<SliderBox 
					handler={handleInputsData}
					sliderName='Температура воды'
					maxValue={100}
					defaultValue={95}
					units='°C'
					marks = {SLIDER_TEMPERATURE_DATA}
					boxId='waterTemperature'
				/>
				<SelectBox boxName='Посуда' options={options}
					handler={handleInputsData}
					boxId='teaWare'
				/>
				<SelectBox boxName='Метод заваривания' options={options}
					handler={handleInputsData}
					boxId='brewingType'
				/>

				<FormButton 
					onClick={(e)=>{onSubmit(e)}}
					buttonName={'Далее (проливы)'}
					boxId=''
					/>
			</form>
		</>
		)
}

export default TeaFormStage1;