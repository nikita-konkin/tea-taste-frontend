import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LOCALES, LOCALE_NAME, LOCALE_TAG, localeFromPath, localizePath, useT,
} from '../i18n/index.js';

// Language switcher.
//
// Real <a href>s to the same page in each language, not a dropdown that sets
// state: the alternates are exactly the URLs declared in hreflang, so a crawler
// following them lands where the metadata promised, and a reader can copy the
// link to the page they are actually reading.
//
// `replace` keeps the back button meaningful — switching language is changing
// how you read this page, not navigating to a new one.
//
// Two shapes for two places. `inline` is the footer: small text links on one
// row. `block` is the profile, where this is a setting rather than a footer
// afterthought — full-width rows with a 44px target and the current language
// marked, matching the other blocks on that page.
//
// `onSelect` is what separates the two: the profile passes a handler that saves
// the choice to the account, the footer passes nothing. A footer switcher is
// "show me this page in English" — a one-off, and silently rewriting someone's
// account because they wanted to read one tasting would be a surprise. The
// profile control is the deliberate one, so that is the one that persists.
function LocaleSwitcher({ variant = 'inline', onSelect }) {
    const { pathname, search } = useLocation();
    const current = localeFromPath(pathname);
    const { t } = useT();
    const base = `localeswitcher localeswitcher_${variant}`;

    return (
        <nav className={base} aria-label={t('nav.language')}>
            {LOCALES.map((locale) => (locale === current ? (
                <span key={locale} className="localeswitcher__current" aria-current="true">
                    {LOCALE_NAME[locale]}
                </span>
            ) : (
                <Link
                    key={locale}
                    className="localeswitcher__link"
                    to={`${localizePath(pathname, locale)}${search}`}
                    hrefLang={LOCALE_TAG[locale]}
                    onClick={onSelect ? () => onSelect(locale) : undefined}
                    // The click saves and navigates at once, and the page it
                    // lands on re-reads the profile — so tell that page what
                    // was just chosen rather than let it race the write.
                    state={onSelect ? { language: locale } : undefined}
                    replace
                >
                    {LOCALE_NAME[locale]}
                </Link>
            )))}
        </nav>
    );
}

export default LocaleSwitcher;
