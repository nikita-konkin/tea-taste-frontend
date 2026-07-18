import React, { useState, useEffect } from 'react';
import FormButton from './FormButton.jsx';
import { usePopup } from './PopupContext.jsx';
import { formApi } from '../utils/FormAPI.jsx';

const inputStyle = {
    width: '100%',
    boxSizing: 'border-box',
    margin: '4px 0 12px 0',
    padding: '6px 8px',
    fontFamily: 'inherit',
    fontSize: '16px',
};

const brewBlockStyle = {
    border: '1px solid #96B295',
    borderRadius: '8px',
    padding: '10px',
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
        publicAccess: Boolean(formData.publicAccess),
    });
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

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
            publicAccess: values.publicAccess,
        };

        patchFormById(formData.sessionId, body)
            .then(() => setSaved(true))
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
        <label className="myforminteraction__row">
            <bdi>{label}</bdi>
            <input style={inputStyle} type="text" name={name}
                value={values[name]} onChange={handleChange}
                minLength={minLength} maxLength={maxLength} required />
        </label>
    );

    const numberField = (label, name, min, max, step = 1) => (
        <label className="myforminteraction__row">
            <bdi>{label}</bdi>
            <input style={inputStyle} type="number" name={name}
                value={values[name]} onChange={handleChange}
                min={min} max={max} step={step} required />
        </label>
    );

    const stageInputs = (records, setter, prefix, label) =>
        records.map((rec) => (
            <div key={rec._id}>
                <p className="myforminteraction__row"><bdi>{label} №{rec[`${prefix.replace('Stage', '')}Count`]}</bdi></p>
                {[1, 2, 3].map((n) => (
                    <input key={n} style={inputStyle} type="text"
                        aria-label={`${label} ${rec[`${prefix.replace('Stage', '')}Count`]} — стадия ${n}`}
                        placeholder={`Стадия ${n}`}
                        value={rec[`${prefix}${n}`] || ''}
                        maxLength={30}
                        onChange={(e) => changeStage(setter, rec._id, `${prefix}${n}`, e.target.value)} />
                ))}
            </div>
        ));

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
                    <p className="myforminteraction__row"><bdi>Пролив №{bc}</bdi></p>
                    <label className="myforminteraction__row">
                        <bdi>Время заваривания (Ч:ММ:СС): </bdi>
                        <input style={inputStyle} type="text"
                            value={brew.brewingTime || ''}
                            pattern="^(2[0-3]|[01]?[0-9]):([0-5]?[0-9]):([0-5]?[0-9])$"
                            placeholder="0:00:15"
                            onChange={(e) => changeBrewing(bc, 'brewingTime', e.target.value)} />
                    </label>
                    <label className="myforminteraction__row">
                        <bdi>Рейтинг пролива: </bdi>
                        <input style={inputStyle} type="number" min={0} max={10} step={1}
                            value={brew.brewingRating ?? ''}
                            onChange={(e) => changeBrewing(bc, 'brewingRating', e.target.value)} />
                    </label>
                    <label className="myforminteraction__row">
                        <bdi>Описание: </bdi>
                        <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={3}
                            value={brew.description || ''}
                            minLength={2} maxLength={2000}
                            onChange={(e) => changeBrewing(bc, 'description', e.target.value)} />
                    </label>
                    {stageInputs(aromas.filter((a) => a.brewingCount === bc), setAromas, 'aromaStage', 'Аромат')}
                    {stageInputs(tastes.filter((t) => t.brewingCount === bc), setTastes, 'tasteStage', 'Вкус')}
                    {status && status !== 'saving' && status !== 'saved' && (
                        <p className="myforminteraction__row" style={{ color: '#a33' }}>{status}</p>
                    )}
                    <FormButton
                        buttonName={status === 'saving' ? 'Сохраняем...' : status === 'saved' ? 'Сохранено ✓' : 'Сохранить пролив'}
                        width={'100%'} margin={'8px 0 0 0'}
                        onClick={(e) => { e.preventDefault(); saveBrewing(brew); }}
                    />
                </div>
            );
        });
    };

    return (
        <section className="myforminteraction__section">
            <form onSubmit={handleSubmit} data-testid="form-edit">
                <h3 className="myforminteraction__row">Редактирование формы</h3>
                {textField('Название: ', 'nameRU')}
                {textField('Тип чая: ', 'type')}
                {textField('Страна: ', 'country')}
                {textField('Магазин: ', 'shop')}
                {numberField('Вес, г: ', 'weight', 1, 10000)}
                {textField('Вода: ', 'water')}
                {numberField('Объем воды, мл: ', 'volume', 1, 10000)}
                {numberField('Температура воды, °C: ', 'temperature', 1, 100)}
                {numberField('Цена за грамм, ₽: ', 'price', 0, 100000, 0.0001)}
                {textField('Посуда: ', 'teaware')}
                {textField('Метод заваривания: ', 'brewingtype')}
                {numberField('Итоговый рейтинг (1–10): ', 'averageRating', 1, 10, 0.01)}
                <label className="myforminteraction__row">
                    <bdi>Публикация в блоге: </bdi>
                    <input type="checkbox" name="publicAccess"
                        checked={values.publicAccess} onChange={handleChange} />
                </label>
                {error && <p className="myforminteraction__row" style={{ color: '#a33' }}>{error}</p>}
                <FormButton type="submit"
                    buttonName={saving ? 'Сохраняем...' : saved ? 'Сохранено ✓' : 'Сохранить форму'}
                    width={'100%'} />
            </form>

            <h3 className="myforminteraction__row" style={{ marginTop: '16px' }}>Проливы</h3>
            {brewingsSection()}

            <FormButton buttonName={'Закрыть'} width={'100%'} margin={'12px 0 0 0'}
                onClick={(e) => { e.preventDefault(); closePopup(); }} />
        </section>
    );
}

export default FormEdit;
