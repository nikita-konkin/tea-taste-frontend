import React from 'react';
import { Link } from 'react-router-dom';
import { teaTypeSlugs, teaTypeShort } from '../utils/teaTypes.js';
import { useT } from '../i18n/index.js';
import LocaleSwitcher from './LocaleSwitcher.jsx';

// The site's public link graph, present on every page a signed-out visitor can
// reach.
//
// The side menu was the only place with real <NavLink>s, and it is unmounted
// until someone taps the hamburger — so nothing reading the HTML ever saw a
// link, and almost everything in it is a signed-in page that robots.txt
// disallows anyway. This carries the links that are actually public, always
// rendered, in the markup.
//
// Every `to` goes through `url()` so it keeps the reader's language: a link
// that dropped the prefix would silently send an English reader back to the
// Russian site.
function SiteFooter() {
    const { t, url, locale } = useT();

    return (
        <footer className="sitefooter">
            <nav className="sitefooter__section" aria-label={t('footer.sections')}>
                <span className="sitefooter__title">{t('site.name')}</span>
                <Link className="sitefooter__link" to={url('/')}>{t('footer.about')}</Link>
                <Link className="sitefooter__link" to={url('/blog')}>{t('footer.feed')}</Link>
                <Link className="sitefooter__link" to={url('/sign-up')}>{t('footer.signup')}</Link>
            </nav>

            <nav className="sitefooter__section" aria-label={t('footer.byType')}>
                <span className="sitefooter__title">{t('footer.teaTypes')}</span>
                <ul className="sitefooter__types">
                    {teaTypeSlugs.map((type) => (
                        <li key={type.slug}>
                            <Link className="sitefooter__link" to={url(`/blog/type/${type.slug}`)}>
                                {teaTypeShort(type, locale)}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="sitefooter__section">
                <span className="sitefooter__title">{t('nav.language')}</span>
                <LocaleSwitcher />
            </div>
        </footer>
    );
}

export default SiteFooter;
