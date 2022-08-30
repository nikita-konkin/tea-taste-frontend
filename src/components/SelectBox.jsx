import React from 'react';
import Select from 'react-select';

function SelectBox(props) {

	const options = [
  { label: "Test1", value: 1 },
  { label: "Test2", value: 3 },
  { label: "Test3", value: 2 },
  { label: "Test4", value: 3 },
	];


	return(
		<div className="selectbox">
			<p className="selectbox__name">{props.boxName}</p>
			<Select	options={options} />
		</div>
		)
}

export default SelectBox;