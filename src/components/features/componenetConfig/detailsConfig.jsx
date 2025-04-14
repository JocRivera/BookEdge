import React, { useState } from 'react';
import { useEffect } from 'react';
import permissionService from '../../../services/PermissionService';
import "./createConfig.css"; // Asegúrate de importar los estilos

const DetailsConfig = ({ currentConfig, onClose, isOpen }) => {
    const [permissions, setPermissions] = useState([]);
    const [privileges, setPrivileges] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const permissions = await permissionService.getPermissions();
                const privileges = await permissionService.getPrivileges();
                setPermissions(permissions);
                setPrivileges(privileges);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        if (isOpen) {
            fetchData();
        }
    }, [isOpen]);

    // Función auxiliar para verificar si un privilegio está marcado
    const isPrivilegeChecked = (permissionId, privilegeId) => {
        // Verificar si currentConfig y permissionRoles existen
        if (!currentConfig || !currentConfig.permissionRoles) {
            return false;
        }

        // Buscar en permissionRoles
        return currentConfig.permissionRoles.some(pr =>
            pr.idPermission === permissionId && pr.idPrivilege === privilegeId
        );
    };

    if (!isOpen || !currentConfig) {
        return null;
    }

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h2>Detalles del Rol</h2>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>
                <div className="modal-body">
                    <div className="detail-info">
                        <p><strong>ID:</strong> {currentConfig.idRol}</p>
                        <p><strong>Nombre:</strong> {currentConfig.name}</p>
                        <p><strong>Estado:</strong> {currentConfig.status ? 'Activo' : 'Inactivo'}</p>
                        <p><strong>Fecha de creación:</strong> {new Date(currentConfig.createdAt).toLocaleDateString()}</p>
                        <p><strong>Última actualización:</strong> {new Date(currentConfig.updatedAt).toLocaleDateString()}</p>
                    </div>

                    <div className="permissions-group">
                        <div className="permissions-table-container">
                            <table className="permissions-table">
                                <thead>
                                    <tr>
                                        <th className="permission-header">Permisos</th>
                                        {privileges.map((privilege) => (
                                            <th key={privilege.idPrivilege} className="privilege-header">
                                                <div className="privilege-title">
                                                    {privilege.name}
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {permissions.map((permission) => (
                                        <tr key={permission.idPermission}>
                                            <td className="permission-name">{permission.name}</td>
                                            {privileges.map((privilege) => (
                                                <td
                                                    key={`${permission.idPermission}-${privilege.idPrivilege}`}
                                                    className="privilege-cell"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isPrivilegeChecked(
                                                            permission.idPermission,
                                                            privilege.idPrivilege
                                                        )}
                                                        disabled={true}
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="cancel-btn" onClick={onClose}>Cerrar</button>
                </div>
            </div>
        </div>
    );
};

export default DetailsConfig;