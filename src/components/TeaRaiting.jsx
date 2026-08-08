import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, Typography, Rating } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useT } from '../i18n/index.js';

const theme = createTheme({
    typography: {
        fontFamily: 'jura',
        fontSize: 16
    },
});

// Tea bowl icon (пиала). One shape, two colorways: the filled state uses the
// mint accent of the theme, the empty state is a translucent "glass" bowl.
// viewBox matches the path coordinates so the drawing scales cleanly.
const RaitingPial = ({ active, width = 26, height = 17 }) => (
    <svg
        width={width}
        height={height}
        viewBox="0 0 26.6 18.2"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M26.356 3.064c0 .405-.133 1.537-.508 3.01-.375 1.471-.988 3.273-1.944 5.02-1.912 3.494-5.18 6.756-10.641 6.756-5.46 0-8.73-3.262-10.64-6.756-.957-1.747-1.57-3.549-1.945-5.02C.303 4.601.17 3.47.17 3.064c0-.165.072-.337.232-.518.16-.182.404-.365.73-.543.654-.357 1.608-.684 2.8-.96C6.316.494 9.615.15 13.264.15c3.649 0 6.948.342 9.33.894 1.193.275 2.147.602 2.8.959.327.178.57.36.731.543.16.18.232.353.232.518Z"
            fill={active ? '#a8f493' : 'rgba(255, 255, 255, 0.14)'}
            stroke={active ? '#eaffe4' : 'rgba(255, 255, 255, 0.55)'}
            strokeWidth={0.5}
        />
        <path
            d="M24.778 3.155c-.16.332-.494.662-1.021.972-.539.316-1.274.608-2.216.856-1.886.497-4.593.818-8.198.818-3.605 0-6.417-.32-8.39-.818-.988-.248-1.763-.54-2.322-.857-.548-.31-.882-.638-1.012-.967.511-.683 1.633-1.282 3.525-1.71 1.91-.433 4.593-.69 8.199-.69 3.605 0 6.281.289 8.15.737.935.225 1.667.489 2.212.775.532.28.883.58 1.073.884Z"
            fill={active ? '#eaffe4' : 'rgba(255, 255, 255, 0.22)'}
            stroke={active ? '#96B295' : 'rgba(255, 255, 255, 0.35)'}
            strokeWidth={0.15}
        />
    </svg>
);

// The Controller hands us its own onChange via {...field}; using it keeps the
// Controller the single owner of the value. The previous version ignored it and
// wrote through react-hook-form's setValue instead, so the value this component
// rendered came from a subscription nothing was updating — which is why the
// bowls only ever showed their default.
//
// setValue is still honoured as a fallback for any caller that passes it without
// a Controller. MUI hands back null when the current value is clicked again.
const handleRatingChange = (newValue, name, onChange, setValue) => {
    const next = newValue === null ? null : Number(newValue);
    if (onChange) onChange(next);
    else if (setValue) setValue(name, next);
};

// Icons flow in one row and wrap on narrow screens instead of clipping.
// width:auto is load-bearing: newer MUI gives the root `width: min-content`,
// which together with flex-wrap collapses to one icon per line.
const CustomRaiting = styled(Rating)({
    display: 'flex',
    // fit-content, not auto: `auto` let the root span the whole card, so the
    // clickable area ran far past the last bowl — clicking empty space to the
    // right still set a rating. `min-content` (newer MUI's default) is the other
    // extreme and collapses to one icon per line once flex-wrap is on.
    width: 'fit-content',
    maxWidth: '100%',
    flexWrap: 'wrap',
    rowGap: '4px',
    '& .MuiRating-icon': {
        margin: '0 3px 0 0',
    },
    '& .MuiRating-iconHover': {
        transform: 'scale(1.15)',
    },
});

const TeaRaiting = React.forwardRef(({
    name, label, value, setValue, onChange,
}, ref) => {
    const { t } = useT();
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
                <Typography component="legend" style={legendStyle}>{label || t('card.ratingLabel')}</Typography>
                <CustomRaiting
                    name={name}
                    icon={<RaitingPial active />}
                    emptyIcon={<RaitingPial />}
                    value={Number(value) || 0}
                    max={10}
                    onChange={(event, newValue) => handleRatingChange(newValue, name, onChange, setValue)}
                    ref={ref}
                />
            </Box>
        </ThemeProvider>
    );
});

export default TeaRaiting;
export { RaitingPial };
