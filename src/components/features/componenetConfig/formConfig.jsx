import React, { useState, useEffect } from 'react';
import "./createConfig.css"
import Switch from '../../common/Switch/Switch';
import permissionService from '../../../services/PermissionService';
const FormConfig = ({ isOpen, onClose, onSave, setting }) => {
    const [error, setError] = useState(null);
    const [permission, setPermission] = useState([]);
    const [privilege, setPrivilege] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        status: false,
        permissions: []
    });
    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                const permissions = await permissionService.getPermissions();
                const privileges = await permissionService.getPrivileges();
                setPermission(permissions);
                setPrivilege(privileges);
            } catch (error) {
                console.error("Error fetching permissions:", error);
            }
        };
        fetchPermissions();
    }, [])
    useEffect(() => {
        if (setting) {
            // Inicializar el formulario con los valores básicos
            const initialFormData = {
                name: setting.name || '',
                status: setting.status !== undefined ? setting.status : false,
                permissions: []
            };

            // Si el setting tiene permissionRoles, procesarlos
            if (setting.permissionRoles && Array.isArray(setting.permissionRoles)) {
                // Extraer IDs únicos de permisos
                const uniquePermissionIds = [...new Set(
                    setting.permissionRoles.map(pr => pr.idPermission)
                )];

                // Establecer los permisos seleccionados
                initialFormData.permissions = uniquePermissionIds;

                // Procesar cada permissionRole para configurar los privilegios
                setting.permissionRoles.forEach(pr => {
                    if (pr.idPermission && pr.idPrivilege) {
                        // Marcar este privilegio como seleccionado
                        initialFormData[`privilege-${pr.idPermission}-${pr.idPrivilege}`] = true;
                    }
                });
            }
            setFormData(initialFormData);
        } else {
            // Caso de nuevo rol
            setFormData({
                name: '',
                status: false,
                permissions: []
            });
        }
    }, [setting]);

    const handleChange = (e) => {
        setFormData(prevState => ({
            ...prevState,
            [e.target.name]: e.target.value
        }));
    }
    const handlePermissionChange = (e) => {
        const { value, checked } = e.target;
        const permId = parseInt(value);

        setFormData(prevState => {
            if (checked) {
                // Encontrar el ID del privilegio "read" (generalmente con nombre "read" o "get")
                const readPrivilege = privilege.find(p =>
                    p.name.toLowerCase() === "read" ||
                    p.name.toLowerCase() === "get"
                );

                // Si encontramos el privilegio de lectura
                if (readPrivilege) {
                    // Añadir permiso y marcar automáticamente el privilegio de lectura
                    return {
                        ...prevState,
                        permissions: [...prevState.permissions, permId],
                        [`privilege-${permId}-${readPrivilege.idPrivilege}`]: true
                    };
                } else {
                    // Si no encontramos el privilegio de lectura, solo añadir el permiso
                    return {
                        ...prevState,
                        permissions: [...prevState.permissions, permId]
                    };
                }
            } else {
                // Remove permission if unchecked and clear its privileges
                const updatedFormData = {
                    ...prevState,
                    permissions: prevState.permissions.filter(id => id !== permId)
                };

                // Limpiar todos los privilegios asociados a este permiso
                privilege.forEach(priv => {
                    const key = `privilege-${permId}-${priv.idPrivilege}`;
                    if (updatedFormData[key]) {
                        delete updatedFormData[key];
                    }
                });

                return updatedFormData;
            }
        });
    }
    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            // Crear una copia del formData base
            const { name, status, permissions } = formData;

            // Preparar array permissionRoles para enviar al backend
            const permissionRoles = [];

            // Construir el array de permissionRoles basado en permisos y privilegios seleccionados
            permissions.forEach(permId => {
                privilege.forEach(priv => {
                    const privilegeKey = `privilege-${permId}-${priv.idPrivilege}`;

                    // Si este privilegio está seleccionado para este permiso
                    if (formData[privilegeKey]) {
                        permissionRoles.push({
                            idPermission: permId,
                            idPrivilege: priv.idPrivilege
                        });
                    }
                });
            });

            // Crear objeto final para enviar
            const dataToSave = {
                name,
                status,
                permissionRoles  // Formato que espera el backend
            };

            onSave(dataToSave);
            onClose();
        }
    };
    const validateForm = () => {
        if (!formData.name) {
            setError("El nombre es requerido");
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
        if (formData.permissions.length === 0) {
            setError("Al menos un permiso es requerido");
            return false;
        }
        // Validar que al menos un privilegio esté seleccionado para cada permiso
        const allPermissionsValid = formData.permissions.every(permId => {
            return privilege.some(priv => {
                const privilegeKey = `privilege-${permId}-${priv.idPrivilege}`;
                return formData[privilegeKey] === true;
            });
        });
        if (!allPermissionsValid) {
            setError("Al menos un privilegio debe estar seleccionado para cada permiso");
            return false;
        }
        //validar que almenos el privilegio de read este seleccionado
        const readPrivilege = privilege.find(p =>
            p.name.toLowerCase() === "read" ||
            p.name.toLowerCase() === "get"
        );
        if (!readPrivilege) {
            setError("El privilegio de lectura es obligatorio");
            return false;
        }
        const readPrivilegeSelected = formData.permissions.some(permId => {
            return formData[`privilege-${permId}-${readPrivilege.idPrivilege}`] === true;
        }
        );
        if (!readPrivilegeSelected) {
            setError("El privilegio de lectura es obligatorio");
            return false;
        }

        setError(null);
        return true;
    }
    if (!isOpen) { return null }
    return (
        <div className="modal-overlay" >
            <div className="config-modal-container">
                <div className="modal-header">
                    <h2>{setting ? 'Editar Configuracion' : 'Registrar Configuracion'}</h2>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>
                <div className='config-modal-body'>
                    <form onSubmit={handleSubmit}>
                        <div className='form-grid '>
                            <div className='form-group'>
                                <label htmlFor="">Nombre del Rol</label>
                                <input type="text" name="name" id="name" required
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                                {error && <div
                                    className='error-message-admin'
                                >{error}</div>}
                            </div>
                            <div className="permissions-group">
                                <div className="permissions-table-container">
                                    <table className="permissions-table">
                                        <thead>
                                            <tr>
                                                <th className="permission-header">Permisos</th>
                                                {privilege.map((priv) => (
                                                    <th key={priv.idPrivilege} className="privilege-header">
                                                        <div className="privilege-title">
                                                            {priv.name}
                                                        </div>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {permission.map((permiso) => (
                                                <tr key={permiso.idPermission}>
                                                    <td className="permission-name">
                                                        <label className="permission-checkbox">
                                                            <input
                                                                type="checkbox"
                                                                name="permissions"
                                                                value={permiso.idPermission}
                                                                checked={formData.permissions.includes(permiso.idPermission)}
                                                                onChange={handlePermissionChange}
                                                            />
                                                            <span>{permiso.name}</span>
                                                        </label>
                                                    </td>
                                                    {privilege.map((priv) => (
                                                        <td key={`${permiso.idPermission}-${priv.idPrivilege}`} className="privilege-cell">
                                                            <input
                                                                type="checkbox"
                                                                value={priv.idPrivilege}
                                                                name={`privilege-${permiso.idPermission}-${priv.idPrivilege}`}
                                                                disabled={!formData.permissions.includes(permiso.idPermission)}
                                                                checked={
                                                                    formData.permissions.includes(permiso.idPermission) &&
                                                                    formData[`privilege-${permiso.idPermission}-${priv.idPrivilege}`] === true
                                                                }
                                                                onChange={(e) => {
                                                                    const { checked } = e.target;
                                                                    setFormData(prevState => ({
                                                                        ...prevState,
                                                                        [`privilege-${permiso.idPermission}-${priv.idPrivilege}`]: checked
                                                                    }));
                                                                }}
                                                            />
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className='form-group' >
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