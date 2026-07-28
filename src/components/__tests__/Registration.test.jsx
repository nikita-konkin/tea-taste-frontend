/* The sign-up page reads the registration switch before offering a form. */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Registration from '../Registration.jsx';
import { PopupProvider } from '../PopupContext.jsx';

const mockSettings = (body, ok = true) => {
    global.fetch = jest.fn((url) => {
        if (String(url).endsWith('/settings')) {
            return Promise.resolve({ ok, json: () => Promise.resolve(body) });
        }
        return Promise.resolve({ ok: false, json: () => Promise.resolve({ message: 'not found' }) });
    });
};

afterEach(() => {
    jest.restoreAllMocks();
});

const renderRegistration = () =>
    render(
        <MemoryRouter>
            <PopupProvider>
                <Registration auth={jest.fn()} />
            </PopupProvider>
        </MemoryRouter>
    );

test('offers the form while registration is open', async () => {
    mockSettings({ data: { registrationOpen: true } });
    renderRegistration();

    expect(await screen.findByPlaceholderText('Имя')).toBeInTheDocument();
    expect(screen.getByText('Зарегистрироваться')).toBeInTheDocument();
});

test('hides the form and the VK button once registration is closed', async () => {
    mockSettings({ data: { registrationOpen: false } });
    renderRegistration();

    await waitFor(() => {
        expect(screen.getByText(/временно закрыта/i)).toBeInTheDocument();
    });
    expect(screen.queryByPlaceholderText('Имя')).not.toBeInTheDocument();
    expect(screen.queryByText('Зарегистрироваться')).not.toBeInTheDocument();
    // VK is the other way in — leaving it would offer a door the server shuts.
    expect(screen.queryByText('Продолжить с VK ID')).not.toBeInTheDocument();
    expect(screen.getByText('Войти')).toBeInTheDocument();
});

test('a failed settings request leaves the form usable', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('network down')));
    renderRegistration();

    // Assuming "closed" on a dropped request would lock people out of a site
    // that is working; the server refuses on its own if it really is closed.
    expect(await screen.findByPlaceholderText('Имя')).toBeInTheDocument();
});
