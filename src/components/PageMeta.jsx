import { useEffect } from 'react';

const SITE = 'Форма чая';
const ORIGIN = 'https://teaform.ru';
const DEFAULT_IMAGE = `${ORIGIN}/logo512.png`;

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
function PageMeta({
    title, description, image, path, type = 'website', noIndex, jsonLd,
}) {
    const fullTitle = title ? `${title} — ${SITE}` : `${SITE} — дневник чайных дегустаций`;
    const text = clamp(description);
    const url = path ? `${ORIGIN}${path}` : ORIGIN;
    // A relative upload path (/api/uploads/...) has to become absolute: a chat
    // preview resolves og:image against nothing.
    const preview = image
        ? (image.startsWith('http') ? image : `${ORIGIN}${image}`)
        : DEFAULT_IMAGE;
    const schema = jsonLd ? JSON.stringify(jsonLd) : '';

    useEffect(() => {
        document.title = fullTitle;

        setTag('meta', { name: 'description', content: text }, 'name');
        setTag('meta', { property: 'og:type', content: type }, 'property');
        setTag('meta', { property: 'og:site_name', content: SITE }, 'property');
        setTag('meta', { property: 'og:locale', content: 'ru_RU' }, 'property');
        setTag('meta', { property: 'og:url', content: url }, 'property');
        setTag('meta', { property: 'og:title', content: fullTitle }, 'property');
        setTag('meta', { property: 'og:description', content: text }, 'property');
        setTag('meta', { property: 'og:image', content: preview }, 'property');
        setTag('meta', { name: 'twitter:card', content: 'summary_large_image' }, 'name');
        setTag('meta', { name: 'twitter:title', content: fullTitle }, 'name');
        setTag('meta', { name: 'twitter:description', content: text }, 'name');
        setTag('meta', { name: 'twitter:image', content: preview }, 'name');
        setTag('link', { rel: 'canonical', href: url }, 'rel');

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
    }, [fullTitle, text, url, preview, type, noIndex, schema]);

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
