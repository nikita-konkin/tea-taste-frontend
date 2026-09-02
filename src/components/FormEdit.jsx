import React, { useState, useEffect } from 'react';
import FormButton from './FormButton.jsx';
import { usePopup } from './PopupContext.jsx';
import { formApi } from '../utils/FormAPI.jsx';
import { mainApi } from '../utils/MainAPI.jsx';
import TeaPhotos from './TeaPhotos.jsx';
import VoiceExtract from './VoiceExtract.jsx';
import { flattenDescriptorDB } from './DescriptorPicker.jsx';
import { useT } from '../i18n/index.js';
import { optionLabel, canonicalOption } from '../i18n/options.js';
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
    const { t, locale } = useT();

    // «пролив №1, пролив №3» / "steep no. 1, steep no. 3" / 第 1 泡, 第 3 泡.
    // Built from the label rather than by gluing «№» onto joined numbers: the
    // numbering sits in a different place in each language, and Chinese puts it
    // inside the word.
    const brewList = (numbers) => numbers
        .map((n) => t('wizard.steepLabel', { n }))
        .join(', ');

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
        description: formData.description || '',
        dryAromaDescription: formData.dryAromaDescription || '',
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
    // The descriptor dictionaries, so the пролив stages can suggest instead of
    // demanding that the vocabulary be typed from memory.
    const [aromaTree, setAromaTree] = useState([]);
    const [tasteTree, setTasteTree] = useState([]);

    useEffect(() => {
        // These endpoints answer with {response: [...]}, not the {data: [...]}
        // every other call in this file uses — which is why DescriptorPicker
        // reads db.response. Reading .data here silently produced an empty
        // dictionary and a suggestion list that never had anything in it.
        const tree = (r) => (r && (r.response || r.data)) || [];
        formApi.getAllFromAromaDB().then((r) => setAromaTree(tree(r))).catch(() => {});
        formApi.getAllFromTasteDB().then((r) => setTasteTree(tree(r))).catch(() => {});
    }, []);

    // Cascades: category -> its subcategories -> that subcategory's descriptors.
    // Falls back to the whole level when the field above holds something the
    // dictionary does not know — which is common, because the extraction writes
    // whatever the transcript said. An unrecognised parent must not leave the
    // next field with an empty list.
    const stageOptions = (prefix, rec, stage) => {
        const tree = prefix.startsWith('aroma') ? aromaTree : tasteTree;
        if (!tree.length) return [];

        if (stage === 1) return tree.map((c) => c.category);

        const category = tree.find((c) => c.category === rec[`${prefix}1`]);
        const subs = category ? category.subcategories || [] : [];

        if (stage === 2) {
            if (subs.length) return subs.map((s) => s.name);
            return tree.flatMap((c) => (c.subcategories || []).map((s) => s.name));
        }

        const pool = subs.length ? subs : tree.flatMap((c) => c.subcategories || []);
        const sub = pool.find((s) => s.name === rec[`${prefix}2`]);
        return sub ? sub.descriptors || [] : [];
    };
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
            description: values.description,
            dryAromaDescription: values.dryAromaDescription,
            photos: values.photos,
            publicAccess: values.publicAccess,
            // Only the flag: segments and transcript are not ours to resend, and
            // the API ignores them from a client anyway.
            ...(formData.voice ? { voice: { public: values.voicePublic } } : {}),
        };

        patchFormById(formData.sessionId, body)
            // The dry leaf hangs off no пролив, so the loop below would never
            // save it. Same button, same save.
            .then(() => saveDryAromas())
            // Проливы are saved by the same button. They used to need a separate
            // "Сохранить пролив" per block, so edits made here were silently lost
            // by anyone who assumed the main button saved the whole dialog.
            // Sequenced after the tasting, and only over проливы that exist.
            .then(() => Promise.all((brewings || []).map((brew) => saveBrewing(brew))))
            .then((results) => {
                const failed = results.filter((r) => r && !r.ok).map((r) => r.bc);
                if (failed.length) {
                    setError(t('edit.brewsFailed', { list: brewList(failed) }));
                    return;
                }
                setSaved(true);
                removedUrls.forEach((url) => mainApi.deleteTeaPhoto(url));
                setRemovedUrls([]);
            })
            .catch((err) => {
                setError(err.message || t('edit.saveFailed'));
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
    const applyBrewingFields = (bc, suggestion) => {
        if (suggestion.description) changeBrewing(bc, 'description', suggestion.description);
        if (suggestion.time) changeBrewing(bc, 'brewingTime', asBrewingTime(suggestion.time));
        if (suggestion.rating !== undefined && suggestion.rating !== null) {
            changeBrewing(bc, 'brewingRating', suggestion.rating);
        }
        setAppliedBrews((prev) => ({ ...prev, [bc]: true }));
    };

    const applyBrewingSuggestion = (bc, suggestion) => {
        applyBrewingFields(bc, suggestion);
        createDescriptors([{ bc, suggestion }]);
    };

    // What «Применить всё» reaches. It used to stop at the tea's own fields,
    // leaving every пролив to its own button further down — so the obvious
    // sequence (заполнить → применить всё → сохранить) saved a form with no
    // пролив notes in it at all.
    //
    // Only проливы that exist: a suggestion numbered higher than any пролив on
    // the form is still listed by unmatchedBrewings() rather than conjuring one.
    const applyAllBrewings = () => {
        const suggested = (voiceSuggestions || {}).brewings || [];
        const have = new Set((brewings || []).map((brew) => Number(brew.brewingCount)));
        const entries = suggested
            .filter((suggestion) => have.has(Number(suggestion.number)))
            .map((suggestion) => ({ bc: Number(suggestion.number), suggestion }));

        entries.forEach(({ bc, suggestion }) => applyBrewingFields(bc, suggestion));
        // One call for all of them: a POST-and-refetch per пролив would race,
        // and the refetch that landed last would drop the rows the others had
        // just created.
        createDescriptors(entries);
    };

    // A descriptor is three columns server-side, not a path string, and each row
    // is addressed by its own index within the brewing. So each extracted path is
    // split, given the next free index, and posted — then everything is refetched
    // so the new rows arrive with the _id the pickers and the save path need.
    // Takes a list rather than a single пролив so that applying everything at
    // once posts the lot and refetches exactly once.
    const createDescriptors = (entries) => {
        const sessionId = formData.sessionId;
        const isPublic = Boolean(values.publicAccess);

        const plan = (paths, rows, countField, stagePrefix, bc) => {
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

        const jobs = entries.flatMap(({ bc, suggestion }) => [
            ...plan(suggestion.aromas, aromas, 'aromaCount', 'aromaStage', bc)
                .map((job) => formApi.postAromaStages(sessionId, bc, job.index, job.stages, isPublic)),
            ...plan(suggestion.tastes, tastes, 'tasteCount', 'tasteStage', bc)
                .map((job) => formApi.postTasteStages(sessionId, bc, job.index, job.stages, isPublic)),
        ]);
        if (!jobs.length) return;

        const touched = entries.map(({ bc }) => bc);
        const mark = (value) => setBrewStatus((prev) => touched.reduce(
            (acc, bc) => ({ ...acc, [bc]: value }), { ...prev },
        ));

        mark('saving');
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
                mark(undefined);
            })
            .catch(() => mark(t('edit.descriptorsFailed')));
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
                setBrewStatus((prev) => ({ ...prev, [bc]: err.message || t('edit.brewDeleteFailed') }))
            );
    };

    const addBrewing = () => {
        const next = brewings.reduce((m, b) => Math.max(m, b.brewingCount), 0) + 1;
        formApi.postFormStage2Brew(
            // Stored, not displayed: from here on it is the user's own text, so
            // it is written in the language they are reading in.
            { description: t('edit.newBrew'), brewingRating: 7, brewingTime: '0:00:10' },
            formData.sessionId, next, values.publicAccess
        )
            .then(() => formApi.getAllMyBrewingsById(formData.sessionId))
            .then((b) => setBrewings((b.data || []).map((x) => ({ ...x }))))
            .catch((err) => setError(err.message || t('edit.addBrewFailed')));
    };

    // Aromas of the dry leaf: ordinary Aroma documents on пролив 0, a number no
    // Brewing has. Everything that walks the проливы therefore skips them, and
    // they need their own add and save here.
    const dryAromas = () => aromas.filter((a) => Number(a.brewingCount) === 0);

    const addDryAroma = () => {
        const next = dryAromas()
            .reduce((max, a) => Math.max(max, Number(a.aromaCount) || 0), 0) + 1;
        formApi.postAromaStages(formData.sessionId, 0, next, {
            // A real category from the dictionary rather than invented filler:
            // the row has to hold something the picker can read back, and the
            // user replaces it with the actual descriptor in the next tap.
            aromaStage1: 'Другое', aromaStage2: '', aromaStage3: '',
        }, values.publicAccess)
            .then(() => formApi.getAllMyAromasById(formData.sessionId))
            .then((a) => setAromas((a.data || []).map((x) => ({ ...x }))))
            .catch((err) => setError(err.message || t('edit.descriptorsFailed')));
    };

    const saveDryAromas = () => Promise.all(dryAromas().map((a) => formApi.patchAromaStages(
        formData.sessionId, 0, a.aromaCount,
        { ...a, publicAccess: values.publicAccess },
    )));

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
                // The dialog's current value, never the one loaded with the
                // document: publishing propagates publicAccess to the проливы, and
                // saving them with their stale copy immediately undid it — the
                // tasting went public while its проливы silently stayed hidden.
                formData.sessionId, bc, values.publicAccess
            ),
            ...aromas
                .filter((a) => a.brewingCount === bc)
                .map((a) => formApi.patchAromaStages(
                    formData.sessionId, bc, a.aromaCount,
                    { ...a, publicAccess: values.publicAccess },
                )),
            ...tastes
                .filter((t) => t.brewingCount === bc)
                .map((t) => formApi.patchTasteStages(
                    formData.sessionId, bc, t.tasteCount,
                    { ...t, publicAccess: values.publicAccess },
                )),
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
                setBrewStatus((prev) => ({ ...prev, [bc]: err.message || t('edit.brewSaveFailed') }));
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
            // Displayed translated, stored Russian. The Russian string is the
            // key every other language looks up against, so a picked "Gaiwan"
            // has to land in the document as «Гайвань» — see canonicalOption.
            options={options.map((option) => optionLabel(option, locale))}
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
            value={optionLabel(values[name] || '', locale)}
            inputValue={optionLabel(values[name] || '', locale)}
            onChange={(event, next) => setValues((prev) => ({
                ...prev, [name]: canonicalOption(next || '', locale),
            }))}
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
            // «Аромат №2» / "Aroma no. 2" / 香气 2 — the same heading the wizard
            // gives the same row, numbering included.
            const heading = t(
                prefix.startsWith('aroma') ? 'wizard.aromaHeading' : 'wizard.tasteHeading',
                { n: count },
            );
            return (
                <Stack direction="column" spacing={1.5} key={rec._id} style={{ margin: '10px 0 0 0' }}>
                    <span style={{ color: '#d8f5cc', fontWeight: 600 }}>{heading}</span>
                    {(() => {
                        // One field over the whole flattened dictionary rather than
                        // three cascading ones: typing «мята» finds «Травяной →
                        // Мята» and stores all three stages at once. Same control
                        // the wizard uses, so both screens behave alike.
                        const flat = flattenDescriptorDB({
                            response: prefix.startsWith('aroma') ? aromaTree : tasteTree,
                        });
                        const paths = flat.map((o) => o.path);
                        const current = [1, 2, 3]
                            .map((n) => rec[`${prefix}${n}`])
                            .filter((v) => v && v !== 'none')
                            .join(' → ');

                        const commit = (text) => {
                            const typed = String(text || '');
                            const hit = flat.find(
                                (o) => normalizeForMatch(o.path) === normalizeForMatch(typed),
                            );
                            // Not in the dictionary: keep it rather than refuse it —
                            // the extraction writes whatever was said — but still
                            // split on the arrow. Storing "Цветочный → Роза" whole
                            // in stage 1 would leave a descriptor no view can read,
                            // since every consumer joins the three stages itself.
                            const parts = typed
                                .split(/\s*(?:→|->|\/|>)\s*/)
                                .map((s) => s.trim())
                                .filter(Boolean);
                            const stages = hit
                                ? hit.stages
                                : [parts[0] || '', parts[1] || null, parts[2] || null];
                            [1, 2, 3].forEach((n) => changeStage(
                                setter, rec._id, `${prefix}${n}`, stages[n - 1] || '',
                            ));
                        };

                        return (
                            <Autocomplete
                                freeSolo
                                openOnFocus
                                selectOnFocus
                                options={paths}
                            filterOptions={(list, state) => {
                                const query = normalizeForMatch(state.inputValue);
                                if (!query) return list;
                                const hits = list.filter((o) => normalizeForMatch(o).includes(query));
                                // An extracted value rarely matches a dictionary
                                // entry exactly; an empty menu at that moment is
                                // the opposite of helpful.
                                return hits.length ? hits : list;
                            }}
                                value={current}
                                // inputValue is controlled too: with freeSolo, MUI
                                // otherwise shows its own internal text state,
                                // which need not equal what we store.
                                inputValue={current}
                                onChange={(event, next) => commit(next)}
                                onInputChange={(event, next, reason) => {
                                    if (reason === 'input') commit(next);
                                }}
                                renderInput={(params) => (
                                    <TextField {...params}
                                        label={label}
                                        size="small"
                                        placeholder={t('wizard.descriptorPlaceholder')}
                                        inputProps={{
                                            ...params.inputProps,
                                            'aria-label': heading,
                                        }} />
                                )} />
                        );
                    })()}
                </Stack>
            );
        });

    // The dictionary paths the recording gave for the dry leaf. The free-text
    // half is offered by VoiceExtract with the other flat fields; descriptors
    // are rows the server has to create, which is what this applies.
    const dryLeafSuggestion = () => {
        const paths = (voiceSuggestions || {}).dryAroma || [];
        if (!paths.length) return null;

        return (
            <div className="voiceextract" style={{ margin: '0 0 12px 0' }}>
                <div className="voiceextract__head">
                    <span className="voiceextract__title">{t('edit.fromRecording')}</span>
                    <button type="button" className="voiceextract__apply"
                        onClick={() => {
                            createDescriptors([{ bc: 0, suggestion: { aromas: paths } }]);
                            setAppliedBrews((prev) => ({ ...prev, dry: true }));
                        }}
                        disabled={Boolean(appliedBrews.dry)}>
                        {appliedBrews.dry ? '✓' : t('extract.apply')}
                    </button>
                </div>
                <span className="voiceextract__tags">
                    {t('tasting.aroma')}: {paths.join('; ')}
                </span>
            </div>
        );
    };

    // Shown inside the пролив it belongs to, so the user sees the suggestion
    // next to the fields it would change rather than in a list somewhere above.
    const brewSuggestion = (bc) => {
        const found = ((voiceSuggestions || {}).brewings || [])
            .find((brewing) => Number(brewing.number) === Number(bc));
        if (!found) return null;

        const notes = [
            (found.aromas || []).length ? `${t('tasting.aroma')}: ${found.aromas.join('; ')}` : '',
            (found.tastes || []).length ? `${t('tasting.taste')}: ${found.tastes.join('; ')}` : '',
        ].filter(Boolean);

        return (
            <div className="voiceextract" style={{ margin: '0 0 12px 0' }}>
                <div className="voiceextract__head">
                    <span className="voiceextract__title">{t('edit.fromRecording')}</span>
                    <button type="button" className="voiceextract__apply"
                        onClick={() => applyBrewingSuggestion(bc, found)}
                        disabled={Boolean(appliedBrews[bc])}>
                        {appliedBrews[bc] ? '✓' : t('extract.apply')}
                    </button>
                </div>
                {found.description && <span className="voiceextract__value">{found.description}</span>}
                {found.time !== undefined && found.time !== null && (
                    <span className="voiceextract__tags">
                        {t('tasting.steepTime')}: {asBrewingTime(found.time)}
                    </span>
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
                    {t('edit.unmatchedBrews', { list: brewList(extra.map((b) => b.number)) })}
                </span>
                {extra.map((brewing) => (
                    <span className="voiceextract__brewing" key={brewing.number}>
                        <b>{t('wizard.steepHeading', { n: brewing.number })}</b> {brewing.description || ''}
                    </span>
                ))}
            </div>
        );
    };

    const brewingsSection = () => {
        if (brewings === null) {
            return <p className="myforminteraction__row">{t('edit.loadingBrews')}</p>;
        }
        if (brewings.length === 0) {
            return <p className="myforminteraction__row">{t('edit.noBrews')}</p>;
        }
        return brewings.map((brew) => {
            const bc = brew.brewingCount;
            const status = brewStatus[bc];
            return (
                <div key={bc} style={brewBlockStyle} data-testid={`brew-edit-${bc}`}>
                    <p style={{ color: '#d8f5cc', fontWeight: 600, margin: '0 0 12px 0' }}>
                        {t('wizard.steepHeading', { n: bc })}
                    </p>
                    {brewSuggestion(bc)}
                    <Stack direction="column" spacing={1.5}>
                        <TextField
                            label={t('edit.brewTime')}
                            size="small"
                            placeholder="0:00:15"
                            value={brew.brewingTime || ''}
                            inputProps={{ pattern: '^(2[0-3]|[01]?[0-9]):([0-5]?[0-9]):([0-5]?[0-9])$' }}
                            onChange={(e) => changeBrewing(bc, 'brewingTime', e.target.value)} />
                        <TextField
                            label={t('wizard.steepRating')}
                            type="number"
                            size="small"
                            inputProps={{ min: 0, max: 10, step: 1 }}
                            value={brew.brewingRating ?? ''}
                            onChange={(e) => changeBrewing(bc, 'brewingRating', e.target.value)} />
                        <TextField
                            label={t('wizard.steepDescription')}
                            multiline
                            minRows={3}
                            value={brew.description || ''}
                            inputProps={{ minLength: 2, maxLength: 2000 }}
                            onChange={(e) => changeBrewing(bc, 'description', e.target.value)} />
                    </Stack>
                    {stageInputs(aromas.filter((a) => a.brewingCount === bc), setAromas, 'aromaStage', t('tasting.aroma'))}
                    {stageInputs(tastes.filter((t) => t.brewingCount === bc), setTastes, 'tasteStage', t('tasting.taste'))}
                    {status && status !== 'saving' && status !== 'saved' && (
                        <p style={{ color: '#ffb4a8', margin: '8px 0 0 0' }}>{status}</p>
                    )}
                    <div style={{ display: 'flex', gap: '2%' }}>
                        <FormButton
                            buttonName={status === 'saving' ? t('edit.saving') : status === 'saved' ? t('edit.savedMark') : t('edit.saveBrew')}
                            width={'66%'} margin={'12px 0 0 0'}
                            onClick={(e) => { e.preventDefault(); saveBrewing(brew); }}
                        />
                        <FormButton
                            buttonName={t('card.delete')}
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
                    <h3>{t('edit.title')}</h3>
                    <Stack direction="column" spacing={1.5}>
                        {textField(t('card.name'), 'nameRU')}
                        {suggestField(t('card.teaType'), 'type', teaTypeOptions)}
                        {suggestField(t('tasting.country'), 'country', teaCountryOptions)}
                        {suggestField(t('tasting.shop'), 'shop', teaShopOptions)}
                        {numberField(t('edit.weight'), 'weight', 1, 10000)}
                        {suggestField(t('tasting.water'), 'water', waterBrandOptions)}
                        {numberField(t('edit.volume'), 'volume', 1, 10000)}
                        {numberField(t('edit.temperature'), 'temperature', 1, 100)}
                        {numberField(t('edit.price'), 'price', 0, 100000, 0.0001)}
                        {suggestField(t('tasting.teaware'), 'teaware', teaWareOptions)}
                        {suggestField(t('tasting.brewingMethod'), 'brewingtype', brewingTypeOptions)}
                        {numberField(t('edit.finalRating'), 'averageRating', 1, 10, 0.01)}
                        {formData.voice && formData.voice.transcript && (
                            <VoiceExtract
                                sessionId={formData.sessionId}
                                values={values}
                                onApply={(key, value) => setValues((prev) => ({ ...prev, [key]: value }))}
                                onSuggestions={setVoiceSuggestions}
                                onApplyBrewings={applyAllBrewings}
                            />
                        )}
                        <TeaPhotos
                            value={values.photos}
                            onChange={(photos) => setValues((prev) => ({ ...prev, photos }))}
                            onRemovedUrl={(url) => setRemovedUrls((prev) => [...prev, url])}
                        />
                        {/* The dry leaf, and then the tea as a whole — the same
                            order the wizard asks for them in. */}
                        <div style={brewBlockStyle}>
                            <p style={{ color: '#d8f5cc', fontWeight: 600, margin: '0 0 4px 0' }}>
                                {t('tasting.dryAroma')}
                            </p>
                            {dryLeafSuggestion()}
                            {stageInputs(dryAromas(), setAromas, 'aromaStage', t('tasting.dryAroma'))}
                            {brewStatus[0] && brewStatus[0] !== 'saving' && brewStatus[0] !== 'saved' && (
                                <p style={{ color: '#ffb4a8', margin: '8px 0 0 0' }}>{brewStatus[0]}</p>
                            )}
                            <FormButton buttonName={t('wizard.addAroma')}
                                width={'100%'} margin={'12px 0 0 0'}
                                onClick={(e) => { e.preventDefault(); addDryAroma(); }} />
                            <TextField
                                label={t('tasting.dryAromaNotes')}
                                name="dryAromaDescription"
                                multiline
                                minRows={2}
                                style={{ margin: '12px 0 0 0' }}
                                value={values.dryAromaDescription}
                                onChange={handleChange}
                                inputProps={{ maxLength: 2000 }} />
                        </div>
                        <TextField
                            label={t('tasting.generalDescription')}
                            name="description"
                            multiline
                            minRows={3}
                            value={values.description}
                            onChange={handleChange}
                            inputProps={{ maxLength: 2000 }} />
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <bdi>{t('tasting.publicAccess')}: </bdi>
                            <input type="checkbox" name="publicAccess"
                                checked={values.publicAccess} onChange={handleChange} />
                        </label>
                        {formData.voice && (formData.voice.track || {}).url && (
                            // Separate from the checkbox above on purpose: publishing
                            // the tasting text is not the same decision as publishing
                            // the audio, which caught whatever else was in the room.
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <bdi>{t('edit.publishVoice')}: </bdi>
                                <input type="checkbox" name="voicePublic"
                                    checked={values.voicePublic} onChange={handleChange} />
                            </label>
                        )}
                    </Stack>
                    {error && <p style={{ color: '#ffb4a8' }}>{error}</p>}
                    <FormButton type="submit"
                        buttonName={saving ? t('edit.saving') : saved ? t('edit.savedMark') : t('edit.saveForm')}
                        width={'100%'} />
                </form>

                {/* Keeps its own top margin — it separates the проливы from the
                    form above; the bottom comes from the section rule. */}
                <h3 style={{ marginTop: '18px' }}>{t('edit.brews')}</h3>
                {brewingsSection()}
                {unmatchedBrewings()}
                {brewings !== null && (
                    <FormButton buttonName={t('wizard.addSteep')} width={'100%'} margin={'4px 0 0 0'}
                        onClick={(e) => { e.preventDefault(); addBrewing(); }} />
                )}

                <FormButton buttonName={t('edit.close')} width={'100%'} margin={'12px 0 0 0'}
                    onClick={(e) => { e.preventDefault(); closePopup(); }} />
            </section>
        </ThemeProvider>
    );
}

export default FormEdit;
