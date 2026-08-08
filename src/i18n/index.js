import { useLocation, useNavigate } from 'react-router-dom';
import messages from './messages.js';

// Three languages, Russian at the root.
//
// The locale lives in the URL path (/en/blog, /zh/blog) rather than in a cookie
// or in state, because a language that has no address of its own cannot be
// linked to, shared, or indexed — the same reason the feed's filters moved into
// the URL. Russian keeps the bare paths: it is the original content, the bulk of
// what is published, and moving it to /ru/ would break every link already out
// there.
export const LOCALES = ['ru', 'en', 'zh'];
export const DEFAULT_LOCALE = 'ru';

// Path prefix per locale — '' for the default. Also the order the switcher
// renders in.
export const LOCALE_PREFIX = { ru: '', en: '/en', zh: '/zh' };

// What each language calls itself. Never translated: a reader looking for their
// own language scans for the word they recognise.
export const LOCALE_NAME = { ru: 'Русский', en: 'English', zh: '中文' };

// `lang` and `hreflang` attribute values. zh-Hans, not bare zh: the site is
// Simplified, and saying so lets a search engine serve it to the right readers
// (and not to Traditional-script ones).
export const LOCALE_TAG = { ru: 'ru', en: 'en', zh: 'zh-Hans' };

// The locale a path is written in, from its first segment.
export const localeFromPath = (pathname) => {
    const first = String(pathname || '').split('/')[1];
    return LOCALES.find((l) => l !== DEFAULT_LOCALE && l === first) || DEFAULT_LOCALE;
};

// The same path with the locale prefix stripped — the "logical" route, which is
// what the alternates and the language switcher are built from.
export const stripLocale = (pathname) => {
    const locale = localeFromPath(pathname);
    if (locale === DEFAULT_LOCALE) return pathname || '/';
    const rest = pathname.slice(LOCALE_PREFIX[locale].length);
    return rest || '/';
};

// A bare route path rendered in one locale. '/' stays '/en' rather than '/en/',
// so a page never has two addresses differing only by a trailing slash.
export const localizePath = (pathname, locale) => {
    const bare = stripLocale(pathname);
    const prefix = LOCALE_PREFIX[locale] || '';
    if (bare === '/') return prefix || '/';
    return `${prefix}${bare}`;
};

export const useLocale = () => localeFromPath(useLocation().pathname);

// Translate a key. Falls back through English to the key itself, so a missing
// entry shows readable text rather than a blank or a crash — and stands out in
// review as an untranslated string.
export const translate = (key, locale, vars) => {
    const table = messages[locale] || messages[DEFAULT_LOCALE];
    let text = table[key];
    if (text === undefined) text = messages[DEFAULT_LOCALE][key];
    if (text === undefined) return key;
    if (!vars) return text;
    return Object.entries(vars).reduce(
        (acc, [k, v]) => acc.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v)),
        text,
    );
};

// The same lookup for code that has no component around it: the API client and
// the recorder both throw Errors whose message the user reads, and neither has a
// hook to call or a locale to be handed. The address bar is asked directly —
// that is where the locale lives anyway, and these are thrown mid-interaction,
// on the page the reader is looking at.
export const translateHere = (key, vars) => translate(
    key,
    localeFromPath(typeof window === 'undefined' ? '' : window.location.pathname),
    vars,
);

// The hook every component uses: `const { t, locale, url } = useT();`
//
// `url` is here rather than imported separately because every internal link has
// to carry the current locale — a link that drops it silently sends an English
// reader back to the Russian site.
export const useT = () => {
    const locale = useLocale();
    return {
        locale,
        t: (key, vars) => translate(key, locale, vars),
        url: (path) => localizePath(path, locale),
    };
};

// navigate(), with the current language kept.
//
// The counterpart to `url` for code that moves the user rather than links them:
// `navigate('/form_2')` is a Russian address, so an English reader finishing
// stage 1 of the wizard would land back on the Russian site mid-form. Anything
// that is not a plain internal path — a number like navigate(-1), an absolute
// URL, an options object — is passed straight through untouched.
export const useLocalizedNavigate = () => {
    const navigate = useNavigate();
    const locale = useLocale();
    return (to, options) => {
        if (typeof to !== 'string' || !to.startsWith('/')) return navigate(to, options);
        const cut = to.search(/[?#]/);
        const path = cut === -1 ? to : to.slice(0, cut);
        const rest = cut === -1 ? '' : to.slice(cut);
        return navigate(`${localizePath(path, locale)}${rest}`, options);
    };
};

// Russian plural agreement: 1 пролив, 2 пролива, 5 проливов; 11-14 take the
// last form whatever they end in. English and Chinese take the simple branch —
// Chinese has no plural inflection at all, so `one` is used for every count.
export const pluralize = (count, locale, forms) => {
    if (locale === 'zh') return forms.one;
    if (locale === 'en') return count === 1 ? forms.one : forms.many;
    const n = Math.abs(Math.round(Number(count) || 0)) % 100;
    if (n >= 11 && n <= 14) return forms.many;
    const last = n % 10;
    if (last === 1) return forms.one;
    if (last >= 2 && last <= 4) return forms.few;
    return forms.many;
};
