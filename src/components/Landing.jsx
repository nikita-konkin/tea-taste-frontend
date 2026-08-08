import React from 'react';
import { Link } from 'react-router-dom';
import Header from './Header.jsx';
import PageMeta from './PageMeta.jsx';
import SiteFooter from './SiteFooter.jsx';
import { teaTypeSlugs, teaTypeShort } from '../utils/teaTypes.js';
import { useT, LOCALE_TAG } from '../i18n/index.js';

// The front page.
//
// `/` used to be <Navigate to="/blog" replace /> — a client-side redirect, so
// the site's most important URL had no HTML, no text and no links, and could
// not be followed by anything that does not run JavaScript. A visitor arriving
// from a search landed straight in a wall of tasting cards with no sentence
// saying what any of it was.
function Landing() {
    const { t, url, locale } = useT();

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: t('site.name'),
        url: 'https://teaform.ru/',
        inLanguage: LOCALE_TAG[locale],
        description: t('site.tagline'),
        publisher: {
            '@type': 'Organization',
            name: t('site.name'),
            url: 'https://teaform.ru/',
            logo: 'https://teaform.ru/logo512.png',
        },
    };

    return (
        <>
            <PageMeta path="/" description={t('landing.description')} jsonLd={jsonLd} />
            <Header />
            <div className="myforms">
                <section className="landing">
                    <h1 className="landing__title">{t('landing.title')}</h1>
                    <p className="landing__lead">{t('landing.lead')}</p>

                    <div className="landing__actions">
                        <Link className="landing__cta" to={url('/blog')}>{t('landing.readTastings')}</Link>
                        <Link className="landing__cta landing__cta_ghost" to={url('/sign-up')}>
                            {t('landing.startDiary')}
                        </Link>
                    </div>

                    <h2 className="landing__subtitle">{t('landing.howItWorks')}</h2>
                    <ol className="landing__steps">
                        <li>{t('landing.step1')}</li>
                        <li>{t('landing.step2')}</li>
                        <li>{t('landing.step3')}</li>
                        <li>{t('landing.step4')}</li>
                    </ol>

                    <h2 className="landing__subtitle">{t('landing.byType')}</h2>
                    <ul className="landing__types">
                        {teaTypeSlugs.map((type) => (
                            <li key={type.slug}>
                                <Link className="landing__type" to={url(`/blog/type/${type.slug}`)}>
                                    {teaTypeShort(type, locale)}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
            <SiteFooter />
        </>
    );
}

export default Landing;
