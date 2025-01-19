import React, { useState, useEffect } from 'react';
import SelectBox from './SelectBox.jsx';
import FormButton from './FormButton.jsx';


import { useTeaFormContext } from './TeaFormContext.jsx';

function TasteStages(props) {

	const [stages, setStages] = useState([])
	// const [key, setKey] = useState(1)
	let [stagesCount, setStagesCount] = useState(1)
	let [prevStagesCount, setPrevStagesCount] = useState()
	const stagesArray = []

	const { 
		tasteStagesFormData, 
		updateTasteStagesFormData
	} = useTeaFormContext();

	// useEffect(() => {
	// 	const obj_len = Object.keys(tasteStagesFormData).length
	// 	console.log(props.straitNum)
	// 	if (obj_len != 0) {
	// 		Object.keys(tasteStagesFormData).map((k, i)=>{
	// 			if (k.split('').map(Number)[0] == props.straitNum){
	// 				console.log('key', k.split('').map(Number))
	// 				console.log(Math.max(Object.keys(tasteStagesFormData)[i].split('').map(Number)[1], k))
	// 				// setKey(Math.max(Object.keys(tasteStagesFormData)[i].split('').map(Number)[1], key))
	// 				return 
	// 			}
	// 		})
			
	// 		const lastStageNumber = key
	// 		console.log('lastStageNumber', key)
	// 		// if (props.straitNum === key[0]) {
	// 		setStagesCount(lastStageNumber)
	// 		addTasteStages(lastStageNumber)
	// 		setStages(stagesArray)
	// 		setPrevStagesCount(lastStageNumber)
	// 	} else {
	// 		clearStageArraysIf()
	// 		addTasteStages(stagesCount)
	// 		setStages(stagesArray)
	// 		setPrevStagesCount(stagesCount)
	// 	}

	// }, []);

	useEffect(() => {
		const obj_len = Object.keys(tasteStagesFormData).length

		if (obj_len != 0) {
			const lastStageNumber = Object.keys(tasteStagesFormData)[obj_len-1].split('').map(Number)[1]

			setStagesCount(lastStageNumber)
			addTasteStages(lastStageNumber)
			setStages(stagesArray)
			setPrevStagesCount(lastStageNumber)
		} else {
			clearStageArraysIf()
			addTasteStages(stagesCount)
			setStages(stagesArray)
			setPrevStagesCount(stagesCount)
		}

	}, []);


	const renderTasteStages = () => {
		clearStageArraysIf();
		addTasteStages(stagesCount);
		setStages(stagesArray);
		setPrevStagesCount(stagesCount);
	  };
	
	const addTasteStagesComponent = () => {
		stagesCount !== 5 ? setStagesCount(stagesCount += 1) : setStagesCount(stagesCount);
		renderTasteStages();
	};

	const removeTasteStagesComponent = () => {
		stagesCount !== 1 ? setStagesCount(stagesCount -= 1) : setStagesCount(stagesCount);
		renderTasteStages();
		updateTasteStagesFormData(tasteStagesFormData);
	};

	const tasteStages = (key) => {

		key = parseInt(key.toString());
		const key1 = String(props.straitNum) + key + '1';
		const key2 = String(props.straitNum) + key + '2';

		return(
			<section className='form_taste-stages'>
				<h4 className="form_stages-header">Вкус №{key}</h4>
				<SelectBox keyId={key1}
					options = {props.options}
					boxId='Этап №1'
					handler={props.stagesHandler}
					defaultValue={tasteStagesFormData[key1]}
				 />
				<SelectBox keyId={key2}
					options = {props.options} 
					boxId='Этап №2'
					handler={props.stagesHandler}
					defaultValue={tasteStagesFormData[key2]}
				/>
			</section>
			)

	}

  const addTasteStages = (stagesCount) => {
    for (let i = 1; i <= stagesCount; i++) {
    	stagesArray.push(tasteStages(i));
    }
  };

  function clearStageArraysIf() {

	if (prevStagesCount > stagesCount){
		props.clearFnc(prevStagesCount, tasteStagesFormData, true)
	}
}
	return(
		<div className="form_taste">

			{stages}

			<FormButton 
				buttonName={'Добавить еще оттенок вкуса'}
				onClick={addTasteStagesComponent}
			/>
			<FormButton 
				buttonName={'Удалить последний оттенок вкуса'}
				onClick={removeTasteStagesComponent}
			/>
		</div>
		)
}

export default TasteStages;