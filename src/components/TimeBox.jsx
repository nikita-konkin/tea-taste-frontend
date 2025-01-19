import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme, styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';

import { useTeaFormContext } from './TeaFormContext';

const theme = createTheme({
    typography: {
        "fontFamily": `jura`,
        "fontSize": 16,
    }
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

const StyledTimePicker = styled(TimePicker)({
    width: '98%',
    margin: '40px 0 0 0',
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

const TimeBox = ({ timeValue, stagesHandler, id, straitNum }) => {

    const { updateStraitsStagesFormData } = useTeaFormContext();

    const [value, setValue] = useState(timeValue);

    useEffect(() => {
        updateStraitsStagesFormData({ [String(straitNum) + String(id)]: dayjs(value).format('HH:mm:ss') });
    }, []);

    return (
        <ThemeProvider theme={theme}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <StyledTimePicker
                    ampm={false}
                    // id={String(straitNum) + String(id)} 
                    views={['hours', 'minutes', 'seconds']}
                    label={'Time'}
                    inputFormat="HH:mm:ss"
                    mask="__:__:__"
                    value={value}
                    onChange={(val) => {
                        const inputId = String(straitNum) + String(id);
                        // console.log(val);
                        const time = dayjs(val).format('HH:mm:ss');
                        stagesHandler(time, inputId);
                        setValue(val);
                    }}
                    renderInput={(params) => (
                        <StyledTextField 
                            {...params} 
                            // id={String(straitNum) + String(id)} 
                        />
                    )}
                />
            </LocalizationProvider>
        </ThemeProvider>
    );
};

export default TimeBox;