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

	const sliderTitleStyle = {
		color: 'white',
		margin: '0',
	}
	const [value, setValue] = React.useState(defaultValue);

	const handleInputChange = (event) => {
		setValue(event.target.value === '' ? '' : Number(event.target.value));
		props.handler(event.target.value, 'None', props.boxId)
	};

	 const handleSliderChange = (event, newValue) => {
    setValue(newValue);
    props.handler(event.target.value, 'None', props.boxId)
  };

  const test = {
  	margin: '0px 0px 20px -5px',
  	padding : '0px',
  	alignItems: 'top',
  }

	return(
		<><ThemeProvider  theme={theme}>
			<Box sx={{ mt: 2 }} />
			<Typography style={sliderTitleStyle} gutterBottom>{props.sliderName}</Typography>
				<Grid container spacing={1} style={test} >
					<Grid item sx={{mt:2}}  xs>
						<Typography style={{color: 'white'}}>
						<Slider
						valueLabelDisplay="auto"
						defaultValue={defaultValue}
						getAriaValueText={valuetext}
						value={typeof value === 'number' ? value : 0}
						onChange={handleSliderChange}
						marks={marks}
						max={maxValue}
						step={1}
						sx={{
									width: '95%',
									height: '15%',
									color: '#FFFFFF',
									fontcolor: '#FFFFFF',
									padding: '0px',
									'& .MuiSlider-thumb': {
									borderRadius: '8px',
									},
									'& .MuiSlider-valueLabelOpen' :
									{
										color: '#FFFFFF',
										backgroundColor: '#728A7C',
									},
									'& .MuiSlider-markLabel' :
									{
										color: '#FFFFFF',
										fontSize: '12px',
										margin: '0 0 0 7px',
										top: '15px',
									},
									// '& .MuiSlider-marked' :
									// {
									// 	padding : '0px',
									// 	// margin : '10px',
									// },
									'& .MuiSlider-mark':{
										backgroundColor : '#00ffaf',
										margin: '0 0 0 0',
										width: '4px',
										height: '6px',
			
									},
									'& .MuiSlider-rail':{
										backgroundColor: '#728A7C',
										height: '6px',	
									},
									// '& .MuiGrid-root': {
									// 	padding: '22px 0',
									// }
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
						      width: '45px',
						    },
						    '& .MuiInput-input': {
						    	textAlign: 'right',
						    }
						  }}
						/>
					</Grid>
				</Grid>
				</ThemeProvider >
			</>
		)
}

export default SliderBox;