"use client"

import React, { useState, useEffect } from "react"
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    parseISO,
    isAfter,
    isBefore,
    startOfDay,
    set,
} from "date-fns"
import { es } from "date-fns/locale"
import { FiChevronLeft, FiChevronRight, FiCalendar, FiClock, FiUsers, FiDollarSign } from "react-icons/fi"
import {
    getAllProgramedPlans,
    createProgramedPlan,
    updateProgramedPlan,
    deleteProgramedPlan,
} from "../../../services/PlanProgramed"
import { getAllPlans } from "../../../services/PlanService"
import { toast } from "react-toastify";
import { useAlert } from "../../../context/AlertContext";
import "./PlanProgramed.css"

const MONTHS_ES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const PlanProgramed = () => {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [programedPlans, setProgramedPlans] = useState([])
    const [availablePlans, setAvailablePlans] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedDate, setSelectedDate] = useState(null)
    const [selectedPlan, setSelectedPlan] = useState(null)
    const [formData, setFormData] = useState({
        idPlan: "",
        startDate: "",
        endDate: "",
    })
    const [formErrors, setFormErrors] = useState({})
    const [isEditMode, setIsEditMode] = useState(false)
    const [selectedProgramedPlan, setSelectedProgramedPlan] = useState(null)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
    const [detailPlan, setDetailPlan] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [showDayPlansModal, setShowDayPlansModal] = useState(false)
    const [dayPlans, setDayPlans] = useState([])
    const [dayPlansDate, setDayPlansDate] = useState(null)
    const { showAlert } = useAlert();

    // Nuevo estado para año y mes seleccionados
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

    const prevYear = () => setSelectedYear((y) => y - 1);
    const nextYear = () => setSelectedYear((y) => y + 1);

    // Fetch programed plans and available plans
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            try {
                const [programedPlansData, availablePlansData] = await Promise.all([getAllProgramedPlans(), getAllPlans()])

                // Transform dates from string to Date objects
                const formattedProgramedPlans = programedPlansData.map((plan) => ({
                    ...plan,
                    startDate: parseISO(plan.startDate),
                    endDate: parseISO(plan.endDate),
                }))

                setProgramedPlans(formattedProgramedPlans)
                setAvailablePlans(availablePlansData)
            } catch (error) {
                console.error("Error fetching data:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [selectedProgramedPlan, isModalOpen])

    // Actualiza currentDate cuando cambian mes o año
    useEffect(() => {
        setCurrentDate(new Date(selectedYear, selectedMonth, 1));
    }, [selectedMonth, selectedYear]);

    // Cuando currentDate cambia, sincroniza los selects
    useEffect(() => {
        setSelectedMonth(currentDate.getMonth());
        setSelectedYear(currentDate.getFullYear());
    }, [currentDate]);

    // Get days of current month
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

    // Get days from previous and next month to fill the calendar grid
    const startDay = monthStart.getDay() // 0 = Sunday, 1 = Monday, etc.
    const endDay = 6 - monthEnd.getDay()

    // Previous month days to display
    const prevMonthDays = []
    for (let i = startDay - 1; i >= 0; i--) {
        const date = new Date(monthStart)
        date.setDate(date.getDate() - (i + 1))
        prevMonthDays.push(date)
    }

    // Next month days to display
    const nextMonthDays = []
    for (let i = 1; i <= endDay; i++) {
        const date = new Date(monthEnd)
        date.setDate(date.getDate() + i)
        nextMonthDays.push(date)
    }

    // All days to display in the calendar
    const calendarDays = [...prevMonthDays, ...monthDays, ...nextMonthDays]

    // Navigate to previous month
    const prevMonth = () => {
        setCurrentDate(subMonths(currentDate, 1))
    }

    // Navigate to next month
    const nextMonth = () => {
        setCurrentDate(addMonths(currentDate, 1))
    }

    // Navigate to today
    const goToToday = () => {
        setCurrentDate(new Date())
    }

    // Open modal to add a new programed plan
    const openAddModal = (date) => {
        setSelectedDate(date)
        setFormData({
            idPlan: "",
            startDate: format(date, "yyyy-MM-dd"),
            endDate: format(date, "yyyy-MM-dd"),
        })
        setIsEditMode(false)
        setIsModalOpen(true)
    }

    // Open modal to edit an existing programed plan
    const openEditModal = (programedPlan) => {
        setSelectedProgramedPlan(programedPlan)
        setFormData({
            idPlan: programedPlan.idPlan,
            startDate: format(programedPlan.startDate, "yyyy-MM-dd"),
            endDate: format(programedPlan.endDate, "yyyy-MM-dd"),
        })
        setIsEditMode(true)
        setIsModalOpen(true)
    }

    // Open modal to view plan details
    const openDetailModal = (programedPlan) => {
        const planDetails = availablePlans.find((plan) => plan.idPlan === programedPlan.idPlan)
        setDetailPlan({
            ...programedPlan,
            planDetails,
        })
        setIsDetailModalOpen(true)
        setSelectedProgramedPlan(programedPlan)
    }

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value,
        })

        // Clear error for this field
        if (formErrors[name]) {
            setFormErrors({
                ...formErrors,
                [name]: "",
            })
        }

        // If plan is selected, update selected plan
        if (name === "idPlan") {
            const plan = availablePlans.find((p) => p.idPlan === Number.parseInt(value))
            setSelectedPlan(plan)
        }
    }

    // Validate form data
    const validateForm = () => {
        const errors = {}
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const startDate = parseISO(formData.startDate)
        const endDate = parseISO(formData.endDate)

        if (!formData.idPlan) {
            errors.idPlan = "Debes seleccionar un plan"
        }

        if (!formData.startDate) {
            errors.startDate = "La fecha de inicio es requerida"
        } else if (isBefore(startDate, today)) {
            errors.startDate = "La fecha de inicio no puede ser anterior a hoy"
        }

        if (!formData.endDate) {
            errors.endDate = "La fecha de fin es requerida"
        } else if (isBefore(endDate, startDate)) {
            errors.endDate = "La fecha de fin no puede ser anterior a la fecha de inicio"
        }

        // --- VALIDACIÓN DE SOLAPAMIENTO DE PLANES ---
        // Solo valida si ya se seleccionó plan y fechas válidas
        if (formData.idPlan && formData.startDate && formData.endDate) {
            const selectedIdPlan = Number(formData.idPlan);
            const overlapping = programedPlans.some(plan => {
                // Si estamos editando, ignorar el plan actual
                if (isEditMode && plan.idPlanProgramed === selectedProgramedPlan?.idPlanProgramed) return false;

                // Verificar si hay solapamiento de fechas para el mismo plan
                if (plan.idPlan === selectedIdPlan) {
                    const planStartDate = plan.startDate;
                    const planEndDate = plan.endDate;

                    // Caso 1: El nuevo plan comienza dentro del rango de un plan existente
                    if ((isAfter(startDate, planStartDate) || isSameDay(startDate, planStartDate)) && (isBefore(startDate, planEndDate) || isSameDay(startDate, planEndDate))) {
                        return true;
                    }

                    // Caso 2: El nuevo plan termina dentro del rango de un plan existente
                    if ((isAfter(endDate, planStartDate) || isSameDay(endDate, planStartDate)) && (isBefore(endDate, planEndDate) || isSameDay(endDate, plan.endDate))) {
                        return true;
                    }

                    // Caso 3: El nuevo plan envuelve completamente un plan existente
                    if ((isBefore(startDate, planStartDate) && isAfter(endDate, planEndDate)) || isSameDay(startDate, planStartDate) && isSameDay(endDate,planEndDate)) {
                        return true;
                    }

                    // Caso 4: El plan existente envuelve completamente al nuevo plan
                    if ((isBefore(planStartDate, startDate) && isAfter(planEndDate, endDate))) {
                        return true;
                    }
                }

                return false; // No hay solapamiento con este plan
            });

            if (overlapping) {
                errors.idPlan = "Ya existe una programación de este plan en el rango de fechas seleccionado";
            }
        }

        return errors
    }

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setIsLoading(true);
        try {
            if (isEditMode) {
                await updateProgramedPlan(selectedProgramedPlan.idPlanProgramed, formData);
                toast.success("Plan programado actualizado correctamente.");
            } else {
                await createProgramedPlan(formData);
                toast.success("Plan programado creado correctamente.");
            }

            // Refresh programed plans
            const programedPlansData = await getAllProgramedPlans();
            const formattedProgramedPlans = programedPlansData.map((plan) => ({
                ...plan,
                startDate: parseISO(plan.startDate),
                endDate: parseISO(plan.endDate),
            }));
            setProgramedPlans(formattedProgramedPlans);

            // Close modal and reset form
            setIsModalOpen(false);
            setFormData({
                idPlan: "",
                startDate: "",
                endDate: "",
            });
            setSelectedPlan(null);
        } catch (error) {
            console.error("Error saving programed plan:", error);
            const errorMessage = error.response?.data?.message || error.message || "Error al guardar el plan programado.";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCerradorDeOrtos = () => {
        setIsModalOpen(false)
        setFormData({
            idPlan: "",
            startDate: "",
            endDate: "",
        })
        setSelectedPlan(null)
        setSelectedProgramedPlan(null)
        setFormErrors({})
    }

    // Handle delete programed plan
    const handleDelete = async () => {
        if (!selectedProgramedPlan) return;

        showAlert({
            type: "confirm-delete",
            title: "Confirmar Eliminación",
            message: "¿Está seguro que desea eliminar este plan programado? Esta acción no se puede deshacer.",
            confirmText: "Sí, Eliminar",
            onConfirm: async () => {
                setIsLoading(true);
                try {
                    await deleteProgramedPlan(selectedProgramedPlan.idPlanProgramed);

                    // Refresh programed plans
                    const programedPlansData = await getAllProgramedPlans();
                    const formattedProgramedPlans = programedPlansData.map((plan) => ({
                        ...plan,
                        startDate: parseISO(plan.startDate),
                        endDate: parseISO(plan.endDate),
                    }));
                    setProgramedPlans(formattedProgramedPlans);

                    // Close modal and reset form
                    setIsModalOpen(false);
                    setFormData({
                        idPlan: "",
                        startDate: "",
                        endDate: "",
                    });
                    setSelectedPlan(null);
                    setSelectedProgramedPlan(null);
                    toast.success("Plan programado eliminado correctamente.");
                } catch (error) {
                    console.error("Error deleting programed plan:", error);
                    const errorMessage = error.response?.data?.message || error.message || "Error al eliminar el plan programado.";
                    toast.error(errorMessage);
                } finally {
                    setIsLoading(false);
                }
            }
        });
    }

    // Reemplazar la función getPlansForDate y la renderización de los días del calendario

    // Reemplazar la función getPlansForDate con esta nueva implementación
    const getPlansForDate = (date) => {
        return programedPlans.filter((plan) => {
            return (
                (isSameDay(date, plan.startDate) || isAfter(date, plan.startDate)) &&
                (isSameDay(date, plan.endDate) || isBefore(date, plan.endDate))
            )
        })
    }

    // Reemplazar la función isFirstDayOfPlan
    const isFirstDayOfPlan = (date, plan) => {
        return isSameDay(date, plan.startDate)
    }

    // Reemplazar la función isLastDayOfPlan
    const isLastDayOfPlan = (date, plan) => {
        return isSameDay(date, plan.endDate)
    }

    // Reemplazar la función getPositionInWeek
    const getPositionInWeek = (date) => {
        return date.getDay()
    }
    
    const getPlanNameById = (idPlan) => {
        const plan = availablePlans.find((p) => p.idPlan === idPlan)
        return plan ? plan.name : "Plan desconocido"
    }

    const today = startOfDay(new Date()); // Define el día de hoy al inicio del componente

    return (
        <div className="calendar-container">
            <div className="calendar-header">
                <h1 className="calendar-title">Calendario de Planes</h1>
                <div className="calendar-navigation">
                    <button className="calendar-nav-btn" onClick={prevYear} title="Año anterior">
                        «
                    </button>
                    <button className="calendar-nav-btn" onClick={prevMonth} title="Mes anterior">
                        <FiChevronLeft />
                    </button>
                    <select
                        className="calendar-month-select"
                        value={selectedMonth}
                        onChange={e => setSelectedMonth(Number(e.target.value))}
                        aria-label="Seleccionar mes"
                    >
                        {MONTHS_ES.map((month, idx) => (
                            <option key={month} value={idx}>{month}</option>
                        ))}
                    </select>
                    <select
                        className="calendar-year-select"
                        value={selectedYear}
                        onChange={e => setSelectedYear(Number(e.target.value))}
                        aria-label="Seleccionar año"
                    >
                        {Array.from({ length: 11 }, (_, i) => selectedYear - 5 + i).map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                    <button className="calendar-nav-btn" onClick={nextMonth} title="Mes siguiente">
                        <FiChevronRight />
                    </button>
                    <button className="calendar-nav-btn" onClick={nextYear} title="Año siguiente">
                        »
                    </button>
                    <button className="calendar-today-btn" onClick={goToToday}>
                        Hoy
                    </button>
                </div>
            </div>

            <div className="calendar-grid">
                <div className="calendar-weekdays">
                    <div>Dom</div>
                    <div>Lun</div>
                    <div>Mar</div>
                    <div>Mié</div>
                    <div>Jue</div>
                    <div>Vie</div>
                    <div>Sáb</div>
                </div>
                <div className="calendar-days">
                    {calendarDays.map((day, index) => {
                        const isCurrentMonth = isSameMonth(day, currentDate)
                        const isToday = isSameDay(day, today)
                        const plansForDay = getPlansForDate(day)
                        const hasPlans = plansForDay.length > 0
                        const dayPosition = getPositionInWeek(day)
                        const isPast = isBefore(startOfDay(day), today)

                        return (
                            <div
                                key={index}
                                className={`calendar-day ${isCurrentMonth ? "" : "other-month"} ${isToday ? "today" : ""} ${hasPlans ? "has-plans" : ""} ${isPast ? "disabled-day" : ""}`}
                                onClick={() => {
                                    if (!isPast) openAddModal(day)
                                }}
                                style={isPast ? { pointerEvents: "none", opacity: 0.5, cursor: "not-allowed" } : {}}
                            >
                                <div className="day-number">
                                    {isToday ? (
                                        <span className="today-label">Hoy</span>
                                    ) : (
                                        format(day, "d")
                                    )}
                                </div>
                                <div className="day-plans-container">
                                    {plansForDay.slice(0, 3).map((plan, planIndex) => {
                                        const planName = getPlanNameById(plan.idPlan)
                                        const isFirst = isFirstDayOfPlan(day, plan)
                                        const isLast = isLastDayOfPlan(day, plan)
                                        const planColor = `hsl(${(plan.idPlan * 75) % 360}, 70%, 65%)`

                                        return (
                                            <div
                                                key={`${plan.idPlanProgramed}-${planIndex}`}
                                                className={`day-plan-continuous ${isFirst ? 'plan-start' : ''} ${isLast ? 'plan-end' : ''}`}
                                                style={{
                                                    backgroundColor: planColor,
                                                    borderRadius: `${isFirst ? '4px' : '0'} ${isLast ? '4px' : '0'} ${isLast ? '4px' : '0'} ${isFirst ? '4px' : '0'}`,
                                                    marginLeft: isFirst && dayPosition !== 0 ? '0' : '',
                                                    marginRight: isLast && dayPosition !== 6 ? '0' : '',
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    openDetailModal(plan)
                                                }}
                                            >
                                                {isFirst && (
                                                    <span className="plan-name-label">{planName}</span>
                                                )}
                                            </div>
                                        )
                                    })}
                                    {plansForDay.length > 3 && (
                                        <div
                                            className="more-plans"
                                            style={{ cursor: "pointer", fontSize: "22px", textAlign: "center" }}
                                            onClick={e => {
                                                e.stopPropagation();
                                                setDayPlans(plansForDay);
                                                setDayPlansDate(day);
                                                setShowDayPlansModal(true);
                                            }}
                                        >
                                            &#8230; {/* Unicode para puntos suspensivos */}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {isDetailModalOpen && detailPlan && (
                <div className="calendar-modal-overlay">
                    <div className="calendar-modal-container">
                        <div className="calendar-modal-header">
                            <h2>Detalles del Plan Programado</h2>
                            <button className="calendar-close-button" onClick={() => setIsDetailModalOpen(false)}>
                                ×
                            </button>
                        </div>

                        <div className="calendar-modal-body">
                            <div className="calendar-plan-detail-content">
                                {detailPlan.planDetails && (
                                    <>
                                        <div className="calendar-plan-detail-header">
                                            <h3>{detailPlan.planDetails.name}</h3>
                                            <span className="calendar-plan-price">${detailPlan.planDetails.salePrice.toLocaleString()}</span>
                                        </div>

                                        {detailPlan.planDetails.image && (
                                            <div className="calendar-plan-detail-image">
                                                <img
                                                    src={`http://localhost:3000${detailPlan.planDetails.image}`}
                                                    alt={detailPlan.planDetails.name}
                                                    onError={(e) => {
                                                        e.target.onerror = null
                                                        e.target.src = "https://via.placeholder.com/300x200?text=Imagen+no+disponible"
                                                    }}
                                                />
                                            </div>
                                        )}

                                        <p className="calendar-plan-detail-description">{detailPlan.planDetails.description}</p>

                                        <div className="calendar-plan-detail-info">
                                            <div className="calendar-info-item">
                                                <FiCalendar className="calendar-info-icon" />
                                                <div>
                                                    <strong>Periodo:</strong>
                                                    <div>
                                                        {format(detailPlan.startDate, "dd/MM/yyyy")} - {format(detailPlan.endDate, "dd/MM/yyyy")}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="calendar-info-item">
                                                <FiClock className="calendar-info-icon" />
                                                <div>
                                                    <strong>Duración:</strong>
                                                    <div>
                                                        {Math.ceil((detailPlan.endDate - detailPlan.startDate) / (1000 * 60 * 60 * 24))} días
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="calendar-info-item">
                                                <FiUsers className="calendar-info-icon" />
                                                <div>
                                                    <strong>Capacidad:</strong>
                                                    <div>{detailPlan.planDetails.capacity} personas</div>
                                                </div>
                                            </div>

                                            <div className="calendar-info-item">
                                                <div className="switch-container">
                                                    <label className="switch">
                                                        <input
                                                            type="checkbox"
                                                            checked={detailPlan.statusProgramed}
                                                            onChange={async () => {
                                                                try {
                                                                    await updateProgramedPlan(detailPlan.idPlanProgramed, {
                                                                        ...detailPlan,
                                                                        statusProgramed: !detailPlan.statusProgramed
                                                                    });
                                                                    setDetailPlan({
                                                                        ...detailPlan,
                                                                        statusProgramed: !detailPlan.statusProgramed
                                                                    });
                                                                } catch (error) {
                                                                    console.error("Error updating status:", error);
                                                                }
                                                            }}
                                                        />
                                                        <span className="slider"></span>
                                                    </label>
                                                    <span className={`status-label ${detailPlan.statusProgramed ? 'active' : 'inactive'}`}>
                                                        {detailPlan.statusProgramed ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="calendar-plan-detail-actions">
                                    <button
                                        className="calendar-edit-btn"
                                        onClick={() => {
                                            setIsDetailModalOpen(false)
                                            openEditModal(detailPlan)
                                        }}
                                    >
                                        Editar
                                    </button>
                                    <button
                                        className="calendar-delete-btn"
                                        onClick={async () => {
                                            await handleDelete()
                                            setIsDetailModalOpen(false)
                                        }}
                                        disabled={isLoading}
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <div className="calendar-modal-overlay">
                    <div className="calendar-modal-container">
                        <div className="calendar-modal-header">
                            <h2>{isEditMode ? "Editar Plan Programado" : "Agregar Plan Programado"}</h2>
                            <button className="calendar-close-button" onClick={() => handleCerradorDeOrtos()}>
                                ×
                            </button>
                        </div>

                        <div
                            className=
                            "calendar-modal-body" >

                            <form onSubmit={handleSubmit}>
                                <div className="calendar-form-group">
                                    <label htmlFor="idPlan">Plan</label>
                                    <select
                                        id="idPlan"
                                        name="idPlan"
                                        value={formData.idPlan}
                                        onChange={handleInputChange}
                                        className={formErrors.idPlan ? "calendar-error" : ""}
                                    >
                                        <option value="">Seleccionar plan</option>
                                        {availablePlans.map((plan) => (
                                            <option key={plan.idPlan} value={plan.idPlan}>
                                                {plan.name} - ${plan.salePrice.toLocaleString()}
                                            </option>
                                        ))}
                                    </select>
                                    {formErrors.idPlan && <div className="calendar-error-message">{formErrors.idPlan}</div>}
                                </div>

                                {selectedPlan && (
                                    <div className="calendar-selected-plan-info">
                                        <div className="calendar-plan-info-item">
                                            <FiUsers className="calendar-plan-info-icon" />
                                            <span>Capacidad: {selectedPlan.capacity} personas</span>
                                        </div>
                                        <div className="calendar-plan-info-item">
                                            <FiDollarSign className="calendar-plan-info-icon" />
                                            <span>Precio: ${selectedPlan.salePrice.toLocaleString()}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="calendar-form-row">
                                    <div className="calendar-form-group">
                                        <label htmlFor="startDate">Fecha de inicio</label>
                                        <input
                                            type="date"
                                            id="startDate"
                                            name="startDate"
                                            value={formData.startDate}
                                            onChange={handleInputChange}
                                            min={format(new Date(), "yyyy-MM-dd")}
                                            className={formErrors.startDate ? "calendar-error" : ""}
                                        />
                                        {formErrors.startDate && <div className="calendar-error-message">{formErrors.startDate}</div>}
                                    </div>

                                    <div className="calendar-form-group">
                                        <label htmlFor="endDate">Fecha de fin</label>
                                        <input
                                            type="date"
                                            id="endDate"
                                            name="endDate"
                                            value={formData.endDate}
                                            onChange={handleInputChange}
                                            min={formData.startDate}
                                            className={formErrors.endDate ? "calendar-error" : ""}
                                        />
                                        {formErrors.endDate && <div className="calendar-error-message">{formErrors.endDate}</div>}
                                    </div>
                                </div>

                                <div className="calendar-modal-footer">
                                    {isEditMode && (
                                        <button type="button" className="calendar-delete-btn" onClick={async () => { await handleDelete() }} disabled={isLoading}>
                                            Eliminar
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        className="calendar-cancel-btn"
                                        onClick={() => handleCerradorDeOrtos()}
                                        disabled={isLoading}
                                    >
                                        Cancelar
                                    </button>
                                    <button type="submit" className="calendar-submit-btn" disabled={isLoading}>
                                        {isLoading ? "Guardando..." : isEditMode ? "Actualizar" : "Guardar"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para mostrar todos los planes de un día */}
            {showDayPlansModal && (
                <div className="calendar-modal-overlay">
                    <div className="calendar-modal-container">
                        <div className="calendar-modal-header">
                            <h2>Planes del día {dayPlansDate && format(dayPlansDate, "dd/MM/yyyy")}</h2>
                            <button className="calendar-close-button" onClick={() => setShowDayPlansModal(false)}>
                                ×
                            </button>
                        </div>
                        <div className="calendar-modal-body">
                            {dayPlans.map((plan, idx) => {
                                const planName = getPlanNameById(plan.idPlan)
                                return (
                                    <div
                                        key={plan.idPlanProgramed}
                                        className="day-plan"
                                        style={{
                                            backgroundColor: `hsl(${(plan.idPlan * 75) % 360}, 70%, 65%)`,
                                            color: "#fff",
                                            marginBottom: "8px",
                                            cursor: "pointer"
                                        }}
                                        onClick={() => {
                                            setShowDayPlansModal(false);
                                            openDetailModal(plan);
                                        }}
                                    >
                                        {planName}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default PlanProgramed;
