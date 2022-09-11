import React, {useState} from 'react';
import Select from 'react-select';
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { styled } from "@mui/material/styles";

const useStyles = styled((theme) => ({
  root: {
    "& .MuiInputLabel-outlined:not(.MuiInputLabel-shrink)": {
      // Default transform is "translate(14px, 20px) scale(1)""
      // This lines up the label with the initial cursor position in the input
      // after changing its padding-left.
      transform: "translate(34px, 20px) scale(1);"
    }
  },
  inputRoot: {
    color: "purple",
    // This matches the specificity of the default styles at https://github.com/mui-org/material-ui/blob/v4.11.3/packages/material-ui-lab/src/Autocomplete/Autocomplete.js#L90
    '&[class*="MuiOutlinedInput-root"] .MuiAutocomplete-input:first-child': {
      // Default left padding is 6px
      paddingLeft: 26
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "green"
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "red"
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "purple"
    }
  }
}));

const StyledTextField = styled(TextField)({
	width: '100%',
  "& label, & label.Mui-focused": {
    color: "#ffffff",
    '& .MuiInput-underline::before': {
      // border: '8px solid',
      borderBottomColor: 'rgba(255, 255, 255, 0.42)',
      // width: '28px',

    },
  }
});

function SelectBox(props) {
	const classes = useStyles()
	return(

		// <div className="selectbox">
		// 	<p className="selectbox__name">{props.boxName}</p>
		// 	<Select	options={props.options} />
		// </div>

    <Autocomplete
    classes = {classes}
      options={props.options}
      getOptionLabel={(option) => option.title}
      // style={{ width: 300 }}
     //  sx={{
     //  "& .css-1a1fmpi-MuiInputBase-root-MuiInput-root::before":
     //      // { borderBottomColor: "blue" }
     //      { borderBottomColor: "grey"},
    	// }}
			renderInput={(params) => (
				<StyledTextField
					{...params}
					label={props.boxName}
					variant="standard"
				/>
			)}
      // renderInput={(params) => {
      //   return (
      //     <TextField
      //       {...params}
      //       label={props.boxName}
      //       variant="outlined"
      //       fullWidth
      //     />
      //   );
      // }}
    />

		)
}

export default SelectBox;