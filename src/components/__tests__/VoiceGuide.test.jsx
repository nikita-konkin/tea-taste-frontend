/* The voice-notes guide: its content, and the two places it opens from. */
import React, { useEffect } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import VoiceGuide from '../VoiceGuide.jsx';
import { MAX_TOTAL_SECONDS } from '../VoiceNote.jsx';
import Forms from '../Forms.jsx';
import Navigation from '../Navigation.jsx';
import PopupMsg from '../Popup.jsx';
import { PopupProvider } from '../PopupContext.jsx';
import { MyFormConextProvider, useMyFormConext } from '../MyFormConext.jsx';

const forms = [
    {
        sessionId: 'a', nameRU: 'Алишань', type: 'Улун',
        createdAt: '2026-07-20T08:00:00.000Z', averageRating: 4,
    },
];

function Harness({ data }) {
    const { updateMyForms } = useMyFormConext();
    useEffect(() => { updateMyForms({ data }); }, []);

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

// PopupMsg is what App renders next to the page, so the click-to-open path is
// only real with it mounted.
const renderMyForms = (data) =>
    render(
        <MemoryRouter>
            <PopupProvider>
                <MyFormConextProvider>
                    <Harness data={data} />
                </MyFormConextProvider>
                <PopupMsg />
            </PopupProvider>
        </MemoryRouter>
    );

const openButton = () => screen.getByRole('button', { name: 'Как работают голосовые заметки' });

// The guide reads its language from the URL like every other page, so it needs
// a router even when rendered on its own. Bare path — these assert the Russian.
const renderGuide = () => render(<MemoryRouter><VoiceGuide /></MemoryRouter>);

test('covers recording, transcription, filling fields, privacy and limits', () => {
    renderGuide();

    expect(screen.getByText('Голосовые заметки')).toBeInTheDocument();
    expect(screen.getByText('1. Записать')).toBeInTheDocument();
    expect(screen.getByText('2. Что происходит после сохранения')).toBeInTheDocument();
    expect(screen.getByText('3. Заполнить поля из расшифровки')).toBeInTheDocument();
    expect(screen.getByText('4. Приватность')).toBeInTheDocument();
    expect(screen.getByText('5. Лимиты')).toBeInTheDocument();

    // The buttons the text tells people to look for have to be the ones that
    // exist: these strings are copied from VoiceNote, Form and FormEdit.
    expect(screen.getByText('● Записать')).toBeInTheDocument();
    expect(screen.getByText('Заполнить из расшифровки')).toBeInTheDocument();
    expect(screen.getByText('Публиковать аудиозапись и расшифровку')).toBeInTheDocument();
});

// JSX drops the whitespace between a text line and an element on the next line,
// which glued "нажмётеСохранить форму" together on the real page — invisible in
// a query that matches either half on its own.
test('keeps a space where a highlighted control name follows text', () => {
    const { container } = renderGuide();
    const text = container.textContent;

    expect(text).toContain('нажмёте Сохранить форму');
    expect(text).toContain('расшифровку в Изменить');
});

test('quotes the budget the recorder actually enforces', () => {
    const { container } = renderGuide();
    const minutes = Math.round(MAX_TOTAL_SECONDS / 60);

    expect(container.textContent).toContain(`${minutes} минут на одну дегустацию`);
});

test('opens from /my_forms', async () => {
    renderMyForms(forms);
    await screen.findByText('Мои Формы');

    expect(screen.queryByText('1. Записать')).not.toBeInTheDocument();
    fireEvent.click(openButton());
    expect(await screen.findByText('1. Записать')).toBeInTheDocument();
});

// The user most in need of the instructions is the one who has not recorded
// anything yet, so the empty page keeps the button even without the sort select.
test('is reachable on /my_forms before there are any tastings', async () => {
    renderMyForms([]);
    await screen.findByText('У вас пока нет форм');

    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    fireEvent.click(openButton());
    expect(await screen.findByText('1. Записать')).toBeInTheDocument();
});

test('opens from the side menu, which closes behind it', () => {
    render(
        <PopupProvider>
            <MemoryRouter initialEntries={['/my_forms']}>
                <Navigation />
            </MemoryRouter>
        </PopupProvider>
    );

    fireEvent.click(screen.getByLabelText('Открыть меню'));
    expect(screen.getByText('Справка')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Голосовые заметки'));
    expect(screen.queryByRole('navigation', { name: 'Главное меню' })).not.toBeInTheDocument();
});
