import React from 'react';
import { useState, useEffect } from 'react';
import './customerForm.css';
import { Row, Col } from '../../common/RowCol/RowColGrid.jsx';

const FormCustomer = ({ isOpen, onClose, onSave, customerData, rolID }) => {
    const [formData, setFormData] = useState({
        idRol: rolID,
        name: "",
        birthdate: "",
        email: "",
        identificationType: "",
        identification: "",
        eps: "",
        cellphone: "",
        address: "",
        password: "",
        role: {},
    })

    useEffect(() => {
        if (customerData) {
            setFormData({
                idUser: customerData.idUser,
                idRol: rolID || customerData.idRol,
                name: customerData.name || '',
                birthdate: customerData.birthdate || "",
                email: customerData.email || "",
                identificationType: customerData.identificationType || "",
                identification: customerData.identification || "",
                eps: customerData.eps || "",
                cellphone: customerData.cellphone || "",
                address: customerData.address || "",
                password: "",
                role: {},
            });
        }
    }, [customerData, isOpen, rolID]);

    const closeModal = () => {
        onClose();
        setFormData({
            idRol: rolID,
            name: "",
            birthdate: "",
            email: "",
            identificationType: "",
            identification: "",
            eps: "",
            cellphone: "",
            address: "",
            password: "",
            role: {},
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData)
        closeModal()
    }

    const handleChange = (e) => {
        const { id, value } = e.target
        setFormData(prevState => ({
            ...prevState,
            [id]: value,
        }))
    }

    if (!isOpen) return null;
    if (rolID == 0) return (
        window.alert("No hay un rol con el nombre (Cliente)")
    );

    return (
        <div className="modal-overlay-customer">
            <div className="modal-container-customer">
                {/* Header del modal */}
                <div className="modal-header-customer">
                    <h2 className="text-2xl font-bold text-gray-800">{customerData ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
                    <button onClick={closeModal} className="close-button-customer">
                        ✕
                    </button>
                </div>

                {/* Contenido del formulario */}
                <div className="customer-form">
                    <form className="space-y-6">
                        <Row>
                            {/* Nombre */}
                            <Col span={6}>
                                <div className="form-group-customer">
                                    <label htmlFor="name" className="form-label-customer">
                                        Nombre
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="form-input-customer"
                                        placeholder="Ingrese el nombre"
                                    />
                                </div>
                            </Col>

                            {/* FechaDeNacimiento */}
                            <Col span={6}>
                                <div className="form-group-customer">
                                    <label htmlFor="dateOfBirth" className="form-label-customer">
                                        Fecha de Nacimiento
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.birthdate}
                                        onChange={handleChange}
                                        id="birthdate"
                                        className="form-input-customer"
                                    />
                                </div>
                            </Col>

                            {/* Tipo de Identificación */}
                            <Col span={3}>
                                <div className="form-group-customer">
                                    <label htmlFor="identificationType" className="form-label-customer">
                                        Tipo de Identificación
                                    </label>
                                    <select
                                        id="identificationType"
                                        value={formData.identificationType}
                                        onChange={handleChange}
                                        className="form-input-customer"
                                    >
                                        <option value="">Seleccione</option>
                                        <option value="CC">Cédula de Ciudadanía</option>
                                        <option value="TI">Tarjeta de Identidad</option>
                                        <option value="CE">Cédula de Extranjería</option>
                                    </select>
                                </div>
                            </Col>

                            {/* Identificación */}
                            <Col span={5}>
                                <div className="form-group-customer">
                                    <label htmlFor="identification" className="form-label-customer">
                                        Identificación
                                    </label>
                                    <input
                                        type="text"
                                        id="identification"
                                        value={formData.identification}
                                        onChange={handleChange}
                                        className="form-input-customer"
                                        placeholder="Ingrese la identificación"
                                    />
                                </div>
                            </Col>

                            {/* EPS */}
                            <Col span={4}>
                                <div className="form-group-customer">
                                    <label htmlFor="eps" className="form-label-customer">
                                        EPS
                                    </label>
                                    <input
                                        type="text"
                                        id="eps"
                                        value={formData.eps}
                                        onChange={handleChange}
                                        className="form-input-customer"
                                        placeholder="Ingrese la EPS"
                                    />
                                </div>
                            </Col>

                            {/* Correo Electrónico */}
                            <Col span={12}>
                                <div className="form-group-customer">
                                    <label htmlFor="email" className="form-label-customer">
                                        Correo Electrónico
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="form-input-customer"
                                        placeholder="Ingrese el correo electrónico"
                                    />
                                </div>
                            </Col>

                            {/* Teléfono */}
                            <Col span={5}>
                                <div className="form-group-customer">
                                    <label htmlFor="cellphone" className="form-label-customer">
                                        Teléfono
                                    </label>
                                    <input
                                        type="text"
                                        id="cellphone"
                                        value={formData.cellphone}
                                        onChange={handleChange}
                                        className="form-input-customer"
                                        placeholder="Ingrese el teléfono"
                                    />
                                </div>
                            </Col>

                            {/* Dirección */}
                            <Col span={7}>
                                <div className="form-group-customer">
                                    <label htmlFor="address" className="form-label-customer">
                                        Dirección
                                    </label>
                                    <input
                                        type="text"
                                        id="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="form-input-customer"
                                        placeholder="Ingrese la dirección"
                                    />
                                </div>
                            </Col>

                            {/* Password */}
                            <Col span={6}>
                                <div className="form-group-customer">
                                    <label htmlFor="password" className="form-label-customer">
                                        Contraseña
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        onChange={handleChange}
                                        className="form-input-customer"
                                        placeholder="Ingrese la contraseña"
                                    />
                                </div>
                            </Col>

                            {/* Confirmar Password */}
                            <Col span={6}>
                                <div className="form-group-customer">
                                    <label htmlFor="confirmPassword" className="form-label-customer">
                                        Confirmar contraseña
                                    </label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        className="form-input-customer"
                                        placeholder="Confirme la contraseña"
                                    />
                                </div>
                            </Col>

                        </Row>

                        {/* Footer del modal */}
                        <div className="modal-footer-customer">
                            <button type="button" onClick={closeModal} className="cancel-btn-customer">
                                Cancelar
                            </button>
                            <button type="submit" onClick={handleSubmit} className="submit-btn-customer">
                                Guardar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default FormCustomer;