import React from 'react';
import { MAX_TOTAL_SECONDS } from './VoiceNote.jsx';
import { useT } from '../i18n/index.js';

// The recorder's own budget, not a number retyped into prose: if the cap ever
// moves, the instructions move with it.
const TRACK_MINUTES = Math.round(MAX_TOTAL_SECONDS / 60);

// Mirrors MONTHLY_LIMIT_SECONDS in the API's utils/voiceQuota.js. Deliberately a
// constant rather than a fetch: this is help text, and the live balance is on
// /profile, where it is read from the server and shown as a bar.
const MONTHLY_MINUTES = 30;

// Names of real controls, highlighted so they can be found on the page instead
// of read as ordinary prose.
const Key = ({ children }) => <span className="voiceguide__key">{children}</span>;

const Block = ({ title, children }) => (
    <section className="myforminteraction__section voiceguide__block">
        <h4 className="voiceguide__block-title">{title}</h4>
        <ul className="voiceguide__list">{children}</ul>
    </section>
);

// Every bullet names real controls mid-sentence. Splitting each one into three
// catalogue entries around the markup would hand a translator fragments and
// freeze the Russian word order, so the entry keeps the whole sentence and
// marks control names with [[...]] instead.
const MARKED = /\[\[(.+?)\]\]/g;
const withKeys = (text) => {
    const parts = [];
    let cursor = 0;
    for (const match of text.matchAll(MARKED)) {
        if (match.index > cursor) parts.push(text.slice(cursor, match.index));
        parts.push(<Key key={match.index}>{match[1]}</Key>);
        cursor = match.index + match[0].length;
    }
    if (cursor < text.length) parts.push(text.slice(cursor));
    return parts;
};

// Short reference for the voice notes, opened from /my_forms and from the side
// menu. Read-only and self-contained: it makes no requests, so it works while
// the list is still loading and for a user who has no tastings yet.
function VoiceGuide() {
    const { t } = useT();
    // The minute counts are the recorder's own budget, substituted rather than
    // retyped into each language's prose.
    const limits = { track: TRACK_MINUTES, month: MONTHLY_MINUTES };
    const bullet = (key) => <li key={key}>{withKeys(t(key, limits))}</li>;

    return (
        <div className="voiceguide">
            <h3 className="voiceguide__title">{t('nav.voiceNotes')}</h3>
            <p className="voiceguide__lead">{t('guide.lead')}</p>

            <Block title={t('guide.s1')}>
                {['guide.s1a', 'guide.s1b', 'guide.s1c', 'guide.s1d'].map(bullet)}
            </Block>

            <Block title={t('guide.s2')}>
                {['guide.s2a', 'guide.s2b', 'guide.s2c'].map(bullet)}
            </Block>

            <Block title={t('guide.s3')}>
                {['guide.s3a', 'guide.s3b', 'guide.s3c', 'guide.s3d', 'guide.s3e'].map(bullet)}
            </Block>

            <Block title={t('guide.s4')}>
                {['guide.s4a', 'guide.s4b'].map(bullet)}
            </Block>

            <Block title={t('guide.s5')}>
                {['guide.s5a', 'guide.s5b', 'guide.s5c'].map(bullet)}
            </Block>

            <Block title={t('guide.s6')}>
                {['guide.s6a', 'guide.s6b', 'guide.s6c', 'guide.s6d'].map(bullet)}
            </Block>

            <p className="voiceguide__note">{t('guide.note')}</p>
        </div>
    );
}

// The trigger's icon, in the thin line-art style of the menu icons.
export const MicIcon = () => (
    <svg className="voiceguide__icon" viewBox="0 0 24 24" width="18" height="18"
        fill="none" stroke="currentColor" strokeWidth="1.6"
        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="9" y="3" width="6" height="11" rx="3" />
        <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" />
    </svg>
);

export default VoiceGuide;
