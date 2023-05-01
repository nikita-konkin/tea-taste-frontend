import React, { useState, useEffect, useRef } from 'react';
import Header from './Header.jsx'
import FormButton from './FormButton.jsx';
import AromaStages from './AromaStages.jsx';
import TasteStages from './TasteStages.jsx';
import TeaTextField from './TeaTextField.jsx';
import TeaRaiting from './TeaRaiting.jsx';


function TeaFormStage1(props) {

	const options = [
	  { title: "The Shawshank Redemption"},
	  { title: "The Godfather"},
	  { title: "The Godfather: Part II"}
	];

	const aromaStages = useRef({});
	const straitNum = useRef(null);

	const [straits, setStraits] = useState([])

	let [stagesCount, setStagesCount] = useState(1)
	const stagesArray = []

	useEffect(() => {

  	addStrait()
  	setStraits(stagesArray)

  }, [stagesCount]);


	const addStrait = (i) => {
    for (let i = 0; i < stagesCount; i++) {
      stagesArray.push(renderStraits(i+1))
    }
	}

	const renderStraits = (stageCount) => {
		straitNum.current = stageCount
		return(
			<section className="form_strait-stages">
				<h4 className="form_strait-header">Пролив №{stageCount}</h4>
				<AromaStages options={options} stagesHandler={handleAromaInputStage}/>
				<TasteStages options={options}/>
				<TeaTextField />
				<TeaRaiting />
			</section>
			)
	}

	function handleAromaInputStage(value, key){
		console.log(String(straitNum.current))
		aromaStages.current[String(straitNum.current) + String(key)] = value.title
		console.log(aromaStages)
	}

	return(
		<>
			<Header navigation={props.navigation}/>
			<form className="form">
				<h3 className="form_header">Шаг 2 основаня информация</h3>

				{straits}

				<FormButton 
					buttonName={'Добавить еще пролив'}
					onClick={()=>{stagesCount !== 5 ? setStagesCount(stagesCount+=1):setStagesCount(stagesCount)}}
				/>
				<FormButton 
					buttonName={'Удалить последний пролив'}
					onClick={()=>{stagesCount !== 1 ? setStagesCount(stagesCount-=1):setStagesCount(stagesCount)}}
				/>
				<FormButton 
					onClick={()=>{props.prevStage()}}
					buttonName={'Назад'}
				/>
				<FormButton 
					onClick={()=>{props.nextStage()}}
					buttonName={'Далее (проверка формы)'}
				/>
			</form>
		</>
		)
}

export default TeaFormStage1;