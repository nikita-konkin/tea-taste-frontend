import React, { useState, useEffect } from 'react';
import FormButton from './FormButton.jsx';
import { usePopup } from './PopupContext.jsx';
import { formApi } from '../utils/FormAPI.jsx';
import { mainApi } from '../utils/MainAPI.jsx';
import TeaPhotos from './TeaPhotos.jsx';
import VoiceExtract from './VoiceExtract.jsx';
import { TextField, Stack, Autocomplete } from '@mui/material';
// Shared with the wizard so the two screens cannot drift apart. They belong in
// utils/ eventually — exported from the stage-1 component for now to avoid
// retyping forty water brands by hand.
import {
    teaTypeOptions,
    teaCountryOptions,
    teaShopOptions,
    waterBrandOptions,
    teaWareOptions,
    brewingTypeOptions,
} from './TeaFormStage1.jsx';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Same outlined-field look as TeaFormStage1/2: white label, white text,
// white outline on the dark glass surface.
const theme = createTheme({
    typography: {
        fontFamily: 'jura',
        fontSize: 16,
    },
    components: {
        MuiTextField: {
            styleOverrides: {
                root: {
                    width: '100%',
                    '& label, & label.Mui-focused': {
                        color: '#ffffff',
                    },
                    '& .MuiInputBase-root': {
                        color: '#ffffff',
                    },
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.6)',
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

const brewBlockStyle = {
    border: '1px solid rgba(255, 255, 255, 0.25)',
    background: 'rgba(255, 255, 255, 0.06)',
    borderRadius: '10px',
    padding: '12px',
    margin: '10px 0',
};

// Edit dialog for a saved tea form (opened from "Изменить" in /my_forms).
// Top part edits the Stage-1 tea data (the backend PATCH requires the
// complete field set, so every field is shown prefilled and sent on save).
// The "Проливы" section below edits Stage-2 data: each brewing's
// description/time/rating and its aroma/taste descriptors, saved per brewing.
// Speech and typed text disagree about punctuation constantly: «из-под крана»
// against «из под крана», «ё» against «е». Matching on letters and digits alone
// keeps the suggestions reachable from whatever the transcript produced.
const normalizeForMatch = (text) => String(text || '')
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^a-zа-я0-9]+/gi, '');

function FormEdit({ formData, patchFormById }) {
    const { closePopup } = usePopup();

    const [values, setValues] = useState({
        nameRU: formData.nameRU || '',
        type: formData.type || '',
        country: formData.country || '',
        shop: formData.shop || '',
        weight: formData.weight ?? '',
        water: formData.water || '',
        volume: formData.volume ?? '',
        temperature: formData.temperature ?? '',
        price: formData.price ?? '',
        teaware: formData.teaware || '',
        brewingtype: formData.brewingtype || '',
        averageRating: formData.averageRating ?? 1,
        // Mapped rather than passed through: anything beyond {url, kind} would
        // be rejected by the API when sent back on save.
        photos: (formData.photos || []).map(({ url, kind }) => ({ url, kind })),
        publicAccess: Boolean(formData.publicAccess),
        voicePublic: Boolean(formData.voice && formData.voice.public),
    });
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    // Photos dropped in this dialog are still live on the stored form, so the
    // files are only deleted once the save has actually gone through.
    const [removedUrls, setRemovedUrls] = useState([]);

    // Stage-2 data, editable copies keyed for controlled inputs.
    const [brewings, setBrewings] = useState(null); // null = loading, [] = none
    const [voiceSuggestions, setVoiceSuggestions] = useState(null);
    const [appliedBrews, setAppliedBrews] = useState({});
    const [aromas, setAromas] = useState([]);
    const [tastes, setTastes] = useState([]);
    const [brewStatus, setBrewStatus] = useState({}); // brewingCount -> 'saving' | 'saved' | error text

    useEffect(() => {
        Promise.all([
            formApi.getAllMyBrewingsById(formData.sessionId),
            formApi.getAllMyAromasById(formData.sessionId),
            formApi.getAllMyTastesById(formData.sessionId),
        ])
            .then(([b, a, t]) => {
                setBrewings((b.data || []).map((x) => ({ ...x })));
                setAromas((a.data || []).map((x) => ({ ...x })));
                setTastes((t.data || []).map((x) => ({ ...x })));
            })
            .catch(() => setBrewings([]));
    }, [formData.sessionId]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setValues((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);
        setSaved(false);

        const body = {
            nameRU: values.nameRU,
            type: values.type,
            country: values.country,
            shop: values.shop,
            weight: Number(values.weight),
            water: values.water,
            volume: Number(values.volume),
            temperature: Number(values.temperature),
            price: Number(values.price),
            teaware: values.teaware,
            brewingtype: values.brewingtype,
            averageRating: Number(values.averageRating),
            photos: values.photos,
            publicAccess: values.publicAccess,
            // Only the flag: segments and transcript are not ours to resend, and
            // the API ignores them from a client anyway.
            ...(formData.voice ? { voice: { public: values.voicePublic } } : {}),
        };

        patchFormById(formData.sessionId, body)
            // Проливы are saved by the same button. They used to need a separate
            // "Сохранить пролив" per block, so edits made here were silently lost
            // by anyone who assumed the main button saved the whole dialog.
            // Sequenced after the tasting, and only over проливы that exist.
            .then(() => Promise.all((brewings || []).map((brew) => saveBrewing(brew))))
            .then((results) => {
                const failed = results.filter((r) => r && !r.ok).map((r) => r.bc);
                if (failed.length) {
                    setError(`Дегустация сохранена, но проливы №${failed.join(', №')} — нет.`);
                    return;
                }
                setSaved(true);
                removedUrls.forEach((url) => mainApi.deleteTeaPhoto(url));
                setRemovedUrls([]);
            })
            .catch((err) => {
                setError(err.message || 'Не удалось сохранить изменения.');
            })
            .finally(() => setSaving(false));
    };

    const changeBrewing = (brewingCount, field, value) => {
        setBrewings((prev) =>
            prev.map((b) => (b.brewingCount === brewingCount ? { ...b, [field]: value } : b))
        );
    };

    // The schema returns seconds; this section stores H:MM:SS.
    const asBrewingTime = (seconds) => {
        const whole = Math.max(0, Math.round(Number(seconds) || 0));
        const mm = String(Math.floor((whole % 3600) / 60)).padStart(2, '0');
        const ss = String(whole % 60).padStart(2, '0');
        return `${Math.floor(whole / 3600)}:${mm}:${ss}`;
    };

    // Applies one пролив's suggestion into that пролив's own fields. Only the
    // three the section actually owns: an aroma or taste would need a new
    // descriptor row, and those are created server-side with their own ids.
    const applyBrewingSuggestion = (bc, suggestion) => {
        if (suggestion.description) changeBrewing(bc, 'description', suggestion.description);
        if (suggestion.time) changeBrewing(bc, 'brewingTime', asBrewingTime(suggestion.time));
        if (suggestion.rating !== undefined && suggestion.rating !== null) {
            changeBrewing(bc, 'brewingRating', suggestion.rating);
        }
        setAppliedBrews((prev) => ({ ...prev, [bc]: true }));
        createDescriptors(bc, suggestion);
    };

    // A descriptor is three columns server-side, not a path string, and each row
    // is addressed by its own index within the brewing. So each extracted path is
    // split, given the next free index, and posted — then everything is refetched
    // so the new rows arrive with the _id the pickers and the save path need.
    const createDescriptors = (bc, suggestion) => {
        const sessionId = formData.sessionId;
        const isPublic = Boolean(values.publicAccess);

        const plan = (paths, rows, countField, stagePrefix) => {
            const used = rows.filter((row) => row.brewingCount === bc);
            let next = used.reduce((max, row) => Math.max(max, Number(row[countField]) || 0), 0);
            return (paths || []).map((path) => {
                const levels = String(path).split('→').map((part) => part.trim());
                next += 1;
                return {
                    index: next,
                    stages: {
                        [`${stagePrefix}1`]: levels[0] || '',
                        [`${stagePrefix}2`]: levels[1] || '',
                        [`${stagePrefix}3`]: levels[2] || '',
                    },
                };
            });
        };

        const jobs = [
            ...plan(suggestion.aromas, aromas, 'aromaCount', 'aromaStage')
                .map((job) => formApi.postAromaStages(sessionId, bc, job.index, job.stages, isPublic)),
            ...plan(suggestion.tastes, tastes, 'tasteCount', 'tasteStage')
                .map((job) => formApi.postTasteStages(sessionId, bc, job.index, job.stages, isPublic)),
        ];
        if (!jobs.length) return;

        setBrewStatus((prev) => ({ ...prev, [bc]: 'saving' }));
        Promise.all(jobs)
            .then(() => Promise.all([
                formApi.getAllMyAromasById(sessionId),
                formApi.getAllMyTastesById(sessionId),
            ]))
            .then(([a, t]) => {
                // Refetched rather than assumed: an index collision makes the POST
                // a silent no-op, so the only proof is what comes back.
                setAromas((a.data || []).map((x) => ({ ...x })));
                setTastes((t.data || []).map((x) => ({ ...x })));
                setBrewStatus((prev) => ({ ...prev, [bc]: undefined }));
            })
            .catch(() => setBrewStatus((prev) => ({
                ...prev,
                [bc]: 'Не удалось добавить дескрипторы из записи.',
            })));
    };

    const changeStage = (setter, id, field, value) => {
        setter((prev) => prev.map((r) => (r._id === id ? { ...r, [field]: value } : r)));
    };

    const deleteBrewing = (bc) => {
        setBrewStatus((prev) => ({ ...prev, [bc]: 'saving' }));
        formApi.delBrewSelective(formData.sessionId, bc)
            .then(() => {
                setBrewings((prev) => prev.filter((b) => b.brewingCount !== bc));
                setAromas((prev) => prev.filter((a) => a.brewingCount !== bc));
                setTastes((prev) => prev.filter((t) => t.brewingCount !== bc));
            })
            .catch((err) =>
                setBrewStatus((prev) => ({ ...prev, [bc]: err.message || 'Ошибка удаления.' }))
            );
    };

    const addBrewing = () => {
        const next = brewings.reduce((m, b) => Math.max(m, b.brewingCount), 0) + 1;
        formApi.postFormStage2Brew(
            { description: 'Новый пролив', brewingRating: 7, brewingTime: '0:00:10' },
            formData.sessionId, next, values.publicAccess
        )
            .then(() => formApi.getAllMyBrewingsById(formData.sessionId))
            .then((b) => setBrewings((b.data || []).map((x) => ({ ...x }))))
            .catch((err) => setError(err.message || 'Не удалось добавить пролив.'));
    };

    const saveBrewing = (brew) => {
        const bc = brew.brewingCount;
        setBrewStatus((prev) => ({ ...prev, [bc]: 'saving' }));

        // A cleared field is '' — Number('') is 0, which passes validation and
        // silently stores a rating nobody chose. A missing one is NaN, which
        // becomes null in JSON and 400s the whole пролив with no clue which field
        // did it. Omitting the key instead leaves the stored value untouched.
        const rating = Number(brew.brewingRating);
        const brewBody = {
            description: brew.description,
            brewingTime: brew.brewingTime,
        };
        if (String(brew.brewingRating ?? '').trim() !== '' && Number.isFinite(rating)) {
            brewBody.brewingRating = rating;
        }

        const patches = [
            formApi.patchFormStage2Brew(
                brewBody,
                formData.sessionId, bc, brew.publicAccess
            ),
            ...aromas
                .filter((a) => a.brewingCount === bc)
                .map((a) => formApi.patchAromaStages(formData.sessionId, bc, a.aromaCount, a)),
            ...tastes
                .filter((t) => t.brewingCount === bc)
                .map((t) => formApi.patchTasteStages(formData.sessionId, bc, t.tasteCount, t)),
        ];

        // Returned so the main "Сохранить форму" can await every пролив. Resolves
        // either way — one failed пролив should not abort the others — and reports
        // itself through brewStatus, so the caller only needs to know which failed.
        return Promise.all(patches)
            .then(() => {
                setBrewStatus((prev) => ({ ...prev, [bc]: 'saved' }));
                return { bc, ok: true };
            })
            .catch((err) => {
                setBrewStatus((prev) => ({ ...prev, [bc]: err.message || 'Ошибка сохранения.' }));
                return { bc, ok: false };
            });
    };

    const textField = (label, name, minLength = 2, maxLength = 60) => (
        <TextField
            label={label}
            name={name}
            value={values[name]}
            onChange={handleChange}
            required
            size="small"
            inputProps={{ minLength, maxLength }}
        />
    );

    // Same option lists as the wizard, but this dialog stores plain strings while
    // stage 1 stores {label, value} objects — so the options are flattened to
    // labels here rather than the shape being changed on either side.
    //
    // freeSolo on purpose: these are suggestions, not a closed set. A tea from a
    // shop that is not in the list, or water nobody has added yet, still has to be
    // typeable — and the extraction fills these fields with whatever the
    // transcript said, which will often not match a list entry exactly.
    const suggestField = (label, name, options) => (
        <Autocomplete
            freeSolo
            openOnFocus
            // The extracted value is selected on focus, so typing replaces it
            // outright instead of appending to it.
            selectOnFocus
            options={options.map((option) => option.label)}
            filterOptions={(list, state) => {
                const query = normalizeForMatch(state.inputValue);
                if (!query) return list;
                const hits = list.filter((option) => normalizeForMatch(option).includes(query));
                // Nothing matched — show the whole list rather than an empty menu.
                // This is precisely the case that matters: the field holds text the
                // transcript produced («из-под крана», «кружка», «настаивание»),
                // which rarely matches a label exactly, and it is the moment the
                // user most wants to pick a real one.
                return hits.length ? hits : list;
            }}
            value={values[name] || ''}
            onChange={(event, next) => setValues((prev) => ({ ...prev, [name]: next || '' }))}
            onInputChange={(event, next, reason) => {
                if (reason === 'input') setValues((prev) => ({ ...prev, [name]: next }));
            }}
            renderInput={(params) => <TextField {...params} label={label} size="small" />}
        />
    );

    const numberField = (label, name, min, max, step = 1) => (
        <TextField
            label={label}
            name={name}
            type="number"
            value={values[name]}
            onChange={handleChange}
            required
            size="small"
            inputProps={{ min, max, step }}
        />
    );

    const stageInputs = (records, setter, prefix, label) =>
        records.map((rec) => {
            const count = rec[`${prefix.replace('Stage', '')}Count`];
            return (
                <Stack direction="column" spacing={1.5} key={rec._id} style={{ margin: '10px 0 0 0' }}>
                    <span style={{ color: '#d8f5cc', fontWeight: 600 }}>{label} №{count}</span>
                    {[1, 2, 3].map((n) => (
                        <TextField key={n}
                            label={`Стадия ${n}`}
                            size="small"
                            inputProps={{ maxLength: 30, 'aria-label': `${label} ${count} — стадия ${n}` }}
                            value={rec[`${prefix}${n}`] || ''}
                            onChange={(e) => changeStage(setter, rec._id, `${prefix}${n}`, e.target.value)} />
                    ))}
                </Stack>
            );
        });

    // Shown inside the пролив it belongs to, so the user sees the suggestion
    // next to the fields it would change rather than in a list somewhere above.
    const brewSuggestion = (bc) => {
        const found = ((voiceSuggestions || {}).brewings || [])
            .find((brewing) => Number(brewing.number) === Number(bc));
        if (!found) return null;

        const notes = [
            (found.aromas || []).length ? `Аромат: ${found.aromas.join('; ')}` : '',
            (found.tastes || []).length ? `Вкус: ${found.tastes.join('; ')}` : '',
        ].filter(Boolean);

        return (
            <div className="voiceextract" style={{ margin: '0 0 12px 0' }}>
                <div className="voiceextract__head">
                    <span className="voiceextract__title">Из записи</span>
                    <button type="button" className="voiceextract__apply"
                        onClick={() => applyBrewingSuggestion(bc, found)}
                        disabled={Boolean(appliedBrews[bc])}>
                        {appliedBrews[bc] ? '✓' : 'Применить'}
                    </button>
                </div>
                {found.description && <span className="voiceextract__value">{found.description}</span>}
                {found.time !== undefined && found.time !== null && (
                    <span className="voiceextract__tags">Время: {asBrewingTime(found.time)}</span>
                )}
                {notes.map((note) => (
                    <span className="voiceextract__tags" key={note}>{note}</span>
                ))}
            </div>
        );
    };

    // Проливы the recording mentions that this tasting does not have. Listed
    // rather than dropped: the wizard may have created fewer brewings than were
    // actually poured, and silently losing пролив №7 would be worse than saying so.
    const unmatchedBrewings = () => {
        if (!voiceSuggestions || brewings === null) return null;
        const have = new Set(brewings.map((brew) => Number(brew.brewingCount)));
        const extra = (voiceSuggestions.brewings || []).filter((b) => !have.has(Number(b.number)));
        if (!extra.length) return null;

        return (
            <div className="voiceextract">
                <span className="voiceextract__title">
                    В записи есть проливы, которых нет в форме: №{extra.map((b) => b.number).join(', №')}
                </span>
                {extra.map((brewing) => (
                    <span className="voiceextract__brewing" key={brewing.number}>
                        <b>№{brewing.number}</b> {brewing.description || ''}
                    </span>
                ))}
            </div>
        );
    };

    const brewingsSection = () => {
        if (brewings === null) {
            return <p className="myforminteraction__row">Загружаем проливы...</p>;
        }
        if (brewings.length === 0) {
            return <p className="myforminteraction__row">У этой формы пока нет проливов.</p>;
        }
        return brewings.map((brew) => {
            const bc = brew.brewingCount;
            const status = brewStatus[bc];
            return (
                <div key={bc} style={brewBlockStyle} data-testid={`brew-edit-${bc}`}>
                    <p style={{ color: '#d8f5cc', fontWeight: 600, margin: '0 0 12px 0' }}>Пролив №{bc}</p>
                    {brewSuggestion(bc)}
                    <Stack direction="column" spacing={1.5}>
                        <TextField
                            label="Время заваривания (Ч:ММ:СС)"
                            size="small"
                            placeholder="0:00:15"
                            value={brew.brewingTime || ''}
                            inputProps={{ pattern: '^(2[0-3]|[01]?[0-9]):([0-5]?[0-9]):([0-5]?[0-9])$' }}
                            onChange={(e) => changeBrewing(bc, 'brewingTime', e.target.value)} />
                        <TextField
                            label="Рейтинг пролива"
                            type="number"
                            size="small"
                            inputProps={{ min: 0, max: 10, step: 1 }}
                            value={brew.brewingRating ?? ''}
                            onChange={(e) => changeBrewing(bc, 'brewingRating', e.target.value)} />
                        <TextField
                            label="Описание"
                            multiline
                            minRows={3}
                            value={brew.description || ''}
                            inputProps={{ minLength: 2, maxLength: 2000 }}
                            onChange={(e) => changeBrewing(bc, 'description', e.target.value)} />
                    </Stack>
                    {stageInputs(aromas.filter((a) => a.brewingCount === bc), setAromas, 'aromaStage', 'Аромат')}
                    {stageInputs(tastes.filter((t) => t.brewingCount === bc), setTastes, 'tasteStage', 'Вкус')}
                    {status && status !== 'saving' && status !== 'saved' && (
                        <p style={{ color: '#ffb4a8', margin: '8px 0 0 0' }}>{status}</p>
                    )}
                    <div style={{ display: 'flex', gap: '2%' }}>
                        <FormButton
                            buttonName={status === 'saving' ? 'Сохраняем...' : status === 'saved' ? 'Сохранено ✓' : 'Сохранить пролив'}
                            width={'66%'} margin={'12px 0 0 0'}
                            onClick={(e) => { e.preventDefault(); saveBrewing(brew); }}
                        />
                        <FormButton
                            buttonName={'Удалить'}
                            width={'32%'} margin={'12px 0 0 0'}
                            onClick={(e) => { e.preventDefault(); deleteBrewing(bc); }}
                        />
                    </div>
                </div>
            );
        });
    };

    return (
        <ThemeProvider theme={theme}>
            <section className="myforminteraction__section">
                <form onSubmit={handleSubmit} data-testid="form-edit">
                    <h3 style={{ margin: '0 0 14px 0' }}>Редактирование формы</h3>
                    <Stack direction="column" spacing={1.5}>
                        {textField('Название', 'nameRU')}
                        {suggestField('Тип чая', 'type', teaTypeOptions)}
                        {suggestField('Страна', 'country', teaCountryOptions)}
                        {suggestField('Магазин', 'shop', teaShopOptions)}
                        {numberField('Вес, г', 'weight', 1, 10000)}
                        {suggestField('Вода', 'water', waterBrandOptions)}
                        {numberField('Объем воды, мл', 'volume', 1, 10000)}
                        {numberField('Температура воды, °C', 'temperature', 1, 100)}
                        {numberField('Цена за грамм, ₽', 'price', 0, 100000, 0.0001)}
                        {suggestField('Посуда', 'teaware', teaWareOptions)}
                        {suggestField('Метод заваривания', 'brewingtype', brewingTypeOptions)}
                        {numberField('Итоговый рейтинг (1–10)', 'averageRating', 1, 10, 0.01)}
                        {formData.voice && formData.voice.transcript && (
                            <VoiceExtract
                                sessionId={formData.sessionId}
                                values={values}
                                onApply={(key, value) => setValues((prev) => ({ ...prev, [key]: value }))}
                                onSuggestions={setVoiceSuggestions}
                            />
                        )}
                        <TeaPhotos
                            value={values.photos}
                            onChange={(photos) => setValues((prev) => ({ ...prev, photos }))}
                            onRemovedUrl={(url) => setRemovedUrls((prev) => [...prev, url])}
                        />
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <bdi>Публикация в блоге: </bdi>
                            <input type="checkbox" name="publicAccess"
                                checked={values.publicAccess} onChange={handleChange} />
                        </label>
                        {formData.voice && (formData.voice.track || {}).url && (
                            // Separate from the checkbox above on purpose: publishing
                            // the tasting text is not the same decision as publishing
                            // the audio, which caught whatever else was in the room.
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <bdi>Публиковать аудиозапись и расшифровку: </bdi>
                                <input type="checkbox" name="voicePublic"
                                    checked={values.voicePublic} onChange={handleChange} />
                            </label>
                        )}
                    </Stack>
                    {error && <p style={{ color: '#ffb4a8' }}>{error}</p>}
                    <FormButton type="submit"
                        buttonName={saving ? 'Сохраняем...' : saved ? 'Сохранено ✓' : 'Сохранить форму'}
                        width={'100%'} />
                </form>

                <h3 style={{ margin: '18px 0 8px 0' }}>Проливы</h3>
                {brewingsSection()}
                {unmatchedBrewings()}
                {brewings !== null && (
                    <FormButton buttonName={'Добавить пролив'} width={'100%'} margin={'4px 0 0 0'}
                        onClick={(e) => { e.preventDefault(); addBrewing(); }} />
                )}

                <FormButton buttonName={'Закрыть'} width={'100%'} margin={'12px 0 0 0'}
                    onClick={(e) => { e.preventDefault(); closePopup(); }} />
            </section>
        </ThemeProvider>
    );
}

export default FormEdit;
