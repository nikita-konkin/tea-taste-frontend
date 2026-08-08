/* Three languages, Russian at the root.
   What matters here is not that the words are right — a human reads those — but
   that the machinery around them is: the locale comes from the URL, links keep
   it, the hreflang alternates point at the same page in each language, and a
   stored descriptor still resolves when nothing translates it. */
import fs from 'fs';
import path from 'path';
import React from 'react';
import { render, waitFor, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import {
    LOCALES, LOCALE_TAG, LOCALE_NAME, localeFromPath, stripLocale, localizePath, translate, pluralize,
} from '../../i18n/index.js';
import messages, { PLURALS } from '../../i18n/messages.js';
import DESCRIPTORS, { translateDescriptor, translateDescriptorPath } from '../../i18n/descriptors.js';
import { translateOption, optionLabel, canonicalOption } from '../../i18n/options.js';
import { teaTypeName, teaTypeSlugs } from '../../utils/teaTypes.js';
import PageMeta from '../PageMeta.jsx';
import SiteFooter from '../SiteFooter.jsx';
import { FIELDS } from '../VoiceExtract.jsx';
import { PHOTO_SLOTS } from '../TeaPhotos.jsx';
import Profile from '../Profile.jsx';
import DescriptorPicker from '../DescriptorPicker.jsx';

// Profile is rendered here for its language block; the network and the popup
// portal are not what these tests are about. `mock` prefix so jest's hoisted
// factory is allowed to close over it.
const mockSaved = [];
jest.mock('../../utils/MainAPI.jsx', () => ({
    mainApi: {
        getProfile: () => Promise.resolve({
            // No `language`: an account that predates the setting, which is
            // every existing one.
            data: { name: 'Ли', nickname: '', email: 'a@b.c', career: '', about: '', role: 'user' },
            voiceQuota: {
                usedSeconds: 60, limitSeconds: 1800, leftSeconds: 1740, maxTrackSeconds: 120,
            },
        }),
        updateProfile: (body) => { mockSaved.push(body); return Promise.resolve({ data: {} }); },
    },
}));
jest.mock('../PopupContext.jsx', () => ({ usePopup: () => ({ openPopup: () => {} }) }));

// Whole-tree invariants. These lived in throwaway scripts while the
// translation was being written, which is why they stopped being run the
// moment the scripts were deleted — and why a page could go untranslated
// without anything noticing. They belong here.
describe('the catalogue and the components agree', () => {
    const SRC = path.join(__dirname, '..', '..');
    const sources = (function walk(dir) {
        return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) return entry.name === '__tests__' ? [] : walk(full);
            return /\.jsx?$/.test(entry.name) ? [full] : [];
        });
    }(SRC)).filter((f) => !f.includes(`${path.sep}i18n${path.sep}`))
        .map((f) => ({ file: path.relative(SRC, f), text: fs.readFileSync(f, 'utf8') }));

    // Both call forms: `t()` inside a component, and `translateHere()` in the
    // API client and the recorder, which have no hook to read the URL through.
    test('every key a component asks for is defined', () => {
        const used = new Set();
        sources.forEach(({ text }) => {
            [...text.matchAll(/\bt(?:ranslateHere)?\(\s*'([^']+)'/g)].forEach((m) => used.add(m[1]));
        });
        expect(used.size).toBeGreaterThan(150);
        expect([...used].filter((k) => messages.ru[k] === undefined)).toEqual([]);
    });

    // Two tables hold message keys instead of text, so their component reads
    // them through a variable — `t(labelKey)`, which the scan above cannot see.
    // A typo in either would render the key itself and no test would notice.
    test('the tables that store keys instead of text name real keys', () => {
        const indirect = [
            ...FIELDS.map(([, key]) => key),
            ...PHOTO_SLOTS.map((slot) => slot.label),
        ];
        expect(indirect.length).toBeGreaterThan(13);
        expect(indirect.filter((k) => messages.ru[k] === undefined)).toEqual([]);
    });

    // t() without the hook is a ReferenceError on a page nobody opened yet.
    test('every component that calls t() or url() has the hook', () => {
        const missing = sources
            .filter(({ text }) => /[^.\w]t\(\s*'/.test(text) || /[^.\w]url\(\s*'/.test(text))
            .filter(({ text }) => !/useT\(\)/.test(text))
            .map(({ file }) => file);
        expect(missing).toEqual([]);
    });
});

describe('locale from the URL', () => {
    test('the first segment decides, and Russian is the bare path', () => {
        expect(localeFromPath('/blog')).toBe('ru');
        expect(localeFromPath('/en/blog')).toBe('en');
        expect(localeFromPath('/zh/blog/da-hun-pao-33f8fa179c')).toBe('zh');
        expect(localeFromPath('/')).toBe('ru');
    });

    // A tea named "en-shi-yu-lu" must not be read as an English page.
    test('a locale is only a locale as the first segment', () => {
        expect(localeFromPath('/blog/en')).toBe('ru');
        expect(localeFromPath('/blog/zh-cha-9e1c4f')).toBe('ru');
    });

    test('stripping and re-adding a prefix round-trips', () => {
        for (const path of ['/', '/blog', '/blog/type/puer', '/blog/da-hun-pao-33f8']) {
            for (const locale of LOCALES) {
                expect(stripLocale(localizePath(path, locale))).toBe(path);
            }
        }
    });

    // '/en/' and '/en' would be two addresses for one page.
    test('the root under a prefix has no trailing slash', () => {
        expect(localizePath('/', 'en')).toBe('/en');
        expect(localizePath('/', 'zh')).toBe('/zh');
        expect(localizePath('/', 'ru')).toBe('/');
    });
});

describe('message catalogue', () => {
    test('English and Chinese cover every Russian key', () => {
        const missing = { en: [], zh: [] };
        for (const key of Object.keys(messages.ru)) {
            for (const locale of ['en', 'zh']) {
                if (messages[locale][key] === undefined) missing[locale].push(key);
            }
        }
        expect(missing).toEqual({ en: [], zh: [] });
    });

    test('no language has keys the others do not', () => {
        const ru = Object.keys(messages.ru).sort();
        expect(Object.keys(messages.en).sort()).toEqual(ru);
        expect(Object.keys(messages.zh).sort()).toEqual(ru);
    });

    // A placeholder that survives into the page reads as a bug to the visitor.
    test('placeholders match across languages', () => {
        const vars = (s) => (String(s).match(/\{(\w+)\}/g) || []).sort().join(',');
        for (const key of Object.keys(messages.ru)) {
            expect(`${key}:${vars(messages.en[key])}`).toBe(`${key}:${vars(messages.ru[key])}`);
            expect(`${key}:${vars(messages.zh[key])}`).toBe(`${key}:${vars(messages.ru[key])}`);
        }
    });

    test('substitutes values and leaves an unknown key readable', () => {
        expect(translate('feed.pageOf', 'en', { page: 2, pages: 5 })).toBe('Page 2 of 5');
        expect(translate('feed.pageOf', 'zh', { page: 2, pages: 5 })).toContain('2');
        expect(translate('no.such.key', 'en')).toBe('no.such.key');
    });

    test('a missing translation falls back to Russian rather than blank', () => {
        expect(translate('feed.title', 'de')).toBe(messages.ru['feed.title']);
    });
});

describe('plural agreement', () => {
    test('Russian keeps its three forms, including the 11-14 trap', () => {
        const f = PLURALS.steeps.ru;
        expect(pluralize(1, 'ru', f)).toBe('пролив');
        expect(pluralize(2, 'ru', f)).toBe('пролива');
        expect(pluralize(5, 'ru', f)).toBe('проливов');
        expect(pluralize(11, 'ru', f)).toBe('проливов');
        expect(pluralize(21, 'ru', f)).toBe('пролив');
    });

    test('English takes two forms and Chinese one', () => {
        expect(pluralize(1, 'en', PLURALS.steeps.en)).toBe('steep');
        expect(pluralize(5, 'en', PLURALS.steeps.en)).toBe('steeps');
        expect(pluralize(1, 'zh', PLURALS.steeps.zh)).toBe('泡');
        expect(pluralize(9, 'zh', PLURALS.steeps.zh)).toBe('泡');
    });
});

describe('descriptors', () => {
    test('every entry has both languages and no empty string', () => {
        for (const [term, tr] of Object.entries(DESCRIPTORS)) {
            expect(`${term}.en`).toBe(tr.en ? `${term}.en` : `${term}.MISSING-en`);
            expect(`${term}.zh`).toBe(tr.zh ? `${term}.zh` : `${term}.MISSING-zh`);
        }
    });

    test('translates a term and a whole path', () => {
        expect(translateDescriptor('Цветочный', 'en')).toBe('Floral');
        expect(translateDescriptor('Цветочный', 'zh')).toBe('花香');
        expect(translateDescriptorPath('Цветочный → Жасмин', 'en')).toBe('Floral → Jasmine');
        expect(translateDescriptorPath('Цветочный → Жасмин', 'zh')).toBe('花香 → 茉莉');
    });

    // The Russian string is the stored value. A descriptor added to the seeder
    // and not yet translated must still render, not disappear.
    test('an untranslated term falls back to the stored Russian', () => {
        expect(translateDescriptor('Совершенно новый дескриптор', 'en'))
            .toBe('Совершенно новый дескриптор');
        expect(translateDescriptorPath('Цветочный → Небывалый', 'en'))
            .toBe('Floral → Небывалый');
    });

    test('Russian is returned untouched without a lookup', () => {
        expect(translateDescriptor('Цветочный', 'ru')).toBe('Цветочный');
    });
});

describe('wizard option values', () => {
    test('countries, teaware and brewing methods translate', () => {
        expect(translateOption('Китай', 'en')).toBe('China');
        expect(translateOption('Китай', 'zh')).toBe('中国');
        expect(translateOption('Гайвань', 'en')).toBe('Gaiwan');
        expect(translateOption('Гайвань', 'zh')).toBe('盖碗');
        expect(translateOption('Проливы (по-китайски)', 'en')).toBe('Short steeps (gongfu)');
    });

    // Deliberate: someone reading in English who wants that water has to search
    // for the name on the bottle, and "Arkhyz Spring Water" is not a name any
    // shop lists. Same for the tea shops.
    test('water and shop brand names are left alone', () => {
        for (const brand of ['Архыз', 'Святой Источник', 'Мойчай.ру', 'Чайный квадрат (Йошкар-Ола)']) {
            expect(translateOption(brand, 'en')).toBe(brand);
            expect(translateOption(brand, 'zh')).toBe(brand);
        }
    });

    test('anything a user typed themselves survives untouched', () => {
        expect(translateOption('моя любимая кружка', 'en')).toBe('моя любимая кружка');
        expect(translateOption('Родниковая', 'zh')).toBe('Родниковая');
    });

    // The free-text fields store the picked string itself, so a display label
    // has to map back to the Russian key or the stored data stops matching
    // every other language's lookup.
    // Both shapes: the wizard hands optionLabel an option object, the edit dialog
    // a bare string. The string branch used to skip the tea-type lookup, so an
    // English edit dialog showed the stored Russian label for that one field.
    test('display and storage round-trip in both directions', () => {
        for (const locale of ['en', 'zh']) {
            for (const stored of ['Китай', 'Гайвань', 'Проливы (по-китайски)', 'Улун (乌龙茶 - Wūlóng chá)']) {
                for (const option of [{ label: stored }, stored]) {
                    const shown = optionLabel(option, locale);
                    expect(`${stored}: ${shown}`).not.toBe(`${stored}: ${stored}`);
                    expect(canonicalOption(shown, locale)).toBe(stored);
                }
            }
        }
    });

    test('a freely typed value round-trips as itself', () => {
        expect(canonicalOption('my own gaiwan', 'en')).toBe('my own gaiwan');
    });

    test('Russian is passed through both ways without a lookup', () => {
        expect(optionLabel({ label: 'Гайвань' }, 'ru')).toBe('Гайвань');
        expect(canonicalOption('Гайвань', 'ru')).toBe('Гайвань');
    });

    // MUI hands these two shapes back from a freeSolo Autocomplete.
    test('handles the string and synthetic option shapes MUI produces', () => {
        expect(optionLabel('Китай', 'en')).toBe('China');
        expect(optionLabel({ inputValue: 'Add "oolong"' }, 'en')).toBe('Add "oolong"');
        expect(optionLabel(null, 'en')).toBe('');
    });
});

describe('tea types', () => {
    test('a stored label resolves to a name in each language', () => {
        const oolong = 'Улун (乌龙茶 - Wūlóng chá)';
        expect(teaTypeName(oolong, 'ru')).toBe('Улун');
        expect(teaTypeName(oolong, 'en')).toBe('Oolong');
        expect(teaTypeName(oolong, 'zh')).toBe('乌龙茶');
    });

    test('an unknown label falls back to itself', () => {
        expect(teaTypeName('Каркаде', 'en')).toBe('Каркаде');
    });

    // The label is a database key: the feed filters on it verbatim.
    test('every slug carries all three names and a stored label', () => {
        expect(teaTypeSlugs).toHaveLength(10);
        for (const type of teaTypeSlugs) {
            expect(typeof type.label).toBe('string');
            expect(type.slug).toMatch(/^[a-z-]+$/);
            for (const locale of LOCALES) expect(type[locale]).toBeTruthy();
        }
    });
});

describe('PageMeta across languages', () => {
    const alternates = () => [...document.head.querySelectorAll('link[rel="alternate"]')]
        .map((l) => `${l.getAttribute('hreflang')} ${l.getAttribute('href')}`).sort();

    test('canonical and lang follow the URL the page was reached by', async () => {
        render(
            <MemoryRouter initialEntries={['/en/blog']}>
                <PageMeta title="Tasting feed" path="/blog" />
            </MemoryRouter>,
        );
        await waitFor(() => expect(document.head.querySelector('link[rel=canonical]').getAttribute('href'))
            .toBe('https://teaform.ru/en/blog'));
        expect(document.documentElement.getAttribute('lang')).toBe(LOCALE_TAG.en);
    });

    test('the alternates name the same page in every language, plus x-default', async () => {
        render(
            <MemoryRouter initialEntries={['/zh/blog/type/puer']}>
                <PageMeta title="普洱茶" path="/blog/type/puer" />
            </MemoryRouter>,
        );
        await waitFor(() => expect(alternates()).toEqual([
            'en https://teaform.ru/en/blog/type/puer',
            'ru https://teaform.ru/blog/type/puer',
            'x-default https://teaform.ru/blog/type/puer',
            'zh-Hans https://teaform.ru/zh/blog/type/puer',
        ]));
    });

    // A page nobody should index has no business advertising translations.
    test('a noindex page publishes no alternates', async () => {
        render(
            <MemoryRouter initialEntries={['/en/my_forms']}>
                <PageMeta title="My tastings" path="/my_forms" noIndex />
            </MemoryRouter>,
        );
        await waitFor(() => expect(document.head.querySelector('meta[name=robots]')).not.toBeNull());
        expect(alternates()).toEqual([]);
    });
});

describe('links keep the reader in their language', () => {
    // Scoped to the navigation sections, not the whole footer: the language
    // switcher's whole job is to point out of the current language, so counting
    // its links as strays is what an earlier version of this test did — and it
    // failed on the switcher's own (correct) Russian link.
    test('every footer navigation link carries the current prefix', () => {
        render(
            <MemoryRouter initialEntries={['/zh/blog']}>
                <SiteFooter />
            </MemoryRouter>,
        );
        const navs = [
            screen.getByLabelText(messages.zh['footer.sections']),
            screen.getByLabelText(messages.zh['footer.byType']),
        ];
        const hrefs = navs.flatMap((nav) => [...nav.querySelectorAll('a')]
            .map((a) => a.getAttribute('href')));

        expect(hrefs.length).toBeGreaterThan(10);
        expect(hrefs.filter((h) => !h.startsWith('/zh'))).toEqual([]);
        expect(hrefs).toContain('/zh/blog/type/puer');
        expect(hrefs).toContain('/zh/sign-up');
    });

    test('the switcher offers the other two languages for the same page', () => {
        render(
            <MemoryRouter initialEntries={['/blog/type/ulun']}>
                <SiteFooter />
            </MemoryRouter>,
        );
        const hrefs = screen.getAllByRole('link').map((a) => a.getAttribute('href'));
        expect(hrefs).toContain('/en/blog/type/ulun');
        expect(hrefs).toContain('/zh/blog/type/ulun');
    });
});

// The descriptors were translated on the public tasting page long before the
// field you pick them in, so an English reader chose aromas from a Russian
// list. Storage is unaffected either way: Russian is the key.
describe('the descriptor picker speaks the reading language', () => {
    const db = {
        response: [{
            category: 'Цветочный',
            subcategories: [{ name: 'Жасмин', descriptors: ['Зелёный жасмин'] }],
        }],
    };

    const pick = (route) => {
        const onStagesChange = jest.fn();
        render(
            <MemoryRouter initialEntries={[route]}>
                <DescriptorPicker
                    label="Аромат" db={db}
                    stage1={null} stage2={null} stage3={null}
                    onStagesChange={onStagesChange}
                    quickPicks={[{ stages: ['Цветочный', 'Жасмин', 'Зелёный жасмин'], count: 5 }]}
                />
            </MemoryRouter>,
        );
        return onStagesChange;
    };

    test('options read in English, and searching them works in English', () => {
        const onStagesChange = pick('/en/form_2');

        fireEvent.change(screen.getByLabelText('Аромат'), { target: { value: 'jasm' } });
        const listbox = screen.getByRole('listbox');
        fireEvent.click(within(listbox).getByText('Floral → Jasmine → Green jasmine'));

        // What is stored is still the Russian the database is keyed by.
        expect(onStagesChange).toHaveBeenCalledWith(['Цветочный', 'Жасмин', 'Зелёный жасмин']);
    });

    test('the quick-pick chips translate too', () => {
        pick('/zh/form_2');
        expect(screen.getByText('青茉莉')).toBeTruthy();
    });

    test('Russian is unchanged', () => {
        pick('/form_2');
        fireEvent.change(screen.getByLabelText('Аромат'), { target: { value: 'жасм' } });
        const listbox = screen.getByRole('listbox');
        expect(within(listbox).getByText('Цветочный → Жасмин → Зелёный жасмин')).toBeTruthy();
    });
});

describe('the profile carries a language setting', () => {
    beforeEach(() => { mockSaved.length = 0; });

    // The footer only renders on public pages, so without this a signed-in
    // reader has nowhere to switch language but the address bar.
    test('the switcher points at the same page in the other two languages', async () => {
        render(
            <MemoryRouter initialEntries={['/en/profile']}>
                <Profile navigation={{}} handleLogout={() => {}} />
            </MemoryRouter>,
        );
        await screen.findByText(messages.en['nav.language']);

        const nav = screen.getByLabelText(messages.en['nav.language']);
        const hrefs = [...nav.querySelectorAll('a')].map((a) => a.getAttribute('href'));

        expect(hrefs).toEqual(['/profile', '/zh/profile']);
        // The language you are already reading is stated, not offered.
        expect(nav.querySelector('[aria-current]').textContent).toBe(LOCALE_NAME.en);
    });

    test('picking a language saves it to the account', async () => {
        render(
            <MemoryRouter initialEntries={['/profile']}>
                <Profile navigation={{}} handleLogout={() => {}} />
            </MemoryRouter>,
        );
        await screen.findByText(messages.ru['nav.language']);

        // Nothing saved yet: the account in the mock has no language.
        expect(screen.getByText(messages.ru['profile.languageUnset'])).toBeTruthy();

        fireEvent.click(screen.getByText(LOCALE_NAME.zh));

        // The write carries only the language — not a re-post of the whole
        // profile, which would resubmit fields the user never touched.
        expect(mockSaved).toEqual([{ language: 'zh' }]);
    });

    test('the footer switcher saves nothing', () => {
        render(
            <MemoryRouter initialEntries={['/blog']}>
                <SiteFooter />
            </MemoryRouter>,
        );
        fireEvent.click(screen.getByText(LOCALE_NAME.en));
        expect(mockSaved).toEqual([]);
    });

    test('the rest of the page is in that language too', async () => {
        render(
            <MemoryRouter initialEntries={['/zh/profile']}>
                <Profile navigation={{}} handleLogout={() => {}} />
            </MemoryRouter>,
        );
        await screen.findByText(messages.zh['nav.language']);

        expect(screen.getByText(messages.zh['profile.title'])).toBeTruthy();
        // The per-tasting quota line, interpolated — it was Russian until now.
        // The duration itself is mm:ss, which needs no translating.
        expect(screen.getByText(/不超过 2:00/)).toBeTruthy();
    });
});
