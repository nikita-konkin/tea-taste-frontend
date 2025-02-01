import React, { useState, useEffect, forwardRef } from 'react';
import { ThemeProvider, createTheme, styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';

const theme = createTheme({
    typography: {
        fontFamily: 'jura',
        fontSize: 16,
    },
    components: {
        MuiInputLabel: {
            styleOverrides: {
                root: {
                    color: '#ffffff', // Change label color to white
                },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#ffffff', // Change border color to white
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#ffffff', // Change border color to white on hover
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#ffffff', // Change border color to white when focused
                    },
                    color: '#ffffff', // Change text color to white
                },
            },
        },
        MuiIconButton: {
            styleOverrides: {
                root: {
                    color: '#ffffff', // Change icon button color to white
                },
            },
        },
    },
});

const StyledTextField = styled(TextField)({
    width: '100%',
    "& label, & label.Mui-focused": {
        color: "#ffffff",
        margin: '0 0 0 5px',
    },
    "& .MuiInputBase-root": {
        color: "#ffffff",
    },
    "& .MuiOutlinedInput-root": {
        "& fieldset": {
            borderColor: "#ffffff",
        },
        "&:hover fieldset": {
            borderColor: "#ffffff",
        },
        "&.Mui-focused fieldset": {
            borderColor: "#ffffff",
        },
    },
});

const TimeBox = forwardRef(({ name, value, setValue, timeFormat = 'HH:mm:ss' }, ref) => {
    const [timeValue, setTimeValue] = useState(dayjs(value, timeFormat));

    useEffect(() => {
        if (value) {
            setTimeValue(dayjs(value, timeFormat));
        }
    }, [value, timeFormat]);

    const handleTimeChange = (newValue) => {
        const formattedTime = dayjs(newValue).format(timeFormat);
        setTimeValue(dayjs(newValue, timeFormat));
        setValue(name, newValue);
    };

    return (
        <ThemeProvider theme={theme}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimePicker
                    ampm={false}
                    views={['hours', 'minutes', 'seconds']}
                    label={'Время пролива'}
                    name={name}
                    inputFormat={timeFormat}
                    mask="__:__:__"
                    value={timeValue}
                    timeSteps={{'minutes':1, 'seconds':1}}
                    onChange={handleTimeChange}
                    textField={(params) => (
                        <StyledTextField 
                            {...params} 
                            ref={ref}
                            InputLabelProps={{
                                style: { color: '#ffffff' }, // Change label color to white
                            }}
                            InputProps={{
                                style: { color: '#ffffff' }, // Change text color to white
                            }}
                        />
                    )}
                />
            </LocalizationProvider>
        </ThemeProvider>
    );
});

export default TimeBox;