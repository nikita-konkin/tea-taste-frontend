/* /my_forms sorting: the list is ordered in the browser, so the ordering and
   the remembered choice are the only things worth asserting here. */
import React, { useEffect } from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Forms from '../Forms.jsx';
import { PopupProvider } from '../PopupContext.jsx';
import { MyFormConextProvider, useMyFormConext } from '../MyFormConext.jsx';

const forms = [
    {
        sessionId: 'b', nameRU: 'Байховый', type: 'Чёрный',
        createdAt: '2026-07-10T08:00:00.000Z', averageRating: 9,
    },
    {
        sessionId: 'a', nameRU: 'Алишань', type: 'Улун',
        createdAt: '2026-07-20T08:00:00.000Z', averageRating: 4,
    },
    {
        sessionId: 'v', nameRU: 'Ветер в соснах', type: 'Зелёный',
        createdAt: '2026-07-01T08:00:00.000Z', averageRating: 7,
    },
];

// Forms takes the fetch as a prop and reads the result back out of the context,
// exactly as App wires it — so the seeding has to go through the same door.
function Harness() {
    const { updateMyForms } = useMyFormConext();
    useEffect(() => { updateMyForms({ data: forms }); }, []);

    return (
        <Forms
            forms={() => {}}
            isMyForms={true}
            isBlog={false}
            navigation={() => {}}
            brewingsById={() => {}}
            aromasById={() => {}}
            tastesById={() => {}}
            delFormById={() => {}}
            delBrewsById={() => {}}
            delTastesById={() => {}}
            delAromasById={() => {}}
            patchFormById={() => {}}
        />
    );
}

const renderForms = () =>
    render(
        <MemoryRouter>
            <PopupProvider>
                <MyFormConextProvider>
                    <Harness />
                </MyFormConextProvider>
            </PopupProvider>
        </MemoryRouter>
    );

// Card titles in render order. Read off the rendered rows rather than by text
// query: the assertion here is about the order cards come out in, and a query
// that matches on the label would not preserve it.
const rows = (container, label) =>
    Array.from(container.querySelectorAll('.myform__row'))
        .filter((li) => li.textContent.startsWith(label))
        .map((li) => li.textContent.slice(label.length));

const titles = (container) => rows(container, 'Название: ');

const chooseSort = (optionText) => {
    fireEvent.mouseDown(screen.getByRole('combobox'));
    const listbox = within(screen.getByRole('listbox'));
    fireEvent.click(listbox.getByText(optionText));
};

beforeEach(() => {
    localStorage.clear();
});

test('defaults to newest first', async () => {
    const { container } = renderForms();
    expect(await screen.findByText('Мои Формы')).toBeInTheDocument();
    expect(titles(container)).toEqual(['Алишань', 'Байховый', 'Ветер в соснах']);
});

test('sorts by oldest, by rating and by name', async () => {
    const { container } = renderForms();
    await screen.findByText('Мои Формы');

    chooseSort('Сначала старые');
    expect(titles(container)).toEqual(['Ветер в соснах', 'Байховый', 'Алишань']);

    chooseSort('Рейтинг: по убыванию');
    expect(titles(container)).toEqual(['Байховый', 'Ветер в соснах', 'Алишань']);

    chooseSort('Рейтинг: по возрастанию');
    expect(titles(container)).toEqual(['Алишань', 'Ветер в соснах', 'Байховый']);

    chooseSort('Название: А–Я');
    expect(titles(container)).toEqual(['Алишань', 'Байховый', 'Ветер в соснах']);
});

test('remembers the choice for the next visit', async () => {
    const first = renderForms();
    await screen.findByText('Мои Формы');
    chooseSort('Рейтинг: по убыванию');
    expect(localStorage.getItem('myFormsSort')).toBe('rating');

    first.unmount();
    const { container } = renderForms();
    await screen.findByText('Мои Формы');
    expect(titles(container)).toEqual(['Байховый', 'Ветер в соснах', 'Алишань']);
});

test('the card shows the time of day next to the date', async () => {
    const { container } = renderForms();
    await screen.findByText('Мои Формы');

    // Two tastings of the same tea on one day are told apart by the hour.
    expect(rows(container, 'Дата публикации: ')[0]).toMatch(/\d{1,2}:\d{2}/);
});
