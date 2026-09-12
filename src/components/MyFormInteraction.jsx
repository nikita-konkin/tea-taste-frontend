import {
	useState,
	useEffect,
	useRef,
} from 'react'
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import FormButton from './FormButton.jsx';
import Header from './Header.jsx'
import PageMeta from './PageMeta.jsx';
import TeaPhotoGallery from './TeaPhotoGallery.jsx';
import { mainApi } from '../utils/MainAPI.jsx';
import { formApi } from '../utils/FormAPI.jsx';
import { clearVoiceDraft, readVoiceDraft } from '../utils/voiceDraft.js';
import { formatDateTime } from '../utils/utils.js';
import { usePopup } from './PopupContext.jsx';
import { useT } from '../i18n/index.js';
import { optionLabel } from '../i18n/options.js';

// import { useTeaFormContext } from './TeaFormContext.jsx';
// import { use } from 'react';



function MyFormInteraction(props) {

	const { openPopup } = usePopup();
	const { t, locale } = useT();

	// Ordered the way the server will merge them: the general note (0) first,
	// then the проливы, so what you hear here is what the track will be.
	const voiceDraft = [...readVoiceDraft()]
		.sort((a, b) => (a.brewingNumber || 0) - (b.brewingNumber || 0));
	const voiceTotal = voiceDraft.reduce((sum, s) => sum + (Number(s.duration) || 0), 0);
	const mmss = (seconds) => {
		const whole = Math.max(0, Math.round(seconds));
		return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
	};

	const stage1Data = JSON.parse(localStorage.getItem('teaFormStage1')) != null ? JSON.parse(localStorage.getItem('teaFormStage1')) : [];
	const stage2Data = JSON.parse(localStorage.getItem('teaFormStage2')) != null ? JSON.parse(localStorage.getItem('teaFormStage2')) : [];

	const [formId] = useState(uuidv4());

	// Same " → " path the пролив descriptors are shown as, so the dry leaf reads
	// the way the rest of the review does. Untouched pickers drop out.
	const dryAromaRows = (stage1Data.dryAromas || [])
		.map((row) => [row.aromaStage1, row.aromaStage2, row.aromaStage3]
			.map((s) => (s && s.label) || '')
			.filter(Boolean)
			.join(' → '))
		.filter(Boolean);

	// console.log(stage1Data)
	// console.log(stage2Data)

	const [straits, setStraits] = useState([])
	const [avrRaiting, setAvrReiting] = useState(0)
	const [raitingsArrState, setRaitingsArrState] = useState([])

	const raitingsArr = []

	const aromasRender = useRef({})
	const tastesRender = useRef({})

	let stages = []

	const history = useNavigate();

	// Same formatter the saved card uses, so the preview matches what the
	// tasting will look like in /my_forms rather than the browser's default.
	const currentTimestamp = formatDateTime(new Date())

	const averageRating = (arr) => {

		const sum = arr.reduce((acc, value) => acc + value, 0);
		const average = arr.length ? sum / arr.length : 0;
		return average.toFixed(1);
	}

	useEffect(() => {

		setAvrReiting(averageRating(raitingsArrState))
		// console.log(avrRaiting)

	}, [raitingsArrState])

	useEffect(() => {
		if (stage2Data.straits) {
			addStraitStage(stage2Data.straits.length)
			setStraits(stages)
		}
	// Mount only: seeds the review screen from the saved draft.
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])


	const addStraitStage = (maxLastStageNumber) => {
		for (let i = 0; i < maxLastStageNumber; i++) {
			stages.push(renderStraitStage(i))
			raitingsArr.push(stage2Data.straits[i].straitRaiting)
		}
		setRaitingsArrState(raitingsArr)

	}

	const renderAromasAndTastes = (data, straitNum, aromas = false, tastes = false) => {
		let arr = []
		if (aromas) { arr = data.straits[straitNum].aromas }
		if (tastes) { arr = data.straits[straitNum].tastes }
		const tempArr = [];
		for (let index = 0; index < arr.length; index++) {

			const dataObj = arr[index]
			for (const [key, value] of Object.entries(dataObj)) {
				const data = value != null ? value.label : ''
				tempArr.push(
					<li className="myforminteraction__row" key={key}><bdi>{`${straitNum + 1}.${key.split('').slice(-1)})`}</bdi>{data}</li>
				)
			}
		}
		if (aromas) { aromasRender.current = tempArr }
		if (tastes) { tastesRender.current = tempArr }

	};


	const renderStraitStage = (straitNum) => {

		renderAromasAndTastes(stage2Data, straitNum, true, false)
		renderAromasAndTastes(stage2Data, straitNum, false, true)
		// console.log(dayjs(stage2Data.straits[straitNum].straitTime).format('HH:mm:ss'))
		return (
			<section className="myforminteraction__section" key={straitNum}>
				<ul className="myform__list">
					<li className="myforminteraction__row"><bdi>{t('tasting.steep', { n: straitNum + 1 })}</bdi></li>
					<li className="myforminteraction__row"><bdi><br /></bdi></li>
					<li className="myforminteraction__row"><bdi>{t('tasting.aroma')}: </bdi></li>
					{aromasRender.current}
					<li className="myforminteraction__row"><bdi><br /></bdi></li>
					<li className="myforminteraction__row"><bdi>{t('tasting.taste')}: </bdi></li>
					{tastesRender.current}
					<li className="myforminteraction__row"><bdi><br /></bdi></li>
					<li className="myforminteraction__row"><bdi>{t('review.comment')}:</bdi></li>
					<li className="myforminteraction__row"><bdi>{stage2Data.straits[straitNum].straitDescription}</bdi></li>
					<li className="myforminteraction__row"><bdi>{t('tasting.steepTime')}: </bdi>{stage2Data.straits[straitNum].straitTime}</li>
					<li className="myforminteraction__row"><bdi>{t('wizard.steepRating')}: </bdi>{t('tasting.bowls', { n: stage2Data.straits[straitNum].straitRaiting })}</li>
				</ul>
			</section>
		)
	}

	async function postAromaData(formId, publicAccess) {

		for (let straitNum = 0; straitNum < stage2Data.straits.length; straitNum++) {
			for (let aromaNum = 0; aromaNum < stage2Data.straits[straitNum].aromas.length; aromaNum++) {

				const aromaDataObj = stage2Data.straits[straitNum].aromas[aromaNum]
				for (const [key, value] of Object.entries(aromaDataObj)) {
					let aromaStage = Number(key.split('').slice(-1))
					let data = value != null ? value.label : 'none'
					data = data !== '' ? data : 'none'
					if (stage2Data.straits[straitNum].aromas.length > 0) {
						if (aromaStage === 1) {
							// props.postFormStage2Aroma(data, formId, straitNum+1, aromaNum+1)
							try {
								await props.postFormStage2Aroma(data, formId, straitNum + 1, aromaNum + 1, publicAccess);
								// console.log('Aroms data posted successfully:', result);
							} catch (error) {
								console.error('Error submitting form:', error);
							}
						} else {
							try {
								await props.patchFormStage2Aroma(data, formId, straitNum + 1, aromaNum + 1, aromaStage, publicAccess);

							} catch (error) {
								console.error('Error submitting form:', error);
							}
						}
					}
				}
			}
		}

	}

	async function postTasteData(formId, publicAccess) {

		for (let straitNum = 0; straitNum < stage2Data.straits.length; straitNum++) {
			for (let tasteNum = 0; tasteNum < stage2Data.straits[straitNum].tastes.length; tasteNum++) {

				const tasteDataObj = stage2Data.straits[straitNum].tastes[tasteNum]
				for (const [key, value] of Object.entries(tasteDataObj)) {
					let tasteStage = Number(key.split('').slice(-1))
					let data = value != null ? value.label : 'none'
					data = data !== '' ? data : 'none'
					if (stage2Data.straits[straitNum].tastes.length > 0) {
						if (tasteStage === 1) {
							try {
								await props.postFormStage2Taste(data, formId, straitNum + 1, tasteNum + 1, publicAccess);
								// console.log('Taste data posted successfully:', result);
							} catch (error) {
								console.error('Error submitting form:', error);
							}
						} else {
							try {
								await props.patchFormStage2Taste(data, formId, straitNum + 1, tasteNum + 1, tasteStage, publicAccess);
								// console.log('Taste data posted successfully:', result);
							} catch (error) {
								console.error('Error submitting form:', error);
							}

						}
					}
				}
			}
		}

	}

	// The dry leaf, stored as aromas on пролив 0 — a number no brewing has, so
	// nothing that walks the проливы picks these up by accident.
	//
	// Called through formApi rather than through a props.* wrapper: those do not
	// return their promise, which is why the пролив descriptors above are posted
	// twice to paper over the race. One call is enough when the await is real.
	async function postDryAromaData(formId, publicAccess) {
		const rows = stage1Data.dryAromas || [];
		let index = 0;

		for (const row of rows) {
			const stage = (value) => (value && value.label ? value.label : 'none');
			// An untouched picker is three nulls. Posting it would store an aroma
			// that says nothing and read back as an empty chip.
			if (stage(row.aromaStage1) === 'none') continue;

			index += 1;
			await formApi.postAromaStages(formId, 0, index, {
				aromaStage1: stage(row.aromaStage1),
				aromaStage2: stage(row.aromaStage2),
				aromaStage3: stage(row.aromaStage3),
			}, publicAccess);
		}
	}

	function postStraitData(formId, publicAccess) {

		for (let straitNum = 0; straitNum < stage2Data.straits.length; straitNum++) {

			const straitData = {
				description: stage2Data.straits[straitNum].straitDescription ? stage2Data.straits[straitNum].straitDescription : 'none',
				brewingTime: stage2Data.straits[straitNum].straitTime,
				brewingRating: stage2Data.straits[straitNum].straitRaiting,
			}
			props.postFormStage2Brew(straitData, formId, straitNum + 1, publicAccess)
			// props.patchFormStage2Brew(straitData, formId, straitNum+1)

		}

	}

	function postTeaInfo(formID) {
		stage1Data.avrRaiting = avrRaiting
		// Returned so the caller can await it and know whether it worked. Without
		// this the submit could not tell success from failure.
		return props.postFormStage1(stage1Data, formID)
	}

	const onSubmit = async (e) => {
		e.preventDefault()

		// The only gate left. Either the tasting has a name, or it has a recording
		// the name can be lifted from later — everything else the extraction or a
		// later edit can fill in. Blocking on twelve typed fields is what made the
		// voice notes unusable in the first place.
		const rawName = stage1Data.teaName;
		const teaName = (typeof rawName === 'string' ? rawName : (rawName && rawName.label) || '').trim();
		const hasRecording = readVoiceDraft().length > 0;

		if (!teaName && !hasRecording) {
			openPopup(
				<div className="myforminteraction__section">
					<h3>{t('review.missingTitle')}</h3>
					<p style={{ margin: '0 0 6px 0' }}>{t('review.missingBody')}</p>
					<p style={{ margin: 0, color: '#d8f5cc' }}>{t('review.missingHint')}</p>
				</div>
			);
			return;
		}

		const publicAccess = stage1Data.publicAccess
		// The tasting itself goes first and is awaited. Brewings and descriptors
		// all reference its sessionId, so creating them against a form that failed
		// to save leaves records nothing can ever clean up — the delete endpoint
		// works from the teaform, which would not exist. That is precisely what
		// happened when an empty Autocomplete threw inside this handler.
		try {
			await postTeaInfo(formId)
		} catch (error) {
			console.log(error)
			openPopup(
				<div className="myforminteraction__section">
					<h3>{t('review.saveFailedTitle')}</h3>
					<p style={{ margin: '0 0 8px 0' }}>{error.message || t('review.tryAgain')}</p>
					<p style={{ margin: 0, color: '#d8f5cc' }}>{t('review.saveFailedHint')}</p>
				</div>
			);
			return
		}

		// The rest is additive. A failure here leaves a saved tasting missing some
		// of its проливы, which is recoverable by hand — so it is reported rather
		// than rolled back, instead of being swallowed into console.log.
		const failed = []

		try {
			await postTasteData(formId, publicAccess)
			await postTasteData(formId, publicAccess)
		} catch (error) {
			console.log(error)
			failed.push(t('review.tastes'))
		}

		try {
			await postAromaData(formId, publicAccess)
			await postAromaData(formId, publicAccess)
		} catch (error) {
			console.log(error)
			failed.push(t('review.aromas'))
		}

		try {
			await postStraitData(formId, publicAccess)
		} catch (error) {
			console.log(error)
			failed.push(t('review.steeps'))
		}

		try {
			await postDryAromaData(formId, publicAccess)
		} catch (error) {
			console.log(error)
			failed.push(t('tasting.dryAroma'))
		}

		localStorage.removeItem('teaFormStage1');
		localStorage.removeItem('teaFormStage2');
		// The voice draft is its own key, so clearing the two form drafts left the
		// recordings behind and they reappeared in the next tasting.
		clearVoiceDraft();

		openPopup(
			<div className="myforminteraction__section">
				<h3>{t('review.savedTitle')}</h3>
				{failed.length > 0 && (
					<p style={{ margin: '0 0 8px 0', color: '#ffb4b4' }}>
						{t('review.savedPartly', { what: failed.join(', ') })}
					</p>
				)}
				<p style={{ margin: '0 0 8px 0' }}>{t('review.savedWhere')}</p>
				{hasRecording && (
					<p style={{ margin: '0 0 8px 0', color: '#d8f5cc' }}>{t('review.savedVoice')}</p>
				)}
				<p style={{ margin: 0, color: '#d8f5cc' }}>{t('review.savedPrivacy')}</p>
			</div>
		);

		props.navigateAfterSubmit()
	}

	return (
		<>
			<PageMeta title={t('page.formSubmit')} path="/form_submit" noIndex />
			<Header navigation={props.navigation} />
			<div className="myforminteraction">

				<section className="myforminteraction__section">
					<TeaPhotoGallery photos={stage1Data.teaPhotos} />

					{voiceDraft.length > 0 && (
						<div className="myforminteraction__section">
							<h3>{t('nav.voiceNotes')}</h3>
							<p className="voicenote__budget" style={{ margin: '0 0 10px 0' }}>
								{t('review.voiceBudget', { n: voiceDraft.length, total: mmss(voiceTotal) })}
							</p>
							<ul className="voicenote__list">
								{voiceDraft.map((segment) => (
									<li className="voicenote__item" key={segment.url}>
										<span className="voicenote__length" style={{ flex: '0 0 110px' }}>
											{segment.brewingNumber
												? t('tasting.steep', { n: segment.brewingNumber })
												: t('wizard.aboutTea')}
										</span>
										<audio className="voicenote__player" src={segment.url} controls preload="none" />
										<span className="voicenote__length">{mmss(segment.duration)}</span>
									</li>
								))}
							</ul>
						</div>
					)}
					<ul className="myforminteraction__list">
						{/* The stored values are Russian by design, so the value
						    side goes through optionLabel just as the wizard's own
						    dropdowns do. The tea name is the user's own words and
						    is never touched. */}
						<li className="myforminteraction__row"><bdi>{t('card.name')}: </bdi>{stage1Data.teaName != null ? stage1Data.teaName.label : ''}</li>
						<li className="myforminteraction__row"><bdi>{t('card.teaType')}: </bdi>{optionLabel(stage1Data.teaType, locale)}</li>
						<li className="myforminteraction__row"><bdi>{t('tasting.shop')}: </bdi>{stage1Data.teaShop != null ? stage1Data.teaShop.label : ''}</li>
						<li className="myforminteraction__row"><bdi>{t('tasting.weight')}: </bdi>{stage1Data.teaWeight} {t('unit.gram')}</li>
						<li className="myforminteraction__row"><bdi>{t('tasting.water')}: </bdi>{stage1Data.waterBrand != null ? stage1Data.waterBrand.label : ''}</li>
						<li className="myforminteraction__row"><bdi>{t('tasting.volume')}: </bdi>{stage1Data.waterVolume} {t('unit.ml')}</li>
						<li className="myforminteraction__row"><bdi>{t('tasting.temperature')}: </bdi>{stage1Data.waterTemperature} oC</li>
						<li className="myforminteraction__row"><bdi>{t('tasting.price')}: </bdi>{stage1Data.teaPrice} ₽</li>
						<li className="myforminteraction__row"><bdi>{t('tasting.teaware')}: </bdi>{optionLabel(stage1Data.teaWare, locale)}</li>
						<li className="myforminteraction__row"><bdi>{t('tasting.brewingMethod')}: </bdi>{optionLabel(stage1Data.brewingType, locale)}</li>
						<li className="myforminteraction__row"><bdi>{t('card.published')}: </bdi>{currentTimestamp}</li>
						<li className="myforminteraction__row"><bdi>{t('review.finalRating')}: </bdi>{t('tasting.bowls', { n: avrRaiting })}</li>
						<li className="myforminteraction__row"><bdi>{t('wizard.publish')}: </bdi>{stage1Data.publicAccess ? t('review.yes') : t('review.no')}</li>
					</ul>
					{dryAromaRows.length > 0 && (
						<ul className="myforminteraction__list">
							<li className="myforminteraction__row"><bdi>{t('tasting.dryAroma')}: </bdi></li>
							{dryAromaRows.map((path, index) => (
								<li className="myforminteraction__row" key={path}><bdi>{index + 1})</bdi> {path}</li>
							))}
						</ul>
					)}
					{stage1Data.dryAromaDescription && (
						<ul className="myforminteraction__list">
							<li className="myforminteraction__row"><bdi>{t('tasting.dryAromaNotes')}:</bdi></li>
							<li className="myforminteraction__row"><bdi>{stage1Data.dryAromaDescription}</bdi></li>
						</ul>
					)}
					{stage1Data.teaDescription && (
						<ul className="myforminteraction__list">
							<li className="myforminteraction__row"><bdi>{t('tasting.generalDescription')}:</bdi></li>
							<li className="myforminteraction__row"><bdi>{stage1Data.teaDescription}</bdi></li>
						</ul>
					)}
				</section>

				{straits}

				<div className="myforminteraction__buttons">
					<FormButton
						buttonName={t('review.discard')}
						width={'100%'}
						margin={'0px'}
						onClick={() => {
							// Photos were uploaded when picked, so discarding the
							// draft has to take their files with it.
							(stage1Data.teaPhotos || []).forEach((p) => mainApi.deleteTeaPhoto(p.url));
							// Same for the voice notes: uploaded on stop, so an
							// abandoned draft would leave them on disk forever.
							readVoiceDraft().forEach((s) => mainApi.deleteVoice(s.url));
							localStorage.removeItem('teaFormStage1');
							localStorage.removeItem('teaFormStage2');
							clearVoiceDraft();
							props.navigateAfterSubmit()
						}}
					/>
					<FormButton
						buttonName={t('wizard.back')}
						width={'100%'}
						margin={'0px'}
						onClick={() => { history(-1) }}
					/>

					<FormButton
						buttonName={t('review.submit')}
						width={'100%'}
						margin={'0px'}
						onClick={onSubmit}
					/>
				</div>

			</div>
		</>
	)
}

export default MyFormInteraction;