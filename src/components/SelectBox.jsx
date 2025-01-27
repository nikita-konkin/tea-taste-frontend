import React, { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import PropTypes from "prop-types";
import Autocomplete, { autocompleteClasses } from "@mui/material/Autocomplete";
// import TextField from "@mui/material/TextField";
import { Popper, TextField, ListItem } from "@mui/material";
import { styled } from "@mui/material/styles";

import { ThemeProvider, createTheme } from '@mui/material/styles';
import { use } from 'react';

import { useTeaFormContext } from './TeaFormContext';


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

  const { subCategory,
    updateAromaStagesFormData,
    aromaStagesFormData
  } = useTeaFormContext();

  const [options, setOptions] = useState(props.options);
  const [disabled, setDisabled] = useState(false);
  const [defaultValue, setDefaultValue] = useState({ title: props.defaultValue || "Выберите из списка" })
  const [value, setValue] = useState(defaultValue)
  const firstValueSubCategory = Object.values(subCategory)[0]

  useEffect(() => {

    if (props.keyId && props.keyId.split('').map(Number)[2] != 1) {
      setDisabled(true)
    }

  }, [])

  useEffect(() => {
    if (props.keyId && subCategory[props.keyId]) {
      if (subCategory[props.keyId].length != 0) {
        // setValue(subCategory[props.keyId][0])
        setOptions(subCategory[props.keyId])
        setDisabled(false)
      }
    }
  }, [subCategory])

  // useEffect(()=>{
  //   if (props.keyId && subCategory[props.keyId]) {
  //     console.log(props.keyId)
  //     console.log(aromaStagesFormData[props.keyId])
      
      
  //     // setDisabled(false)
  //   }
  // },[aromaStagesFormData])

  const handleFocus = (event) => {

    if (event.target.id in subCategory) {
      // setDefaultValue(subCategory[event.target.id])
      // setOptions(subCategory[event.target.id])
      // options.current = Object.values(subCategory)
      console.log('event.target.id', event.target.id)
      console.log('event.target.value', event.target.value)
      console.log('subCategory', subCategory[event.target.id])
      // console.log('subCategory', Object.values(subCategory[event.target.id])[0])
    }

  }

  const theme = createTheme({
    typography: {
      "fontFamily": `jura`,
      "fontSize": 16,
    }
  }, []);

  useEffect(() => {
    console.log('porps.options', options)
  }, [options]);

  return (

    <>
      <ThemeProvider theme={theme}>
        <Autocomplete
          // classes = {classes}
          // onInputChange={(event, value)=>{console.log('value', value)}}
          onChange={(event, value) => {
            props.handler(value.title, event.target.id, props.boxId)
            // if (props.boxId === 'AromaStage1'){
            props.optionsHandler(value, event.target.id, event)
            // }
            setDefaultValue(value)
            setValue(value)
            // if (props.boxId === 'AromaStage2'){
            //   console.log('boxId', props.boxId)
            //   console.log('options', props.options)
            // }
          }}
          key={props.boxId}
          id={props.keyId}
          value={value}
          disabled={disabled}
          // inputValue={value.title}
          defaultValue={defaultValue}
          options={options || []}
          getOptionLabel={(option) => option.title}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          PopperComponent={StyledPopper}
          // style={{ width: 300 }}
          sx={{
            margin: '0 5px 5px 5px',
            "& .MuiInputBase-root::before":
              { borderBottomColor: "white" },
            "& .MuiInputBase-root:hover:not(.Mui-disabled):before":
              { borderBottomColor: "white" },
            "& .MuiInputBase-root::after":
              { borderBottomColor: "#00ffaf" },
            "& .MuiSvgIcon-root":
              { color: "white" },
            "& .MuiAutocomplete-input":
              { color: "white" },
          }}
          renderInput={(params) => (
            <StyledTextField
              {...params}
              label={props.boxName}
              defaultValue={defaultValue}
              variant="standard"
              // onFocus={handleFocus}
            />
          )}

        />
      </ThemeProvider>
    </>

  )
}

export default SelectBox;