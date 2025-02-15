import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import { purple } from '@mui/material/colors';
import Button from '@mui/material/Button';


function FormButton(props){

  const buttonWidth = props.width ? props.width : '100%'
  const buttonMargin = props.margin ? props.margin : '20px 0 0 0'

  const BootstrapButton = styled(Button)({
    margin: buttonMargin,
    width: buttonWidth,
    boxShadow: 'none',
    textTransform: 'none',
    fontSize: 18,
    // padding: '6px 12px',
    border: '1px solid',
    lineHeight: 1.5,
    color: '#000000',
    backgroundColor: '#96B295',
    borderColor: '#96B295',
    fontFamily: [
      'jura',
      '"Segoe UI Symbol"',
    ].join(','),
    '&:hover': {
      backgroundColor: '#96B295',
      borderColor: '#96B295',
      boxShadow: 'none',
    },
    '&:active': {
      boxShadow: 'none',
      backgroundColor: '#FFFFFF',
      borderColor: '#FFFFFF',
    },
    '&:focus': {
      boxShadow: '0 0 0 0.2rem rgba(255,255,255,.8)',
    },
  });

	return(

		<>
		<BootstrapButton onClick={props.onClick} variant="contained">{props.buttonName}</BootstrapButton>
		</>

		)

}

export default FormButton;