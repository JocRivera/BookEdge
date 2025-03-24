import React, { useState, useEffect } from 'react';
import "./createService.css"
import Switch from '../../common/Switch/Switch';

const FormService = ({ isOpen, onClose, service, onSave }) => {
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
        onSave(formData);
        onClose();
    };
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
                            </div>
                            <div className='form-group'>
                                <label htmlFor="">Descripción</label>
                                <textarea required placeholder="Agrega una descripción..." name="Description" id="Description"
                                    value={formData.Description}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className='form-group'>
                                <label htmlFor="">Precio</label>
                                <input required type="number" name="Price" id="Price"
                                    value={formData.Price}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="status">Estado</label>
                                <Switch
                                    isOn={formData.StatusServices === 'Activo'}
                                    handleToggle={() =>
                                        setFormData((prevState) => ({
                                            ...prevState,
                                            StatusServices: prevState.StatusServices === 'Activo' ? "Inactivo" : "Activo"
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
            </div>
        </div>
    )

}
export default FormService;