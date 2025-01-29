import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, Typography, Rating } from '@mui/material';

const theme = createTheme({
    typography: {
        fontFamily: 'jura',
        fontSize: 16
    },
});

const ActiveRaitingPial = (props) => (
    <svg
        width={50}
        height={18}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path
            d="M26.356 3.064c0 .405-.133 1.537-.508 3.01-.375 1.471-.988 3.273-1.944 5.02-1.912 3.494-5.18 6.756-10.641 6.756-5.46 0-8.73-3.262-10.64-6.756-.957-1.747-1.57-3.549-1.945-5.02C.303 4.601.17 3.47.17 3.064c0-.165.072-.337.232-.518.16-.182.404-.365.73-.543.654-.357 1.608-.684 2.8-.96C6.316.494 9.615.15 13.264.15c3.649 0 6.948.342 9.33.894 1.193.275 2.147.602 2.8.959.327.178.57.36.731.543.16.18.232.353.232.518Z"
            fill="#A5A36C"
            stroke="#000"
            strokeWidth={0.3}
        />
        <path
            d="M24.778 3.155c-.16.332-.494.662-1.021.972-.539.316-1.274.608-2.216.856-1.886.497-4.593.818-8.198.818-3.605 0-6.417-.32-8.39-.818-.988-.248-1.763-.54-2.322-.857-.548-.31-.882-.638-1.012-.967.511-.683 1.633-1.282 3.525-1.71 1.91-.433 4.593-.69 8.199-.69 3.605 0 6.281.289 8.15.737.935.225 1.667.489 2.212.775.532.28.883.58 1.073.884Z"
            fill="#FFF8BC"
            stroke="#000"
            strokeWidth={0.1}
        />
    </svg>
);

const DiactiveRaitingPial = (props) => (
    <svg
        width={50}
        height={18}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path
            d="M27.016 3.064c0 .405-.133 1.537-.508 3.01-.375 1.471-.988 3.273-1.944 5.02-1.912 3.494-5.18 6.756-10.641 6.756-5.46 0-8.73-3.262-10.64-6.756-.957-1.747-1.57-3.549-1.945-5.02C.963 4.601.83 3.47.83 3.064c0-.165.072-.337.231-.518.161-.182.405-.365.732-.543.653-.357 1.607-.684 2.8-.96 2.382-.55 5.68-.893 9.33-.893 3.649 0 6.948.342 9.33.894 1.193.275 2.147.602 2.8.959.326.178.57.36.731.543.16.18.232.353.232.518Z"
            fill="#E9E9E9"
            stroke="#000"
            strokeWidth={0.3}
        />
        <path
            d="M25.438 3.155c-.16.332-.494.662-1.021.972-.539.316-1.274.608-2.217.856-1.885.497-4.592.818-8.197.818-3.605 0-6.417-.32-8.39-.818-.988-.248-1.763-.54-2.323-.857-.547-.31-.88-.638-1.01-.967.51-.683 1.632-1.282 3.524-1.71 1.91-.433 4.593-.69 8.199-.69 3.605 0 6.28.289 8.15.737.935.225 1.667.489 2.212.775.532.28.883.58 1.073.884Z"
            fill="#fff"
            stroke="#000"
            strokeWidth={0.1}
        />
    </svg>
);

const handleRatingChange = (event, newValue, name, setValue) => {
    setValue(name, newValue);
};

const TeaRaiting = React.forwardRef(({ name, label, value, setValue }, ref) => {
    const legendStyle = {
        color: "#FFFFFF",
        margin: '10px 0 10px 0'
    };

    const boxStyle = {
        width: '98%',
        margin: '0px 0px 10px 5px',
    };

    return (
        <ThemeProvider theme={theme}>
            <Box style={boxStyle}>
                <Typography component="legend" style={legendStyle}>Общий рейтинг пролива</Typography>
                <Rating
                    name={name}
                    label={label}
                    icon={<ActiveRaitingPial />}
                    emptyIcon={<DiactiveRaitingPial />}
                    value={value}
                    max={10}
                    min={1}
                    onChange={(event, newValue) => handleRatingChange(event, newValue, name, setValue)}
                    ref={ref}
                />
            </Box>
        </ThemeProvider>
    );
});

export default TeaRaiting;