import React, { useState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useMediaQuery, Autocomplete, TextField, Slider, Popper, Button, Stack, autocompleteClasses } from '@mui/material';

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
	{ label: 'Зелёный чай (Lǜ chá)', value: 'green' },
	{ label: 'Белый чай (Bái chá)', value: 'white' },
	{ label: 'Жёлтый чай (Huáng chá)', value: 'yellow' },
	{ label: 'Улун (Wūlóng chá)', value: 'oolong' },
	{ label: 'Красный чай (Hóng chá)', value: 'red' },
	{ label: 'Чёрный чай (Hēi chá)', value: 'black' },
];

const waterBrandOptions = [
	{ label: 'Evian', value: 'evian' },
	{ label: 'Сестрица', value: 'suster' },
	{ label: 'Домашняя (из под крана)', value: 'home' },
	{ label: 'Святой Источник', value: 'svyatoi_istochnik' },
	{ label: 'Acqua Panna', value: 'acqua_panna' },
	{ label: 'Baikal430', value: 'baikal430' },
	{ label: 'Шишкин Лес', value: 'shishkin_les' },
	{ label: 'Леденёв', value: 'ledenev' },
	{ label: 'Архыз', value: 'arkhyz' },
	{ label: 'Bonaqua', value: 'bonaqua' },
	{ label: 'Aqua Minerale', value: 'aqua_minerale' },
	{ label: 'Сенежская', value: 'senezhskaya' },
	{ label: 'Fiji Water', value: 'fiji_water' },
	{ label: 'Vittel', value: 'vittel' },
	{ label: 'Voss', value: 'voss' },
	{ label: 'Nestlé Pure Life', value: 'nestle_pure_life' },
	{ label: 'Volvic', value: 'volvic' },
	{ label: 'Sairme', value: 'sairme' },
	{ label: 'Акваника', value: 'aquanika' },
	{ label: 'Волжанка', value: 'volzhanka' },
	{ label: 'Stelmas', value: 'stelmas' },
	{ label: 'Липецкий Бювет', value: 'lipeckiy_byuve' },
	{ label: 'Эдельвейс', value: 'edelweiss' },
	{ label: 'Sulinka', value: 'sulinka' },
	{ label: 'Ессентуки', value: 'essentuki' },
	{ label: 'Новотерская', value: 'novoterskaya' },
	{ label: 'Омская', value: 'omskaya' },
	{ label: 'Рычал-Су', value: 'rychal_su' },
	{ label: 'ФрутоНяня', value: 'fruto_nyanya' },
	{ label: 'Черноголовка', value: 'chernogolovka' },
	{ label: 'Бабушкино лукошко', value: 'babushkino_lukoshko' },
	{ label: 'Donat', value: 'donat' },
	{ label: 'Perrier', value: 'perrier' },
	{ label: 'San Benedetto', value: 'san_benedetto' },
	{ label: 'S.Pellegrino', value: 's_pellegrino' },
	{ label: 'Fiuggi', value: 'fiuggi' },
	{ label: 'Gerolsteiner', value: 'gerolsteiner' },
	{ label: 'Antipodes', value: 'antipodes' },
	{ label: 'Harrogate Spa', value: 'harrogate_spa' },
	{ label: 'Пилигрим', value: 'piligrim' },
];


const teaWareOptions = [
	{ label: 'Чайник', value: 'teapot' },
	{ label: 'Гайвань', value: 'gaiwan' },
	{ label: 'Типот', value: 'teapot_with_button' },
	{ label: 'Чахай (сливник)', value: 'chahai' },
	{ label: 'Пиала', value: 'tea_bowl' },
	{ label: 'Чайник из исинской глины', value: 'yixing_teapot' },
	{ label: 'Стеклянный чайник', value: 'glass_teapot' },
	{ label: 'Чугунный чайник (тэцубин)', value: 'cast_iron_teapot' },
	// { label: 'Чайная доска (чабань)', value: 'tea_tray' },
	{ label: 'Ситечко', value: 'tea_strainer' },
	{ label: 'Термос', value: 'thermos' },
	{ label: 'Самовар', value: 'samovar' },
	{ label: 'Кружка-заварник', value: 'infuser_mug' },
	{ label: 'Колба для заваривания', value: 'tea_flask' },
	{ label: 'Люйчаван', value: 'luichawan' },
];

const brewingTypeOptions = [
	{ label: 'Настаивание (по-европейски)', value: 'steeping' },
	{ label: 'Проливы (по-китайски)', value: 'gongfu_brewing' },
	{ label: 'Заваривание в термосе', value: 'thermos_brewing' },
	{ label: 'Холодное заваривание (Cold Brew)', value: 'cold_brew' },
	{ label: 'Варка чая', value: 'tea_decoction' },
	{ label: 'Заваривание в пуровере', value: 'pourover_brewing' },
	{ label: 'Заваривание в сифоне', value: 'siphon_brewing' },
	{ label: 'Заваривание в аэропрессе', value: 'aeropress_brewing' },
];


const teaCountryOptions = [
	{ label: 'Китай', value: 'china' },
	{ label: 'Индия', value: 'india' },
	{ label: 'Кения', value: 'kenya' },
	{ label: 'Шри-Ланка', value: 'sri_lanka' },
	{ label: 'Вьетнам', value: 'vietnam' },
	{ label: 'Индонезия', value: 'indonesia' },
	{ label: 'Япония', value: 'japan' },
	{ label: 'Турция', value: 'turkey' },
	{ label: 'Иран', value: 'iran' },
	{ label: 'Аргентина', value: 'argentina' },
	{ label: 'Непал', value: 'nepal' },
	{ label: 'Тайвань', value: 'taiwan' },
	{ label: 'Малайзия', value: 'malaysia' },
	{ label: 'Мьянма', value: 'myanmar' },
	{ label: 'Бангладеш', value: 'bangladesh' },
	{ label: 'Уганда', value: 'uganda' },
	{ label: 'Танзания', value: 'tanzania' },
	{ label: 'Малави', value: 'malawi' },
	{ label: 'Руанда', value: 'rwanda' },
	{ label: 'Южная Корея', value: 'south_korea' },
	{ label: 'Грузия', value: 'georgia' },
	{ label: 'Россия', value: 'russia' },
	{ label: 'Бразилия', value: 'brazil' },
	{ label: 'Мозамбик', value: 'mozambique' },
	{ label: 'Камерун', value: 'cameroon' },
	{ label: 'Зимбабве', value: 'zimbabwe' },
	{ label: 'Папуа — Новая Гвинея', value: 'papua_new_guinea' },
	{ label: 'Таиланд', value: 'thailand' },
	{ label: 'Лаос', value: 'laos' },
	{ label: 'Мексика', value: 'mexico' },
	{ label: 'США', value: 'usa' },
	{ label: 'Австралия', value: 'australia' },
];



const TeaFormStage1 = (props) => {

	const matches = useMediaQuery('(min-width:300px)');

	useEffect(() => {
		props.getAllFromAromaDB()
		props.getAllFromTasteDB()
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
		props.nextStage()
	};

	const watchedValues = watch();

	useEffect(() => {
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
				<form className="form" onSubmit={handleSubmit(onSubmit)} style={{ minWidth: matches ? '300px' : 'auto' }}>

					<Stack direction="column" spacing={2}>
						<Controller
							control={control}
							name="teaName"
							rules={{ required: 'Введите название чая' }}
							render={({ field, fieldState: { error } }) =>

								<TextField {...field}
									label="Название чая"
									required
									error={!!error}
									helperText={error ? error.message : ''}
								/>

							}
						/>
						<Controller
							control={control}
							name="teaCountry"
							rules={{ required: 'Введите страну' }}
							render={({ field, fieldState: { error } }) => (

								<Autocomplete
									{...field}
									options={teaCountryOptions}
									getOptionLabel={(option) => option.label}
									renderInput={(params) =>
										<TextField {...params}
											label="Страна"
											required
											error={!!error}
											helperText={error ? error.message : ''}
										/>
									}
									onChange={(_, data) => field.onChange(data)}

									PopperComponent={StyledPopper}
								// onChange={(_, data) => field.onChange(data ? data.value : '')} // Return only the value
								// value={field.value.label}
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
							rules={{ required: 'Введите тип чая' }}
							render={({ field, fieldState: { error } }) => (
								<Autocomplete
									{...field}
									options={teaTypeOptions}
									getOptionLabel={(option) => option.label}
									renderInput={(params) =>
										<TextField {...params}
											label="Тип чая"
											required
											error={!!error}
											helperText={error ? error.message : ''}
										/>}
									onChange={(_, data) => field.onChange(data)}
									PopperComponent={StyledPopper}
								/>
							)}
						/>
						<Controller
							control={control}
							name="waterBrand"
							render={({ field, fieldState: { error } }) => (
								<Autocomplete
									{...field}
									options={waterBrandOptions}
									getOptionLabel={(option) => option.label}
									renderInput={(params) =>
										<TextField {...params}
											label="Марка воды"
											required
											error={!!error}
											helperText={error ? error.message : ''}
										/>}
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
							render={({ field, fieldState: { error } }) => (
								<Autocomplete
									{...field}
									options={brewingTypeOptions}
									getOptionLabel={(option) => option.label}
									renderInput={(params) =>
										<TextField {...params}
											label="Способ заваривания"
											required
											error={!!error}
											helperText={error ? error.message : ''}
										/>}
									onChange={(_, data) => field.onChange(data)}
									PopperComponent={StyledPopper}
								/>
							)}
						/>
						<Controller
							control={control}
							name="teaWare"
							render={({ field, fieldState: { error } }) => (
								<Autocomplete
									{...field}
									options={teaWareOptions}
									getOptionLabel={(option) => option.label}
									renderInput={(params) =>
										<TextField {...params}
											label="Посуда для заваривания"
											required
											error={!!error}
											helperText={error ? error.message : ''}
										/>}
									onChange={(_, data) => field.onChange(data)}
									PopperComponent={StyledPopper}
								/>
							)}
						/>

						<Button type="submit" variant="outlined" style={{
							color: '#ffffff',
							borderColor: '#ffffff',
							backgroundColor: 'darkslategray',
							margin: '20px 0 20px 0'
						}}>
							Далее
						</Button>
					</Stack>
				</form>
			</ThemeProvider>

		</>
	);
};

export default TeaFormStage1;