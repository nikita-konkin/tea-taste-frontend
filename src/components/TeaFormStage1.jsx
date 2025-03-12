import React, { useState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useMediaQuery, Autocomplete, TextField, Switch, Popper, Button, Stack, autocompleteClasses, FormControlLabel } from '@mui/material';
import { Helmet } from 'react-helmet';

import Header from './Header.jsx'
import SliderBox from './SliderBox.jsx';
import AutocompleteBox from './AutocompleteBox.jsx';

import { styled } from "@mui/material/styles";
import { ThemeProvider, createTheme } from '@mui/material/styles';

import {
	SLIDER_WEIGHT_DATA,
	SLIDER_WATER_DATA,
	SLIDER_TEMPERATURE_DATA,
	SLIDER_PRICE_DATA
} from '../utils/utils.js'

const theme = createTheme({
	typography: {
		fontFamily: 'jura',
		fontSize: 16,
		color: 'white',
	},
	breakpoints: {
		values: {
			xs: 265,
			sm: 600,
			md: 900,
			lg: 1200,
			xl: 1536,
		},
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
		MuiStack: {
			styleOverrides: {
				root: {
					'&.MuiStack-root': {
						color: '#ffffff',
						// margin: '0 0 16px 0',
						// padding: '0',
						// '&:first-child': {
						//     marginTop: 0,
						// },
						// '&:last-child': {
						//     marginBottom: 0,
						// },
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

const StyledSwitch = styled(Switch)({
	'& .MuiSwitch-switchBase': {
		color: '#928e8e',
	},
	'& .MuiSwitch-switchBase.Mui-checked': {
		color: '#d8fcd2',
	},
	'& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
		backgroundColor: '#d8fcd2',
	},
	'& .MuiSwitch-track': {
		backgroundColor: '#e4e4e4',
	},
});

const teaTypeOptions = [
	{ label: 'Зелёный чай (绿茶 - Lǜ chá)', value: 'green' },
	{ label: 'Белый чай (白茶 - Bái chá)', value: 'white' },
	{ label: 'Жёлтый чай (黄茶 - Huáng chá)', value: 'yellow' },
	{ label: 'Улун (乌龙茶 - Wūlóng chá)', value: 'oolong' },
	{ label: 'Красный чай (红茶 - Hóng chá)', value: 'red' },
	{ label: 'Чёрный чай (黑茶 - Hēi chá)', value: 'black' },
	{ label: 'Пуэр (普洱茶 - Pǔěr chá)', value: 'puerh' },
	{ label: 'Травяной чай (草药茶 - Cǎoyào chá)', value: 'herbal' },
	{ label: 'Фруктовый чай (水果茶 - Shuǐguǒ chá)', value: 'fruit' },
	{ label: 'Мате (马黛茶 - Mǎdài chá)', value: 'mate' },
	{ label: 'Ройбуш (路易波士茶 - Lùyì bōshì chá)', value: 'rooibos' },
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

const teaShopOptions = [
	{ label: 'Чайный квадрат (Йошкар-Ола)', value: 'tea_square_yosh' },
	{ label: 'Мойчай.ру', value: 'moychay' },
	{ label: 'OZON', value: 'ozon' },
	{ label: 'Чай.ру', value: 'chai_ru' },
	{ label: 'Русская Чайная Компания', value: 'russian_tea_company' },
	{ label: 'Tealyra', value: 'tealyra' },
	{ label: 'Чайная Карта', value: 'tea_terra' },
	{ label: 'Чайная Лавка/Дом (Чайхана)', value: 'chai_lavka' },
	{ label: 'Art of Tea. Искусство Чая.', value: 'art_of_tea' },
	// { label: 'Greenfield (популярные коллекции)', value: 'greenfield' }, 
	// { label: 'Алтайский чай (травы и иван-чай)', value: 'altai_tea' },  
	// { label: 'Байкальский Чай (прибайкальские сборы)', value: 'baikal_tea' },  
	{ label: 'Tea Mail', value: 'teamail' },
	{ label: 'Wildberries', value: 'wildberries' },
	{ label: 'СберМегаМаркет', value: 'sber' },
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

const teaNamesChina = [

	{ label: 'Лунцзин (Колодец Дракона)', value: 'longjing' },
	{ label: 'Билочунь (Изумрудные Спирали Весны)', value: 'bilochun' },
	{ label: 'Те Гуаньинь (Железная Богиня Милосердия)', value: 'tieguanyin' },
	{ label: 'Да Хун Пао (Большой Красный Халат)', value: 'dahongpao' },
	{ label: 'Бай Хао Инь Чжэнь (Серебряные Иглы с Белым Ворсом)', value: 'baihao_yinzhen' },
	{ label: 'Хуаншань Маофэн (Ворсистые Пики Желтой Горы)', value: 'huangshan_maofeng' },
	{ label: 'Цзюньшань Иньчжэнь (Серебряные Иглы с Горы Цзюньшань)', value: 'junshan_yinzhen' },
	{ label: 'Ци Мэнь Хун Ча (Красный Чай из Цимэнь)', value: 'qimen_hongcha' },
	{ label: 'Лю Ань Гуа Пянь (Тыквенные Семечки из Лю Ань)', value: 'liu_an_guapian' },
	{ label: 'Тай Пин Хоу Куй (Главарь Обезьян из Тайпин)', value: 'taiping_houkui' },
	{ label: 'Синьян Мао Цзянь (Ворсистые Острия из Синьяна)', value: 'xinyang_maojian' },
	{ label: 'Дянь Хун (Красный Чай из Юньнани)', value: 'dian_hong' },
	{ label: 'Лю Бао Ча (Чай из Шести Холмов)', value: 'liu_bao_cha' },
	{ label: 'Фэн Хуан Дань Цун (Одинокие Кусты с Горы Феникса)', value: 'feng_huang_dan_cong' },
	{ label: 'Шу Пуэр (Созревший Пуэр)', value: 'shu_puer' },
	{ label: 'Шэн Пуэр (Сырой Пуэр)', value: 'sheng_puer' },
	{ label: 'Цзинь Цзюнь Мэй (Золотые Брови)', value: 'jin_jun_mei' },
	{ label: 'Бай Му Дань (Белый Пион)', value: 'bai_mu_dan' },
	{ label: 'Шоу Мэй (Брови Долголетия)', value: 'shou_mei' },
	{ label: 'Гу Хуа Ча (Османтусовый Чай)', value: 'gu_hua_cha' },
	{ label: 'Моли Хуа Ча (Жасминовый Чай)', value: 'moli_hua_cha' },
	{ label: 'Люань Гуапянь (Тыквенные Семечки из Люаня)', value: 'luan_guapian' },
	{ label: 'Мао Се (Ворсистый Краб)', value: 'mao_xie' },
	{ label: 'Бай Линь Гунфу (Белый Лесной Гунфу)', value: 'bai_lin_gongfu' },
	{ label: 'Чжэн Шань Сяо Чжун (Лапсанг Сушонг)', value: 'zheng_shan_xiao_zhong' },
	{ label: 'Си Ху Лун Цзин (Колодец Дракона с озера Си Ху)', value: 'xi_hu_long_jing' },
	{ label: 'Дунтин Би Ло Чунь (Изумрудные Спирали Весны с Дунтина)', value: 'dongting_bi_luo_chun' },
	{ label: 'Уи Янь Ча (Скальный Чай из Уи)', value: 'wuyi_yan_cha' },
	{ label: 'Дуюнь Мао Цзянь (Ворсистые Острия из Дуюнь)', value: 'duyun_maojian' },
	{ label: 'Цзинь Я Дянь Хун (Золотые Почки Юньнаньского Красного Чая)', value: 'jin_ya_dian_hong' },
	{ label: 'Е Шен Люй Ча (Дикий Зелёный Чай)', value: 'ye_sheng_lv_cha' },
	{ label: 'Фэн Янь (Глаз Феникса)', value: 'feng_yan' },
	{ label: 'Хуа Лун Чжу (Жасминовая Жемчужина Дракона)', value: 'hua_long_zhu' },
	{ label: 'Моли Хоу Ван (Жасминовый Повелитель Обезьян)', value: 'moli_hou_wang' },
	{ label: 'Моли Хэй Цзинь (Жасминовое Чёрное Золото)', value: 'moli_hei_jin' },
	{ label: 'Моли Цзинь Лун Фэн Янь (Жасминовый Золотой Дракон и Глаз Феникса)', value: 'moli_jin_long_feng_yan' },
	{ label: 'Моли Цзинь Сы Инь Гоу (Жасминовые Золотые Нити и Серебряные Крючки)', value: 'moli_jin_si_yin_gou' },
	{ label: 'Моли Цзинь Ло (Жасминовые Золотые Спирали)', value: 'moli_jin_luo' },
	{ label: 'Моли Цзинь Чжэнь (Жасминовые Золотые Иглы)', value: 'moli_jin_zhen' },
];

const teaNamesRetail = [
	{ label: 'Ahmad Tea English Breakfast', value: 'ahmad_tea_english_breakfast' },
	{ label: 'Ahmad Tea Earl Grey', value: 'ahmad_tea_earl_grey' },
	{ label: 'Ahmad Tea Green Tea', value: 'ahmad_tea_green_tea' },
	{ label: 'Ahmad Tea Ceylon Tea', value: 'ahmad_tea_ceylon_tea' },
	{ label: 'Greenfield Golden Ceylon', value: 'greenfield_golden_ceylon' },
	{ label: 'Greenfield Earl Grey Fantasy', value: 'greenfield_earl_grey_fantasy' },
	{ label: 'Greenfield Flying Dragon', value: 'greenfield_flying_dragon' },
	{ label: 'Greenfield Summer Bouquet', value: 'greenfield_summer_bouquet' },
	{ label: 'Dilmah Ceylon Supreme', value: 'dilmah_ceylon_supreme' },
	{ label: 'Dilmah Earl Grey', value: 'dilmah_earl_grey' },
	{ label: 'Dilmah English Breakfast', value: 'dilmah_english_breakfast' },
	{ label: 'Dilmah Green Tea', value: 'dilmah_green_tea' },
	{ label: 'Riston English Elite', value: 'riston_english_elite' },
	{ label: 'Riston Earl Grey', value: 'riston_earl_grey' },
	{ label: 'Riston Golden Ceylon', value: 'riston_golden_ceylon' },
	{ label: 'Riston Green Tea', value: 'riston_green_tea' },
	{ label: 'Tess Pleasure', value: 'tess_pleasure' },
	{ label: 'Tess Sunrise', value: 'tess_sunrise' },
	{ label: 'Tess Earl Grey', value: 'tess_earl_grey' },
	{ label: 'Tess Green Tea', value: 'tess_green_tea' },
	{ label: 'Lipton Yellow Label', value: 'lipton_yellow_label' },
	{ label: 'Lipton Earl Grey', value: 'lipton_earl_grey' },
	{ label: 'Lipton Green Tea', value: 'lipton_green_tea' },
	{ label: 'Lipton Forest Fruit', value: 'lipton_forest_fruit' },
	{ label: 'Майский чай Высокогорный', value: 'mayskiy_chay_vysokogorny' },
	{ label: 'Майский чай Классический', value: 'mayskiy_chay_klassicheskiy' },
	{ label: 'Майский чай Ассам', value: 'mayskiy_chay_assam' },
	{ label: 'Майский чай Зеленый', value: 'mayskiy_chay_zelenyy' },
	{ label: 'Curtis Original Ceylon', value: 'curtis_original_ceylon' },
	{ label: 'Curtis Earl Grey', value: 'curtis_earl_grey' },
	{ label: 'Curtis Green Tea', value: 'curtis_green_tea' },
	{ label: 'Curtis Mango Green', value: 'curtis_mango_green' },
	{ label: 'Akbar Gold', value: 'akbar_gold' },
	{ label: 'Akbar Earl Grey', value: 'akbar_earl_grey' },
	{ label: 'Akbar Green Tea', value: 'akbar_green_tea' },
	{ label: 'Akbar Pure Ceylon', value: 'akbar_pure_ceylon' },
	{ label: 'Азерчай Букет', value: 'azerchay_buket' },
	{ label: 'Азерчай с бергамотом', value: 'azerchay_s_bergamotom' },
	{ label: 'Азерчай с чабрецом', value: 'azerchay_s_chabrecom' },
	{ label: 'Азерчай Зеленый', value: 'azerchay_zelenyy' },
	{ label: 'ISLA Английский Завтрак', value: 'isla_english_breakfast' },
	{ label: 'ISLA Ганпаудер', value: 'isla_ganpauder' },
	{ label: 'ISLA Жасмин', value: 'isla_jasmin' },
	{ label: 'ISLA Молочный Улун', value: 'isla_molokhniy_ulun' },
	{ label: 'Newby English Breakfast', value: 'newby_english_breakfast' },
	{ label: 'Newby Earl Grey', value: 'newby_earl_grey' },
	{ label: 'Newby Green Tea', value: 'newby_green_tea' },
	{ label: 'Newby Darjeeling', value: 'newby_darjeeling' },
	{ label: 'Pickwick English Breakfast', value: 'pickwick_english_breakfast' },
	{ label: 'Pickwick Earl Grey', value: 'pickwick_earl_grey' },
	{ label: 'Pickwick Green Tea', value: 'pickwick_green_tea' },
	{ label: 'Pickwick Rooibos', value: 'pickwick_rooibos' },
	{ label: 'Basilur Ceylon', value: 'basilur_ceylon' },
	{ label: 'Basilur Earl Grey', value: 'basilur_earl_grey' },
	{ label: 'Basilur Green Tea', value: 'basilur_green_tea' },
	{ label: 'Basilur White Tea', value: 'basilur_white_tea' },
	{ label: 'Althaus English Breakfast', value: 'althaus_english_breakfast' },
	{ label: 'Althaus Earl Grey', value: 'althaus_earl_grey' },
	{ label: 'Althaus Green Tea', value: 'althaus_green_tea' },
	{ label: 'Althaus Darjeeling', value: 'althaus_darjeeling' },
	{ label: 'Lovare English Breakfast', value: 'lovare_english_breakfast' },
	{ label: 'Lovare Earl Grey', value: 'lovare_earl_grey' },
	{ label: 'Lovare Green Tea', value: 'lovare_green_tea' },
	{ label: 'Lovare Rooibos', value: 'lovare_rooibos' },
	{ label: 'Westminster Ostfriesische', value: 'westminster_ostfriesische' },
	{ label: 'Westminster Earl Grey', value: 'westminster_earl_grey' },
];

const teaNamesOptions = teaNamesChina.concat(teaNamesRetail);


const TeaFormStage1 = (props) => {

	const matches = useMediaQuery('(min-width:300px)');
	const isSmallScreen = useMediaQuery(theme.breakpoints.down('xs'));
	// const filter = createFilterOptions();

	useEffect(() => {
		props.getAllFromAromaDB()
		props.getAllFromTasteDB()
	}, [])

	const [formValues, setFormValues] = useState(() => {

		const savedValues = localStorage.getItem('teaFormStage1');
		return savedValues ? JSON.parse(savedValues) : {
			teaName: null,
			teaCountry: null,
			teaShop: null,
			teaWeight: 5,
			teaType: null,
			waterBrand: null,
			waterVolume: 100,
			waterTemperature: 95,
			teaPrice: 5,
			brewingType: null,
			teaWare: null,
			publicAccess: true,
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
			<Helmet>
				<title>Главная страница</title>
				<meta name="description" content="Страница вводна основной (первичной) информации о чае" />
				<meta name="keywords" content="tea, tea name, tea type, tea weight, tea price, info, start" />
				<meta property="og:title" content="Страница вводна основной (первичной) информации о чае" />
				<meta property="og:description" content="Страница вводна основной (первичной) информации о чае" />
				{/* <meta property="og:image" content="https://example.com/image.jpg" /> */}
			</Helmet>

			<Header navigation={props.navigation} />

			<ThemeProvider theme={theme}>
				<form className="form" onSubmit={handleSubmit(onSubmit)} style={{ minWidth: matches ? '300px' : 'auto' }}>

					<Stack direction="column" spacing={2}>
						<Controller
							control={control}
							name="teaName"
							rules={{ required: 'Введите название чая' }}
							render={({ field, fieldState: { error } }) =>
								<AutocompleteBox
									optionsObj={teaNamesOptions}
									name='teaName'
									label='Название чая'
									setValue={setValue}
									value={field.value}
									StyledPopper={StyledPopper}
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
								/>

							)}
						/>
						<Controller
							control={control}
							name="teaShop"
							rules={{ required: 'Введите магазина' }}
							render={({ field, fieldState: { error } }) =>
								<AutocompleteBox
									optionsObj={teaShopOptions}
									name='teaShop'
									label='Название магазина'
									value={field.value}
									setValue={setValue}
									StyledPopper={StyledPopper}
								/>
							}
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

								<AutocompleteBox
									optionsObj={waterBrandOptions}
									name='waterBrand'
									label='Бренд воды'
									value={field.value}
									setValue={setValue}
									StyledPopper={StyledPopper}
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
									step={5}
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
									step={1}
									{...field}
								/>
							}
						/>
						<Controller
							control={control}
							name="teaPrice"
							render={({ field }) =>
								<SliderBox
									sliderName='Цена за  грамм чая'
									maxValue={150}
									// defaultValue={5}
									units='₽'
									marks={SLIDER_PRICE_DATA}
									boxId='teaPrice'
									setValue={setValue}
									step={0.1}
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
						<Stack direction={isSmallScreen ? "column" : "row"} spacing={2} useFlexGap sx={{ width: '100%' }}>
							<Controller
								control={control}
								name='publicAccess'
								render={
									({ field }) => (
										<FormControlLabel
											control={<StyledSwitch
												{...field}
												checked={field.value}
												onChange={field.onChange}
											/>}
											label="Опубликовать в блог"
											labelPlacement="start"
											sx={{
												width: '100%',
												padding: '0px',
												margin: '0px',
											}}
										/>
									)}
							/>

							<Button type="submit" variant="outlined" style={{
								color: '#ffffff',
								borderColor: '#ffffff',
								backgroundColor: 'darkslategray',
								margin: '20px 0 20px 0',
								width: '100%'
							}}>
								Далее
							</Button>
						</Stack>

					</Stack>
				</form>
			</ThemeProvider>

		</>
	);
};

export default TeaFormStage1;