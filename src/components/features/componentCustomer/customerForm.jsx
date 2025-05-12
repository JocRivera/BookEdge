import React from 'react';
import { useState, useEffect } from 'react';
import './customerForm.css';

const FormCustomer = ({ isOpen, onClose, onSave, customerData, rolID }) => {
    const [activeTab, setActiveTab] = useState("personal");
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
        confirmPassword: "",
        role: {},
    });

    // Estado para manejar errores
    const [errors, setErrors] = useState({});
    const [passwordError, setPasswordError] = useState("");

    const cerrarDefinitivo = () => {
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
            confirmPassword: "",
            role: {},
        })
        onClose();
    }

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
                confirmPassword: "",
                role: {},
            });
        }
        // Limpiar errores al abrir/cerrar modal
        setErrors({});
        setPasswordError("");
    }, [customerData, isOpen, rolID]);


    const validateField = (name, value) => {
        let error = "";

        switch (name) {
            case "name":
                if (!value.trim()) {
                    error = "El nombre es obligatorio";
                } else if (value.trim().length < 3) {
                    error = "El nombre debe tener al menos 3 caracteres";
                }
                break;

            case "email":
                if (!value.trim()) {
                    error = "El correo electrónico es obligatorio";
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    error = "El correo electrónico no es válido";
                }
                break;

            case "identification":
                if (!value.trim()) {
                    error = "La identificación es obligatoria";
                } else if (value.trim().length < 5) {
                    error = "La identificación debe tener al menos 5 caracteres";
                }
                break;

            case "cellphone":
                if (!value.trim()) {
                    error = "El teléfono es obligatorio";
                } else if (!/^\d{10}$/.test(value)) {
                    error = "El teléfono debe tener 10 dígitos";
                }
                break;

            case "birthdate":
                if (!value) {
                    error = "La fecha de nacimiento es obligatoria";
                } else {
                    const age = calculateAge(value);
                    if (age < 18) {
                        error = "Debe ser mayor de 18 años";
                    }
                }
                break;

            case "password":
                if (!customerData && !value) {
                    error = "La contraseña es obligatoria para nuevos clientes";
                } else if (value && value.length < 8) {
                    error = "La contraseña debe tener al menos 8 caracteres";
                } else if (value && !/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value)) {
                    error = "La contraseña debe contener mayúsculas, minúsculas, números y caracteres especiales";
                }
                break;

            case "identificationType":
                if (!value) {
                    error = "El tipo de identificación es obligatorio";
                }
                break;
        }

        return error;
    };

    const calculateAge = (birthdate) => {
        const today = new Date();
        const birthDate = new Date(birthdate);
        let age = today.getFullYear() - birthDate.getFullYear();
        const month = today.getMonth() - birthDate.getMonth();

        if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [id]: value,
        }));

        // Limpiar error específico cuando el usuario comienza a escribir
        if (errors[id]) {
            setErrors(prev => ({
                ...prev,
                [id]: ""
            }));
        }

        // Validar campo
        const error = validateField(id, value);
        if (error) {
            setErrors(prev => ({
                ...prev,
                [id]: error
            }));
        }

        // Validación especial para contraseñas
        if (id === "password" || id === "confirmPassword") {
            if (id === "password" && formData.confirmPassword) {
                if (value !== formData.confirmPassword) {
                    setPasswordError("Las contraseñas no coinciden");
                } else {
                    setPasswordError("");
                }
            }
            if (id === "confirmPassword") {
                if (value !== formData.password) {
                    setPasswordError("Las contraseñas no coinciden");
                } else {
                    setPasswordError("");
                }
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validar todos los campos antes de enviar
        let formErrors = {};
        Object.keys(formData).forEach(key => {
            const error = validateField(key, formData[key]);
            if (error) formErrors[key] = error;
        });

        // Validar contraseñas
        if (!customerData && formData.password !== formData.confirmPassword) {
            setPasswordError("Las contraseñas no coinciden");
            return;
        }

        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            if (error.errors) {
                const serverErrors = {};
                error.errors.forEach(err => {
                    serverErrors[err.path] = err.msg;
                });
                setErrors(serverErrors);
            }
            console.error("Error al guardar:", error);
        }
    };

    if (!isOpen) return null;
    if (rolID == 0) return (
        window.alert("No hay un rol con el nombre (Cliente)")
    );

    return (
        <div className="modal-overlay-customer">
            <div className="modal-container-customer">
                <div className="modal-header-customer">
                    <h2>{customerData ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
                    <button onClick={cerrarDefinitivo} className="close-button-customer">×</button>
                </div>

                <div className="customer-form">
                    <form onSubmit={handleSubmit}>
                        <div className="customer-tabs-container">
                            <ul className="customer-tabs">
                                <li
                                    className={`customer-tab ${activeTab === "personal" ? "active" : ""}`}
                                    onClick={() => setActiveTab("personal")}
                                >
                                    Datos Personales
                                </li>
                                <li
                                    className={`customer-tab ${activeTab === "contact" ? "active" : ""}`}
                                    onClick={() => setActiveTab("contact")}
                                >
                                    Información de Contacto
                                </li>
                                <li
                                    className={`customer-tab ${activeTab === "security" ? "active" : ""}`}
                                    onClick={() => setActiveTab("security")}
                                >
                                    Seguridad
                                </li>
                            </ul>
                        </div>

                        {/* Pestaña de Datos Personales */}
                        <div className={`customer-tab-content ${activeTab === "personal" ? "active" : ""}`}>
                            <div className="customer-form-grid">
                                <div className="form-group-customer">
                                    <label htmlFor="name" className="form-label-customer">Nombre Completo</label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={`form-input-customer ${errors.name ? "input-error-customer" : ""}`}
                                        placeholder="Nombre completo"
                                        required
                                    />
                                    {errors.name && <span className="error-message-customer">{errors.name}</span>}
                                </div>

                                <div className="form-group-customer">
                                    <label htmlFor="identificationType" className="form-label-customer">
                                        Tipo de Identificación
                                    </label>
                                    <select
                                        id="identificationType"
                                        value={formData.identificationType}
                                        onChange={handleChange}
                                        className={`form-input-customer ${errors.identificationType ? "input-error-customer" : ""}`}
                                    >
                                        <option value="">Seleccione</option>
                                        <option value="CC">Cédula de Ciudadanía</option>
                                        <option value="TI">Tarjeta de Identidad</option>
                                        <option value="CE">Cédula de Extranjería</option>
                                    </select>
                                    {errors.identificationType && <span className="error-message-customer">{errors.identificationType}</span>}
                                </div>

                                <div className="form-group-customer">
                                    <label htmlFor="identification" className="form-label-customer">
                                        Identificación
                                    </label>
                                    <input
                                        type="text"
                                        id="identification"
                                        value={formData.identification}
                                        onChange={handleChange}
                                        className={`form-input-customer ${errors.identification ? "input-error-customer" : ""}`}
                                        placeholder="Ingrese la identificación"
                                    />
                                    {errors.identification && <span className="error-message-customer">{errors.identification}</span>}
                                </div>

                                <div className="form-group-customer">
                                    <label htmlFor="birthdate" className="form-label-customer">
                                        Fecha de Nacimiento
                                    </label>
                                    <input
                                        type="date"
                                        id="birthdate"
                                        value={formData.birthdate}
                                        onChange={handleChange}
                                        className={`form-input-customer ${errors.birthdate ? "input-error-customer" : ""}`}
                                    />
                                    {errors.birthdate && <span className="error-message-customer">{errors.birthdate}</span>}
                                </div>

                                <div className="form-group-customer">
                                    <label htmlFor="eps" className="form-label-customer">EPS</label>
                                    <input
                                        type="text"
                                        id="eps"
                                        value={formData.eps}
                                        onChange={handleChange}
                                        className={`form-input-customer ${errors.eps ? "input-error-customer" : ""}`}
                                        placeholder="Ingrese la EPS"
                                    />
                                    {errors.eps && <span className="error-message-customer">{errors.eps}</span>}
                                </div>
                            </div>
                        </div>

                        {/* Pestaña de Información de Contacto */}
                        <div className={`customer-tab-content ${activeTab === "contact" ? "active" : ""}`}>
                            <div className="customer-form-grid">
                                <div className="form-group-customer">
                                    <label htmlFor="email" className="form-label-customer">Correo Electrónico</label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`form-input-customer ${errors.email ? "input-error-customer" : ""}`}
                                        placeholder="Ingrese el correo electrónico"
                                    />
                                    {errors.email && <span className="error-message-customer">{errors.email}</span>}
                                </div>

                                <div className="form-group-customer">
                                    <label htmlFor="cellphone" className="form-label-customer">Teléfono</label>
                                    <input
                                        type="text"
                                        id="cellphone"
                                        value={formData.cellphone}
                                        onChange={handleChange}
                                        className={`form-input-customer ${errors.cellphone ? "input-error-customer" : ""}`}
                                        placeholder="Ingrese el teléfono"
                                    />
                                    {errors.cellphone && <span className="error-message-customer">{errors.cellphone}</span>}
                                </div>

                                <div className="form-group-customer">
                                    <label htmlFor="address" className="form-label-customer">Dirección</label>
                                    <input
                                        type="text"
                                        id="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className={`form-input-customer ${errors.address ? "input-error-customer" : ""}`}
                                        placeholder="Ingrese la dirección"
                                    />
                                    {errors.address && <span className="error-message-customer">{errors.address}</span>}
                                </div>
                            </div>
                        </div>

                        {/* Pestaña de Seguridad */}
                        <div className={`customer-tab-content ${activeTab === "security" ? "active" : ""}`}>
                            <div className="customer-form-grid">
                                <div className="form-group-customer">
                                    <label htmlFor="password" className="form-label-customer">
                                        {customerData ? "Contraseña (Dejar vacío para mantener actual)" : "Contraseña"}
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={`form-input-customer ${errors.password ? "input-error-customer" : ""}`}
                                        placeholder={customerData ? "Dejar vacío para mantener actual" : "Ingrese la contraseña"}
                                    />
                                    {errors.password && <span className="error-message-customer">{errors.password}</span>}
                                </div>

                                <div className="form-group-customer">
                                    <label htmlFor="confirmPassword" className="form-label-customer">
                                        Confirmar contraseña
                                    </label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className={`form-input-customer ${passwordError ? "input-error-customer" : ""}`}
                                        placeholder="Confirme la contraseña"
                                    />
                                    {passwordError && <span className="error-message-customer">{passwordError}</span>}
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer-customer">
                            <button type="button" onClick={cerrarDefinitivo} className="cancel-btn-customer">
                                Cancelar
                            </button>
                            <button type="submit" className="submit-btn-customer">
                                {customerData ? 'Guardar Cambios' : 'Registrar Cliente'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default FormCustomer;