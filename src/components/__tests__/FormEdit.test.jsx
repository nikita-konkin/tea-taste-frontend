/* Tests for the tea-form edit dialog: Stage-1 fields and the brewings section. */
import React from 'react';
import { render as rtlRender, screen, fireEvent, waitFor } from '@testing-library/react';
import FormEdit from '../FormEdit.jsx';
import { PopupProvider } from '../PopupContext.jsx';
import { formApi } from '../../utils/FormAPI.jsx';
import { mainApi } from '../../utils/MainAPI.jsx';

import { MemoryRouter } from 'react-router-dom';

// These components read the reader's language from the URL (useT -> useLocation),
// so they need router context even in tests that have nothing to do with routing.
// Shadowing render keeps every call below unchanged.
const render = (ui, options) => rtlRender(ui, { wrapper: MemoryRouter, ...options });


jest.mock('../../utils/FormAPI.jsx', () => ({
    formApi: {
        getAllMyBrewingsById: jest.fn(),
        getAllMyAromasById: jest.fn(),
        getAllMyTastesById: jest.fn(),
        // The descriptor dictionaries behind the пролив stage suggestions.
        getAllFromAromaDB: jest.fn(),
        getAllFromTasteDB: jest.fn(),
        patchFormStage2Brew: jest.fn(),
        patchAromaStages: jest.fn(),
        patchTasteStages: jest.fn(),
        postFormStage2Brew: jest.fn(),
        postAromaStages: jest.fn(),
        postTasteStages: jest.fn(),
        delBrewSelective: jest.fn(),
    },
}));

// VoiceExtract fetches the suggestions; the dialog is what applies them.
jest.mock('../../utils/MainAPI.jsx', () => ({
    mainApi: {
        extractVoice: jest.fn(),
        deleteTeaPhoto: jest.fn(),
    },
}));

const formData = {
    sessionId: '11111111-1111-4111-8111-111111111111',
    nameRU: 'Да Хун Пао',
    type: 'Улун',
    country: 'Китай',
    shop: 'Чайный дом',
    weight: 8,
    water: 'Родниковая',
    volume: 150,
    temperature: 95,
    price: 25.5,
    teaware: 'Гайвань',
    brewingtype: 'Проливы',
    averageRating: 8.5,
    publicAccess: true,
};

const brewing = {
    _id: 'b1',
    brewingCount: 1,
    brewingTime: '0:00:15',
    brewingRating: 8,
    description: 'Первый пролив',
    publicAccess: true,
};

const aroma = {
    _id: 'a1',
    aromaCount: 1,
    brewingCount: 1,
    aromaStage1: 'Цветочный',
    aromaStage2: 'Жасмин',
};

// The dry leaf: an aroma on пролив 0, a number no brewing has. Everything that
// walks the проливы skips it, which is exactly why it needs its own coverage.
const dryAroma = {
    _id: 'a0',
    aromaCount: 1,
    brewingCount: 0,
    aromaStage1: 'Древесный',
    aromaStage2: 'Дуб',
};

beforeEach(() => {
    formApi.getAllMyBrewingsById.mockResolvedValue({ data: [brewing] });
    formApi.getAllMyAromasById.mockResolvedValue({ data: [aroma, dryAroma] });
    formApi.getAllMyTastesById.mockResolvedValue({ data: [] });
    // These two endpoints answer with `response`, unlike every other call here —
    // the mock has to mirror that or it hides the bug it should catch.
    formApi.getAllFromAromaDB.mockResolvedValue({
        response: [{ category: 'Цветочный', subcategories: [{ name: 'Роза', descriptors: [] }] }],
    });
    formApi.getAllFromTasteDB.mockResolvedValue({ response: [] });
    formApi.patchFormStage2Brew.mockResolvedValue({ data: {} });
    formApi.patchAromaStages.mockResolvedValue({ data: {} });
    formApi.patchTasteStages.mockResolvedValue({ data: {} });
    formApi.postAromaStages.mockResolvedValue({ data: {} });
});

afterEach(() => {
    jest.clearAllMocks();
});

const renderFormEdit = (patchFormById = jest.fn()) =>
    render(
        <PopupProvider>
            <FormEdit formData={formData} patchFormById={patchFormById} />
        </PopupProvider>
    );

test('prefills the Stage-1 fields from formData', async () => {
    renderFormEdit();

    expect(screen.getByDisplayValue('Да Хун Пао')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Улун')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Чайный дом')).toBeInTheDocument();
    expect(screen.getByDisplayValue('150')).toBeInTheDocument();
    expect(screen.getByDisplayValue('8.5')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeChecked();
    await screen.findByTestId('brew-edit-1'); // wait for the async load to settle
});

test('submits the full Stage-1 body with edited values and correct types', async () => {
    const patchFormById = jest.fn().mockResolvedValue({ data: {} });
    renderFormEdit(patchFormById);

    fireEvent.change(screen.getByDisplayValue('Чайный дом'), {
        target: { value: 'Другой магазин' },
    });
    fireEvent.change(screen.getByDisplayValue('8.5'), {
        target: { value: '9.5' },
    });
    fireEvent.submit(screen.getByTestId('form-edit'));

    await waitFor(() => expect(patchFormById).toHaveBeenCalledTimes(1));

    const [sessionId, body] = patchFormById.mock.calls[0];
    expect(sessionId).toBe(formData.sessionId);
    expect(body).toEqual({
        nameRU: 'Да Хун Пао',
        type: 'Улун',
        country: 'Китай',
        shop: 'Другой магазин',
        weight: 8,
        water: 'Родниковая',
        volume: 150,
        temperature: 95,
        price: 25.5,
        teaware: 'Гайвань',
        brewingtype: 'Проливы',
        averageRating: 9.5,
        // Untouched here, but still sent: '' is what clears a stored value, and
        // omitting the key would leave an emptied box unsaved.
        description: '',
        dryAromaDescription: '',
        photos: [],
        publicAccess: true,
    });
});

describe('the dry leaf and the tasting as a whole', () => {
    test('prefills both free-text fields', async () => {
        render(
            <PopupProvider>
                <FormEdit
                    formData={{
                        ...formData,
                        description: 'Плотный и маслянистый.',
                        dryAromaDescription: 'Из пакета — тёплая выпечка.',
                    }}
                    patchFormById={jest.fn()}
                />
            </PopupProvider>
        );

        expect(screen.getByDisplayValue('Плотный и маслянистый.')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Из пакета — тёплая выпечка.')).toBeInTheDocument();
        await screen.findByTestId('brew-edit-1');
    });

    test('the пролив-0 aroma is editable outside the проливы, not inside one', async () => {
        renderFormEdit();

        // Both rows are on screen, and the dry one is not in пролив №1's block.
        expect(await screen.findByDisplayValue('Древесный → Дуб')).toBeInTheDocument();
        const brewBlock = await screen.findByTestId('brew-edit-1');
        expect(brewBlock).not.toHaveTextContent('Древесный');
    });

    test('saving the tasting saves the dry-leaf aroma with it', async () => {
        const patchFormById = jest.fn().mockResolvedValue({ data: {} });
        renderFormEdit(patchFormById);
        await screen.findByTestId('brew-edit-1');

        fireEvent.submit(screen.getByTestId('form-edit'));

        await waitFor(() => expect(formApi.patchAromaStages).toHaveBeenCalled());
        const dryCall = formApi.patchAromaStages.mock.calls
            .find(([, brewId]) => brewId === 0);
        expect(dryCall).toBeDefined();
        expect(dryCall[2]).toBe(1); // aromaCount
        expect(dryCall[3].aromaStage1).toBe('Древесный');
    });

    test('adding one posts a new row against пролив 0', async () => {
        renderFormEdit();
        await screen.findByTestId('brew-edit-1');

        fireEvent.click(screen.getByText('Добавить оттенок аромата'));

        await waitFor(() => expect(formApi.postAromaStages).toHaveBeenCalled());
        const [sessionId, brewId, aromaId] = formApi.postAromaStages.mock.calls[0];
        expect(sessionId).toBe(formData.sessionId);
        expect(brewId).toBe(0);
        // Next free index after the one that is already there.
        expect(aromaId).toBe(2);
    });
});

// The sequence a user actually performs: заполнить из расшифровки → применить
// всё → сохранить форму. Apply-all used to stop at the tea's own fields, so the
// проливы kept their old text and every пролив note from the recording was lost.
describe('«Применить всё» reaches the проливы', () => {
    const suggestion = {
        data: {
            isTeaTasting: true,
            // No tea-level fields at all: every note was recorded against a
            // пролив. That is exactly what a per-пролив tasting now returns, and
            // it used to leave the button unrendered and the panel claiming
            // nothing had been found.
            brewings: [{ number: 1, description: 'первый: чабрец' }],
        },
        cached: false,
    };

    const renderWithVoice = () => render(
        <PopupProvider>
            <FormEdit
                formData={{ ...formData, voice: { transcript: 'Пролив 1. чабрец' } }}
                patchFormById={jest.fn().mockResolvedValue({ data: {} })}
            />
        </PopupProvider>
    );

    test('the button is offered even when only проливы were suggested', async () => {
        mainApi.extractVoice.mockResolvedValue(suggestion);
        renderWithVoice();
        await screen.findByTestId('brew-edit-1');

        fireEvent.click(screen.getByText('Заполнить из расшифровки'));

        expect(await screen.findByText('Применить всё')).toBeInTheDocument();
        expect(screen.queryByText('В расшифровке не нашлось данных для полей.')).toBeNull();
    });

    test('one click fills the пролив, not just the fields above it', async () => {
        mainApi.extractVoice.mockResolvedValue(suggestion);
        renderWithVoice();
        await screen.findByTestId('brew-edit-1');

        fireEvent.click(screen.getByText('Заполнить из расшифровки'));
        fireEvent.click(await screen.findByText('Применить всё'));

        await waitFor(() => expect(screen.getByDisplayValue('первый: чабрец')).toBeInTheDocument());
    });

    test('a suggestion for a пролив the form does not have is not invented', async () => {
        mainApi.extractVoice.mockResolvedValue({
            data: { isTeaTasting: true, brewings: [{ number: 7, description: 'седьмой' }] },
            cached: false,
        });
        renderWithVoice();
        await screen.findByTestId('brew-edit-1');

        fireEvent.click(screen.getByText('Заполнить из расшифровки'));
        fireEvent.click(await screen.findByText('Применить всё'));

        // Пролив 7 does not exist here, so nothing is created for it and пролив 1
        // keeps what it had.
        await waitFor(() => expect(screen.getByDisplayValue('Первый пролив')).toBeInTheDocument());
        expect(screen.queryByDisplayValue('седьмой')).toBeNull();
    });
});

test('shows the server error message when saving Stage 1 fails', async () => {
    const patchFormById = jest.fn().mockRejectedValue(new Error('Переданы некорректные данные'));
    renderFormEdit(patchFormById);

    fireEvent.submit(screen.getByTestId('form-edit'));

    expect(await screen.findByText('Переданы некорректные данные')).toBeInTheDocument();
});

test('loads brewings with aroma stages and saves an edited brewing', async () => {
    renderFormEdit();

    await screen.findByTestId('brew-edit-1');
    expect(screen.getByDisplayValue('Первый пролив')).toBeInTheDocument();
    // One field per descriptor now, showing the whole path rather than three
    // separate stage inputs.
    expect(screen.getByDisplayValue('Цветочный → Жасмин')).toBeInTheDocument();

    fireEvent.change(screen.getByDisplayValue('Первый пролив'), {
        target: { value: 'Обновлённое описание' },
    });
    // The descriptor is one field holding the whole path, so it is edited as a
    // path rather than by retyping a single stage.
    fireEvent.change(screen.getByDisplayValue('Цветочный → Жасмин'), {
        target: { value: 'Цветочный → Роза' },
    });
    fireEvent.click(screen.getByText('Сохранить пролив'));

    await waitFor(() => expect(formApi.patchFormStage2Brew).toHaveBeenCalledTimes(1));

    const [brewBody, sessionId, brewingCount, publicAccess] =
        formApi.patchFormStage2Brew.mock.calls[0];
    expect(brewBody).toEqual({
        description: 'Обновлённое описание',
        brewingRating: 8,
        brewingTime: '0:00:15',
    });
    expect(sessionId).toBe(formData.sessionId);
    expect(brewingCount).toBe(1);
    expect(publicAccess).toBe(true);

    expect(formApi.patchAromaStages).toHaveBeenCalledWith(
        formData.sessionId, 1, 1,
        expect.objectContaining({ aromaStage1: 'Цветочный', aromaStage2: 'Роза' })
    );

    expect(await screen.findByText('Сохранено ✓')).toBeInTheDocument();
});
