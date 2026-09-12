/* Tests for the Profile page: loading, editing, password change, logout. */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Profile from '../Profile.jsx';
import { PopupProvider } from '../PopupContext.jsx';

const profileData = {
    name: 'Тестер',
    nickname: 'ЧайныйЁж',
    email: 'tester@example.com',
    career: 'Чайный мастер',
    about: 'Люблю улуны',
    avatar: 'https://example.com/avatar.png',
};

let voiceQuota = {
    usedSeconds: 900, leftSeconds: 900, limitSeconds: 1800,
    maxTrackSeconds: 300, period: '2026-07',
};

beforeEach(() => {
    voiceQuota = {
        usedSeconds: 900, leftSeconds: 900, limitSeconds: 1800,
        maxTrackSeconds: 300, period: '2026-07',
    };
    global.fetch = jest.fn((url, options = {}) => {
        const method = options.method || 'GET';
        if (url.endsWith('/profile/me') && method === 'GET') {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ data: profileData, voiceQuota }),
            });
        }
        if (url.endsWith('/profile/me') && method === 'PATCH') {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ data: JSON.parse(options.body) }),
            });
        }
        if (url.endsWith('/profile/password') && method === 'PATCH') {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ ok: true, message: 'Пароль изменён.' }),
            });
        }
        return Promise.resolve({
            ok: false,
            json: () => Promise.resolve({ status: 'error', message: 'not found' }),
        });
    });
});

afterEach(() => {
    jest.restoreAllMocks();
});

const renderProfile = (handleLogout = jest.fn()) =>
    render(
        <MemoryRouter>
            <PopupProvider>
                <Profile handleLogout={handleLogout} />
            </PopupProvider>
        </MemoryRouter>
    );

test('loads the profile and fills the fields', async () => {
    renderProfile();

    expect(await screen.findByDisplayValue('Тестер')).toBeInTheDocument();
    expect(screen.getByDisplayValue('tester@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Чайный мастер')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Люблю улуны')).toBeInTheDocument();
    expect(screen.getByAltText('Аватар')).toHaveAttribute('src', profileData.avatar);
});

test('saving the profile sends PATCH /profile/me with the edited values', async () => {
    renderProfile();
    await screen.findByDisplayValue('Тестер');

    fireEvent.change(screen.getByDisplayValue('Тестер'), { target: { value: 'Новое Имя' } });
    fireEvent.click(screen.getByText('Сохранить профиль'));

    const findPatch = () => global.fetch.mock.calls.find(
        ([url, opts]) => url.endsWith('/profile/me') && opts && opts.method === 'PATCH',
    );
    await waitFor(() => expect(findPatch()).toBeTruthy());

    const body = JSON.parse(findPatch()[1].body);
    expect(body.name).toBe('Новое Имя');
    expect(body.email).toBe('tester@example.com');
    expect(body.about).toBe('Люблю улуны');
});

test('changing the password sends PATCH /profile/password', async () => {
    renderProfile();
    await screen.findByDisplayValue('Тестер');

    fireEvent.change(screen.getByPlaceholderText('Текущий пароль'), {
        target: { value: 'Old1!abc' },
    });
    fireEvent.change(screen.getByPlaceholderText('Новый пароль'), {
        target: { value: 'New2@def' },
    });
    fireEvent.click(screen.getByText('Изменить пароль'));

    const findPassword = () => global.fetch.mock.calls.find(([url]) => url.endsWith('/profile/password'));
    await waitFor(() => expect(findPassword()).toBeTruthy());

    expect(JSON.parse(findPassword()[1].body)).toEqual({
        oldPassword: 'Old1!abc',
        newPassword: 'New2@def',
    });
});

test('loads the nickname and sends an edited one', async () => {
    renderProfile();
    await screen.findByDisplayValue('Тестер');

    const nickname = screen.getByDisplayValue('ЧайныйЁж');
    fireEvent.change(nickname, { target: { value: 'Пуэрыч' } });
    fireEvent.click(screen.getByText('Сохранить профиль'));

    await waitFor(() => {
        const patchCall = global.fetch.mock.calls.find(
            ([url, opts]) => url.endsWith('/profile/me') && opts && opts.method === 'PATCH'
        );
        expect(JSON.parse(patchCall[1].body).nickname).toBe('Пуэрыч');
    });
});

test('clearing the nickname sends an empty string, which the server unsets', async () => {
    renderProfile();
    await screen.findByDisplayValue('ЧайныйЁж');

    fireEvent.change(screen.getByDisplayValue('ЧайныйЁж'), { target: { value: '' } });
    fireEvent.click(screen.getByText('Сохранить профиль'));

    await waitFor(() => {
        const patchCall = global.fetch.mock.calls.find(
            ([url, opts]) => url.endsWith('/profile/me') && opts && opts.method === 'PATCH'
        );
        // Not omitted: omitting would leave the old nickname in place, and the
        // field has no other way to say "I no longer want one".
        expect(JSON.parse(patchCall[1].body).nickname).toBe('');
    });
});

test('shows the voice transcription allowance', async () => {
    renderProfile();
    await screen.findByDisplayValue('Тестер');

    expect(screen.getByText(/Расшифровано в этом месяце: 15:00 из 30:00/)).toBeInTheDocument();
    expect(screen.getByText(/Осталось 15:00/)).toBeInTheDocument();
    expect(screen.getByText(/не длиннее 5:00/)).toBeInTheDocument();
});

test('says what still works once the allowance is spent', async () => {
    voiceQuota = { ...voiceQuota, usedSeconds: 1800, leftSeconds: 0 };
    renderProfile();
    await screen.findByDisplayValue('Тестер');

    // A spent quota does not lose the recording, and saying so is the point of
    // showing the number at all.
    expect(screen.getByText(/Лимит на этот месяц исчерпан/)).toBeInTheDocument();
    expect(screen.getByText(/Записи сохраняются и воспроизводятся/)).toBeInTheDocument();
});

test('the logout button calls handleLogout', async () => {
    const handleLogout = jest.fn();
    renderProfile(handleLogout);
    await screen.findByDisplayValue('Тестер');

    fireEvent.click(screen.getByText('Выйти из аккаунта'));
    expect(handleLogout).toHaveBeenCalledTimes(1);
});
