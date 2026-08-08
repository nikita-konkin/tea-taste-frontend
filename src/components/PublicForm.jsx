import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PageMeta from './PageMeta.jsx';
import Header from './Header.jsx';
import SiteFooter from './SiteFooter.jsx';
import { orderPhotos } from './TeaPhotos.jsx';
import TeaPhotoGallery from './TeaPhotoGallery.jsx';
import VoicePlayer from './VoicePlayer.jsx';
import { formApi } from '../utils/FormAPI.jsx';
import { formatShortDateTime, formUrl } from '../utils/utils.js';
import { formDescription, formJsonLd } from '../utils/formMeta.js';
import { teaTypeName } from '../utils/teaTypes.js';
import { useT } from '../i18n/index.js';
import { translateDescriptorPath } from '../i18n/descriptors.js';
import { translateOption } from '../i18n/options.js';

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

// Shareable page for one public tasting: /blog/:slugOrId
function PublicForm() {
    // Named sessionId for the route param, but it holds either address a
    // tasting answers to — its slug or, for links shared before slugs existed,
    // its raw sessionId.
    const { sessionId: slugOrId } = useParams();
    const navigate = useNavigate();
    const { t, url, locale } = useT();

    const [form, setForm] = useState(null);
    const [brewings, setBrewings] = useState([]);
    const [aromas, setAromas] = useState([]);
    const [tastes, setTastes] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;
        // The form is fetched first and the rest afterwards, rather than all
        // four at once: the proliferations, aromas and tastes are keyed by the
        // real sessionId, which only the form itself can supply when the page
        // was reached by slug.
        formApi.getPublicFormById(slugOrId)
            .then((f) => {
                if (cancelled) return null;
                setForm(f.data);
                const id = f.data.sessionId;
                return Promise.all([
                    formApi.getPublicBrewingsById(id),
                    formApi.getPublicAromasById(id),
                    formApi.getPublicTastesById(id),
                ]).then(([b, a, t]) => {
                    if (cancelled) return;
                    setBrewings((b.data || []).sort((x, y) => x.brewingCount - y.brewingCount));
                    setAromas(a.data || []);
                    setTastes(t.data || []);
                });
            })
            .catch((err) => { if (!cancelled) setError(err.message || t('tasting.notFound')); });
        return () => { cancelled = true; };
    }, [slugOrId]);

    // An old /blog/<uuid> link lands on the right tasting but under the wrong
    // address. Moving to the canonical one keeps a shared link working while
    // making sure only one URL is ever indexed or copied out of the address bar.
    // `replace`, so the back button does not bounce between the two.
    useEffect(() => {
        if (form && form.slug && form.slug !== slugOrId) {
            navigate(url(`/blog/${form.slug}`), { replace: true });
        }
    }, [form, slugOrId, navigate, url]);

    if (error) {
        return (
            <>
                <Header />
                <div className="myforms">
                    <h2 className="header__myforms">{error}</h2>
                    <Link to={url('/blog')} style={{ color: '#d8f5cc' }}>{t('tasting.backToBlog')}</Link>
                </div>
            </>
        );
    }

    if (!form) {
        return (
            <>
                <Header />
                <div className="myforms">
                    <h2 className="header__myforms">{t('tasting.loading')}</h2>
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

    const preview = orderPhotos(form.photos)[0];

    // Derived in utils/formMeta.js, which the API's renderer mirrors: the HTML a
    // crawler is served and the page a reader sees have to make the same claims.
    const jsonLd = formJsonLd(form, brewings, preview && preview.url, locale);

    return (
        <>
            <PageMeta
                title={form.nameRU}
                description={formDescription(form, brewings, locale)}
                image={preview && preview.url}
                path={formUrl(form)}
                type="article"
                jsonLd={jsonLd}
            />
            <Header />
            <div className="myforms">
                <section className="myforminteraction__section">
                    <h1 style={{ margin: '0 0 2px 0', fontSize: '20px', color: '#ffffff', fontWeight: 600 }}>{form.nameRU}</h1>
                    <TeaPhotoGallery photos={form.photos} />
                    {/* No sessionId: the public page has no owner endpoint to
                        poll, so it shows whatever the form already carries. */}
                    <VoicePlayer voice={form.voice} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '0 0 10px 0', color: '#ffffff' }}>
                        <span style={{ opacity: 0.85, fontSize: '14px' }}>
                            {[author && (author.nickname || author.name), formatShortDateTime(form.createdAt)]
                                .filter(Boolean).join(' · ')}
                        </span>
                        {form.averageRating != null && (
                            <span style={accentStyle}>{t('tasting.bowls', { n: form.averageRating })}</span>
                        )}
                    </div>
                    <ul className="myforminteraction__list" style={{ margin: 0, padding: 0 }}>
                        {metaRow(t('card.teaType'), teaTypeName(form.type, locale))}
                        {metaRow(t('tasting.country'), translateOption(form.country, locale))}
                        {metaRow(t('tasting.shop'), form.shop)}
                        {metaRow(t('tasting.weight'), form.weight != null ? `${form.weight} ${t('unit.gram')}` : null)}
                        {metaRow(t('tasting.water'), form.water)}
                        {metaRow(t('tasting.volume'), form.volume != null ? `${form.volume} ${t('unit.ml')}` : null)}
                        {metaRow(t('tasting.temperature'), form.temperature != null ? `${form.temperature} °C` : null)}
                        {metaRow(t('tasting.price'), form.price != null ? `${form.price} ₽` : null)}
                        {metaRow(t('tasting.teaware'), translateOption(form.teaware, locale))}
                        {metaRow(t('tasting.brewingMethod'), translateOption(form.brewingtype, locale))}
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
                                        <span style={accentStyle}>{t('tasting.steep', { n: brew.brewingCount })}</span>
                                        {brew.brewingRating != null && <span>{t('tasting.bowls', { n: brew.brewingRating })}</span>}
                                    </div>
                                    {brew.brewingTime && brew.brewingTime !== 'none' && brew.brewingTime !== '00:00:00' && (
                                        <div style={{ margin: '4px 0 0 0' }}>{t('tasting.steepTime')}: {brew.brewingTime}</div>
                                    )}
                                    {brew.description && brew.description !== 'none' && (
                                        <div style={{ margin: '4px 0 0 0', fontStyle: 'italic' }}>{brew.description}</div>
                                    )}
                                    {aromaPaths.length > 0 && (
                                        <div style={{ margin: '8px 0 0 0' }}>
                                            <span style={accentStyle}>{t('tasting.aroma')}</span><br />
                                            {aromaPaths.map((p, i) => <span key={`a-${i}`} style={chipStyle}>{translateDescriptorPath(p, locale)}</span>)}
                                        </div>
                                    )}
                                    {tastePaths.length > 0 && (
                                        <div style={{ margin: '8px 0 0 0' }}>
                                            <span style={accentStyle}>{t('tasting.taste')}</span><br />
                                            {tastePaths.map((p, i) => <span key={`t-${i}`} style={chipStyle}>{translateDescriptorPath(p, locale)}</span>)}
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                    <Link to={url('/blog')} style={{ color: '#d8f5cc', display: 'inline-block', marginTop: '10px' }}>{t('tasting.backToFeed')}</Link>
                </section>
            </div>
            <SiteFooter />
        </>
    );
}

export default PublicForm;
