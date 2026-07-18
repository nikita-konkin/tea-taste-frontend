/* Tests for the single-field descriptor picker used in Stage 2. */
import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import DescriptorPicker, { flattenDescriptorDB } from '../DescriptorPicker.jsx';

const db = {
    response: [
        {
            category: 'Цветочный',
            subcategories: [
                { name: 'Жасмин', descriptors: ['Зелёный жасмин', 'Сухой жасмин'] },
                { name: 'Роза', descriptors: [] },
            ],
        },
        {
            category: 'Другое',
            subcategories: [{ name: 'Произвольное описание', descriptors: [] }],
        },
    ],
};

describe('flattenDescriptorDB', () => {
    test('emits category, subcategory and descriptor paths', () => {
        const flat = flattenDescriptorDB(db);
        const paths = flat.map((o) => o.path);
        expect(paths).toContain('Цветочный');
        expect(paths).toContain('Цветочный → Жасмин');
        expect(paths).toContain('Цветочный → Жасмин → Зелёный жасмин');
        expect(paths).toContain('Другое → Произвольное описание');
    });

    test('handles missing db gracefully', () => {
        expect(flattenDescriptorDB(null)).toEqual([]);
        expect(flattenDescriptorDB({})).toEqual([]);
    });
});

describe('DescriptorPicker', () => {
    const renderPicker = (props = {}) => {
        const onStagesChange = jest.fn();
        render(
            <DescriptorPicker
                label="Аромат"
                db={db}
                stage1={props.stage1 || null}
                stage2={props.stage2 || null}
                stage3={props.stage3 || null}
                onStagesChange={onStagesChange}
            />
        );
        return onStagesChange;
    };

    test('typing filters across all levels and picking a leaf sets all three stages', () => {
        const onStagesChange = renderPicker();

        const input = screen.getByLabelText('Аромат');
        fireEvent.change(input, { target: { value: 'зелён' } });

        const listbox = screen.getByRole('listbox');
        fireEvent.click(within(listbox).getByText('Цветочный → Жасмин → Зелёный жасмин'));

        expect(onStagesChange).toHaveBeenCalledWith(['Цветочный', 'Жасмин', 'Зелёный жасмин']);
    });

    test('picking an intermediate path leaves deeper stages empty', () => {
        const onStagesChange = renderPicker();

        const input = screen.getByLabelText('Аромат');
        fireEvent.change(input, { target: { value: 'Роза' } });

        const listbox = screen.getByRole('listbox');
        fireEvent.click(within(listbox).getByText('Цветочный → Роза'));

        expect(onStagesChange).toHaveBeenCalledWith(['Цветочный', 'Роза', null]);
    });

    test('shows the current value assembled from existing stages', () => {
        renderPicker({ stage1: { label: 'Цветочный' }, stage2: { label: 'Жасмин' } });
        expect(screen.getByDisplayValue('Цветочный → Жасмин')).toBeInTheDocument();
    });

    test('clearing the field resets all stages', () => {
        const onStagesChange = renderPicker({
            stage1: { label: 'Цветочный' },
            stage2: { label: 'Жасмин' },
            stage3: { label: 'Сухой жасмин' },
        });

        fireEvent.click(screen.getByLabelText('Clear'));
        expect(onStagesChange).toHaveBeenCalledWith([null, null, null]);
    });
});
