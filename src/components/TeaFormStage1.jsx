import React, { useState } from 'react';
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

	const [teaName, SetTeaName] = useState('')
	const [teaWeight, SetTeaWeight] = useState('')
	const [teaType, SetTeaType] = useState('')
	const [teaCountry, SetTeaCountry] = useState('')
	const [waterBrand, SetWaterBrand] = useState('')
	const [waterVolume, SetWaterVolume] = useState('')
	const [waterTemperature, SetWaterTemperature] = useState('')
	const [teaWare, SetTeaWare] = useState('')
	const [brewingType, SetBrewingType] = useState('')
	
	const teaData = {
		teaName: teaName.title,
		teaType: teaType.title,
		teaWeight: teaWeight,
		waterBrand: waterBrand.title,
		waterVolume: waterVolume,
		waterTemperature: waterTemperature,
		teaWare: teaWare.title,
		brewingType: brewingType.title,
		teaCountry: teaCountry.title
	}
	const navigate = useNavigate();
	const options = [
	  { title: "The Shawshank Redemption"},
	  { title: "The Godfather"},
	  { title: "The Godfather: Part II"}
	];

	function handleTeaName(value){
		SetTeaName(value)
		// console.log(teaName)
	}

	function handleTeaWeight(value){
		SetTeaWeight(value)
		// console.log(teaWeight)
	}

	function handleTeaType(value){
		SetTeaType(value)
		// console.log(teaType)
	}

	function handleWaterBrand(value){
		SetWaterBrand(value)
		// console.log(waterBrand)
	}

	function handleWaterVolume(value){
		SetWaterVolume(value)
		// console.log(waterVolume)
	}

	function handleWaterTemperature(value){
		SetWaterTemperature(value)
		// console.log(waterTemperature)
	}

	function handleTeaWare(value){
		SetTeaWare(value)
		// console.log(teaWare)
	}

	function handleBrewingType(value){
		SetBrewingType(value)
		// console.log(brewingType)
	}

	function handleTeaCountry(value){
		SetTeaCountry(value)
		// console.log(teaCountry)
	}

	function onSubmit(e){
		e.preventDefault()

		const formId = '0C7C95FA02C054C3B96517C0'
		if (teaData.teaName != 'undefined'){
			console.log('SNEDED')
			props.postFormMainData(teaData, formId)
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
				<SelectBox boxName='Название чая' handler={handleTeaName} 
					options={options}/>
				<SelectBox boxName='Страна' handler={handleTeaCountry} 
					options={options}/>
				<SliderBox 
					handler={handleTeaWeight}
					sliderName='Вес чая при заваривании'
					maxValue={50}
					defaultValue={5}
					units='г'
					marks = {SLIDER_WEIGHT_DATA}
				/>
				<SelectBox boxName='Тип чая' options={options}
					handler={handleTeaType}
				/>
				<SelectBox boxName='Вода' options={options}
					handler={handleWaterBrand}
				/>
				<SliderBox 
					handler={handleWaterVolume}
					sliderName='Объем воды'
					maxValue={1000}
					defaultValue={100}
					units='мл'
					marks = {SLIDER_WATER_DATA}
				/>
				<SliderBox 
					handler={handleWaterTemperature}
					sliderName='Температура воды'
					maxValue={100}
					defaultValue={95}
					units='°C'
					marks = {SLIDER_TEMPERATURE_DATA}
				/>
				<SelectBox boxName='Посуда' options={options}
					handler={handleTeaWare}
				/>
				<SelectBox boxName='Метод заваривания' options={options}
					handler={handleBrewingType}
				/>

				<FormButton 
					onClick={(e)=>{onSubmit(e)}}
					buttonName={'Далее (проливы)'}
					/>
			</form>
		</>
		)
}

export default TeaFormStage1;