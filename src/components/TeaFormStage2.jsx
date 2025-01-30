import React, { useState, useEffect, useRef } from 'react';

import Header from './Header.jsx'
import TeaRaiting from './TeaRaiting.jsx';
import TimeBox from './TimeBox.jsx';

import { Controller, useForm, useFieldArray } from 'react-hook-form';
import { Autocomplete, TextField, Popper, Button, Stack, autocompleteClasses } from '@mui/material';

import { styled } from "@mui/material/styles";
import { ThemeProvider, createTheme } from '@mui/material/styles';


import dayjs from 'dayjs';


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

	const optionsAroma = JSON.parse(localStorage.getItem('aromaDB'))
	const aromaCategoryList = optionsAroma.response.map((item) => ({ label: item.category }));

	const optionsTaste = JSON.parse(localStorage.getItem('tasteDB'))
	const tasteCategoryList = optionsTaste.response.map((item) => ({ label: item.category }));

	const [formValues, setFormValues] = useState(() => {
		const savedValues = localStorage.getItem('teaFormStage2');
		return savedValues ? JSON.parse(savedValues, (key, value) => {
			if (key === 'straitTime') {
				return dayjs(value);
			}
			return value;
		}) : {
			straits: [{
				aromas: [{
					aromaStage1: null,
					aromaStage2: null,
					aromaStage3: null,
				}],
				tastes: [{
					tasteStage1: null,
					tasteStage2: null,
					tasteStage3: null,
				}],
				straitDescription: '',
				straitTime: dayjs().hour(0).minute(0).second(10),
				straitRaiting: 7
			}]
		};
	});

	const { control, handleSubmit, setValue, watch, getFieldState } = useForm({
		defaultValues: formValues
	});

	const { fields: straitsFields, append: straitsAppend, remove: straitsRemove } = useFieldArray({
		name: 'straits',
		control,
	});

	const onSubmit = (data) => {
		localStorage.setItem('teaFormStage2', data);
		setFormValues(data);
		console.log((data))
	};

	const watchedValues = watch();

	useEffect(() => {
		localStorage.setItem('teaFormStage2', JSON.stringify(watchedValues));

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
						{straitsFields.map((straitField, straitIndex) => (
							<Straits
								key={straitField.id}
								control={control}
								straitField={straitField}
								straitIndex={straitIndex}
								straitsRemove={straitsRemove}
								setValue={setValue}
								watch={watch}
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
								straits: [{
									tasteStage1: null,
									tasteStage2: null,
									tasteStage3: null,
								}],
								straitDescription: '',
								straitTime: dayjs().hour(0).minute(0).second(30),
								straitRaiting: 7
							})}
						>
							Добавить пролив
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

function Straits({ control, straitField, straitIndex, straitsRemove, setValue, watch }) {


	const { fields: tastesFields, append: tastesAppend, remove: tastesRemove } = useFieldArray({
		name: `straits[${straitIndex}].tastes`,
		control,
	});
	const { fields: aromasFields, append: aromasAppend, remove: aromasRemove } = useFieldArray({
		name: `straits[${straitIndex}].aromas`,
		control,
	});


	return (

		<section key={straitField.id} className="form_strait-stages">
			<h4 className="form_strait-header">Пролив №{straitIndex + 1}</h4>
			<Stack direction="column" spacing={2}>
				{aromasFields.map((aromaField, aromaIndex) => (

					<Aromas
						straitIndex={straitIndex}
						aromaField={aromaField}
						aromaIndex={aromaIndex}
						aromasRemove={aromasRemove}
						watch={watch}
						control={control}
					/>

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

					<Tastes
						straitIndex={straitIndex}
						tasteField={tasteField}
						tasteIndex={tasteIndex}
						tastesRemove={tastesRemove}
						watch={watch}
						control={control}
					/>

				))}

				<Button type="button" variant="outlined" style={btnStyle}
					onClick={() => {
						tastesAppend({
							tasteStage1: null,
							tasteStage2: null,
							tasteStage3: null,
						})
					}}>
					Добавить оттенок вкуса
				</Button>

				<Controller
					control={control}
					name={`straits[${straitIndex}].straitDescription`}
					render={({ field }) =>

						<TextField {...field} multiline label="Описание пролива" />

					}
				/>
				<Controller
					control={control}
					name={`straits[${straitIndex}].straitTime`}
					render={({ field }) =>
						<TimeBox
							{...field}
							setValue={setValue}
						/>}
				/>
				<Controller
					control={control}
					name={`straits[${straitIndex}].straitRaiting`}
					render={({ field }) =>

						<TeaRaiting {...field}
							label="Оценка пролива"
							setValue={setValue}
						/>

					}
				/>


				<Button type="button" variant="outlined" style={btnStyle}
					onClick={() => straitsRemove(straitIndex)}	>
					Удалить пролив
				</Button>
			</Stack>

		</section>

	)
}


const tasteOptionsHandler = (watch, straitIndex, index) => {
	let stage1Value = watch(`straits[${straitIndex}].tastes[${index}].tasteStage1`) || [];
	let selectedCategory = stage1Value ? optionsTaste.response.find((item) => item.category === stage1Value.label) : [];
	let subcategoryList = selectedCategory ? selectedCategory.subcategories.map((sub) => ({ lable: sub.name })) : [];

	let stage2Value = watch(`straits[${straitIndex}].tastes[${index}].tasteStage2`) || [];
	let selectedSub = stage2Value ? optionsTaste.response
		.find((item) => item.category === stage1Value.label)
		?.subcategories.find((sub) => sub.name === stage2Value.lable) : [];
	let subSubcategoryList = selectedSub ? selectedSub.descriptors.map((item) => ({ label: item })) : [];

	return { subcategoryList, subSubcategoryList }
}

const aromaOptionsHandler = (watch, straitIndex, index) => {
	let stage1Value = watch(`straits[${straitIndex}].aromas[${index}].aromaStage1`) || [];
	let selectedCategory = stage1Value ? optionsAroma.response.find((item) => item.category === stage1Value.label) : [];
	let subcategoryList = selectedCategory ? selectedCategory.subcategories.map((sub) => ({ lable: sub.name })) : [];

	let stage2Value = watch(`straits[${straitIndex}].aromas[${index}].aromaStage2`) || [];
	let selectedSub = stage2Value ? optionsAroma.response
		.find((item) => item.category === stage1Value.label)
		?.subcategories.find((sub) => sub.name === stage2Value.lable) : [];
	let subSubcategoryList = selectedSub ? selectedSub.descriptors.map((item) => ({ label: item })) : [];

	return { subcategoryList, subSubcategoryList }
}



function Aromas({ straitIndex, aromaField, aromaIndex, aromasRemove, watch, control }) {

	let { subcategoryList, subSubcategoryList } = aromaOptionsHandler(watch, straitIndex, aromaIndex)

	return (

		<Stack direction="column" spacing={2} key={aromaField.id} style={{
			border: 'solid 2px #ffffff'
			, borderRadius: ' 6px', padding: '5px', background: '#728A7C'
		}}>
			<h4 className="form_stages-header">Аромат №{aromaIndex + 1}</h4>
			<Controller
				control={control}
				name={`straits[${straitIndex}].aromas[${aromaIndex}].aromaStage1`}
				render={({ field }) => (

					<Autocomplete
						{...field}
						options={aromaCategoryList}
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
						options={subcategoryList}
						getOptionLabel={(option) => option.lable}
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
						options={subSubcategoryList}
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

	)


}

function Tastes({ straitIndex, tasteField, tasteIndex, tastesRemove, watch, control }) {

	let { subcategoryListTaste, subSubcategoryListTaste } = tasteOptionsHandler(watch, straitIndex, tasteIndex)

	return (

		<Stack direction="column" spacing={2} key={tasteField.id} style={{
			border: 'solid 2px #ffffff'
			, borderRadius: ' 6px', padding: '5px', background: '#728A7C'
		}}>
			<h4 className="form_stages-header">Вкус №{tasteIndex + 1}</h4>
			<Controller
				control={control}
				name={`straits[${straitIndex}].tastes[${tasteIndex}].tasteStage1`}
				render={({ field }) => (

					<Autocomplete
						{...field}
						options={tasteCategoryList}
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
						options={subcategoryListTaste}
						getOptionLabel={(option) => option.label}
						renderInput={(params) => <TextField {...params} label="Вкус №2" />}
						onChange={(_, data) => field.onChange(data)}
						PopperComponent={StyledPopper}
						value={field.value || null}
					/>
				)}
			/>

			<Controller
				control={control}
				name={`straits[${straitIndex}].tastes[${tasteIndex}].tasteStage3`}
				render={({ field }) => (
					<Autocomplete
						{...field}
						options={subSubcategoryListTaste}
						getOptionLabel={(option) => option.label}
						renderInput={(params) => <TextField {...params} label="Вкус №3" />}
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
	)

}

export default TeaFormStage2;