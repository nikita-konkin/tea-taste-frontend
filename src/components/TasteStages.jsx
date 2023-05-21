import React, { useState, useEffect } from 'react';
import SelectBox from './SelectBox.jsx';
import FormButton from './FormButton.jsx';

function TasteStages(props) {

	const [stages, setStages] = useState([])
	let [stagesCount, setStagesCount] = useState(1)
	let [prevStagesCount, setPrevStagesCount] = useState()
	const stagesArray = []

	 useEffect(() => {
	 	// props.stageCount = stagesCount
	 	clearStageArraysIf()
  	addTasteStages()
  	setStages(stagesArray)
  	setPrevStagesCount(stagesCount)

  }, [stagesCount]);

	const tasteStages = (key) => {
		
		return(
			<section className='form_taste-stages'>
				<h4 className="form_stages-header">Вкус №{key}</h4>
				<SelectBox keyId={parseInt((key).toString() + '1')}
					options = {props.options}
					boxId='Этап №1'
					handler={props.stagesHandler}
				 />
				<SelectBox keyId={parseInt((key).toString() + '2')}
					options = {props.options} 
					boxId='Этап №2'
					handler={props.stagesHandler}
				/>
			</section>
			)

	}

	const addTasteStages = () =>{

    for (let i = 0; i < stagesCount; i++) {
      stagesArray.push(tasteStages(i+1))
    }

	}

	function clearStageArraysIf() {

		if (prevStagesCount > stagesCount){
			props.clearFnc(prevStagesCount, props.tasteStages, true)
		}

	}

	return(
		<div className="form_taste">

			{stages}
			<FormButton 
				buttonName={'Добавить еще оттенок вкуса'}
				onClick={()=>{stagesCount != 5 ? setStagesCount(stagesCount+=1):setStagesCount(stagesCount)}}
			/>
			<FormButton 
				buttonName={'Удалить последний оттенок вкуса'}
				onClick={()=>{stagesCount != 1 ? setStagesCount(stagesCount-=1):setStagesCount(stagesCount)}}
			/>
		</div>
		)
}

export default TasteStages;