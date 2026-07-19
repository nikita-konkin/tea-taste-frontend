/* Tests for the side menu: open, structure, close behaviors. */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navigation from '../Navigation.jsx';
import { PopupProvider } from '../PopupContext.jsx';

const renderNav = () =>
    render(
        <PopupProvider>
            <MemoryRouter initialEntries={['/my_forms']}>
                <Navigation />
            </MemoryRouter>
        </PopupProvider>
    );

test('menu is closed initially and opens from the hamburger button', () => {
    renderNav();

    expect(screen.queryByRole('navigation', { name: 'Главное меню' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Открыть меню'));
    expect(screen.getByRole('navigation', { name: 'Главное меню' })).toBeInTheDocument();
});

test('shows grouped sections with all the app links', () => {
    renderNav();
    fireEvent.click(screen.getByLabelText('Открыть меню'));

    expect(screen.getByText('Дегустация')).toBeInTheDocument();
    expect(screen.getByText('Записи')).toBeInTheDocument();
    expect(screen.getByText('Аккаунт')).toBeInTheDocument();
    expect(screen.getByText('Обратная связь')).toBeInTheDocument();
    expect(screen.getByText('Предложить улучшение')).toBeInTheDocument();

    expect(screen.getByText('Новая форма — этап 1').closest('a')).toHaveAttribute('href', '/form_1');
    expect(screen.getByText('Проливы — этап 2').closest('a')).toHaveAttribute('href', '/form_2');
    expect(screen.getByText('Мои формы').closest('a')).toHaveAttribute('href', '/my_forms');
    expect(screen.getByText('Блог').closest('a')).toHaveAttribute('href', '/blog');
    expect(screen.getByText('Профиль').closest('a')).toHaveAttribute('href', '/profile');
});

test('closes via the close button, a link click, and Escape', () => {
    renderNav();
    const open = () => fireEvent.click(screen.getByLabelText('Открыть меню'));

    open();
    fireEvent.click(screen.getByLabelText('Закрыть меню'));
    expect(screen.queryByRole('navigation', { name: 'Главное меню' })).not.toBeInTheDocument();

    open();
    fireEvent.click(screen.getByText('Блог'));
    expect(screen.queryByRole('navigation', { name: 'Главное меню' })).not.toBeInTheDocument();

    open();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('navigation', { name: 'Главное меню' })).not.toBeInTheDocument();
});

test('the feedback button closes the menu (popup opens elsewhere)', () => {
    renderNav();
    fireEvent.click(screen.getByLabelText('Открыть меню'));
    fireEvent.click(screen.getByText('Предложить улучшение'));
    expect(screen.queryByRole('navigation', { name: 'Главное меню' })).not.toBeInTheDocument();
});
