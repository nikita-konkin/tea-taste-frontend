import React, { useState } from 'react';
import { useT } from '../i18n/index.js';
import { mainApi } from '../utils/MainAPI.jsx';

// Only the fields the edit dialog actually owns, in the order they appear there.
// The second element is a message key, not a label: this list is module-level,
// where there is no hook to read the language from — it is translated at render.
export const FIELDS = [
    ['nameRU', 'extract.name'],
    ['type', 'extract.teaKind'],
    ['country', 'extract.country'],
    ['shop', 'extract.shop'],
    ['weight', 'extract.weight'],
    ['water', 'extract.water'],
    ['volume', 'extract.volume'],
    ['temperature', 'extract.temperature'],
    ['price', 'extract.price'],
    ['teaware', 'extract.teaware'],
    ['brewingtype', 'extract.method'],
    ['dryAromaDescription', 'extract.dryAromaNotes'],
    ['description', 'extract.description'],
];

// Suggestions from the voice transcript, applied one field at a time.
//
// Nothing is filled in automatically on purpose: the model reads a transcript of
// conversational speech and is occasionally confidently wrong — it once put the
// pack weight into the dose. A rejected suggestion costs a tap; a silent
// overwrite costs data the user typed correctly.
function VoiceExtract({ sessionId, values, onApply, onSuggestions, onApplyBrewings }) {
    const { t } = useT();
    const [suggestions, setSuggestions] = useState(null);
    const [cached, setCached] = useState(false);
    const [offTopic, setOffTopic] = useState('');
    const [brewings, setBrewings] = useState([]);
    const [applied, setApplied] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const run = () => {
        setLoading(true);
        setError('');
        mainApi.extractVoice(sessionId)
            .then(({ data, cached, offTopic: off, topic }) => {
                setSuggestions(data || {});
                setCached(Boolean(cached));
                setOffTopic(off ? (topic || t('extract.topicUnknown')) : '');
                setBrewings((data && data.brewings) || []);
                // The пролив suggestions are applied inside their own blocks
                // further down the dialog, where the fields they target live.
                if (onSuggestions) onSuggestions(data || {});
            })
            .catch((err) => setError(err.message || t('extract.parseFailed')))
            .finally(() => setLoading(false));
    };

    const apply = (key, value) => {
        onApply(key, value);
        setApplied((prev) => ({ ...prev, [key]: true }));
    };

    const offered = suggestions
        ? FIELDS.filter(([key]) => suggestions[key] !== undefined && suggestions[key] !== '')
        : [];

    // The проливы live further down the dialog, which owns them, so applying
    // them is a callback. They are applied here all the same: «Применить всё»
    // has to mean all of it. It used to mean "the tea's own fields", and the
    // проливы were quietly left behind with their own buttons.
    const applyAll = () => {
        offered.forEach(([key]) => apply(key, suggestions[key]));
        if (onApplyBrewings) onApplyBrewings();
    };

    // A tasting where every note was recorded against a пролив yields exactly
    // this: no tea-level fields and six проливы. Keying the button and the
    // "nothing found" line off `offered` alone called that an empty result.
    const hasSomething = offered.length > 0 || brewings.length > 0;

    if (!suggestions) {
        return (
            <div className="voiceextract">
                <button type="button" className="voicenote__button" onClick={run} disabled={loading}>
                    {loading ? t('extract.parsing') : t('extract.fill')}
                </button>
                {error && <p className="voicenote__error">{error}</p>}
            </div>
        );
    }

    // Nothing is offered when the recording turned out to be about something
    // else — filling tea fields from it would be invention. The recording and
    // its transcript are kept regardless; they are the user's either way.
    if (offTopic) {
        return (
            <div className="voiceextract">
                <span className="voiceextract__title">{t('extract.offTopic')}</span>
                <span className="voiceextract__value">{t('extract.offTopicTopic', { topic: offTopic })}</span>
                <p className="voicenote__hint">{t('extract.offTopicHint')}</p>
            </div>
        );
    }

    return (
        <div className="voiceextract">
            <div className="voiceextract__head">
                <span className="voiceextract__title">
                    {t('extract.suggestions')}{cached ? ` ${t('extract.cached')}` : ''}
                </span>
                {hasSomething && (
                    <button type="button" className="voiceextract__all" onClick={applyAll}>
                        {t('extract.applyAll')}
                    </button>
                )}
            </div>

            {!hasSomething && (
                <p className="voicenote__hint">{t('extract.nothingFound')}</p>
            )}

            <ul className="voiceextract__list">
                {offered.map(([key, labelKey]) => {
                    const value = suggestions[key];
                    // Showing what it would replace is the whole point: the user
                    // is deciding between two values, not accepting a blank one.
                    const current = values[key];
                    const same = String(current ?? '') === String(value);
                    return (
                        <li className="voiceextract__item" key={key}>
                            <span className="voiceextract__label">{t(labelKey)}</span>
                            <span className="voiceextract__value">{String(value)}</span>
                            {current !== '' && current !== undefined && !same && (
                                <span className="voiceextract__current">{t('extract.wasValue', { value: String(current) })}</span>
                            )}
                            <button type="button" className="voiceextract__apply"
                                onClick={() => apply(key, value)}
                                disabled={applied[key] || same}>
                                {applied[key] || same ? '✓' : t('extract.apply')}
                            </button>
                        </li>
                    );
                })}
            </ul>

            {brewings.length > 0 && (
                <p className="voicenote__hint">
                    {t('extract.brewingsFound', { n: brewings.length })}
                </p>
            )}
        </div>
    );
}

export default VoiceExtract;
