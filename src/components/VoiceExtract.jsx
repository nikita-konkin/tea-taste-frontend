import React, { useState } from 'react';
import { mainApi } from '../utils/MainAPI.jsx';

// Only the fields the edit dialog actually owns, in the order they appear there.
export const FIELDS = [
    ['nameRU', 'Название'],
    ['type', 'Вид чая'],
    ['country', 'Страна'],
    ['shop', 'Магазин'],
    ['weight', 'Навеска, г'],
    ['water', 'Вода'],
    ['volume', 'Объём, мл'],
    ['temperature', 'Температура, °C'],
    ['price', 'Цена, ₽'],
    ['teaware', 'Посуда'],
    ['brewingtype', 'Способ'],
];

// Suggestions from the voice transcript, applied one field at a time.
//
// Nothing is filled in automatically on purpose: the model reads a transcript of
// conversational speech and is occasionally confidently wrong — it once put the
// pack weight into the dose. A rejected suggestion costs a tap; a silent
// overwrite costs data the user typed correctly.
function VoiceExtract({ sessionId, values, onApply, onSuggestions }) {
    const [suggestions, setSuggestions] = useState(null);
    const [cached, setCached] = useState(false);
    const [brewings, setBrewings] = useState([]);
    const [applied, setApplied] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const run = () => {
        setLoading(true);
        setError('');
        mainApi.extractVoice(sessionId)
            .then(({ data, cached }) => {
                setSuggestions(data || {});
                setCached(Boolean(cached));
                setBrewings((data && data.brewings) || []);
                // The пролив suggestions are applied inside their own blocks
                // further down the dialog, where the fields they target live.
                if (onSuggestions) onSuggestions(data || {});
            })
            .catch((err) => setError(err.message || 'Не удалось разобрать расшифровку.'))
            .finally(() => setLoading(false));
    };

    const apply = (key, value) => {
        onApply(key, value);
        setApplied((prev) => ({ ...prev, [key]: true }));
    };

    const offered = suggestions
        ? FIELDS.filter(([key]) => suggestions[key] !== undefined && suggestions[key] !== '')
        : [];

    const applyAll = () => offered.forEach(([key]) => apply(key, suggestions[key]));

    if (!suggestions) {
        return (
            <div className="voiceextract">
                <button type="button" className="voicenote__button" onClick={run} disabled={loading}>
                    {loading ? 'Разбираем…' : 'Заполнить из расшифровки'}
                </button>
                {error && <p className="voicenote__error">{error}</p>}
            </div>
        );
    }

    return (
        <div className="voiceextract">
            <div className="voiceextract__head">
                <span className="voiceextract__title">
                    Предложения из записи{cached ? ' (сохранённый разбор)' : ''}
                </span>
                {offered.length > 0 && (
                    <button type="button" className="voiceextract__all" onClick={applyAll}>
                        Применить всё
                    </button>
                )}
            </div>

            {offered.length === 0 && (
                <p className="voicenote__hint">В расшифровке не нашлось данных для полей.</p>
            )}

            <ul className="voiceextract__list">
                {offered.map(([key, label]) => {
                    const value = suggestions[key];
                    // Showing what it would replace is the whole point: the user
                    // is deciding between two values, not accepting a blank one.
                    const current = values[key];
                    const same = String(current ?? '') === String(value);
                    return (
                        <li className="voiceextract__item" key={key}>
                            <span className="voiceextract__label">{label}</span>
                            <span className="voiceextract__value">{String(value)}</span>
                            {current !== '' && current !== undefined && !same && (
                                <span className="voiceextract__current">было: {String(current)}</span>
                            )}
                            <button type="button" className="voiceextract__apply"
                                onClick={() => apply(key, value)}
                                disabled={applied[key] || same}>
                                {applied[key] || same ? '✓' : 'Применить'}
                            </button>
                        </li>
                    );
                })}
            </ul>

            {brewings.length > 0 && (
                <p className="voicenote__hint">
                    Проливов в записи: {brewings.length}. Каждый предлагается в своём блоке ниже.
                </p>
            )}
        </div>
    );
}

export default VoiceExtract;
