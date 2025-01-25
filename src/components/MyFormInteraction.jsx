import {
  useState,
  useEffect,
  useRef
} from 'react'
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import FormButton from './FormButton.jsx';
import Header from './Header.jsx'

import { useTeaFormContext } from './TeaFormContext.jsx';



function MyFormInteraction(props) {
	const [straits, setStraits] = useState([])
	const aromasRender = useRef({})
	const tastesRender = useRef({})
	
	let stages = []

	const history = useNavigate();

	const {aromaStagesFormData, 
		tasteStagesFormData, 
		straitsStagesFormData, 
		maxLastStageNumberFnc,
		teaInfo, 
		clearTeaFormData} = useTeaFormContext();
	// const teaInfo = JSON.parse(localStorage.getItem('teaData'))
	const currentTimestamp = new Date().toLocaleString()
	
	const maxLastStageNumber = maxLastStageNumberFnc(aromaStagesFormData, tasteStagesFormData, straitsStagesFormData)

    const getDataByAimKey = (data, position, aimKey, returnOriginKey = false) => {
        return Object.keys(data)
            .filter(key => key.length > 1 && key[position] === aimKey)
            .reduce((acc, key) => {
                acc[key] = data[key];
                return acc;
            }, {});
    };

	const averageRating = (data, position, aimKey) => {
        const values = Object.values(getDataByAimKey(data, position, aimKey));

        const sum = values.reduce((acc, value) => acc + value, 0);
        const average = values.length ? sum / values.length : 0;

        return average.toFixed(1);
	}

	useEffect(()=>{
		addStraitStage(maxLastStageNumber)
		setStraits(stages)
	}, [])

	const addStraitStage = (maxLastStageNumber) => {
		for (let i = 1; i <= maxLastStageNumber; i++) {
			stages.push(renderStraitStage(i))
		}
	}

	const renderAromasAndTastes = (data, aromas=false, taste=false) => {
		const tempArr = [];
		for (const key in data) {
			const rKey = key.split('');
			tempArr.push(
				<li className="myforminteraction__row" >
					<bdi>{rKey[1]}.{rKey[2]}) </bdi>{data[key]}
				</li>
			);
		}
		if (aromas) {aromasRender.current = tempArr}
		if (taste) {tastesRender.current = tempArr}
		
	};

	const renderStraitStage = (straitNum) => {
		const straitsData = getDataByAimKey(straitsStagesFormData, 0, String(straitNum))
		const aromasData = getDataByAimKey(aromaStagesFormData, 0, String(straitNum))
		const tastesData = getDataByAimKey(tasteStagesFormData, 0, String(straitNum))

		renderAromasAndTastes(aromasData, true, false)	
		renderAromasAndTastes(tastesData, false, true)	

		return (
			<section className="myforminteraction__section"> 
				<ul className="myform__list">
					<li className="myforminteraction__row"><bdi>Пролив №</bdi>{straitNum}</li>
					<li className="myforminteraction__row"><bdi><br/></bdi></li>
					<li className="myforminteraction__row"><bdi>Аромат: </bdi></li>
					{aromasRender.current}
					<li className="myforminteraction__row"><bdi><br/></bdi></li>
					<li className="myforminteraction__row"><bdi>Вкус: </bdi></li>
					{tastesRender.current}
					<li className="myforminteraction__row"><bdi><br/></bdi></li>
					<li className="myforminteraction__row"><bdi>Комментарий:</bdi></li>
					<li className="myforminteraction__row"><bdi>{straitsData[straitNum+'1']}</bdi></li>
					<li className="myforminteraction__row"><bdi>Время заваривания: </bdi>{(straitsData[straitNum+'2'])}</li>
					<li className="myforminteraction__row"><bdi>Рейтинг пролива: </bdi>{straitsData[straitNum+'3']}/10 пиал</li>
				</ul>
			</section>
		)
	}

	function postAromaData(aromaStages, formId){
		// console.log()
		for (const [key, data] of Object.entries(aromaStages)) {
			const keys = String(key).split('').map(Number)
			const brewId = keys[0]
			const aromaShadeId = keys[1]
			const aromaStage = keys[2]
			console.log(data)
			console.log(key)
			if (aromaStage == 1) {
				props.postFormStage2Aroma(data, formId, brewId, aromaShadeId)
			} else {
				props.patchFormStage2Aroma(data, formId, brewId, aromaShadeId, aromaStage)
			}
		}
	}
	
	function postTasteData(tasteStages, formId){
		for (const [key, data] of Object.entries(tasteStages)) {
			const keys = String(key).split('').map(Number)
			const brewId = keys[0]
			const tasteShadeId = keys[1]
			const tasteStage = keys[2]
			if (tasteStage == 1) {
				props.postFormStage2Taste(data, formId, brewId, tasteShadeId)
			} else {
				props.patchFormStage2Taste(data, formId, brewId, tasteShadeId, tasteStage)
			}
		}
	}
	
	function postStraitData(straitStages, formId){
		let checkKey = 1
		for (const [key, data] of Object.entries(straitStages)) {
			const straitNumKey = String(key).split('').map(Number)[0]
			
			if (straitNumKey == checkKey) {
				const straitData = {
					description: straitStages[String(straitNumKey)+'1'] ? straitStages[String(straitNumKey)+'1'] : 'None',
					brewingTime: straitStages[String(straitNumKey)+'2'] ,
					brewingRating: straitStages[String(straitNumKey)+'3'],
				}
				props.postFormStage2Brew(straitData, formId, straitNumKey)
				checkKey += 1
	
				// if (!isSubmitted){
				// 	props.postFormStage2Brew(straitData, formId, straitNumKey)
				// } else {
				// 	props.patchFormStage2Brew(straitData, formId, straitNumKey)
				// }
	
			}

		}
	
	}

	const onSubmit = (e) => {
		e.preventDefault()
		const formId = '0C7C95FA02C054C3B96517C0'
		// localStorage.setItem('isStage2Commit', true)
		if (teaInfo.teaName != 'undefined'){
			
			postAromaData(aromaStagesFormData, formId)
			postTasteData(tasteStagesFormData, formId)
			postStraitData(straitsStagesFormData, formId)
			props.postFormStage1(teaInfo, formId)
			console.log('SENDED')
		}
		else{
			console.log('NOT SENDED')
		}
	}

	return(
		<>
		<Header navigation={props.navigation}/>
		<div className="myforminteraction">

			<section className="myforminteraction__section"> 
				<ul className="myforminteraction__list">
					<li className="myforminteraction__row"><bdi>Название: </bdi>{teaInfo.teaName}</li>
					<li className="myforminteraction__row"><bdi>Тип чая: </bdi>{teaInfo.teaType}</li>
					<li className="myforminteraction__row"><bdi>Вес: </bdi>{teaInfo.teaWeight} г</li>
					<li className="myforminteraction__row"><bdi>Вода: </bdi>{teaInfo.waterBrand}</li>
					<li className="myforminteraction__row"><bdi>Объем воды: </bdi>{teaInfo.waterVolume} мл</li>
					<li className="myforminteraction__row"><bdi>Температура воды: </bdi>{teaInfo.waterTemperature} oC</li>
					<li className="myforminteraction__row"><bdi>Посуда: </bdi>{teaInfo.teaWare}</li>
					<li className="myforminteraction__row"><bdi>Метод заваривания: </bdi>{teaInfo.brewingType}</li>
					<li className="myforminteraction__row"><bdi>Дата публикации: </bdi>{currentTimestamp}</li>
					<li className="myforminteraction__row"><bdi>Итоговый рейтинг: </bdi>{averageRating(straitsStagesFormData, 1, '3')}/10 пиал</li>
				</ul>
			</section>

			{straits}

			<div className="myforminteraction__buttons">
				<FormButton 
					buttonName={'Удалить форму'}
					width={'100%'}
					margin={'0px'}
					onClick={()=>{
						clearTeaFormData()
						props.navigateAfterSubmit()
					}}
				/>
				<FormButton 
					buttonName={'Назад'}
					width={'100%'}
					margin={'0px'}
					onClick={()=>{history(-1)}}
				/>

				<FormButton 
					buttonName={'Отправить Форму'}
					width={'100%'}
					margin={'0px'}
					onClick={onSubmit}
				/>
			</div>

		</div>
		</>
		)
}

export default MyFormInteraction;