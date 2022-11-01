import React, {
  useState,
  useEffect,
  useRef
} from 'react'

import FormButton from './FormButton.jsx';
import Header from './Header.jsx'

function Profile(props) {


	return(
		<>
		<Header navigation={props.navigation}/>
		<form className="authorization">
		<h1 className="authorization__header">Профиль</h1>
			<div className="authorization__fields-box">
				<input className="authorization__email" type="text" 
					name="email" placeholder="Email" 
					minLength={2} maxLength={30} required />
				<input className="authorization__email" type="text" 
					name="name" placeholder="Имя" 
					minLength={2} maxLength={30} required />
				<FormButton 
					buttonName={'Редактировать профиль'}
				/>
				<FormButton 
					buttonName={'Logout'}
				/>

			</div>
		</form>
		</>

		)
}

export default Profile;