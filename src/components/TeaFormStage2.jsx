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
const lastBtnStyle = {
	color: '#ffffff',
	borderColor: '#ffffff',
	backgroundColor: 'darkslategray',
	margin: '20px 0 20px 0'
}

function TeaFormStage2(props) {

	const [optionsAroma, setOptionsAroma] = useState(() => {
		const savedAromaDB = localStorage.getItem('aromaDB');
		return savedAromaDB ? JSON.parse(savedAromaDB) : [];
	});
	const [optionsTaste, setOptionsTate] = useState(() => {
		const savedTasteDB = localStorage.getItem('tasteDB');
		return savedTasteDB ? JSON.parse(savedTasteDB) : [];
	});


	const [formValues, setFormValues] = useState(() => {
		const savedValues = localStorage.getItem('teaFormStage2');
		return savedValues ? JSON.parse(savedValues, (key, value) => {
			if (key === 'straitTime') {
				
				if (value === null) {
					return dayjs().hour(0).minute(0).second(0);
				} else	{
					// console.log((value));
					// console.log(dayjs(value, 'HH:mm:ss'));
					return dayjs(value, 'HH:mm:ss');
				}
			}
			// console.log(value);
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
				straitTime: dayjs().hour(0).minute(0).second(0),
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
		localStorage.setItem('teaFormStage2', JSON.stringify(data));
		setFormValues(data);
		props.nextStage()
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
								optionsTaste={optionsTaste}
								optionsAroma={optionsAroma}

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
								tastes: [{
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


						<Button type="button" variant="outlined" style={btnStyle} onClick={() => { props.prevStage() }} >
							Назад
						</Button>

						<Button type="submit" variant="outlined" style={lastBtnStyle}>
							Далее (проверка формы)
						</Button>


					</Stack>
				</form>
			</ThemeProvider>

		</>
	);

}

function Straits({ control, straitField, straitIndex, straitsRemove, setValue, watch, optionsTaste, optionsAroma }) {


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
						key={aromaField.id}
						optionsAroma={optionsAroma}
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
						key={tasteField.id}
						optionsTaste={optionsTaste}
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


const tasteOptionsHandler = (watch, straitIndex, index, optionsTaste) => {

	const tasteCategoryList = optionsTaste.response.map((item) => ({ label: item.category }));

	let stage1ValueTaste = watch(`straits[${straitIndex}].tastes[${index}].tasteStage1`) || [];
	let selectedCategoryTaste = stage1ValueTaste ? optionsTaste.response.find((item) => item.category === stage1ValueTaste.label) : [];
	let subcategoryListTaste = selectedCategoryTaste ? selectedCategoryTaste.subcategories.map((sub) => ({ label: sub.name })) : [];

	let stage2ValueTaste = watch(`straits[${straitIndex}].tastes[${index}].tasteStage2`) || [];
	let selectedSubCategoryTaste = stage2ValueTaste ? optionsTaste.response
		.find((item) => item.category === stage1ValueTaste.label)
		?.subcategories.find((sub) => sub.name === stage2ValueTaste.label) : [];
	let subSubcategoryListTaste = selectedSubCategoryTaste ? selectedSubCategoryTaste.descriptors.map((item) => ({ label: item })) : [];

	return { tasteCategoryList, subcategoryListTaste, subSubcategoryListTaste }

}

const aromaOptionsHandler = (watch, straitIndex, index, optionsAroma) => {

	const aromaCategoryList = optionsAroma.response.map((item) => ({ label: item.category }));

	let stage1Value = watch(`straits[${straitIndex}].aromas[${index}].aromaStage1`) || [];
	let selectedCategory = stage1Value ? optionsAroma.response.find((item) => item.category === stage1Value.label) : [];
	let subcategoryList = selectedCategory ? selectedCategory.subcategories.map((sub) => ({ label: sub.name })) : [];

	let stage2Value = watch(`straits[${straitIndex}].aromas[${index}].aromaStage2`) || [];
	let selectedSub = stage2Value ? optionsAroma.response
		.find((item) => item.category === stage1Value.label)
		?.subcategories.find((sub) => sub.name === stage2Value.label) : [];
	let subSubcategoryList = selectedSub ? selectedSub.descriptors.map((item) => ({ label: item })) : [];

	return { aromaCategoryList, subcategoryList, subSubcategoryList }

}

function Aromas({ straitIndex, aromaField, aromaIndex, aromasRemove, watch, control, optionsAroma }) {

	let { aromaCategoryList, subcategoryList, subSubcategoryList } = aromaOptionsHandler(watch, straitIndex, aromaIndex, optionsAroma)

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
							<TextField {...params} label="Аромат" />
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
				render={({ field, fieldState: { error } }) => (
					<Autocomplete
						{...field}
						options={subcategoryList}
						getOptionLabel={(option) => option.label}
						renderInput={(params) =>
							<TextField {...params}
								required
								label="Аромат (Оттенок №1)"
								error={!!error}
								helperText={error ? error.message : ''}
							/>}
						onChange={(_, data) => field.onChange(data)}
						PopperComponent={StyledPopper}
						value={field.value || null}
						disabled={subcategoryList.length === 0}
					/>
				)}
			/>
			<Controller
				control={control}
				name={`straits[${straitIndex}].aromas[${aromaIndex}].aromaStage3`}
				render={({ field, fieldState: { error } }) => (
					<Autocomplete
						{...field}
						options={subSubcategoryList}
						getOptionLabel={(option) => option.label}
						renderInput={(params) =>
							<TextField {...params}
								required
								label="Аромат (Оттенок №2)"
								error={!!error}
								helperText={error ? error.message : ''}
							/>}
						onChange={(_, data) => field.onChange(data)}
						PopperComponent={StyledPopper}
						value={field.value || null}
						disabled={subSubcategoryList.length === 0}
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

function Tastes({ straitIndex, tasteField, tasteIndex, tastesRemove, watch, control, optionsTaste }) {

	let { tasteCategoryList, subcategoryListTaste, subSubcategoryListTaste } = tasteOptionsHandler(watch, straitIndex, tasteIndex, optionsTaste)

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
							<TextField {...params} label="Вкус" />
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
				render={({ field, fieldState: { error } }) => (
					<Autocomplete
						{...field}
						options={subcategoryListTaste}
						getOptionLabel={(option) => option.label}
						renderInput={(params) =>
							<TextField {...params}
								required
								label="Вкус (Оттенок вкуса №1)"
								error={!!error}
								helperText={error ? error.message : ''}
							/>}
						onChange={(_, data) => field.onChange(data)}
						PopperComponent={StyledPopper}
						value={field.value || null}
						disabled={subcategoryListTaste.length === 0}
					/>
				)}
			/>

			<Controller
				control={control}
				name={`straits[${straitIndex}].tastes[${tasteIndex}].tasteStage3`}
				render={({ field, fieldState: { error } }) => (
					<Autocomplete
						{...field}
						options={subSubcategoryListTaste}
						getOptionLabel={(option) => option.label}
						renderInput={(params) =>
							<TextField {...params}
								required
								label="Вкус (Оттенок вкуса №2)"
								error={!!error}
								helperText={error ? error.message : ''}
							/>}
						onChange={(_, data) => field.onChange(data)}
						PopperComponent={StyledPopper}
						value={field.value || null}
						disabled={subSubcategoryListTaste.length === 0}
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