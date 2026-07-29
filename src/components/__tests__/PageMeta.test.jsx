/* Per-page metadata. Every URL used to report the same title and the same logo,
   so a tasting shared to Telegram or VK said nothing about what was behind it.

   A warning about what this file can prove. These assertions passed for the
   whole time the metadata was reaching no browser at all: under react-helmet,
   jsdom was updated and a real React 18 page was not. Green here means the
   component asks for the right tags — confirm the built app writes them by
   opening it:

     docker compose up -d --build   # in sandbox/
     # then, on /blog/<slug>:  document.querySelector('link[rel=canonical]')

   which is in DEPLOY-SEO.md as a release check. */
import React from 'react';
import { render, waitFor } from '@testing-library/react';
import PageMeta, { clamp } from '../PageMeta.jsx';
import { plural } from '../../utils/utils.js';

const head = (selector) => document.head.querySelector(selector);
const content = (selector) => (head(selector) || {}).content;

const renderMeta = (ui) => render(ui);

test('a tasting gets its own title, description, canonical and preview image', async () => {
    renderMeta(
        <PageMeta
            title="Шэн пуэр 2019"
            description="Дегустация чая «Шэн пуэр 2019». Шэн пуэр · Китай · оценка 8/10"
            image="/api/uploads/abc-123.jpg"
            path="/blog/xyz"
            type="article"
        />,
    );

    await waitFor(() => expect(document.title).toBe('Шэн пуэр 2019 — Форма чая'));
    expect(content('meta[property="og:title"]')).toBe('Шэн пуэр 2019 — Форма чая');
    expect(content('meta[property="og:type"]')).toBe('article');
    expect(content('meta[name="description"]')).toContain('Шэн пуэр · Китай');
    expect(head('link[rel="canonical"]').href).toBe('https://teaform.ru/blog/xyz');
});

// A chat preview resolves og:image against nothing, so a stored upload path has
// to leave here absolute.
test('makes an upload path absolute for the preview image', async () => {
    renderMeta(<PageMeta title="Чай" image="/api/uploads/abc-123.jpg" path="/blog/xyz" />);

    await waitFor(() => expect(content('meta[property="og:image"]'))
        .toBe('https://teaform.ru/api/uploads/abc-123.jpg'));
});

test('falls back to the site logo when a tasting has no photo', async () => {
    renderMeta(<PageMeta title="Без фото" path="/blog/xyz" />);

    await waitFor(() => expect(content('meta[property="og:image"]'))
        .toBe('https://teaform.ru/logo512.png'));
});

// Schema goes through this component rather than a Helmet of its own: two
// mounted instances left the static index.html tags winning for description and
// og:*, so a tasting page shipped the site's default preview.
test('carries the page\'s schema markup in the same head block', async () => {
    renderMeta(
        <PageMeta
            title="Шэн пуэр 2019"
            description="Дегустация"
            path="/blog/xyz"
            jsonLd={{ '@context': 'https://schema.org', '@type': 'Review', name: 'Шэн пуэр 2019' }}
        />,
    );

    await waitFor(() => expect(document.title).toBe('Шэн пуэр 2019 — Форма чая'));
    const scripts = [...document.head.querySelectorAll('script[type="application/ld+json"]')];
    const parsed = scripts.map((s) => JSON.parse(s.textContent));
    expect(parsed.some((j) => j['@type'] === 'Review')).toBe(true);
    // The page's own description survives alongside it.
    expect(content('meta[name="description"]')).toBe('Дегустация');
});

test('private pages ask not to be indexed', async () => {
    renderMeta(<PageMeta title="Мои дегустации" path="/my_forms" noIndex />);

    await waitFor(() => expect(content('meta[name="robots"]')).toBe('noindex, nofollow'));
});

describe('Russian plural agreement in generated descriptions', () => {
    test('agrees with the count', () => {
        const forms = ['пролив', 'пролива', 'проливов'];
        expect(plural(1, forms)).toBe('пролив');
        expect(plural(2, forms)).toBe('пролива');
        expect(plural(5, forms)).toBe('проливов');
        // The teens are the trap: 11-14 take the last form whatever they end in.
        expect(plural(11, forms)).toBe('проливов');
        expect(plural(12, forms)).toBe('проливов');
        expect(plural(21, forms)).toBe('пролив');
        expect(plural(22, forms)).toBe('пролива');
    });
});

describe('description clamping', () => {
    test('keeps a short description as it is', () => {
        expect(clamp('Короткое описание')).toBe('Короткое описание');
    });

    test('cuts a long one on a word boundary', () => {
        const long = `${'слово '.repeat(60)}конец`;
        const out = clamp(long);
        expect(out.length).toBeLessThanOrEqual(161);
        expect(out.endsWith('…')).toBe(true);
        expect(out).not.toMatch(/сло…$/);
    });
});
