import React, { useEffect, useRef } from 'react';
import Header from './Header.jsx'
import SelectBox from './SelectBox.jsx';
import SliderBox from './SliderBox.jsx';
import FormButton from './FormButton.jsx';
import TeaTextField from './TeaTextField.jsx';
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


	const isStage1Commit = localStorage.getItem('isStage1Commit')

	if (!isStage1Commit) {
		localStorage.setItem('isStage1Commit', false)
		const defaultData = {
			teaName: 'TdefaultTEA',
			teaCountry: 'The Godfathe',
			teaWeight: 5,
			teaType: 'The Godfathe',
			waterBrand: 'The Godfathe',
			waterVolume: 100,
			waterTemperature: 95,
			teaWare: 'The Godfathe',
			brewingType: 'The Godfathe'
		}
		Object.entries(defaultData).map(([key, val]) => [handleInputsData(val, key, key)])
	} else {
		const teaDataLocal = JSON.parse(localStorage.getItem('teaData'))
		// console.log(teaDataLocal.teaCountry)
		Object.entries(teaDataLocal).map(([key, val]) => [handleInputsData(val, key, key)])
	}

	// useEffect(()=>{	
	// }, [])

	function handleInputsData(){
		// console.log(String(teaData.current))
		teaData.current[String(arguments[2])] = arguments[0]
		// console.log(arguments)
	}

	function onSubmit(e){
		e.preventDefault()
		const formId = '0C7C95FA02C054C3B96517C0'

		localStorage.setItem('isStage1Commit', true)
		localStorage.setItem('teaData', JSON.stringify(teaData.current))

		if (teaData.teaName != 'undefined'){
			console.log('SENDED')
			props.postFormStage1(teaData.current, formId)
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
				<TeaTextField boxId = 'teaName'
					woStraitNum = {true}
					handler = {handleInputsData}
					label = 'Название чая'
					defaultValue = {teaData.current.teaName}
				/>
				{/* <SelectBox boxName='Название чая' handler={handleInputsData} boxId = 'teaName'
					options={options}/> */}
				<SelectBox 
					boxName='Страна' 
					handler={handleInputsData} 
					boxId = 'teaCountry'
					options={options}
					defaultValue = {teaData.current.teaCountry}
					/>
				<SliderBox 
					handler={handleInputsData}
					sliderName='Вес чая при заваривании'
					maxValue={50}
					defaultValue={teaData.current.teaWeight}
					units='г'
					marks = {SLIDER_WEIGHT_DATA}
					boxId = 'teaWeight'
				/>
				<SelectBox boxName='Тип чая' options={options}
					handler={handleInputsData}
					boxId='teaType'
					defaultValue={teaData.current.teaType}
				/>
				<SelectBox boxName='Вода' options={options}
					handler={handleInputsData}
					boxId='waterBrand'
					defaultValue={teaData.current.waterBrand}
				/>
				<SliderBox 
					handler={handleInputsData}
					sliderName='Объем воды'
					maxValue={1000}
					defaultValue={teaData.current.waterVolume}
					units='мл'
					marks = {SLIDER_WATER_DATA}
					boxId='waterVolume'
				/>
				<SliderBox 
					handler={handleInputsData}
					sliderName='Температура воды'
					maxValue={100}
					defaultValue={teaData.current.waterTemperature}
					units='°C'
					marks = {SLIDER_TEMPERATURE_DATA}
					boxId='waterTemperature'
				/>
				<SelectBox boxName='Посуда' options={options}
					handler={handleInputsData}
					boxId='teaWare'
					defaultValue={teaData.current.teaWare}
				/>
				<SelectBox boxName='Метод заваривания' options={options}
					handler={handleInputsData}
					boxId='brewingType'
					defaultValue={teaData.current.brewingType}
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