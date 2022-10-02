import React, { useState } from 'react';
import SelectBox from './SelectBox.jsx';
import FormButton from './FormButton.jsx';

function AromaStages(props) {


	return(
		<>
			<div className=''>
				<SelectBox options = {props.options}/>
				<SelectBox options = {props.options}/>
				<SelectBox options = {props.options}/>
			</div>
			<FormButton 
				buttonName={'Добавить еще оттенок аромата'}
			/>
		</>
		)
}

export default AromaStages;