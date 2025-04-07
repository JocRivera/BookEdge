import React, { useState, useEffect } from "react";
import "./FormPlans.css";
import { getCabinsPerCapacity, getServicesPerPlan } from "../../../services/PlanService";

// Primero, modifica la función calculateTotalCapacity para que sea más precisa
const calculateTotalCapacity = (cabins, bedrooms) => {
    if (cabins.length === 0 && bedrooms.length === 0) return 30;
    
    const cabinsCapacity = cabins.reduce((total, cabin) => 
        total + (cabin.capacity * cabin.quantity), 0);
    const bedroomsCapacity = bedrooms.reduce((total, bedroom) => 
        total + (bedroom.capacity * bedroom.quantity), 0);
    
    return cabinsCapacity + bedroomsCapacity;
};

const MemoizedTabContent = React.memo(({ tabNumber, localFormData, handleChange, selectedCabin, setSelectedCabin, availableCabins, selectedBedroom, setSelectedBedroom, availableBedrooms, selectedService, setSelectedService, serviceQuantity, setServiceQuantity, availableServices, setLocalFormData }) => {
    switch (tabNumber) {
        case 1:
            return (
                <div className="tab-content">
                    <div className="form-group">
                        <label htmlFor="name">Nombre del Plan</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={localFormData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="image">Imagen</label>
                        <input
                            type="file"
                            id="image"
                            name="image"
                            accept="image/*"
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Descripción</label>
                        <textarea
                            id="description"
                            name="description"
                            value={localFormData.description}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
            );
        case 2:
            return (
                <div className="tab-content">
                    <div className="form-sections-grid">
                        {/* Sección de Cabañas */}
                        <div className="form-section">
                            <h3 className="section-title">Cabañas</h3>
                            <div className="selection-container">
                                <div className="select-group">
                                    <select
                                        className="custom-select"
                                        value={selectedCabin}
                                        onChange={(e) => setSelectedCabin(e.target.value)}
                                    >
                                        <option value="">Seleccionar cabaña</option>
                                        {availableCabins.map(cabin => (
                                            <option key={cabin.id} value={cabin.id}>
                                                {cabin.name} - capacidad: {cabin.capacity}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="quantity-control">
                                        <input
                                            type="number"
                                            min="1"
                                            value={localFormData.cabinQuantity || 1}
                                            onChange={(e) => setLocalFormData(prev => ({
                                                ...prev,
                                                cabinQuantity: parseInt(e.target.value) || 1
                                            }))}
                                            className="quantity-input"
                                        />
                                        <button
                                            type="button"
                                            className="add-btn"
                                            onClick={() => {
                                                if (selectedCabin) {
                                                    const cabin = availableCabins.find(c => c.id === parseInt(selectedCabin));
                                                    const quantity = localFormData.cabinQuantity || 1;
                                                    
                                                    setLocalFormData(prev => {
                                                        const existingCabinIndex = prev.cabins.findIndex(c => c.capacity === cabin.capacity);
                                                        
                                                        let newCabins;
                                                        if (existingCabinIndex >= 0) {
                                                            newCabins = prev.cabins.map((c, index) => 
                                                                index === existingCabinIndex 
                                                                    ? { 
                                                                        ...c, 
                                                                        quantity: c.quantity + quantity,
                                                                        totalCapacity: (c.quantity + quantity) * c.capacity 
                                                                    }
                                                                    : c
                                                            );
                                                        } else {
                                                            newCabins = [...prev.cabins, {
                                                                capacity: cabin.capacity,
                                                                quantity: quantity,
                                                                name: `Cabaña ${cabin.capacity} personas`,
                                                                totalCapacity: quantity * cabin.capacity
                                                            }];
                                                        }
                                                        
                                                        return {
                                                            ...prev,
                                                            cabins: newCabins,
                                                            capacidad: calculateTotalCapacity(newCabins, prev.bedrooms)
                                                        };
                                                    });
                                                    setSelectedCabin("");
                                                }
                                            }}
                                        >
                                            Agregar
                                        </button>
                                    </div>
                                </div>

                                {localFormData.cabins.length > 0 && (
                                    <div className="table-container">
                                        <table className="custom-table">
                                            <thead>
                                                <tr>
                                                    <th>Nombre</th>
                                                    <th>Capacidad Unit.</th>
                                                    <th>Cantidad</th>
                                                    <th>Cap. Total</th>
                                                    <th>Acción</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {localFormData.cabins.map((cabin, index) => (
                                                    <tr key={index}>
                                                        <td>{cabin.name}</td>
                                                        <td>{cabin.capacity}</td>
                                                        <td>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={cabin.quantity}
                                                                onChange={(e) => {
                                                                    const newQuantity = parseInt(e.target.value) || 0;
                                                                    if (newQuantity >= 0) {
                                                                        setLocalFormData(prev => {
                                                                            const newCabins = prev.cabins.map((c, idx) => 
                                                                                idx === index 
                                                                                    ? {
                                                                                        ...c,
                                                                                        quantity: newQuantity,
                                                                                        totalCapacity: c.capacity * newQuantity
                                                                                    }
                                                                                    : c
                                                                            );
                                                                            return {
                                                                                ...prev,
                                                                                cabins: newCabins,
                                                                                capacidad: calculateTotalCapacity(newCabins, prev.bedrooms)
                                                                            };
                                                                        });
                                                                    }
                                                                }}
                                                                className="quantity-input"
                                                            />
                                                        </td>
                                                        <td>{cabin.totalCapacity}</td>
                                                        <td>
                                                            <button
                                                                type="button"
                                                                className="remove-btn"
                                                                onClick={() => {
                                                                    setLocalFormData(prev => {
                                                                        const newCabins = prev.cabins.filter((_, i) => i !== index);
                                                                        return {
                                                                            ...prev,
                                                                            cabins: newCabins,
                                                                            capacidad: calculateTotalCapacity(newCabins, prev.bedrooms)
                                                                        };
                                                                    });
                                                                }}
                                                            >
                                                                ×
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sección de Habitaciones */}
                        <div className="form-section">
                            <h3 className="section-title">Habitaciones</h3>
                            <div className="selection-container">
                                <div className="select-group">
                                    <select
                                        className="custom-select"
                                        value={selectedBedroom}
                                        onChange={(e) => setSelectedBedroom(e.target.value)}
                                    >
                                        <option value="">Seleccionar habitación</option>
                                        {availableBedrooms.map(bedroom => (
                                            <option key={bedroom.id} value={bedroom.id}>
                                                {bedroom.name} - Cap: {bedroom.capacity}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="quantity-control">
                                        <input
                                            type="number"
                                            min="1"
                                            value={localFormData.bedroomQuantity || 1}
                                            onChange={(e) => setLocalFormData(prev => ({
                                                ...prev,
                                                bedroomQuantity: parseInt(e.target.value) || 1
                                            }))}
                                            className="quantity-input"
                                        />
                                        <button
                                            type="button"
                                            className="add-btn"
                                            onClick={() => {
                                                if (selectedBedroom) {
                                                    const bedroom = availableBedrooms.find(b => b.id === parseInt(selectedBedroom));
                                                    const quantity = localFormData.bedroomQuantity || 1;
                                                    setLocalFormData(prev => {
                                                        const newBedrooms = [...prev.bedrooms, {
                                                            capacity: bedroom.capacity,
                                                            quantity,
                                                            name: bedroom.name,
                                                            totalCapacity: quantity * bedroom.capacity
                                                        }];
                                                        return {
                                                            ...prev,
                                                            bedrooms: newBedrooms,
                                                            capacidad: calculateTotalCapacity(prev.cabins, newBedrooms)
                                                        };
                                                    });
                                                    setSelectedBedroom("");
                                                }
                                            }}
                                        >
                                            Agregar
                                        </button>
                                    </div>
                                </div>

                                {localFormData.bedrooms.length > 0 && (
                                    <div className="table-container">
                                        <table className="custom-table">
                                            <thead>
                                                <tr>
                                                    <th>Nombre</th>
                                                    <th>Capacidad Unit.</th>
                                                    <th>Cantidad</th>
                                                    <th>Cap. Total</th>
                                                    <th>Acción</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {localFormData.bedrooms.map((bedroom, index) => (
                                                    <tr key={index}>
                                                        <td>{bedroom.name}</td>
                                                        <td>{bedroom.capacity}</td>
                                                        <td>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={bedroom.quantity}
                                                                onChange={(e) => {
                                                                    const newQuantity = parseInt(e.target.value) || 0;
                                                                    if (newQuantity >= 0) {
                                                                        setLocalFormData(prev => {
                                                                            const newBedrooms = prev.bedrooms.map((b, idx) => 
                                                                                idx === index 
                                                                                    ? {
                                                                                        ...b,
                                                                                        quantity: newQuantity,
                                                                                        totalCapacity: b.capacity * newQuantity
                                                                                    }
                                                                                    : b
                                                                            );
                                                                            return {
                                                                                ...prev,
                                                                                bedrooms: newBedrooms,
                                                                                capacidad: calculateTotalCapacity(prev.cabins, newBedrooms)
                                                                            };
                                                                        });
                                                                    }
                                                                }}
                                                                className="quantity-input"
                                                            />
                                                        </td>
                                                        <td>{bedroom.totalCapacity}</td>
                                                        <td>
                                                            <button
                                                                type="button"
                                                                className="remove-btn"
                                                                onClick={() => {
                                                                    setLocalFormData(prev => {
                                                                        const newBedrooms = prev.bedrooms.filter((_, i) => i !== index);
                                                                        return {
                                                                            ...prev,
                                                                            bedrooms: newBedrooms,
                                                                            capacidad: calculateTotalCapacity(prev.cabins, newBedrooms)
                                                                        };
                                                                    });
                                                                }}
                                                            >
                                                                ×
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sección de Capacidad Total */}
                        <div className="form-section capacity-section">
                            <h3 className="section-title">Capacidad Total</h3>
                            <div className="capacity-display">
                                <input
                                    type="number"
                                    value={localFormData.capacidad || 30}
                                    readOnly
                                    className="capacity-input"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            );
        case 3:
            return (
                <div className="tab-content">
                    <div className="form-sections-grid">
                        <div className="form-section services-section">
                            <h3 className="section-title">Servicios Disponibles</h3>
                            <div className="services-selection">
                                <div className="service-input-group">
                                    <select
                                        className="custom-select"
                                        value={selectedService}
                                        onChange={(e) => setSelectedService(e.target.value)}
                                    >
                                        <option value="">Seleccionar servicio</option>
                                        {availableServices.map(service => (
                                            <option key={service.Id_Service} value={service.Id_Service}>
                                                {service.name} - ${service.Price.toLocaleString()}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="quantity-control">
                                        <input
                                            type="number"
                                            min="1"
                                            value={serviceQuantity}
                                            onChange={(e) => setServiceQuantity(parseInt(e.target.value) || 1)}
                                            className="quantity-input"
                                        />
                                        <button
                                            type="button"
                                            className="add-service-btn"
                                            onClick={() => {
                                                if (selectedService) {
                                                    const service = availableServices.find(
                                                        s => s.Id_Service === parseInt(selectedService)
                                                    );
                                                    
                                                    setLocalFormData(prev => {
                                                        const existingServiceIndex = prev.services.findIndex(s => s.id === service.Id_Service);
                                                        
                                                        let newServices;
                                                        if (existingServiceIndex >= 0) {
                                                            // Actualizar la cantidad si ya existe
                                                            newServices = prev.services.map((s, index) => 
                                                                index === existingServiceIndex 
                                                                    ? { 
                                                                        ...s, 
                                                                        quantity: s.quantity + serviceQuantity,
                                                                        subtotal: service.Price * (s.quantity + serviceQuantity)
                                                                    }
                                                                    : s
                                                            );
                                                        } else {
                                                            // Agregar nuevo servicio si no existe
                                                            newServices = [...prev.services, {
                                                                id: service.Id_Service,
                                                                name: service.name,
                                                                Price: service.Price,
                                                                quantity: serviceQuantity,
                                                                subtotal: service.Price * serviceQuantity
                                                            }];
                                                        }
                                                        
                                                        // Calcular nuevo total
                                                        const newTotal = newServices.reduce((total, s) => total + s.subtotal, 0);
                                                        
                                                        return {
                                                            ...prev,
                                                            services: newServices,
                                                            total: newTotal
                                                        };
                                                    });
                                                    setSelectedService("");
                                                    setServiceQuantity(1);
                                                }
                                            }}
                                        >
                                            Agregar
                                        </button>
                                    </div>
                                </div>

                                {localFormData.services?.length > 0 && (
                                    <div className="table-container services-table">
                                        <table className="custom-table">
                                            <thead>
                                                <tr>
                                                    <th>Servicio</th>
                                                    <th>Precio Unit.</th>
                                                    <th>Cantidad</th>
                                                    <th>Subtotal</th>
                                                    <th>Acción</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {localFormData.services.map((service, index) => (
                                                    <tr key={index}>
                                                        <td>{service.name}</td>
                                                        <td>${service.Price.toLocaleString()}</td>
                                                        <td>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={service.quantity}
                                                                onChange={(e) => {
                                                                    const newQuantity = parseInt(e.target.value) || 0;
                                                                    if (newQuantity >= 0) {
                                                                        setLocalFormData(prev => {
                                                                            const newServices = prev.services.map((s, idx) => 
                                                                                idx === index 
                                                                                    ? {
                                                                                        ...s,
                                                                                        quantity: newQuantity,
                                                                                        subtotal: s.Price * newQuantity
                                                                                    }
                                                                                    : s
                                                                            );
                                                                            const newTotal = newServices.reduce((total, s) => total + s.subtotal, 0);
                                                                            return {
                                                                                ...prev,
                                                                                services: newServices,
                                                                                total: newTotal
                                                                            };
                                                                        });
                                                                    }
                                                                }}
                                                                className="quantity-input"
                                                            />
                                                        </td>
                                                        <td>${service.subtotal.toLocaleString()}</td>
                                                        <td>
                                                            <button
                                                                type="button"
                                                                className="remove-btn"
                                                                onClick={() => {
                                                                    setLocalFormData(prev => {
                                                                        const newServices = prev.services.filter((_, i) => i !== index);
                                                                        const newTotal = newServices.reduce((total, s) => total + s.subtotal, 0);
                                                                        return {
                                                                            ...prev,
                                                                            services: newServices,
                                                                            total: newTotal
                                                                        };
                                                                    });
                                                                }}
                                                            >
                                                                ×
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="form-section summary-section">
                            <h3 className="section-title">Resumen de Precios</h3>
                            <div className="price-summary">
                                <div className="summary-row">
                                    <span>Total Servicios:</span>
                                    <span className="price-value">${localFormData.total.toLocaleString()}</span>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="salePrice">Precio de Venta Final</label>
                                    <input
                                        type="number"
                                        id="salePrice"
                                        name="salePrice"
                                        value={localFormData.salePrice}
                                        onChange={handleChange}
                                        required
                                        className="price-input"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        default:
            return null;
    }
});

const FormPlans = ({ isOpen, onClose, onSave, planToEdit }) => {
    const [activeTab, setActiveTab] = useState(1);
    const [localFormData, setLocalFormData] = useState({
        name: "",
        image: "",
        description: "",
        services: [], // [{id: number, quantity: number}]
        cabins: [], // [{capacity: number, quantity: number}]
        bedrooms: [], // [{capacity: number, quantity: number}]
        salePrice: 0,
        total: 0,
    });

    const [selectedCabin, setSelectedCabin] = useState("");
    const [selectedBedroom, setSelectedBedroom] = useState("");
    const [selectedService, setSelectedService] = useState("");
    const [serviceQuantity, setServiceQuantity] = useState(1);
    const [availableCabins, setAvailableCabins] = useState([]);
    const [availableServices, setAvailableServices] = useState([]);
    const [availableBedrooms, setAvailableBedrooms] = useState([]);
    useEffect(() => {
        const fetchCabins = async () => {
            try {
                const data = await getCabinsPerCapacity();
                setAvailableCabins(data); // Actualizamos directamente availableCabins
            } catch(error) {
                console.error("Error fetching cabins:", error);
            }
        };
        const fetchServices = async () => {
            try {
                const data = await getServicesPerPlan();
                setAvailableServices(data); // Actualizamos directamente availableServices
            } catch(error) {
                console.error("Error fetching services:", error);
            }
            }
        fetchCabins();
        fetchServices();
    }, []);

    useEffect(() => {
        if (planToEdit) {
            // Transformar los servicios al formato requerido
            const formattedServices = planToEdit.Services?.map(service => ({
                id: service.Id_Service,
                name: service.name,
                Price: service.Price,
                quantity: service.PlanServices.quantity,
                subtotal: service.Price * service.PlanServices.quantity
            })) || [];

            // Transformar las cabañas al formato requerido
            const formattedCabins = planToEdit.cabinDistribution?.map(dist => ({
                capacity: dist.capacity,
                quantity: dist.requestedQuantity,
                name: `Cabaña ${dist.capacity} personas`,
                totalCapacity: dist.capacity * dist.requestedQuantity
            })) || [];

            // Calcular el total de servicios
            const servicesTotal = formattedServices.reduce((total, service) => 
                total + (service.Price * service.quantity), 0);

            setLocalFormData({
                name: planToEdit.name || "",
                image: planToEdit.image || "",
                description: planToEdit.description || "",
                services: formattedServices,
                cabins: formattedCabins,
                bedrooms: [], // Si tienes datos de habitaciones, procesarlos aquí
                salePrice: planToEdit.salePrice || 0,
                total: servicesTotal,
                capacidad: planToEdit.capacity || 30
            });
        } else {
            // Reset form when creating new plan
            setLocalFormData({
                name: "",
                image: "",
                description: "",
                services: [],
                cabins: [],
                bedrooms: [],
                salePrice: 0,
                total: 0,
                capacidad: 30
            });
        }
    }, [planToEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLocalFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const cerrarDefinitivoPerras = () => {
        onClose();
        setActiveTab(1);
        setLocalFormData({
            name: "",
            image: "",
            description: "",
            bedrooms: [],
            cabins: [],
            services: [],
            total: 0,
            salePrice: 0,
        });
    }

    // En el handleSubmit, antes de enviar los datos, elimina la capacidad
    const handleSubmit = (e) => {
        e.preventDefault();
        
        const totalCapacity = calculateTotalCapacity(localFormData.cabins, localFormData.bedrooms);
        
        const dataToSend = {
            name: localFormData.name,
            image: localFormData.image,
            description: localFormData.description,
            services: localFormData.services.map(service => ({
                id: service.id,
                quantity: service.quantity
            })),
            cabins: localFormData.cabins.map(cabin => ({
                capacity: cabin.capacity,
                quantity: cabin.quantity
            })),
            salePrice: parseFloat(localFormData.salePrice),
            total: localFormData.total,
            capacity: totalCapacity // Incluimos la capacidad calculada
        };

        if (planToEdit) {
            dataToSend.idPlan = planToEdit.idPlan;
        }

        onSave(dataToSend);
        cerrarDefinitivoPerras();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h2>{planToEdit ? "Editar Plan" : "Crear Nuevo Plan"}</h2>
                    <button className="close-button" onClick={cerrarDefinitivoPerras}>×</button>
                </div>

                <div className="modal-body">
                    <div className="tabs-container">
                        <div className="tabs">
                            <button
                                className={`tab-button ${activeTab === 1 ? 'active' : ''}`}
                                onClick={() => setActiveTab(1)}
                            >
                                Información Básica
                            </button>
                            <button
                                className={`tab-button ${activeTab === 2 ? 'active' : ''}`}
                                onClick={() => setActiveTab(2)}
                            >
                                Detalles del Plan
                            </button>
                            <button
                                className={`tab-button ${activeTab === 3 ? 'active' : ''}`}
                                onClick={() => setActiveTab(3)}
                            >
                                Servicios del Plan
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <MemoizedTabContent 
                                tabNumber={activeTab}
                                localFormData={localFormData}
                                handleChange={handleChange}
                                selectedCabin={selectedCabin}
                                setSelectedCabin={setSelectedCabin}
                                availableCabins={availableCabins}
                                selectedBedroom={selectedBedroom}
                                setSelectedBedroom={setSelectedBedroom}
                                availableBedrooms={availableBedrooms}
                                selectedService={selectedService}
                                setSelectedService={setSelectedService}
                                serviceQuantity={serviceQuantity}
                                setServiceQuantity={setServiceQuantity}
                                availableServices={availableServices}
                                setLocalFormData={setLocalFormData}
                            />

                            <div className="modal-footer">
                                <button type="button" className="cancel-btn" onClick={cerrarDefinitivoPerras}>
                                    Cancelar
                                </button>
                                {activeTab <= 3 ? (
                                    <button
                                        type="button"
                                        className="next-btn"
                                        onClick={() => setActiveTab(prev => prev + 1)}
                                    >
                                        Siguiente
                                    </button>
                                ) : (
                                    <button type="submit" className="submit-btn">
                                        {planToEdit ? "Guardar Cambios" : "Crear Plan"}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FormPlans;