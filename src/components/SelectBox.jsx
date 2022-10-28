import React, {useState} from 'react';
import Select from 'react-select';
import PropTypes from "prop-types";
import Autocomplete, { autocompleteClasses } from "@mui/material/Autocomplete";
// import TextField from "@mui/material/TextField";
import { Popper, TextField, ListItem} from "@mui/material";
import { styled } from "@mui/material/styles";

import { ThemeProvider , createTheme } from '@mui/material/styles';



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

	return(

		// <div className="selectbox">
		// 	<p className="selectbox__name">{props.boxName}</p>
		// 	<Select	options={props.options} />
		// </div>
		<>
		<ThemeProvider  theme={theme}>
    <Autocomplete
    // classes = {classes}
    	key = {props.id}
      options={props.options}
      getOptionLabel={(option) => option.title}
      PopperComponent={StyledPopper}
      // style={{ width: 300 }}
      sx={{
      marginBottom: '20px',
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
			renderInput={(params) => (
				<StyledTextField
					{...params}
					label={props.boxName}
					variant="standard"
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