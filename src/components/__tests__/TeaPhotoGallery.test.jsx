/* Tests for the read-only photo strip and its full-screen viewer. */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TeaPhotoGallery from '../TeaPhotoGallery.jsx';

const photos = [
    { url: '/api/uploads/u-dry.png', kind: 'dry' },
    { url: '/api/uploads/u-liquor.png', kind: 'liquor' },
    { url: '/api/uploads/u-wet.png', kind: 'wet' },
];

const openAt = (label) =>
    fireEvent.click(screen.getByLabelText(`Открыть фото во весь экран: ${label}`));

const viewer = () => screen.queryByRole('dialog', { name: 'Просмотр фото' });
const shown = () => viewer().querySelector('.lightbox__image').getAttribute('src');

test('renders nothing without photos', () => {
    const { container } = render(<TeaPhotoGallery photos={[]} />);
    expect(container).toBeEmptyDOMElement();
});

test('shows the photos in slot order regardless of input order', () => {
    render(<TeaPhotoGallery photos={[photos[2], photos[0]]} />);
    const alts = screen.getAllByRole('img').map((i) => i.getAttribute('alt'));
    expect(alts).toEqual(['Сухой лист', 'Мокрый лист']);
});

test('opens the viewer on the photo that was clicked', () => {
    render(<TeaPhotoGallery photos={photos} />);
    expect(viewer()).not.toBeInTheDocument();

    openAt('Настой');
    expect(viewer()).toBeInTheDocument();
    expect(shown()).toBe('/api/uploads/u-liquor.png');
});

test('steps through the photos with the arrows and wraps around', () => {
    render(<TeaPhotoGallery photos={photos} />);
    openAt('Мокрый лист');

    fireEvent.click(screen.getByLabelText('Следующее фото'));
    expect(shown()).toBe('/api/uploads/u-dry.png');

    fireEvent.click(screen.getByLabelText('Предыдущее фото'));
    expect(shown()).toBe('/api/uploads/u-wet.png');
});

test('arrow keys navigate the viewer', () => {
    render(<TeaPhotoGallery photos={photos} />);
    openAt('Сухой лист');

    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(shown()).toBe('/api/uploads/u-liquor.png');
});

test('closes from the button and from Escape, and restores page scroll', () => {
    render(<TeaPhotoGallery photos={photos} />);

    openAt('Сухой лист');
    expect(document.body.style.overflow).toBe('hidden');
    fireEvent.click(screen.getByLabelText('Закрыть просмотр'));
    expect(viewer()).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe('');

    openAt('Сухой лист');
    fireEvent.keyUp(document, { key: 'Escape' });
    expect(viewer()).not.toBeInTheDocument();
});

test('keeps Escape to itself so the popup underneath stays open', () => {
    // reactjs-popup closes on Escape via a document *keyup* listener, so the
    // viewer has to swallow that exact event — not just the keydown, which
    // would leave the trailing keyup to close the popup behind it.
    const outerUp = jest.fn();
    const outerDown = jest.fn();
    document.addEventListener('keyup', outerUp);
    document.addEventListener('keydown', outerDown);
    try {
        render(<TeaPhotoGallery photos={photos} />);
        openAt('Сухой лист');

        fireEvent.keyDown(document, { key: 'Escape' });
        fireEvent.keyUp(document, { key: 'Escape' });
        expect(outerDown).not.toHaveBeenCalled();
        expect(outerUp).not.toHaveBeenCalled();
        expect(viewer()).not.toBeInTheDocument();

        // Once closed, the page gets its keyboard back.
        fireEvent.keyUp(document, { key: 'Escape' });
        expect(outerUp).toHaveBeenCalled();
    } finally {
        document.removeEventListener('keyup', outerUp);
        document.removeEventListener('keydown', outerDown);
    }
});

test('a single photo gets no navigation arrows', () => {
    render(<TeaPhotoGallery photos={[photos[0]]} />);
    openAt('Сухой лист');
    expect(screen.queryByLabelText('Следующее фото')).not.toBeInTheDocument();
});
