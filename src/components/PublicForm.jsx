import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from './Header.jsx';
import { formApi } from '../utils/FormAPI.jsx';

const chipStyle = {
    display: 'inline-block',
    background: 'rgba(255, 255, 255, 0.12)',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    borderRadius: '999px',
    padding: '3px 12px',
    margin: '3px 6px 3px 0',
    fontSize: '14px',
};

const brewSectionStyle = {
    border: '1px solid rgba(255, 255, 255, 0.20)',
    background: 'rgba(255, 255, 255, 0.06)',
    borderRadius: '10px',
    padding: '10px 12px',
    margin: '10px 0',
    listStyle: 'none',
};

const accentStyle = { color: '#d8f5cc', fontWeight: 600 };

const descriptorPath = (rec, prefix) =>
    [1, 2, 3]
        .map((n) => rec[`${prefix}${n}`])
        .filter((v) => v && v !== 'none')
        .join(' → ');

// Shareable page for one public tasting: /blog/:sessionId
function PublicForm() {
    const { sessionId } = useParams();

    const [form, setForm] = useState(null);
    const [brewings, setBrewings] = useState([]);
    const [aromas, setAromas] = useState([]);
    const [tastes, setTastes] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        Promise.all([
            formApi.getPublicFormById(sessionId),
            formApi.getPublicBrewingsById(sessionId),
            formApi.getPublicAromasById(sessionId),
            formApi.getPublicTastesById(sessionId),
        ])
            .then(([f, b, a, t]) => {
                setForm(f.data);
                setBrewings((b.data || []).sort((x, y) => x.brewingCount - y.brewingCount));
                setAromas(a.data || []);
                setTastes(t.data || []);
            })
            .catch((err) => setError(err.message || 'Форма не найдена.'));
    }, [sessionId]);

    if (error) {
        return (
            <>
                <Header />
                <div className="myforms">
                    <h2 className="header__myforms">{error}</h2>
                    <Link to="/blog" style={{ color: '#d8f5cc' }}>← Вернуться в блог</Link>
                </div>
            </>
        );
    }

    if (!form) {
        return (
            <>
                <Header />
                <div className="myforms">
                    <h2 className="header__myforms">Загружаем форму...</h2>
                </div>
            </>
        );
    }

    const author = Array.isArray(form.owner) ? form.owner[0] : form.owner;

    const metaRow = (label, value) =>
        value !== undefined && value !== null && value !== '' && value !== 'none' ? (
            <li key={label} className="myforminteraction__row" style={{ padding: '1px 0' }}>
                <bdi style={{ opacity: 0.75 }}>{label}: </bdi>{value}
            </li>
        ) : null;

    return (
        <>
            <Helmet>
                <title>{`${form.nameRU} — Форма Чая`}</title>
                <meta name="description" content={`Дегустационная запись: ${form.nameRU}`} />
            </Helmet>
            <Header />
            <div className="myforms">
                <section className="myforminteraction__section">
                    <h3 style={{ margin: '0 0 2px 0', fontSize: '20px', color: '#ffffff' }}>{form.nameRU}</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '0 0 10px 0', color: '#ffffff' }}>
                        <span style={{ opacity: 0.85, fontSize: '14px' }}>
                            {[author && author.name, form.createdAt && new Date(form.createdAt).toLocaleDateString('ru-RU')]
                                .filter(Boolean).join(' · ')}
                        </span>
                        {form.averageRating != null && (
                            <span style={accentStyle}>{form.averageRating}/10 пиал</span>
                        )}
                    </div>
                    <ul className="myforminteraction__list" style={{ margin: 0, padding: 0 }}>
                        {metaRow('Тип чая', form.type)}
                        {metaRow('Страна', form.country)}
                        {metaRow('Магазин', form.shop)}
                        {metaRow('Вес', form.weight != null ? `${form.weight} г` : null)}
                        {metaRow('Вода', form.water)}
                        {metaRow('Объем воды', form.volume != null ? `${form.volume} мл` : null)}
                        {metaRow('Температура воды', form.temperature != null ? `${form.temperature} °C` : null)}
                        {metaRow('Цена за грамм', form.price != null ? `${form.price} ₽` : null)}
                        {metaRow('Посуда', form.teaware)}
                        {metaRow('Метод заваривания', form.brewingtype)}
                        {brewings.map((brew) => {
                            const aromaPaths = aromas
                                .filter((a) => a.brewingCount === brew.brewingCount)
                                .sort((a, b) => a.aromaCount - b.aromaCount)
                                .map((a) => descriptorPath(a, 'aromaStage'))
                                .filter(Boolean);
                            const tastePaths = tastes
                                .filter((t) => t.brewingCount === brew.brewingCount)
                                .sort((a, b) => a.tasteCount - b.tasteCount)
                                .map((t) => descriptorPath(t, 'tasteStage'))
                                .filter(Boolean);
                            return (
                                <li key={`brew-${brew.brewingCount}`} style={brewSectionStyle}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                        <span style={accentStyle}>Пролив №{brew.brewingCount}</span>
                                        {brew.brewingRating != null && <span>{brew.brewingRating}/10 пиал</span>}
                                    </div>
                                    {brew.brewingTime && brew.brewingTime !== 'none' && brew.brewingTime !== '00:00:00' && (
                                        <div style={{ margin: '4px 0 0 0' }}>Время заваривания: {brew.brewingTime}</div>
                                    )}
                                    {brew.description && brew.description !== 'none' && (
                                        <div style={{ margin: '4px 0 0 0', fontStyle: 'italic' }}>{brew.description}</div>
                                    )}
                                    {aromaPaths.length > 0 && (
                                        <div style={{ margin: '8px 0 0 0' }}>
                                            <span style={accentStyle}>Аромат</span><br />
                                            {aromaPaths.map((p, i) => <span key={`a-${i}`} style={chipStyle}>{p}</span>)}
                                        </div>
                                    )}
                                    {tastePaths.length > 0 && (
                                        <div style={{ margin: '8px 0 0 0' }}>
                                            <span style={accentStyle}>Вкус</span><br />
                                            {tastePaths.map((p, i) => <span key={`t-${i}`} style={chipStyle}>{p}</span>)}
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                    <Link to="/blog" style={{ color: '#d8f5cc', display: 'inline-block', marginTop: '10px' }}>← Все публичные формы</Link>
                </section>
            </div>
        </>
    );
}

export default PublicForm;
