import React, { useEffect, useRef } from 'react';
import Header from './Header.jsx'
import SelectBox from './SelectBox.jsx';
import SliderBox from './SliderBox.jsx';
import FormButton from './FormButton.jsx';
import TeaTextField from './TeaTextField.jsx';
import {
  useNavigate
} from 'react-router-dom';

import { useTeaFormContext } from './TeaFormContext.jsx';	

import {
  SLIDER_WEIGHT_DATA,
  SLIDER_WATER_DATA,
  SLIDER_TEMPERATURE_DATA
} from '../utils/utils.js'

function TeaFormStage1(props) {

	useEffect(()=>{
		props.getAllFromAromaDB()
	}, [])

	const { teaInfo, updateTeaInfo } = useTeaFormContext();

	const teaData = useRef({});
	// const navigate = useNavigate();
	const options = [
	  { title: "The Shawshank Redemption"},
	  { title: "The Godfather"},
	  { title: "The Godfather: Part II"}
	];

	const handleInputsData = (value, type, id) => {
		teaInfo[id] = value
		updateTeaInfo(teaInfo)
    };

	function onSubmit(e){
		e.preventDefault()
		// const formId = '0C7C95FA02C054C3B96517C0'

		localStorage.setItem('isStage1Commit', true)
		// localStorage.setItem('teaData', JSON.stringify(teaInfo))

		if (teaData.teaName != 'undefined'){
			console.log('SENDED')
			// props.postFormStage1(teaInfo, formId)
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
					defaultValue = {teaInfo.teaName}
					stageNumber = {1}
				/>
				{/* <SelectBox boxName='Название чая' handler={handleInputsData} boxId = 'teaName'
					options={options}/> */}
				<SelectBox 
					boxName='Страна' 
					handler={handleInputsData} 
					boxId = 'teaCountry'
					options={options}
					defaultValue = {teaInfo.teaCountry}
					/>
				<SliderBox 
					handler={handleInputsData}
					sliderName='Вес чая при заваривании'
					maxValue={50}
					defaultValue={teaInfo.teaWeight}
					units='г'
					marks = {SLIDER_WEIGHT_DATA}
					boxId = 'teaWeight'
				/>
				<SelectBox boxName='Тип чая' options={options}
					handler={handleInputsData}
					boxId='teaType'
					defaultValue={teaInfo.teaType}
				/>
				<SelectBox boxName='Вода' options={options}
					handler={handleInputsData}
					boxId='waterBrand'
					defaultValue={teaInfo.waterBrand}
				/>
				<SliderBox 
					handler={handleInputsData}
					sliderName='Объем воды'
					maxValue={1000}
					defaultValue={teaInfo.waterVolume}
					units='мл'
					marks = {SLIDER_WATER_DATA}
					boxId='waterVolume'
				/>
				<SliderBox 
					handler={handleInputsData}
					sliderName='Температура воды'
					maxValue={100}
					defaultValue={teaInfo.waterTemperature}
					units='°C'
					marks = {SLIDER_TEMPERATURE_DATA}
					boxId='waterTemperature'
				/>
				<SelectBox boxName='Посуда' options={options}
					handler={handleInputsData}
					boxId='teaWare'
					defaultValue={teaInfo.teaWare}
				/>
				<SelectBox boxName='Метод заваривания' options={options}
					handler={handleInputsData}
					boxId='brewingType'
					defaultValue={teaInfo.brewingType}
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