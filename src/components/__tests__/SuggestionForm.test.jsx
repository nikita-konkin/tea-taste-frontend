/* The feedback form's two failure paths. "Not signed in" gets its own wording —
   it is the one error the user can act on — and telling it apart used to mean
   matching the API's Russian message, which broke the moment the API learned to
   answer in three languages and then drifted out of sync anyway. */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SuggestionForm from '../SuggestionForm.jsx';
import messages from '../../i18n/messages.js';
import { mainApi } from '../../utils/MainAPI.jsx';

jest.mock('../PopupContext.jsx', () => ({ usePopup: () => ({ closePopup: () => {} }) }));

const show = (route = '/') => {
    render(
        <MemoryRouter initialEntries={[route]}>
            <SuggestionForm />
        </MemoryRouter>,
    );
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'экспорт в PDF' } });
    fireEvent.click(screen.getByText(messages[route === '/' ? 'ru' : 'en']['suggest.send']));
};

afterEach(() => jest.restoreAllMocks());

test('a 401 asks the reader to sign in, in their own language', async () => {
    // What the API actually answers: a localized message and no status in the
    // body — the code is carried over from the response by mainApi.error().
    jest.spyOn(mainApi, 'sendSuggestion').mockRejectedValue(
        Object.assign(new Error('You need to sign in.'), { statusCode: 401 }),
    );
    show('/en/blog');

    expect(await screen.findByText(messages.en['suggest.needAuth'])).toBeInTheDocument();
});

test('any other failure shows what the server said', async () => {
    jest.spyOn(mainApi, 'sendSuggestion').mockRejectedValue(
        Object.assign(new Error('Слишком много запросов.'), { statusCode: 429 }),
    );
    show();

    expect(await screen.findByText('Слишком много запросов.')).toBeInTheDocument();
});

test('the request carries the status through to the caller', async () => {
    // The regression guard for the fix itself: without this the 401 branch above
    // can only ever be reached by a message string.
    global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ status: 'error', message: 'Необходима авторизация.' }),
    });

    await expect(mainApi.sendSuggestion('текст')).rejects.toMatchObject({ statusCode: 401 });
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
});
