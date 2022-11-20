import React, {
  useState,
  useEffect,
  useRef
} from 'react'
import FormButton from './FormButton.jsx';

function MyForm(props) {

	function EditForm() {

	}

	return(
		<section className="myform"> 
			<ul className="myform__list">
			   <li className="myform__row"><bdi>Название: </bdi>Шу Шен</li>
			   <li className="myform__row"><bdi>Дата публикации: </bdi>06.03.2022 17:47</li>
			   <li className="myform__row"><bdi>Итоговый рейтинг: </bdi>8/10 пиал</li>
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
					onClick={()=>{props.navigation()}}
				/>
			</div>

		</section>
		)
}

export default MyForm;