import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
    LOCALES, LOCALE_TAG, DEFAULT_LOCALE, localeFromPath, localizePath, translate,
} from '../i18n/index.js';

const ORIGIN = 'https://teaform.ru';
const DEFAULT_IMAGE = `${ORIGIN}/logo512.png`;

// Open Graph wants a language_TERRITORY pair, not a bare tag.
const OG_LOCALE = { ru: 'ru_RU', en: 'en_US', zh: 'zh_CN' };

// Trims a description to something a search result or a chat preview will
// actually show, without cutting a word in half.
const clamp = (text, max = 160) => {
    const clean = String(text || '').replace(/\s+/g, ' ').trim();
    if (clean.length <= max) return clean;
    const cut = clean.slice(0, max);
    return `${cut.slice(0, cut.lastIndexOf(' ')) || cut}…`;
};

// Marks the tags this component created, so they can be cleaned up on
// navigation without touching the defaults that shipped in index.html.
const OWNED = 'data-pagemeta';

// Writes one tag, reusing the matching default from index.html when there is
// one. Reuse rather than append is the whole point: a second <meta
// name="description"> does not replace the first, and the first is what a
// crawler and a chat preview read.
const setTag = (tagName, attrs, keyAttr) => {
    const selector = `${tagName}[${keyAttr}="${attrs[keyAttr]}"]`;
    let el = document.head.querySelector(selector);
    if (!el) {
        el = document.createElement(tagName);
        el.setAttribute(OWNED, '');
        document.head.appendChild(el);
    }
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    return el;
};

const removeTag = (selector) => {
    const el = document.head.querySelector(selector);
    if (el) el.remove();
};

// Per-page title, description, canonical and preview image.
//
// Without this every URL — including every shared tasting — reported the same
// title and the same logo, so a link posted to Telegram or VK said nothing
// about what was behind it, and search engines saw one page repeated.
//
// Written straight to document.head rather than through a helmet library.
// react-helmet and react-helmet-async were both tried here and both silently
// wrote nothing under React 18's createRoot in the production build — no error,
// no tag, and a jsdom unit test that passed the whole time. Forty lines that
// can be read top to bottom beat a dependency that fails quietly. The trade is
// that this only runs after the JS does, which is exactly why the crawler HTML
// is server-rendered instead (see the API's controllers/render.js).
//
// The app is client-rendered, so this is what a browser and Google's renderer
// see; Yandex reads the server-rendered copy.
// `path` is the BARE route ('/blog', '/blog/type/puer') — the locale prefix is
// added here, so no caller has to remember it and the alternates below are
// always the same page in each language.
function PageMeta({
    title, description, image, path, type = 'website', noIndex, jsonLd,
}) {
    const { pathname } = useLocation();
    const locale = localeFromPath(pathname);
    const site = translate('site.name', locale);
    const fullTitle = title
        ? `${title} — ${site}`
        : `${site} — ${translate('site.tagline', locale)}`;
    const text = clamp(description);
    const bare = path || '/';
    const url = `${ORIGIN}${localizePath(bare, locale)}`;
    // A relative upload path (/api/uploads/...) has to become absolute: a chat
    // preview resolves og:image against nothing.
    const preview = image
        ? (image.startsWith('http') ? image : `${ORIGIN}${image}`)
        : DEFAULT_IMAGE;
    const schema = jsonLd ? JSON.stringify(jsonLd) : '';

    useEffect(() => {
        document.title = fullTitle;

        // The page's language, for a screen reader as much as for a crawler:
        // the whole document changes language, not a fragment of it.
        document.documentElement.setAttribute('lang', LOCALE_TAG[locale]);

        setTag('meta', { name: 'description', content: text }, 'name');
        setTag('meta', { property: 'og:type', content: type }, 'property');
        setTag('meta', { property: 'og:site_name', content: site }, 'property');
        setTag('meta', { property: 'og:locale', content: OG_LOCALE[locale] }, 'property');
        setTag('meta', { property: 'og:url', content: url }, 'property');
        setTag('meta', { property: 'og:title', content: fullTitle }, 'property');
        setTag('meta', { property: 'og:description', content: text }, 'property');
        setTag('meta', { property: 'og:image', content: preview }, 'property');
        setTag('meta', { name: 'twitter:card', content: 'summary_large_image' }, 'name');
        setTag('meta', { name: 'twitter:title', content: fullTitle }, 'name');
        setTag('meta', { name: 'twitter:description', content: text }, 'name');
        setTag('meta', { name: 'twitter:image', content: preview }, 'name');
        setTag('link', { rel: 'canonical', href: url }, 'rel');

        // hreflang: the same page in each language, pointing at each other.
        //
        // Without these, three translations of one page look to a search engine
        // like three competing pages, and it picks one — usually not the one
        // matching the reader. x-default names the version to serve when none
        // of the languages matches, which is the Russian original.
        //
        // Rebuilt from scratch each time rather than rewritten in place: the
        // previous page's alternates point at the previous page.
        document.head
            .querySelectorAll(`link[${OWNED}][rel="alternate"]`)
            .forEach((el) => el.remove());
        if (!noIndex) {
            const alternate = (hreflang, href) => {
                const el = document.createElement('link');
                el.setAttribute(OWNED, '');
                el.setAttribute('rel', 'alternate');
                el.setAttribute('hreflang', hreflang);
                el.setAttribute('href', href);
                document.head.appendChild(el);
            };
            LOCALES.forEach((l) => alternate(LOCALE_TAG[l], `${ORIGIN}${localizePath(bare, l)}`));
            alternate('x-default', `${ORIGIN}${localizePath(bare, DEFAULT_LOCALE)}`);
        }

        // Only ever present on the pages that ask for it, so it is added and
        // removed rather than rewritten — a stale noindex left behind on the
        // feed would quietly drop the whole site out of the index.
        if (noIndex) {
            setTag('meta', { name: 'robots', content: 'noindex, nofollow' }, 'name');
        } else {
            removeTag('meta[name="robots"]');
        }

        // The page's own schema, replacing whatever the last page left. The
        // WebSite block in index.html is not marked as ours and stays put: it
        // describes the site, not the page.
        removeTag(`script[${OWNED}][type="application/ld+json"]`);
        if (schema) {
            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.setAttribute(OWNED, '');
            script.textContent = schema;
            document.head.appendChild(script);
        }
    }, [fullTitle, text, url, preview, type, noIndex, schema, locale, site, bare]);

    // Cleanup runs only on unmount: on a normal navigation the next page's
    // effect has already overwritten these, and removing them afterwards would
    // strip the metadata it just set.
    useEffect(() => () => {
        removeTag(`script[${OWNED}][type="application/ld+json"]`);
        removeTag('meta[name="robots"]');
    }, []);

    return null;
}

export { clamp };
export default PageMeta;
