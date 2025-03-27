import React, { useState, useEffect } from 'react';
import "./createConfig.css"
import Switch from '../../common/Switch/Switch';

const FormConfig = ({ isOpen, onClose, onSave, setting }) => {
    const [permission, setPermission] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        status: false
    });
    useEffect(() => {
        if (setting) {
            setFormData(setting)
        }
    }, [setting])
    useEffect(() => {
        // Ejemplo de carga de permisos iniciales (puedes reemplazar con tu lógica de obtención de datos)
        setPermission([
            { uid: "ServiceModule", name: "Services", activo: true },
            { uid: "ConfigModule", name: "Configuracion", activo: false },
            { uid: "AdminModule", name: "Dashboard", activo: true },
            { uid: "UserModule", name: "Users", activo: false },
            { uid: "PlainsModule", name: "Planes", activo: true },
            { uid: "ReservaModule", name: "Reserva", activo: false },
            { uid: "AlojamientosModule", name: "Alojamientos", activo: true },

        ]);
    }, []);
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    }
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
        onClose()
    }
    if (!isOpen) { return null }
    return (
        <div className="modal-overlay" >
            <div className="modal-container">
                <div className="modal-header">
                    <h2>{setting ? 'Editar Configuracion' : 'Registrar Configuracion'}</h2>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>
                <div className='modal-body'>
                    <form onSubmit={handleSubmit}>
                        <div className='form-grid'>
                            <div className='form-group'>
                                <label htmlFor="">Nombre del Rol</label>
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
                            <div className="permissions-list">
                                {permission.map((permiso) => (
                                    <label key={permiso.uid} >
                                        <input
                                            type="checkbox"
                                            name={permiso.uid}
                                            id={permiso.uid}
                                            checked={formData[permiso.uid] || false}
                                            onChange={handleChange}
                                        />
                                        <span>{permiso.name}</span>
                                    </label>
                                ))}
                            </div>
                            <div className="form-group">
                                <label htmlFor="status">Estado</label>
                                <Switch
                                    isOn={formData.status === 'Activo'}
                                    handleToggle={() =>
                                        setFormData((prevState) => ({
                                            ...prevState,
                                            status: prevState.status === 'Activo' ? "Inactivo" : "Activo"
                                        }))
                                    }
                                    id="status"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="cancel-btn" onClick={onClose}>Cancelar</button>
                            <button type="submit" className="submit-btn">
                                {setting ? "Guardar Cambios" : "Registrar Configuracion"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )

}

export default FormConfig;