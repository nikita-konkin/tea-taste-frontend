// What a tasting *claims about itself* to anything that is not a browser: the
// search result snippet, the chat preview, the schema.org block.
//
// ─────────────────────────────────────────────────────────────────────────────
// MIRRORED IN THE API at tea-taste-api/utils/formMeta.js. Change both.
//
// It cannot be one file: the frontend and the API are separate repositories
// with separate images, and sharing a module across them means publishing a
// package for eighty lines. The duplication is deliberate and narrow — only the
// derivation lives here, never the markup — because the two must agree. The
// crawler reads the API's copy and the reader's browser renders this one, and a
// page that describes itself differently to each is the definition of cloaking.
// ─────────────────────────────────────────────────────────────────────────────

import {
    translate, pluralize, DEFAULT_LOCALE, LOCALE_TAG,
} from '../i18n/index.js';
import { PLURALS } from '../i18n/messages.js';
import { teaTypeName } from './teaTypes.js';
import { translateOption } from '../i18n/options.js';

const ORIGIN = 'https://teaform.ru';

// A value the form left empty. 'none' is a real stored value here, not a bug —
// the wizard writes it for skipped fields.
const filled = (value) =>
    value !== undefined && value !== null && value !== '' && value !== 'none';

// What the page is actually about, in the order a reader would say it.
//
// The tea's name and the taster's own words stay exactly as written — only the
// scaffolding around them is translated. A description that translated the
// author's prose would be claiming they wrote something they did not.
export const formSummary = (form, brewings = [], locale = DEFAULT_LOCALE) => [
    teaTypeName(form.type, locale),
    translateOption(form.country, locale),
    form.averageRating != null
        ? translate('meta.rating', locale, { n: form.averageRating })
        : '',
    brewings.length
        ? `${brewings.length} ${pluralize(brewings.length, locale, PLURALS.steeps[locale] || PLURALS.steeps[DEFAULT_LOCALE])}`
        : '',
    (brewings.find((b) => filled(b.description)) || {}).description,
].filter(Boolean).join(' · ');

export const formDescription = (form, brewings = [], locale = DEFAULT_LOCALE) => {
    const summary = formSummary(form, brewings, locale);
    const head = translate('tasting.description', locale, { name: form.nameRU });
    return `${head}${summary ? `. ${summary}` : ''}`;
};

// Schema.org for the tasting itself. A dated, authored, rated write-up of a
// named product is a Review — the type search engines can actually show a
// rating for.
export const formJsonLd = (form, brewings = [], previewUrl, locale = DEFAULT_LOCALE) => {
    const author = Array.isArray(form.owner) ? form.owner[0] : form.owner;
    return {
        '@context': 'https://schema.org',
        '@type': 'Review',
        name: form.nameRU,
        datePublished: form.createdAt,
        inLanguage: LOCALE_TAG[locale],
        itemReviewed: {
            '@type': 'Product',
            name: form.nameRU,
            category: teaTypeName(form.type, locale) || form.type,
            ...(form.country ? { countryOfOrigin: translateOption(form.country, locale) } : {}),
        },
        ...(author ? { author: { '@type': 'Person', name: author.nickname || author.name } } : {}),
        ...(form.averageRating != null ? {
            reviewRating: {
                '@type': 'Rating',
                ratingValue: form.averageRating,
                bestRating: 10,
                worstRating: 1,
            },
        } : {}),
        ...(previewUrl ? { image: `${ORIGIN}${previewUrl}` } : {}),
    };
};
