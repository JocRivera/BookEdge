import React from 'react';
import { useState, useEffect } from "react";
import { CiSearch } from "react-icons/ci";
import { CustomButton, ActionButtons } from "../../common/Button/customButton";
import Switch from "../../common/Switch/Switch";
import { getCustomers } from '../../../services/usersService';
import './customerTable.css'
import { use } from 'react';

function Customer() {
    const [customers, setCustomers] = useState([]);

    const fecthCustomers = async () => {
        try {
            const data = await getCustomers();
            setCustomers(data);
        } catch (error) {
            console.log("Error al obtener clientes", error);
        }
    }

    useEffect(() => {
        fecthCustomers();
    }, []);
    return (
        <div className="customer-table-container">
            <div className="customer-table-header-container">
                <h2 className="customer-table-header-title">Tabla de Clientes</h2>
            </div>
            <div className="customer-search-container">
                <CiSearch className="customer-search-icon" />
                <input
                    type="text"
                    className="customer-search-input"
                    //   value={searchTerm}
                    placeholder="Buscar usuario..."
                //   onChange={(e) => setSearchTerm(e.target.value)}
                />
                <CustomButton variant="primary" icon="add">
                    Agregar Cliente
                </CustomButton>
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
                        {customers.map((customer, index) => (
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
                                        handleToggle={() => handleToggleE(customer.idUser, customer.status)}
                                        id={`status-${customer.idUser}`}
                                    />
                                </td>
                                <td className="customer-table-cell">
                                    <ActionButtons
                                        onEdit={() => handleEdit(customer.idUser)}
                                        onDelete={() => handleDelete(customer.idUser)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* <Pagination pageCount={pageCount} onPageChange={handlePageClick} /> */}
            </div>
        </div>
    );
}

export default Customer;