import { useState, useEffect } from "react"
import "./FormPlans.css"
import { getCabinsPerCapacity, getServicesPerPlan, getBedroomsPerCapacity } from "../../../services/PlanService"

// Función para calcular la capacidad total
const calculateTotalCapacity = (cabins, bedrooms) => {
    if (cabins.length === 0 && bedrooms.length === 0) return 30

    const cabinsCapacity = cabins.reduce((total, cabin) => total + cabin.capacity * cabin.quantity, 0)
    const bedroomsCapacity = bedrooms.reduce((total, bedroom) => total + bedroom.capacity * bedroom.quantity, 0)

    return cabinsCapacity + bedroomsCapacity
}

// Validación personalizada para los campos del formulario de planes
const validatePlanField = (name, value) => {
    let error = "";

    switch (name) {
        case "name":
            if (!value.trim()) {
                error = "El nombre del plan es obligatorio";
            } else if (value.trim().length < 6) {
                error = "El nombre debe tener al menos 6 caracteres";
            } else if (value.trim().length > 30) {
                error = "El nombre debe tener menos de 30 caracteres";
            }
            break;

        case "description":
            if (!value.trim()) {
                error = "La descripción es obligatoria";
            } else if (value.trim().length < 4) {
                error = "La descripción debe tener al menos 4 caracteres";
            } else if (value.trim().length > 80) {
                error = "La descripción no puede tener más de 80 caracteres";
            }
            break;

        case "salePrice":
            if (value === "" || value === null) {
                error = "El precio de venta es obligatorio";
            } else if (isNaN(value) || Number(value) <= 0) {
                error = "El precio de venta debe ser un número positivo mayor a 0";
            }
            break;

        default:
            break;
    }
    return error;
};

const FormPlans = ({ isOpen, onClose, onSave, planToEdit }) => {
    const [activeTab, setActiveTab] = useState("basic")
    const [localFormData, setLocalFormData] = useState({
        name: "",
        image: "",
        description: "",
        services: [],
        cabins: [],
        bedrooms: [],
        salePrice: 0,
        total: 0,
        capacidad: 30,
        cabinQuantity: 1,
        bedroomQuantity: 1,
    })

    const [selectedCabin, setSelectedCabin] = useState("")
    const [selectedBedroom, setSelectedBedroom] = useState("")
    const [selectedService, setSelectedService] = useState("")
    const [serviceQuantity, setServiceQuantity] = useState(1)
    const [availableCabins, setAvailableCabins] = useState([])
    const [availableServices, setAvailableServices] = useState([])
    const [availableBedrooms, setAvailableBedrooms] = useState([])
    const [errors, setErrors] = useState({});
    const [imageError, setImageError] = useState("");

    // Cargar datos iniciales
    useEffect(() => {
        const fetchCabins = async () => {
            try {
                const data = await getCabinsPerCapacity()
                setAvailableCabins(data)
            } catch (error) {
                console.error("Error fetching cabins:", error)
            }
        }

        const fetchBedrooms = async () => {
            try {
                const data = await getBedroomsPerCapacity()
                setAvailableBedrooms(data)
            } catch (error) {
                console.error("Error fetching bedrooms:", error)
            }
        }

        const fetchServices = async () => {
            try {
                const data = await getServicesPerPlan()
                setAvailableServices(data)
            } catch (error) {
                console.error("Error fetching services:", error)
            }
        }

        fetchCabins()
        fetchBedrooms()
        fetchServices()
    }, [])

    // Cargar datos del plan a editar
    useEffect(() => {
        if (planToEdit) {
            // Transformar los servicios al formato requerido
            const formattedServices =
                planToEdit.Services?.map((service) => ({
                    id: service.Id_Service,
                    name: service.name,
                    Price: service.Price,
                    quantity: service.PlanServices.quantity,
                    subtotal: service.Price * service.PlanServices.quantity,
                })) || []

            // Transformar las cabañas al formato requerido
            const formattedCabins =
                planToEdit.cabinDistribution?.map((dist) => ({
                    capacity: dist.capacity,
                    quantity: dist.requestedQuantity,
                    name: `Cabaña ${dist.capacity} personas`,
                    totalCapacity: dist.capacity * dist.requestedQuantity,
                })) || []

            // Transformar las habitaciones al formato requerido
            const formattedBedrooms =
                planToEdit.bedroomDistribution?.map((dist) => ({
                    capacity: dist.capacity,
                    quantity: dist.requestedQuantity,
                    name: `Habitación ${dist.capacity} personas`,
                    totalCapacity: dist.capacity * dist.requestedQuantity,
                })) || []

            // Calcular el total de servicios
            const servicesTotal = formattedServices.reduce((total, service) => total + service.Price * service.quantity, 0)

            setLocalFormData({
                name: planToEdit.name || "",
                image: planToEdit.image || "",
                description: planToEdit.description || "",
                services: formattedServices,
                cabins: formattedCabins,
                bedrooms: formattedBedrooms,
                salePrice: planToEdit.salePrice || 0,
                total: servicesTotal,
                capacidad: planToEdit.capacity || 30,
                cabinQuantity: 1,
                bedroomQuantity: 1,
            })
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
                capacidad: 30,
                cabinQuantity: 1,
                bedroomQuantity: 1,
            })
        }
    }, [planToEdit])

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLocalFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Validación en tiempo real solo para los campos relevantes
        setErrors((prev) => ({
            ...prev,
            [name]: validatePlanField(name, value),
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) {
            setLocalFormData((prev) => ({ ...prev, imageFile: null, image: "" }));
            setImageError("La imagen es obligatoria");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setLocalFormData((prev) => ({ ...prev, imageFile: null, image: "" }));
            setImageError("La imagen no puede ser mayor a 5MB");
            return;
        }

        setLocalFormData((prev) => ({
            ...prev,
            imageFile: file,
            image: "",
        }));
        setImageError("");
    };

    const resetForm = () => {
        onClose()
        setActiveTab("basic")
        setLocalFormData({
            name: "",
            image: "",
            description: "",
            bedrooms: [],
            cabins: [],
            services: [],
            total: 0,
            salePrice: 0,
            capacidad: 30,
            cabinQuantity: 1,
            bedroomQuantity: 1,
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validar solo los campos relevantes
        const fieldsToValidate = [
            { name: "name", value: localFormData.name },
            { name: "description", value: localFormData.description },
            { name: "salePrice", value: localFormData.salePrice },
        ];

        let formErrors = {};
        fieldsToValidate.forEach(({ name, value }) => {
            const error = validatePlanField(name, value);
            if (error) formErrors[name] = error;
        });

        // Validar que haya al menos un servicio
        if (!localFormData.services || localFormData.services.length === 0) {
            formErrors.services = "Debe agregar al menos un servicio al plan";
        }

        // Validar la imagen
        if (!localFormData.imageFile && !localFormData.image) {
            setImageError("La imagen es obligatoria");
            formErrors.image = "La imagen es obligatoria";
        }

        setErrors(formErrors);

        if (Object.keys(formErrors).length > 0 || imageError) {
            // El formulario no se envía si hay errores
            console.log("Errores en el formulario:", formErrors);
            return;
        }

        const totalCapacity = calculateTotalCapacity(localFormData.cabins, localFormData.bedrooms)

        // Crear FormData para enviar datos multipart (incluyendo la imagen)
        const formData = new FormData()

        // Agregar datos básicos
        formData.append("name", localFormData.name)
        formData.append("description", localFormData.description)
        formData.append("salePrice", Number.parseFloat(localFormData.salePrice))
        formData.append("total", localFormData.total)
        formData.append("capacity", totalCapacity)

        // Agregar la imagen si existe
        if (localFormData.imageFile) {
            formData.append("image", localFormData.imageFile)
        } else {
            formData.append("image", "")
        }

        // Agregar servicios y cabañas como JSON
        formData.append(
            "services",
            JSON.stringify(
                localFormData.services.map((service) => ({
                    id: service.id,
                    quantity: service.quantity,
                })),
            ),
        )

        formData.append(
            "cabins",
            JSON.stringify(
                localFormData.cabins.map((cabin) => ({
                    capacity: cabin.capacity,
                    quantity: cabin.quantity,
                })),
            ),
        )

        formData.append(
            "bedrooms",
            JSON.stringify(
                localFormData.bedrooms.map((bedroom) => ({
                    capacity: bedroom.capacity,
                    quantity: bedroom.quantity,
                })),
            ),
        )

        if (planToEdit) {
            formData.append("idPlan", planToEdit.idPlan)
        }
        // Mostrar todos los campos del FormData
        // for (let pair of formData.entries()) {
        //     console.log(pair[0], pair[1]);
        // }
        onSave(formData)
        resetForm()
    }

    // Función para agregar cabaña
    const handleAddCabin = () => {
        if (selectedCabin) {
            const cabin = availableCabins.find((c) => c.id === Number.parseInt(selectedCabin))
            const quantity = localFormData.cabinQuantity || 1

            setLocalFormData((prev) => {
                const existingCabinIndex = prev.cabins.findIndex((c) => c.capacity === cabin.capacity)

                let newCabins
                if (existingCabinIndex >= 0) {
                    newCabins = prev.cabins.map((c, index) =>
                        index === existingCabinIndex
                            ? {
                                ...c,
                                quantity: c.quantity + quantity,
                                totalCapacity: (c.quantity + quantity) * c.capacity,
                            }
                            : c,
                    )
                } else {
                    newCabins = [
                        ...prev.cabins,
                        {
                            capacity: cabin.capacity,
                            quantity: quantity,
                            name: `Cabaña ${cabin.capacity} personas`,
                            totalCapacity: quantity * cabin.capacity,
                        },
                    ]
                }

                return {
                    ...prev,
                    cabins: newCabins,
                    capacidad: calculateTotalCapacity(newCabins, prev.bedrooms),
                }
            })
            setSelectedCabin("")
        }
    }

    // Función para agregar habitación
    const handleAddBedroom = () => {
        if (selectedBedroom) {
            const bedroom = availableBedrooms.find((b) => b.id === Number.parseInt(selectedBedroom))
            const quantity = localFormData.bedroomQuantity || 1

            setLocalFormData((prev) => {
                const existingBedroomIndex = prev.bedrooms.findIndex((b) => b.capacity === bedroom.capacity)

                let newBedrooms
                if (existingBedroomIndex >= 0) {
                    newBedrooms = prev.bedrooms.map((b, index) =>
                        index === existingBedroomIndex
                            ? {
                                ...b,
                                quantity: b.quantity + quantity,
                                totalCapacity: (b.quantity + quantity) * b.capacity,
                            }
                            : b,
                    )
                } else {
                    newBedrooms = [
                        ...prev.bedrooms,
                        {
                            capacity: bedroom.capacity,
                            quantity: quantity,
                            name: `Habitación ${bedroom.capacity} personas`,
                            totalCapacity: quantity * bedroom.capacity,
                        },
                    ]
                }

                return {
                    ...prev,
                    bedrooms: newBedrooms,
                    capacidad: calculateTotalCapacity(prev.cabins, newBedrooms),
                }
            })
            setSelectedBedroom("")
        }
    }

    // Función para agregar servicio
    const handleAddService = () => {
        if (selectedService) {
            const service = availableServices.find((s) => s.Id_Service === Number.parseInt(selectedService))

            setLocalFormData((prev) => {
                const existingServiceIndex = prev.services.findIndex((s) => s.id === service.Id_Service)

                let newServices
                if (existingServiceIndex >= 0) {
                    newServices = prev.services.map((s, index) =>
                        index === existingServiceIndex
                            ? {
                                ...s,
                                quantity: s.quantity + serviceQuantity,
                                subtotal: service.Price * (s.quantity + serviceQuantity),
                            }
                            : s,
                    )
                } else {
                    newServices = [
                        ...prev.services,
                        {
                            id: service.Id_Service,
                            name: service.name,
                            Price: service.Price,
                            quantity: serviceQuantity,
                            subtotal: service.Price * serviceQuantity,
                        },
                    ]
                }

                // Calcular nuevo total
                const newTotal = newServices.reduce((total, s) => total + s.subtotal, 0)

                return {
                    ...prev,
                    services: newServices,
                    total: newTotal,
                }
            })
            setSelectedService("")
            setServiceQuantity(1)
        }
    }

    // Función para actualizar cantidad de cabaña
    const handleUpdateCabinQuantity = (index, newQuantity) => {
        if (newQuantity >= 0) {
            setLocalFormData((prev) => {
                const newCabins = prev.cabins.map((c, idx) =>
                    idx === index
                        ? {
                            ...c,
                            quantity: newQuantity,
                            totalCapacity: c.capacity * newQuantity,
                        }
                        : c,
                )
                return {
                    ...prev,
                    cabins: newCabins,
                    capacidad: calculateTotalCapacity(newCabins, prev.bedrooms),
                }
            })
        }
    }

    // Función para actualizar cantidad de habitación
    const handleUpdateBedroomQuantity = (index, newQuantity) => {
        if (newQuantity >= 0) {
            setLocalFormData((prev) => {
                const newBedrooms = prev.bedrooms.map((b, idx) =>
                    idx === index
                        ? {
                            ...b,
                            quantity: newQuantity,
                            totalCapacity: b.capacity * newQuantity,
                        }
                        : b,
                )
                return {
                    ...prev,
                    bedrooms: newBedrooms,
                    capacidad: calculateTotalCapacity(prev.cabins, newBedrooms),
                }
            })
        }
    }

    // Función para actualizar cantidad de servicio
    const handleUpdateServiceQuantity = (index, newQuantity) => {
        if (newQuantity >= 0) {
            setLocalFormData((prev) => {
                const newServices = prev.services.map((s, idx) =>
                    idx === index
                        ? {
                            ...s,
                            quantity: newQuantity,
                            subtotal: s.Price * newQuantity,
                        }
                        : s,
                )
                const newTotal = newServices.reduce((total, s) => total + s.subtotal, 0)
                return {
                    ...prev,
                    services: newServices,
                    total: newTotal,
                }
            })
        }
    }

    // Función para eliminar cabaña
    const handleRemoveCabin = (index) => {
        setLocalFormData((prev) => {
            const newCabins = prev.cabins.filter((_, i) => i !== index)
            return {
                ...prev,
                cabins: newCabins,
                capacidad: calculateTotalCapacity(newCabins, prev.bedrooms),
            }
        })
    }

    // Función para eliminar habitación
    const handleRemoveBedroom = (index) => {
        setLocalFormData((prev) => {
            const newBedrooms = prev.bedrooms.filter((_, i) => i !== index)
            return {
                ...prev,
                bedrooms: newBedrooms,
                capacidad: calculateTotalCapacity(prev.cabins, newBedrooms),
            }
        })
    }

    // Función para eliminar servicio
    const handleRemoveService = (index) => {
        setLocalFormData((prev) => {
            const newServices = prev.services.filter((_, i) => i !== index)
            const newTotal = newServices.reduce((total, s) => total + s.subtotal, 0)
            return {
                ...prev,
                services: newServices,
                total: newTotal,
            }
        })
    }

    if (!isOpen) return null

    return (
        <div className="plan-modal-overlay">
            <div className="plan-modal-container">
                <div className="plan-modal-header">
                    <h2 className="plan-modal-title">{planToEdit ? "Editar Plan" : "Crear Nuevo Plan"}</h2>
                    <button className="plan-close-button" onClick={resetForm}>
                        ×
                    </button>
                </div>

                <div className="plan-form">
                    <div className="plan-tabs-container">
                        <ul className="plan-tabs">
                            <li className={`plan-tab ${activeTab === "basic" ? "active" : ""}`} onClick={() => setActiveTab("basic")}>
                                Información Básica
                            </li>
                            <li
                                className={`plan-tab ${activeTab === "details" ? "active" : ""}`}
                                onClick={() => setActiveTab("details")}
                            >
                                Detalles del Plan
                            </li>
                            <li
                                className={`plan-tab ${activeTab === "services" ? "active" : ""}`}
                                onClick={() => setActiveTab("services")}
                            >
                                Servicios del Plan
                            </li>
                        </ul>
                    </div>

                    <form className="plan-form-content" onSubmit={handleSubmit}>
                        {/* Pestaña de Información Básica */}
                        <div className={`plan-tab-content ${activeTab === "basic" ? "active" : ""}`}>
                            <div className="plan-form-basic-grid">
                                {/* Columna izquierda: nombre y descripción */}
                                <div className="plan-form-basic-left">
                                    {/* Ejemplo para el campo nombre */}
                                    <div className="plan-form-group">
                                        <label htmlFor="name" className="plan-form-label">
                                            Nombre del Plan
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={localFormData.name}
                                            onChange={handleChange}
                                            className={`plan-form-input${errors.name ? " input-error" : ""}`}
                                            placeholder="Ingrese el nombre del plan"
                                            required
                                        />
                                        {errors.name && <span className="plan-error-message">{errors.name}</span>}
                                    </div>
                                    <div className="plan-form-group">
                                        <label htmlFor="description" className="plan-form-label">
                                            Descripción
                                        </label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            value={localFormData.description}
                                            onChange={handleChange}
                                            className={`plan-form-input${errors.description ? " input-error" : ""}`}
                                            placeholder="Ingrese la descripción del plan"
                                            required
                                        />
                                        {errors.description && <span className="plan-error-message">{errors.description}</span>}
                                    </div>
                                </div>
                                {/* Columna derecha: imagen */}
                                <div className="plan-form-basic-right">
                                    <label htmlFor="image" className="plan-form-label">
                                        Imagen
                                    </label>
                                    <input
                                        type="file"
                                        id="image"
                                        name="image"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className={`plan-form-input${imageError ? " input-error" : ""}`}
                                    />
                                    {imageError && <span className="plan-error-message">{imageError}</span>}
                                    {(localFormData.image || localFormData.imageFile) ? (
                                        <div className="plan-image-preview plan-image-preview--exclusive">
                                            <img
                                                src={
                                                    typeof localFormData.image === "string" && localFormData.image
                                                        ? `http://localhost:3000${localFormData.image}`
                                                        : localFormData.imageFile
                                                            ? URL.createObjectURL(localFormData.imageFile)
                                                            : "https://via.placeholder.com/220x160?text=Sin+imagen"
                                                }
                                                alt="Vista previa"
                                            />
                                        </div>
                                    ) : (
                                        <div className="plan-image-preview plan-image-preview--exclusive">
                                            <img
                                                src="https://via.placeholder.com/220x160?text=Sin+imagen"
                                                alt="Sin imagen"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Pestaña de Detalles del Plan */}
                        <div className={`plan-tab-content ${activeTab === "details" ? "active" : ""}`}>
                            <div className="plan-form-sections">
                                {/* Sección de Cabañas */}
                                <div className="plan-form-section">
                                    <h3 className="plan-section-title">Cabañas</h3>
                                    <div className="plan-selection-container">
                                        <div className="plan-select-group">
                                            <select
                                                className="plan-form-select"
                                                value={selectedCabin}
                                                onChange={(e) => setSelectedCabin(e.target.value)}
                                            >
                                                <option value="">Seleccionar cabaña</option>
                                                {availableCabins.map((cabin) => (
                                                    <option key={cabin.id} value={cabin.id}>
                                                        {cabin.name} - capacidad: {cabin.capacity}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="plan-quantity-control">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={localFormData.cabinQuantity || 1}
                                                    onChange={(e) =>
                                                        setLocalFormData((prev) => ({
                                                            ...prev,
                                                            cabinQuantity: Number.parseInt(e.target.value) || 1,
                                                        }))
                                                    }
                                                    className="plan-quantity-input"
                                                />
                                                <button type="button" className="plan-add-button" onClick={handleAddCabin}>
                                                    Agregar
                                                </button>
                                            </div>
                                        </div>

                                        {localFormData.cabins.length > 0 && (
                                            <div className="plan-table-container">
                                                <table className="plan-table">
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
                                                                        onChange={(e) =>
                                                                            handleUpdateCabinQuantity(index, Number.parseInt(e.target.value) || 0)
                                                                        }
                                                                        className="plan-quantity-input"
                                                                    />
                                                                </td>
                                                                <td>{cabin.totalCapacity}</td>
                                                                <td>
                                                                    <button
                                                                        type="button"
                                                                        className="plan-remove-button"
                                                                        onClick={() => handleRemoveCabin(index)}
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
                                <div className="plan-form-section">
                                    <h3 className="plan-section-title">Habitaciones</h3>
                                    <div className="plan-selection-container">
                                        <div className="plan-select-group">
                                            <select
                                                className="plan-form-select"
                                                value={selectedBedroom}
                                                onChange={(e) => setSelectedBedroom(e.target.value)}
                                            >
                                                <option value="">Seleccionar habitación</option>
                                                {availableBedrooms.map((bedroom) => (
                                                    <option key={bedroom.id} value={bedroom.id}>
                                                        {bedroom.name} - Cap: {bedroom.capacity}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="plan-quantity-control">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={localFormData.bedroomQuantity || 1}
                                                    onChange={(e) =>
                                                        setLocalFormData((prev) => ({
                                                            ...prev,
                                                            bedroomQuantity: Number.parseInt(e.target.value) || 1,
                                                        }))
                                                    }
                                                    className="plan-quantity-input"
                                                />
                                                <button type="button" className="plan-add-button" onClick={handleAddBedroom}>
                                                    Agregar
                                                </button>
                                            </div>
                                        </div>

                                        {localFormData.bedrooms.length > 0 && (
                                            <div className="plan-table-container">
                                                <table className="plan-table">
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
                                                                        onChange={(e) =>
                                                                            handleUpdateBedroomQuantity(index, Number.parseInt(e.target.value) || 0)
                                                                        }
                                                                        className="plan-quantity-input"
                                                                    />
                                                                </td>
                                                                <td>{bedroom.totalCapacity}</td>
                                                                <td>
                                                                    <button
                                                                        type="button"
                                                                        className="plan-remove-button"
                                                                        onClick={() => handleRemoveBedroom(index)}
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
                                <div className="plan-form-section plan-capacity-section">
                                    <h3 className="plan-section-title">Capacidad Total</h3>
                                    <div className="plan-capacity-display">
                                        <input
                                            type="number"
                                            value={localFormData.capacidad || 30}
                                            readOnly
                                            className="plan-capacity-input"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pestaña de Servicios del Plan */}
                        <div className={`plan-tab-content ${activeTab === "services" ? "active" : ""}`}>
                            <div className="plan-form-sections">
                                <div className="plan-form-section plan-services-section">
                                    <h3 className="plan-section-title">Servicios Disponibles</h3>
                                    <div className="plan-services-selection">
                                        <div className="plan-service-input-group">
                                            <select
                                                className="plan-form-select"
                                                value={selectedService}
                                                onChange={(e) => setSelectedService(e.target.value)}
                                            >
                                                <option value="">Seleccionar servicio</option>
                                                {availableServices.map((service) => (
                                                    <option key={service.Id_Service} value={service.Id_Service}>
                                                        {service.name} - ${service.Price.toLocaleString()}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="plan-quantity-control">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={serviceQuantity}
                                                    onChange={(e) => setServiceQuantity(Number.parseInt(e.target.value) || 1)}
                                                    className="plan-quantity-input"
                                                />
                                                <button type="button" className="plan-add-button" onClick={handleAddService}>
                                                    Agregar
                                                </button>
                                            </div>
                                        </div>

                                        {localFormData.services?.length > 0 && (
                                            <div className="plan-table-container plan-services-table">
                                                <table className="plan-table">
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
                                                                        onChange={(e) =>
                                                                            handleUpdateServiceQuantity(index, Number.parseInt(e.target.value) || 0)
                                                                        }
                                                                        className="plan-quantity-input"
                                                                    />
                                                                </td>
                                                                <td>${service.subtotal.toLocaleString()}</td>
                                                                <td>
                                                                    <button
                                                                        type="button"
                                                                        className="plan-remove-button"
                                                                        onClick={() => handleRemoveService(index)}
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

                                <div className="plan-form-section plan-summary-section">
                                    <h3 className="plan-section-title">Resumen de Precios</h3>
                                    <div className="plan-price-summary">
                                        <div className="plan-summary-row">
                                            <span>Total Servicios:</span>
                                            <span className="plan-price-value">${localFormData.total.toLocaleString()}</span>
                                        </div>
                                        <div className="plan-form-group">
                                            <label htmlFor="salePrice" className="plan-form-label">
                                                Precio de Venta Final
                                            </label>
                                            <input
                                                type="number"
                                                id="salePrice"
                                                name="salePrice"
                                                value={localFormData.salePrice}
                                                onChange={handleChange}
                                                required
                                                className="plan-form-input plan-price-input"
                                                placeholder="Ingrese el precio de venta"
                                            />
                                            {errors.salePrice && <span className="plan-error-message">{errors.salePrice}</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="plan-modal-footer">
                            <button type="button" className="plan-cancel-button" onClick={resetForm}>
                                Cancelar
                            </button>
                            <button type="submit" className="plan-submit-button">
                                {planToEdit ? "Guardar Cambios" : "Crear Plan"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default FormPlans
