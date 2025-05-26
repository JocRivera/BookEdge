import { useEffect, useState } from "react"
import { CustomButton, ActionButtons } from "../../common/Button/customButton"
import { CiSearch } from "react-icons/ci"
import Switch from "../../common/Switch/Switch"
import Pagination from "../../common/Paginator/Pagination";
import FormService from "./formServices";
import serviceService from "../../../services/serviceService"
import { FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import { useAlert } from "../../../context/AlertContext";


import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

export default function CreateServices() {
    const [currentService, setCurrentService] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [services, setServices] = useState([]);
    const [isView, setIsView] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { showAlert } = useAlert();


    useEffect(() => {
        const fetchServices = async () => {
            setLoading(true);
            try {
                const response = await serviceService.getServices();
                setServices(response);
            } catch (error) {
                console.error("Error fetching services:", error);
                setError("Error al cargar los servicios. Por favor, intente nuevamente.");
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

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

    const handleClearSearch = () => {
        setSearchTerm("");
    };

    const handleAdd = async () => {
        setCurrentService(null);
        setIsModalOpen(true);
    };

    const handleEdit = (Id_Service) => {
        showAlert({
            type: "confirm-edit",
            title: "Confirmar Modificación",
            message: "¿Está seguro de modificar este servicio?",
            confirmText: "Sí, Modificar",
            onConfirm: () => {
                const serviceToEdit = services.find((service) => service.Id_Service === Id_Service);
                setCurrentService(serviceToEdit);
                setIsModalOpen(true);
            },
        });
    };

    const handleDelete = (Id_Service) => {
        showAlert({
            type: "confirm-delete",
            title: "Confirmar Eliminación",
            message: "¿Está seguro de eliminar este servicio?",
            confirmText: "Sí, Eliminar",
            onConfirm: () => {
                serviceService.deleteService(Id_Service).then(() => {
                    setServices(services.filter((service) => service.Id_Service !== Id_Service));
                    toast.success(
                        `Servicio eliminado correctamente.`
                    );
                }).catch((error) => {
                    console.error("Error deleting service:", error);
                    toast.error(
                        `Error al eliminar el servicio: ${error.message || error}`
                    );
                });
            },
        });
    };

    const handleSave = (service) => {
        if (currentService) {
            serviceService.updateService(currentService.Id_Service, service).then(() => {
                setServices(services.map((srvc) => srvc.Id_Service === currentService.Id_Service ? { ...srvc, ...service } : srvc));
                toast.success('Servicio actualizado correctamente');
            }).catch((error) => {
                console.error("Error updating service:", error);
                toast.error(`Error al actualizar el servicio: ${error.message || error}`);
            });
        } else {
            serviceService.createService(service).then((newService) => {
                setServices([...services, newService]);
                setCurrentService(null);
                setIsModalOpen(false);
                toast.success('Servicio creado correctamente');
            }).catch((error) => {
                console.error("Error creating service:", error);
                toast.error(`Error al crear el servicio: ${error.message || error}`);
            });
        }
        console.log(service);
    };

    const handleToggle = async (Id_Service) => {
        const service = services.find((service) => service.Id_Service === Id_Service);
        const updatedService = { ...service, StatusServices: !service.StatusServices };

        iziToast.question({
            timeout: 20000,
            close: false,
            overlay: true,
            displayMode: 'once',
            id: 'question',
            class: 'custom-alert',
            backgroundColor: '#ffffff',
            zindex: 999,
            title: 'Confirmación',
            message: `¿Está seguro de actualizar el estado del servicio ${Id_Service}?`,
            position: 'topRight',
            buttons: [
                ['<button><b>Actualizar</b></button>', function (instance, toast) {
                    serviceService.changeStatus(Id_Service, updatedService.StatusServices).then(() => {
                        setServices(
                            services.map((service) =>
                                service.Id_Service === Id_Service
                                    ? { ...service, StatusServices: !service.StatusServices }
                                    : service
                            )
                        );
                        instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
                        iziToast.success({
                            class: 'custom-alert',
                            title: 'Éxito',
                            message: 'Estado actualizado correctamente',
                            position: 'topRight',
                            timeout: 5000
                        });
                    }).catch((error) => {
                        console.error("Error changing service status:", error);
                        iziToast.error({
                            class: 'custom-alert',
                            title: 'Error',
                            message: 'No se pudo actualizar el estado del servicio',
                            position: 'topRight',
                            timeout: 5000
                        });
                    });
                }, true],
                ['<button>Cancelar</button>', function (instance, toast) {
                    instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
                }],
            ],
        });
    };

    return (
        <div className="table-container">
            <div className="title-container">
                <h2 className="table-title">Gestión de Servicios</h2>
            </div>
            <div className="container-search">
                <div className="search-wrapper-comfort">
                    <CiSearch className="config-search-icon" />
                    <input
                        type="text"
                        className="comfort-search"
                        placeholder="Buscar servicio..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button
                            className="clear-search"
                            onClick={handleClearSearch}
                            aria-label="Limpiar búsqueda"
                        >
                            <FaTimes />
                        </button>
                    )}
                </div>
                <CustomButton variant="primary" icon="add" onClick={handleAdd}>
                    Agregar Servicio
                </CustomButton>
            </div>

            <div className="comfort-table-wrapper">
                {loading ? (
                    <div className="loading-indicator">
                        <div className="loading-spinner"></div>
                        <p>Cargando servicios...</p>
                    </div>
                ) : error ? (
                    <div className="error-message">
                        {error}
                        <button onClick={() => setError(null)}>
                            <FaTimes />
                        </button>
                    </div>
                ) : (
                    <>
                        <table className="comfort-table">
                            <thead>
                                <tr className="comfort-table-header">
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Descripción</th>
                                    <th>Precio</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="comfort-table-body">
                                {currentItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="no-data-row">
                                            No se encontraron servicios
                                        </td>
                                    </tr>
                                ) : (
                                    currentItems.map((service) => (
                                        <tr key={service.Id_Service} className="comfort-table-row">
                                            <td>{service.Id_Service}</td>
                                            <td>{service.name}</td>
                                            <td>{service.Description}</td>
                                            <td>{service.Price}</td>
                                            <td>
                                                <Switch
                                                    isOn={service.StatusServices === true}
                                                    id={service.Id_Service}
                                                    handleToggle={() => handleToggle(service.Id_Service)}
                                                />
                                            </td>
                                            <td className="config-actions-cell">
                                                <ActionButtons
                                                    onEdit={() => handleEdit(service.Id_Service)}
                                                    onDelete={() => handleDelete(service.Id_Service)}
                                                />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>

                        {pageCount > 1 && (
                            <div className="pagination-container">
                                <Pagination
                                    pageCount={pageCount}
                                    onPageChange={handlePageClick}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>

            {isModalOpen && (
                <FormService
                    service={currentService}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                />
            )}

            {/* You'll need to create a DetailsService component similar to DetailsConfig */}
            {isView && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Detalles del Servicio</h2>
                            <button className="close-button" onClick={() => setIsView(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="modal-body">
                            <p><strong>ID:</strong> {currentService?.Id_Service}</p>
                            <p><strong>Nombre:</strong> {currentService?.name}</p>
                            <p><strong>Descripción:</strong> {currentService?.Description}</p>
                            <p><strong>Precio:</strong> {currentService?.Price}</p>
                            <p><strong>Estado:</strong> {currentService?.StatusServices ? "Activo" : "Inactivo"}</p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setIsView(false)}>
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}