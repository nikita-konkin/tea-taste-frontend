import {
	useState,
	useEffect,
	useRef,
} from 'react'
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import FormButton from './FormButton.jsx';
import Header from './Header.jsx'

// import { useTeaFormContext } from './TeaFormContext.jsx';
// import { use } from 'react';



function MyFormInteraction(props) {

	const stage1Data = JSON.parse(localStorage.getItem('teaFormStage1')) != null ? JSON.parse(localStorage.getItem('teaFormStage1')) : [];
	const stage2Data = JSON.parse(localStorage.getItem('teaFormStage2')) != null ? JSON.parse(localStorage.getItem('teaFormStage2')) : [];

	const [formId, setFormId] = useState(uuidv4());

	// console.log(stage1Data)
	// console.log(stage2Data)

	const [straits, setStraits] = useState([])
	const [avrRaiting, setAvrReiting] = useState(0)
	const [raitingsArrState, setRaitingsArrState] = useState([])

	const raitingsArr = []

	const aromasRender = useRef({})
	const tastesRender = useRef({})

	let stages = []

	const history = useNavigate();

	const currentTimestamp = new Date().toLocaleString()

	const averageRating = (arr) => {

		const sum = arr.reduce((acc, value) => acc + value, 0);
		const average = arr.length ? sum / arr.length : 0;
		return average.toFixed(1);
	}

	useEffect(() => {

		setAvrReiting(averageRating(raitingsArrState))
		// console.log(avrRaiting)

	}, [raitingsArrState])

	useEffect(() => {
		if (stage2Data.straits) {
			addStraitStage(stage2Data.straits.length)
			setStraits(stages)
		}
	}, [])


	const addStraitStage = (maxLastStageNumber) => {
		for (let i = 0; i < maxLastStageNumber; i++) {
			stages.push(renderStraitStage(i))
			raitingsArr.push(stage2Data.straits[i].straitRaiting)
		}
		setRaitingsArrState(raitingsArr)

	}

	const renderAromasAndTastes = (data, straitNum, aromas = false, tastes = false) => {
		let arr = []
		if (aromas) { arr = data.straits[straitNum].aromas }
		if (tastes) { arr = data.straits[straitNum].tastes }
		const tempArr = [];
		for (let index = 0; index < arr.length; index++) {

			const dataObj = arr[index]
			for (const [key, value] of Object.entries(dataObj)) {
				const data = value != null ? value.label : ''
				tempArr.push(
					<li className="myforminteraction__row" key={key}><bdi>{`${straitNum + 1}.${key.split('').slice(-1)})`}</bdi>{data}</li>
				)
			}
		}
		if (aromas) { aromasRender.current = tempArr }
		if (tastes) { tastesRender.current = tempArr }

	};


	const renderStraitStage = (straitNum) => {

		renderAromasAndTastes(stage2Data, straitNum, true, false)
		renderAromasAndTastes(stage2Data, straitNum, false, true)
		// console.log(dayjs(stage2Data.straits[straitNum].straitTime).format('HH:mm:ss'))
		return (
			<section className="myforminteraction__section" key={straitNum}>
				<ul className="myform__list">
					<li className="myforminteraction__row"><bdi>Пролив №</bdi>{straitNum + 1}</li>
					<li className="myforminteraction__row"><bdi><br /></bdi></li>
					<li className="myforminteraction__row"><bdi>Аромат: </bdi></li>
					{aromasRender.current}
					<li className="myforminteraction__row"><bdi><br /></bdi></li>
					<li className="myforminteraction__row"><bdi>Вкус: </bdi></li>
					{tastesRender.current}
					<li className="myforminteraction__row"><bdi><br /></bdi></li>
					<li className="myforminteraction__row"><bdi>Комментарий:</bdi></li>
					<li className="myforminteraction__row"><bdi>{stage2Data.straits[straitNum].straitDescription}</bdi></li>
					<li className="myforminteraction__row"><bdi>Время заваривания: </bdi>{stage2Data.straits[straitNum].straitTime}</li>
					<li className="myforminteraction__row"><bdi>Рейтинг пролива: </bdi>{stage2Data.straits[straitNum].straitRaiting}/10 пиал</li>
				</ul>
			</section>
		)
	}

	async function postAromaData(formId) {

		for (let straitNum = 0; straitNum < stage2Data.straits.length; straitNum++) {
			for (let aromaNum = 0; aromaNum < stage2Data.straits[straitNum].aromas.length; aromaNum++) {

				const aromaDataObj = stage2Data.straits[straitNum].aromas[aromaNum]
				for (const [key, value] of Object.entries(aromaDataObj)) {
					let aromaStage = Number(key.split('').slice(-1))
					let data = value != null ? value.label : 'none'
					data = data != '' ? data : 'none'
					if (stage2Data.straits[straitNum].aromas.length > 0) {
						if (aromaStage == 1) {
							// props.postFormStage2Aroma(data, formId, straitNum+1, aromaNum+1)
							try {
								const result = await props.postFormStage2Aroma(data, formId, straitNum + 1, aromaNum + 1);
								// console.log('Aroms data posted successfully:', result);
							} catch (error) {
								console.error('Error submitting form:', error);
							}
						} else {
							try {
								const result1 = await props.patchFormStage2Aroma(data, formId, straitNum + 1, aromaNum + 1, aromaStage);

							} catch (error) {
								console.error('Error submitting form:', error);
							}
						}
					}
				}
			}
		}

	}

	async function postTasteData(formId) {

		for (let straitNum = 0; straitNum < stage2Data.straits.length; straitNum++) {
			for (let tasteNum = 0; tasteNum < stage2Data.straits[straitNum].tastes.length; tasteNum++) {

				const tasteDataObj = stage2Data.straits[straitNum].tastes[tasteNum]
				for (const [key, value] of Object.entries(tasteDataObj)) {
					let tasteStage = Number(key.split('').slice(-1))
					let data = value != null ? value.label : 'none'
					data = data != '' ? data : 'none'
					if (stage2Data.straits[straitNum].tastes.length > 0) {
						if (tasteStage == 1) {
							try {
								const result = await props.postFormStage2Taste(data, formId, straitNum + 1, tasteNum + 1);
								// console.log('Taste data posted successfully:', result);
							} catch (error) {
								console.error('Error submitting form:', error);
							}
						} else {
							try {
								const result = await props.patchFormStage2Taste(data, formId, straitNum + 1, tasteNum + 1, tasteStage);
								// console.log('Taste data posted successfully:', result);
							} catch (error) {
								console.error('Error submitting form:', error);
							}

						}
					}
				}
			}
		}

	}

	function postStraitData(formId) {

		for (let straitNum = 0; straitNum < stage2Data.straits.length; straitNum++) {

			const straitData = {
				description: stage2Data.straits[straitNum].straitDescription ? stage2Data.straits[straitNum].straitDescription : 'none',
				brewingTime: stage2Data.straits[straitNum].straitTime,
				brewingRating: stage2Data.straits[straitNum].straitRaiting,
			}
			props.postFormStage2Brew(straitData, formId, straitNum + 1)
			// props.patchFormStage2Brew(straitData, formId, straitNum+1)

		}

	}

	function postTeaInfo(formID) {
		props.postFormStage1(stage1Data, formID)
	}

	const onSubmit = async (e) => {
		e.preventDefault()

		try {
			const result1 = await postTasteData(formId)
			const result2 = await postTasteData(formId)
		} catch (error) {
			console.log(error)
		}

		try {
			const result1 = await postAromaData(formId)
			const result2 = await postAromaData(formId)
		} catch (error) {
			console.log(error)
		}

		try {
			postStraitData(formId)
			postTeaInfo(formId)
		} catch (error) {
			console.log(error)
		}

		localStorage.removeItem('teaFormStage1');
		localStorage.removeItem('teaFormStage2');

		alert("Форма успешно отправлена =)");

		props.navigateAfterSubmit()
	}

	return (
		<>
			<Header navigation={props.navigation} />
			<div className="myforminteraction">

				<section className="myforminteraction__section">
					<ul className="myforminteraction__list">
						<li className="myforminteraction__row"><bdi>Название: </bdi>{stage1Data.teaName != null ? stage1Data.teaName.label : ''}</li>
						<li className="myforminteraction__row"><bdi>Тип чая: </bdi>{stage1Data.teaType != null ? stage1Data.teaType.label : ''}</li>
						<li className="myforminteraction__row"><bdi>Вес: </bdi>{stage1Data.teaWeight} г</li>
						<li className="myforminteraction__row"><bdi>Вода: </bdi>{stage1Data.waterBrand != null ? stage1Data.waterBrand.label : ''}</li>
						<li className="myforminteraction__row"><bdi>Объем воды: </bdi>{stage1Data.waterVolume} мл</li>
						<li className="myforminteraction__row"><bdi>Температура воды: </bdi>{stage1Data.waterTemperature} oC</li>
						<li className="myforminteraction__row"><bdi>Цена чая за грамм: </bdi>{stage1Data.price} ₽</li>
						<li className="myforminteraction__row"><bdi>Посуда: </bdi>{stage1Data.teaWare != null ? stage1Data.teaWare.label : ''}</li>
						<li className="myforminteraction__row"><bdi>Метод заваривания: </bdi>{stage1Data.brewingType != null ? stage1Data.brewingType.label : ''}</li>
						<li className="myforminteraction__row"><bdi>Дата публикации: </bdi>{currentTimestamp}</li>
						<li className="myforminteraction__row"><bdi>Итоговый рейтинг: </bdi>{avrRaiting}/10 пиал</li>
					</ul>
				</section>

				{straits}

				<div className="myforminteraction__buttons">
					<FormButton
						buttonName={'Удалить форму'}
						width={'100%'}
						margin={'0px'}
						onClick={() => {
							localStorage.removeItem('teaFormStage1');
							localStorage.removeItem('teaFormStage2');
							props.navigateAfterSubmit()
						}}
					/>
					<FormButton
						buttonName={'Назад'}
						width={'100%'}
						margin={'0px'}
						onClick={() => { history(-1) }}
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