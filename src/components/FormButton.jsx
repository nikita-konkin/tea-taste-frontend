import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import { purple } from '@mui/material/colors';
import Button from '@mui/material/Button';


const BootstrapButton = styled(Button)({
	margin: '20px 0 0 0',
	width: '100%',
  boxShadow: 'none',
  textTransform: 'none',
  fontSize: 18,
  // padding: '6px 12px',
  border: '1px solid',
  lineHeight: 1.5,
  color: '#000000',
  backgroundColor: '#FFFFFF',
  borderColor: '#C4C4C4',
  fontFamily: [
    'jura',
    '"Segoe UI Symbol"',
  ].join(','),
  '&:hover': {
    backgroundColor: '#FFFFFF',
    borderColor: '#C4C4C4',
    boxShadow: 'none',
  },
  '&:active': {
    boxShadow: 'none',
    backgroundColor: '#FFFFFF',
    borderColor: '#C4C4C4',
  },
  '&:focus': {
    boxShadow: '0 0 0 0.2rem rgba(196,196,196,.5)',
  },
});


function FormButton(porps){


	return(

		<>
		<BootstrapButton onClick={porps.nextStage} variant="contained">{porps.buttonName}</BootstrapButton>
		</>

		)

}

export default FormButton;