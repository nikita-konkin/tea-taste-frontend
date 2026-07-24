/* Tests for the three-slot tea photo picker: upload, replace, remove. */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TeaPhotos from '../TeaPhotos.jsx';

jest.mock('../../utils/MainAPI.jsx', () => ({
    mainApi: {
        uploadTeaPhoto: jest.fn(),
        deleteTeaPhoto: jest.fn(() => Promise.resolve()),
    },
}));

// jsdom has no canvas, so the real helper can never run here.
jest.mock('../../utils/imageResize.js', () => ({
    downscaleImage: jest.fn((file) => Promise.resolve(file)),
}));

const { mainApi } = require('../../utils/MainAPI.jsx');

const file = (name = 'leaf.png') => new File(['x'], name, { type: 'image/png' });
const pick = (label, f = file()) =>
    fireEvent.change(screen.getByLabelText(`Добавить фото: ${label}`), { target: { files: [f] } });

beforeEach(() => {
    jest.clearAllMocks();
    mainApi.uploadTeaPhoto.mockResolvedValue({ data: { url: '/api/uploads/u-1.png' } });
});

test('shows three empty slots', () => {
    render(<TeaPhotos value={[]} onChange={jest.fn()} />);
    ['Сухой лист', 'Настой', 'Мокрый лист'].forEach((label) => {
        expect(screen.getByLabelText(`Добавить фото: ${label}`)).toBeInTheDocument();
    });
});

test('uploads a picked file and reports the url with its slot', async () => {
    const onChange = jest.fn();
    render(<TeaPhotos value={[]} onChange={onChange} />);

    pick('Настой');

    await waitFor(() => expect(onChange).toHaveBeenCalled());
    expect(mainApi.uploadTeaPhoto).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith([{ url: '/api/uploads/u-1.png', kind: 'liquor' }]);
});

test('renders a stored photo and removes it on demand', () => {
    const onChange = jest.fn();
    const photos = [{ url: '/api/uploads/u-1.png', kind: 'dry' }];
    render(<TeaPhotos value={photos} onChange={onChange} />);

    expect(screen.getByAltText('Сухой лист')).toHaveAttribute('src', '/api/uploads/u-1.png');

    fireEvent.click(screen.getByLabelText('Удалить фото: Сухой лист'));
    expect(onChange).toHaveBeenCalledWith([]);
    expect(mainApi.deleteTeaPhoto).toHaveBeenCalledWith('/api/uploads/u-1.png');
});

test('keeps the photos in slot order regardless of pick order', async () => {
    const onChange = jest.fn();
    const photos = [{ url: '/api/uploads/u-wet.png', kind: 'wet' }];
    render(<TeaPhotos value={photos} onChange={onChange} />);

    pick('Сухой лист');

    await waitFor(() => expect(onChange).toHaveBeenCalled());
    expect(onChange).toHaveBeenCalledWith([
        { url: '/api/uploads/u-1.png', kind: 'dry' },
        { url: '/api/uploads/u-wet.png', kind: 'wet' },
    ]);
});

test('hands a removed url to the parent instead of deleting when asked', () => {
    const onRemovedUrl = jest.fn();
    const photos = [{ url: '/api/uploads/u-1.png', kind: 'dry' }];
    render(<TeaPhotos value={photos} onChange={jest.fn()} onRemovedUrl={onRemovedUrl} />);

    fireEvent.click(screen.getByLabelText('Удалить фото: Сухой лист'));
    expect(onRemovedUrl).toHaveBeenCalledWith('/api/uploads/u-1.png');
    expect(mainApi.deleteTeaPhoto).not.toHaveBeenCalled();
});

test('shows the server message when the upload fails', async () => {
    mainApi.uploadTeaPhoto.mockRejectedValue(new Error('Файл слишком большой (максимум 8 МБ).'));
    const onChange = jest.fn();
    render(<TeaPhotos value={[]} onChange={onChange} />);

    pick('Сухой лист');

    expect(await screen.findByText('Файл слишком большой (максимум 8 МБ).')).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
});
