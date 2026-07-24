import React, { useState, useEffect } from 'react';
import FormButton from './FormButton.jsx';
import { usePopup } from './PopupContext.jsx';
import { formApi } from '../utils/FormAPI.jsx';
import { mainApi } from '../utils/MainAPI.jsx';
import TeaPhotos from './TeaPhotos.jsx';
import { TextField, Stack } from '@mui/material';
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
    });
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    // Photos dropped in this dialog are still live on the stored form, so the
    // files are only deleted once the save has actually gone through.
    const [removedUrls, setRemovedUrls] = useState([]);

    // Stage-2 data, editable copies keyed for controlled inputs.
    const [brewings, setBrewings] = useState(null); // null = loading, [] = none
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
        };

        patchFormById(formData.sessionId, body)
            .then(() => {
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

        const patches = [
            formApi.patchFormStage2Brew(
                {
                    description: brew.description,
                    brewingRating: Number(brew.brewingRating),
                    brewingTime: brew.brewingTime,
                },
                formData.sessionId, bc, brew.publicAccess
            ),
            ...aromas
                .filter((a) => a.brewingCount === bc)
                .map((a) => formApi.patchAromaStages(formData.sessionId, bc, a.aromaCount, a)),
            ...tastes
                .filter((t) => t.brewingCount === bc)
                .map((t) => formApi.patchTasteStages(formData.sessionId, bc, t.tasteCount, t)),
        ];

        Promise.all(patches)
            .then(() => setBrewStatus((prev) => ({ ...prev, [bc]: 'saved' })))
            .catch((err) =>
                setBrewStatus((prev) => ({ ...prev, [bc]: err.message || 'Ошибка сохранения.' }))
            );
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
                        {textField('Тип чая', 'type')}
                        {textField('Страна', 'country')}
                        {textField('Магазин', 'shop')}
                        {numberField('Вес, г', 'weight', 1, 10000)}
                        {textField('Вода', 'water')}
                        {numberField('Объем воды, мл', 'volume', 1, 10000)}
                        {numberField('Температура воды, °C', 'temperature', 1, 100)}
                        {numberField('Цена за грамм, ₽', 'price', 0, 100000, 0.0001)}
                        {textField('Посуда', 'teaware')}
                        {textField('Метод заваривания', 'brewingtype')}
                        {numberField('Итоговый рейтинг (1–10)', 'averageRating', 1, 10, 0.01)}
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
                    </Stack>
                    {error && <p style={{ color: '#ffb4a8' }}>{error}</p>}
                    <FormButton type="submit"
                        buttonName={saving ? 'Сохраняем...' : saved ? 'Сохранено ✓' : 'Сохранить форму'}
                        width={'100%'} />
                </form>

                <h3 style={{ margin: '18px 0 8px 0' }}>Проливы</h3>
                {brewingsSection()}
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
