import React from 'react';
import Select from 'react-select';

function SelectBox(props) {


	return(
		<div className="selectbox">
			<p className="selectbox__name">{props.boxName}</p>
			<Select	options={props.options} />
		</div>
		)
}

export default SelectBox;