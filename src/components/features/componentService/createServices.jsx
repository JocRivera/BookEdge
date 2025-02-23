import React, { useState } from 'react';
import "./createService.css";
import { CustomButton, ActionButtons } from '../../common/Button/customButton';

export default function CreateServices() {
    const [services, setServices] = useState([

        {
            id: 1,
            name: 'Cena Romantica',
            description: 'Cena Romantica para dos personas',
            price: 500,
            status: 'Activo',
        },
        {
            id: 2,
            name: 'Masaje Relajante',
            description: 'Masaje relajante para dos personas',
            price: 700,
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
        <div className="container-services">
            <header className="services-header">
                <h1>Listado de servicios</h1>
                <CustomButton
                    variant="primary"
                    icon="add"
                    onClick={() => alert("Agregando servicio")}
                    className="add-service-button"
                >
                    Agregar servicio
                </CustomButton>

            </header>

            <table className="services-table">
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Nombre Completo</th>
                        <th>Tipo de documento</th>
                        <th>Número de documento</th>
                        <th>Número de celular</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {services.map((service) => (
                        <tr key={service.id}>
                            <td>{service.id}</td>
                            <td>{service.name}</td>
                            <td>{service.description}</td>
                            <td>{service.price}</td>
                            <td>{service.status}</td>
                            <td>

                                <ActionButtons
                                    onView={() => handleView(service.id)}
                                    onEdit={() => handleEdit(service.id)}
                                    onDelete={() => handleDelete(service.id)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

