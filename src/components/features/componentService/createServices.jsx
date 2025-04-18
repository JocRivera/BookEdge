import React, { useState, useEffect } from 'react';
import { CustomButton, ActionButtons } from '../../common/Button/customButton';
import { CiSearch } from "react-icons/ci";
import Switch from "../../common/Switch/Switch";
import Pagination from "../../common/Paginator/Pagination";
import FormService from './formServices';
import serviceService from '../../../services/serviceService';
import toast, { Toaster } from 'react-hot-toast';
export default function CreateServices() {
    const [currentService, setCurrentService] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [services, setServices] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const response = await serviceService.getServices();
            setServices(response);
        } catch (error) {
            console.error("Error fetching services:", error);
        }
    };

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

    const handleEdit = (Id_Service) => {
        const service = services.find((service) => service.Id_Service === Id_Service);
        setCurrentService(service);
        setIsModalOpen(true);
    }
    const handleDelete = (Id_Service) => {
        const notify = () => toast.success('Servicio eliminado corretamente');
        const notifyError = () => toast.error('Error al eliminar el servicio');
        const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este servicio?");
        if (confirmDelete) {
            serviceService.deleteService(Id_Service).then(() => {
                setServices(services.filter((service) => service.Id_Service !== Id_Service));
                notify();
            }).catch((error) => {
                console.error("Error deleting service:", error);
                notifyError();
            });
        }
    }
    const handleSave = (service) => {
        if (currentService) {
            const notify = () => toast.success('Rol Actualizado correctamente');
            const notifyError = () => toast.error('Error al actualizar el rol');
            serviceService.updateService(currentService.Id_Service, service).then(() => {
                setServices(services.map((s) => (s.Id_Service === currentService.Id_Service ? service : s)));
                notify();
            }).catch((error) => {
                console.error("Error updating service:", error);
                notifyError();
            });
        } else {
            const notify = () => toast.success('Rol creado correctamente');
            const notifyError = () => toast.error('Error al crear el rol');
            serviceService.createService(service).then((newService) => {
                setServices([...services, newService]);
                notify();
            }).catch((error) => {
                console.error("Error creating service:", error);
                notifyError();
            });
        }
        console.log(service);
    }
    const handleToggle = async (Id_Service) => {
        const confirmToggle = window.confirm("¿Estás seguro de que deseas cambiar el estado de este servicio?");
        if (!confirmToggle) return;
        try {
            const notify = () => toast.success('Estado cambiado correctamente');
            const currentService = services.find((service) => service.Id_Service === Id_Service);
            await serviceService.changeStatus(Id_Service, !currentService.StatusServices);
            setServices(
                services.map((service) =>
                    service.Id_Service === Id_Service
                        ? { ...service, StatusServices: !service.StatusServices }
                        : service
                )
            )
            console.log(services)
            notify();
        } catch (error) {
            console.error("Error changing service status:", error);
            toast.error("Chingaste");
        }
    }

    return (
        <div className="table-container">
            <div className="title-container">
                <h2 className="table-title">Tabla de Servicios</h2>
            </div>
            <div className="container-search">
                <CiSearch className="absolute left-[10px] text-[16px] text-text-light" />
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
                        {currentItems.map((service) => (
                            <tr key={service.Id_Service}>
                                <td className="table-cell">{service.Id_Service}</td>
                                <td className="table-cell">{service.name}</td>
                                <td className="table-cell">{service.Description}</td>
                                <td className="table-cell" >{service.Price}</td>
                                <td className="table-cell">
                                    <Switch
                                        isOn={service.StatusServices === true}
                                        id={service.Id_Service}
                                        handleToggle={() => handleToggle(service.Id_Service)}
                                    />
                                </td>
                                <td className="table-cell">
                                    <ActionButtons
                                        onEdit={() => handleEdit(service.Id_Service)}
                                        onDelete={() => handleDelete(service.Id_Service)}
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
                onSave={handleSave}
            />
            <Toaster />
        </div>
    );
}

