import React, {
  useState,
  useEffect,
  useRef
} from 'react'


import Header from './Header.jsx'
import MyForm from './MyForm.jsx'

function MyForms(props) {


	return(
		<>
			<Header navigation={props.navigation}/>
			<div className="myforms">
				<h2 className="header__myforms">Мои формы</h2>
				<MyForm />
				<MyForm />
				<MyForm />
				<MyForm />
			</div>
		</>

		)
}

export default MyForms;