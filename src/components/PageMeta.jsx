import React from 'react';
import { Helmet } from 'react-helmet';

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

// Per-page title, description, canonical and preview image.
//
// Without this every URL — including every shared tasting — reported the same
// title and the same logo, so a link posted to Telegram or VK said nothing
// about what was behind it, and search engines saw one page repeated.
//
// The app is client-rendered, so this is set after the JS runs: Google renders
// and picks it up, Yandex is less reliable at that, and neither sees it in the
// raw HTML. Prerendering the public routes is the fix for that, and it is
// listed in the audit — this component is what makes prerendering worth doing.
// jsonLd is a prop rather than a second <Helmet> next to this one: with two
// instances mounted, react-helmet kept the title from ours and let the static
// tags in index.html win for description and og:*, so a tasting page shipped the
// site's default preview. One Helmet per page is the rule that avoids it.
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

    return (
        <Helmet>
            <title>{fullTitle}</title>
            {text && <meta name="description" content={text} />}
            <link rel="canonical" href={url} />
            {noIndex && <meta name="robots" content="noindex, nofollow" />}

            <meta property="og:type" content={type} />
            <meta property="og:site_name" content={SITE} />
            <meta property="og:locale" content="ru_RU" />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={fullTitle} />
            {text && <meta property="og:description" content={text} />}
            <meta property="og:image" content={preview} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            {text && <meta name="twitter:description" content={text} />}
            <meta name="twitter:image" content={preview} />

            {jsonLd && (
                <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            )}
        </Helmet>
    );
}

export { clamp };
export default PageMeta;
