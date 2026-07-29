import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { purple } from '@mui/material/colors';
import Button from '@mui/material/Button';


function FormButton(props){

  const buttonWidth = props.width ? props.width : '100%'
  const buttonMargin = props.margin ? props.margin : '20px 0 0 0'

  // Liquid-glass button matching the card/popup styling.
  const BootstrapButton = styled(Button)({
    margin: buttonMargin,
    width: buttonWidth,
    boxShadow: 'none',
    textTransform: 'none',
    fontSize: 18,
    lineHeight: 1.5,
    color: '#ffffff',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    border: '1px solid rgba(255, 255, 255, 0.30)',
    borderRadius: '10px',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    fontFamily: [
      'jura',
      '"Segoe UI Symbol"',
    ].join(','),
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.24)',
      border: '1px solid rgba(255, 255, 255, 0.45)',
      boxShadow: 'none',
    },
    '&:active': {
      boxShadow: 'none',
      backgroundColor: 'rgba(255, 255, 255, 0.32)',
    },
    '&:focus': {
      boxShadow: '0 0 0 0.15rem rgba(255, 255, 255, 0.35)',
    },
  });

  // `to` renders the same button as a real <a href>. Navigation done with
  // onClick + navigate() produces no anchor at all: a crawler finds no route
  // out of the page, and a middle-click or "open in new tab" does nothing. The
  // feed's only way into a tasting used to be exactly that.
  // `type` is deliberately not forwarded to the link form — on an <a> the
  // attribute means the MIME type of the target, not "button".
  const asLink = props.to
    ? { component: Link, to: props.to }
    : { type: props.type || 'button' };

	return(

		<>
		<BootstrapButton {...asLink} onClick={props.onClick} variant="contained">{props.buttonName}</BootstrapButton>
		</>

		)

}

export default FormButton;