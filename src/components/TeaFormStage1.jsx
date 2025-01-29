import React, { useState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Autocomplete, TextField, Slider, Popper, Button, Stack, autocompleteClasses } from '@mui/material';

import Header from './Header.jsx'
import SliderBox from './SliderBox.jsx';

import { styled } from "@mui/material/styles";
import { ThemeProvider, createTheme } from '@mui/material/styles';


import {
	SLIDER_WEIGHT_DATA,
	SLIDER_WATER_DATA,
	SLIDER_TEMPERATURE_DATA
} from '../utils/utils.js'

const theme = createTheme({
	typography: {
		fontFamily: 'jura',
		fontSize: 16,
		color: 'white',
	},
	components: {
		MuiTextField: {
			styleOverrides: {
				root: {
					width: '100%',
					'& label, & label.Mui-focused': {
						color: '#ffffff',
						margin: '0 0 0 0px',
					},
					'& .MuiInputBase-root': {
						color: '#ffffff',
					},
					'& .MuiOutlinedInput-root': {
						'& fieldset': {
							borderColor: '#ffffff',
						},
						'&:hover fieldset': {
							borderColor: '#ffffff',
						},
						'&.Mui-focused fieldset': {
							borderColor: '#ffffff',
						},
					},
				},
			},

		},
	},
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

const teaTypeOptions = [
	{ label: 'Green Tea', value: 'green' },
	{ label: 'Black Tea', value: 'black' },
	{ label: 'Oolong Tea', value: 'oolong' },
	{ label: 'White Tea', value: 'white' },
	{ label: 'Herbal Tea', value: 'herbal' },
];

const waterBrandOptions = [
	{ label: 'Evian', value: 'evian' },
	{ label: 'Fiji', value: 'fiji' },
	{ label: 'Smartwater', value: 'smartwater' },
	{ label: 'Aquafina', value: 'aquafina' },
	{ label: 'Dasani', value: 'dasani' },
];

const teaWareOptions = [
	{ label: 'Glass Teapot', value: 'glass_teapot' },
	{ label: 'Ceramic Teapot', value: 'ceramic_teapot' },
	{ label: 'Stainless Steel Teapot', value: 'stainless_steel_teapot' },
	{ label: 'Cast Iron Teapot', value: 'cast_iron_teapot' },
	{ label: 'Porcelain Teapot', value: 'porcelain_teapot' },
];

const brewingTypeOptions = [
	{ label: 'Gongfu', value: 'gongfu' },
	{ label: 'Western', value: 'western' },
	{ label: 'Grandpa', value: 'grandpa' },
	{ label: 'Cold Brew', value: 'cold_brew' },
	{ label: 'Iced', value: 'iced' },
];

const teaCountryOptions = [
	{ label: 'China', value: 'china' },
	{ label: 'India', value: 'india' },
	{ label: 'Japan', value: 'japan' },
	{ label: 'Sri Lanka', value: 'sri_lanka' },
	{ label: 'Taiwan', value: 'taiwan' },
];

const TeaFormStage1 = (props) => {

	useEffect(()=>{
		props.getAllFromAromaDB()
	}, [])

	const [formValues, setFormValues] = useState(() => {

		const savedValues = localStorage.getItem('teaFormStage1');
		return savedValues ? JSON.parse(savedValues) : {
			teaWeight: 5,
			teaType: null,
			waterBrand: null,
			waterVolume: 100,
			waterTemperature: 95,
			teaWare: null,
			brewingType: null,
			teaCountry: null,
		};
	});

	const { control, handleSubmit, setValue, watch } = useForm({
		defaultValues: formValues,
	});

	const onSubmit = (data) => {
		setFormValues(data); // Save form values
		localStorage.setItem('teaFormStage1', JSON.stringify(data)); // Save to localStorage
	};

	const watchedValues = watch();

	useEffect(() => {
		// Update localStorage whenever form values change
		localStorage.setItem('teaFormStage1', JSON.stringify(watchedValues));
	}, [watchedValues]);

	useEffect(() => {
		Object.keys(formValues).forEach((key) => {
			setValue(key, formValues[key]);
		});
	}, [formValues, setValue]);

	return (
		<>
			<Header navigation={props.navigation} />

			<ThemeProvider theme={theme}>
				<form className="form" onSubmit={handleSubmit(onSubmit)}>

					<Stack direction="column" spacing={2}>
						<Controller
							control={control}
							name="teaName"
							render={({ field }) =>

								<TextField {...field} />

							}
						/>
						<Controller
							control={control}
							name="teaCountry"
							render={({ field }) => (

								<Autocomplete
									{...field}
									options={teaCountryOptions}
									getOptionLabel={(option) => option.label}
									renderInput={(params) =>
										<TextField {...params} label="Tea Country" />
									}
									onChange={(_, data) => field.onChange(data)}
									PopperComponent={StyledPopper}
								/>

							)}
						/>
						<Controller
							control={control}
							name="teaWeight"
							render={({ field }) =>
								<SliderBox
									sliderName='Вес чая при заваривании'
									maxValue={50}
									// defaultValue={5}
									units='г'
									marks={SLIDER_WEIGHT_DATA}
									boxId='teaWeight'
									setValue={setValue}
									{...field}
								/>
							}
						/>
						<Controller
							control={control}
							name="teaType"
							render={({ field }) => (
								<Autocomplete
									{...field}
									options={teaTypeOptions}
									getOptionLabel={(option) => option.label}
									renderInput={(params) => <TextField {...params} label="Tea Type" />}
									onChange={(_, data) => field.onChange(data)}
									PopperComponent={StyledPopper}
								/>
							)}
						/>
						<Controller
							control={control}
							name="waterBrand"
							render={({ field }) => (
								<Autocomplete
									{...field}
									options={waterBrandOptions}
									getOptionLabel={(option) => option.label}
									renderInput={(params) => <TextField {...params} label="Water Brand" />}
									onChange={(_, data) => field.onChange(data)}
									PopperComponent={StyledPopper}
								/>
							)}
						/>
						<Controller
							control={control}
							name="waterVolume"
							render={({ field }) =>
								<SliderBox
									sliderName='Объем воды'
									maxValue={1000}
									// defaultValue={5}
									units='мл'
									marks={SLIDER_WATER_DATA}
									boxId='waterVolume'
									setValue={setValue}
									{...field}
								/>
							}
						/>
						<Controller
							control={control}
							name="waterTemperature"
							render={({ field }) =>
								<SliderBox
									sliderName='Температура воды'
									maxValue={100}
									// defaultValue={5}
									units='°C'
									marks={SLIDER_TEMPERATURE_DATA}
									boxId='waterTemperature'
									setValue={setValue}
									{...field}
								/>
							}
						/>
						<Controller
							control={control}
							name="brewingType"
							render={({ field }) => (
								<Autocomplete
									{...field}
									options={brewingTypeOptions}
									getOptionLabel={(option) => option.label}
									renderInput={(params) => <TextField {...params} label="Brewing Type" />}
									onChange={(_, data) => field.onChange(data)}
									PopperComponent={StyledPopper}
								/>
							)}
						/>
						<Controller
							control={control}
							name="teaWare"
							render={({ field }) => (
								<Autocomplete
									{...field}
									options={teaWareOptions}
									getOptionLabel={(option) => option.label}
									renderInput={(params) => <TextField {...params} label="Tea Ware" />}
									onChange={(_, data) => field.onChange(data)}
									PopperComponent={StyledPopper}
								/>
							)}
						/>

						<Button type="submit" variant="outlined" style={{
						color: '#ffffff',
						borderColor: '#ffffff',
						backgroundColor: 'darkslategray'}}>
							Submit
						</Button>
					</Stack>
				</form>
			</ThemeProvider>

		</>
	);
};

export default TeaFormStage1;