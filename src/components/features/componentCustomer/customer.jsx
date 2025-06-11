import React from 'react';
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { FaTimes } from "react-icons/fa";
import { CiSearch } from "react-icons/ci";
import { CustomButton, ActionButtons } from "../../common/Button/customButton";
import Switch from "../../common/Switch/Switch";
import rolesService from "../../../services/RolesService"
import { getReservation } from "../../../services/reservationsService"
import { getCustomers, postCustomers, updateCustomers, deleteCustomer, changeSatus } from '../../../services/usersService';
import FormCustomer from './customerForm'
import Pagination from "../../common/Paginator/Pagination"; // Asegúrate de importar tu paginador
import { toast } from "react-toastify";
import { useAlert } from "../../../context/AlertContext";
import './customerTable.css'
import { ca } from 'date-fns/locale';

function Customer() {
    const [customers, setCustomers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState(null);
    const [rolExistence, setRolExistence] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [usersWithReservations, setUsersWithReservations] = useState([]);

    // --- NUEVO: estados para buscador y paginador ---
    const [searchTerm, setSearchTerm] = useState("");
    const itemsPerPage = 6;
    const [currentPage, setCurrentPage] = useState(0);

    const navigate = useNavigate()

    // --- FILTRADO ---
    const filtrarDatos = customers.filter((customer) =>
        Object.values(customer).some((value) =>
            value && typeof value === 'object'
                ? Object.values(value).some(v => v && v.toString().toLowerCase().includes(searchTerm.toLowerCase()))
                : value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const offset = currentPage * itemsPerPage;
    const currentItems = filtrarDatos.slice(offset, offset + itemsPerPage);
    const pageCount = Math.ceil(filtrarDatos.length / itemsPerPage);

    const handlePageClick = ({ selected }) => setCurrentPage(selected);
    useEffect(() => setCurrentPage(0), [searchTerm]);
    // --- FIN NUEVO ---

    const fecthCustomers = async () => {
        try {
            setIsLoading(true);
            const data = await getCustomers();
            setCustomers(data);
            await fecthRoles();
        } catch (error) {
            console.log("Error al obtener clientes", error);
        } finally {
            setIsLoading(false);
        }
    }

    const { showAlert } = useAlert();

    const fecthRoles = async () => {
        try {
            const roles = await rolesService.getRoles()
            const clientRole = roles.find(rol => rol.name === "Cliente");
            if (clientRole) {
                setRolExistence(clientRole.idRol);
            }
        }
        catch (error) {
            console.log("Error al traer los roles: ", error)
        }
    }

    // Cargar IDs de usuarios con reservas
    const fetchUsersWithReservations = async () => {
        try {
            const reservations = await getReservation();
            // Extrae los idUser únicos de las reservas
            const userIds = [
                ...new Set(
                    reservations
                        .map(res => res.user?.idUser)
                        .filter(id => id !== undefined && id !== null)
                ),
            ];
            setUsersWithReservations(userIds);
        } catch (error) {
            console.error("Error al obtener reservas:", error);
        }
    };

    useEffect(() => {
        fecthCustomers();
    }, [rolExistence]);

    useEffect(() => {
        fetchUsersWithReservations();
    }, []);

    const handleEdit = (customer) => {
        showAlert({
            type: "confirm-edit",
            title: "Confirmar Modificación",
            message: `¿Desea modificar los datos del cliente "${customer.name}"?`,
            confirmText: "Sí, Modificar",
            onConfirm: () => {
                setFormData(customer);
                setIsModalOpen(true);
            },
        });
    }

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setFormData(null);
    }

    const handleDeleteCustomer = async (customer) => {
        showAlert({
            type: "confirm-delete",
            title: "Confirmar Eliminación",
            message: `¿Está seguro que deseas eliminar al cliente "${customer.name}"? Esta acción no se puede deshacer.`,
            confirmText: "Sí, Eliminar",
            onConfirm: async () => {
                try {
                    await deleteCustomer(customer.idUser);
                    await fecthCustomers();
                    toast.success(`Cliente "${customer.name}" eliminado correctamente.`);
                } catch (error) {
                    console.error("Error al eliminar cliente:", error);
                    const errorMessage = error.response?.data?.message || error.message || "Error al eliminar el cliente.";
                    toast.error(errorMessage);
                }
            },
        });
    }

    const handleChangeStatus = async (customer) => {
        const newStatus = !customer.status;
        const actionText = newStatus ? "activar" : "desactivar";
        const newStatusText = newStatus ? "Activo" : "Inactivo";

        showAlert({
            type: "confirm-edit",
            title: `Confirmar Cambio de Estado`,
            message: `¿Está seguro de que desea ${actionText} al cliente "${customer.name}"? Su nuevo estado será "${newStatusText}".`,
            confirmText: `Sí, ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}`,
            onConfirm: async () => {
                try {
                    await changeSatus(customer.idUser, { status: newStatus });
                    toast.success(`Estado del cliente "${customer.name}" cambiado a "${newStatusText}" correctamente.`);
                    await fecthCustomers();
                } catch (error) {
                    console.error("Error al cambiar estado:", error);
                    const errorMessage = error.response?.data?.message || error.message || "No se pudo cambiar el estado.";
                    toast.error(errorMessage);
                }
            },
        });
    };

    const handleSubmit = async (data) => {
        try {
            if (data.idUser) {
                if (data.password === "") {
                    delete data.password;
                }
                await updateCustomers(data);
                await fecthCustomers();
                toast.success(`Cliente "${data.name}" actualizado correctamente.`);
            } else {
                await postCustomers(data);
                await fecthCustomers();
                toast.success(`Cliente "${data.name}" creado correctamente.`);
            }
            setIsModalOpen(false);
        }
        catch (error) {
            console.error("Error al guardar cliente:", error);
            const errorMessage = error.response?.data?.message || error.message || "Error al guardar el cliente.";
            toast.error(errorMessage);
            throw error;
        }
    }

    const handleGoToReservations = (customer) => {
        // Redirige a la ruta de reservas con el parámetro del cliente
        navigate(`/admin/reservations?cliente=${customer.identification}`);
    };

    return (
        <div className="customer-table-container">
            <div className="customer-table-header-container">
                <h2 className="customer-table-header-title">Gestión de Clientes</h2>
            </div>
            <div className="customer-search-container">
                <div className="search-wrapper-customer">
                    <CiSearch className="search-icon-customer" />
                    <input
                        type="text"
                        className="search-input-customer"
                        value={searchTerm}
                        placeholder="Buscar cliente..."
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button
                            className="clear-search"
                            onClick={() => setSearchTerm("")}
                            aria-label="Limpiar búsqueda"
                        >
                            <FaTimes />
                        </button>
                    )}
                </div>
                <CustomButton variant="primary" icon="add" onClick={() => setIsModalOpen(true)}>
                    Agregar Cliente
                </CustomButton>
                {!isLoading && (
                    <FormCustomer
                        isOpen={isModalOpen}
                        onClose={handleCloseModal}
                        onSave={handleSubmit}
                        customerData={formData}
                        rolID={rolExistence}
                    />
                )}
            </div>

            <div className="customer-table-wrapper">
                {isLoading && customers.length === 0 ? (
                    <div className="loading-indicator">
                        <div className="loading-spinner"></div>
                        <p>Cargando clientes...</p>
                    </div>
                ) : (
                    <>
                        <table className="customer-table">
                            <thead className="customer-table-head">
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Tipo Identificación</th>
                                    <th>Identificación</th>
                                    <th>Correo Electrónico</th>
                                    <th>Teléfono</th>
                                    <th>Dirección</th>
                                    <th>EPS</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                    <th>Reservas</th>
                                </tr>
                            </thead>
                            <tbody className="customer-table-body">
                                {currentItems.map((customer, index) => (
                                    <tr
                                        key={customer.idUser}
                                        className={index % 2 === 0 ? "customer-table-row-even" : "customer-table-row-odd"}
                                    >
                                        <td className="customer-table-cell">{customer.idUser}</td>
                                        <td className="customer-table-cell">{customer.name}</td>
                                        <td className="customer-table-cell">{customer.identificationType}</td>
                                        <td className="customer-table-cell">{customer.identification}</td>
                                        <td className="customer-table-cell">{customer.email}</td>
                                        <td className="customer-table-cell">{customer.cellphone}</td>
                                        <td className="customer-table-cell">{customer.address}</td>
                                        <td className="customer-table-cell">{customer.eps}</td>
                                        <td className="customer-table-cell">
                                            <Switch
                                                isOn={customer.status === true}
                                                handleToggle={() => handleChangeStatus(customer)}
                                                id={`status-${customer.idUser}`}
                                            />
                                        </td>
                                        <td className="customer-table-cell">
                                            <div className="action-buttons-container">
                                                <ActionButtons
                                                    onEdit={() => handleEdit(customer)}
                                                    onDelete={() => handleDeleteCustomer(customer)}
                                                />
                                            </div>
                                        </td>
                                        <td className="customer-table-cell">
                                            {usersWithReservations.includes(customer.idUser) && (
                                                <button
                                                    className="CUSTOMER-action-btn reservation-btn"
                                                    onClick={() => handleGoToReservations(customer)}
                                                    title="Ir a reserva(s)"
                                                >
                                                    reserva(s)
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {/* PAGINADOR */}
                        <Pagination pageCount={pageCount} onPageChange={handlePageClick} />
                    </>
                )}
            </div>
        </div>
    );
}

export default Customer;