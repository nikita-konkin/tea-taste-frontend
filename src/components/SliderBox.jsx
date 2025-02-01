import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import MuiInput from '@mui/material/Input';


import { ThemeProvider, createTheme } from '@mui/material/styles';
// import RalewayWoff2 from './fonts/Raleway-Regular.woff2';

const Input = styled(MuiInput)`
  width: 42px;
`;

function valuetext(value) {
	return `${value}°C`;
}


const CustomSlider = styled(Slider)(({ theme }) => ({
	padding: '0px', // Disable padding
	// minWidth: '100%',
	[theme.breakpoints.up('xs')]: {
	  padding: '0px', // Disable padding for larger screens
	//   minWidth: '300px',
	},
  }));

function SliderBox({ name, onChange, value, sliderName, maxValue, defaultValue, units, marks, setValue }) {

	const [generatedMarks, setMarks] = useState([]);

	useEffect(() => {
		SliderDataGenerator(marks, units);
	}, [marks, units]);

	function SliderDataGenerator(data, units) {
		const sliderData = [];
		for (let i = 0; i < data.length; i++) {
			const entries = new Map([
				['value', data[i][0]],
				['label', data[i][1] + units],
			]);
			const obj = Object.fromEntries(entries);
			sliderData.push(obj);
		}
		setMarks(sliderData);
	}

	const handleSliderChange = (event, newValue) => {

		onChange(event, newValue);
		setValue(name, newValue); 
	};

	const handleInputChange = (event) => {
		const newValue = Number(event.target.value);
		onChange(event, newValue);
		setValue(name, newValue); 
	};

	return (
		<>
			<Box sx={{ mt: 0 }} />
			<Typography style={{ color: 'white', margin: '0' }} gutterBottom>{sliderName}</Typography>
			<Grid container spacing={0}>
				<Grid item sx={{ mt: 0, mb: 2, ml: 2 }} xs={10}>
					<CustomSlider
						disableGutters
						valueLabelDisplay="auto"
						defaultValue={defaultValue}
						getAriaValueText={valuetext}
						marks={generatedMarks}
						max={maxValue}
						name={name}
						onChange={handleSliderChange}
						value={value}

						step={1}
						sx={{
							width: '93%',
							height: '25%',
							color: '#FFFFFF',
							fontcolor: '#FFFFFF',
							padding: '0px',
							'& .MuiSlider-thumb': {
								borderRadius: '8px',
							},
							'& .MuiSlider-valueLabelOpen':
							{
								color: '#FFFFFF',
								backgroundColor: '#728A7C',
							},
							'& .MuiSlider-markLabel':
							{
								color: '#FFFFFF',
								fontSize: '12px',
								margin: '0 0 0 7px',
								top: '15px',
							},

							'& .MuiSlider-mark': {
								backgroundColor: '#00ffaf',
								margin: '0 0 0 0',
								width: '4px',
								height: '6px',

							},
							'& .MuiSlider-rail': {
								backgroundColor: '#728A7C',
								height: '6px',
							},

						}}
					/>

				</Grid>
				<Grid item xs>
					<Input
						value={value}
						size="small"
						onChange={handleInputChange}
						defaultValue={defaultValue}
						inputProps={{
							step: 1,
							min: 0,
							max: maxValue,
							type: 'number',
							'aria-labelledby': 'input-slider',
						}}
						sx={{
							width: '45px',
							color: '#FFFFFF',
							'&::before': {
								borderBottom: '1px solid rgba(255, 255, 255, 0.42);',
								width: '45px',
							}
						}}
					/>
				</Grid>
			</Grid>
		</>
	)
}

export default SliderBox;