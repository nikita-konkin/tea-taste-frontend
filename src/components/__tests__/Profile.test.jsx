/* Tests for the Profile page: loading, editing, password change, logout. */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Profile from '../Profile.jsx';
import { PopupProvider } from '../PopupContext.jsx';

const profileData = {
    name: 'Тестер',
    email: 'tester@example.com',
    career: 'Чайный мастер',
    about: 'Люблю улуны',
    avatar: 'https://example.com/avatar.png',
};

beforeEach(() => {
    global.fetch = jest.fn((url, options = {}) => {
        const method = options.method || 'GET';
        if (url.endsWith('/profile/me') && method === 'GET') {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ data: profileData }),
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

    await waitFor(() => {
        const patchCall = global.fetch.mock.calls.find(
            ([url, opts]) => url.endsWith('/profile/me') && opts && opts.method === 'PATCH'
        );
        expect(patchCall).toBeTruthy();
        const body = JSON.parse(patchCall[1].body);
        expect(body.name).toBe('Новое Имя');
        expect(body.email).toBe('tester@example.com');
        expect(body.about).toBe('Люблю улуны');
    });
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

    await waitFor(() => {
        const pwCall = global.fetch.mock.calls.find(([url]) => url.endsWith('/profile/password'));
        expect(pwCall).toBeTruthy();
        expect(JSON.parse(pwCall[1].body)).toEqual({
            oldPassword: 'Old1!abc',
            newPassword: 'New2@def',
        });
    });
});

test('the logout button calls handleLogout', async () => {
    const handleLogout = jest.fn();
    renderProfile(handleLogout);
    await screen.findByDisplayValue('Тестер');

    fireEvent.click(screen.getByText('Выйти'));
    expect(handleLogout).toHaveBeenCalledTimes(1);
});
