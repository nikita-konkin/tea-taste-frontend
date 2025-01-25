import React, {useState, useEffect, useRef  } from 'react';
import Select from 'react-select';
import PropTypes from "prop-types";
import Autocomplete, { autocompleteClasses } from "@mui/material/Autocomplete";
// import TextField from "@mui/material/TextField";
import { Popper, TextField, ListItem} from "@mui/material";
import { styled } from "@mui/material/styles";

import { ThemeProvider , createTheme } from '@mui/material/styles';
import { use } from 'react';

import { useTeaFormContext } from './TeaFormContext';

// const styledPopper = {
// 	// color: 'red',
// 	// backgroundColor: '#666666',
// 	  "& .MuiAutocomplete-popper": {
//     color: "red",
//   }
// }

// const StyledPopper = styled(ListItem)`
// 	// color: red;
// 	// background-color: white;

// 	& div.MuiAutocomplete-popper{
// 		color: red;
// 		border-radius: 10px;
// 	}
// 	`;

const StyledTextField = styled(TextField)({
	width: '100%',
  "& label, & label.Mui-focused": {
    color: "#ffffff",
    margin: '0 0 0 5px',
  }
});

const StyledPopper = styled(Popper)({
  [`& .${autocompleteClasses.listbox}`]: {
    boxSizing: 'border-box',
    backgroundColor: '#425E42',
    color: '#ffffff',
    '& ul': {
      padding: 0,
      margin: 0,
    },
  },
});



function SelectBox(props) {
  
  // const options = useRef(props.options);
  const {subCategory,
    updateAromaStagesFormData,
    aromaStagesFormData
  } = useTeaFormContext();

  const [options, setOptions] = useState(props.options);
  let [deafultValue, setDefaultValue] = useState({ title: props.defaultValue || "Выберите из списка" })
  const firstValueSubCategory = Object.values(subCategory)[0]

  // useEffect(() => {
  //   // console.log(selectBoxID.current, props.keyId)
  //   if (firstValueSubCategory){
  //     // setOptions(Object.values(subCategory))
  //     options.current = Object.values(subCategory)
  //     setDefaultValue(firstValueSubCategory)
  //     aromaStagesFormData[props.keyId] = firstValueSubCategory.title
  //     updateAromaStagesFormData(aromaStagesFormData)
  //   }
  // }, [subCategory])
    
  useEffect(() => {
    setDefaultValue({ title: props.defaultValue || "Выберите из списка" })
  }, [])

  const handleFocus = (event) => {
    
    if (event.target.id in subCategory){
      setDefaultValue(subCategory[event.target.id])
      setOptions(subCategory[event.target.id])
      // options.current = Object.values(subCategory)
      console.log('event.target.id', event.target.id)
      console.log('subCategory', subCategory[event.target.id]) 
      console.log('subCategory', Object.values(subCategory[event.target.id])[0])
    }
  }


	const theme = createTheme({
	   typography: {
	    "fontFamily": `jura`,
	    "fontSize": 16,
	    // "color": '#FFFFFF',
	    // "fontWeightLight": 300,
	    // "fontWeightRegular": 400,
	    // "fontWeightMedium": 500
	   }
			}, []);

  useEffect(() => { 
    console.log('porps.options', options)
  }, [options]);



	return(

		// <div className="selectbox">
		// 	<p className="selectbox__name">{props.boxName}</p>
		// 	<Select	options={props.options} />
		// </div>
		<>
		<ThemeProvider  theme={theme}>
    <Autocomplete
    // classes = {classes}
    	// onInputChange={(event, value)=>{console.log('value', value)}}
    	onChange = {(event, value)=>{
        props.handler(value.title, event.target.id, props.boxId)
        // if (props.boxId === 'AromaStage1'){
          props.optionsHandler(value, event.target.id)
        // }
        setDefaultValue(value)
        // if (props.boxId === 'AromaStage2'){
        //   console.log('boxId', props.boxId)
        //   console.log('options', props.options)
        // }
        }}
    	key = {props.boxId}
    	id = {props.keyId}
      value={deafultValue}
      // inputValue={props.defaultValue}
      defaultValue={deafultValue}
      options = {options}
      getOptionLabel = {(option) => option.title}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      PopperComponent = {StyledPopper}
      // style={{ width: 300 }}
      sx = {{
        margin: '0 5px 5px 5px',
        "& .MuiInputBase-root::before":
            { borderBottomColor: "white"},
        "& .MuiInputBase-root:hover:not(.Mui-disabled):before":
            { borderBottomColor: "white"},
        "& .MuiInputBase-root::after":
            { borderBottomColor: "#00ffaf"},
        "& .MuiSvgIcon-root":
            { color: "white"},
        "& .MuiAutocomplete-input":
            { color: "white"},
    	}}
			renderInput = {(params) => (
				<StyledTextField
					{...params}
					label={props.boxName}
          defaultValue={props.deafultValue}
					variant="standard"
          onFocus={handleFocus}
				/>
			)}

			// renderOption={(params, option) => 
			// 	<StyledPopper {...params}>{option.title}</StyledPopper>
			// }
    />
    </ThemeProvider>
    </>

		)
}

export default SelectBox;