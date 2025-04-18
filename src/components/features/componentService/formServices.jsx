import React, { useState, useEffect } from 'react';
import Switch from '../../common/Switch/Switch';

const FormService = ({ isOpen, onClose, service, onSave }) => {
    const [error, setError] = useState(null);
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
        if (!formData.name) {
            setError('El nombre del servicio es requerido');
            return false;
        }
        if (formData.name.length < 3) {
            setError("El nombre debe tener al menos 3 caracteres");
            return false;
        }
        if (formData.name.length > 50) {
            setError("El nombre no puede tener más de 50 caracteres");
            return false;
        }
        if (!formData.name.match(/^[a-zA-Z\s]+$/)) {
            setError("Ingrese un nombre valido");
            return false;
        }
        if (!formData.Description) {
            setError('La descripción es requerida');
            return false;
        }
        if (!formData.Price) {
            setError('El precio es requerido');
            return false;
        }
        setError(null);
        return true;
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
                                <label htmlFor="">Descripción</label>
                                <textarea required placeholder="Agrega una descripción..." name="Description" id="Description"
                                    value={formData.Description}
                                    onChange={handleChange}
                                />
                                {error && <p style={{ color: "red" }}>{error}</p>}
                            </div>
                            <div className='form-group'>
                                <label htmlFor="">Precio</label>
                                <input required type="number" name="Price" id="Price"
                                    value={formData.Price}
                                    onChange={handleChange}
                                />
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