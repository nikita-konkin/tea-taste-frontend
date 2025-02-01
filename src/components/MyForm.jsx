import React, {
  useState,
  useEffect,
  useRef
} from 'react'
import FormButton from './FormButton.jsx';

function MyForm({formData, navigation}) {


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
					onClick={()=>{navigation()}}
				/>
			</div>

		</section>
		)
}

export default MyForm;