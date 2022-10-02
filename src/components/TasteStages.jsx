import React, { useState } from 'react';
import SelectBox from './SelectBox.jsx';
import FormButton from './FormButton.jsx';

function TasteStages(props) {


	return(
		<>
			<div className=''>
				<SelectBox options = {props.options}/>
				<SelectBox options = {props.options}/>
			</div>
			<FormButton 
				buttonName={'Добавить еще оттенок вкуса'}
			/>
		</>
		)
}

export default TasteStages;