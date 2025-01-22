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

	const {aromaStagesFormData, tasteStagesFormData, straitsStagesFormData, maxLastStageNumberFnc} = useTeaFormContext();
	const teaDataLocal = JSON.parse(localStorage.getItem('teaData'))
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

        return average;
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

	
	return(
		<>
		<Header navigation={props.navigation}/>
		<div className="myforminteraction">

			<section className="myforminteraction__section"> 
				<ul className="myforminteraction__list">
					<li className="myforminteraction__row"><bdi>Название: </bdi>{teaDataLocal.teaName}</li>
					<li className="myforminteraction__row"><bdi>Тип чая: </bdi>{teaDataLocal.teaType}</li>
					<li className="myforminteraction__row"><bdi>Вес: </bdi>{teaDataLocal.teaWeight} г</li>
					<li className="myforminteraction__row"><bdi>Вода: </bdi>{teaDataLocal.waterBrand}</li>
					<li className="myforminteraction__row"><bdi>Объем воды: </bdi>{teaDataLocal.waterVolume} мл</li>
					<li className="myforminteraction__row"><bdi>Температура воды: </bdi>{teaDataLocal.waterTemperature} oC</li>
					<li className="myforminteraction__row"><bdi>Посуда: </bdi>{teaDataLocal.teaWare}</li>
					<li className="myforminteraction__row"><bdi>Метод заваривания: </bdi>{teaDataLocal.brewingType}</li>
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
				/>
				<FormButton 
					buttonName={'Назад'}
					width={'100%'}
					margin={'0px'}
					onClick={()=>{history(-1)}}
				/>

				<FormButton 
					buttonName={'Отправить'}
					width={'100%'}
					margin={'0px'}
					
				/>
			</div>

		</div>
		</>
		)
}

export default MyFormInteraction;