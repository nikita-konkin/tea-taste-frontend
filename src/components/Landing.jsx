import React from 'react';
import { Link } from 'react-router-dom';
import Header from './Header.jsx';
import PageMeta from './PageMeta.jsx';
import SiteFooter from './SiteFooter.jsx';
import { teaTypeSlugs } from '../utils/teaTypes.js';

// The front page.
//
// `/` used to be <Navigate to="/blog" replace /> — a client-side redirect, so
// the site's most important URL had no HTML, no text and no links, and could
// not be followed by anything that does not run JavaScript. A visitor arriving
// from a search landed straight in a wall of tasting cards with no sentence
// saying what any of it was.
function Landing() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Форма чая',
        url: 'https://teaform.ru/',
        inLanguage: 'ru-RU',
        description: 'Дневник чайных дегустаций',
        publisher: {
            '@type': 'Organization',
            name: 'Форма чая',
            url: 'https://teaform.ru/',
            logo: 'https://teaform.ru/logo512.png',
        },
    };

    return (
        <>
            <PageMeta
                path="/"
                description="Дневник чайных дегустаций: аромат, вкус и проливы, фото и голосовые заметки. Ведите свои записи и читайте дегустации других."
                jsonLd={jsonLd}
            />
            <Header />
            <div className="myforms">
                <section className="landing">
                    <h1 className="landing__title">Форма чая — дневник чайных дегустаций</h1>
                    <p className="landing__lead">
                        Записывайте, как заварился чай: аромат и вкус по проливам, температура,
                        посуда и время, фотографии сухого листа, настоя и мокрого листа.
                        Надиктуйте заметку голосом — расшифровка и разбор по полям сделаются сами.
                    </p>

                    <div className="landing__actions">
                        <Link className="landing__cta" to="/blog">Читать дегустации</Link>
                        <Link className="landing__cta landing__cta_ghost" to="/sign-up">Завести свой дневник</Link>
                    </div>

                    <h2 className="landing__subtitle">Как это устроено</h2>
                    <ol className="landing__steps">
                        <li>Заводите форму на чай: название, тип, страна, вес, вода и посуда.</li>
                        <li>Описываете каждый пролив — время, оценка, аромат и вкус по трём уровням.</li>
                        <li>Прикладываете фотографии и голосовую заметку.</li>
                        <li>Публикуете, если хотите, чтобы дегустацию прочитали другие.</li>
                    </ol>

                    <h2 className="landing__subtitle">Дегустации по типу чая</h2>
                    <ul className="landing__types">
                        {teaTypeSlugs.map(({ slug, short }) => (
                            <li key={slug}>
                                <Link className="landing__type" to={`/blog/type/${slug}`}>{short}</Link>
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
