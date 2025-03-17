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
                borderColor: '#ffffff',
                backgroundColor: 'darkslategray',
                margin: '0px 0 0px 0',
                padding: '10px 20px',
                fontSize: '14px',
                cursor: 'pointer',
                width: '100%',
                maxWidth: '100px',
                borderRadius: '10px'
            }}>
                {content}
            </Button>
        </div>
    );
};

export default PopupButton;