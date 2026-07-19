import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';

import Header from './Header.jsx'
import TeaRaiting from './TeaRaiting.jsx';
import TimeBox from './TimeBox.jsx';

import { Controller, useForm, useFieldArray } from 'react-hook-form';
import { TextField, Button, Stack } from '@mui/material';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import DescriptorPicker from './DescriptorPicker.jsx';
import { formApi } from '../utils/FormAPI.jsx';

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

const btnStyle = {
	color: '#ffffff',
	borderColor: 'rgba(255, 255, 255, 0.35)',
	backgroundColor: 'rgba(255, 255, 255, 0.12)',
	backdropFilter: 'blur(8px)',
	WebkitBackdropFilter: 'blur(8px)',
	borderRadius: '10px'
}
const lastBtnStyle = {
	...btnStyle,
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

	// The user's most frequent descriptors — one-tap chips in the pickers.
	const [topDescriptors, setTopDescriptors] = useState({ aromas: [], tastes: [] });

	useEffect(() => {
		formApi.getTopDescriptors()
			.then((res) => setTopDescriptors({ aromas: res.aromas || [], tastes: res.tastes || [] }))
			.catch(() => { /* chips are optional */ });
	}, []);


	const [formValues, setFormValues] = useState(() => {
		const savedValues = localStorage.getItem('teaFormStage2');
		return savedValues ? JSON.parse(savedValues, (key, value) => {
			if (key === 'straitTime') {

				if (value === null) {
					return dayjs().hour(0).minute(0).second(0);
				} else {

					return value;
				}
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
				straitTime: '00:00:00',
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
			<Helmet>
				<title>Страница ввода информации вкуса и аромата чая</title>
				<meta name="description" content="Страница на которой можно ввести информацию 
				о вкусе и аромате чая, засечь время заваривания, оставить отзыв и рейтинг пролива. 
				Можно описывать необходимое количество проливов и добавлять несколько оттенков вкуса или аромата." />
				<meta name="keywords" content="tea, taste, aroma, strait, description, time, raiting, form, multi form" />
				<meta property="og:title" content="Страница на которой можно ввести информацию 
				о вкусе и аромате чая, засечь время заваривания, оставить отзыв и рейтинг пролива. 
				Можно описывать необходимое количество проливов и добавлять несколько оттенков вкуса или аромата." />
				<meta property="og:description" content="Страница на которой можно ввести информацию 
				о вкусе и аромате чая, засечь время заваривания, оставить отзыв и рейтинг пролива. 
				Можно описывать необходимое количество проливов и добавлять несколько оттенков вкуса или аромата." />
				{/* <meta property="og:image" content="https://example.com/image.jpg" /> */}
			</Helmet>
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
								topDescriptors={topDescriptors}
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

								straitTime: '00:00:00',
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

function Straits({ control, straitField, straitIndex, straitsRemove, setValue, watch, optionsTaste, optionsAroma, topDescriptors }) {


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
			<h3 className="form_strait-header">Пролив №{straitIndex + 1}</h3>
			<Stack direction="column" spacing={2}>

				<Controller
					control={control}
					name={`straits[${straitIndex}].straitTime`}
					render={({ field }) =>
						<TimeBox
							{...field}
							setValue={setValue}
						/>}
				/>

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
						setValue={setValue}
						quickPicks={topDescriptors ? topDescriptors.aromas : []}
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
						setValue={setValue}
						quickPicks={topDescriptors ? topDescriptors.tastes : []}
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


function Aromas({ straitIndex, aromaField, aromaIndex, aromasRemove, watch, control, optionsAroma, setValue, quickPicks }) {

	const base = `straits[${straitIndex}].aromas[${aromaIndex}]`;
	const stage1 = watch(`${base}.aromaStage1`);
	const stage2 = watch(`${base}.aromaStage2`);
	const stage3 = watch(`${base}.aromaStage3`);

	return (

		<Stack direction="column" spacing={2} key={aromaField.id} style={{
			border: '1px solid rgba(255, 255, 255, 0.25)',
			borderRadius: '10px', padding: '8px',
			background: 'rgba(255, 255, 255, 0.08)',
			backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
		}}>
			<h4 className="form_stages-header">Аромат №{aromaIndex + 1}</h4>
			<DescriptorPicker
				label="Аромат"
				db={optionsAroma}
				stage1={stage1}
				stage2={stage2}
				stage3={stage3}
				quickPicks={quickPicks}
				onStagesChange={([s1, s2, s3]) => {
					setValue(`${base}.aromaStage1`, s1 ? { label: s1 } : null);
					setValue(`${base}.aromaStage2`, s2 ? { label: s2 } : null);
					setValue(`${base}.aromaStage3`, s3 ? { label: s3 } : null);
				}}
			/>
			<Button type="button" variant="outlined" style={btnStyle}
				onClick={() => aromasRemove(aromaIndex)}	>
				Удалить оттенок аромата
			</Button>

		</Stack>

	)


}

function Tastes({ straitIndex, tasteField, tasteIndex, tastesRemove, watch, control, optionsTaste, setValue, quickPicks }) {

	const base = `straits[${straitIndex}].tastes[${tasteIndex}]`;
	const stage1 = watch(`${base}.tasteStage1`);
	const stage2 = watch(`${base}.tasteStage2`);
	const stage3 = watch(`${base}.tasteStage3`);

	return (

		<Stack direction="column" spacing={2} key={tasteField.id} style={{
			border: '1px solid rgba(255, 255, 255, 0.25)',
			borderRadius: '10px', padding: '8px',
			background: 'rgba(255, 255, 255, 0.08)',
			backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
		}}>
			<h4 className="form_stages-header">Вкус №{tasteIndex + 1}</h4>
			<DescriptorPicker
				label="Вкус"
				db={optionsTaste}
				stage1={stage1}
				stage2={stage2}
				stage3={stage3}
				quickPicks={quickPicks}
				onStagesChange={([s1, s2, s3]) => {
					setValue(`${base}.tasteStage1`, s1 ? { label: s1 } : null);
					setValue(`${base}.tasteStage2`, s2 ? { label: s2 } : null);
					setValue(`${base}.tasteStage3`, s3 ? { label: s3 } : null);
				}}
			/>
			<Button type="button" variant="outlined" style={btnStyle}
				onClick={() => tastesRemove(tasteIndex)}	>
				Удалить оттенок вкуса
			</Button>

		</Stack>
	)

}

export default TeaFormStage2;