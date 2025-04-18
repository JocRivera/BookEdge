import React, { useState, useEffect } from 'react';
import Switch from '../../common/Switch/Switch';

const FormService = ({ isOpen, onClose, service, onSave }) => {
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        name: '',
        Description: '',
        Price: '',
        StatusServices: false
    });
    useEffect(() => {
        if (service) {
            setFormData(service);
        }
    }, [service]);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            const updatedService = {
                ...formData,
                StatusServices: formData.StatusServices === true ? 1 : 0
            };
            onSave(updatedService);
            setFormData({
                name: '',
                Description: '',
                Price: '',
                StatusServices: false
            });
            onClose();
        }
    };

    const validateForm = () => {
        let isValid = true;
        const newError = {};

        if (!formData.name) {
            newError.name = 'El nombre es requerido';
            isValid = false;
        }
        if (formData.name.length < 3) {
            newError.name = 'El nombre debe tener al menos 3 caracteres';
            isValid = false;
        }
        if (!formData.name.match(/^[a-zA-Z\s]+$/)) {
            newError.name = 'El nombre solo puede contener letras y espacios';
            isValid = false;
        }
        if (!formData.Description) {
            newError.Description = 'La descripción es requerida';
            isValid = false;
        }
        if (!formData.Price) {
            newError.Price = 'El precio es requerido';
            isValid = false;
        } else if (isNaN(formData.Price)) {
            newError.Price = 'El precio debe ser un número';
            isValid = false;
        }

        setErrors(newError);
        return isValid;
    }

    if (!isOpen) {
        return null;
    }
    return (
        <div className="modal-overlay" >
            <div className="modal-container">
                <div className="modal-header">
                    <h2>{service ? 'Editar Servicio' : 'Registrar Servicio'}</h2>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>
                <div className='modal-body'>
                    <form onSubmit={handleSubmit}>
                        <div className='form-grid'>
                            <div className='form-group'>
                                <label htmlFor="">Nombre servicio</label>
                                <input type="text" name="name" id="name" required
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                                {errors.name && <p style={{ color: "red" }}>{errors.name}</p>}
                                <label htmlFor="">Descripción</label>
                                <textarea required placeholder="Agrega una descripción..." name="Description" id="Description"
                                    value={formData.Description}
                                    onChange={handleChange}
                                />
                                {errors.Description && <p style={{ color: "red" }}>{errors.Description}</p>}

                            </div>
                            <div className='form-group'>
                                <label htmlFor="">Precio</label>
                                <input required type="number" name="Price" id="Price"
                                    value={formData.Price}
                                    onChange={handleChange}
                                />
                                {errors.Price && <p style={{ color: "red" }}>{errors.Price}</p>}
                                <label htmlFor="status">Estado</label>
                                <Switch
                                    isOn={formData.StatusServices === true}
                                    handleToggle={() =>
                                        setFormData((prevState) => ({
                                            ...prevState,
                                            StatusServices: prevState.StatusServices === true ? false : true
                                        }))
                                    }
                                    id="StatusServices"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="cancel-btn" onClick={onClose}>Cancelar</button>
                            <button type="submit" className="submit-btn">
                                {service ? "Guardar Cambios" : "Registrar Servicio"}
                            </button>
                        </div>
                    </form>
                </div>
            </div >
        </div >
    )

}
export default FormService;