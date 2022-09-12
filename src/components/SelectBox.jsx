import React, {useState} from 'react';
import Select from 'react-select';
import PropTypes from "prop-types";
import Autocomplete, { autocompleteClasses } from "@mui/material/Autocomplete";
// import TextField from "@mui/material/TextField";
import { Popper, TextField} from "@mui/material";
import { styled } from "@mui/material/styles";



const StyledPopper = styled(Popper)({
  [`& .${autocompleteClasses.listbox}`]: {
    boxSizing: 'border-box',
    '& ul': {
      padding: 0,
      margin: 0,
      color: 'red'
    },
  },
});



const StyledTextField = styled(TextField)({
	width: '100%',
  "& label, & label.Mui-focused": {
    color: "#ffffff",
    '& .MuiInput-underline::before': {
      // border: '8px solid',
      // borderBottomColor: 'rgba(0, 0, 0, 0.42)',
      // width: '28px',

    },
  }
});


function SelectBox(props) {
	// const classes = useStyles()
	return(

		// <div className="selectbox">
		// 	<p className="selectbox__name">{props.boxName}</p>
		// 	<Select	options={props.options} />
		// </div>

    <Autocomplete
    // classes = {classes}
      options={props.options}
      getOptionLabel={(option) => option.title}
      // style={{ width: 300 }}
      sx={{
      "& .MuiInputBase-root::before":
          { borderBottomColor: "white"},
      "& .MuiInputBase-root:hover:not(.Mui-disabled):before":
          { borderBottomColor: "white"},
      "& .MuiInputBase-root::after":
          { borderBottomColor: "#00ffaf"},
      "& .MuiSvgIcon-root":
          { color: "white"},
    	}}
			renderInput={(params) => (
				<StyledTextField
					{...params}
					label={props.boxName}
					variant="standard"
				/>
			)}
			// PopperComponent={StyledPopper}
		  renderOption={(props, option, state) => {
		    return (
		      <StyledPopper>{`${option.title}`}</StyledPopper>
		    ); //display value
		  }}
    />

		)
}

export default SelectBox;