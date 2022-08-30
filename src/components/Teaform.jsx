import React, { useState } from 'react';
import Header from './Header.jsx'
import SelectBox from './SelectBox.jsx';

function Teaform(argument) {

	const options = [
  { label: "Test1", value: 1 },
  { label: "Test2", value: 3 },
  { label: "Test3", value: 2 },
  { label: "Test4", value: 3 },
	];


	return(
		<>
			<Header />
			<form className="form">
				<h3>Шаг 1 основаня информация</h3>
				<SelectBox boxName='Название чая'/>

			</form>
		</>
		)
}

export default Teaform;