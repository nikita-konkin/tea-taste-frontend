import React, {
  useState,
  useEffect,
  useRef
} from 'react'


function MyForm(props) {

	return(
		<section className="myform"> 
			<ul className="myform__list">
			   <li className="myform__row"><bdi>Название: </bdi>Шу Шен</li>
			   <li className="myform__row"><bdi>Дата публикации: </bdi>06.03.2022 17:47</li>
			   <li className="myform__row"><bdi>Итоговый рейтинг: </bdi>8/10 пиал</li>
			</ul>
		</section>
		)
}

export default MyForm;