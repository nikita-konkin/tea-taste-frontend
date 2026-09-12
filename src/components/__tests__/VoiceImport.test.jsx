/* The import page. What matters here is not the prose — a human reads that —
   but that the page is wired to the same draft the wizard reads, that it offers
   no microphone, and that it keeps the reader's language on the way to the
   form. The draft is the whole point: a file picked here is useless unless
   stage 1 finds it. */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import VoiceImport from '../VoiceImport.jsx';
import { PopupProvider } from '../PopupContext.jsx';
import { readVoiceDraft, clearVoiceDraft } from '../../utils/voiceDraft.js';
import messages from '../../i18n/messages.js';
import { mainApi } from '../../utils/MainAPI.jsx';

jest.mock('../../utils/recorder.js', () => ({
    isSupported: jest.fn(() => true),
    startRecording: jest.fn(),
}));

jest.mock('../../utils/MainAPI.jsx', () => ({
    mainApi: { uploadVoice: jest.fn(), deleteVoice: jest.fn() },
}));

const show = (route = '/voice_import') => render(
    <PopupProvider>
        <MemoryRouter initialEntries={[route]}>
            <VoiceImport />
        </MemoryRouter>
    </PopupProvider>,
);

const picker = () => document.querySelector('input[type="file"]');

const pick = (name = 'Recorder__202609071250.m4a') => {
    const file = new File(['xx'], name, { type: 'audio/mp4' });
    fireEvent.change(picker(), { target: { files: [file] } });
    return file;
};

beforeEach(() => {
    clearVoiceDraft();
    localStorage.clear();
    mainApi.uploadVoice.mockReset();
});

test('states the requirements and offers a file, not a microphone', () => {
    show();

    expect(screen.getByText(messages.ru['import.s1'])).toBeInTheDocument();
    // The two limits people get wrong: the 5 minutes are shared with the
    // per-пролив notes, and the numbers have to be spoken.
    expect(screen.getByText(messages.ru['import.s1b'])).toBeInTheDocument();
    expect(screen.getByText(/5 минут/)).toBeInTheDocument();

    expect(screen.getByText(messages.ru['voice.import'])).toBeInTheDocument();
    expect(screen.queryByText(messages.ru['voice.recordButton'])).not.toBeInTheDocument();
});

test('a picked file lands in the draft the wizard reads, marked as a whole session', async () => {
    mainApi.uploadVoice.mockResolvedValue({ data: { url: '/api/uploads/a.mp3', duration: 274 } });
    show();

    pick();

    await waitFor(() => expect(readVoiceDraft()).toEqual([{
        url: '/api/uploads/a.mp3',
        brewingNumber: 0,
        duration: 274,
        // Not пролив 0: the проливы are inside it. Without this the extraction
        // reads the whole tasting as one general note about the tea.
        whole: true,
    }]));
});

test('the file is handed to the upload endpoint as it is', async () => {
    mainApi.uploadVoice.mockResolvedValue({ data: { url: '/api/uploads/b.mp3', duration: 12 } });
    show();

    const file = pick();

    await waitFor(() => expect(mainApi.uploadVoice).toHaveBeenCalledWith(file));
});

test('a failed upload says so and leaves the draft empty', async () => {
    mainApi.uploadVoice.mockRejectedValue(new Error('Файл слишком большой'));
    show();

    pick();

    expect(await screen.findByText('Файл слишком большой')).toBeInTheDocument();
    expect(readVoiceDraft()).toEqual([]);
});

test('the way on to the form keeps the reader’s language', () => {
    show('/en/voice_import');

    const go = screen.getByText(messages.en['import.toForm']);
    expect(go.closest('a')).toHaveAttribute('href', '/en/form_1');
    expect(screen.getByText(messages.en['import.s1'])).toBeInTheDocument();
});
