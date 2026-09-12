import React, { useState, useEffect } from 'react';
import PageMeta from './PageMeta.jsx';
import { useT } from '../i18n/index.js';

import Header from './Header.jsx'
import TeaRaiting from './TeaRaiting.jsx';
import TimeBox from './TimeBox.jsx';

import { Controller, useForm, useFieldArray } from 'react-hook-form';
import { TextField, Button, Stack } from '@mui/material';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import DescriptorPicker from './DescriptorPicker.jsx';
import VoiceNote from './VoiceNote.jsx';
import { useVoiceDraft } from '../utils/voiceDraft.js';
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
	const { t } = useT();

	const [optionsAroma] = useState(() => {
		const savedAromaDB = localStorage.getItem('aromaDB');
		return savedAromaDB ? JSON.parse(savedAromaDB) : [];
	});
	const [optionsTaste] = useState(() => {
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

	const { control, handleSubmit, setValue, watch } = useForm({
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
			<PageMeta title={t('nav.stage2')} path="/form_2" noIndex
				description={t('wizard.stage2Description')} />
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
							{t('wizard.addSteep')}
						</Button>


						<Button type="button" variant="outlined" style={btnStyle} onClick={() => { props.prevStage() }} >
							{t('wizard.back')}
						</Button>

						<Button type="submit" variant="outlined" style={lastBtnStyle}>
							{t('wizard.nextCheck')}
						</Button>


					</Stack>
				</form>
			</ThemeProvider>

		</>
	);

}

function Straits({ control, straitField, straitIndex, straitsRemove, setValue, watch, optionsTaste, optionsAroma, topDescriptors }) {
	const { t } = useT();


	const { fields: tastesFields, append: tastesAppend, remove: tastesRemove } = useFieldArray({
		name: `straits[${straitIndex}].tastes`,
		control,
	});
	const { fields: aromasFields, append: aromasAppend, remove: aromasRemove } = useFieldArray({
		name: `straits[${straitIndex}].aromas`,
		control,
	});

	// Shared with stage 1 and with every other пролив: one list, one budget.
	const [voiceSegments, setVoiceSegments] = useVoiceDraft();


	return (

		<section key={straitField.id} className="form_strait-stages">
			<h3 className="form_strait-header">{t('wizard.steepHeading', { n: straitIndex + 1 })}</h3>
			<Stack direction="column" spacing={2}>

				{/* Numbered from 1, so the merged track plays the general note
				    recorded on stage 1 (0) first, then the проливы in order. */}
				<VoiceNote
					value={voiceSegments}
					onChange={setVoiceSegments}
					brewingNumber={straitIndex + 1}
					label={t('wizard.steepLabel', { n: straitIndex + 1 })}
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
					{t('wizard.addAroma')}
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
					{t('wizard.addTaste')}
				</Button>

				<Controller
					control={control}
					name={`straits[${straitIndex}].straitDescription`}
					render={({ field }) =>

						<TextField {...field} multiline label={t('wizard.steepDescription')} />

					}
				/>

				<Controller
					control={control}
					name={`straits[${straitIndex}].straitRaiting`}
					render={({ field }) =>

						<TeaRaiting {...field}
							label={t('wizard.steepRating')}
							setValue={setValue}
						/>

					}
				/>


				<Button type="button" variant="outlined" style={btnStyle}
					onClick={() => straitsRemove(straitIndex)}	>
					{t('wizard.deleteSteep')}
				</Button>
			</Stack>


		</section>

	)
}


function Aromas({ straitIndex, aromaField, aromaIndex, aromasRemove, watch, control, optionsAroma, setValue, quickPicks }) {
	const { t } = useT();

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
			<h4 className="form_stages-header">{t('wizard.aromaHeading', { n: aromaIndex + 1 })}</h4>
			<DescriptorPicker
				label={t('tasting.aroma')}
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
				{t('wizard.deleteAroma')}
			</Button>

		</Stack>

	)


}

function Tastes({ straitIndex, tasteField, tasteIndex, tastesRemove, watch, control, optionsTaste, setValue, quickPicks }) {
	const { t } = useT();

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
			<h4 className="form_stages-header">{t('wizard.tasteHeading', { n: tasteIndex + 1 })}</h4>
			<DescriptorPicker
				label={t('tasting.taste')}
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
				{t('wizard.deleteTaste')}
			</Button>

		</Stack>
	)

}

export default TeaFormStage2;