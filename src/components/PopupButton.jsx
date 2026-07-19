import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import './PopupButton.css'; // Import the CSS file for styling
import { Button } from '@mui/material';
const PopupButton = ({ naviagteTo, content }) => {
    const navigate = useNavigate();
    // const [isOpen, setIsOpen] = useState(false);

    // const togglePopup = () => {
    //     setIsOpen(!isOpen);
    // };

    return (
        <div className="popup-button_container">
            <Button type="button" variant="outlined" 
            onClick={() => navigate(naviagteTo)}
            style={{
                color: '#ffffff',
                borderColor: 'rgba(255, 255, 255, 0.35)',
                backgroundColor: 'rgba(255, 255, 255, 0.14)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                margin: '0px 0 0px 0',
                padding: '7px 14px',
                fontSize: '13px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                borderRadius: '10px'
            }}>
                {content}
            </Button>
        </div>
    );
};

export default PopupButton;