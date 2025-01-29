import React, { useState, useEffect, useRef } from 'react';
import Header from './Header.jsx'

import { Controller, useForm, useFieldArray } from 'react-hook-form';
import { Autocomplete, TextField, Popper, Button, Stack, autocompleteClasses } from '@mui/material';

import { styled } from "@mui/material/styles";
import { ThemeProvider, createTheme } from '@mui/material/styles';


import dayjs from 'dayjs';
import AromaStages from './AromaStages.jsx';

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

const btnStyle = {
	color: '#ffffff',
	borderColor: '#ffffff',
	backgroundColor: 'darkslategray'
}

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

function TeaFormStage2(props) {

	// const [formValues, setFormValues] = useState({});

	const { control, handleSubmit, setValue, watch } = useForm({

		defaultValues: {
			straits: [{
				aromas: [{
					aromaStage1: null,
					aromaStage2: null,
					aromaStage3: null,
				}],
				tastes: [{
					tasteStage1: null,
					tasteStage2: null,
				}],
				straitDescription: null,
				straitTime: null,
				straitRaiting: null
			}]
		}
	});

	const { fields: straitsFields, append: straitsAppend, remove: straitsRemove } = useFieldArray({
		name: 'straits',
		control,
	});

	const onSubmit = (data) => {
		console.log(data)
		// setFormValues(data); // Save form values
		// localStorage.setItem('teaFormValues', JSON.stringify(data)); // Save to localStorage
	};

	// const watchedValues = watch();

	// useEffect(() => {
	// 	// Update localStorage whenever form values change
	// 	localStorage.setItem('teaFormValues', JSON.stringify(watchedValues));
	// }, [watchedValues]);

	// useEffect(() => {
	// 	Object.keys(formValues).forEach((key) => {
	// 		setValue(key, formValues[key]);
	// 	});
	// }, [formValues, setValue]);

	return (
		<>
			<Header navigation={props.navigation} />

			<ThemeProvider theme={theme}>
				<form className="form" onSubmit={handleSubmit(onSubmit)}>
				<Stack direction="column" spacing={2}>
					{straitsFields.map((straitField, straitIndex) => (
						<Straits
							key={straitField.id}
							control={control}
							straitField={straitField}
							straitIndex={straitIndex}
						/>
					))}
					<Button
						type="button"
						variant="outlined"
						style={btnStyle}
						onClick={() => straitsAppend({
							aromas: [{
								aromaStage1: null,
								aromaStage2: null,
								aromaStage3: null,
							}],
							straitDescription: null,
							straitTime: null,
							straitRaiting: null
						})}
					>
						Append Straits
					</Button>
					<Button type="submit" variant="outlined" style={btnStyle}>
						Submit
					</Button>
				</Stack>
				</form>
			</ThemeProvider>

		</>
	);

}

function Straits({ control, straitField, straitIndex }) {

	const { fields: aromasFields, append: aromasAppend, remove: aromasRemove } = useFieldArray({
		name: `straits[${straitIndex}].aromas`,
		control,
	});
	const { fields: tastesFields, append: tastesAppend, remove: tastesRemove } = useFieldArray({
		name: `straits[${straitIndex}].tastes`,
		control,
	});

	return (

		<section key={straitField.id} className="form_strait-stages">
			<Stack direction="column" spacing={2}>
				{aromasFields.map((aromaField, aromaIndex) => (
					<Stack direction="column" spacing={2} key={aromaField.id} style={{border: 'solid 2px #ffffff'
					,borderRadius:' 6px', padding: '5px', background: '#728A7C'}}>
						<Controller
							control={control}
							name={`straits[${straitIndex}].aromas[${aromaIndex}].aromaStage1`}
							render={({ field }) => (

								<Autocomplete
									{...field}
									options={teaCountryOptions}
									getOptionLabel={(option) => option.label}
									renderInput={(params) =>
										<TextField {...params} label="Аромат №1" />
									}
									onChange={(_, data) => field.onChange(data)}
									PopperComponent={StyledPopper}
									value={field.value || null}
								/>

							)}
						/>
						<Controller
							control={control}
							name={`straits[${straitIndex}].aromas[${aromaIndex}].aromaStage2`}
							render={({ field }) => (
								<Autocomplete
									{...field}
									options={teaTypeOptions}
									getOptionLabel={(option) => option.label}
									renderInput={(params) => <TextField {...params} label="Аромат №2" />}
									onChange={(_, data) => field.onChange(data)}
									PopperComponent={StyledPopper}
									value={field.value || null}
								/>
							)}
						/>
						<Controller
							control={control}
							name={`straits[${straitIndex}].aromas[${aromaIndex}].aromaStage3`}
							render={({ field }) => (
								<Autocomplete
									{...field}
									options={waterBrandOptions}
									getOptionLabel={(option) => option.label}
									renderInput={(params) => <TextField {...params} label="Аромат №3" />}
									onChange={(_, data) => field.onChange(data)}
									PopperComponent={StyledPopper}
									value={field.value || null}
								/>
							)}
						/>
						<Button type="button" variant="outlined" style={btnStyle}
							onClick={() => aromasRemove(aromaIndex)}	>
							Удалить оттенок аромата
						</Button>

					</Stack>

				))}

				<Button type="button" variant="outlined" style={btnStyle}
					onClick={() => {
						aromasAppend({
							aromaStage1: null,
							aromaStage2: null,
							aromaStage3: null
						})
					}}>
					Добавить оттенок аромата
				</Button>



				{tastesFields.map((tasteField, tasteIndex) => (
					<Stack direction="column" spacing={2} key={tasteField.id} style={{border: 'solid 2px #ffffff'
					,borderRadius:' 6px', padding: '5px', background: '#728A7C'}}>
						<Controller
							control={control}
							name={`straits[${straitIndex}].tastes[${tasteIndex}].tasteStage1`}
							render={({ field }) => (

								<Autocomplete
									{...field}
									options={teaCountryOptions}
									getOptionLabel={(option) => option.label}
									renderInput={(params) =>
										<TextField {...params} label="Вкус №1" />
									}
									onChange={(_, data) => field.onChange(data)}
									PopperComponent={StyledPopper}
									value={field.value || null}
								/>

							)}
						/>
						<Controller
							control={control}
							name={`straits[${straitIndex}].tastes[${tasteIndex}].tasteStage2`}
							render={({ field }) => (
								<Autocomplete
									{...field}
									options={teaTypeOptions}
									getOptionLabel={(option) => option.label}
									renderInput={(params) => <TextField {...params} label="Вкус №2" />}
									onChange={(_, data) => field.onChange(data)}
									PopperComponent={StyledPopper}
									value={field.value || null}
								/>
							)}
						/>

						<Button type="button" variant="outlined" style={btnStyle}
							onClick={() => tastesRemove(tasteIndex)}	>
							Удалить оттенок вкуса
						</Button>

					</Stack>

				))}

				<Button type="button" variant="outlined" style={btnStyle}
					onClick={() => {
						tastesAppend({
							tasteStage1: null,
							tasteStage2: null,
						})
					}}>
					Добавить оттенок вкуса
				</Button>




				<Controller
					control={control}
					name={`straits[${straitIndex}].straitDescription`} //{`aromaStages[${index}].aromaStage1`}
					render={({ straitField }) =>

						<TextField {...straitField} />

					}
				/>
				<Controller
					control={control}
					name={`straits[${straitIndex}].straitTime`}
					render={({ straitField }) =>

						<TextField {...straitField} />

					}
				/>
				<Controller
					control={control}
					name={`straits[${straitIndex}].straitRaiting`}
					render={({ straitField }) =>

						<TextField {...straitField} />

					}
				/>

			</Stack>

		</section>

	)
}

export default TeaFormStage2;