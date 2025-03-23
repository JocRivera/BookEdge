import { useState } from "react"
import "./createConfig.css"
import { CustomButton, ActionButtons } from "../../common/Button/customButton"

export default function CreateConfig() {
    const [config, setConfig] = useState([
        {
            id: 1,
            name: 'Admin',
            description: 'Rol con acceso a todos los modulos',
            status: 'Activo',
        },
        {
            id: 2,
            name: 'User',
            description: 'Rol con acceso a todos los modulos',
            status: 'Activo',
        }
    ]);
    const handleView = (id) => {
        console.log('Ver', id);
    }
    const handleEdit = (id) => {
        console.log('Editar', id);
    }
    const handleDelete = (id) => {
        console.log('Eliminar', id);
    }
    return (
        <div className="container-config">
            <header className="config-header">
                <h1>Listado de configuraciones</h1>
                <CustomButton
                    variant="primary"
                    icon="add"
                    onClick={() => alert("Agregando configuracion")}
                    className="add-config-button"
                >
                    Agregar configuracion
                </CustomButton>

            </header>

            <table className="config-table">
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Nombre Completo</th>
                        <th>Descripcion</th>
                        <th>Status</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {config.map((config) => (
                        <tr key={config.id}>
                            <td>{config.id}</td>
                            <td>{config.name}</td>
                            <td>{config.description}</td>
                            <td>{config.status}</td>
                            <td>
                                <ActionButtons
                                    onView={() => handleView(config.id)}
                                    onEdit={() => handleEdit(config.id)}
                                    onDelete={() => handleDelete(config.id)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
