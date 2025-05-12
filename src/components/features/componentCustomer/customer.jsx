import React from 'react';
import { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaTimes } from "react-icons/fa";
import { CiSearch } from "react-icons/ci";
import { CustomButton} from "../../common/Button/customButton";
import Switch from "../../common/Switch/Switch";
import rolesService from "../../../services/RolesService"
import { getCustomers, postCustomers, updateCustomers, deleteCustomer, changeSatus } from '../../../services/usersService';
import FormCustomer from './customerForm'
import Pagination from "../../common/Paginator/Pagination"; // Asegúrate de importar tu paginador
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import './customerTable.css'

function Customer() {
    const [customers, setCustomers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState(null);
    const [rolExistence, setRolExistence] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // --- NUEVO: estados para buscador y paginador ---
    const [searchTerm, setSearchTerm] = useState("");
    const itemsPerPage = 6;
    const [currentPage, setCurrentPage] = useState(0);

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

    useEffect(() => {
        fecthCustomers();
    }, [rolExistence]);

    const handleEdit = (customer) => {
        setFormData(customer)
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setFormData(null);
    }

    const handleSubmit = async (data) => {
        try {
            if (data.idUser) {
                // Si password está vacío, lo eliminas
                if (data.password === "") {
                    delete data.password;
                }
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
                    message: `¿Está seguro de actualizar al cliente ${data.name}?`,
                    position: 'topRight',
                    buttons: [
                        ['<button><b>Confirmar</b></button>', async function (instance, toast) {
                            instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');

                            await updateCustomers(data);
                            await fecthCustomers();
                            // Alerta de éxito
                            iziToast.success({
                                class: 'custom-alert',
                                title: 'Éxito',
                                message: 'Cliente actualizado correctamente',
                                position: 'topRight',
                                timeout: 5000
                            });
                        }],
                        ['<button>Cancelar</button>', function (instance, toast) {
                            instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
                            // Notificación de cancelación (opcional)
                            iziToast.info({
                                class: 'custom-alert',
                                title: 'Cancelado',
                                message: 'No se realizaron cambios',
                                position: 'topRight',
                                timeout: 3000
                            });
                            handleEdit(data)
                        }]
                    ]
                });
            } else {
                await postCustomers(data);
                await fecthCustomers();
                // Alerta de éxito
                iziToast.success({
                    class: 'custom-alert',
                    title: 'Éxito',
                    message: 'Cliente creado correctamente',
                    position: 'topRight',
                    timeout: 5000
                })
            }
            setIsModalOpen(false);
        }
        catch (error) {
            // Alerta de error
            iziToast.error({
                class: 'custom-alert',
                title: 'Error',
                message: `${error.message}`,
                position: 'topRight',
                timeout: 5000
            });
        }
    }

    const handleDeleteCustomer = async (customer) => {
        // Alerta de confirmación
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
            message: `¿Está seguro de eliminar al cliente ${customer.name}?`,
            position: 'topRight',
            buttons: [
                ['<button><b>Confirmar</b></button>', async function (instance, toast) {
                    instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');

                    try {
                        await deleteCustomer(customer.idUser);
                        await fecthCustomers();

                        // Alerta de éxito
                        iziToast.success({
                            class: 'custom-alert',
                            title: 'Éxito',
                            message: 'Cliente eliminado correctamente',
                            position: 'topRight',
                            timeout: 5000
                        });
                    } catch (error) {
                        console.log(error);

                        // Alerta de error
                        iziToast.error({
                            class: 'custom-alert',
                            title: 'Error',
                            message: 'No se pudo eliminar el cliente',
                            position: 'topRight',
                            timeout: 5000
                        });
                    }
                }],
                ['<button>Cancelar</button>', function (instance, toast) {
                    instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');

                    // Notificación de cancelación (opcional)
                    iziToast.info({
                        class: 'custom-alert',
                        title: 'Cancelado',
                        message: 'No se realizaron cambios',
                        position: 'topRight',
                        timeout: 3000
                    });
                }]
            ]
        });
    }

    const handleChangeStatus = async (customer) => {
        // Alerta de confirmación
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
            message: `¿Está seguro de cambiar el estado del cliente ${customer.name}?`,
            position: 'topRight',
            buttons: [
                ['<button><b>Confirmar</b></button>', async function (instance, toast) {
                    instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');

                    try {
                        await changeSatus(customer.idUser, { status: !customer.status });
                        await fecthCustomers();

                        // Alerta de éxito
                        iziToast.success({
                            class: 'custom-alert',
                            title: 'Éxito',
                            message: 'Estado del cliente actualizado correctamente',
                            position: 'topRight',
                            timeout: 5000
                        });
                    }
                    catch (error) {
                        console.log(error);

                        // Alerta de error
                        iziToast.error({
                            class: 'custom-alert',
                            title: 'Error',
                            message: 'No se pudo actualizar el estado del cliente',
                            position: 'topRight',
                            timeout: 5000
                        });
                    }
                }],
                ['<button>Cancelar</button>', function (instance, toast) {
                    instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');

                    // Notificación de cancelación (opcional)
                    iziToast.info({
                        class: 'custom-alert',
                        title: 'Cancelado',
                        message: 'No se realizaron cambios',
                        position: 'topRight',
                        timeout: 3000
                    });
                }]
            ]
        });
    };

    return (
        <div className="customer-table-container">
            <div className="customer-table-header-container">
                <h2 className="customer-table-header-title">Tabla de Clientes</h2>
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
                                        <button
                                            onClick={() => handleEdit(customer)}
                                            className="action-btn edit-btn"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCustomer(customer)}
                                            className="action-btn delete-btn"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* PAGINADOR */}
                <Pagination pageCount={pageCount} onPageChange={handlePageClick} />
            </div>
        </div>
    );
}

export default Customer;