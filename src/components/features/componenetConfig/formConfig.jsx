import React, { useState, useEffect } from 'react';
import "./createConfig.css"
import Switch from '../../common/Switch/Switch';
import permissionService from '../../../services/PermissionService';
const FormConfig = ({ isOpen, onClose, onSave, setting }) => {
    const [permission, setPermission] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        status: false,
        permissions: []
    });
    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                const permissions = await permissionService.getPermissions();
                setPermission(permissions);
            } catch (error) {
                console.error("Error fetching permissions:", error);
            }
        };
        fetchPermissions();
    }, [])

    useEffect(() => {
        if (setting) {
            setFormData({
                ...setting,
                permissions: setting.permissions.map((perm) => perm.idPermission) // Extraer IDs
            });
        }
    }, [setting])

    const handleChange = (e) => {
        setFormData(prevState => ({
            ...prevState,
            [e.target.name]: e.target.value
        }));
    }
    const handlePermissionChange = (e) => {
        const { value, checked } = e.target;
        setFormData(prevState => {
            if (checked) {
                // Add permission if checked
                return {
                    ...prevState,
                    permissions: [...prevState.permissions, parseInt(value)]
                };
            } else {
                // Remove permission if unchecked
                return {
                    ...prevState,
                    permissions: prevState.permissions.filter(id => id !== parseInt(value))
                };
            }
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
                            <fieldset className="permissions-group">
                                <legend>Permisos</legend>
                                <div className="permissions-list">
                                    {permission.map((permiso) => (
                                        <label key={permiso.idPermission} >
                                            <input
                                                type="checkbox"
                                                name="permissions"
                                                value={permiso.idPermission}
                                                id={permiso.idPermission}
                                                checked={formData.permissions.includes(permiso.idPermission)}
                                                onChange={handlePermissionChange}
                                            />
                                            <span>{permiso.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </fieldset>
                            <div className="form-group">
                                <label htmlFor="status">Estado</label>
                                <Switch
                                    isOn={formData.status === true}
                                    handleToggle={() =>
                                        setFormData((prevState) => ({
                                            ...prevState,
                                            status: prevState.status === true ? false : true
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