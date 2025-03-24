import React, { useState } from 'react';
import "./createService.css";
import { CustomButton, ActionButtons } from '../../common/Button/customButton';
import { CiSearch } from "react-icons/ci";
import Switch from "../../common/Switch/Switch";
import Pagination from "../../common/Paginator/Pagination";
import FormService from './formServices';

export default function CreateServices() {
    const [currentService, setCurrentService] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [services, setServices] = useState([

        {
            id: 1,
            name: 'Cena Romantica',
            Description: 'Cena Romantica para dos personas',
            Price: 500,
            StatusServices: 'Activo',
        },
        {
            id: 2,
            name: 'Masaje Relajante',
            Description: 'Masaje relajante para dos personas',
            Price: 700,
            StatusServices: 'Activo',
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

    const handleEdit = (id) => {
        const service = services.find((service) => service.id === id);
        setCurrentService(service);
        setIsModalOpen(true);
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
                            <th>Descripcion</th>
                            <th>Precio</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="table-body">
                        {services.map((service) => (
                            <tr key={service.id}>
                                <td className="table-cell">{service.id}</td>
                                <td className="table-cell">{service.name}</td>
                                <td className="table-cell">{service.Description}</td>
                                <td className="table-cell">{service.Price}</td>
                                <td className="table-cell">
                                    <Switch
                                        isOn={service.StatusServices === 'Activo'}
                                        id={service.id}
                                        handleToggle={(id) => {
                                            setServices(
                                                services.map((service) =>
                                                    service.id === id
                                                        ? {
                                                            ...service,
                                                            StatusServices: service.StatusServices === 'Activo' ? 'Inactivo' : 'Activo',
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
            <FormService
                service={currentService}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={(service) => {
                    if (currentService) {
                        setServices(
                            services.map((s) => (s.id === service.id ? service : s))
                        );
                    } else {
                        setServices([...services, { ...service, id: services.length + 1 }]);
                    }
                }}
            />

        </div>
    );
}

