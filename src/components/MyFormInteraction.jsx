import React, {
  useState,
  useEffect,
  useRef
} from 'react'
import { useNavigate } from 'react-router-dom';
import FormButton from './FormButton.jsx';
import Header from './Header.jsx'

function MyForm(props) {

	const history = useNavigate();

	function EditForm() {

	}

	return(
		<>
		<Header navigation={props.navigation}/>
		<div className="myforminteraction">

			<section className="myforminteraction__section"> 
				<ul className="myforminteraction__list">
					<li className="myforminteraction__row"><bdi>Название: </bdi>Шу Шен</li>
					<li className="myforminteraction__row"><bdi>Тип чая: </bdi>Белый</li>
					<li className="myforminteraction__row"><bdi>Вес: </bdi>5 Г</li>
					<li className="myforminteraction__row"><bdi>Вода: </bdi>Пилигримм</li>
					<li className="myforminteraction__row"><bdi>Объем воды: </bdi>120 мл</li>
					<li className="myforminteraction__row"><bdi>Температура воды: </bdi>85 oC</li>
					<li className="myforminteraction__row"><bdi>Посуда: </bdi>Гайвань</li>
					<li className="myforminteraction__row"><bdi>Метод заваривания: </bdi>Проливы</li>
					<li className="myforminteraction__row"><bdi>Дата публикации: </bdi>06.03.2022 17:47</li>
					<li className="myforminteraction__row"><bdi>Итоговый рейтинг: </bdi>8/10 пиал</li>
				</ul>
			</section>

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

			<section className="myforminteraction__section"> 
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
			</section>
			<div className="myforminteraction__buttons">
				<FormButton 
					buttonName={'Удалить'}
					width={'100%'}
					margin={'0px'}
				/>
				<FormButton 
					buttonName={'Изменить'}
					width={'100%'}
					margin={'0px'}
				/>

				<FormButton 
					buttonName={'Назад'}
					width={'100%'}
					margin={'0px'}
					onClick={()=>{history(-1)}}
				/>
			</div>

		</div>
		</>
		)
}

export default MyForm;