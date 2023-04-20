import React, { useState, useEffect } from 'react';
import SelectBox from './SelectBox.jsx';
import FormButton from './FormButton.jsx';

function TasteStages(props) {

	const [stages, setStages] = useState([])
	let [stagesCount, setStagesCount] = useState(1)
	const stagesArray = []

	 useEffect(() => {

  	addTasteStages()
  	setStages(stagesArray)

  }, [stagesCount]);

	const tasteStages = (key) => {
		
		return(
			<section className='form_taste-stages'>
				<h4 className="form_stages-header">Вкус №{key}</h4>
				<SelectBox key={key + '0'} options = {props.options} boxName='Этап №1'/>
				<SelectBox key={key + '1'} options = {props.options} boxName='Этап №2'/>
			</section>
			)

	}

	const addTasteStages = () =>{

    for (let i = 0; i < stagesCount; i++) {
      stagesArray.push(tasteStages(i))
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