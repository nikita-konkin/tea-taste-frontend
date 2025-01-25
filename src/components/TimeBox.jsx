import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme, styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';

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

const TimeBox = ({ id, timeValue, straitNum, stagesHandler }) => {

    const [value, setValue] = useState(dayjs().hour(0).minute(1).second(0));
    const timeFormat = 'HH:mm:ss';

    // useEffect(() => {
    //     const obj_len = timeValue ? Object.keys(timeValue).length : 0
    //     if (obj_len != 0) {
    //       const dayjsTime = dayjs(timeValue[String(straitNum) + String(id)], timeFormat);
    //       setValue(dayjsTime)
    //     }
    // }, [timeValue]);

    useEffect(() => {
        const obj_len = timeValue ? Object.keys(timeValue).length : 0;
        const dayjsTimeDefault = dayjs().hour(0).minute(1).second(0);

        if (obj_len != 0) {

            const keys = Object.keys(timeValue)
            const dayjsTime = dayjs(timeValue[String(straitNum) + String(id)], timeFormat);
            

            if (keys.includes(String(straitNum) + String(id))) {
                setValue(dayjsTime)
            } else {
                stagesHandler(dayjsTimeDefault.format('HH:mm:ss'), String(straitNum) + String(id))
            }
        } else {
            stagesHandler(dayjsTimeDefault.format('HH:mm:ss'), String(straitNum) + String(id))
        }
    }, []);

    return (
        <ThemeProvider theme={theme}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <StyledTimePicker
                    ampm={false}
                    views={['hours', 'minutes', 'seconds']}
                    label={'Time'}
                    inputFormat="HH:mm:ss"
                    mask="__:__:__"
                    value={value}
                    onChange={(val) => {
                        const inputId = String(straitNum) + String(id);
                        const time = dayjs(val).format('HH:mm:ss');
                        stagesHandler(time, inputId);
                        setValue(val);
                    }}
                    renderInput={(params) => (
                        <StyledTextField 
                            {...params} 
                        />
                    )}
                />
            </LocalizationProvider>
        </ThemeProvider>
    );
};

export default TimeBox;