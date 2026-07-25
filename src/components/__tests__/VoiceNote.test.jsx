import React, { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VoiceNote, { totalSeconds, MAX_TOTAL_SECONDS } from '../VoiceNote.jsx';
import { mainApi } from '../../utils/MainAPI.jsx';
import { isSupported, startRecording } from '../../utils/recorder.js';

// jsdom has neither MediaRecorder nor getUserMedia, so the wrapper is mocked
// wholesale — that separation is the reason it lives in its own module.
jest.mock('../../utils/recorder.js', () => ({
    isSupported: jest.fn(() => true),
    startRecording: jest.fn(),
}));

// Named export, matching the real module — a default-export mock would pass
// here and then fail the production build, which is exactly what it did.
jest.mock('../../utils/MainAPI.jsx', () => ({
    mainApi: { uploadVoice: jest.fn(), deleteVoice: jest.fn() },
}));

const blob = { size: 1234 };

const stubRecorder = (seconds = 12) => {
    const stop = jest.fn(() => Promise.resolve({ blob, seconds }));
    startRecording.mockResolvedValue({ stop, cancel: jest.fn() });
    return stop;
};

// The parent owns the list, exactly as the wizard does.
function Harness({ initial = [], brewingNumber = 0, onRemovedUrl }) {
    const [segments, setSegments] = useState(initial);
    return (
        <VoiceNote
            value={segments}
            onChange={setSegments}
            brewingNumber={brewingNumber}
            label="о чае"
            onRemovedUrl={onRemovedUrl}
        />
    );
}

beforeEach(() => {
    jest.clearAllMocks();
    isSupported.mockReturnValue(true);
    mainApi.uploadVoice.mockResolvedValue({ data: { url: '/api/uploads/u-1.mp3', duration: 12.4 } });
});

test('records, uploads and reports the segment with the server duration', async () => {
    stubRecorder(12);
    render(<Harness brewingNumber={2} />);

    fireEvent.click(screen.getByRole('button', { name: 'Записать заметку: о чае' }));
    await screen.findByRole('button', { name: 'Остановить запись' });
    fireEvent.click(screen.getByRole('button', { name: 'Остановить запись' }));

    await waitFor(() => expect(mainApi.uploadVoice).toHaveBeenCalledWith(blob));
    // The stopwatch said 12; ffprobe said 12.4, and the server wins.
    const player = await screen.findByText('0:12');
    expect(player).toBeInTheDocument();
});

test('shows only the segments belonging to its own пролив', () => {
    render(<Harness
        brewingNumber={1}
        initial={[
            { url: '/api/uploads/a.mp3', brewingNumber: 0, duration: 30 },
            { url: '/api/uploads/b.mp3', brewingNumber: 1, duration: 20 },
        ]}
    />);

    expect(screen.getAllByText(/^0:(20|30)$/)).toHaveLength(1);
    expect(screen.getByText('0:20')).toBeInTheDocument();
});

test('the five-minute budget counts every пролив, not just this one', () => {
    render(<Harness
        brewingNumber={3}
        initial={[
            { url: '/api/uploads/a.mp3', brewingNumber: 1, duration: 200 },
            { url: '/api/uploads/b.mp3', brewingNumber: 2, duration: 60 },
        ]}
    />);

    expect(screen.getByText(/осталось 0:40 из 5:00/)).toBeInTheDocument();
});

test('recording is refused once the budget is spent', () => {
    render(<Harness initial={[{ url: '/api/uploads/a.mp3', brewingNumber: 0, duration: MAX_TOTAL_SECONDS }]} />);

    expect(screen.getByRole('button', { name: /Записать заметку/ })).toBeDisabled();
    expect(screen.getByText(/лимит 5 минут исчерпан/)).toBeInTheDocument();
});

test('removing deletes the file immediately when no deferral is asked for', () => {
    render(<Harness initial={[{ url: '/api/uploads/a.mp3', brewingNumber: 0, duration: 10 }]} />);

    fireEvent.click(screen.getByRole('button', { name: 'Удалить запись: о чае' }));
    expect(mainApi.deleteVoice).toHaveBeenCalledWith('/api/uploads/a.mp3');
});

test('with onRemovedUrl the file is left alone until the caller saves', () => {
    // The edit dialog defers: the url is live on a stored tasting, and unlinking
    // before its PATCH resolves would leave a broken player if the save failed.
    const onRemovedUrl = jest.fn();
    render(<Harness
        initial={[{ url: '/api/uploads/a.mp3', brewingNumber: 0, duration: 10 }]}
        onRemovedUrl={onRemovedUrl}
    />);

    fireEvent.click(screen.getByRole('button', { name: 'Удалить запись: о чае' }));
    expect(onRemovedUrl).toHaveBeenCalledWith('/api/uploads/a.mp3');
    expect(mainApi.deleteVoice).not.toHaveBeenCalled();
});

test('a failed upload is reported and nothing is added', async () => {
    stubRecorder();
    mainApi.uploadVoice.mockRejectedValue(new Error('Запись слишком длинная.'));
    render(<Harness />);

    fireEvent.click(screen.getByRole('button', { name: 'Записать заметку: о чае' }));
    await screen.findByRole('button', { name: 'Остановить запись' });
    fireEvent.click(screen.getByRole('button', { name: 'Остановить запись' }));

    expect(await screen.findByText('Запись слишком длинная.')).toBeInTheDocument();
});

test('a denied microphone explains itself', async () => {
    const denied = new Error('denied');
    denied.name = 'NotAllowedError';
    startRecording.mockRejectedValue(denied);
    render(<Harness />);

    fireEvent.click(screen.getByRole('button', { name: 'Записать заметку: о чае' }));
    expect(await screen.findByText(/Разрешите запись в настройках браузера/)).toBeInTheDocument();
});

test('an unsupported browser gets an explanation instead of a dead button', () => {
    isSupported.mockReturnValue(false);
    render(<Harness />);

    expect(screen.queryByRole('button', { name: /Записать/ })).not.toBeInTheDocument();
    expect(screen.getByText(/не умеет записывать звук/)).toBeInTheDocument();
});

test('totalSeconds tolerates missing durations', () => {
    expect(totalSeconds([{ duration: 10 }, {}, { duration: '5' }])).toBe(15);
});
