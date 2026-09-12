import React from 'react';
import { Link } from 'react-router-dom';
import Header from './Header.jsx';
import PageMeta from './PageMeta.jsx';
import VoiceNote, { MAX_TOTAL_SECONDS } from './VoiceNote.jsx';
import { Block, withKeys, MONTHLY_MINUTES } from './VoiceGuide.jsx';
import { useVoiceDraft } from '../utils/voiceDraft.js';
import { useT } from '../i18n/index.js';

const TRACK_MINUTES = Math.round(MAX_TOTAL_SECONDS / 60);

// A ceremony recorded on a phone rather than in the browser. This lived on
// stage 1 for one release and did not belong there: everything else on that
// page is a field about the tea, and the requirements a file has to meet —
// formats, the shared budget, the numbers that must be spoken aloud — are
// several sentences that nobody reads while filling in a form.
//
// It writes into the same draft the recorders write into (useVoiceDraft is a
// module-level store over localStorage, not wizard state), so a file dropped
// here is waiting in stage 1 whether the tasting was started before or after.
// Nothing is recognised at this point: that happens when the tasting is saved.
function VoiceImport() {
    const { t, url } = useT();
    const [voiceSegments, setVoiceSegments] = useVoiceDraft();

    const limits = { track: TRACK_MINUTES, month: MONTHLY_MINUTES };
    const bullet = (key) => <li key={key}>{withKeys(t(key, limits))}</li>;

    return (
        <>
            <PageMeta title={t('voice.wholeSession')} path="/voice_import" noIndex />
            <Header />
            <main className="voiceguide voiceimport">
                <h3 className="voiceguide__title">{t('voice.wholeSession')}</h3>
                <p className="voiceguide__lead">{t('import.lead')}</p>

                <Block title={t('import.s1')}>
                    {['import.s1a', 'import.s1b', 'import.s1c', 'import.s1d', 'import.s1e'].map(bullet)}
                </Block>

                {/* The control itself, between the requirements and what
                    follows, because that is the order the page is read in. */}
                <section className="myforminteraction__section voiceguide__block">
                    <h4 className="voiceguide__block-title">{t('import.upload')}</h4>
                    <VoiceNote
                        value={voiceSegments}
                        onChange={setVoiceSegments}
                        whole
                        importOnly
                        label={t('voice.wholeSession')}
                    />
                </section>

                <Block title={t('import.s2')}>
                    {['import.s2a', 'import.s2b', 'import.s2c', 'import.s2d'].map(bullet)}
                </Block>

                <Link className="voiceimport__go" to={url('/form_1')}>{t('import.toForm')}</Link>

                <p className="voiceguide__note">{t('import.note')}</p>
            </main>
        </>
    );
}

export default VoiceImport;
