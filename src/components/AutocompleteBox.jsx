import { Autocomplete, TextField, createFilterOptions } from '@mui/material';
import { forwardRef } from 'react';
import { ThemeProvider, createTheme, styled } from '@mui/material/styles';
import { useT } from '../i18n/index.js';
import { optionLabel } from '../i18n/options.js';


// `required` defaults to false: it used to be hard-coded on the inner TextField,
// which put the browser's own validation in front of the form. Stage 1 could
// then never be submitted from a voice note alone — react-hook-form never even
// ran, because the native submit was rejected first.
const AutocompleteBox = forwardRef(({ optionsObj, field, name, setValue, label, value, StyledPopper, required = false }, ref) => {
    const { t, locale } = useT();

    const filter = createFilterOptions();

    return (
        <Autocomplete
            {...field}
            value={value}
            onChange={(event, newValue) => {
                // console.log(newValue)
                if (typeof newValue === 'string') {
                    setValue(name, newValue);
                    // field.onChange(newValue)
                } else if (newValue && newValue.inputValue) {
                    setValue(name, {
                        label: newValue.inputValue, value: newValue.inputValue
                    });
                    // field.onChange({
                    //     label: newValue.inputValue, value: newValue.inputValue
                    // })
                } else {
                    setValue(name, newValue);
                    // field.onChange(newValue)
                }
            }}
            filterOptions={(options, params) => {
                const filtered = filter(options, params);

                const { inputValue } = params;
                // Suggest the creation of a new value
                const isExisting = options.some((option) => inputValue === option.label);
                if (inputValue !== '' && !isExisting) {
                    filtered.push({
                        inputValue,
                        // Display only — `inputValue` is what gets stored, so the
                        // wording around it never reaches the document.
                        label: t('wizard.addOption', { value: inputValue }),
                    });
                }

                return filtered;
            }}
            selectOnFocus
            clearOnBlur
            handleHomeEndKeys
            id="free-solo-with-text-demo"
            options={optionsObj}
            // Handles the string / synthetic / object shapes the same way this
            // did, and translates the list entries. A water brand or a shop name
            // is not in any table and comes back unchanged, which is the point.
            getOptionLabel={(option) => optionLabel(option, locale)}
            renderOption={(props, option) => {
                const { key, ...optionProps } = props;
                return (
                    <li key={key} {...optionProps}>
                        {option.label}
                    </li>
                );
            }}
            // sx={{ width: 300 }}
            freeSolo
            renderInput={(params) => (
                <TextField {...params} label={label} required={required}/>
            )}
            PopperComponent={StyledPopper}
        />

    )

})

export default AutocompleteBox;