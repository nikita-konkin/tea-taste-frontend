import React, { useMemo } from 'react';
import { Autocomplete, TextField, Popper, autocompleteClasses } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useT } from '../i18n/index.js';
import { translateDescriptor, translateDescriptorPath } from '../i18n/descriptors.js';

const StyledPopper = styled(Popper)({
    [`& .${autocompleteClasses.listbox}`]: {
        boxSizing: 'border-box',
        backgroundColor: '#425E42',
        color: '#ffffff',
        '& ul': {
            padding: 0,
            margin: 0,
        },
    },
    [`& .${autocompleteClasses.groupLabel}`]: {
        backgroundColor: '#2F4A3A',
        color: '#ffffff',
        fontWeight: 600,
        lineHeight: '36px',
    },
    [`& .${autocompleteClasses.noOptions}`]: {
        backgroundColor: '#425E42',
        color: '#ffffff',
    },
});

// Flattens the aroma/taste dictionary ({response: [{category, subcategories:
// [{name, descriptors}]}]}) into a single searchable list of full paths.
// Intermediate paths (category only, category+subcategory) are included so
// the user is never forced to pick deeper than they can actually discern.
export const flattenDescriptorDB = (db) => {
    const out = [];
    if (!db || !db.response) return out;
    for (const cat of db.response) {
        out.push({ path: cat.category, stages: [cat.category, null, null] });
        for (const sub of cat.subcategories || []) {
            out.push({
                path: `${cat.category} → ${sub.name}`,
                stages: [cat.category, sub.name, null],
            });
            for (const d of sub.descriptors || []) {
                out.push({
                    path: `${cat.category} → ${sub.name} → ${d}`,
                    stages: [cat.category, sub.name, d],
                });
            }
        }
    }
    return out;
};

const quickPickStyle = {
    background: 'rgba(255, 255, 255, 0.12)',
    border: '1px solid rgba(255, 255, 255, 0.30)',
    borderRadius: '999px',
    color: '#ffffff',
    padding: '3px 12px',
    margin: '6px 6px 0 0',
    fontSize: '13px',
    fontFamily: 'inherit',
    cursor: 'pointer',
};

// One searchable field over the whole flattened taxonomy: typing matches any
// level ("жасм" finds every jasmine entry with its full path), one pick fills
// all three stages at once. Stored data stays in the same three-stage format.
// quickPicks (optional): [{stages: [s1, s2, s3], count}] — the user's most
// frequent descriptors, rendered as one-tap chips under the field.
function DescriptorPicker({ label, db, stage1, stage2, stage3, onStagesChange, quickPicks }) {
    const { t, locale } = useT();
    const options = useMemo(() => flattenDescriptorDB(db), [db]);

    const currentPath = [stage1, stage2, stage3]
        .map((s) => s && s.label)
        .filter(Boolean)
        .join(' → ');
    const value = currentPath
        ? options.find((o) => o.path === currentPath) || {
            path: currentPath,
            stages: [stage1?.label || null, stage2?.label || null, stage3?.label || null],
        }
        : null;

    return (
        <div>
            {/* Display translates, storage does not: `stages` goes back to the
                caller as the Russian the database is keyed by, while the label
                MUI both shows and filters on is in the reading language — so
                typing "jasm" finds it on the English site and "茉莉" on the
                Chinese one. `path` stays the identity used for equality. */}
            <Autocomplete
                options={options}
                groupBy={(o) => translateDescriptor(o.stages[0], locale)}
                getOptionLabel={(o) => translateDescriptorPath(o.path, locale)}
                isOptionEqualToValue={(o, v) => o.path === v.path}
                value={value}
                onChange={(_, data) =>
                    onStagesChange(data ? [...data.stages] : [null, null, null])
                }
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label={label}
                        placeholder={t('wizard.descriptorPlaceholder')}
                    />
                )}
                PopperComponent={StyledPopper}
                noOptionsText={t('wizard.descriptorNotFound')}
            />
            {quickPicks && quickPicks.length > 0 && (
                <div aria-label={t('wizard.frequentlyUsed')}>
                    {quickPicks.map((q) => {
                        const stages = q.stages.filter(Boolean);
                        const short = stages[stages.length - 1];
                        return (
                            <button type="button" key={stages.join('|')}
                                style={quickPickStyle}
                                title={translateDescriptorPath(stages.join(' → '), locale)}
                                onClick={() => onStagesChange([q.stages[0] || null, q.stages[1] || null, q.stages[2] || null])}>
                                {translateDescriptor(short, locale)}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default DescriptorPicker;
