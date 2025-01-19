import {
  useState,
  useEffect,
  useRef
} from 'react'
import { useNavigate } from 'react-router-dom';
import FormButton from './FormButton.jsx';
import Header from './Header.jsx'

import { useTeaFormContext } from './TeaFormContext.jsx';

function MyFormInteraction(props) {
	const [straits, setStraits] = useState([])
	let stages = []

	const history = useNavigate();

	const {aromaStagesFormData, tasteStagesFormData, straitsStagesFormData} = useTeaFormContext();
	const teaDataLocal = JSON.parse(localStorage.getItem('teaData'))
	const currentTimestamp = new Date().toLocaleString()
	
	const averageRating = (data) => {
        const values = Object.keys(data)
            .filter(key => key.length > 1 && key[1] === '3')
            .map(key => data[key]);

        const sum = values.reduce((acc, value) => acc + value, 0);
        const average = values.length ? sum / values.length : 0;

        return average;
	}

	useEffect(()=>{
		addStraitStage()
		setStraits(stages)
	}, [])

	const addStraitStage = () => {
		stages.push(renderStraitStage())
	}

	const renderStraitStage = () => {
		return (
			<section className="myforminteraction__section"> 
				<ul className="myform__list">
					<li className="myforminteraction__row"><bdi>Пролив №</bdi>1</li>
					<li className="myforminteraction__row"><bdi><br/></bdi></li>
					<li className="myforminteraction__row"><bdi>Аромат: </bdi></li>
					<li className="myforminteraction__row"><bdi>1.1) </bdi>Цветочный</li>
					<li className="myforminteraction__row"><bdi>1.2) </bdi>Летний луг</li>
					<li className="myforminteraction__row"><bdi>1.3) </bdi>Жасмин</li>
					<li className="myforminteraction__row"><bdi>2.1) </bdi>Сладкий</li>
					<li className="myforminteraction__row"><bdi>2.2) </bdi>-</li>
					<li className="myforminteraction__row"><bdi>2.3) </bdi>Ириска</li>
					<li className="myforminteraction__row"><bdi><br/></bdi></li>
					<li className="myforminteraction__row"><bdi>Вкус: </bdi></li>
					<li className="myforminteraction__row"><bdi>1.1) </bdi>Ореховый</li>
					<li className="myforminteraction__row"><bdi>1.2) </bdi>Попкорн</li>
					<li className="myforminteraction__row"><bdi>2.1) </bdi>Сладкий</li>
					<li className="myforminteraction__row"><bdi>2.2) </bdi>Мед</li>
					<li className="myforminteraction__row"><bdi><br/></bdi></li>
					<li className="myforminteraction__row"><bdi>Комментарий</bdi></li>
					<li className="myforminteraction__row"><bdi>Далеко-далеко за словесными горами в стране гласных и согласных живут рыбные тексты. Вдали от всех живут они в буквенных домах на берегу Семантика большого языкового океана. Далеко-далеко за словесными горами в стране гласных и согласных живут рыбные тексты.  </bdi></li>
					<li className="myforminteraction__row"><bdi>Рейтинг пролива: </bdi>8/10 пиал</li>
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
					<li className="myforminteraction__row"><bdi>Итоговый рейтинг: </bdi>{averageRating(straitsStagesFormData)}/10 пиал</li>
				</ul>
			</section>

			{straits}

			{/* <section className="myforminteraction__section"> 
				<ul className="myform__list">
					<li className="myforminteraction__row"><bdi>Пролив №</bdi>2</li>
					<li className="myforminteraction__row"><bdi><br/></bdi></li>
					<li className="myforminteraction__row"><bdi>Аромат: </bdi></li>
					<li className="myforminteraction__row"><bdi>1.1) </bdi>Цветочный</li>
					<li className="myforminteraction__row"><bdi>1.2) </bdi>Летний луг</li>
					<li className="myforminteraction__row"><bdi>1.3) </bdi>Жасмин</li>
					<li className="myforminteraction__row"><bdi>2.1) </bdi>Сладкий</li>
					<li className="myforminteraction__row"><bdi>2.2) </bdi>-</li>
					<li className="myforminteraction__row"><bdi>2.3) </bdi>Ириска</li>
					<li className="myforminteraction__row"><bdi><br/></bdi></li>
					<li className="myforminteraction__row"><bdi>Вкус: </bdi></li>
					<li className="myforminteraction__row"><bdi>1.1) </bdi>Ореховый</li>
					<li className="myforminteraction__row"><bdi>1.2) </bdi>Попкорн</li>
					<li className="myforminteraction__row"><bdi>2.1) </bdi>Сладкий</li>
					<li className="myforminteraction__row"><bdi>2.2) </bdi>Мед</li>
					<li className="myforminteraction__row"><bdi><br/></bdi></li>
					<li className="myforminteraction__row"><bdi>Комментарий</bdi></li>
					<li className="myforminteraction__row"><bdi>Далеко-далеко за словесными горами в стране гласных и согласных живут рыбные тексты. Вдали от всех живут они в буквенных домах на берегу Семантика большого языкового океана. Далеко-далеко за словесными горами в стране гласных и согласных живут рыбные тексты.  </bdi></li>
					<li className="myforminteraction__row"><bdi>Рейтинг пролива: </bdi>8/10 пиал</li>
				</ul>
			</section> */}
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