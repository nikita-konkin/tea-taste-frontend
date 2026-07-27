import { Autocomplete, TextField, createFilterOptions } from '@mui/material';
import { forwardRef } from 'react';
import { ThemeProvider, createTheme, styled } from '@mui/material/styles';


// `required` defaults to false: it used to be hard-coded on the inner TextField,
// which put the browser's own validation in front of the form. Stage 1 could
// then never be submitted from a voice note alone — react-hook-form never even
// ran, because the native submit was rejected first.
const AutocompleteBox = forwardRef(({ optionsObj, field, name, setValue, label, value, StyledPopper, required = false }, ref) => {

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
                        label: `Добавить "${inputValue}"`,
                    });
                }

                return filtered;
            }}
            selectOnFocus
            clearOnBlur
            handleHomeEndKeys
            id="free-solo-with-text-demo"
            options={optionsObj}
            getOptionLabel={(option) => {
                // Value selected with enter, right from the input
                if (typeof option === 'string') {
                    return option;
                }
                // Add "xxx" option created dynamically
                if (option.inputValue) {
                    return option.inputValue;
                }
                // Regular option
                return option.label;
            }}
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