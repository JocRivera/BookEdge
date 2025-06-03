import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import Switch from "../../components/common/Switch/Switch"
import "./customerReservations.css"

// Hooks y utilidades
import useReservationForm from "../../components/features/componentReservations/reservationHooks"
import { calculateTotal, updateAvailability, createSelectionHandlers, sanitizeDataForServer } from "../../components/features/componentReservations/reservationUtils"

// Componentes de pasos
import { BasicInfoStep, CompanionsStep, AvailabilityStep, PaymentStep } from "../../components/features/componentReservations/reservationSteps"

// Servicios
import { createReservation, addCompanionReservation } from "../../services/reservationsService"
import { createCompanion } from "../../services/companionsService"
import { addPaymentToReservation } from "../../services/paymentsService"
import { getUsers, getAllPlanes, getCabins, getBedrooms, getServices } from "../../services/reservationsService"

// Context
import { useAuth } from "../../context/AuthContext"

function FormReservation() {
    const [step, setStep] = useState(1)
    const [tempPayments, setTempPayments] = useState([])
    const [loading, setLoading] = useState(false)
    const [initialDataLoaded, setInitialDataLoaded] = useState(false)

    // Navegación y autenticación
    const location = useLocation()
    const navigate = useNavigate()
    const { user, isAuthenticated } = useAuth()

    // Obtener el plan desde la navegación
    const planFromNavigation = location.state?.plan

    // Hook del formulario
    const { formData, updateFormData, errors, validateStep } = useReservationForm()

    // Función para limpiar errores
    const clearError = (fieldName) => {
        console.log(`Clearing error for field: ${fieldName}`)
    }

    // Crear setFormData como wrapper de updateFormData
    const setFormData = (newData) => {
        if (typeof newData === "function") {
            updateFormData(newData(formData))
        } else {
            updateFormData(newData)
        }
    }

    // Verificar autenticación al cargar
    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login", {
                state: {
                    from: location.pathname,
                    plan: planFromNavigation
                }
            })
            return
        }
    }, [isAuthenticated, navigate, location.pathname, planFromNavigation])

    // Cargar datos iniciales
    useEffect(() => {
        const loadInitialData = async () => {
            if (!isAuthenticated || !user) return

            try {
                setLoading(true)
                console.log("🔄 Cargando datos iniciales...")

                // Cargar datos del servidor
                const [usersData, planesData, cabinsData, bedroomsData, servicesData] = await Promise.all([
                    getUsers(),
                    getAllPlanes(),
                    getCabins(),
                    getBedrooms(),
                    getServices(),
                ])

                console.log("📊 Datos cargados del servidor:", {
                    users: usersData?.length,
                    planes: planesData?.length,
                    cabins: cabinsData?.length,
                    bedrooms: bedroomsData?.length,
                    services: servicesData?.length,
                })

                // Filtrar solo elementos en servicio
                const activeCabins = cabinsData?.filter((cabin) => cabin.status?.toLowerCase() === "en servicio") || []
                const activeBedrooms = bedroomsData?.filter((bedroom) => bedroom.status?.toLowerCase() === "en servicio") || []

                // Configurar datos iniciales del formulario
                const initialFormData = {
                    // Datos del usuario autenticado (read-only)
                    idUser: user.idUser || "",
                    userEmail: user.email || "",
                    userName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
                    userPhone: user.phone || "",
                    userDocument: user.documentNumber || "",

                    // Datos del plan (si viene de navegación)
                    idPlan: planFromNavigation?.Plan?.idPlan || planFromNavigation?.idPlan || "",
                    planName: planFromNavigation?.Plan?.name || "",
                    planPrice: planFromNavigation?.Plan?.salePrice || 0,

                    // Fechas del plan programado
                    startDate: planFromNavigation?.startDate || "",
                    endDate: planFromNavigation?.endDate || "",

                    // Datos del servidor
                    users: usersData || [],
                    planes: planesData || [],
                    cabins: activeCabins,
                    bedrooms: activeBedrooms,
                    availableServices: servicesData || [],

                    // Estado inicial
                    status: "Pendiente",
                    hasCompanions: false,
                    companionCount: 0,
                    companions: [],
                    selectedServices: [],
                    idCabin: "",
                    idRoom: "",
                }

                // Aplicar lógica de disponibilidad
                const dataWithAvailability = updateAvailability(initialFormData)

                updateFormData(dataWithAvailability)
                setInitialDataLoaded(true)

                console.log("✅ Datos iniciales cargados:", {
                    user: user.email,
                    plan: planFromNavigation?.Plan?.name,
                    availableCabins: dataWithAvailability.availableCabins?.length,
                    availableBedrooms: dataWithAvailability.availableBedrooms?.length,
                })

            } catch (error) {
                console.error("❌ Error cargando datos iniciales:", error)
                Switch({
                    show: true,
                    message: `Error al cargar datos: ${error.message}`,
                    type: "error",
                })
            } finally {
                setLoading(false)
            }
        }

        loadInitialData()
    }, [isAuthenticated, user, planFromNavigation])

    // Handler para cambios en el formulario
    const handleChange = async (e) => {
        const { name, value, type, checked } = e.target

        console.log("📝 HandleChange ejecutado:", { name, value, type, checked })

        setFormData((prev) => {
            let newData = { ...prev }

            if (type === "checkbox") {
                newData[name] = checked

                if (name === "hasCompanions" && !checked) {
                    newData.companionCount = 0
                    newData.companions = []
                } else if (name === "hasCompanions" && checked && !newData.companionCount) {
                    newData.companionCount = 1
                }
            } else {
                newData[name] = value
            }

            // Aplicar lógica de disponibilidad cuando cambian campos relevantes
            if (name === "companionCount" || name === "hasCompanions") {
                console.log("👥 Actualizando disponibilidad por cambio en:", name)

                newData.idCabin = ""
                newData.idRoom = ""
                newData = updateAvailability(newData)

                const companionCount = newData.companionCount || 0
                let message = ""

                if (companionCount > 1) {
                    const availableCabins = newData.availableCabins.length
                    message = availableCabins > 0
                        ? `🏠 Disponibles ${availableCabins} cabañas para ${companionCount + 1} huéspedes`
                        : `❌ No hay cabañas disponibles para ${companionCount + 1} huéspedes`
                } else {
                    const availableRooms = newData.availableBedrooms.length
                    message = availableRooms > 0
                        ? `🛏️ Disponibles ${availableRooms} habitaciones para ${companionCount + 1} huéspedes`
                        : `❌ No hay habitaciones disponibles`
                }

                setTimeout(() => {
                    Switch({
                        show: true,
                        message: message,
                        type: message.includes("❌") ? "error" : "success",
                    })
                }, 100)
            }

            return newData
        })

        clearError(name)
    }

    // Handlers para selección
    const { handleCabinSelect, handleRoomSelect, handleServiceToggle, handleServiceQuantityChange } = createSelectionHandlers(setFormData)

    // Navegación entre pasos
    const nextStep = () => {
        console.log("➡️ Intentando avanzar al siguiente paso. Paso actual:", step)
        const isValid = validateStep(step, formData)
        console.log("✅ Validación del paso:", isValid)

        if (isValid) {
            if (step === 1 && !formData.hasCompanions) {
                setStep(3) // Saltar al paso de disponibilidad
            } else {
                setStep(step + 1)
            }
        } else {
            console.log("❌ Validación falló, no se puede avanzar")
        }
    }

    const prevStep = () => {
        console.log("⬅️ Retrocediendo desde el paso:", step)
        if (step === 4 && !formData.hasCompanions) {
            setStep(1)
        } else if (step === 3 && !formData.hasCompanions) {
            setStep(1)
        } else {
            setStep(step - 1)
        }
    }

    // Manejo de acompañantes
    const handleSaveCompanion = (newCompanion) => {
        console.log("👤 Guardando nuevo acompañante:", newCompanion)

        setFormData((prev) => {
            const updatedCompanions = [...(prev.companions || []), newCompanion]
            return {
                ...prev,
                companions: updatedCompanions,
                companionCount: updatedCompanions.length,
            }
        })
    }

    const handleDeleteCompanion = (idOrDocNumber) => {
        if (loading) return

        console.log("🗑️ Eliminando acompañante:", idOrDocNumber)

        setFormData((prev) => {
            const filteredCompanions = (prev.companions || []).filter(
                (c) => c.idCompanions !== idOrDocNumber && c.documentNumber !== idOrDocNumber,
            )

            return {
                ...prev,
                companions: filteredCompanions,
            }
        })
    }

    // Manejo de pagos
    const handleAddPayment = async (paymentData) => {
        try {
            setLoading(true)
            console.log("💳 Agregando pago temporal:", paymentData)

            if (!paymentData.amount || isNaN(Number.parseFloat(paymentData.amount))) {
                throw new Error("El monto del pago no es válido")
            }

            const amount = Number.parseFloat(paymentData.amount)
            if (amount <= 0) {
                throw new Error("El monto debe ser mayor que cero")
            }

            const newPayment = {
                ...paymentData,
                amount: amount,
                status: paymentData.status || "Pendiente",
                paymentDate: paymentData.paymentDate || new Date().toISOString().split("T")[0],
                paymentMethod: paymentData.paymentMethod || "Efectivo",
                tempId: `temp-${Date.now()}`,
                isTemp: true,
            }

            setTempPayments((prev) => [...prev, newPayment])
            return newPayment

        } catch (error) {
            console.error("❌ Error al agregar pago:", error)
            throw error
        } finally {
            setLoading(false)
        }
    }

    // Guardar acompañante en reserva
    const handleSaveCompanionInReservation = async (companionData, reservationId) => {
        try {
            console.log("👤 Guardando acompañante en reserva:", { companionData, reservationId })

            const companionResponse = await createCompanion(companionData)

            if (!companionResponse?.idCompanions) {
                throw new Error("El servidor no devolvió un ID válido para el acompañante")
            }

            await addCompanionReservation(reservationId, { idCompanions: companionResponse.idCompanions })

            const savedCompanion = {
                ...companionData,
                idCompanions: companionResponse.idCompanions,
            }

            return savedCompanion
        } catch (error) {
            console.error("❌ Error en handleSaveCompanionInReservation:", error)
            throw error
        }
    }

    // Envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault()

        console.log("🚀 Iniciando proceso de guardado de reserva")

        if (!validateStep(3, formData)) {
            console.log("❌ Validación del paso 3 falló")
            return
        }

        try {
            setLoading(true)

            const payload = sanitizeDataForServer(formData)
            console.log("📦 Payload final para enviar:", payload)

            const resultado = await createReservation(payload)
            console.log("✅ Reserva creada:", resultado)

            if (!resultado?.idReservation) {
                throw new Error("No se recibió un ID de reserva válido del servidor")
            }

            // Guardar acompañantes si existen
            if (formData.hasCompanions && formData.companions && formData.companions.length > 0) {
                console.log("👥 Procesando acompañantes...")
                for (const companion of formData.companions) {
                    await handleSaveCompanionInReservation(companion, resultado.idReservation)
                }
            }

            // Guardar pagos temporales si existen
            if (tempPayments.length > 0) {
                console.log("💳 Procesando pagos temporales:", tempPayments.length)
                await Promise.allSettled(
                    tempPayments.map((payment) =>
                        addPaymentToReservation({
                            ...payment,
                            idReservation: resultado.idReservation,
                        })
                    )
                )
            }

            Switch({
                show: true,
                message: "¡Reserva creada exitosamente!",
                type: "success",
            })

            // Redirigir después de un breve delay
            setTimeout(() => {
                navigate("/")
            }, 1200)

        } catch (error) {
            console.error("❌ Error al guardar reserva:", error)
            Switch({
                show: true,
                message: `Error al guardar: ${error.message}`,
                type: "error",
            })
        } finally {
            setLoading(false)
        }
    }

    // Mostrar loading mientras se cargan los datos iniciales
    if (!initialDataLoaded || !isAuthenticated) {
        return (
            <div className="reservations-container">
                <div className="reservations-loading">
                    <div>Cargando formulario de reserva...</div>
                </div>
            </div>
        )
    }

    const totalAmount = calculateTotal(formData, formData.planes || [])

    return (
        <div className="reservations-container">
            <div className="reservations-header">
                <h1>Nueva Reserva</h1>
                {planFromNavigation && (
                    <div className="plan-info">
                        <h3>Plan: {formData.planName}</h3>
                        <p>Precio: ${formData.planPrice?.toLocaleString()}</p>
                    </div>
                )}
                <button
                    className="reservations-back-button"
                    onClick={() => navigate("/")}
                    type="button"
                    disabled={loading}
                >
                    ← Volver a Planes
                </button>
            </div>

            <div className="steps-indicator">
                <div className={`step ${step === 1 ? "active" : ""}`}>1. Datos Reserva</div>
                {formData.hasCompanions && <div className={`step ${step === 2 ? "active" : ""}`}>2. Acompañantes</div>}
                <div className={`step ${step === (formData.hasCompanions ? 3 : 2) ? "active" : ""}`}>
                    {formData.hasCompanions ? "3" : "2"}. Disponibilidad
                </div>
                <div className={`step ${step === (formData.hasCompanions ? 4 : 3) ? "active" : ""}`}>
                    {formData.hasCompanions ? "4" : "3"}. Pagos
                </div>
            </div>

            <div className="reservations-form-container">
                <form onSubmit={handleSubmit} noValidate>
                    {step === 1 && (
                        <BasicInfoStep
                            formData={formData}
                            errors={errors}
                            users={formData.users || []}
                            planes={formData.planes || []}
                            loading={loading}
                            // isReadOnly={true} // Los datos del usuario y plan son read-only
                            onChange={handleChange}
                            isStandalone={true} // Indicar que es versión standalone
                        />
                    )}

                    {step === 2 && formData.hasCompanions && (
                        <CompanionsStep
                            formData={formData}
                            errors={errors}
                            loading={loading}
                            isReadOnly={false}
                            onSaveCompanion={handleSaveCompanion}
                            onDeleteCompanion={handleDeleteCompanion}
                        />
                    )}

                    {step === (formData.hasCompanions ? 3 : 2) && (
                        <AvailabilityStep
                            formData={formData}
                            errors={errors}
                            loading={loading}
                            onCabinSelect={handleCabinSelect}
                            onRoomSelect={handleRoomSelect}
                            onServiceToggle={handleServiceToggle}
                            onServiceQuantityChange={handleServiceQuantityChange}
                        />
                    )}

                    {step === (formData.hasCompanions ? 4 : 3) && (
                        <PaymentStep
                            totalAmount={totalAmount}
                            reservationPayments={[]}
                            tempPayments={tempPayments}
                            reservationData={null}
                            isReadOnly={false}
                            loading={loading}
                            onPaymentSubmit={handleAddPayment}
                        />
                    )}

                    <div className="form-footer">
                        {step > 1 && (
                            <button
                                type="button"
                                className="reservations-cancel-btn"
                                onClick={prevStep}
                                disabled={loading}
                            >
                                Anterior
                            </button>
                        )}

                        {step < (formData.hasCompanions ? 4 : 3) && (
                            <button
                                type="button"
                                className="submit-btn"
                                onClick={nextStep}
                                disabled={loading}
                            >
                                {step === (formData.hasCompanions ? 3 : 2)
                                    ? "Ir a Pagos"
                                    : step === 2
                                        ? "Verificar Disponibilidad"
                                        : "Siguiente"}
                            </button>
                        )}

                        {step === (formData.hasCompanions ? 4 : 3) && (
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? "Creando Reserva..." : "Crear Reserva"}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    )
}

export default FormReservation