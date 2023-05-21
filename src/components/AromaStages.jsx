import React, { useState, useEffect  } from 'react';
import SelectBox from './SelectBox.jsx';
import FormButton from './FormButton.jsx';



function AromaStages(props) {

	const [stages, setStages] = useState([])
	let [stagesCount, setStagesCount] = useState(1)
	let [prevStagesCount, setPrevStagesCount] = useState()
	const stagesArray = []

  useEffect(() => {

  	clearStageArraysIf()
  	addAromaStages()
  	setStages(stagesArray)
  	setPrevStagesCount(stagesCount)

  }, [stagesCount]);

	const aromaStages = (key) => {

		return(
			<section className='form_aroma-stages'>
				<h4 className="form_stages-header">Аромат №{key}</h4>
				<SelectBox keyId={parseInt((key).toString() + '1')} 
					options={props.options} boxName='Этап №1' 
					handler={props.stagesHandler}
					boxId = 'AromaStage1'
					/>
				<SelectBox keyId={parseInt((key).toString() + '2')} 
					options={props.options} boxName='Этап №2' 
					handler={props.stagesHandler}
					boxId = 'AromaStage2'
					/>
				<SelectBox keyId={parseInt((key).toString() + '3')} 
					options={props.options} boxName='Этап №3'
					boxId = 'AromaStage3'
					handler={props.stagesHandler}/>
			</section>
			)

	}

	const addAromaStages = () =>{

    for (let i = 0; i < stagesCount; i++) {
      stagesArray.push(aromaStages(i+1))
    }

	}

	function clearStageArraysIf() {
		if (prevStagesCount > stagesCount){
			props.clearFnc(prevStagesCount, props.aromaStages, true)
		}
	}


	return(
		<div className="form_aroma">
			{stages}
			<FormButton 
				buttonName={'Добавить еще оттенок аромата'}
				onClick={()=>{stagesCount != 5 ? setStagesCount(stagesCount+=1):setStagesCount(stagesCount)}}
			/>
			<FormButton 
				buttonName={'Удалить последний оттенок аромата'}
				onClick={()=>{stagesCount != 1 ? setStagesCount(stagesCount-=1):setStagesCount(stagesCount)}}
			/>
		</div>
		)
}

export default AromaStages;