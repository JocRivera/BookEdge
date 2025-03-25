import React, { useState, useEffect } from 'react';
import "./createConfig.css"
import Switch from '../../common/Switch/Switch';

const FormConfig = ({isOpen, onClose, onSave, setting}) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: false
    });
    
}