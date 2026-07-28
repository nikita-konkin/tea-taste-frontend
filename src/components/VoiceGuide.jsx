import React from 'react';
import { MAX_TOTAL_SECONDS } from './VoiceNote.jsx';

// The recorder's own budget, not a number retyped into prose: if the cap ever
// moves, the instructions move with it.
const TRACK_MINUTES = Math.round(MAX_TOTAL_SECONDS / 60);

// Mirrors MONTHLY_LIMIT_SECONDS in the API's utils/voiceQuota.js. Deliberately a
// constant rather than a fetch: this is help text, and the live balance is on
// /profile, where it is read from the server and shown as a bar.
const MONTHLY_MINUTES = 30;

// Names of real controls, highlighted so they can be found on the page instead
// of read as ordinary prose.
const Key = ({ children }) => <span className="voiceguide__key">{children}</span>;

const Block = ({ title, children }) => (
    <section className="myforminteraction__section voiceguide__block">
        <h4 className="voiceguide__block-title">{title}</h4>
        <ul className="voiceguide__list">{children}</ul>
    </section>
);

// Short reference for the voice notes, opened from /my_forms and from the side
// menu. Read-only and self-contained: it makes no requests, so it works while
// the list is still loading and for a user who has no tastings yet.
function VoiceGuide() {
    return (
        <div className="voiceguide">
            <h3 className="voiceguide__title">Голосовые заметки</h3>
            <p className="voiceguide__lead">
                Расскажите о чае вслух — сервис расшифрует запись и предложит,
                чем заполнить поля формы.
            </p>

            <Block title="1. Записать">
                <li>
                    Кнопка <Key>● Записать</Key> есть на этапе 1 — общая заметка о чае —
                    и в каждом проливе на этапе 2.
                </li>
                <li>
                    Браузер спросит доступ к микрофону: без разрешения запись не начнётся.
                </li>
                <li>
                    Записей может быть несколько. Рядом с кнопкой видно, сколько времени
                    осталось: всего {TRACK_MINUTES} минут на одну дегустацию.
                </li>
                <li>
                    Пока форма не сохранена, любую запись можно прослушать и удалить
                    крестиком.
                </li>
            </Block>

            <Block title="2. Что происходит после сохранения">
                <li>
                    Записи склеиваются в одну дорожку: сначала общая заметка, потом
                    проливы по порядку.
                </li>
                <li>
                    На карточке в «Моих формах» появится <Key>Расшифровка записи…</Key> —
                    обычно это меньше минуты.
                </li>
                <li>
                    Готовую запись и текст видно в <Key>Просмотре</Key> карточки, в блоке
                    «Расшифровка записи».
                </li>
            </Block>

            <Block title="3. Заполнить поля из расшифровки">
                <li>
                    <Key>Изменить</Key> → <Key>Заполнить из расшифровки</Key>. Текст
                    разбирает YandexGPT: он вытаскивает название, вид чая, навеску, объём,
                    температуру и всё, что прозвучало вслух.
                </li>
                <li>
                    Каждое значение предлагается отдельно, рядом показано, что оно заменит.
                    Нажмите <Key>Применить</Key> у нужных или <Key>Применить всё</Key>.
                </li>
                <li>
                    Подсказки по проливам — время, впечатление, ароматы и вкусы — ждут
                    внутри блока своего пролива: <Key>Из записи</Key> → <Key>Применить</Key>.
                </li>
                <li>
                    Ничего не заполняется само и ничего не сохраняется, пока вы не нажмёте{' '}
                    <Key>Сохранить форму</Key>: распознавание и модель иногда ошибаются,
                    поэтому последнее слово за вами.
                </li>
                <li>
                    Разбор делается один раз и сохраняется: если закрыть диалог и открыть
                    заново, предложения останутся теми же — они помечены как «сохранённый
                    разбор».
                </li>
            </Block>

            <Block title="4. Приватность">
                <li>
                    Дегустация с записью никогда не публикуется сразу, даже если на этапе 1
                    включён переключатель «Опубликовать в блог».
                </li>
                <li>
                    Аудио и расшифровка попадут в ленту только после того, как вы сами
                    включите <Key>Публиковать аудиозапись и расшифровку</Key> в{' '}
                    <Key>Изменить</Key> — послушав запись целиком. Микрофон слышит всё,
                    что было в комнате.
                </li>
            </Block>

            <Block title="5. Лимиты">
                <li>
                    {TRACK_MINUTES} минут на одну дегустацию — это сумма всех её записей.
                </li>
                <li>
                    {MONTHLY_MINUTES} минут расшифровки в месяц на аккаунт. Остаток виден
                    на странице «Профиль».
                </li>
                <li>
                    Если месячный лимит исчерпан, запись всё равно сохранится и её можно
                    будет расшифровать в следующем месяце.
                </li>
            </Block>

            <Block title="Чтобы разбор получился точнее">
                <li>
                    Проговаривайте числа с названием: «навеска шесть грамм», «сто
                    миллилитров», «девяносто градусов», «пролив номер два, двадцать секунд».
                </li>
                <li>
                    Называйте вид чая вслух — «шэн пуэр», «улун», «красный». Это то поле,
                    которое чаще всего теряется.
                </li>
                <li>
                    Ароматы и вкусы называйте словами из списков формы («древесный, кора
                    дуба») — тогда они встанут в нужные поля. Всё, чего нет в справочнике,
                    не пропадёт: оно попадёт в описание пролива словами.
                </li>
                <li>
                    Записывайте в тишине и ближе к микрофону: расшифровка идёт по звуку,
                    а не по смыслу.
                </li>
            </Block>

            <p className="voiceguide__note">
                Если расшифровка не удалась, в «Просмотре» появится кнопка «Повторить
                расшифровку» — само аудио при этом не теряется. А если запись оказалась
                не о чае, поля не заполнятся: сервис скажет об этом прямо и оставит
                запись как есть.
            </p>
        </div>
    );
}

// The trigger's icon, in the thin line-art style of the menu icons.
export const MicIcon = () => (
    <svg className="voiceguide__icon" viewBox="0 0 24 24" width="18" height="18"
        fill="none" stroke="currentColor" strokeWidth="1.6"
        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="9" y="3" width="6" height="11" rx="3" />
        <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" />
    </svg>
);

export default VoiceGuide;
