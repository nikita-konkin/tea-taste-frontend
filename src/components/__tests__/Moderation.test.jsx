/* Admin moderation on blog cards: who sees the buttons, and the yes/no window
   standing between a click and an irreversible call. */
import React, { useEffect } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Forms from '../Forms.jsx';
import PopupMsg from '../Popup.jsx';
import { PopupProvider } from '../PopupContext.jsx';
import { MyFormConextProvider, useMyFormConext } from '../MyFormConext.jsx';
import { mainApi } from '../../utils/MainAPI.jsx';

const forms = [
    {
        sessionId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        nameRU: 'Спорный чай', type: 'Улун',
        createdAt: '2026-07-20T08:00:00.000Z', averageRating: 6,
        owner: { name: 'Автор' },
    },
];

function Harness() {
    const { updateMyForms } = useMyFormConext();
    useEffect(() => { updateMyForms({ data: forms }); }, []);

    return (
        <Forms
            forms={() => {}}
            isMyForms={false}
            isBlog={true}
            navigation={() => {}}
            brewingsById={() => {}}
            aromasById={() => {}}
            tastesById={() => {}}
        />
    );
}

const renderBlog = () =>
    render(
        <MemoryRouter>
            <PopupProvider>
                <MyFormConextProvider>
                    <Harness />
                </MyFormConextProvider>
                <PopupMsg />
            </PopupProvider>
        </MemoryRouter>
    );

beforeEach(() => {
    localStorage.setItem('loggedIn', 'true');
    jest.restoreAllMocks();
});

afterEach(() => {
    localStorage.clear();
});

const asRole = (role) =>
    jest.spyOn(mainApi, 'getProfile').mockResolvedValue({ data: { _id: 'u1', role } });

test('a regular reader sees no moderation controls', async () => {
    asRole('user');
    renderBlog();

    expect(await screen.findByText('Публичные формы')).toBeInTheDocument();
    await waitFor(() => expect(mainApi.getProfile).toHaveBeenCalled());
    expect(screen.queryByRole('button', { name: 'Скрыть из ленты' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Удалить' })).not.toBeInTheDocument();
});

// The page is public, so a signed-out visitor must not even ask.
test('a signed-out visitor is never asked about', async () => {
    localStorage.removeItem('loggedIn');
    asRole('admin');
    renderBlog();

    await screen.findByText('Публичные формы');
    expect(mainApi.getProfile).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'Скрыть из ленты' })).not.toBeInTheDocument();
});

test('an admin gets both controls once the role arrives', async () => {
    asRole('admin');
    renderBlog();

    // Rendered from state built before the role request resolved, so this is
    // also the regression guard for the cards not being rebuilt afterwards.
    expect(await screen.findByRole('button', { name: 'Скрыть из ленты' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Удалить' })).toBeInTheDocument();
});

test('blocking goes through a yes/no window and calls the API on «Да»', async () => {
    asRole('admin');
    const block = jest.spyOn(mainApi, 'adminSetFormBlocked').mockResolvedValue({ data: {} });
    renderBlog();

    fireEvent.click(await screen.findByRole('button', { name: 'Скрыть из ленты' }));
    expect(await screen.findByText('Скрыть запись из ленты?')).toBeInTheDocument();
    expect(block).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Да, скрыть' }));
    await waitFor(() => expect(block).toHaveBeenCalledWith(forms[0].sessionId, true));
});

test('«Нет» closes the window without touching anything', async () => {
    asRole('admin');
    const del = jest.spyOn(mainApi, 'adminDeleteForm').mockResolvedValue({ ok: true });
    renderBlog();

    fireEvent.click(await screen.findByRole('button', { name: 'Удалить' }));
    expect(await screen.findByText('Удалить запись навсегда?')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Нет' }));
    await waitFor(() => {
        expect(screen.queryByText('Удалить запись навсегда?')).not.toBeInTheDocument();
    });
    expect(del).not.toHaveBeenCalled();
});

// The card being moderated is usually the one that disappears, so a failed call
// has to report into the dialog rather than into a component that is unmounting.
test('a failed action keeps the window open and shows why', async () => {
    asRole('admin');
    jest.spyOn(mainApi, 'adminDeleteForm')
        .mockRejectedValue(new Error('403 — Нет доступа.'));
    renderBlog();

    fireEvent.click(await screen.findByRole('button', { name: 'Удалить' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Да, удалить' }));

    expect(await screen.findByText('403 — Нет доступа.')).toBeInTheDocument();
    expect(screen.getByText('Удалить запись навсегда?')).toBeInTheDocument();
});
