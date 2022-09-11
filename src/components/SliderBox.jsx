import React, {useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import MuiInput from '@mui/material/Input';


import { ThemeProvider , createTheme } from '@mui/material/styles';
// import RalewayWoff2 from './fonts/Raleway-Regular.woff2';


const Input = styled(MuiInput)`
  width: 42px;
`;

function valuetext(value) {
  return `${value}°C`;
}



function SliderBox(props) {

	const maxValue = props.maxValue
	const defaultValue = props.defaultValue
	const units = props.units
	const sliderData = props.marks
	const [marks, setMarks] = useState([])
  
	
	useEffect(() => {
		SliderDataGenerator(sliderData, units)
	}, []);


	function SliderDataGenerator(data, units) {
		const sliderData = []
		for (var i = 0; i < data.length; i++){
			const entries = new Map([
			  ['value', data[i][0]],
			  ['label', data[i][1]+units]
			]);
			const obj = Object.fromEntries(entries);
			sliderData.push(obj)
		}
		setMarks(sliderData)
	}

	const theme = createTheme({
	   typography: {
	    "fontFamily": `jura`,
	    "fontSize": 14,
	    // "color": '#FFFFFF',
	    // "fontWeightLight": 300,
	    // "fontWeightRegular": 400,
	    // "fontWeightMedium": 500
	   }
			}, []);


	const [value, setValue] = React.useState(defaultValue);

	const handleInputChange = (event) => {
		setValue(event.target.value === '' ? '' : Number(event.target.value));
	};

	 const handleSliderChange = (event, newValue) => {
    setValue(newValue);
  };

	return(
		<><ThemeProvider  theme={theme}>
			<Box sx={{ m: 1 }} />
			<Typography style={{color: 'white'}} gutterBottom>{props.sliderName}</Typography>
				<Grid container spacing={1} alignItems="center">
					<Grid item sx={{ m: 0 }}  xs>
						<Typography style={{color: 'white'}}>
						<Slider
						valueLabelDisplay="auto"
						// aria-label="pretto slider"
						defaultValue={defaultValue}
						getAriaValueText={valuetext}
			      value={typeof value === 'number' ? value : 0}
			      onChange={handleSliderChange}
			      marks={marks}
			      max={maxValue}
			      step={1}
		        sx={{
						    width: '95%',
						    color: '#FFFFFF',
						    fontcolor: '#FFFFFF',
						    '& .MuiSlider-thumb': {
						      borderRadius: '8px',
						    },
						    '& .MuiSlider-valueLabelOpen' :
						    {
						    	color: '#FFFFFF',
						    	backgroundColor: '#728A7C'
						    },
						    '& .MuiSlider-markLabel' :
						    {
						    	color: '#FFFFFF',
						    	fontSize: '12px',
						    },
						    '& .MuiGrid-root' :
						    {
						    	padding : '0',
						    	margin : '0',
						    },
						    '& .MuiSlider-mark':{
						    	backgroundColor : '#00ffaf',
						    	width: '4px',
						    	height: '6px',
						    }
						  }}
					/>
					</Typography>
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
							  max: maxValue,
							  type: 'number',
							  'aria-labelledby': 'input-slider',
							}}
							sx={{
						    // width: '100%',
						    color: '#FFFFFF',
						    '&::before': {
						      // border: '8px solid',
						      borderBottom: '1px solid rgba(255, 255, 255, 0.42);',
						      width: '28px',

						    },
						  }}
						/>
					</Grid>
				</Grid>
				</ThemeProvider >
			</>
		)
}

export default SliderBox;