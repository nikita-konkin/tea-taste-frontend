import React, {
  useState,
  useEffect,
  useRef
} from 'react'
import FormButton from './FormButton.jsx';
import { usePopup } from './PopupContext.jsx';


function MyForm({formData, getAllMyBrewingsById, getAllMyAromasById, getAllMyTastesById}) {
	const { openPopup } = usePopup();
	const brewsRender = useRef({})
	const brewingsContent = (sessionId) => {
		const brewsLocalData = JSON.parse(localStorage.getItem(`brews_${sessionId}`)) != null ? 
		JSON.parse(localStorage.getItem(`brews_${sessionId}`)) : [];

		const aromasLocalData = JSON.parse(localStorage.getItem(`aromas_${sessionId}`)) != null ?
		JSON.parse(localStorage.getItem(`aromas_${sessionId}`)) : [];

		const tastesLocalData = JSON.parse(localStorage.getItem(`tastes_${sessionId}`)) != null ?
		JSON.parse(localStorage.getItem(`tastes_${sessionId}`)) : [];

		const tempArr = []

		const renderAromasAndTastes = (data, straitNum, aromas = false, tastes = false) => {
			let placeHolder = aromas ? 'аромата' : 'вкуса'
			// if (aromas) { placeHolder = 'аромата' }
			// if (tastes) { placeHolder = 'вкуса' }
			tempArr.push(
				<li className="myforminteraction__row" key={Math.random()}><bdi>{`Оттенки ${placeHolder}`}: </bdi></li>
			)
			for (let i = 0; i < data.length; i++) {
				if (data[i].brewingCount === straitNum) {
					const obj = aromasLocalData.data[i]
					for (const key in obj) {
						if (obj.hasOwnProperty(key) && key.includes('Stage')) {
							tempArr.push(
								<li className="myforminteraction__row" key={Math.random()}><bdi>{`${straitNum}.${key.split('').slice(-1)})`}: </bdi>{obj[key]}</li>
							)
						}
					}
				}
			}

		}


		for (let index = 0; index < brewsLocalData.data.length; index++) {
			const brew = brewsLocalData.data[index];
			
			tempArr.push(
				<li className="myforminteraction__row" key={Math.random()}><bdi>{`Пролив №`}</bdi>{brew.brewingCount}</li>
			)

			renderAromasAndTastes(aromasLocalData.data, brew.brewingCount, true, false)
			renderAromasAndTastes(tastesLocalData.data, brew.brewingCount, false, true)

			tempArr.push(
				<>
				<li className="myforminteraction__row" key={Math.random()}><bdi>{`Время заваривания: `}</bdi>{brew.brewingTime}</li>
				<li className="myforminteraction__row" key={Math.random()}><bdi>{`Описание: `}</bdi>{brew.description}</li>
				<li className="myforminteraction__row" key={Math.random()}><bdi>{`Рейтинг пролива: `}</bdi>{brew.brewingRating}</li>
				</>
			)

		}

		brewsRender.current = tempArr

	}

	const popupContent = () => {
		return(
			<section className="myforminteraction__section">
			<ul className="myforminteraction__list">
				<li className="myforminteraction__row"><bdi>Название: </bdi>{formData.nameRU != null ? formData.nameRU : ''}</li>
				<li className="myforminteraction__row"><bdi>Тип чая: </bdi>{formData.type != null ? formData.type : ''}</li>
				<li className="myforminteraction__row"><bdi>Страна: </bdi>{formData.country != null ? formData.country : ''}</li>
				<li className="myforminteraction__row"><bdi>Вес: </bdi>{formData.weight} г</li>
				<li className="myforminteraction__row"><bdi>Вода: </bdi>{formData.water  != null ? formData.water : ''}</li>
				<li className="myforminteraction__row"><bdi>Объем воды: </bdi>{formData.volume} мл</li>
				<li className="myforminteraction__row"><bdi>Температура воды: </bdi>{formData.temperature} oC</li>
				<li className="myforminteraction__row"><bdi>Цена чая за грамм: </bdi>{formData.price} ₽</li>
				<li className="myforminteraction__row"><bdi>Посуда: </bdi>{formData.teaware  != null ? formData.teaware : ''}</li>
				<li className="myforminteraction__row"><bdi>Метод заваривания: </bdi>{formData.brewingtype != null ? formData.brewingtype : ''}</li>
				<li className="myforminteraction__row"><bdi>Дата публикации: </bdi>{formData.createdAt}</li>
				{/* <li className="myforminteraction__row"><bdi>Итоговый рейтинг: </bdi>{avrRaiting}/10 пиал</li> */}
				{brewsRender.current}
			</ul>
			
		</section>
			)
	}

	return(
		<section className="myform" key={formData.sessionId}> 
			<ul className="myform__list">
			   <li className="myform__row"><bdi>Название: </bdi>{formData.nameRU}</li>
			   <li className="myform__row"><bdi>Дата публикации: </bdi>{formData.createdAt}</li>
			   <li className="myform__row"><bdi>Тип чая: </bdi>{formData.type}</li>
			</ul>
			<div className="myform__buttons">
				<FormButton 
					buttonName={'Удалить'}
					width={'32%'}
					margin={'0px'}

				/>
				<FormButton 
					buttonName={'Изменить'}
					width={'32%'}
					margin={'0px'}
				/>
				<FormButton 
					buttonName={'Просмотр'}
					width={'32%'}
					margin={'0px'}
					onClick={()=>{
						// navigation()
						// alert('Скоро можно будет полнотсь просмотреть форму =)')
						getAllMyBrewingsById(formData.sessionId)
						getAllMyAromasById(formData.sessionId)
						getAllMyTastesById(formData.sessionId)
						brewingsContent(formData.sessionId)
						openPopup(popupContent)
					}}
				/>
			</div>

		</section>
		)
}

export default MyForm;