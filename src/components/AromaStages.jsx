import React, { useState, useEffect  } from 'react';
import SelectBox from './SelectBox.jsx';
import FormButton from './FormButton.jsx';

import { useTeaFormContext } from './TeaFormContext.jsx';

function AromaStages(props) {

	const [stages, setStages] = useState([])
	let [stagesCount, setStagesCount] = useState(1)
	let [prevStagesCount, setPrevStagesCount] = useState()
	const stagesArray = []
	
	const { 
		aromaStagesFormData, 
		updateAromaStagesFormData
	} = useTeaFormContext();

  useEffect(() => {
	const obj_len = Object.keys(aromaStagesFormData).length

	if (obj_len != 0) {
		const lastStageNumber = Object.keys(aromaStagesFormData)[obj_len-1].split('').map(Number)[1]

		setStagesCount(lastStageNumber)
		addAromaStages(lastStageNumber)
		setStages(stagesArray)
		setPrevStagesCount(lastStageNumber)
	} else {
		clearStageArraysIf()
		addAromaStages(stagesCount)
		setStages(stagesArray)
		setPrevStagesCount(stagesCount)
	}

  }, []);

	const renderAromaStages = () => {
		clearStageArraysIf()
		addAromaStages(stagesCount)
		setStages(stagesArray)
		setPrevStagesCount(stagesCount)
	}

	const addAromaStagesComponent = () => {
		stagesCount != 5 ? setStagesCount(stagesCount+=1):setStagesCount(stagesCount)
		renderAromaStages()
	}

	const removeAromaStagesComponent = () => {
		stagesCount != 1 ? setStagesCount(stagesCount-=1):setStagesCount(stagesCount)
		renderAromaStages()
		updateAromaStagesFormData(aromaStagesFormData)
	}

	const aromaStages = (key) => {
		key = parseInt((key).toString());
		const key1 = String(props.straitNum) + key + '1'
		const key2 = String(props.straitNum) + key + '2'
		const key3 = String(props.straitNum) + key + '3'

		return(
			<section className='form_aroma-stages'>
				<h4 className="form_stages-header">Аромат №{key}</h4>
				<SelectBox keyId={key1} 
					options={props.options} boxName='Этап №1' 
					handler={props.stagesHandler}
					boxId = 'AromaStage1'
					defaultValue={aromaStagesFormData[key1]}
					/>
				<SelectBox keyId={key2} 
					options={props.options} boxName='Этап №2' 
					handler={props.stagesHandler}
					boxId = 'AromaStage2'
					defaultValue={aromaStagesFormData[key2]}
					/>
				<SelectBox keyId={key3} 
					options={props.options} boxName='Этап №3'
					boxId = 'AromaStage3'
					handler={props.stagesHandler}
					defaultValue={aromaStagesFormData[key3]}
					/>
			</section>
			)

	}

	const addAromaStages = (stagesCount) =>{
		for (let i = 0; i < stagesCount; i++) {
			stagesArray.push(aromaStages(i+1))
		}
	}

	function clearStageArraysIf() {

		if (prevStagesCount > stagesCount){
			props.clearFnc(prevStagesCount, aromaStagesFormData, true)
		}
	}


	return(
		<div className="form_aroma">
			{stages}
			<FormButton 
				buttonName={'Добавить еще оттенок аромата'}
				onClick={addAromaStagesComponent}
			/>
			<FormButton 
				buttonName={'Удалить последний оттенок аромата'}
				onClick={removeAromaStagesComponent}
			/>
		</div>
		)
}

export default AromaStages;