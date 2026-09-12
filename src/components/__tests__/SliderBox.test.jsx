/* Slider mark labels: the ones that would overlap are dropped, the ends never
   are, and a wide slider keeps them all. Reproduces the phone-width case the
   labels were unreadable at. */
import React from 'react';
import { render, screen } from '@testing-library/react';
import SliderBox, { alignmentOf } from '../SliderBox.jsx';
import {
    SLIDER_WEIGHT_DATA,
    SLIDER_WATER_DATA,
    SLIDER_TEMPERATURE_DATA,
    SLIDER_PRICE_DATA,
} from '../../utils/utils.js';

// jsdom gives every element a zero width, and ResizeObserver does not exist —
// so the measured width is stubbed, which is exactly the input the thinning
// decision takes.
const withWidth = (px) => {
    global.ResizeObserver = class {
        observe() {}

        disconnect() {}
    };
    jest.spyOn(Element.prototype, 'getBoundingClientRect')
        .mockReturnValue({ width: px, height: 6, top: 0, left: 0, right: px, bottom: 6 });
};

const renderSlider = (marks, maxValue, units) => render(
    <SliderBox
        name="teaWeight"
        sliderName="Вес чая при заваривании"
        maxValue={maxValue}
        units={units}
        marks={marks}
        value={5}
        onChange={() => {}}
        setValue={() => {}}
    />,
);

const shownLabels = (container) =>
    [...container.querySelectorAll('.MuiSlider-markLabel')].map((el) => el.textContent);

const tickCount = (container) => container.querySelectorAll('.MuiSlider-mark').length;

afterEach(() => {
    jest.restoreAllMocks();
});

test('a wide slider keeps every label', () => {
    withWidth(600);
    const { container } = renderSlider(SLIDER_TEMPERATURE_DATA, 100, '°C');

    expect(shownLabels(container)).toEqual(['0°C', '25°C', '50°C', '90°C', '100°C']);
});

test('at phone width the crowded labels go and the ends stay', () => {
    withWidth(300);
    const { container } = renderSlider(SLIDER_TEMPERATURE_DATA, 100, '°C');
    const labels = shownLabels(container);

    // 90°C sits nine pixels from 100°C on a 300px track — that pair is the
    // overlap seen on the real page.
    expect(labels).not.toContain('90°C');
    expect(labels[0]).toBe('0°C');
    expect(labels[labels.length - 1]).toBe('100°C');
});

test('dropping a label keeps its tick', () => {
    withWidth(300);
    const { container } = renderSlider(SLIDER_PRICE_DATA, 150, '₽');

    expect(tickCount(container)).toBe(SLIDER_PRICE_DATA.length);
    expect(shownLabels(container).length).toBeLessThan(SLIDER_PRICE_DATA.length);
});

test('every stage-1 slider is readable at 320px', () => {
    withWidth(320);

    const cases = [
        [SLIDER_WEIGHT_DATA, 50, 'г'],
        [SLIDER_WATER_DATA, 1000, 'мл'],
        [SLIDER_TEMPERATURE_DATA, 100, '°C'],
        [SLIDER_PRICE_DATA, 150, '₽'],
    ];

    cases.forEach(([marks, max, units]) => {
        const { container, unmount } = renderSlider(marks, max, units);
        const labels = shownLabels(container);

        // Whatever survives, the scale still has both of its ends.
        expect(labels[0]).toBe(`${marks[0][1]}${units}`);
        expect(labels[labels.length - 1]).toBe(`${marks[marks.length - 1][1]}${units}`);
        unmount();
    });
});

// Alignment follows the mark's position on the scale, not its place in the
// array. The price slider runs to 150 while its last mark is 100₽, so aligning
// by index dragged that label two thirds of the way along the rail, off its own
// tick — which is what the first version of this fix did.
describe('edge alignment', () => {
    test('pulls in a mark that stands at an end of the scale', () => {
        expect(alignmentOf({ value: 0 }, 100)).toBe('start');
        expect(alignmentOf({ value: 100 }, 100)).toBe('end');
    });

    test('leaves the last mark centred when the scale runs past it', () => {
        // SLIDER_PRICE_DATA ends at 100 on a slider whose maximum is 150.
        const last = SLIDER_PRICE_DATA[SLIDER_PRICE_DATA.length - 1][0];
        expect(alignmentOf({ value: last }, 150)).toBe('center');
    });

    test('leaves the marks in between alone', () => {
        expect(alignmentOf({ value: 25 }, 100)).toBe('center');
        expect(alignmentOf({ value: 90 }, 100)).toBe('center');
    });
});

test('the value input carries the units and the field name', () => {
    withWidth(400);
    renderSlider(SLIDER_WEIGHT_DATA, 50, 'г');

    const input = screen.getByRole('spinbutton');
    expect(input).toHaveValue(5);
    expect(screen.getByText('г')).toBeInTheDocument();
    expect(screen.getByText('Вес чая при заваривании')).toBeInTheDocument();
});
