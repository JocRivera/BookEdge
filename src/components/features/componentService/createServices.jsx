import React, { useState } from 'react';
import "./createService.css";
import { CustomButton, ActionButtons } from '../../common/Button/customButton';
import { CiSearch } from "react-icons/ci";
import Switch from "../../common/Switch/Switch";
import Pagination from "../../common/Paginator/Pagination";

export default function CreateServices() {
    const [currentService, setCurrentService] = useState(null);

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
    const [searchTerm, setSearchTerm] = useState("");

    const filtrarDatos = services.filter((service) =>
        Object.values(service).some((value) =>
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const itemsPerPage = 6;
    const [currentPage, setCurrentPage] = useState(0);
    const offset = currentPage * itemsPerPage;
    const currentItems = filtrarDatos.slice(offset, offset + itemsPerPage);
    const pageCount = Math.ceil(filtrarDatos.length / itemsPerPage);

    const handlePageClick = ({ selected }) => setCurrentPage(selected);

    const handleAdd = () => {
        setCurrentService(null);
        setIsModalOpen(true);
    };
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
        <div className="table-container">
            <div className="title-container">
                <h2 className="table-title">Tabla de Servicios</h2>
            </div>
            <div className="container-search">
                <CiSearch className="search-icon" />

                <input
                    type="text"
                    className="search"
                    value={searchTerm}
                    placeholder="Buscar servicio..."
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <CustomButton variant="primary" icon="add" onClick={handleAdd}>
                    Agregar Servicio
                </CustomButton>
            </div>

            <div className="table-wrapper">
                <table className="table">
                    <thead className="table-header">
                        <tr>
                            <th>Id</th>
                            <th>Nombre Completo</th>
                            <th>Tipo de documento</th>
                            <th>Precio</th>
                            <th>Status</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="table-body">
                        {services.map((service) => (
                            <tr key={service.id}>
                                <td className="table-cell">{service.id}</td>
                                <td className="table-cell">{service.name}</td>
                                <td className="table-cell">{service.description}</td>
                                <td className="table-cell">{service.price}</td>
                                <td className="table-cell">
                                    <Switch
                                        isOn={service.status === 'Activo'}
                                        id={service.id}
                                        handleToggle={(id) => {
                                            setServices(
                                                services.map((service) =>
                                                    service.id === id
                                                        ? {
                                                            ...service,
                                                            status: service.status === 'Activo' ? 'Inactivo' : 'Activo',
                                                        }
                                                        : service
                                                )
                                            );
                                        }
                                        }
                                    />
                                </td>
                                <td className="table-cell">
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
                <Pagination pageCount={pageCount} onPageChange={handlePageClick} />
            </div>

        </div>
    );
}

