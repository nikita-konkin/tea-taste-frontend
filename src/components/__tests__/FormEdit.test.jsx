/* Tests for the tea-form edit dialog: Stage-1 fields and the brewings section. */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FormEdit from '../FormEdit.jsx';
import { PopupProvider } from '../PopupContext.jsx';
import { formApi } from '../../utils/FormAPI.jsx';

jest.mock('../../utils/FormAPI.jsx', () => ({
    formApi: {
        getAllMyBrewingsById: jest.fn(),
        getAllMyAromasById: jest.fn(),
        getAllMyTastesById: jest.fn(),
        patchFormStage2Brew: jest.fn(),
        patchAromaStages: jest.fn(),
        patchTasteStages: jest.fn(),
        postFormStage2Brew: jest.fn(),
        delBrewSelective: jest.fn(),
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

beforeEach(() => {
    formApi.getAllMyBrewingsById.mockResolvedValue({ data: [brewing] });
    formApi.getAllMyAromasById.mockResolvedValue({ data: [aroma] });
    formApi.getAllMyTastesById.mockResolvedValue({ data: [] });
    formApi.patchFormStage2Brew.mockResolvedValue({ data: {} });
    formApi.patchAromaStages.mockResolvedValue({ data: {} });
    formApi.patchTasteStages.mockResolvedValue({ data: {} });
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
        photos: [],
        publicAccess: true,
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
    expect(screen.getByDisplayValue('Цветочный')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Жасмин')).toBeInTheDocument();

    fireEvent.change(screen.getByDisplayValue('Первый пролив'), {
        target: { value: 'Обновлённое описание' },
    });
    fireEvent.change(screen.getByDisplayValue('Жасмин'), {
        target: { value: 'Роза' },
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
