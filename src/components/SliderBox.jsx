import React from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import MuiInput from '@mui/material/Input';

const Input = styled(MuiInput)`
  width: 42px;
`;

function valuetext(value) {
  return `${value}°C`;
}

function SliderBox(props) {

	const marks = [
	  {
	    value: 0,
	    label: '0г',
	  },
	  {
	    value: 5,
	    label: '5г',
	  },
	  {
	    value: 10,
	    label: '10г',
	  },
	  {
	    value: 50,
	    label: '50г',
	  },
	];


	const [value, setValue] = React.useState(5);

	const handleInputChange = (event) => {
		setValue(event.target.value === '' ? '' : Number(event.target.value));
	};

	 const handleSliderChange = (event, newValue) => {
    setValue(newValue);
  };

	return(
		<>
			<Box sx={{ m: 3 }} />
			<Typography gutterBottom>{props.sliderName}</Typography>
				<Grid container spacing={2} alignItems="center">
					<Grid item xs>
						<Slider
						valueLabelDisplay="auto"
						// aria-label="pretto slider"
						defaultValue={5}
						getAriaValueText={valuetext}
			      value={typeof value === 'number' ? value : 0}
			      onChange={handleSliderChange}
			      marks={marks}
			      max={50}
			      step={1}
		        sx={{
						    width: '100%',
						    color: '#FFFFFF',
						    '& .MuiSlider-thumb': {
						      borderRadius: '8px',
						    },
						    '& .MuiSlider-valueLabelOpen' :
						    {
						    	color: '#FFFFFF',
						    	backgroundColor: '#728A7C'
						    },
						  }}
					/>
					</Grid>
					<Grid item>
						<Input
							value={value}
							size="small"
							onChange={handleInputChange}
							// onBlur={handleBlur}
							inputProps={{
							  step: 1,
							  min: 0,
							  max: 50,
							  type: 'number',
							  'aria-labelledby': 'input-slider',
							}}
							sx={{
						    // width: '100%',
						    color: '#FFFFFF',
						    '&::before': {
						      // border: '8px solid',
						      borderBottom: '1px solid rgba(255, 255, 255, 0.42);',
						      width: '20px',

						    },
						  }}
						/>
					</Grid>
				</Grid>
			</>
		)
}

export default SliderBox;