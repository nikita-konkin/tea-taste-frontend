import React, { useEffect, useMemo, useRef, useState } from 'react';
import Slider from '@mui/material/Slider';
import MuiInput from '@mui/material/Input';

// Rough on-screen width of a mark label. The labels are short numeric strings in
// 12px Jura; measuring each one in the DOM would cost a layout pass per render
// for a number that only has to answer "would these two collide?". Calibrated
// against the rendered labels — «500мл» is the widest per character at 7.22px,
// «100°C» the narrowest at 6.04 — and rounded up, so the estimate errs toward
// dropping a label rather than letting two overlap.
const CHAR_PX = 7.3;
const labelPx = (text) => String(text).length * CHAR_PX;

// Minimum clear space between two labels before they read as one string.
const GAP_PX = 8;

// How a label sits over its tick. Only a mark standing at one end of the scale
// is pulled inward — by position, not by its place in the array: the price
// slider runs to 150 but its last mark is 100₽, which belongs centred over its
// tick at two thirds of the track, not shoved against the right edge.
// Exported for the tests: this is the geometry, and jsdom cannot answer it from
// the rendered output — it resolves emotion's `[data-index]` rules unreliably,
// while the attribute itself is verified in a real browser.
export const alignmentOf = (mark, max) => {
    if (mark.value <= 0) return 'start';
    if (mark.value >= max) return 'end';
    return 'center';
};

// Which labels fit side by side at the width the slider actually has.
//
// Every mark keeps its tick — only the text is dropped, and only where it would
// run into a neighbour. The outermost labels always win: the scale is read
// against its ends, and «0г … 50г» with a bare tick between them is far more use
// than «0г5г10г» smeared together, which is what a 360px phone was showing.
const fitLabels = (marks, max, width) => {
    if (!width || marks.length < 2) return marks;

    const lastIndex = marks.length - 1;
    const span = (mark) => {
        const w = labelPx(mark.label);
        const x = (mark.value / max) * width;
        const align = alignmentOf(mark, max);
        if (align === 'start') return [x, x + w];
        if (align === 'end') return [x - w, x];
        return [x - w / 2, x + w / 2];
    };

    let cursor = span(marks[0])[1];
    const lastStart = span(marks[lastIndex])[0];

    return marks.map((mark, index) => {
        if (index === 0 || index === lastIndex) return mark;

        const [left, right] = span(mark);
        if (left - GAP_PX >= cursor && right + GAP_PX <= lastStart) {
            cursor = right;
            return mark;
        }
        // label: undefined keeps the tick and removes the text.
        return { value: mark.value, label: undefined };
    });
};

function SliderBox({
    name, onChange, value, sliderName, maxValue, defaultValue,
    units, marks, setValue, step,
}) {
    const trackRef = useRef(null);
    const [width, setWidth] = useState(0);

    // The form is one column that stretches from a phone to a desktop, so the
    // decision above cannot be made from a breakpoint — it needs the real width,
    // which also changes when the phone is rotated.
    useEffect(() => {
        const node = trackRef.current;
        if (!node) return undefined;

        const measure = () => setWidth(node.getBoundingClientRect().width);
        measure();

        if (typeof ResizeObserver === 'undefined') {
            window.addEventListener('resize', measure);
            return () => window.removeEventListener('resize', measure);
        }
        const observer = new ResizeObserver(measure);
        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    const allMarks = useMemo(
        () => (marks || []).map(([markValue, label]) => ({
            value: markValue,
            label: `${label}${units}`,
        })),
        [marks, units],
    );

    const visibleMarks = useMemo(
        () => fitLabels(allMarks, maxValue, width),
        [allMarks, maxValue, width],
    );

    const handleSliderChange = (event, newValue) => {
        onChange(event, newValue);
        setValue(name, newValue);
    };

    const handleInputChange = (event) => {
        const newValue = Number(event.target.value);
        onChange(event, newValue);
        setValue(name, newValue);
    };

    // Only labels standing at the very ends of the scale are pulled inward, and
    // MUI keys its mark elements by index — so the alignment rules are built
    // from the marks that qualify, which is usually the first and the last but
    // is neither on a scale whose marks stop short of its maximum.
    const edgeRules = useMemo(() => {
        const rules = {};
        allMarks.forEach((mark, index) => {
            const align = alignmentOf(mark, maxValue);
            if (align === 'center') return;
            rules[`& .MuiSlider-markLabel[data-index="${index}"]`] = {
                transform: align === 'start' ? 'translateX(0)' : 'translateX(-100%)',
            };
        });
        return rules;
    }, [allMarks, maxValue]);

    return (
        <div className="sliderbox">
            {/* Name and value on one row, slider full width underneath. The
                value used to sit in a column beside the slider, where the last
                mark label collided with it on every screen and stole the width
                that made the labels overlap in the first place. */}
            <div className="sliderbox__head">
                <span className="sliderbox__name" id={`${name}-label`}>{sliderName}</span>
                <span className="sliderbox__value">
                    <MuiInput
                        value={value}
                        size="small"
                        onChange={handleInputChange}
                        defaultValue={defaultValue}
                        inputProps={{
                            step,
                            min: 0,
                            max: maxValue,
                            type: 'number',
                            'aria-labelledby': `${name}-label`,
                        }}
                        sx={{
                            width: '62px',
                            color: '#FFFFFF',
                            fontSize: '15px',
                            '& input': { textAlign: 'right', padding: '0 2px 2px 0' },
                            '&::before': { borderBottom: '1px solid rgba(255, 255, 255, 0.42)' },
                            '&:hover:not(.Mui-disabled)::before': { borderBottom: '1px solid #FFFFFF' },
                            '&::after': { borderBottom: '2px solid #a8f493' },
                        }}
                    />
                    <span className="sliderbox__units">{units}</span>
                </span>
            </div>

            <div className="sliderbox__track" ref={trackRef}>
                {/* No disableGutters here: it is a Container/Toolbar prop, and
                    Slider passed it straight through to the DOM, where React
                    warned about it on every render. */}
                <Slider
                    valueLabelDisplay="auto"
                    defaultValue={defaultValue}
                    getAriaValueText={(v) => `${v}${units}`}
                    aria-labelledby={`${name}-label`}
                    marks={visibleMarks}
                    max={maxValue}
                    name={name}
                    onChange={handleSliderChange}
                    value={value}
                    step={step}
                    sx={{
                        width: '100%',
                        // MUI's own vertical padding is the touch target: the
                        // whole 46px band drags, not just the 6px rail. The old
                        // `padding: 0` shrank that to a hairline on a phone —
                        // and it is why `top: 16px` put the labels ON the rail,
                        // since the labels are positioned from the padded top.
                        padding: '20px 0',
                        color: '#FFFFFF',
                        '& .MuiSlider-thumb': {
                            borderRadius: '8px',
                            // Comfortably tappable without making the rail thick.
                            width: '18px',
                            height: '18px',
                        },
                        '& .MuiSlider-valueLabelOpen': {
                            color: '#FFFFFF',
                            backgroundColor: '#728A7C',
                        },
                        '& .MuiSlider-markLabel': {
                            color: '#FFFFFF',
                            fontSize: '12px',
                            // Measured from the padded top of the root: 20px of
                            // padding plus the rail, so the text clears the
                            // ticks instead of sitting across them.
                            top: '31px',
                            whiteSpace: 'nowrap',
                        },
                        // Labels at the ends of the scale hug the ends of the
                        // track instead of being centred on their tick, which is
                        // what used to push the last one past the slider and
                        // into the value field.
                        ...edgeRules,
                        '& .MuiSlider-mark': {
                            backgroundColor: '#00ffaf',
                            width: '4px',
                            height: '6px',
                        },
                        '& .MuiSlider-rail': {
                            backgroundColor: '#728A7C',
                            height: '6px',
                            opacity: 1,
                        },
                        '& .MuiSlider-track': {
                            height: '6px',
                            border: 'none',
                        },
                    }}
                />
            </div>
        </div>
    );
}

export default SliderBox;
